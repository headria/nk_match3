"use strict";
var __setFunctionName =
  (this && this.__setFunctionName) ||
  function (f, name, prefix) {
    if (typeof name === "symbol")
      name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", {
      configurable: true,
      value: prefix ? "".concat(prefix, " ", name) : name,
    });
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
var PMC_Leaderboard;
(function (PMC_Leaderboard) {
  var config = {
    id: "PMC-Leaderboard",
    authoritative: false,
    sort: "descending" /* nkruntime.SortOrder.DESCENDING */,
    operator: "set" /* nkruntime.Operator.SET */,
    reset_schedule: "0 0 * * 1", // Every Monday at 00:00
  };
  function calculateScore(balance, lastLevel) {
    var score = lastLevel * 1000 + balance * 250;
    return score;
  }
  function initalizeLeaderboard(ctx, logger, nk) {
    try {
      nk.leaderboardCreate(
        config.id,
        config.authoritative,
        config.sort,
        config.operator,
        config.reset_schedule
      );
    } catch (error) {
      logger.error("failed to create leaderboard: ".concat(error.message));
    }
  }
  PMC_Leaderboard.initalizeLeaderboard = initalizeLeaderboard;
  PMC_Leaderboard.SetRecordRPC = function (ctx, logger, nk, payload) {
    if (ctx.userId) throw Error("Unauthorized");
    var data = JSON.parse(payload);
    logger.debug(payload);
    nk.leaderboardRecordWrite(
      config.id,
      data.userId,
      data.username,
      data.score
    );
  };
})(PMC_Leaderboard || (PMC_Leaderboard = {}));
var InitModule = function (ctx, logger, nk, initializer) {
  //register storage index
  cryptoWalletIndex(initializer);
  //initiate user wallet
  initializer.registerAfterAuthenticateDevice(InitiateUser);
  //Register Leaderboards
  PMC_Leaderboard.initalizeLeaderboard(ctx, logger, nk);
  //Register Leaderboards rpcs
  initializer.registerRpc(
    "leaderboard/pmc/setRecord",
    PMC_Leaderboard.SetRecordRPC
  );
  initializer.registerRpc("user/WalletConnect", WalletConnect);
  //validators
  initializer.registerRpc("level/validate", levelValidatorRPC);
};
var cryptoWalletIndex = function (initializer) {
  var name = "crypto-wallet";
  var collection = "Crypto";
  var key = "Wallet";
  var fields = ["address"];
  var maxEntries = 1000000000;
  initializer.registerStorageIndex(name, collection, key, fields, maxEntries);
};
var InitialWallet = {
  Heart: {
    endDate: 0,
    isUnlimited: false,
    quantity: 5,
  },
  TNT: {
    endDate: 0,
    isUnlimited: false,
    quantity: 3,
  },
  Discoball: {
    endDate: 0,
    isUnlimited: false,
    quantity: 3,
  },
  Rocket: {
    endDate: 0,
    isUnlimited: false,
    quantity: 3,
  },
  Hammer: 0,
  Shuffle: 0,
  HorizontalRocket: 0,
  VerticalRocket: 0,
  Coins: 0,
  Gems: 0,
  Score: 0,
};
var initialCrypto = {
  address: null,
  balance: null,
};
var InitiateUser = function (ctx, logger, nk, data) {
  try {
    if (!data.created) return;
    nk.storageWrite([
      {
        collection: "Economy",
        key: "Wallet",
        value: InitialWallet,
        userId: ctx.userId,
        version: "*",
        permissionRead: 1,
        permissionWrite: 1,
      },
      {
        collection: "Crypto",
        key: "Wallet",
        value: initialCrypto,
        userId: ctx.userId,
        version: "*",
        permissionRead: 1,
        permissionWrite: 0,
      },
    ]);
    GameApi.LastLevel.set(nk, ctx.userId, 0);
    logger.info("New User Joined: ".concat(ctx.userId));
  } catch (error) {
    throw new Error("Failed to initiate user. cause: ".concat(error.message));
  }
};
var WalletConnect = function (ctx, logger, nk, payload) {
  try {
    var data = JSON.parse(payload);
    if (!data || !data["address"]) throw new Error("Bad Request");
    var address = data["address"];
    var query = "+address:".concat(address);
    var res = nk.storageIndexList("crypto-wallet", query, 1);
    if (res.length == 0) {
      nk.storageWrite([
        {
          collection: "Crypto",
          key: "Wallet",
          userId: ctx.userId,
          value: { address: address, balance: null },
          version: "*",
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
      return;
    }
    var WalletUID = res[0].userId;
    var account = nk.accountGetId(WalletUID);
    var deviceId = account.devices[0].id;
    return JSON.stringify(deviceId);
  } catch (error) {
    throw new Error("Error While Connecting Wallet: ".concat(error.message));
  }
};
var _a, _b, _c, _d;
var GameApi = {
  LastLevel:
    ((_a = /** @class */ (function () {
      function class_1() {}
      class_1.get = function (nk, userId) {
        try {
          var storageObjects = nk.storageRead([
            {
              collection: this.Keys.collection,
              key: this.Keys.key,
              userId: userId,
            },
          ]);
          var lastLevel = storageObjects[0].value[this.id];
          return lastLevel;
        } catch (error) {
          throw new Error("failed to get Last level: " + error.message);
        }
      };
      class_1.set = function (nk, userId, newValue) {
        var _a;
        try {
          var value = ((_a = {}), (_a[this.id] = newValue), _a);
          nk.storageWrite([
            {
              collection: this.Keys.collection,
              key: this.Keys.key,
              version: "*",
              userId: userId,
              value: value,
            },
          ]);
        } catch (error) {
          throw new Error("failed to set Last level: " + error.message);
        }
      };
      return class_1;
    })()),
    __setFunctionName(_a, "LastLevel"),
    (_a.Keys = {
      collection: "Levels",
      key: "Data",
    }),
    (_a.id = "progress"),
    _a),
  LevelLog:
    ((_b = /** @class */ (function () {
      function class_2() {}
      class_2.save = function (nk, userId, data) {
        nk.storageWrite([
          {
            collection: this.Keys.collection,
            key: data.levelNumber.toString(),
            userId: userId,
            version: "*",
            value: data,
            permissionRead: 2,
            permissionWrite: 0,
          },
        ]);
      };
      class_2.get = function (nk, userId, levelNumber) {
        var data = nk.storageRead([
          {
            collection: this.Keys.collection,
            key: levelNumber,
            userId: userId,
          },
        ]);
        return data;
      };
      return class_2;
    })()),
    __setFunctionName(_b, "LevelLog"),
    (_b.Keys = {
      collection: "Levels",
    }),
    _b),
  Cheat:
    ((_c = /** @class */ (function () {
      function class_3() {}
      class_3.write = function (nk, userId, levelLog, cheats) {
        nk.storageWrite([
          {
            collection: this.Keys.collection,
            key: levelLog.levelNumber.toString(),
            userId: userId,
            value: { cheats: cheats, levelLog: levelLog },
            version: "*",
            permissionRead: 2,
            permissionWrite: 0,
          },
        ]);
      };
      return class_3;
    })()),
    __setFunctionName(_c, "Cheat"),
    (_c.Keys = {
      collection: "Cheats",
    }),
    _c),
  Crypto:
    ((_d = /** @class */ (function () {
      function class_4() {}
      return class_4;
    })()),
    __setFunctionName(_d, "Crypto"),
    (_d.Keys = {
      collection: "Crypto",
      key: "Wallet",
    }),
    _d),
};
var LevelValidation;
(function (LevelValidation) {
  LevelValidation.PowerUps = [
    { name: "Hammer", index: 0 },
    { name: "VerticalRocket", index: 1 },
    { name: "Shuffle", index: 2 },
    { name: "HorizontalRocket", index: 3 },
  ];
  LevelValidation.Boosters = [
    { name: "TNT", index: 0 },
    { name: "Discoball", index: 1 },
    { name: "Rocket", index: 2 },
  ];
  var Validator = /** @class */ (function () {
    function Validator() {}
    Validator.prototype.cheatCheck = function (levelLog) {
      try {
        var atStart = levelLog.atStart,
          atEnd = levelLog.atEnd;
        var detectedCheats = __spreadArray(
          __spreadArray(
            __spreadArray(
              __spreadArray(
                __spreadArray(
                  __spreadArray(
                    __spreadArray([], this.checkHearts(atStart.heart), true),
                    this.checkBoosters(
                      atStart.boostersCount,
                      atEnd.boostersCount,
                      atStart.selectedBoosters
                    ),
                    true
                  ),
                  this.checkMoves(
                    atEnd.totalMoves,
                    atEnd.levelMaxMoves,
                    atEnd.purchasedMovesCount
                  ),
                  true
                ),
                this.checkTime(atStart.time, atEnd.time),
                true
              ),
              this.checkCoins(
                atStart.coins,
                atEnd.coins,
                atEnd.purchasedMovesCoins,
                atEnd.purchasedPowerUps
              ),
              true
            ),
            this.checkPowerUps(
              atStart.powerUpsCount,
              atEnd.powerUpsCount,
              atEnd.purchasedPowerUps,
              atEnd.usedItems
            ),
            true
          ),
          this.checkAbilityUsage(
            atEnd.targetAbilityblocksPoped,
            atEnd.abilitUsedTimes
          ),
          true
        );
        return detectedCheats;
      } catch (error) {
        throw new Error("Cheat Check Error: ".concat(error.message));
      }
    };
    Validator.prototype.checkHearts = function (heartCount) {
      if (heartCount === 0) return ["Started level with no heart!"];
      else if (heartCount < -1 || heartCount > 5)
        return ["Invalid Heart Count: Hearts = ".concat(heartCount)];
      else return [];
    };
    Validator.prototype.checkBoosters = function (
      startCounts,
      endCounts,
      selectedBoosters
    ) {
      var detectedCheats = [];
      for (
        var _i = 0, Boosters_1 = LevelValidation.Boosters;
        _i < Boosters_1.length;
        _i++
      ) {
        var booster = Boosters_1[_i];
        var name_1 = booster.name,
          index = booster.index;
        var startCount = startCounts[index];
        var endCount = endCounts[index];
        if (selectedBoosters.indexOf(name_1) !== -1) {
          if (startCount === 0) {
            detectedCheats.push(
              "Used a Booster Without Having it: ".concat(name_1)
            );
          } else if (startCount !== -1 && startCount <= endCount) {
            detectedCheats.push(
              "Used a booster without reducing quantity: ".concat(name_1)
            );
          }
        } else if (startCount < -1 || endCount > startCount || endCount < -1) {
          detectedCheats.push(
            "Invalid Booster Count! "
              .concat(name_1, " = { before: ")
              .concat(startCount, " after: ")
              .concat(endCount, " }")
          );
        }
      }
      return detectedCheats;
    };
    Validator.prototype.checkMoves = function (
      totalMoves,
      levelMaxMoves,
      purchasedMovesCount
    ) {
      if (levelMaxMoves === -1) return []; // time based level
      return totalMoves > levelMaxMoves + purchasedMovesCount
        ? [
            "Invalid Extra Moves: totalMoves("
              .concat(totalMoves, ") > levelMaxMoves(")
              .concat(levelMaxMoves, ") + purchasedMovesCount(")
              .concat(purchasedMovesCount, ")"),
          ]
        : [];
    };
    Validator.checkLevel = function (levelNumber, lastLevel) {
      if (levelNumber > lastLevel + 1) {
        return [
          "level skip detected: lastLevel:"
            .concat(lastLevel, "  current:")
            .concat(levelNumber),
        ];
      }
      return [];
    };
    Validator.prototype.checkTime = function (startTime, endTime) {
      return endTime - startTime < 1000 ? ["Time less than one second"] : [];
    };
    Validator.prototype.checkCoins = function (
      startCoins,
      endCoins,
      purchasedMovesCoins,
      purchasedPowerUps
    ) {
      var purchasedPowerUpsPrice =
        Math.floor(
          purchasedPowerUps.reduce(function (acc, curr) {
            return acc + curr;
          }, 0) / 3
        ) * 600;
      return endCoins !==
        startCoins - purchasedMovesCoins - purchasedPowerUpsPrice
        ? ["Invalid Coin Count!"]
        : [];
    };
    Validator.prototype.checkPowerUps = function (
      startPowerUpsCount,
      endPowerUpsCount,
      purchasedPowerUps,
      usedItems
    ) {
      var detectedCheats = [];
      for (
        var _i = 0, PowerUps_1 = LevelValidation.PowerUps;
        _i < PowerUps_1.length;
        _i++
      ) {
        var powerUp = PowerUps_1[_i];
        var name_2 = powerUp.name,
          index = powerUp.index;
        var before = startPowerUpsCount[index];
        var after = endPowerUpsCount[index];
        var purchased = purchasedPowerUps[index];
        var used = usedItems[index];
        if (after !== before + purchased - used) {
          detectedCheats.push("Cheat In PowerUps: ".concat(name_2));
        }
      }
      return detectedCheats;
    };
    Validator.prototype.checkAbilityUsage = function (
      targetAbilityblocksPoped,
      abilitUsedTimes
    ) {
      return abilitUsedTimes > targetAbilityblocksPoped / 10
        ? [
            "Used ability more than allowed count: allowed: "
              .concat(Math.floor(targetAbilityblocksPoped / 10), " used: ")
              .concat(abilitUsedTimes),
          ]
        : [];
    };
    return Validator;
  })();
  LevelValidation.Validator = Validator;
  function extractData(log) {
    try {
      var boosters = LevelValidation.Boosters.reduce(function (acc, curr) {
        var quantity = log.atEnd.boostersCount[curr.index];
        if (quantity > -1) {
          acc.push({
            id: curr.name,
            quantity: quantity,
          });
        }
        return acc;
      }, []);
      var powerUps = LevelValidation.PowerUps.map(function (curr) {
        return {
          id: curr.name,
          quantity: log.atEnd.powerUpsCount[curr.index],
        };
      });
      var coins = {
        id: "Coins",
        quantity: log.atEnd.coins - log.atStart.coins,
      };
      var result = __spreadArray(
        __spreadArray(__spreadArray([], boosters, true), powerUps, true),
        [coins],
        false
      );
      if (log.atStart.heart != -1) {
        var hearts =
          log.atEnd.result !== "win"
            ? log.atStart.heart - 1
            : log.atStart.heart;
        result.push({
          id: "Heart",
          quantity: hearts,
        });
      }
      return result;
    } catch (error) {
      throw new Error(
        "Error while extracting data from log: ".concat(error.message)
      );
    }
  }
  LevelValidation.extractData = extractData;
})(LevelValidation || (LevelValidation = {}));
var levelValidatorRPC = function (ctx, logger, nk, payload) {
  try {
    var levelLog = JSON.parse(payload);
    GameApi.LevelLog.save(nk, ctx.userId, levelLog);
    var validator = new LevelValidation.Validator();
    var cheats = validator.cheatCheck(levelLog);
    var lastLevel = GameApi.LastLevel.get(nk, ctx.userId);
    if (levelLog.atEnd.result === "win")
      GameApi.LastLevel.set(nk, ctx.userId, lastLevel + 1);
    cheats.push.apply(
      cheats,
      LevelValidation.Validator.checkLevel(levelLog.levelNumber, lastLevel)
    );
    if (cheats.length > 0) {
      GameApi.Cheat.write(nk, ctx.userId, levelLog, cheats);
    }
    //update inventory
    var extractData = LevelValidation.extractData(levelLog);
    var wallet_1 = nk.storageRead([
      { collection: "Economy", key: "Wallet", userId: ctx.userId },
    ])[0].value;
    // logger.debug(`Inventory: ${JSON.stringify(wallet)}`);
    // logger.debug(`extracted: ${JSON.stringify(extractData)}`);
    extractData.map(function (item) {
      if (typeof wallet_1[item.id] === "number")
        wallet_1[item.id] = item.quantity;
      else wallet_1[item.id].quantity = item.quantity;
    });
    // logger.debug(`New Inventory: ${JSON.stringify(wallet)}`);
    nk.storageWrite([
      {
        collection: "Economy",
        key: "Wallet",
        userId: ctx.userId,
        value: wallet_1,
        version: "*",
        permissionRead: 1,
        permissionWrite: 0,
      },
    ]);
    // logger.debug("Inventory Updated");
  } catch (error) {
    logger.error("failed to validate level: ".concat(error.message));
    throw error;
  }
};
