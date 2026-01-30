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

// src/config.ts
var SERVER_NAME, TRANSFER_OPTIONS, TRANSFER_TIME, KICK_MESSAGES;
var init_config = __esm({
  "src/config.ts"() {
    "use strict";
    SERVER_NAME = "\xA7r\xA7cPoke\xA7r\xA7bBedrock\xA7r Hub";
    TRANSFER_OPTIONS = {
      hostname: "play.pokebedrock.com",
      port: 19132
    };
    TRANSFER_TIME = 10;
    KICK_MESSAGES = [
      "\xA7bPlease report this in the discord!",
      "\xA7fDiscord: https://discord.pokebedrock.com\xA7r"
    ];
  }
});

// src/index.ts
import { system, TicksPerSecond, world } from "@minecraft/server";
import { transferPlayer } from "@minecraft/server-admin";
var require_index = __commonJS({
  "src/index.ts"() {
    init_utils();
    init_config();
    async function transferPlayerToHub(player) {
      player.sendMessage(
        `\xA7aYou are about to be transferred to the ${SERVER_NAME}!\xA7r`
      );
      for (let i = 0; i < TRANSFER_TIME; i++) {
        await system.waitTicks(1 * TicksPerSecond);
        if (!player.isValid) return;
        player.sendMessage(`\xA7aTransferring in ${TRANSFER_TIME - i} seconds!\xA7r`);
      }
      transferPlayer(player, TRANSFER_OPTIONS);
    }
    world.afterEvents.playerSpawn.subscribe(async ({ player }) => {
      try {
        await system.waitTicks(5 * TicksPerSecond);
        if (!player.isValid) return;
        await transferPlayerToHub(player);
      } catch (error) {
        kick(player, [
          `\xA7cFailed to transfer you to the ${SERVER_NAME}!\xA7r`,
          `\xA7cError: ${error}\xA7r`,
          "",
          ...KICK_MESSAGES
        ]);
      }
    });
  }
});
export default require_index();
//# sourceMappingURL=index.js.map
