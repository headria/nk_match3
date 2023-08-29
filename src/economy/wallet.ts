namespace Wallet {
  export const collection = "Economy";
  export const key = "Wallet";

  export type WalletItem = {
    quantity: number;
    endDate?: number;
    isUnlimited?: boolean;
  };

  export interface ChangeSetItem
    extends Omit<WalletItem, "endDate" | "isUnlimited"> {
    time?: number;
    id: string;
  }

  const unlimitables = ["Heart", "TNT", "DiscoBall", "Rocket"];

  type ChangeSet = ChangeSetItem[];

  type WalletKeys =
    | "Heart"
    | "TNT"
    | "DiscoBall"
    | "Rocket"
    | "Hammer"
    | "Shuffle"
    | "HorizontalRocket"
    | "VerticalRocket"
    | "Coins"
    | "Gems"
    | "Score";

  interface IWallet {
    [key: string]: Wallet.WalletItem;
  }

  // export interface IWallet {
  //   Heart: WalletItem;
  //   TNT: WalletItem;
  //   DiscoBall: WalletItem;
  //   Rocket: WalletItem;
  //   Hammer: WalletItem;
  //   Shuffle: WalletItem;
  //   HorizontalRocket: WalletItem;
  //   VerticalRocket: WalletItem;
  //   Coins: WalletItem;
  //   Gems: WalletItem;
  //   Score: WalletItem;
  // }

  export const InitialWallet: IWallet = {
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
    Hammer: { quantity: 0 },
    Shuffle: { quantity: 0 },
    HorizontalRocket: { quantity: 0 },
    VerticalRocket: { quantity: 0 },
    Coins: { quantity: 1000 },
    Gems: { quantity: 0 },
    Score: { quantity: 0 },
  };

  function updateWallet(wallet: IWallet, changeset: ChangeSet) {
    changeset.map((cs: ChangeSetItem) => {
      const key: string = cs.id;
      const item: Wallet.WalletItem = wallet[key];
      if (cs.time) {
        if (unlimitables.indexOf(key) === -1 || item.endDate === undefined)
          throw new Error("Cannot add duration to non-unlimited items.");
        const endDate = item.isUnlimited ? item.endDate : Date.now();
        wallet[key].endDate = endDate + cs.time * 1000;
        wallet[key].isUnlimited = true;
      }
      if (cs.quantity && cs.quantity !== 0) {
        if (key === "Heart" && item.quantity + cs.quantity > 5) {
          wallet[key].quantity = 5;
        } else {
          wallet[key].quantity += cs.quantity;
        }
      }
    });
    return wallet;
  }

  export function get(
    nk: nkruntime.Nakama,
    userId: string
  ): { wallet: IWallet; version: string } {
    const data = nk.storageRead([{ collection, key, userId }]);
    if (data.length < 1) throw new Error(`failed to get wallet for ${userId}`);
    const wallet = data[0].value as IWallet;
    const version = data[0].version;
    return { wallet, version };
  }

  export function init(nk: nkruntime.Nakama, userId: string) {
    set(nk, userId, InitialWallet);
  }

  function set(
    nk: nkruntime.Nakama,
    userId: string,
    wallet: IWallet,
    version?: string
  ) {
    try {
      const writeObj: nkruntime.StorageWriteRequest = {
        collection,
        key,
        userId,
        value: wallet,
        permissionRead: 1,
        permissionWrite: 0,
      };
      if (version) writeObj.version = version;
      nk.storageWrite([writeObj]);
    } catch (error: any) {
      throw new Error(
        `failed to set wallet: wallet: ${JSON.stringify(wallet)} error:${
          error.message
        }`
      );
    }
  }

  export function checkExpired(nk: nkruntime.Nakama, userId: string) {
    let { wallet, version } = get(nk, userId);
    let hasChanged = false;
    for (const key of Object.keys(wallet)) {
      const item = wallet[key] as Wallet.WalletItem;

      if (item.isUnlimited && item.endDate) {
        if (Date.now() > item.endDate) {
          item.isUnlimited = false;
          hasChanged = true;
        }
      }
    }
    if (hasChanged) set(nk, userId, wallet, version);
  }

  export function update(
    nk: nkruntime.Nakama,
    userId: string,
    changeset: ChangeSet
  ) {
    while (true) {
      try {
        let { wallet, version } = get(nk, userId);
        const newWallet = updateWallet(wallet, changeset);
        set(nk, userId, newWallet, version);
        return;
      } catch (error: any) {
        if (error.message.indexOf("version check failed") === -1)
          throw new Error(`failed to update Wallet: ${error.message}`);
      }
    }
  }
}

//disable unlimited items if they are expired
const BeforeGetStorage: nkruntime.BeforeHookFunction<
  nkruntime.ReadStorageObjectsRequest
> = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  data: nkruntime.ReadStorageObjectsRequest
): void | nkruntime.ReadStorageObjectsRequest => {
  data.objectIds?.forEach((element) => {
    if (
      element.collection === Wallet.collection &&
      element.key === Wallet.key
    ) {
      Wallet.checkExpired(nk, element.userId as string);
    }
  });
  return data;
};
