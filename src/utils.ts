import { system, TicksPerSecond, world, type Player } from '@minecraft/server';
import { transferPlayer } from '@minecraft/server-admin';
import {
  GROUND_BASE_SIZE,
  GROUND_BASE_TYPE,
  GROUND_LEVEL,
  SERVER_NAME,
  TRANSFER_OPTIONS,
  TRANSFER_TIME,
  TRANSPORT_DIMENSION,
} from './config';

/**
 * Kicks a player
 * @param player player who should be kicked
 * @param message the message that should be show to player
 */
export function kick(player: Player, message: Array<string> = []) {
  try {
    player.runCommand(`kick "${player.name}" §r${message.join('\n')}`);
  } catch (error) {
    player.remove();
  }
}

/**
 * Transfers a player to the server
 * @param player player who should be transferred
 */
export async function transferPlayerToServer(player: Player) {
  player.sendMessage(`§aYou are about to be transferred to ${SERVER_NAME}!§r`);
  for (let i = 0; i <= TRANSFER_TIME; i++) {
    await system.waitTicks(1 * TicksPerSecond);
    if (!player.isValid) return;

    player.sendMessage(`§ain ${TRANSFER_TIME - i} second(s)!§r`);
  }
  transferPlayer(player, TRANSFER_OPTIONS);
}

/**
 * Ensures a {@link GROUND_BASE_SIZE}x{@link GROUND_BASE_SIZE} base exists below the player at Y level {@link GROUND_LEVEL}
 */
export async function ensureGround() {
  const dimension = world.getDimension(TRANSPORT_DIMENSION);
  for (let x = 0; x < GROUND_BASE_SIZE; x++) {
    for (let z = 0; z < GROUND_BASE_SIZE; z++) {
      const blockLocation = { x, y: GROUND_LEVEL, z };
      if (!dimension.isChunkLoaded(blockLocation)) return;
      dimension.setBlockType(blockLocation, GROUND_BASE_TYPE);
    }

    // Wait to reduce blocking lag.
    await system.waitTicks(1);
  }
}
