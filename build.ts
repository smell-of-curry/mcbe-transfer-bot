import path from 'path';
import * as readline from 'readline';
import { execSync } from 'child_process';
import * as fsExtra from 'fs-extra';
import * as esbuild from 'esbuild';

/**
 * Modules that should use a specific npm dist-tag instead of beta-stable version pattern.
 */
const TAG_MODULES: Record<string, string> = {
  'vanilla-data': 'latest',
  common: 'latest',
  math: 'latest',
};

/**
 * Fetches all available versions for an npm package.
 * @param packageName - The name of the npm package to fetch versions for.
 */
async function fetchPackageVersions(
  packageName: string
): Promise<{ versions: string[]; tags: Record<string, string> }> {
  const response = await fetch(`https://registry.npmjs.org/${packageName}`);
  if (!response.ok)
    throw new Error(
      `Failed to fetch package info for ${packageName}: ${response.statusText}`
    );
  const data = await response.json();
  return {
    versions: Object.keys(data.versions),
    tags: data['dist-tags'] || {},
  };
}

/**
 * Finds the latest beta-stable version from a list of versions.
 * Pattern: X.X.X-beta.X.X.X-stable (e.g., 2.5.0-beta.1.21.130-stable)
 * @param versions - The list of versions to search through.
 * @returns The latest beta-stable version or null if no version is found.
 */
function findLatestBetaStableVersion(versions: string[]): string | null {
  const betaStablePattern = /^\d+\.\d+\.\d+-beta\.\d+\.\d+\.\d+-stable$/;

  const betaStableVersions = versions.filter(v => betaStablePattern.test(v));
  if (betaStableVersions.length === 0) return null;

  // Sort by version components to find the latest
  betaStableVersions.sort((a, b) => {
    const parseVersion = (
      v: string
    ): { major: number[]; beta: number[]; stable: boolean } => {
      const match = v.match(/^(\d+)\.(\d+)\.(\d+)-beta\.(\d+)\.(\d+)\.(\d+)/);
      if (!match) return { major: [0, 0, 0], beta: [0, 0, 0], stable: false };
      return {
        major: [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])],
        beta: [parseInt(match[4]), parseInt(match[5]), parseInt(match[6])],
        stable: true,
      };
    };

    const vA = parseVersion(a);
    const vB = parseVersion(b);

    // Compare major version first
    for (let i = 0; i < 3; i++) {
      if (vA.major[i] === vB.major[i]) continue;
      return vB.major[i] - vA.major[i];
    }

    // Then compare beta version
    for (let i = 0; i < 3; i++) {
      if (vA.beta[i] === vB.beta[i]) continue;
      return vB.beta[i] - vA.beta[i];
    }

    return 0;
  });

  return betaStableVersions[0];
}

/**
 * Resolves the correct version for a @minecraft/<module> package.
 */
async function resolveMinecraftVersion(packageName: string): Promise<string> {
  const shortName = packageName.replace('@minecraft/', '');

  console.log(`  Resolving ${packageName}...`);

  const { versions, tags } = await fetchPackageVersions(packageName);

  // Check if this module should use a specific tag
  if (shortName in TAG_MODULES) {
    const tag = TAG_MODULES[shortName];
    const taggedVersion = tags[tag];
    if (!taggedVersion)
      throw new Error(`Tag "${tag}" not found for ${packageName}`);
    console.log(`    -> ${taggedVersion} (from "${tag}" tag)`);
    return taggedVersion;
  }

  // Otherwise, find the latest beta-stable version
  const betaStableVersion = findLatestBetaStableVersion(versions);
  if (betaStableVersion) {
    console.log(`    -> ${betaStableVersion} (latest beta-stable)`);
    return betaStableVersion;
  }

  // Fallback to latest tag if no beta-stable version found
  const latestVersion = tags['latest'];
  if (latestVersion) {
    console.log(
      `    -> ${latestVersion} (fallback to latest, no beta-stable found)`
    );
    return latestVersion;
  }

  throw new Error(`Could not resolve version for ${packageName}`);
}

/**
 * Prompts the user for a yes/no confirmation.
 */
