const SystemUserId = "00000000-0000-0000-0000-000000000000";

enum Category {
  GLOBAL,
  WEEKLY,
  PMC,
  RUSH,
  CUP,
  FRIENDS,
  ENDLESS,
}

type BucketedLeaderboards = "Weekly" | "Rush" | "Cup" | "Endless";

const MAX_SCORE = 1000000;

const leaderboardRewards: {
  [key in BucketedLeaderboards]: Rewards.LeaderboardReaward;
} = {
  Weekly: {
    config: {
      gold: 1,
      silver: 2,
      bronze: 3,
      normal: 10,
    },
    gold: [
      { id: "DiscoBall", quantity: 3 },
      { id: "Heart", quantity: 3 },
    ],
    silver: [
      { id: "DiscoBall", quantity: 2 },
      { id: "Heart", quantity: 2 },
    ],
    bronze: [
      { id: "DiscoBall", quantity: 1 },
      { id: "Heart", quantity: 1 },
    ],
    normal: [{ id: "DiscoBall", quantity: 1 }],
  },
  Rush: {
    joinRewards: {
      id: "Rush Join",
      items: [
        { id: "Heart", time: 900 },
        { id: "DiscoBall", time: 900 },
        { id: "Rocket", time: 900 },
        { id: "TNT", time: 900 },
      ],
      type: "Leaderboard",
    },
    config: {
      gold: 1,
    },
    gold: [
      { id: "DiscoBall", quantity: 3 },
      { id: "Hammer", quantity: 3 },
      { id: "Shuffle", quantity: 3 },
      { id: "Rocket", quantity: 3 },
      { id: "TNT", quantity: 3 },
      { id: "VerticalRocket", quantity: 3 },
      { id: "HorizontalRocket", quantity: 2 },
      { id: "Coins", quantity: 1000 },
      { id: "Heart", time: 10800 },
    ],
  },
  Cup: {
    joinRewards: {
      id: "Cup Join",
      items: [{ id: "Heart", time: 900 }],
      type: "Leaderboard",
    },
    config: {
      gold: 1,
      silver: 2,
      bronze: 3,
      normal: 10,
    },
    gold: [
      { id: "DiscoBall", quantity: 3 },
      { id: "Hammer", quantity: 3 },
      { id: "Shuffle", quantity: 3 },
      { id: "Rocket", quantity: 3 },
      { id: "TNT", quantity: 3 },
      { id: "VerticalRocket", quantity: 3 },
      { id: "HorizontalRocket", quantity: 2 },
      { id: "Coins", quantity: 1000 },
      { id: "Heart", time: 10800 },
    ],
    silver: [
      { id: "DiscoBall", quantity: 3 },
      { id: "Hammer", quantity: 3 },
      { id: "Shuffle", quantity: 3 },
      { id: "Rocket", quantity: 3 },
      { id: "TNT", quantity: 3 },
      { id: "Coins", quantity: 700 },
      { id: "Heart", time: 7200 },
    ],
    bronze: [
      { id: "DiscoBall", quantity: 2 },
      { id: "Rocket", quantity: 2 },
      { id: "TNT", quantity: 2 },
      { id: "Coins", quantity: 500 },
      { id: "Heart", time: 3600 },
    ],
    normal: [
      { id: "DiscoBall", quantity: 1 },
      { id: "TNT", quantity: 1 },
      { id: "Rocket", quantity: 1 },
      { id: "Coins", quantity: 200 },
    ],
  },
  //TODO: Mush change
  Endless: {
    config: { gold: 1 },
    gold: [{ id: "Coins", quantity: 100 }],
  },
};

namespace Bucket {
  export type Config = {
    tournamentID: BucketedLeaderboards;
    authoritative: boolean;
    sortOrder: nkruntime.SortOrder;
    operator: nkruntime.Operator;
    bucketSize: number;
    duration: number;
    resetSchedule: string | null;
    metadata: object;
    title: string;
    description: string;
    category: number;
    startTime: number;
    endTime: number | null;
    maxSize: number;
    maxNumScore: number;
    joinRequired: boolean;
  };

