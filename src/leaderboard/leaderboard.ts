namespace Leaderboards {
  type LeaderboardConfig = {
    leaderboardID: string;
    authoritative: boolean;
    sortOrder?: nkruntime.SortOrder | undefined;
    operator?: nkruntime.Operator | undefined;
    resetSchedule?: string | null | undefined;
    metadata?: { [key: string]: string } | undefined;
  };

  export const configs: { [leaderboardId: string]: LeaderboardConfig } = {
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
}
