const InitModule: nkruntime.InitModule = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  initializer: nkruntime.Initializer
) {
  //register storage index
  cryptoWalletIndex(initializer);

  //Upgrade wallets to latest version
  upgradeWallets(nk);

  //initialize shop
  initShop(nk);

  //initiate user wallet
  initializer.registerAfterAuthenticateDevice(InitiateUser);

  initializer.registerBeforeReadStorageObjects(BeforeGetStorage);

  //create Leaderboards
  Leaderboards.initalizeLeaderboards(nk, logger);
  Bucket.initializeLeaderboards(nk, initializer);

  //Register Leaderboards rpcs
  initializer.registerRpc("leaderboard/setRecord/pmc", updateScore);

  initializer.registerRpc("user/WalletConnect", WalletConnect);
  //validators
  initializer.registerRpc("level/validate", levelValidatorRPC);
};

const upgradeWallets = (nk: nkruntime.Nakama) => {
  let cursur;
  do {
    const wallets = nk.storageList(null, "Economy", 100);
    wallets.objects?.forEach((item) => {
      const wallet: any = item.value as Wallet.IWallet;
      Object.keys(wallet).forEach((key) => {
        if (typeof wallet[key] === "number")
          wallet[key] = { quantity: wallet[key] };
      });
      Wallet.set(nk, item.userId, wallet, item.version);
    });
    cursur = wallets.cursor;
  } while (cursur);
};
