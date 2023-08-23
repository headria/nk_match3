namespace Wallet {
  export const collection = "Economy";
  export const key = "Wallet";

  type WalletItem = {
    quantity: number;
    endDate?: number;
    isUnlimited?: boolean;
  };

  export interface ChangeSetItem
    extends Omit<WalletItem, "endDate" | "isUnlimited"> {
    time?: number;
    id: keyof IWallet;
  }

  type ChangeSet = ChangeSetItem[];

  export interface IWallet {
    Heart: WalletItem;
    TNT: WalletItem;
    DiscoBall: WalletItem;
    Rocket: WalletItem;
    Hammer: WalletItem;
    Shuffle: WalletItem;
    HorizontalRocket: WalletItem;
    VerticalRocket: WalletItem;
    Coins: WalletItem;
    Gems: WalletItem;
    Score: WalletItem;
  }

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
    Coins: { quantity: 0 },
    Gems: { quantity: 0 },
    Score: { quantity: 0 },
  };

  function updateWallet(wallet: IWallet, changeset: ChangeSet) {
    changeset.map((cs: ChangeSetItem) => {
      const key = cs.id;
      if (cs.time !== undefined) {
        if (!wallet[key].endDate)
          throw new Error("Cannot add duration to non-unlimited items.");
        const newEndDate = wallet[key].endDate ?? Date.now();
        wallet[key].endDate = newEndDate + cs.time * 1000;
        wallet[key].isUnlimited = true;
      }
      if (cs.quantity !== 0) {
        wallet[key].quantity += cs.quantity;
      }
    });
    return wallet;
  }

  export function get(
    nk: nkruntime.Nakama,
    userId: string
  ): { wallet: IWallet | any; version: string } {
    const data = nk.storageRead([{ collection, key, userId }]);
    if (data.length < 1) throw new Error(`failed to get wallet for ${userId}`);
    const wallet = data[0].value as IWallet;
    const version = data[0].version;
    return { wallet, version };
  }

  export function set(
    nk: nkruntime.Nakama,
    userId: string,
    newWallet: IWallet,
    version?: string
  ) {
    const writeObj: nkruntime.StorageWriteRequest = {
      collection,
      key,
      userId,
      value: newWallet,
      permissionRead: 1,
      permissionWrite: 0,
    };
    if (version) writeObj.version = version;
    nk.storageWrite([writeObj]);
  }

  export function checkExpired(nk: nkruntime.Nakama, userId: string) {
    let { wallet, version } = get(nk, userId);
    let hasChanged = false;
    for (const key of Object.keys(wallet)) {
      if (wallet[key].isUnlimited && Date.now() > wallet[key].endDate) {
        wallet[key].isUnlimited = false;
        hasChanged = true;
      }
    }
    if (hasChanged) set(nk, userId, wallet, version);
  }

  export function update(
    nk: nkruntime.Nakama,
    userId: string,
    changeset: ChangeSet
  ) {
    let { wallet, version } = get(nk, userId);
    const newWallet = updateWallet(wallet, changeset);
    set(nk, userId, newWallet, version);
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
      Wallet.checkExpired(nk, ctx.userId);
    }
  });
  return data;
};
