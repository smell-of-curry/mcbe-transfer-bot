import {
  type Player,
  PlayerPermissionLevel,
  system,
  world,
} from '@minecraft/server';
import { PROTECTION_MESSAGES, TRANSPORT_DIMENSION } from './config';

/**
 * Warns a player about their action with sound and message.
 * @param player
 * @param message
 */
function warnPlayerAction(player: Player, message: string) {
  player.sendMessage(message);
  player.playSound('block.false_permissions');
}

world.beforeEvents.playerBreakBlock.subscribe(data => {
  const { player } = data;
  if (player.playerPermissionLevel == PlayerPermissionLevel.Operator) return;

  data.cancel = true;
  system.run(() => warnPlayerAction(player, PROTECTION_MESSAGES.break));
});

world.beforeEvents.playerPlaceBlock.subscribe(data => {
  const { player } = data;
  if (player.playerPermissionLevel == PlayerPermissionLevel.Operator) return;

  data.cancel = true;
  system.run(() => warnPlayerAction(player, PROTECTION_MESSAGES.place));
});

world.beforeEvents.entityHurt.subscribe(data => {
  data.cancel = true; // Block all damage.
});

world.afterEvents.playerDimensionChange.subscribe(data => {
  const { player, toDimension, fromLocation } = data;
  if (toDimension.id == TRANSPORT_DIMENSION) return;

  // Player some how got to the wrong dimension, teleport them back.
  warnPlayerAction(player, PROTECTION_MESSAGES.dimension);
  player.teleport(fromLocation, {
    // NOTE: Use the transport dimension instead of fromDimension as it could be another invalid dimension.
    dimension: world.getDimension(TRANSPORT_DIMENSION),
  });
});
