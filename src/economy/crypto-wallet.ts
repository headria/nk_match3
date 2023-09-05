namespace CryptoWallet {
  const collection = "Crypto";
  const key = "Wallet";

  type Wallet = {
    address: string;
  };

  export function get(nk: nkruntime.Nakama, userId: string) {
    const res = nk.storageRead([{ collection, key, userId }]);
    if (res.length > 0) return res[0].value as Wallet;
    return null;
  }

  export function set(nk: nkruntime.Nakama, userId: string, newWallet: Wallet) {
    nk.storageWrite([
      {
        collection,
        key,
        userId,
        value: newWallet,
        permissionRead: 2,
        permissionWrite: 0,
      },
    ]);
  }
}
