import type { TransferPlayerIpPortOptions } from '@minecraft/server-admin';

/**
 * The name of the server
 */
export const SERVER_NAME = 'the §r§cPoke§r§bBedrock§r Hub';

/**
 * The options for the transfer player
 */
export const TRANSFER_OPTIONS: TransferPlayerIpPortOptions = {
  hostname: 'play.pokebedrock.com',
  port: 19132,
};

/**
 * The time in seconds that the player will be transferred to the hub
 */
export const TRANSFER_TIME = 10;

/**
 * Messages to append to the kick message
 */
export const KICK_MESSAGES = [
  '§bPlease report this in the discord!',
  '§fDiscord: https://discord.pokebedrock.com§r',
];
