const InitModule: nkruntime.InitModule = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  initializer: nkruntime.Initializer
) {
  logger.info("MODULE INJECTED");

  //Register Leaderboards
  PMC_Leaderboard.initalizeLeaderboard(ctx, logger, nk);
  initializer.registerRpc("pmc/setRecords", setRecords);

  initializer.registerRpc("addDataToStorage", addDataToStorage);
};

const addDataToStorage: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string => {
  const { collection, key, value, permissionRead, permissionWrite } =
    JSON.parse(payload);
  if (!ctx.userId) {
    // Reject non server-to-server call
    throw Error("Cannot invoke this function from user session");
  }

  const write: nkruntime.StorageWriteRequest = {
    collection,
    key,
    userId: ctx.userId,
    value: { number1: 0, score: 120 },
    version: "1",
    permissionRead, // Only the server and owner can read
    permissionWrite, // Only the server can write
  };

  nk.storageWrite([write]);
  return JSON.stringify("HELLOOO");
};
