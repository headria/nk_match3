type BPReward = {
  requiredKeys: number;
  free: Rewards.RewardItem[];
  premium: Rewards.RewardItem[];
};

const BattlePassRewards: BPReward[] = [
  {
    requiredKeys: 1,
    free: [{ id: "DiscoBall", quantity: 1 }],
    premium: [{ id: "DiscoBall", quantity: 2 }],
  },
  {
    requiredKeys: 2,
    free: [{ id: "TNT", quantity: 1 }],
    premium: [{ id: "DiscoBall", quantity: 2 }],
  },
  {
    requiredKeys: 5,
    free: [{ id: "TNT", quantity: 1 }],
    premium: [
      { id: "DiscoBall", quantity: 2 },
      { id: "TNT", quantity: 1 },
    ],
  },
  {
    free: [{ id: "Coins", quantity: 100 }],
    premium: [{ id: "Coins", quantity: 1000 }],
    requiredKeys: 30,
  },
];

namespace BattlePass {
  type BattlePassMetaData = {
    tier: number;
    tierKeys: number;
    premium: boolean;
  };

  const rawData: BattlePassMetaData = {
    tier: 0,
    tierKeys: 0,
    premium: false,
  };

  export const config: Leaderboards.LeaderboardConfig = {
    leaderboardID: "BattlePass",
    authoritative: true,
    metadata: { rewards: BattlePassRewards },
    operator: nkruntime.Operator.INCREMENTAL,
    // resetSchedule: "0 0 * 1 *",
    resetSchedule: "0 */1 * * *",
    sortOrder: nkruntime.SortOrder.DESCENDING,
  };

  export function init(nk: nkruntime.Nakama) {
    const {
      leaderboardID,
      authoritative,
      metadata,
      operator,
      resetSchedule,
      sortOrder,
    } = config;
    nk.leaderboardCreate(
      leaderboardID,
      authoritative,
      sortOrder,
      operator,
      resetSchedule,
      metadata
    );
  }

  export function get(
    nk: nkruntime.Nakama,
    userId: string
  ): BattlePassMetaData {
    const { leaderboardID } = config;
    const recordData = nk.leaderboardRecordsList(leaderboardID, [userId], 1);
    let data = rawData;
    if (recordData.ownerRecords && recordData.ownerRecords.length > 0) {
      data = recordData.ownerRecords[0].metadata as BattlePassMetaData;
    }
    return data;
  }

  export function update(
    nk: nkruntime.Nakama,
    userId: string,
    keys?: number,
    tierKeys?: number | undefined,
    tier?: number | undefined,
    premium?: boolean
  ) {
    try {
      const { leaderboardID } = config;
      let metadata = get(nk, userId);
      if (tierKeys !== undefined) metadata.tierKeys = tierKeys;
      if (tier !== undefined) metadata.tier = tier;
      if (premium !== undefined) metadata.premium = premium;

      nk.leaderboardRecordWrite(
        leaderboardID,
        userId,
        undefined,
        keys,
        undefined,
        metadata
      );
    } catch (error: any) {
      throw new Error(`failed to set Battlepass metadata: ${error.message}`);
    }
  }

  function addReward(
    nk: nkruntime.Nakama,
    userId: string,
    tier: number,
    subType: "premium" | "free"
  ) {
    const tierRewards = BattlePassRewards[tier][subType];
    if (tierRewards.length < 1) return;
    const reward: Rewards.Reward = {
      id: `BP-${subType}-${tier}`,
      items: tierRewards,
    };
    Rewards.add(nk, userId, reward);
  }

  function premiumfy(nk: nkruntime.Nakama, userId: string) {
    const data = get(nk, userId);
    if (data.premium) return;
    for (
      let tier = 0;
      tier < data.tier || tier < BattlePassRewards.length;
      tier++
    ) {
      addReward(nk, userId, tier, "premium");
    }
    update(nk, userId, undefined, undefined, undefined, true);
  }

  export function addKeys(nk: nkruntime.Nakama, userId: string, keys: number) {
    let { tier, tierKeys, premium } = get(nk, userId);
    const newTier = getTierByKeys(keys, tier, tierKeys);
    while (newTier.tier > tier) {
      const subType: keyof BPReward = premium ? "premium" : "free";
      addReward(nk, userId, tier, subType);
      tier++;
    }
    update(nk, userId, keys, newTier.keys, newTier.tier);
  }

  export function getTierByKeys(
    keys: number,
    latestTier: number,
    tierKeys: number
  ) {
    let remainedKeys = keys + tierKeys;
    let tier = latestTier;
    const lastTier = BattlePassRewards.length - 1;
    const lastTierKeys = BattlePassRewards[latestTier].requiredKeys;

    while (
      tier < lastTier &&
      remainedKeys >= BattlePassRewards[tier].requiredKeys
    ) {
      remainedKeys -= BattlePassRewards[tier].requiredKeys;
      tier++;
    }

    while (tier >= lastTier && remainedKeys > lastTierKeys) {
      tier++;
      remainedKeys -= lastTierKeys;
    }

    return { tier, keys: remainedKeys };
  }
}
