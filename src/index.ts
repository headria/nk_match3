const InitModule: nkruntime.InitModule = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  initializer: nkruntime.Initializer
) {
  logger.info("MODULE INJECTED");

  initializer.registerRpc("initialize_user_wallet", rpcInitializeUserWallet);

  //Register Leaderboards
  PMC_Leaderboard.initalizeLeaderboard(ctx, logger, nk);
  initializer.registerRpc("pmc/setRecords", PMC_Leaderboard.setRecords);

  initializer.registerRpc(
    "HELLO",
    (
      ctx: nkruntime.Context,
      logger: nkruntime.Logger,
      nk: nkruntime.Nakama,
      payload: string
    ): string => {
      try {
        logger.info("HELLOOOOOOO");
        return "HELLOOO";
      } catch (error: any) {
        logger.error(error.message);
        return error.message;
      }
    }
  );
};
