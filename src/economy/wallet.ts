namespace Wallet {
  const collection = "Economy";
  const key = "Wallet";

  export const InitialWallet = {
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
    DiscoBall: {
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

  export function getWalletItems(ctx: nkruntime.Context, nk: nkruntime.Nakama) {
    const userId = ctx.userId;
    const data = nk.storageRead([{ collection, key, userId }])[0];
    const wallet = data.value;
    return wallet;
  }

  export function updateWallet(
    ctx: nkruntime.Context,
    nk: nkruntime.Nakama,
    changeset: { [key: string]: number }
  ) {
    // nk.walletUpdate();
  }
}
