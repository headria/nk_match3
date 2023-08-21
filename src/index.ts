const InitModule: nkruntime.InitModule = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  initializer: nkruntime.Initializer
) {
  //register storage index
  cryptoWalletIndex(initializer);

  //initialize shop
  initShop(nk);

  //initiate user wallet
  initializer.registerAfterAuthenticateDevice(InitiateUser);

  //create Leaderboards
  Leaderboards.initalizeLeaderboards(nk, logger);
  Bucket.initializeLeaderboards(nk, initializer);

  //Register Leaderboards rpcs
  initializer.registerRpc("leaderboard/setRecord/pmc", updateScore);

  initializer.registerRpc("user/WalletConnect", WalletConnect);
  //validators
  initializer.registerRpc("level/validate", levelValidatorRPC);
};
