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
  initializer.registerRpc("pmc/setRecord", setRecord);

  //validators
  initializer.registerRpc("levelValidator", levelValidatorRPC);
};
