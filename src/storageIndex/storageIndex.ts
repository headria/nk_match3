namespace StorageIndex {
  const MAX_ENTRIES = 1000000000;

  type IndexConfig = {
    name: string;
    collection: string;
    storageKey: string;
    fields: string[];
    maxEntries: number;
  };

  const configs: { [id: string]: IndexConfig } = {
    cryptoWallet: {
      name: "crypto-wallet",
      collection: "Crypto",
      storageKey: "Wallet",
      fields: ["address"],
      maxEntries: MAX_ENTRIES,
    },
  };

  export function registerIndexes(initializer: nkruntime.Initializer) {
    for (const key in configs) {
      const config = configs[key];
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
