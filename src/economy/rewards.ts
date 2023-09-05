namespace Rewards {
  const collection = "Rewards";

  export type RewardItem = Wallet.ChangeSetItem;
  export type RewardType = "BattlePass" | "Leaderboard" | "Shop";

  export type Reward = {
    id: string;
    items: RewardItem[];
    type: RewardType;
    claimed?: boolean;
    expiry?: number;
    addTime?: number;
    claimTime?: number;
  };

  export type Rewards = Reward[];

  type Tier = "gold" | "silver" | "bronze" | "normal";

  export type TierConfig = {
    [tier in Tier]?: number;
  };

  type TierRewards = {
    [tier in Tier]?: RewardItem[];
  };

  export type LeaderboardReaward = {
    joinRewards?: Reward;
    config: TierConfig;
  } & TierRewards;

  export function get(
    nk: nkruntime.Nakama,
    type: RewardType,
    userId: string
  ): { rewards: Rewards; version: string | undefined } {
    const data = nk.storageRead([{ collection, key: type, userId }]);
    let rewards: Rewards = data.length > 0 ? data[0].value.rewards : [];
    let version = data.length > 0 ? data[0].version : undefined;
    return { rewards, version };
  }

  function set(
    nk: nkruntime.Nakama,
    userId: string,
    type: RewardType,
    newRewards: Rewards,
    version?: string
  ) {
    const writeObj: nkruntime.StorageWriteRequest = {
      collection,
      key: type,
      userId,
      value: { rewards: newRewards },
      permissionRead: 1,
      permissionWrite: 0,
    };
    writeObj.version = version !== undefined ? version : "*";
    const res = nk.storageWrite([writeObj]);
    return res[0].version;
  }
  //add new reward
  export function add(
    nk: nkruntime.Nakama,
    userId: string,
    reward: Reward,
    expiry?: number
  ) {
    try {
      const { rewards, version } = get(nk, reward.type, userId);
      reward.claimed = false;
      reward.addTime = Date.now();
      if (expiry !== undefined) reward.expiry = expiry;
      rewards.push(reward);
      set(nk, userId, reward.type, rewards, version);
    } catch (error: any) {
      throw new Error(`failed to add reward: ${error.message}`);
    }
  }

  export function addNcliam(
    nk: nkruntime.Nakama,
    userId: string,
    reward: Reward
  ) {
    add(nk, userId, reward);
    return claim(nk, userId, reward.type, reward.id);
  }

  function rewardIndex(id: string, rewards: Rewards) {
    let rewardIndex = -1;
    //reverse order for accessing latest rewards
    for (let i = rewards.length - 1; i >= 0; i--) {
      const reward = rewards[i];
      if (
        reward.id === id &&
        reward.claimed === false &&
        reward.expiry &&
        reward.expiry > Date.now()
      ) {
        rewardIndex = i;
        break;
      }
    }
    return rewardIndex;
  }
  export function claim(
    nk: nkruntime.Nakama,
    userId: string,
    type: RewardType,
    rewardId: string
  ) {
    while (true) {
      try {
        let { rewards, version } = get(nk, type, userId);
        const index = rewardIndex(rewardId, rewards);
        if (index === -1) return { code: Res.Code.notFound };
        const rewardItems = rewards[index].items;
        const { wallet } = Wallet.update(nk, userId, rewardItems);
        rewards[index].claimed = true;
        rewards[index].claimTime = Date.now();
        set(nk, userId, type, rewards, version);
        return { code: Res.Code.success, data: wallet };
      } catch (error: any) {
        if (error.message.indexOf("version check failed") === -1)
          return { code: Res.Code.error, error: error.message };
      }
    }
  }

  export function getTierByRank(
    rank: number,
    tierConfig: TierConfig
  ): Tier | null {
    const TierRanking: Tier[] = ["gold", "silver", "bronze", "normal"];
    if (rank > 0) {
      for (const tier of TierRanking) {
        const tierMaxRank = tierConfig[tier];
        if (!tierMaxRank) break;
        if (rank <= tierMaxRank) {
          return tier;
        }
      }
    }
    return null;
  }
}

const ClaimRewardRPC: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string | void => {
  const userId = ctx.userId;
  if (!userId) return Res.CalledByServer();
  try {
    const input = JSON.parse(payload);
    const { id, type } = input;
    if (!id || !type) return Res.BadRequest();

    const res = Rewards.claim(nk, userId, type, id);
    if (res.code === Res.Code.notFound) return Res.notFound("reward");
    res.code === Res.Code.success
      ? Res.Success(res.data, "reward claimed")
      : Res.Error(logger, "failed to claim reward", res.error);
  } catch (error: any) {
    return Res.Error(logger, "failed to claim reward", error);
  }
};
