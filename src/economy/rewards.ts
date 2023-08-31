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
    nk.storageWrite([writeObj]);
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
    claim(nk, userId, reward.id);
  }

  export function claim(
    nk: nkruntime.Nakama,
    userId: string,
    rewardId: string
  ) {
    while (true) {
      try {
        let { rewards, version } = get(nk, userId);
        let rewardIndex = -1;
        //reverse order for accessing latest rewards
        for (let i = rewards.length - 1; i >= 0; i--) {
          const reward = rewards[i];
          if (reward.id === rewardId && reward.claimed === false) {
            rewardIndex = i;
            break;
          }
        }
        if (rewardIndex === -1)
          throw new Error("No matching rewards found for claim");
        const rewardItems = rewards[rewardIndex].items;

        Wallet.update(nk, userId, rewardItems);

        rewards[rewardIndex].claimed = true;
        rewards[rewardIndex].claimTime = Date.now();
        set(nk, userId, rewards, version);
        return;
      } catch (error: any) {
        if (error.message.indexOf("version check failed") === -1)
          throw new Error(`Failed to claim reward: ${error.message}`);
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
  if (!ctx.userId) throw new Error("Called By Server");
  const userId = ctx.userId;

  const input = JSON.parse(payload);
  logger.debug(input.id);
  const rewardId = input.id;
  Rewards.claim(nk, userId, rewardId);
};
