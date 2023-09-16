const InitModule: nkruntime.InitModule = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  initializer: nkruntime.Initializer
) {
  //register storage index
  StorageIndex.registerIndexes(initializer);

  //initialize battlepass
  BattlePass.init(nk);

  Rewards.init(initializer);
  //initialize shop
  initShop(nk);
  VirtualShop.init(initializer, nk);
  CryptoPurchase.init(initializer);
  MyketPurchase.init(initializer);
  //initiate user wallet
  initializer.registerAfterAuthenticateDevice(InitiateUser);
  initializer.registerBeforeReadStorageObjects(BeforeGetStorage);

  //create Leaderboards
  Leaderboards.initalizeLeaderboards(initializer, nk, logger);
  Bucket.initializeLeaderboards(nk, initializer);

  //Register Leaderboards rpcs
  initializer.registerRpc("user/WalletConnect", WalletConnect);

  //validators
  initializer.registerRpc("level/validate", levelValidatorRPC);
};
