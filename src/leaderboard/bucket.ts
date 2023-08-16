const SystemUserId = "00000000-0000-0000-0000-000000000000";

enum Category {
  GLOBAL,
  WEEKLY,
  PMC,
  RUSH,
  CUP,
  FRIENDS,
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
      WeeklyGetRecordsRPC
    );
  };

  export function InitBucket(nk: nkruntime.Nakama) {
    const collection = storage.collection;
    const initValue = 1;

    // Initialize the latest bucket ID
    try {
      getLatestBucketId(nk);
    } catch (error) {
      const key = storage.keys.latest;
      const valueKey = "id";
      const value = { [valueKey]: initValue };
      nk.storageWrite([
        {
          collection,
          key,
          userId: SystemUserId,
          value,
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
    }

    // Initialize the weekly bucket
    const InitBucketKey = `${configs.weekly.tournamentID}#${initValue}`;
    const initBucket: Bucket = { resetTimeUnix: 0, userIds: [] };
    try {
      getBucketById(nk, configs.weekly.tournamentID, initValue);
    } catch (error) {
      nk.storageWrite([
        {
          collection,
          key: InitBucketKey,
          userId: SystemUserId,
          value: initBucket,
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
    }
  }
  // Define the bucketed leaderboard storage object
  export interface UserBucketStorageObject {
    resetTimeUnix: number;
    userIds: string[];
  }

  export const configs: { [id: string]: Config } = {
    weekly: {
      tournamentID: "Weekly",
      authoritative: true,
      category: Category.WEEKLY,
      duration: 7 * 24 * 60 * 60,
      description: "",
      bucketSize: 10,
      endTime: 0,
      joinRequired: false,
      maxNumScore: MAX_SCORE,
      maxSize: 1000000,
      metadata: {},
      operator: nkruntime.Operator.INCREMENTAL,
      resetSchedule: "0 0 * * 1",
      sortOrder: nkruntime.SortOrder.DESCENDING,
      startTime: 0,
      title: "Weekly Leaderboard",
    },
  };
}

// const WeeklyGetRecordsRPC2: nkruntime.RpcFunction = (
//   ctx: nkruntime.Context,
//   logger: nkruntime.Logger,
//   nk: nkruntime.Nakama
// ): string => {
//   const collection = "Buckets";
//   const key = "Weekly";
//   const objects = nk.storageRead([
//     {
//       collection,
//       key,
//       userId: ctx.userId,
//     },
//   ]);

//   // Fetch any existing bucket or create one if none exist
//   let userBucket: Bucket.UserBucketStorageObject = {
//     resetTimeUnix: 0,
//     userIds: [],
//   };

//   if (objects.length > 0) {
//     userBucket = objects[0].value as Bucket.UserBucketStorageObject;
//   }

//   // Fetch the tournament leaderboard
//   const leaderboards = nk.tournamentsGetId([
//     Bucket.configs.weekly.tournamentID,
//   ]);

//   // Leaderboard has reset or no current bucket exists for user
//   if (
//     userBucket.resetTimeUnix != leaderboards[0].endActive ||
//     userBucket.userIds.length < 1
//   ) {
//     const pivotID = nk.uuidv4();

//     const query = nk.sqlQuery("SELECT id FROM users WHERE id > $1 LIMIT $2", [
//       pivotID,
//       Bucket.configs.weekly.bucketSize,
//     ]);
//     query;
//     for (const row of query) {
//       const key = Object.keys(row)[0];
//       const id = row[key];
//       if (key === ctx.userId || id === "00000000-0000-0000-0000-000000000000") {
//         continue;
//       }
//       userBucket.userIds.push(id);
//     }

//     //not enough users to fill bucket
//     if (userBucket.userIds.length < Bucket.configs.weekly.bucketSize) {
//     }
//     const users = nk.usersGetRandom(Bucket.configs.weekly.bucketSize);
//     users.forEach(function (user: nkruntime.User) {
//       userBucket.userIds.push(user.userId);
//     });

//     // Set the Reset and Bucket end times to be in sync
//     userBucket.resetTimeUnix = leaderboards[0].endActive;

//     // Store generated bucket for the user
//     nk.storageWrite([
//       {
//         collection,
//         key,
//         userId: ctx.userId,
//         value: userBucket,
//         permissionRead: 0,
//         permissionWrite: 0,
//       },
//     ]);
//   }

//   // Add self to the list of leaderboard records to fetch
//   userBucket.userIds.push(ctx.userId);

//   const accounts = nk.accountsGetId(userBucket.userIds);

//   const recordsList = nk.tournamentRecordsList(
//     Bucket.configs.weekly.tournamentID,
//     userBucket.userIds,
//     Bucket.configs.weekly.bucketSize
//   );
//   const userIDS = recordsList.records?.map((record) => {
//     return record.ownerId;
//   });

//   for (const acc of accounts) {
//     const userId = acc.user.userId;
//     const username = acc.user.username;

//     if (!userIDS || userIDS.indexOf(userId) === -1) {
//       nk.tournamentRecordWrite(
//         Bucket.configs.weekly.tournamentID,
//         userId,
//         username,
//         0
//       );
//     }
//   }

//   // Get the leaderboard records
//   const finalRecords = nk.tournamentRecordsList(
//     Bucket.configs.weekly.tournamentID,
//     userBucket.userIds,
//     Bucket.configs.weekly.bucketSize
//   );

//   return JSON.stringify(finalRecords.records);
// };

const WeeklyGetRecordsRPC: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama
): string => {
  const collection = Bucket.storage.collection;
  const key = Bucket.configs.weekly.tournamentID;
  const userId = ctx.userId;
  const leaderBoadrdId = Bucket.configs.weekly.tournamentID;
  const bucketSize = Bucket.configs.weekly.bucketSize;
  //get user bucket
  const userBucket = nk.storageRead([{ collection, key, userId }]);
  if (userBucket.length > 0) {
    const { id } = userBucket[0].value;
    const { bucket } = getBucketById(nk, leaderBoadrdId, id);
    const records = nk.tournamentRecordsList(key, bucket.userIds, bucketSize);
    return JSON.stringify(records.records);
  }

  //if not exists

  //get last bucket
  let attempts = 0;
  while (true) {
    try {
      let { latestId, latestVersion } = getLatestBucketId(nk);

      let { bucket, version } = getBucketById(nk, leaderBoadrdId, latestId);

      logger.debug(`bucket ${bucket} , version=${version}`);
      // if full create new bucket
      const tournamentInfo = nk.tournamentsGetId([key])[0];
      const resetTimeUnix = tournamentInfo.nextReset;
      if (bucket.userIds.length >= bucketSize) {
        bucket = {
          userIds: [],
          resetTimeUnix: 0,
        };
        latestId = latestId + 1;
        version = createNewBucket(
          nk,
          leaderBoadrdId,
          latestId,
          latestVersion,
          bucket
        );

        logger.debug(`created new bucket with version: ${version}`);
      }

      //if not full add user to it
      bucket.userIds.push(userId);
      logger.debug(`bucket ${bucket} , version=${version}`);

      nk.storageWrite([
        {
          collection,
          key: `${leaderBoadrdId}#${latestId}`,
          version,
          userId: SystemUserId,
          value: bucket,
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
      setUserBucket(nk, userId, leaderBoadrdId, latestId);

      //change last bucket key
      setLatestBucketId(nk, latestId.toString(), latestVersion);
      //return records

      const tournament = nk.tournamentRecordsList(
        Bucket.configs.weekly.tournamentID,
        bucket.userIds
      );
      return JSON.stringify(tournament.records);
    } catch (error: any) {
      if (attempts > 100) throw error;
      attempts++;
    }
  }
};

function getLatestBucketId(nk: nkruntime.Nakama) {
  const collection = Bucket.storage.collection;
  const key = Bucket.storage.keys.latest;
  const valueKey = "id";
  const latestBucket = nk.storageRead([
    { collection, key, userId: SystemUserId },
  ]);
  const latestVersion = latestBucket[0].version;
  const latestId = parseInt(latestBucket[0].value[valueKey]);
  return { latestId, latestVersion };
}

function setLatestBucketId(
  nk: nkruntime.Nakama,
  newId: string,
  version?: string
) {
  const collection = Bucket.storage.collection;
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
}

function getBucketById(
  nk: nkruntime.Nakama,
  leaderboard: string,
  id: number
): { bucket: Bucket.Bucket; version: string } {
  const collection = Bucket.storage.collection;
  const key = `${leaderboard}#${id}`;
  const res = nk.storageRead([{ collection, key, userId: SystemUserId }]);
  const version = res[0].version;
  const bucket: any = res[0].value;
  return { bucket, version };
}

function createNewBucket(
  nk: nkruntime.Nakama,
  leaderBoadrdId: string,
  id: number,
  latestVersion: string,
  data: Bucket.Bucket
) {
  const key = `${leaderBoadrdId}#${id}`;
  const readRes = nk.storageRead([
    {
      collection: Bucket.storage.collection,
      key,
      userId: SystemUserId,
    },
  ]);
  let version;
  if (readRes.length > 0) {
    version = readRes[0].version;
  }
  {
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
    setLatestBucketId(nk, id.toString(), latestVersion);
    version = res[0].version;
  }

  return version;
}

function setUserBucket(
  nk: nkruntime.Nakama,
  userId: string,
  leaderBoadrdId: string,
  id: number
) {
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
}
