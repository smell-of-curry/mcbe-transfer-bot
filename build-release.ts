import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import AdmZip from 'adm-zip';

const projectRoot = __dirname;

/**
 * Reads the manifest.json file and extracts version information
 * @returns The version number as an array of numbers
 */
function getManifestVersion(): number[] {
  const manifestPath = path.join(projectRoot, 'manifest.json');
  const manifest = fs.readJsonSync(manifestPath);
  return manifest.header.version;
}

/**
 * Gets the pack name
 * @returns The pack name
 */
function getPackName(): string {
  return 'mcbe-transfer-bot';
}

/**
 * Builds the TypeScript source code
 */
function buildSource(): void {
  console.log('Building TypeScript source...');
  try {
    execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

/**
 * Creates the .mcpack file containing all necessary pack files
 * @returns The path to the .mcpack file
 */
function createMcpack(): string {
  const packVersion = getManifestVersion();
  const packName = getPackName();
  const versionString = packVersion.join('-');
  const mcpackFilename = `${packName}-${versionString}.mcpack`;
  const mcpackPath = path.join(path.dirname(projectRoot), mcpackFilename);

  console.log(`Creating ${mcpackFilename}...`);

  const zip = new AdmZip();

  // Files and directories to include in the pack
  const includeItems = ['manifest.json', 'scripts', 'texts'];
  for (const item of includeItems) {
    const itemPath = path.join(projectRoot, item);
    if (!fs.existsSync(itemPath)) {
      console.warn(`Warning: ${item} does not exist, skipping...`);
      continue;
    }

    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      zip.addLocalFolder(itemPath, item);
      console.log(`  Added directory: ${item}`);
    } else {
      zip.addLocalFile(itemPath);
      console.log(`  Added file: ${item}`);
    }
  }

  // Write the zip file as .mcpack
  zip.writeZip(mcpackPath);

  console.log(`\nCreated ${mcpackFilename} at ${mcpackPath}`);
  return mcpackPath;
}

try {
  console.log('=== mcbe-transfer-bot Release Build ===\n');

  // Build the TypeScript source
  buildSource();

  // Create the .mcpack file
  const mcpackPath = createMcpack();

  console.log('\n=== Release build completed successfully ===');
  console.log(`Output: ${mcpackPath}`);
} catch (error) {
  console.error('Release build failed:', error);
  process.exit(1);
}
