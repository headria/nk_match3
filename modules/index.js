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
  initializer.registerRpc("HELLO", hello);
};
var hello = function (ctx, logger, nk, payload) {
  logger.info("HELLOOOOOOO");
  return JSON.stringify("HELLOOO");
};
