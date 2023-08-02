const rpcInitializeUserWallet: nkruntime.RpcFunction = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama
): string {
  if (!ctx.userId) throw Error("called by a server");
  let walletUpdateResult = initializeWallet(nk, ctx.userId);
  let updateString = JSON.stringify(walletUpdateResult);

  logger.debug("Initialized wallet successfully", ctx.userId, updateString);

  return updateString;
};

function initializeWallet(
  nk: nkruntime.Nakama,
  userId: string
): nkruntime.WalletUpdateResult {
  const changeset = {
    coins: 10,
    gems: 10,
  };
  let result = nk.walletUpdate(userId, changeset, { a: "a" }, true);
  return result;
}