async function promptConfirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(`${question} (y/n): `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Updates all @minecraft dependencies in package.json to their correct versions.
 */
async function updateMinecraftDependencies(): Promise<void> {
  console.log('\x1b[36mChecking @minecraft dependencies...\x1b[0m');

  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = await fsExtra.readJson(packageJsonPath);

  // Collect all @minecraft packages from overrides, dependencies, and devDependencies
  const sections = ['overrides', 'dependencies', 'devDependencies'] as const;
  const minecraftPackages = new Map<
    string,
    { section: string; currentVersion: string }
  >();

  for (const section of sections) {
    const deps = packageJson[section] as Record<string, string> | undefined;
    if (!deps) continue;

    for (const [pkg, version] of Object.entries(deps)) {
      if (!pkg.startsWith('@minecraft/')) continue;
      if (minecraftPackages.has(pkg))
        console.warn(
          `${pkg} is already in the map, this could break dependency resolution `
        );
      minecraftPackages.set(pkg, {
        section: section as string,
        currentVersion: version,
      });
    }
  }

  if (minecraftPackages.size === 0) {
    console.log('  No @minecraft packages found.');
    return;
  }

  console.log(`  Found ${minecraftPackages.size} @minecraft package(s):`);

  // Resolve versions in parallel for better performance
  const updates = await Promise.all(
    Array.from(minecraftPackages.entries()).map(
      async ([pkg, { section, currentVersion }]) => {
        const newVersion = await resolveMinecraftVersion(pkg);
        return { pkg, section, currentVersion, newVersion };
      }
    )
  );

  // Filter to only packages that need updates
  const pendingUpdates = updates.filter(u => u.currentVersion !== u.newVersion);
  if (pendingUpdates.length === 0) {
    console.log(
      '\x1b[32m✓ All @minecraft dependencies are up to date\x1b[0m\n'
    );
    return;
  }

  // Show pending updates
  console.log(
    `\n\x1b[33mFound ${pendingUpdates.length} package(s) that need updating:\x1b[0m`
  );
  for (const { pkg, currentVersion, newVersion } of pendingUpdates) {
    console.log(`  ${pkg}: ${currentVersion} -> \x1b[32m${newVersion}\x1b[0m`);
  }
  console.log();

  // Ask for confirmation
  const confirmed = await promptConfirm(
    'Would you like to update these packages?'
  );
  if (!confirmed) {
    console.log('\x1b[33mSkipping package updates.\x1b[0m\n');
    return;
  }

  // Apply updates to packageJson object
  for (const { pkg, section, newVersion } of pendingUpdates)
    packageJson[section][pkg] = newVersion;

  // Write updated package.json
  await fsExtra.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  console.log('\x1b[32m✓ package.json updated\x1b[0m');

  // Run npm install to update node_modules and package-lock.json
  console.log('\x1b[36mRunning npm install...\x1b[0m');
  try {
    execSync('npm install', { cwd: __dirname, stdio: 'inherit' });
    console.log('\x1b[32m✓ Dependencies installed\x1b[0m\n');
  } catch {
    console.error('\x1b[31m✗ npm install failed\x1b[0m\n');
    process.exit(1);
  }
}

const notificationPlugin: esbuild.Plugin = {
  name: 'notification-plugin',
  setup(build) {
    let buildStart = new Date();
    build.onStart(() => {
      buildStart = new Date();
      console.log(
        `\x1b[33m%s\x1b[0m`,
        `[${new Date().toLocaleTimeString()}]`,
        `🔄 Build started...`
      );
    });
    build.onEnd(result => {
      const duration = new Date().getTime() - buildStart.getTime();

      if (result.errors.length > 0) {
        console.error(
          `\x1b[31m%s\x1b[0m`,
          `[${new Date().toLocaleTimeString()}]`,
          `❌ Build failed with ${result.errors.length} error(s) in ${duration}ms`
        );
      } else {
        console.log(
          `\x1b[32m%s\x1b[0m`,
          `[${new Date().toLocaleTimeString()}]`,
          `✅ Build completed successfully in ${duration}ms for development`
        );
      }
    });
  },
};
/**
 * Main build function.
 */
async function build(): Promise<void> {
  const isWatch = process.argv.includes('watch');
  const isPreCommit = process.argv.includes('pre-commit');

  // First, update @minecraft dependencies
  if (!isPreCommit) await updateMinecraftDependencies();

  // Then proceed with the build
  const srcDir = path.join(__dirname, 'src');
  const scriptsDir = path.join(__dirname, 'scripts');
  await fsExtra.ensureDir(scriptsDir);
  await fsExtra.emptyDir(scriptsDir);

  const entryPoint = path.join(srcDir, 'index.ts');
  const outputFile = path.join(scriptsDir, 'index.js');

  const buildOptions: esbuild.BuildOptions = {
    entryPoints: [entryPoint],
    bundle: true,
    outfile: outputFile,
    minify: true,
    format: 'esm',
    sourcemap: true, // Source map generation must be turned on
    plugins: [notificationPlugin],
    external: [
      '@minecraft/server',
      '@minecraft/server-ui',
      '@minecraft/server-common',
      '@minecraft/server-admin',
    ],
    mainFields: ['main'], // Needed for @minecraft/math and @minecraft/vanilla-data
  };

  try {
    if (isWatch) {
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
      console.log('\x1b[36m%s\x1b[0m', 'Watching for changes...');
    } else {
      await esbuild.build(buildOptions);
      console.log(
        `\x1b[33m%s\x1b[0m`,
        `[${new Date().toLocaleTimeString()}]`,
        `Build completed!`
      );
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

build();
