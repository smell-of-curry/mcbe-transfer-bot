import { type Player, system, TicksPerSecond, world } from '@minecraft/server';
import { transferPlayer } from '@minecraft/server-admin';
import { kick } from './utils';

/**
 * Transfers a player to the PokeBedrock Hub
 * @param player player who should be transferred
 */
async function transferPlayerToHub(player: Player) {
  await system.waitTicks(5 * TicksPerSecond); // Await to ensure player has fully spawned in.
  if (!player.isValid) return;

  player.sendMessage(
    `§aYou are about to be transferred to the PokeBedrock Hub!§r`
  );
  await system.waitTicks(5 * TicksPerSecond);
  if (!player.isValid) return;

  const transferTime = 10;
  for (let i = 0; i < transferTime; i++) {
    await system.waitTicks(1 * TicksPerSecond);
    if (!player.isValid) return;

    player.sendMessage(`§aTransferring in ${transferTime - i} seconds!§r`);
  }

  transferPlayer(player, {
    hostname: 'play.pokebedrock.com',
    port: 19132,
  });
}

world.afterEvents.playerSpawn.subscribe(async ({ player }) => {
  try {
    await transferPlayerToHub(player);
  } catch (error) {
    kick(player, [
      `§cFailed to transfer you to the PokeBedrock Hub!§r`,
      `§cError: ${error}§r`,
    ]);
  }
});
