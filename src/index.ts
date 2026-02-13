import {
  GameMode,
  InputPermissionCategory,
  system,
  TicksPerSecond,
  world,
} from '@minecraft/server';
import { ensureGround, kick, transferPlayerToServer } from './utils';
import { KICK_MESSAGES, SERVER_NAME } from './config';
import './protection';

/**
 * A flag to ensure the ground is only set once.
 */
let hasFirstPlayerSpawn = false;

world.afterEvents.playerSpawn.subscribe(async ({ player }) => {
  try {
    // Set to Creative to prevent accidental death.
    player.setGameMode(GameMode.Creative);

    // Disable movement to prevent griefing.
    player.inputPermissions.setPermissionCategory(
      InputPermissionCategory.Movement,
      false
    );

    // Ensure the ground is there.
    if (!hasFirstPlayerSpawn) {
      hasFirstPlayerSpawn = true;
      await ensureGround();
    }

    // Await to ensure player is fully rendered.
    await system.waitTicks(5 * TicksPerSecond);
    if (!player.isValid) return;

    await transferPlayerToServer(player);
  } catch (error) {
    kick(player, [
      `§cFailed to transfer you to ${SERVER_NAME}!§r`,
      `§cError: ${error}§r`,
      '',
      ...KICK_MESSAGES,
    ]);
  }
});
