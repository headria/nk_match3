namespace VirtualShop {
  type ShopItem = {
    id: string;
    items: Rewards.RewardItem[];
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
        collection: "Shop",
        key: "Virtual",
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
  try {
    const userId = ctx.userId;
    if (!userId) return Res.CalledByServer();
    let id: string;

    id = JSON.parse(payload).id;
    if (!id) return Res.BadRequest();

    const items = VirtualShop.items.filter((item) => item.id === id);
    if (items.length < 1) return Res.notFound("item");
    const item: Rewards.Reward = {
      id: items[0].id,
      items: items[0].items,
      type: "Shop",
    };
    const { wallet } = Wallet.get(nk, userId);
    if (items[0].price > wallet.Coins.quantity)
      return Res.response(false, "notEnoughCoins", null, "not enough coins");

    const newWallet = Wallet.update(nk, userId, [
      { id: "Coins", quantity: -items[0].price },
    ]);
    if (item.items.length > 0) Rewards.addNcliam(nk, userId, item);
    return Res.Success(newWallet, "successful purchase");
  } catch (error) {
    return Res.Error(logger, "failed to purchase item", error);
  }
};
