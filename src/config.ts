import type { transferPlayer } from '@minecraft/server-admin';

/**
 * The name of the server to display to the player
 */
export const SERVER_NAME = 'the §r§cPoke§r§bBedrock§r Hub';

/**
 * The options for the {@link transferPlayer} function
 */
export const TRANSFER_OPTIONS: Parameters<typeof transferPlayer>[1] = {
  hostname: 'play.pokebedrock.com',
  port: 19132,
};

/**
 * The time in seconds that the player will be transferred to the server
 */
export const TRANSFER_TIME = 5;

/**
 * Messages to append to the kick message when a player fails to transfer to the server
 */
export const KICK_MESSAGES = [
  '§bPlease report this in the discord!',
  '§fDiscord: https://discord.pokebedrock.com§r',
];
