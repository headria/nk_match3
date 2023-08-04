"use strict";
var PMC_Leaderboard = {
  config: {
    id: "PMC-Leaderboard",
    authoritative: true,
    sort: "descending" /* nkruntime.SortOrder.DESCENDING */,
    operator: "set" /* nkruntime.Operator.SET */,
    reset_schedule: "0 0 * * 1", // Every Monday at 00:00
  },
  calculateScore: function (balance, lastLevel) {
    var score = lastLevel * 1000 + balance * 250;
    return score;
  },
  initalizeLeaderboard: function (ctx, logger, nk) {
    try {
      nk.leaderboardCreate(
        PMC_Leaderboard.config.id,
        PMC_Leaderboard.config.authoritative,
        PMC_Leaderboard.config.sort,
        PMC_Leaderboard.config.operator,
        PMC_Leaderboard.config.reset_schedule
      );
    } catch (error) {
      logger.error("failed to create leaderboard: ".concat(error.message));
    }
  },
};
var setRecords = function (ctx, logger, nk, payload) {
  var data = JSON.parse(payload);
  Object.keys(data).map(function (userId) {
    nk.leaderboardRecordWrite(
      PMC_Leaderboard.config.id,
      userId,
      undefined,
      data[userId]
    );
  });
};
var InitModule = function (ctx, logger, nk, initializer) {
  logger.info("MODULE INJECTED");
  //Register Leaderboards
  PMC_Leaderboard.initalizeLeaderboard(ctx, logger, nk);
  initializer.registerRpc("pmc/setRecords", setRecords);
  initializer.registerRpc("addDataToStorage", addDataToStorage);
};
var addDataToStorage = function (ctx, logger, nk, payload) {
  var _a = JSON.parse(payload),
    collection = _a.collection,
    key = _a.key,
    value = _a.value,
    permissionRead = _a.permissionRead,
    permissionWrite = _a.permissionWrite;
  if (!ctx.userId) {
    // Reject non server-to-server call
    throw Error("Cannot invoke this function from user session");
  }
  var write = {
    collection: collection,
    key: key,
    userId: ctx.userId,
    version: "1",
    value: { number1: 0, score: 120 },
    permissionRead: permissionRead,
    permissionWrite: permissionWrite,
  };
  nk.storageWrite([write]);
  return JSON.stringify("HELLOOO");
};
var rpcInitializeUserWallet = function (ctx, logger, nk) {
  if (!ctx.userId) throw Error("called by a server");
  var walletUpdateResult = initializeWallet(nk, ctx.userId);
  var updateString = JSON.stringify(walletUpdateResult);
  logger.debug("Initialized wallet successfully", ctx.userId, updateString);
  return updateString;
};
function initializeWallet(nk, userId) {
  var changeset = {
    coins: 10,
    gems: 10,
  };
  var result = nk.walletUpdate(userId, changeset, { a: "a" }, true);
  return result;
}