  export type Bucket = {
    userIds: string[];
    resetTimeUnix: number;
  };
  export const storage = {
    collection: "Buckets",
    keys: {
      latest: "Latest",
      userBucketIds: "IDs",
    },
  };
  export const initializeLeaderboards = (
    nk: nkruntime.Nakama,
    initializer: nkruntime.Initializer
  ) => {
    for (const id of Object.keys(configs)) {
      init(nk, configs[id as BucketedLeaderboards]);
    }
    initializer.registerTournamentReset(tournamentReset);
    initializer.registerBeforeJoinTournament(beforeJointournament);
    initializer.registerRpc(`leaderboard/getRecords`, GetRecordsRPC);
  };

  const init = function (nk: nkruntime.Nakama, config: Config) {
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
  };

  // Define the bucketed leaderboard storage object
  export interface UserBucketStorageObject {
    resetTimeUnix: number;
    userIds: string[];
  }

  export const configs: { [id in BucketedLeaderboards]: Config } = {
    Weekly: {
      tournamentID: "Weekly",
      authoritative: true,
      category: Category.WEEKLY,
      // duration: 7 * 24 * 60 * 60,
      duration: 15 * 60,
      description: "",
      bucketSize: 10,
      endTime: null,
      joinRequired: true,
      maxNumScore: MAX_SCORE,
      maxSize: 1000000,
      metadata: leaderboardRewards.Weekly,
      operator: nkruntime.Operator.INCREMENTAL,
      // resetSchedule: "0 0 * * 1",
      resetSchedule: "*/15 * * * *",
      sortOrder: nkruntime.SortOrder.DESCENDING,
      startTime: 0,
      title: "Weekly Leaderboard",
    },
    Cup: {
      tournamentID: "Cup",
      authoritative: true,
      category: Category.CUP,
      // duration: 3 * 24 * 60 * 60,
      duration: 15 * 60,
      description: "",
      bucketSize: 50,
      endTime: null,
      joinRequired: true,
      maxNumScore: MAX_SCORE,
      maxSize: 100000000,
      metadata: leaderboardRewards.Cup,
      operator: nkruntime.Operator.INCREMENTAL,
      resetSchedule: "*/15 * * * *",
      // resetSchedule: "0 0 */3 * *",
      sortOrder: nkruntime.SortOrder.DESCENDING,
      startTime: 0,
      title: "Pepe Cup",
    },
    Rush: {
      tournamentID: "Rush",
      authoritative: true,
      category: Category.RUSH,
      // duration: 12 * 60 * 60,
      duration: 15 * 60,
      description: "",
      bucketSize: 10,
      endTime: null,
      joinRequired: true,
      maxNumScore: MAX_SCORE,
      maxSize: 100000000,
      metadata: leaderboardRewards.Rush,
      operator: nkruntime.Operator.INCREMENTAL,
      resetSchedule: "*/15 * * * *",
      sortOrder: nkruntime.SortOrder.DESCENDING,
      startTime: 0,
      title: "Pepe Rush",
    },
    Endless: {
      tournamentID: "Endless",
      authoritative: true,
      category: Category.ENDLESS,
      // duration: 3 * 24 * 60 * 60,
      duration: 10 * 60,
      description: "",
      bucketSize: 50,
      endTime: null,
      joinRequired: true,
      maxNumScore: MAX_SCORE,
      maxSize: 100000000,
      metadata: {},
      operator: nkruntime.Operator.INCREMENTAL,
      // resetSchedule: "0 0 */3 * *",
      resetSchedule: "*/10 * * * *",
      sortOrder: nkruntime.SortOrder.DESCENDING,
      startTime: 0,
      title: "Endless Event",
    },
  };
  export function getLatestBucketId(
    nk: nkruntime.Nakama,
    leaderBoadrdId: string
  ) {
    try {
      const collection = leaderBoadrdId;
      const key = Bucket.storage.keys.latest;
      const valueKey = "id";
      const latestBucket = nk.storageRead([
        { collection, key, userId: SystemUserId },
      ]);
      let latestVersion, latestId;
      if (latestBucket.length < 1) {
        latestId = 0;
        latestVersion = setLatestBucketId(nk, leaderBoadrdId, latestId);
      } else {
        latestVersion = latestBucket[0].version;
        latestId = parseInt(latestBucket[0].value[valueKey]);
      }
      return { latestId, latestVersion };
    } catch (error: any) {
      throw new Error(`failed to getLatestBucketId: ${error.message}`);
    }
  }

