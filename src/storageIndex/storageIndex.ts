namespace StorageIndex {
  const MAX_ENTRIES = 1000000000;

  type IndexConfig = {
    name: string;
    collection: string;
    storageKey: string;
    fields: string[];
    maxEntries: number;
  };

  type ConfigNames = "cryptoWallet" | "txHash";

  export const configs: { [id in ConfigNames]: IndexConfig } = {
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
  };

  export function registerIndexes(initializer: nkruntime.Initializer) {
    for (const key in configs) {
      const config = configs[key as ConfigNames];
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
