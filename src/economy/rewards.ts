namespace Rewards {
  const collection = "Economy";
  const key = "Rewards";

  type RewardItem = Wallet.ChangeSetItem;

  export type Reward = {
    id: string;
    items: RewardItem[];
  };

  export type Rewards = Reward[];

  type TierConfig = {
    [tier: string]: number;
  };

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
    if (version) writeObj.version = version;
    nk.storageWrite([writeObj]);
  }

  export function add(nk: nkruntime.Nakama, userId: string, reward: Reward) {
    const { rewards, version } = get(nk, userId);
    rewards.push(reward);
    set(nk, userId, rewards, version);
  }

  function remove(nk: nkruntime.Nakama, userId: string, rewardId: string) {
    let { rewards, version } = get(nk, userId);
    let indexToRemove = -1;
    for (let i = 0; i < rewards.length; i++) {
      if (rewards[i].id === rewardId) {
        indexToRemove = i;
        break;
      }
    }

    if (indexToRemove === -1)
      throw new Error("No matching rewards found for removal");

    rewards.splice(indexToRemove, 1);
    set(nk, userId, rewards, version);
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
        for (let i = 0; i < rewards.length; i++) {
          if (rewards[i].id === rewardId) {
            rewardIndex = i;
            break;
          }
        }
        if (rewardIndex === -1)
          throw new Error("No matching rewards found for claim");
        const rewardItems = rewards[rewardIndex].items;
        rewards.splice(rewardIndex, 1);
        set(nk, userId, rewards, version);
        Wallet.update(nk, userId, rewardItems);
        return;
      } catch (error: any) {
        if (error.message.indexOf("version check failed") === -1) throw error;
      }
    }
  }

  export function getTierByRank(
    rank: number,
    tierConfig: TierConfig
  ): string | null {
    const TierRanking = ["gold", "silver", "bronze", "normal"];
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
  const input = JSON.parse(payload);
  const rewardId: string = input.id;
  const userId = ctx.userId;

  Rewards.claim(nk, userId, rewardId);
};
