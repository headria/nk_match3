const InitModule: nkruntime.InitModule = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  initializer: nkruntime.Initializer
) {
  //register storage index
  cryptoWalletIndex(initializer);

  //initiate user wallet
  initializer.registerAfterAuthenticateDevice(InitiateUser);
  //Register Leaderboards
  PMC_Leaderboard.initalizeLeaderboard(ctx, logger, nk);

  //Register Leaderboards rpcs
  initializer.registerRpc(
    "leaderboard/pmc/setRecord",
    PMC_Leaderboard.SetRecordRPC
  );

  initializer.registerRpc("user/WalletConnect", WalletConnect);
  //validators
  initializer.registerRpc("level/validate", levelValidatorRPC);
};
