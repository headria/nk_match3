namespace PMC_Leaderboard {
  export interface UserScore {
    userId: string;
    username?: string;
    score: number;
  }

  const config = {
    id: "PMC-Leaderboard",
    authoritative: false,
    sort: nkruntime.SortOrder.DESCENDING,
    operator: nkruntime.Operator.SET,
    reset_schedule: "0 0 * * 1", // Every Monday at 00:00
  };

  function calculateScore(balance: number, lastLevel: number): number {
    const score = lastLevel * 1000 + balance * 250;
    return score;
  }

  export function initalizeLeaderboard(
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama
  ) {
    try {
      nk.leaderboardCreate(
        config.id,
        config.authoritative,
        config.sort,
        config.operator,
        config.reset_schedule
      );
    } catch (error: any) {
      logger.error(`failed to create leaderboard: ${error.message}`);
    }
  }

  export const SetRecordRPC: nkruntime.RpcFunction = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    payload: string
  ) => {
    if (ctx.userId) throw Error("Unauthorized");
    const data: PMC_Leaderboard.UserScore = JSON.parse(payload);
    logger.debug(payload);
    nk.leaderboardRecordWrite(
      config.id,
      data.userId,
      data.username,
      data.score
    );
  };
}
