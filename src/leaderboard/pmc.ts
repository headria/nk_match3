namespace Leaderboards {
  export interface UserScore {
    userId: string;
    username?: string;
    score: number;
  }

  export const updateScore: nkruntime.RpcFunction = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    payload: string
  ) => {
    if (ctx.userId) throw Error("Unauthorized");
    const data: Leaderboards.UserScore = JSON.parse(payload);
    logger.debug(payload);
    nk.leaderboardRecordWrite(
      Leaderboards.configs.PMC.leaderboardID,
      data.userId,
      data.username,
      data.score
    );
  };
}
