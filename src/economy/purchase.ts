namespace MyketPurchase {
  type Data = {
    token: string;
    sku: string;
    payload: string;
    purchaseTime: number;
  };

  type validateResponse = {
    kind: string;
    purchaseTime: number;
    developerPayload: string;
    purchaseState: 0 | 1;
    consumptionState: 0 | 1;
  };
  export const collection = "Purchase";

  const accessToken = "044f102f-f59a-4bd8-a0a5-51090647767f";
  const PackageName = "com.PlanetMemes.MemeCoinMania";
  const ValidateURL = (sku: string, token: string) =>
    `https://developer.myket.ir/api/applications/${PackageName}/purchases/products/${sku}/tokens/${token}`;

  export function init(initializer: nkruntime.Initializer) {
    initializer.registerRpc("purchase", PurchaseRPC);
  }

  function save(nk: nkruntime.Nakama, key: string, userId: string, data: Data) {
    try {
      nk.storageWrite([
        {
          collection,
          key,
          userId,
          value: data,
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
    } catch (error: any) {
      throw new Error(`failed to save Purchase data => ${error.message}`);
    }
  }

  function validateToken(
    nk: nkruntime.Nakama,
    sku: string,
    token: string
  ): Res.ServiceRes {
    const url = ValidateURL(sku, token);
    let res;
    try {
      const headers = { "X-Access-Token": accessToken };
      const body = {
        sku,
        token,
      };
      res = HTTP.request(nk, url, "get", body, headers);
    } catch (error: any) {
      return {
        code: "error",
        message: `validation request failed => ${error.message}`,
      };
    }
    const data = {
      purchaseTime: res.purchaseTime,
      payload: res.developerPayload,
    };
    return res.purchaseState === 0
      ? { code: "success", data }
      : { code: "failed", message: "purchase has been failed" };
  }

  function purchaseTokenExists(nk: nkruntime.Nakama, token: string) {
    const query = `+token:${token}`;
    const { name } = StorageIndex.configs.purchase;
    const results = nk.storageIndexList(name, query, 1);
    return results.length > 0 ? results[0] : undefined;
  }

  function processPurchase(
    nk: nkruntime.Nakama,
    userId: string,
    packageId: string
  ): Res.ServiceRes {
    const filterResults = SHOP_ITEMS.filter((item) => item.id === packageId);
    if (filterResults.length < 1)
      return { code: "notFound", message: "Shop item not found" };
    const item = filterResults[0] as Rewards.Reward;
    item.type = "Shop";
    const claimRes = Rewards.addNcliam(nk, userId, item);
    if (claimRes.code !== "success")
      return {
        code: claimRes.code,
        message: `failed to claim item => ${claimRes.message}`,
      };
    return { code: "success" };
  }

  export const purchase: nkruntime.RpcFunction = (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    payload: string
  ): string | void => {
    const userId = ctx.userId;
    if (!userId) return Res.CalledByServer();
    const { token, sku } = JSON.parse(payload);
    if (!token || !sku) return Res.BadRequest();

    const tokenExists = purchaseTokenExists(nk, token);

    if (tokenExists !== undefined)
      return tokenExists.userId === userId
        ? Res.response(
            false,
            "alreadyExists",
            undefined,
            "you have already claimed this"
          )
        : Res.response(false, "expired", undefined, "Duplicate purchase token");

    const validateRes = validateToken(nk, sku, token);
    if (validateRes.code !== "success")
      return Res.response(
        false,
        validateRes.code,
        undefined,
        validateRes.message
      );
    const { purchaseTime, payload: purchasePayload } = validateRes.data;
    const result = processPurchase(nk, userId, sku);
    if (result.code !== "success")
      return Res.response(false, result.code, undefined, result.message);
    try {
      const key = String(token);
      save(nk, key, userId, {
        sku,
        purchaseTime,
        token,
        payload: purchasePayload,
      });
    } catch (error) {
      return Res.Error(
        logger,
        "failed to save Purchase data in database",
        error
      );
    }
    return Res.Success();
  };
}

const PurchaseRPC: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string | void => {
  return MyketPurchase.purchase(ctx, logger, nk, payload);
};
