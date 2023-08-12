enum Category {
  GLOBAL,
  WEEKLY,
  PMC,
  RUSH,
  CUP,
  FRIENDS,
}

const MAX_SCORE = 1000000;

namespace BucketedLeaderboard {
  const MAX_BUCKET_SIZE = {
    weekly: 10,
  };

  const RESET_SCHEDULE = {
    weekly: "0 0 * * 1",
  };

  type BucketedLeaderboardConfig = {
    tournamentID: string;
    authoritative: boolean;
    sortOrder: nkruntime.SortOrder;
    operator: nkruntime.Operator;
    duration: number;
    resetSchedule: string;
    metadata: object;
    title: string;
    description: string;
    category: number;
    startTime: number;
    endTime: number;
    maxSize: number;
    maxNumScore: number;
    joinRequired: boolean;
  };

  export const initializeLeaderboards = (
    nk: nkruntime.Nakama,
    initializer: nkruntime.Initializer
  ) => {
    for (const conf of configs) {
      init(nk, initializer, conf, conf.maxSize);
    }
  };

  const init = function (
    nk: nkruntime.Nakama,
    initializer: nkruntime.Initializer,
    config: BucketedLeaderboardConfig,
    bucketSize: number
  ) {
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
      `leaderboard/getRecords/${config.tournamentID}`,
      RpcGetBucketRecordsFn([config.tournamentID], bucketSize)
    );
  };

  // Define the bucketed leaderboard storage object
  interface UserBucketStorageObject {
    resetTimeUnix: number;
    userIds: string[];
  }

  const RpcGetBucketRecordsFn = function (
    ids: string[],
    bucketSize: number
  ): nkruntime.RpcFunction {
    return function (
      ctx: nkruntime.Context,
      logger: nkruntime.Logger,
      nk: nkruntime.Nakama,
      payload: string
    ): string {
      if (payload) {
        throw new Error("no payload input allowed");
      }

      const collection = "Buckets";
      const key = "Bucket";

      const objects = nk.storageRead([
        {
          collection,
          key,
          userId: ctx.userId,
        },
      ]);

      // Fetch any existing bucket or create one if none exist
      let userBucket: UserBucketStorageObject = {
        resetTimeUnix: 0,
        userIds: [],
      };

      if (objects.length > 0) {
        userBucket = objects[0].value as UserBucketStorageObject;
      }

      // Fetch the tournament leaderboard
      const leaderboards = nk.tournamentsGetId(ids);

      // Leaderboard has reset or no current bucket exists for user
      if (
        userBucket.resetTimeUnix != leaderboards[0].endActive ||
        userBucket.userIds.length < 1
      ) {
        logger.debug(`RpcGetBucketRecordsFn new bucket for ${ctx.userId}`);
        const users = nk.usersGetRandom(bucketSize);
        users.forEach(function (user: nkruntime.User) {
          userBucket.userIds.push(user.userId);
        });

        // Set the Reset and Bucket end times to be in sync
        userBucket.resetTimeUnix = leaderboards[0].endActive;

        // Store generated bucket for the user
        nk.storageWrite([
          {
            collection,
            key,
            userId: ctx.userId,
            value: userBucket,
            permissionRead: 0,
            permissionWrite: 0,
          },
        ]);
      }

      // Add self to the list of leaderboard records to fetch
      userBucket.userIds.push(ctx.userId);

      // Get the leaderboard records
      const records = nk.tournamentRecordsList(
        ids[0],
        userBucket.userIds,
        bucketSize
      );

      const result = JSON.stringify(records);
      logger.debug(`RpcGetBucketRecordsFn resp: ${result}`);

      return JSON.stringify(records);
    };
  };

  const configs: BucketedLeaderboardConfig[] = [
    {
      tournamentID: "Weekly",
      authoritative: false,
      category: Category.WEEKLY,
      duration: 7 * 24 * 60 * 60,
      description: "",
      endTime: 0,
      joinRequired: false,
      maxNumScore: MAX_SCORE,
      maxSize: MAX_BUCKET_SIZE.weekly,
      metadata: {},
      operator: nkruntime.Operator.INCREMENTAL,
      resetSchedule: RESET_SCHEDULE.weekly,
      sortOrder: nkruntime.SortOrder.DESCENDING,
      startTime: 0,
      title: "Weekly Leaderboard",
    },
  ];
}
