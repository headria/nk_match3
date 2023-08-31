namespace VirtualShop {
  type ShopItem = Omit<Rewards.Reward, "claimed" | "addTime" | "claimTime"> & {
    price: number;
  };

  export const items: ShopItem[] = [
    {
      id: "Extra Move",
      items: [],
      price: 900,
    },
    {
      id: "Hammer Pack",
      items: [
        {
          id: "Hammer",
          quantity: 3,
        },
      ],
      price: 1200,
    },
    {
      id: "Horizontal Rocket Pack",
      items: [
        {
          id: "HorizontalRocket",
          quantity: 3,
        },
      ],
      price: 1000,
    },
    {
      id: "Vertical Rocket Pack",
      items: [
        {
          id: "VerticalRocket",
          quantity: 3,
        },
      ],
      price: 1200,
    },
    {
      id: "Shuffle Pack",
      items: [
        {
          id: "Shuffle",
          quantity: 3,
        },
      ],
      price: 600,
    },
    {
      id: "Refill Lives",
      items: [
        {
          id: "Heart",
          quantity: 5,
        },
      ],
      price: 900,
    },
  ];

  export function init(
    initializer: nkruntime.Initializer,
    nk: nkruntime.Nakama
  ) {
    nk.storageWrite([
      {
        collection: "VirtualShop",
        key: "Items",
        userId: SystemUserId,
        value: { items },
        permissionRead: 2,
        permissionWrite: 0,
      },
    ]);
    initializer.registerRpc("virtualShop/purchase", VirtualPurchaseRPC);
  }
}

const VirtualPurchaseRPC: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string | void => {
  const userId = ctx.userId;
  if (!userId) return Res.CalledByServer();
  let id: string;
  try {
    id = JSON.parse(payload).id;
  } catch (error: any) {
    return Res.BadRequest(error);
  }
  const items = VirtualShop.items.filter((item) => item.id === id);
  if (items.length < 0) return Res.notFound("item");
  const item = items[0];
  const { wallet } = Wallet.get(nk, userId);
  if (item.price > wallet.Coins.quantity)
    return Res.response(
      false,
      Res.Code.notEnoughCoins,
      null,
      "not enough coins"
    );
  try {
    const { wallet } = Wallet.update(nk, userId, [
      { id: "Coins", quantity: -item.price },
    ]);
    if (item.items.length > 0) Rewards.addNcliam(nk, userId, item);
    return Res.Success(wallet, "successful purchase");
  } catch (error) {
    return Res.Error(logger, "failed to purchase item", error);
  }
};
