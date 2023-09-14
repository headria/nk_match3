namespace Leaderboards {
  export type Config = {
    leaderboardID: string;
    authoritative: boolean;
    sortOrder?: nkruntime.SortOrder | undefined;
    operator?: nkruntime.Operator | undefined;
    resetSchedule?: string | null | undefined;
    metadata?: { [key: string]: any } | undefined;
  };

  export const configs: { [id: string]: Config } = {
    global: {
      leaderboardID: "Global",
      authoritative: true,
      sortOrder: nkruntime.SortOrder.DESCENDING,
      operator: nkruntime.Operator.INCREMENTAL,
      resetSchedule: null,
    },

    // PMC: {
    //   leaderboardID: "PMC",
    //   authoritative: true,
    //   sortOrder: nkruntime.SortOrder.DESCENDING,
    //   operator: nkruntime.Operator.SET,
    //   resetSchedule: "0 0 * * 1", // Every Monday at 00:00
    // },
  };

  export class Leaderboard {
    constructor(public config: Config) {}
    public initialize(nk: nkruntime.Nakama, logger: nkruntime.Logger) {
      try {
        nk.leaderboardCreate(
          this.config.leaderboardID,
          this.config.authoritative,
          this.config.sortOrder,
          this.config.operator,
          this.config.resetSchedule,
          this.config.metadata
        );
        logger.info(`${this.config.leaderboardID} leaderboard created`);
      } catch (error) {
        logger.error(
          `failed to create ${this.config.leaderboardID} leaderboard`
        );
      }
    }
  }

  export const initalizeLeaderboards = (
    initializer: nkruntime.Initializer,
    nk: nkruntime.Nakama,
    logger: nkruntime.Logger
  ) => {
    for (const key of Object.keys(configs)) {
      const conf = configs[key];
      new Leaderboard(conf).initialize(nk, logger);
    }
    initializer.registerRpc("leaderboards/metadata", leaderboardMetadataRPC);
    initializer.registerLeaderboardReset(leaderboardReset);
  };

  const updateGlobal = (
    nk: nkruntime.Nakama,
    userId: string,
    username: string,
    score: number,
    subScore?: number
  ) => {
    try {
      const leaderboard = Leaderboards.configs.global;
      nk.leaderboardRecordWrite(
        leaderboard.leaderboardID,
        userId,
        username,
        score,
        subScore
      );
    } catch (error: any) {
      throw new Error(`failed to update global Leaderboard: ${error.message}`);
    }
  };

  function updateEvents(
    nk: nkruntime.Nakama,
    userId: string,
    username: string,
    levelDifficulty: number,
    rushScore: number
  ) {
    Object.keys(Bucket.configs).map((tournamentId) => {
      try {
        switch (tournamentId) {
          case "Rush":
            nk.tournamentRecordWrite(tournamentId, userId, username, rushScore);
            break;
          case "Weekly":
            nk.tournamentRecordWrite(tournamentId, userId, username, 1);
            break;
          default:
            nk.tournamentRecordWrite(
              tournamentId,
              userId,
              username,
              levelDifficulty
            );
            break;
        }
      } catch (error) {}
    });
  }

  export const UpdateLeaderboards = (
    nk: nkruntime.Nakama,
    logger: nkruntime.Logger,
    userId: string,
    username: string,
    levelLog: LevelValidation.ILevelLog
  ): void => {
    const { levelNumber } = levelLog;
    //calculate leaderboard score
    const rushScore = levelLog.atEnd.discoBallTargettedTiles || 0;
    const levelDifficulty = Levels.difficulty[levelNumber] || 0;
    updateGlobal(nk, userId, username, 1);
    if (levelLog.levelNumber > 39)
      BattlePass.addKeys(nk, logger, userId, levelDifficulty);
    updateEvents(nk, userId, username, levelDifficulty, rushScore);
  };
}

const leaderboardMetadataRPC: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string | void => {
  try {
    let id: string;
    const input = JSON.parse(payload);
    id = input.id;
    if (!id) return Res.BadRequest();
    const leaderboards = nk.leaderboardsGetId([id]);
    if (leaderboards.length < 1) return Res.notFound("leaderboard");
    const data = leaderboards[0];
    return Res.Success(data);
  } catch (error) {
    return Res.Error(logger, "failed to get metadata", error);
  }
};

const leaderboardReset: nkruntime.LeaderboardResetFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  leaderboard: nkruntime.Leaderboard,
  reset: number
): void => {
  switch (leaderboard.id) {
    case BattlePass.config.leaderboardID:
      BattlePass.BattlePassReset(nk, logger, reset);
      break;
  }
};
