const initialCrypto: { [key: string]: any } = {
  address: null,
  balance: null,
};

const InitiateUser: nkruntime.AfterHookFunction<
  nkruntime.Session,
  nkruntime.AuthenticateDeviceRequest
> = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  data: nkruntime.Session
): void => {
  try {
    if (!data.created) return;
    nk.storageWrite([
      {
        collection: "Economy",
        key: "Wallet",
        value: Wallet.InitialWallet,
        userId: ctx.userId,
        permissionRead: 1,
        permissionWrite: 1,
      },
      {
        collection: "Crypto",
        key: "Wallet",
        value: initialCrypto,
        userId: ctx.userId,
        permissionRead: 1,
        permissionWrite: 0,
      },
    ]);
    GameApi.LastLevel.set(nk, ctx.userId, 0);
    logger.info(`New User Joined: ${ctx.userId}`);
  } catch (error: any) {
    throw new Error(`Failed to initiate user. cause: ${error.message}`);
  }
};
