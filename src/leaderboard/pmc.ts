interface UserScore {
  userId: string;
  username?: string;
  score: number;
}

const serverId = "1a52749c-15d6-43ad-8fef-01e2997ad6e0";

const PMC_Leaderboard = {
  config: {
    id: "PMC-Leaderboard",
    authoritative: true,
    sort: nkruntime.SortOrder.DESCENDING,
    operator: nkruntime.Operator.SET,
    reset_schedule: "0 0 * * 1", // Every Monday at 00:00
  },

  calculateScore: function (balance: number, lastLevel: number): number {
    const score = lastLevel * 1000 + balance * 250;
    return score;
  },

  initalizeLeaderboard: function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama
  ) {
    try {
      nk.leaderboardCreate(
        PMC_Leaderboard.config.id,
        PMC_Leaderboard.config.authoritative,
        PMC_Leaderboard.config.sort,
        PMC_Leaderboard.config.operator,
        PMC_Leaderboard.config.reset_schedule
      );
    } catch (error: any) {
      logger.error(`failed to create leaderboard: ${error.message}`);
    }
  },
};

const setRecord: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
) => {
  if (ctx.userId !== serverId) throw Error("Unauthorized");
  const data: UserScore = JSON.parse(payload);
  logger.debug(payload);
  nk.leaderboardRecordWrite(
    PMC_Leaderboard.config.id,
    data.userId,
    data.username,
    data.score
  );
};
