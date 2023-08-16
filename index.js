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
var InitModule = function (ctx, logger, nk, initializer) {
  //register storage index
  cryptoWalletIndex(initializer);
  //initialize bucket
  Bucket.InitBucket(nk);
  //initiate user wallet
  initializer.registerAfterAuthenticateDevice(InitiateUser);
  //create Leaderboards
  Leaderboards.initalizeLeaderboards(nk, logger);
  Bucket.initializeLeaderboards(nk, initializer);
  //Register Leaderboards rpcs
  initializer.registerRpc("leaderboard/setRecord/pmc", updateScore);
  initializer.registerRpc("user/WalletConnect", WalletConnect);
  //validators
  initializer.registerRpc("level/validate", levelValidatorRPC);
};
var SystemUserId = "00000000-0000-0000-0000-000000000000";
var Category;
(function (Category) {
  Category[(Category["GLOBAL"] = 0)] = "GLOBAL";
  Category[(Category["WEEKLY"] = 1)] = "WEEKLY";
  Category[(Category["PMC"] = 2)] = "PMC";
  Category[(Category["RUSH"] = 3)] = "RUSH";
  Category[(Category["CUP"] = 4)] = "CUP";
  Category[(Category["FRIENDS"] = 5)] = "FRIENDS";
})(Category || (Category = {}));
var MAX_SCORE = 1000000;
var Bucket;
(function (Bucket) {
  Bucket.storage = {
    collection: "Buckets",
    keys: {
      latest: "Latest",
      userBucketIds: "IDs",
    },
  };
  Bucket.initializeLeaderboards = function (nk, initializer) {
    for (var _i = 0, _a = Object.keys(Bucket.configs); _i < _a.length; _i++) {
      var id = _a[_i];
      init(nk, initializer, Bucket.configs[id]);
    }
  };
  var init = function (nk, initializer, config) {
    nk.tournamentCreate(
      config.tournamentID,
      config.authoritative,
      config.sortOrder,
      config.operator,
      config.duration,
      config.resetSchedule,
      config.metadata,
      config.title,
      config.description,
      config.category,
      config.startTime,
      config.endTime,
      config.maxSize,
      config.maxNumScore,
      config.joinRequired
    );
    initializer.registerRpc(
      "leaderboard/getRecords/".concat(config.tournamentID),
      WeeklyGetRecordsRPC
    );
  };
  function InitBucket(nk) {
    var _a;
    var collection = Bucket.storage.collection;
    var initValue = 1;
    // Initialize the latest bucket ID
    try {
      getLatestBucketId(nk);
    } catch (error) {
      var key = Bucket.storage.keys.latest;
      var valueKey = "id";
      var value = ((_a = {}), (_a[valueKey] = initValue), _a);
      nk.storageWrite([
        {
          collection: collection,
          key: key,
          userId: SystemUserId,
          value: value,
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
    }
    // Initialize the weekly bucket
    var InitBucketKey = ""
      .concat(Bucket.configs.weekly.tournamentID, "#")
      .concat(initValue);
    var initBucket = { resetTimeUnix: 0, userIds: [] };
    try {
      getBucketById(nk, Bucket.configs.weekly.tournamentID, initValue);
    } catch (error) {
      nk.storageWrite([
        {
          collection: collection,
          key: InitBucketKey,
          userId: SystemUserId,
          value: initBucket,
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
    }
  }
  Bucket.InitBucket = InitBucket;
  Bucket.configs = {
    weekly: {
      tournamentID: "Weekly",
      authoritative: true,
      category: Category.WEEKLY,
      duration: 7 * 24 * 60 * 60,
      description: "",
      bucketSize: 10,
      endTime: 0,
      joinRequired: false,
      maxNumScore: MAX_SCORE,
      maxSize: 1000000,
      metadata: {},
      operator: "increment" /* nkruntime.Operator.INCREMENTAL */,
      resetSchedule: "0 0 * * 1",
      sortOrder: "descending" /* nkruntime.SortOrder.DESCENDING */,
      startTime: 0,
      title: "Weekly Leaderboard",
    },
  };
})(Bucket || (Bucket = {}));
// const WeeklyGetRecordsRPC2: nkruntime.RpcFunction = (
//   ctx: nkruntime.Context,
//   logger: nkruntime.Logger,
//   nk: nkruntime.Nakama
// ): string => {
//   const collection = "Buckets";
//   const key = "Weekly";
//   const objects = nk.storageRead([
//     {
//       collection,
//       key,
//       userId: ctx.userId,
//     },
//   ]);
//   // Fetch any existing bucket or create one if none exist
//   let userBucket: Bucket.UserBucketStorageObject = {
//     resetTimeUnix: 0,
//     userIds: [],
//   };
//   if (objects.length > 0) {
//     userBucket = objects[0].value as Bucket.UserBucketStorageObject;
//   }
//   // Fetch the tournament leaderboard
//   const leaderboards = nk.tournamentsGetId([
//     Bucket.configs.weekly.tournamentID,
//   ]);
//   // Leaderboard has reset or no current bucket exists for user
//   if (
//     userBucket.resetTimeUnix != leaderboards[0].endActive ||
//     userBucket.userIds.length < 1
//   ) {
//     const pivotID = nk.uuidv4();
//     const query = nk.sqlQuery("SELECT id FROM users WHERE id > $1 LIMIT $2", [
//       pivotID,
//       Bucket.configs.weekly.bucketSize,
//     ]);
//     query;
//     for (const row of query) {
//       const key = Object.keys(row)[0];
//       const id = row[key];
//       if (key === ctx.userId || id === "00000000-0000-0000-0000-000000000000") {
//         continue;
//       }
//       userBucket.userIds.push(id);
//     }
//     //not enough users to fill bucket
//     if (userBucket.userIds.length < Bucket.configs.weekly.bucketSize) {
//     }
//     const users = nk.usersGetRandom(Bucket.configs.weekly.bucketSize);
//     users.forEach(function (user: nkruntime.User) {
//       userBucket.userIds.push(user.userId);
//     });
//     // Set the Reset and Bucket end times to be in sync
//     userBucket.resetTimeUnix = leaderboards[0].endActive;
//     // Store generated bucket for the user
//     nk.storageWrite([
//       {
//         collection,
//         key,
//         userId: ctx.userId,
//         value: userBucket,
//         permissionRead: 0,
//         permissionWrite: 0,
//       },
//     ]);
//   }
//   // Add self to the list of leaderboard records to fetch
//   userBucket.userIds.push(ctx.userId);
//   const accounts = nk.accountsGetId(userBucket.userIds);
//   const recordsList = nk.tournamentRecordsList(
//     Bucket.configs.weekly.tournamentID,
//     userBucket.userIds,
//     Bucket.configs.weekly.bucketSize
//   );
//   const userIDS = recordsList.records?.map((record) => {
//     return record.ownerId;
//   });
//   for (const acc of accounts) {
//     const userId = acc.user.userId;
//     const username = acc.user.username;
//     if (!userIDS || userIDS.indexOf(userId) === -1) {
//       nk.tournamentRecordWrite(
//         Bucket.configs.weekly.tournamentID,
//         userId,
//         username,
//         0
//       );
//     }
//   }
//   // Get the leaderboard records
//   const finalRecords = nk.tournamentRecordsList(
//     Bucket.configs.weekly.tournamentID,
//     userBucket.userIds,
//     Bucket.configs.weekly.bucketSize
//   );
//   return JSON.stringify(finalRecords.records);
// };
var WeeklyGetRecordsRPC = function (ctx, logger, nk) {
  var collection = Bucket.storage.collection;
  var key = Bucket.configs.weekly.tournamentID;
  var userId = ctx.userId;
  var leaderBoadrdId = Bucket.configs.weekly.tournamentID;
  var bucketSize = Bucket.configs.weekly.bucketSize;
  //get user bucket
  var userBucket = nk.storageRead([
    { collection: collection, key: key, userId: userId },
  ]);
  if (userBucket.length > 0) {
    var id = userBucket[0].value.id;
    var bucket = getBucketById(nk, leaderBoadrdId, id).bucket;
    var records = nk.tournamentRecordsList(key, bucket.userIds, bucketSize);
    return JSON.stringify(records.records);
  }
  //if not exists
  //get last bucket
  var attempts = 0;
  while (true) {
    try {
      var _a = getLatestBucketId(nk),
        latestId = _a.latestId,
        latestVersion = _a.latestVersion;
      var _b = getBucketById(nk, leaderBoadrdId, latestId),
        bucket = _b.bucket,
        version = _b.version;
      logger.debug("bucket ".concat(bucket, " , version=").concat(version));
      // if full create new bucket
      var tournamentInfo = nk.tournamentsGetId([key])[0];
      var resetTimeUnix = tournamentInfo.nextReset;
      if (bucket.userIds.length >= bucketSize) {
        bucket = {
          userIds: [],
          resetTimeUnix: 0,
        };
        latestId = latestId + 1;
        version = createNewBucket(
          nk,
          leaderBoadrdId,
          latestId,
          latestVersion,
          bucket
        );
        logger.debug("created new bucket with version: ".concat(version));
      }
      //if not full add user to it
      bucket.userIds.push(userId);
      logger.debug("bucket ".concat(bucket, " , version=").concat(version));
      nk.storageWrite([
        {
          collection: collection,
          key: "".concat(leaderBoadrdId, "#").concat(latestId),
          version: version,
          userId: SystemUserId,
          value: bucket,
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
      setUserBucket(nk, userId, leaderBoadrdId, latestId);
      //change last bucket key
      setLatestBucketId(nk, latestId.toString(), latestVersion);
      //return records
      var tournament = nk.tournamentRecordsList(
        Bucket.configs.weekly.tournamentID,
        bucket.userIds
      );
      return JSON.stringify(tournament.records);
    } catch (error) {
      if (attempts > 100) throw error;
      attempts++;
    }
  }
};
function getLatestBucketId(nk) {
  var collection = Bucket.storage.collection;
  var key = Bucket.storage.keys.latest;
  var valueKey = "id";
  var latestBucket = nk.storageRead([
    { collection: collection, key: key, userId: SystemUserId },
  ]);
  var latestVersion = latestBucket[0].version;
  var latestId = parseInt(latestBucket[0].value[valueKey]);
  return { latestId: latestId, latestVersion: latestVersion };
}
function setLatestBucketId(nk, newId, version) {
  var collection = Bucket.storage.collection;
  var key = Bucket.storage.keys.latest;
  var value = { id: newId };
  var writeObj = {
    collection: collection,
    key: key,
    userId: SystemUserId,
    value: value,
    permissionRead: 2,
    permissionWrite: 0,
  };
  if (version) writeObj.version = version;
  var res = nk.storageWrite([writeObj]);
  return res[0].version;
}
function getBucketById(nk, leaderboard, id) {
  var collection = Bucket.storage.collection;
  var key = "".concat(leaderboard, "#").concat(id);
  var res = nk.storageRead([
    { collection: collection, key: key, userId: SystemUserId },
  ]);
  var version = res[0].version;
  var bucket = res[0].value;
  return { bucket: bucket, version: version };
}
function createNewBucket(nk, leaderBoadrdId, id, latestVersion, data) {
  var key = "".concat(leaderBoadrdId, "#").concat(id);
  var readRes = nk.storageRead([
    {
      collection: Bucket.storage.collection,
      key: key,
      userId: SystemUserId,
    },
  ]);
  var version;
  if (readRes.length > 0) {
    version = readRes[0].version;
  }
  {
    var res = nk.storageWrite([
      {
        collection: Bucket.storage.collection,
        key: key,
        userId: SystemUserId,
        value: data,
        permissionRead: 2,
        permissionWrite: 0,
      },
    ]);
    setLatestBucketId(nk, id.toString(), latestVersion);
    version = res[0].version;
  }
  return version;
}
function setUserBucket(nk, userId, leaderBoadrdId, id) {
  nk.storageWrite([
    {
      collection: Bucket.storage.collection,
      key: leaderBoadrdId,
      userId: userId,
      value: { id: id },
      permissionRead: 2,
      permissionWrite: 0,
    },
  ]);
}
var Leaderboards;
(function (Leaderboards) {
  Leaderboards.configs = {
    global: {
      leaderboardID: "Global",
      authoritative: true,
      sortOrder: "descending" /* nkruntime.SortOrder.DESCENDING */,
      operator: "increment" /* nkruntime.Operator.INCREMENTAL */,
      resetSchedule: null,
    },
    PMC: {
      leaderboardID: "PMC",
      authoritative: true,
      sortOrder: "descending" /* nkruntime.SortOrder.DESCENDING */,
      operator: "set" /* nkruntime.Operator.SET */,
      resetSchedule: "0 0 * * 1", // Every Monday at 00:00
    },
  };
  var Leaderboard = /** @class */ (function () {
    function Leaderboard(config) {
      this.config = config;
    }
    Leaderboard.prototype.initialize = function (nk, logger) {
      try {
        nk.leaderboardCreate(
          this.config.leaderboardID,
          this.config.authoritative,
          this.config.sortOrder,
          this.config.operator,
          this.config.resetSchedule,
          this.config.metadata
        );
        logger.info(
          "".concat(this.config.leaderboardID, " leaderboard created")
        );
      } catch (error) {
        logger.error(
          "failed to create ".concat(this.config.leaderboardID, " leaderboard")
        );
      }
    };
    return Leaderboard;
  })();
  Leaderboards.Leaderboard = Leaderboard;
  Leaderboards.initalizeLeaderboards = function (nk, logger) {
    for (
      var _i = 0, _a = Object.keys(Leaderboards.configs);
      _i < _a.length;
      _i++
    ) {
      var key = _a[_i];
      var conf = Leaderboards.configs[key];
      new Leaderboard(conf).initialize(nk, logger);
    }
  };
  var updateGlobal = function (nk, userId, username, score, subScore) {
    nk.leaderboardRecordWrite(
      Leaderboards.configs.global.leaderboardID,
      userId,
      username,
      score,
      subScore
    );
  };
  var updateWeekly = function (nk, userId, username, score, subScore) {
    nk.tournamentRecordWrite(
      Bucket.configs.weekly.tournamentID,
      userId,
      username,
      score,
      subScore
    );
  };
  Leaderboards.UpdateLeaderboards = function (nk, userId, username, levelLog) {
    updateGlobal(nk, userId, username, 1, 0);
    updateWeekly(nk, userId, username, 1, 0);
  };
})(Leaderboards || (Leaderboards = {}));
var updateScore = function (ctx, logger, nk, payload) {
  try {
    if (ctx.userId) throw Error("Unauthorized");
    var data = JSON.parse(payload);
    logger.debug(payload);
    nk.leaderboardRecordWrite(
      Leaderboards.configs.PMC.leaderboardID,
      data.userId,
      data.username,
      data.score
    );
  } catch (error) {
    logger.error(error.message);
  }
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
  DiscoBall: {
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
        permissionRead: 1,
        permissionWrite: 1,
      },
      {
        collection: "Crypto",
        key: "Wallet",
        value: initialCrypto,
        userId: ctx.userId,
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
var Wallet;
(function (Wallet) {
  var queryMaker = function (address) {
    return "+address:".concat(address);
  };
  Wallet.get = function (nk, address) {
    try {
      var query = queryMaker(address);
      var res = nk.storageIndexList("crypto-wallet", query, 1);
      return res.length > 0 ? res[0] : null;
    } catch (error) {
      throw new Error(
        "failed to check wallet address existance: ".concat(error.message)
      );
    }
  };
})(Wallet || (Wallet = {}));
var WalletConnect = function (ctx, logger, nk, payload) {
  var data;
  try {
    data = JSON.parse(payload);
    if (!data || !data.address) throw Error();
  } catch (error) {
    throw new Error("invalid request body");
  }
  var address = data.address;
  try {
    nk.storageWrite([
      {
        collection: "Crypto",
        key: "Wallet",
        userId: ctx.userId,
        value: { address: address, balance: 0 },
        permissionRead: 2,
        permissionWrite: 0,
      },
    ]);
    return;
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
        try {
          nk.storageWrite([
            {
              collection: this.Keys.collection,
              key: (data.levelNumber || -1).toString(),
              userId: userId,
              value: data,
              permissionRead: 2,
              permissionWrite: 0,
            },
          ]);
        } catch (error) {
          throw new Error("failed to save LevelLog: ".concat(error.message));
        }
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
      class_3.write = function (nk, levelNumber, userId, cheats) {
        try {
          nk.storageWrite([
            {
              collection: this.Keys.collection,
              key: (levelNumber || -2).toString(),
              userId: userId,
              value: { cheats: cheats },
              permissionRead: 2,
              permissionWrite: 0,
            },
          ]);
        } catch (error) {
          throw new Error("failed to save Cheats: ".concat(error.message));
        }
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
    { name: "DiscoBall", index: 1 },
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
    var userId = ctx.userId;
    if (!userId) throw new Error("called by a server");
    var levelLog = void 0;
    try {
      levelLog = JSON.parse(payload);
      if (!levelLog) throw new Error();
    } catch (error) {
      throw new Error("Invalid request body");
    }
    GameApi.LevelLog.save(nk, userId, levelLog);
    var validator = new LevelValidation.Validator();
    var cheats = validator.cheatCheck(levelLog);
    var lastLevel = GameApi.LastLevel.get(nk, userId);
    if (levelLog.atEnd.result === "win") {
      GameApi.LastLevel.set(nk, userId, lastLevel + 1);
      Leaderboards.UpdateLeaderboards(nk, userId, ctx.username, levelLog);
    }
    cheats.push.apply(
      cheats,
      LevelValidation.Validator.checkLevel(levelLog.levelNumber, lastLevel)
    );
    if (cheats.length > 0) {
      GameApi.Cheat.write(nk, levelLog.levelNumber, userId, cheats);
    }
    //update inventory
    var extractData = LevelValidation.extractData(levelLog);
    var wallet_1 = nk.storageRead([
      { collection: "Economy", key: "Wallet", userId: userId },
    ])[0].value;
    extractData.map(function (item) {
      try {
        if (typeof wallet_1[item.id] === "number")
          wallet_1[item.id] = item.quantity;
        else wallet_1[item.id].quantity = item.quantity;
      } catch (err) {
        logger.error("[extractData.map] : ".concat(err));
      }
    });
    nk.storageWrite([
      {
        collection: "Economy",
        key: "Wallet",
        userId: ctx.userId,
        value: wallet_1,
        permissionRead: 2,
        permissionWrite: 0,
      },
    ]);
  } catch (error) {
    throw new Error("failed to validate level: ".concat(error.message));
  }
};
