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

const MAX_SCORE = 1000000;

namespace Bucket {
  export type Config = {
    tournamentID: string;
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
      init(nk, initializer, configs[id]);
    }
    initializer.registerBeforeJoinTournament(beforeJointournament);
  };

  const init = function (
    nk: nkruntime.Nakama,
    initializer: nkruntime.Initializer,
    config: Config
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
      GetRecordsRpcs[config.tournamentID]
    );
  };

  export function InitBucket(nk: nkruntime.Nakama, logger: nkruntime.Logger) {
    const initValue = 1;
    for (const leaderboardId of Object.keys(configs)) {
      // Initialize the latest bucket ID
      try {
        getLatestBucketId(nk, leaderboardId);
      } catch (error) {
        const key = storage.keys.latest;
        const value = { id: initValue };
        nk.storageWrite([
          {
            collection: leaderboardId,
            key,
            userId: SystemUserId,
            value,
            permissionRead: 2,
            permissionWrite: 0,
          },
        ]);
      }

      // Initialize the weekly bucket
      const InitBucketKey = `${leaderboardId}#${initValue}`;
      const initBucket: Bucket = { resetTimeUnix: 0, userIds: [] };
      try {
        getBucketById(nk, leaderboardId, initValue);
      } catch (error) {
        nk.storageWrite([
          {
            collection: storage.collection,
            key: InitBucketKey,
            userId: SystemUserId,
            value: initBucket,
            permissionRead: 2,
            permissionWrite: 0,
          },
        ]);
      }
    }
  }
  // Define the bucketed leaderboard storage object
  export interface UserBucketStorageObject {
    resetTimeUnix: number;
    userIds: string[];
  }

  export const configs: { [id: string]: Config } = {
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
      metadata: {},
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
      duration: 3 * 24 * 60 * 60,
      description: "",
      bucketSize: 50,
      endTime: null,
      joinRequired: true,
      maxNumScore: MAX_SCORE,
      maxSize: 100000000,
      metadata: {},
      operator: nkruntime.Operator.INCREMENTAL,
      resetSchedule: "0 0 */3 * *",
      sortOrder: nkruntime.SortOrder.DESCENDING,
      startTime: 0,
      title: "Pepe Cup",
    },
    Rush: {
      tournamentID: "Rush",
      authoritative: true,
      category: Category.RUSH,
      duration: 12 * 60 * 60,
      description: "",
      bucketSize: 10,
      endTime: null,
      joinRequired: true,
      maxNumScore: MAX_SCORE,
      maxSize: 100000000,
      metadata: {},
      operator: nkruntime.Operator.INCREMENTAL,
      resetSchedule: "0 */12 * * *",
      sortOrder: nkruntime.SortOrder.DESCENDING,
      startTime: 0,
      title: "Pepe Rush",
    },
    Endless: {
      tournamentID: "Endless",
      authoritative: true,
      category: Category.ENDLESS,
      duration: 3 * 24 * 60 * 60,
      description: "",
      bucketSize: 50,
      endTime: null,
      joinRequired: true,
      maxNumScore: MAX_SCORE,
      maxSize: 100000000,
      metadata: {},
      operator: nkruntime.Operator.INCREMENTAL,
      resetSchedule: "0 0 */3 * *",
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
      const latestVersion = latestBucket[0].version;
      const latestId = parseInt(latestBucket[0].value[valueKey]);
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
    leaderBoadrdId: string,
    id: number,
    latestVersion: string,
    data: Bucket.Bucket
  ) {
    let key = `${leaderBoadrdId}#${id}`;
    try {
      setLatestBucketId(nk, leaderBoadrdId, id, latestVersion);

      const res = nk.storageWrite([
        {
          collection: Bucket.storage.collection,
          key,
          userId: SystemUserId,
          value: data,
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);

      const version = res[0].version;

      return version;
    } catch (error: any) {
      throw new Error(
        `failed to createNewBucket with id ${key}: data:${JSON.stringify(
          data
        )} ${error.message}`
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
  export function getUserBucket(
    nk: nkruntime.Nakama,
    config: Config,
    userId: string
  ) {
    try {
      const collection = Bucket.storage.collection;
      const leaderBoadrdId = config.tournamentID;
      const userBucket = nk.storageRead([
        { collection, key: leaderBoadrdId, userId },
      ]);

      if (userBucket.length < 1) return null;

      const { id } = userBucket[0].value;
      const { bucket } = Bucket.getBucketById(nk, leaderBoadrdId, id);
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
    const username = ctx.username;
    const leaderBoadrdId = config.tournamentID;
    const userBucket = getUserBucket(nk, config, userId);
    if (userBucket)
      throw new Error(
        `User Has already joined ${leaderBoadrdId} leaderboard ${userBucket}`
      );

    let attempts = 0;
    //get last bucket
    while (true) {
      try {
        let { latestId, latestVersion } = Bucket.getLatestBucketId(
          nk,
          leaderBoadrdId
        );

        let { bucket, version } = Bucket.getBucketById(
          nk,
          leaderBoadrdId,
          latestId
        );

        // if full create new bucket
        if (bucket.userIds.length >= config.bucketSize) {
          const tournamentInfo = nk.tournamentsGetId([leaderBoadrdId])[0];

          const resetTimeUnix =
            tournamentInfo.endActive ?? tournamentInfo.endTime ?? 0;
          bucket = {
            userIds: [],
            resetTimeUnix,
          };
          latestId = latestId + 1;
          version = Bucket.createNewBucket(
            nk,
            leaderBoadrdId,
            latestId,
            latestVersion,
            bucket
          );

          logger.debug(`created new bucket: ${leaderBoadrdId}#${latestId}`);
        }

        //if not full add user to it
        bucket.userIds.push(userId);

        Bucket.addUserToBucket(nk, leaderBoadrdId, latestId, version, bucket);
        Bucket.setUserBucket(nk, userId, leaderBoadrdId, latestId);

        //add user to leaderboard
        nk.tournamentRecordWrite(leaderBoadrdId, userId, username, 0);
        logger.info(`user has joined ${leaderBoadrdId} tournament`);
        return bucket;
      } catch (error: any) {
        if (error.message.indexOf("version check failed") !== -1) throw error;
        if (attempts > 100) throw error;
        attempts++;
      }
    }
  }

  export function getRecords(
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
      return JSON.stringify(tournament.records);
    } catch (error: any) {
      throw new Error(`failed to getRecords: ${error.message}`);
    }
  }

  export function getBucketRpc(
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    payload: string,
    config: Config
  ) {
    const userId = ctx.userId;
    let time: number | undefined = undefined;
    const input = JSON.parse(payload);
    if (input) {
      time = JSON.parse(payload).time;
    }
    //get user bucket
    let bucket = Bucket.getUserBucket(nk, config, userId);
    //if not exists
    if (!bucket) throw new Error("user does not exist in this leaderboard");

    return getRecords(nk, bucket, config, time);
  }
}

const WeeklyGetRecordsRPC: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string => {
  const config = Bucket.configs.Weekly;
  return Bucket.getBucketRpc(ctx, logger, nk, payload, config);
};

const CupGetRecordsRPC: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string => {
  const config = Bucket.configs.Cup;
  return Bucket.getBucketRpc(ctx, logger, nk, payload, config);
};

const RushGetRecordsRPC: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string => {
  const config = Bucket.configs.Rush;
  return Bucket.getBucketRpc(ctx, logger, nk, payload, config);
};

const EndlessGetRecordsRPC: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string => {
  const config = Bucket.configs.Endless;
  return Bucket.getBucketRpc(ctx, logger, nk, payload, config);
};

const GetRecordsRpcs: { [leaderboard: string]: nkruntime.RpcFunction } = {
  Weekly: WeeklyGetRecordsRPC,
  Cup: CupGetRecordsRPC,
  Rush: RushGetRecordsRPC,
  Endless: EndlessGetRecordsRPC,
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
  const tournamentId = data.tournamentId;
  if (!tournamentId) throw new Error("Invalid tournament id");
  const config = Bucket.configs[tournamentId];
  Bucket.joinLeaderboard(nk, logger, ctx, config);
  return data;
};
