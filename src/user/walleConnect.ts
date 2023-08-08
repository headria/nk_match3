const WalletConnect: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string | void => {
  try {
    const data = JSON.parse(payload);
    if (!data || !data["address"]) throw new Error("Bad Request");
    let address = data["address"];
    const query = `+address:${address}`;
    const res = nk.storageIndexList("crypto-wallet", query, 1);
    if (res.length == 0) {
      nk.storageWrite([
        {
          collection: "Crypto",
          key: "Wallet",
          userId: ctx.userId,
          value: { address, balance: null },
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
      return;
    }
    const WalletUID = res[0].userId;
    const account = nk.accountGetId(WalletUID);
    const deviceId = account.devices[0].id;
    return JSON.stringify(deviceId);
  } catch (error: any) {
    throw new Error(`Error While Connecting Wallet: ${error.message}`);
  }
};
