namespace WalletIndex {
  const queryMaker = (address: string) => `+address:${address}`;
  export const get = (
    nk: nkruntime.Nakama,
    address: string
  ): nkruntime.StorageObject | null => {
    try {
      const query = queryMaker(address);
      const res = nk.storageIndexList(
        StorageIndex.configs.cryptoWallet.name,
        query,
        1
      );
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
  let data;

  data = JSON.parse(payload);
  if (!data || !data.address) return Res.BadRequest();

  let { address } = data;
  try {
    CryptoWallet.set(nk, userId, { address });
    return Res.Success(undefined, "wallet has been connected");
  } catch (error: any) {
    return Res.Error(logger, `Error While Connecting Wallet`, error);
  }
};
