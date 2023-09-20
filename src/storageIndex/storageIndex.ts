namespace StorageIndex {
  const MAX_ENTRIES = 1000000000;

  type IndexConfig = {
    name: string;
    collection: string;
    fields: string[];
    maxEntries: number;
    storageKey: string;
  };

  export type Names = "cryptoWallet" | "txHash" | "purchase";

  export const configs: { [id in Names]: IndexConfig } = {
    cryptoWallet: {
      name: "crypto-wallet",
      collection: "Crypto",
      storageKey: "Wallet",
      fields: ["address"],
      maxEntries: MAX_ENTRIES,
    },
    txHash: {
      name: "txHash",
      collection: CryptoPurchase.collection,
      fields: ["transactions"],
      maxEntries: MAX_ENTRIES,
      storageKey: CryptoPurchase.key,
    },
    purchase: {
      name: "purchase",
      collection: MyketPurchase.collection,
      fields: ["token"],
      maxEntries: MAX_ENTRIES,
      storageKey: "",
    },
  };

  export function registerIndexes(initializer: nkruntime.Initializer) {
    for (const key in configs) {
      const config = configs[key as Names];
      const { collection, fields, maxEntries, name, storageKey } = config;
      initializer.registerStorageIndex(
        name,
        collection,
        storageKey,
        fields,
        maxEntries
      );
    }
  }
}
