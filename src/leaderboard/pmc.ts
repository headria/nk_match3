namespace Leaderboards {
  export interface UserScore {
    userId: string;
    username?: string;
    score: number;
  }
}

const updateScore: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string | void => {
  try {
    if (ctx.userId) throw Error("Unauthorized");
    const data: Leaderboards.UserScore = JSON.parse(payload);
    logger.debug(payload);
    nk.leaderboardRecordWrite(
      Leaderboards.configs.PMC.leaderboardID,
      data.userId,
      data.username,
      data.score
    );
  } catch (error: any) {
    logger.error(error.message);
  }
};
