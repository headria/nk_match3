namespace CryptoPurchase {
  export const collection: string = "Purchase";
  export const key = "Crypto";

  type Transaction = {
    hash: string;
    packageId: string;
  };

  export function init(initializer: nkruntime.Initializer) {
    initializer.registerRpc("crypto/validate", validateTransaction);
  }

  const TIMEOUT = 10000; //ms
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const url: string = "https://api.planetmemes.com/iap-mcm/crypto/validate";
  //   const url: string = "http://localhost:8010/iap-mcm/crypto/validate/";
  export function validator(
    nk: nkruntime.Nakama,
    address: string,
    txHash: string
  ) {
    const body = JSON.stringify({
      address,
      txHash,
    });
    try {
      const res = nk.httpRequest(url, "post", headers, body, TIMEOUT);
      const resBody = JSON.parse(res.body);
      if (!resBody.success) {
        throw new Error(resBody.message);
      }
      const { packageId } = resBody.data;
      if (!packageId) throw new Error("invalid transaction method");
      return packageId;
    } catch (error: any) {
      throw new Error(`failed to validate transaction: ${error.message}`);
    }
  }

  export function addTransaction(
    nk: nkruntime.Nakama,
    userId: string,
    hash: string,
    packageId: string
  ) {
    try {
      const data = nk.storageRead([{ collection, key, userId }]);
      let transactions: string[] =
        data.length > 0 ? data[0].value.transactions : [];
      transactions.push(hash);
      nk.storageWrite([
        {
          collection,
          key,
          userId,
          value: { transactions },
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
    } catch (error: any) {
      throw new Error("failed to write purchase record: " + error.message);
    }
  }

  export function txHashExists(nk: nkruntime.Nakama, txHash: string) {
    const query = `transactions:/(${txHash})/`;
    const res = nk.storageIndexList(StorageIndex.configs.txHash.name, query, 1);
    return res.length > 0;
  }
}

const validateTransaction: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string | void => {
  try {
    const userId = ctx.userId;
    if (!userId) return Res.CalledByServer();

    const input = JSON.parse(payload);
    const { hash } = input;
    if (!hash) return Res.BadRequest();

    if (CryptoPurchase.txHashExists(nk, hash)) {
      return Res.response(
        false,
        Res.Code.alreadyExists,
        undefined,
        "transaction hash already exists"
      );
    }

    const wallet = CryptoWallet.get(nk, userId);
    if (!wallet || !wallet.address) return Res.notFound("wallet address");

    const { address } = wallet;

    const packageId = CryptoPurchase.validator(nk, address, hash);

    const rewards = SHOP_ITEMS.filter((i) => i.id === packageId);
    if (rewards.length < 1) return Res.notFound("shop item");
    const reward: Rewards.Reward = {
      id: rewards[0].id,
      items: rewards[0].items,
      type: "Shop",
    };
    const newWallet = Rewards.addNcliam(nk, userId, reward);

    //write purchase record
    CryptoPurchase.addTransaction(nk, userId, hash, packageId);

    return newWallet.code === Res.Code.success
      ? Res.Success(newWallet.data)
      : Res.Error(logger, "failed to claim reward", newWallet.error);
  } catch (error) {
    return Res.Error(logger, "failed to validate purchase", error);
  }
};