  export function setLatestBucketId(
    nk: nkruntime.Nakama,
    leaderBoadrdId: string,
    newId: number,
    version?: string
  ) {
    try {
      const collection = leaderBoadrdId;
      const key = Bucket.storage.keys.latest;
      const value = { id: newId };
      const writeObj: nkruntime.StorageWriteRequest = {
        collection,
        key,
        userId: SystemUserId,
        value,
        permissionRead: 2,
        permissionWrite: 0,
      };
      if (version) writeObj.version = version;
      const res = nk.storageWrite([writeObj]);
      return res[0].version;
    } catch (error: any) {
      throw new Error(`failed to setLatestBucketId: ${error.message}`);
    }
  }

  export function getBucketById(
    nk: nkruntime.Nakama,
    leaderboard: string,
    id: number
  ): { bucket: Bucket.Bucket; version: string } {
    const collection = Bucket.storage.collection;
    const key = `${leaderboard}#${id}`;
    try {
      const res = nk.storageRead([{ collection, key, userId: SystemUserId }]);
      if (res.length < 1) throw new Error(`Bucket ${key} doesn't exists`);
      const version = res[0].version;
      const bucket: any = res[0].value;
      return { bucket, version };
    } catch (error: any) {
      throw new Error(
        `failed to getBucketById: key:${key} collection:${collection} error: ${error.message}`
      );
    }
  }

