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

const InitiateUserRPC: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama
): void => {
  try {
    nk.storageWrite([
      {
        collection: "Economy",
        key: "Wallet",
        value: InitialWallet,
        userId: ctx.userId,
        permissionRead: 1,
        permissionWrite: 1,
      },
    ]);
    nk.accountUpdateId(ctx.userId, null, null, null, null, null, null, {
      "crypto-wallet": null,
    });
    logger.info(`New User Joined: ${ctx.userId}`);
  } catch (error: any) {
    throw new Error(`Failed to initiate user. cause: ${error.message}`);
  }
};
