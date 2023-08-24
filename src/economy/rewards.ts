namespace Rewards {
  const collection = "Economy";
  const key = "Rewards";

  type Reward = {
    id: string;
    name: string;
    items: Wallet.ChangeSetItem[];
  };
  type Rewards = Reward[];

  function get(
    nk: nkruntime.Nakama,
    userId: string
  ): { rewards: Rewards; version: string } {
    const data = nk.storageRead([{ collection, key, userId }]);
    if (data.length < 1) throw new Error(`failed to get Rewards for ${userId}`);
    const rewards = data[0].value as Rewards;
    const version = data[0].version;
    return { rewards, version };
  }

  export function set(
    nk: nkruntime.Nakama,
    userId: string,
    newRewards: Rewards,
    version?: string
  ) {
    const writeObj: nkruntime.StorageWriteRequest = {
      collection,
      key,
      userId,
      value: newRewards,
      permissionRead: 1,
      permissionWrite: 0,
    };
    if (version) writeObj.version = version;
    nk.storageWrite([writeObj]);
  }

  export function add(nk: nkruntime.Nakama, userId: string, reward: Reward) {
    let { rewards, version } = get(nk, userId);
    rewards.push(reward);
    set(nk, userId, rewards, version);
  }

  export function remove(
    nk: nkruntime.Nakama,
    userId: string,
    rewardId: string
  ) {
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
}
