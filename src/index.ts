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

  initializer.registerRpc("addWalletAddr", addWalletAddr);
};

const addWalletAddr: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string => {
  const { walletAddr } = JSON.parse(payload);
  if (!ctx.userId) {
    // Reject non server-to-server call
    throw Error("Cannot invoke this function from user session");
  }

  nk.linkCustom(ctx.userId, walletAddr);

  return JSON.stringify("HELLOOO");
};