  export function createNewBucket(
    nk: nkruntime.Nakama,
    logger: nkruntime.Logger,
    leaderBoadrdId: string,
    id: number,
    latestBucketVersion: string
  ) {
    let key = `${leaderBoadrdId}#${id}`;
    try {
      let latestVersion = setLatestBucketId(
        nk,
        leaderBoadrdId,
        id,
        latestBucketVersion
      );
      const tournamentInfo = nk.tournamentsGetId([leaderBoadrdId])[0];
      const resetTimeUnix =
        tournamentInfo.endActive ?? tournamentInfo.endTime ?? 0;
      let bucket: Bucket = {
        userIds: [],
        resetTimeUnix,
      };
      const res = nk.storageWrite([
        {
          collection: Bucket.storage.collection,
          key,
          userId: SystemUserId,
          value: bucket,
          version: "*",
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);

      const version = res[0].version;
      return { bucket, version, latestVersion };
    } catch (error: any) {
      throw new Error(
        `failed to createNewBucket with id ${key}: ${error.message}`
      );
    }
  }

  export function addUserToBucket(
    nk: nkruntime.Nakama,
    leaderBoadrdId: string,
    bucketId: number,
    version: string,
    bucket: Bucket
  ) {
    try {
      const collection = storage.collection;
      const key = `${leaderBoadrdId}#${bucketId}`;
      nk.storageWrite([
        {
          collection,
          key,
          version,
          userId: SystemUserId,
          value: bucket,
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
    } catch (error: any) {
      throw new Error(`failed to addUserToBucket: ${error.message}`);
    }
  }

  export function setUserBucket(
    nk: nkruntime.Nakama,
    userId: string,
    leaderBoadrdId: string,
    id: number
  ) {
    try {
      nk.storageWrite([
        {
          collection: Bucket.storage.collection,
          key: leaderBoadrdId,
          userId,
          value: { id },
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
    } catch (error: any) {
      throw new Error(`failed to setUserBucket: ${error.message}`);
    }
  }

  export function getUserBucketId(
    nk: nkruntime.Nakama,
    leaderBoadrdId: string,
    userId: string
  ) {
    const collection = Bucket.storage.collection;

    const userBucket = nk.storageRead([
      { collection, key: leaderBoadrdId, userId },
    ]);

    if (userBucket.length < 1) return null;
    const { id } = userBucket[0].value;
    return id;
  }

  export function getUserBucket(
    nk: nkruntime.Nakama,
    config: Config,
    userId: string
  ) {
    try {
      const leaderBoadrdId = config.tournamentID;
      const userBucketId = getUserBucketId(nk, leaderBoadrdId, userId);
      if (!userBucketId) return null;
      const { bucket } = Bucket.getBucketById(nk, leaderBoadrdId, userBucketId);
      return bucket;
    } catch (error: any) {
      throw new Error(`failed to getUserBucket: ${error.message}`);
    }
  }

  export function joinLeaderboard(
    nk: nkruntime.Nakama,
    logger: nkruntime.Logger,
    ctx: nkruntime.Context,
    config: Config
  ) {
    const userId = ctx.userId;
    const leaderBoadrdId = config.tournamentID as BucketedLeaderboards;
    const userBucket = getUserBucket(nk, config, userId);

    if (userBucket) {
      throw new Error(`User Has already joined ${leaderBoadrdId} leaderboard`);
    }
    let attempts = 0;
    //get last bucket
    while (true) {
      try {
        const latestRes = Bucket.getLatestBucketId(nk, leaderBoadrdId);
        let { latestId, latestVersion } = latestRes;

        if (latestId === 0) {
          const data = Bucket.createNewBucket(
            nk,
            logger,
            leaderBoadrdId,
            ++latestId,
            latestVersion
          );
          latestVersion = data.latestVersion;
        }
        let { bucket, version } = Bucket.getBucketById(
          nk,
          leaderBoadrdId,
          latestId
        );

        // if full create new bucket
        if (bucket.userIds.length >= config.bucketSize) {
          const data = Bucket.createNewBucket(
            nk,
            logger,
            leaderBoadrdId,
            ++latestId,
            latestVersion
          );
          version = data.version;
          latestVersion = data.latestVersion;
          bucket = data.bucket;
        }

        //if not full add user to it
        bucket.userIds.push(userId);
        Bucket.addUserToBucket(nk, leaderBoadrdId, latestId, version, bucket);
        Bucket.setUserBucket(nk, userId, leaderBoadrdId, latestId);
        const rewards = leaderboardRewards[leaderBoadrdId].joinRewards;
        if (rewards) Rewards.addNcliam(nk, userId, rewards);
        return;
      } catch (error: any) {
        if (attempts > 100) throw error;
        attempts++;
      }
    }
  }

  export function getBucketRecords(
    nk: nkruntime.Nakama,
    bucket: Bucket,
    config: Config,
    time?: number
  ) {
    try {
      const tournament = nk.tournamentRecordsList(
        config.tournamentID,
        bucket.userIds,
        config.bucketSize,
        undefined,
        time
      );
      return tournament.ownerRecords;
    } catch (error: any) {
      throw new Error(`failed to getRecords: ${error.message}`);
    }
  }

  export function getBucketRecordsRpc(
    ctx: nkruntime.Context,
    nk: nkruntime.Nakama,
    config: Config
  ) {
    const userId = ctx.userId;
    if (!userId) return Res.CalledByServer();
    //get user bucket
    let bucket = Bucket.getUserBucket(nk, config, userId);
    //if not exists
    if (!bucket)
      return Res.response(
        false,
        Res.Code.dosentExist,
        null,
        "user does not exist in this leaderboard"
      );

    const records = getBucketRecords(nk, bucket, config);
    return Res.Success(records);
  }

  export function deleteUserBuckets(
    nk: nkruntime.Nakama,
    logger: nkruntime.Logger,
    tournament: nkruntime.Tournament
  ) {
    try {
      const config = configs[tournament.id as BucketedLeaderboards];
      const bucketCollection = Bucket.storage.collection;
      const batchSize = 100;
      const leaderBoadrdId = tournament.id as BucketedLeaderboards;
      let cursur: string | undefined;
      let userObjToDelete: nkruntime.StorageDeleteRequest[] = [];
      let notifications: nkruntime.Notification[] = [];
      do {
        const userBuckets = nk.storageList(
          undefined,
          bucketCollection,
          batchSize,
          cursur
        );
        if (!userBuckets.objects || userBuckets?.objects.length < 1) return;
        const leaderboardBuckets = userBuckets.objects.filter(
          (o) => o.key === leaderBoadrdId
        );
        leaderboardBuckets.map((b) => {
          const userId = b.userId;
          if (userId === SystemUserId) return;

          const obj: nkruntime.StorageDeleteRequest = {
            collection: bucketCollection,
            key: leaderBoadrdId,
            userId: userId,
          };
          if (b.value && b.value.id) {
            const bucketId = b.value.id;

            const { bucket } = Bucket.getBucketById(
              nk,
              leaderBoadrdId,
              bucketId
            );
            const records = Bucket.getBucketRecords(
              nk,
              bucket,
              config,
              tournament.endActive
            );
            let reward: Rewards.Reward | undefined = undefined;
            const userRecord = records?.filter((r) => r.ownerId === userId);
            if (userRecord && userRecord.length > 0) {
              const rank = userRecord[0].rank;
              const rewardsConfig = leaderboardRewards[leaderBoadrdId].config;
              const tier = Rewards.getTierByRank(rank, rewardsConfig);
              if (tier) {
                const rewardItems = leaderboardRewards[leaderBoadrdId][tier];
                if (rewardItems) {
                  reward = {
                    id: tournament.id,
                    type: "Leaderboard",
                    items: rewardItems,
                  };
                  Rewards.add(nk, userId, reward);
                }
              }
            }
            const content = {
              id: tournament.id,
              records: records,
              reward: reward,
            };

            let notif = Notifications.create(
              Notifications.CODES.BucketReset,
              userId,
              content
            );
            notifications.push(notif);

            userObjToDelete.push(obj);
          }
        });
        nk.notificationsSend(notifications);
        nk.storageDelete(userObjToDelete);

        cursur = userBuckets.cursor;
      } while (cursur);
    } catch (error: any) {
      logger.error(`failed to delete userBuckets: ${error.message}`);
    }
  }

  export function deleteBuckets(
    nk: nkruntime.Nakama,
    logger: nkruntime.Logger,
    leaderBoardId: string
  ) {
    try {
      const storageIds = nk.storageList(
        SystemUserId,
        Bucket.storage.collection,
        1000
      );

      const bucketsToDelete = storageIds.objects?.filter(
        (bucket) => bucket.key.indexOf(leaderBoardId) !== -1
      );

      if (bucketsToDelete && bucketsToDelete.length > 0) {
        const deleteRequests = bucketsToDelete.map((bucket) => ({
          collection: bucket.collection,
          key: bucket.key,
          userId: SystemUserId,
        }));

        nk.storageDelete(deleteRequests);
      }
    } catch (error: any) {
      logger.error(`failed to delete buckets: ${error.message}`);
    }
  }
}
const GetRecordsRPC: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string => {
  try {
    if (!ctx.userId) return Res.CalledByServer();
    let id: string;
    const input = JSON.parse(payload);
    id = input.id;
    if (!id) return Res.BadRequest();
    const config = Bucket.configs[id as BucketedLeaderboards];
    return Bucket.getBucketRecordsRpc(ctx, nk, config);
  } catch (error: any) {
    return Res.Error(logger, "failed to get records", error);
  }
};

// Before Join Leaderboards Hooks
const beforeJointournament: nkruntime.BeforeHookFunction<
  nkruntime.JoinTournamentRequest
> = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  data: nkruntime.JoinTournamentRequest
) => {
  const tournamentId = data.tournamentId as BucketedLeaderboards;
  if (!tournamentId) throw new Error("Invalid tournament id");
  const config = Bucket.configs[tournamentId];

  Bucket.joinLeaderboard(nk, logger, ctx, config);
  return data;
};

const tournamentReset: nkruntime.TournamentResetFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  tournament: nkruntime.Tournament,
  end: number,
  reset: number
) => {
  Bucket.deleteUserBuckets(nk, logger, tournament);

  Bucket.deleteBuckets(nk, logger, tournament.id);

  Bucket.setLatestBucketId(nk, tournament.id, 0);
};
