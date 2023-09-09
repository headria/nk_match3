namespace Wallet {
  export const collection = "Economy";
  export const key = "Wallet";

  // const HeartFillInterval = 20 * 60 * 1000; // every 20 minutes
  const HeartFillInterval = 5 * 60 * 1000; // every 5 minute
  const MAX_HEARTS = 5;

  export type WalletItem = {
    quantity: number;
    endDate?: number;
    isUnlimited?: boolean;
    next?: number;
  };

  const unlimitables = ["Heart", "TNT", "DiscoBall", "Rocket"];

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

  export type ChangeSetItem = {
    id: keyof IWallet;
    quantity?: number;
    time?: number;
  };

  type ChangeSet = ChangeSetItem[];

  function updateWallet(wallet: IWallet, changeset: ChangeSet) {
    changeset.map((cs: ChangeSetItem) => {
      const key = cs.id as keyof IWallet;
      const item: Wallet.WalletItem = wallet[key];
      if (cs.time) {
        if (unlimitables.indexOf(key) === -1 || item.endDate === undefined)
          throw new Error("Cannot add duration to non-unlimited items.");
        const endDate = item.isUnlimited ? item.endDate : Date.now();
        wallet[key].endDate = endDate + cs.time * 1000;
        wallet[key].isUnlimited = true;
      }
      if (cs.quantity && cs.quantity !== 0) {
        if (key === "Heart" && item.quantity + cs.quantity > MAX_HEARTS) {
          wallet[key].quantity = MAX_HEARTS;
        } else {
          if (wallet[key].quantity + cs.quantity < 0)
            throw new Error("using more than the quantity");
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
      const res = nk.storageWrite([writeObj]);
      const newVersion = res[0].version;
      return newVersion;
    } catch (error: any) {
      throw new Error(
        `failed to set wallet: wallet: ${JSON.stringify(wallet)} error:${
          error.message
        }`
      );
    }
  }

  export function update(
    nk: nkruntime.Nakama,
    userId: string,
    changeset: ChangeSet
  ): { wallet: IWallet; version: string } {
    while (true) {
      try {
        let { wallet, version } = get(nk, userId);
        const newWallet = updateWallet(wallet, changeset);
        const newVersion = set(nk, userId, newWallet, version);
        return { wallet: newWallet, version: newVersion };
      } catch (error: any) {
        if (error.message.indexOf("version check failed") === -1)
          throw new Error(`failed to update Wallet: ${error.message}`);
      }
    }
  }

  export function checkExpired(nk: nkruntime.Nakama, userId: string) {
    try {
      let { wallet, version } = Wallet.get(nk, userId);
      let hasChanged = false;
      for (const key of Object.keys(wallet)) {
        const item = wallet[key as keyof IWallet];

        if (item.isUnlimited && item.endDate) {
          if (Date.now() > item.endDate) {
            item.isUnlimited = false;
            hasChanged = true;
          }
        }
      }
      if (hasChanged) set(nk, userId, wallet, version);
    } catch (error: any) {
      throw new Error(`failed to check expired: ${error.message}`);
    }
  }

  export function heartFillUp(
    nk: nkruntime.Nakama,
    logger: nkruntime.Logger,
    userId: string
  ) {
    try {
      while (true) {
        let { wallet, version } = get(nk, userId);
        const hearts = wallet.Heart.quantity;
        let nextHeart = wallet.Heart?.next;

        if (hearts >= MAX_HEARTS) {
          if (nextHeart && nextHeart !== 0) {
            wallet.Heart.next = 0;
            set(nk, userId, wallet, version);
          }
          return;
        }

        if (!nextHeart || nextHeart === 0) {
          wallet.Heart.next = Date.now() + HeartFillInterval;
          nextHeart = wallet.Heart.next;
          version = set(nk, userId, wallet, version);
        }

        if (Date.now() < nextHeart) return;

        let count = 0;
        while (nextHeart < Date.now()) {
          count++;
          nextHeart += HeartFillInterval;
          if (count + hearts === MAX_HEARTS) {
            nextHeart = 0;
            break;
          }
        }
        const changeSet: ChangeSet = [{ id: "Heart", quantity: count }];
        wallet.Heart.next = nextHeart;
        wallet = updateWallet(wallet, changeSet);
        set(nk, userId, wallet, version);
        return;
      }
    } catch (error: any) {
      if (error.message.indexOf("version check") === -1)
        throw new Error(`Heart fillup failed: ${error.message}`);
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
      const userId = element.userId as string;
      Wallet.heartFillUp(nk, logger, userId);
      Wallet.checkExpired(nk, userId);
    }
  });
  return data;
};
