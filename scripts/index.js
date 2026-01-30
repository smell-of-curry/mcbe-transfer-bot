var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/utils.ts
function kick(player, message = []) {
  try {
    player.runCommand(`kick "${player.name}" \xA7r${message.join("\n")}`);
  } catch (error) {
    player.remove();
  }
}
var init_utils = __esm({
  "src/utils.ts"() {
    "use strict";
  }
});

// src/index.ts
import { system, TicksPerSecond, world } from "@minecraft/server";
import { transferPlayer } from "@minecraft/server-admin";
var require_index = __commonJS({
  "src/index.ts"() {
    init_utils();
    async function transferPlayerToHub(player) {
      await system.waitTicks(5 * TicksPerSecond);
      if (!player.isValid) return;
      player.sendMessage(
        `\xA7aYou are about to be transferred to the PokeBedrock Hub!\xA7r`
      );
      await system.waitTicks(5 * TicksPerSecond);
      if (!player.isValid) return;
      const transferTime = 10;
      for (let i = 0; i < transferTime; i++) {
        await system.waitTicks(1 * TicksPerSecond);
        if (!player.isValid) return;
        player.sendMessage(`\xA7aTransferring in ${transferTime - i} seconds!\xA7r`);
      }
      transferPlayer(player, {
        hostname: "play.pokebedrock.com",
        port: 19132
      });
    }
    world.afterEvents.playerSpawn.subscribe(async ({ player }) => {
      try {
        await transferPlayerToHub(player);
      } catch (error) {
        kick(player, [
          `\xA7cFailed to transfer you to the PokeBedrock Hub!\xA7r`,
          `\xA7cError: ${error}\xA7r`
        ]);
      }
    });
  }
});
export default require_index();
//# sourceMappingURL=index.js.map
