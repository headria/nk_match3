const InitModule: nkruntime.InitModule = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  initializer: nkruntime.Initializer
) {
  logger.info("MODULE INJECTED");

  //register storage index
  cryptoWalletIndex(initializer);

  //initiate user wallet
  initializer.registerAfterAuthenticateDevice(InitiateUser);
  //Register Leaderboards
  PMC_Leaderboard.initalizeLeaderboard(ctx, logger, nk);
  initializer.registerRpc("pmc/setRecord", setRecord);
  initializer.registerRpc("WalletConnect", WalletConnect);
  //validators
  initializer.registerRpc("levelValidator", levelValidatorRPC);
};
