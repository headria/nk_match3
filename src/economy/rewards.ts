namespace Rewards {
  const collection = "Economy";
  const key = "Rewards";

  export type RewardItem = Wallet.ChangeSetItem;

  export type Reward = {
    id: string;
    items: RewardItem[];
    claimed?: boolean;
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
    userId: string
  ): { rewards: Rewards; version: string | undefined } {
    const data = nk.storageRead([{ collection, key, userId }]);
    let rewards: Rewards;
    let version;
    if (data.length < 1) {
      rewards = [];
      version = undefined;
    } else {
      rewards = data[0].value.rewards as Rewards;
      version = data[0].version;
    }
    return { rewards, version };
  }

  function set(
    nk: nkruntime.Nakama,
    userId: string,
    newRewards: Rewards,
    version?: string
  ) {
    const writeObj: nkruntime.StorageWriteRequest = {
      collection,
      key,
      userId,
      value: { rewards: newRewards },
      permissionRead: 1,
      permissionWrite: 0,
    };
    writeObj.version = version ? version : "*";
    const res = nk.storageWrite([writeObj]);
    return res[0].version;
  }
  //add new reward
  export function add(nk: nkruntime.Nakama, userId: string, reward: Reward) {
    const { rewards, version } = get(nk, userId);
    reward.claimed = false;
    reward.addTime = Date.now();
    rewards.push(reward);
    set(nk, userId, rewards, version);
  }

  export function addNcliam(
    nk: nkruntime.Nakama,
    userId: string,
    reward: Reward
  ) {
    add(nk, userId, reward);
    return claim(nk, userId, reward.id);
  }

  function rewardIndex(id: string, rewards: Rewards) {
    let rewardIndex = -1;
    //reverse order for accessing latest rewards
    for (let i = rewards.length - 1; i >= 0; i--) {
      const reward = rewards[i];
      if (reward.id === id && reward.claimed === false) {
        rewardIndex = i;
        break;
      }
    }
    return rewardIndex;
  }
  export function claim(
    nk: nkruntime.Nakama,
    userId: string,
    rewardId: string
  ) {
    while (true) {
      try {
        let { rewards, version } = get(nk, userId);
        const index = rewardIndex(rewardId, rewards);
        if (index === -1) return { code: Res.Code.notFound };
        const rewardItems = rewards[index].items;
        const { wallet } = Wallet.update(nk, userId, rewardItems);
        rewards[index].claimed = true;
        rewards[index].claimTime = Date.now();
        set(nk, userId, rewards, version);
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
  let rewardId: string;
  try {
    const input = JSON.parse(payload);
    rewardId = input.id;
  } catch (error: any) {
    return Res.BadRequest(error);
  }
  const res = Rewards.claim(nk, userId, rewardId);
  if (res.code === Res.Code.notFound) return Res.notFound("reward");
  res.code === Res.Code.success
    ? Res.Success(res.data, "reward claimed")
    : Res.Error(logger, "failed to claim reward", res.error);
};
