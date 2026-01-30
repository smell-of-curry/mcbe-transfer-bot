import { type Player, system, TicksPerSecond, world } from '@minecraft/server';
import { transferPlayer } from '@minecraft/server-admin';
import { kick } from './utils';
import {
  KICK_MESSAGES,
  SERVER_NAME,
  TRANSFER_OPTIONS,
  TRANSFER_TIME,
} from './config';

/**
 * Transfers a player to the server
 * @param player player who should be transferred
 */
async function transferPlayerToServer(player: Player) {
  player.sendMessage(`§aYou are about to be transferred to ${SERVER_NAME}!§r`);
  for (let i = 0; i < TRANSFER_TIME; i++) {
    await system.waitTicks(1 * TicksPerSecond);
    if (!player.isValid) return;

    player.sendMessage(`§ain ${TRANSFER_TIME - i} second(s)!§r`);
  }
  transferPlayer(player, TRANSFER_OPTIONS);
}

world.afterEvents.playerSpawn.subscribe(async ({ player }) => {
  try {
    await system.waitTicks(5 * TicksPerSecond); // Await to ensure player is fully rendered.
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
