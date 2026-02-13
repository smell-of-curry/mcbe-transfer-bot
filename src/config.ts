import type { transferPlayer } from '@minecraft/server-admin';
import {
  MinecraftBlockTypes,
  MinecraftDimensionTypes,
} from '@minecraft/vanilla-data';

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

/**
 * The y level in-which ground should be set for the player.
 */
export const GROUND_LEVEL = -64;

/**
 * The type of block to use for the ground base.
 */
export const GROUND_BASE_TYPE = MinecraftBlockTypes.Stone;

/**
 * The size of the ground base.
 */
export const GROUND_BASE_SIZE = 10;

/**
 * The dimension the player must be in, and where the ground will be.
 */
export const TRANSPORT_DIMENSION = MinecraftDimensionTypes.Overworld;

/**
 * The messages to display to the player when they are warned about their action.
 */
export const PROTECTION_MESSAGES = {
  break: `§cYou cannot break blocks here!§r`,
  place: `§cYou cannot place blocks here!§r`,
  dimension: `§cYou cannot be in this dimension!§r`,
};
