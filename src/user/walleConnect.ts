namespace WalletIndex {
  const queryMaker = (address: string) => `+address:${address}`;
  export const get = (
    nk: nkruntime.Nakama,
    address: string
  ): nkruntime.StorageObject | null => {
    try {
      const query = queryMaker(address);
      const res = nk.storageIndexList("crypto-wallet", query, 1);
      return res.length > 0 ? res[0] : null;
    } catch (error: any) {
      throw new Error(
        `failed to check wallet address existance: ${error.message}`
      );
    }
  };
}

const WalletConnect: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string | void => {
  const userId = ctx.userId;
  if (!userId) return Res.CalledByServer();
  let data: { [address: string]: string };
  try {
    data = JSON.parse(payload);
    if (!data || !data.address) throw Error();
  } catch (error) {
    return Res.BadRequest(error);
  }
  let address = data.address;
  try {
    nk.storageWrite([
      {
        collection: "Crypto",
        key: "Wallet",
        userId: userId,
        value: { address: address, balance: 0 },
        permissionRead: 2,
        permissionWrite: 0,
      },
    ]);
    return Res.Success(undefined, "wallet has been connected");
  } catch (error: any) {
    return Res.Error(logger, `Error While Connecting Wallet`, error);
  }
};
