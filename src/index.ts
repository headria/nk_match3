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

  initializer.registerRpc("HELLO", hello);
};

const hello: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string => {
  logger.info("HELLOOOOOOO");
  return JSON.stringify("HELLOOO");
};
