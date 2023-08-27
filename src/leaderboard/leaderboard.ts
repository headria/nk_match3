namespace Leaderboards {
  type LeaderboardConfig = {
    leaderboardID: string;
    authoritative: boolean;
    sortOrder?: nkruntime.SortOrder | undefined;
    operator?: nkruntime.Operator | undefined;
    resetSchedule?: string | null | undefined;
    metadata?: { [key: string]: string } | undefined;
  };

  export const configs: { [id: string]: LeaderboardConfig } = {
    global: {
      leaderboardID: "Global",
      authoritative: true,
      sortOrder: nkruntime.SortOrder.DESCENDING,
      operator: nkruntime.Operator.INCREMENTAL,
      resetSchedule: null,
    },

    PMC: {
      leaderboardID: "PMC",
      authoritative: true,
      sortOrder: nkruntime.SortOrder.DESCENDING,
      operator: nkruntime.Operator.SET,
      resetSchedule: "0 0 * * 1", // Every Monday at 00:00
    },
  };

  export class Leaderboard {
    constructor(public config: LeaderboardConfig) {}
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
    nk: nkruntime.Nakama,
    logger: nkruntime.Logger
  ) => {
    for (const key of Object.keys(configs)) {
      const conf = configs[key];
      new Leaderboard(conf).initialize(nk, logger);
    }
  };

  const updateGlobal = (
    nk: nkruntime.Nakama,
    userId: string,
    username: string,
    score: number,
    subScore: number
  ) => {
    const leaderboard = Leaderboards.configs.global;
    nk.leaderboardRecordWrite(
      leaderboard.leaderboardID,
      userId,
      username,
      score,
      subScore
    );
  };

  export const UpdateLeaderboards = (
    nk: nkruntime.Nakama,
    userId: string,
    username: string,
    levelLog: LevelValidation.ILevelLog
  ): void => {
    const score = 1;
    const subScore = 0;
    //calculate leaderboard score
    const rushScore = levelLog.atEnd.discoBallTargettedTiles;
    updateGlobal(nk, userId, username, score, subScore);
    Object.keys(Bucket.configs).map((tournamentId) => {
      try {
        if (tournamentId === "Rush") {
          nk.tournamentRecordWrite(
            tournamentId,
            userId,
            username,
            rushScore,
            subScore
          );
        } else {
          nk.tournamentRecordWrite(
            tournamentId,
            userId,
            username,
            score,
            subScore
          );
        }
      } catch (error) {}
    });
  };
}
