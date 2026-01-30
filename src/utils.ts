import type { Player } from '@minecraft/server';

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
