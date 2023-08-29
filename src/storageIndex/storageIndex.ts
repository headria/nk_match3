const cryptoWalletIndex = (initializer: nkruntime.Initializer) => {
  const name = "crypto-wallet";
  const collection = "Crypto";
  const key = "Wallet";
  const fields = ["address"];
  const maxEntries = 1000000000;

  initializer.registerStorageIndex(name, collection, key, fields, maxEntries);
};

const nonFullHearts = (initializer: nkruntime.Initializer) => {
  const name = "nonFullHearts";
  const collection = "Economy";
  const key = "Wallet";
  const fields = ["Heart"];
  const maxEntries = 1000000000;
  initializer.registerStorageIndex(name, collection, key, fields, maxEntries);
};
