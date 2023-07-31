let InitModule: nkruntime.InitModule = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  initializer: nkruntime.Initializer
) {
  const rpcInitializeUserWallet: nkruntime.RpcFunction = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama
  ): string {
    let walletUpdateResult = initializeWallet(nk, ctx.userId, {});
    let updateString = JSON.stringify(walletUpdateResult);

    logger.debug("Initialized wallet successfully", ctx.userId, updateString);

    return updateString;
  };

  function initializeWallet(
    nk: nkruntime.Nakama,
    userId: string,
    metadata: { [key: string]: any }
  ): nkruntime.WalletUpdateResult {
    const changeset = {
      coins: 10,
      gems: -5,
    };
    let result = nk.walletUpdate(userId, changeset, metadata, true);
    return result;
  }
};
