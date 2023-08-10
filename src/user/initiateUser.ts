const InitialWallet: { [key: string]: any } = {
  Heart: {
    endDate: 0,
    isUnlimited: false,
    quantity: 5,
  },
  TNT: {
    endDate: 0,
    isUnlimited: false,
    quantity: 3,
  },
  Discoball: {
    endDate: 0,
    isUnlimited: false,
    quantity: 3,
  },
  Rocket: {
    endDate: 0,
    isUnlimited: false,
    quantity: 3,
  },
  Hammer: 0,
  Shuffle: 0,
  HorizontalRocket: 0,
  VerticalRocket: 0,
  Coins: 0,
  Gems: 0,
  Score: 0,
};
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
        value: InitialWallet,
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
