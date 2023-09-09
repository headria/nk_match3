type BPReward = {
  requiredKeys: number;
  free: Rewards.RewardItem[];
  premium: Rewards.RewardItem[];
};

const BattlePassRewards: BPReward[] = [
  {
    free: [{ id: "DiscoBall", quantity: 1 }],
    premium: [{ id: "DiscoBall", quantity: 2 }],
    requiredKeys: 1,
  },
  {
    free: [{ id: "TNT", quantity: 1 }],
    premium: [{ id: "TNT", quantity: 2 }],
    requiredKeys: 2,
  },
  {
    free: [{ id: "HorizontalRocket", quantity: 1 }],
    premium: [{ id: "HorizontalRocket", quantity: 2 }],
    requiredKeys: 5,
  },
  {
    free: [{ id: "Coins", quantity: 100 }],
    premium: [{ id: "Coins", quantity: 200 }],
    requiredKeys: 5,
  },
  {
    free: [
      { id: "Rocket", quantity: 1 },
      { id: "Heart", time: 15 * 60 },
    ],
    premium: [
      { id: "Rocket", quantity: 2 },
      { id: "Heart", time: 30 * 60 },
    ],
    requiredKeys: 10,
  },
  {
    free: [{ id: "Hammer", quantity: 1 }],
    premium: [{ id: "Hammer", quantity: 2 }],
    requiredKeys: 10,
  },
  {
    free: [{ id: "DiscoBall", time: 15 * 60 }],
    premium: [{ id: "DiscoBall", time: 30 * 60 }],
    requiredKeys: 10,
  },
  {
    free: [{ id: "TNT", quantity: 1 }],
    premium: [{ id: "TNT", quantity: 2 }],
    requiredKeys: 10,
  },
  {
    free: [{ id: "Rocket", quantity: 1 }],
    premium: [{ id: "Rocket", quantity: 2 }],
    requiredKeys: 10,
  },
  {
    free: [
      { id: "DiscoBall", quantity: 1 },
      { id: "Rocket", quantity: 1 },
      { id: "Shuffle", quantity: 1 },
    ],
    premium: [
      { id: "DiscoBall", quantity: 2 },
      { id: "Rocket", quantity: 2 },
      { id: "Shuffle", quantity: 2 },
    ],
    requiredKeys: 10,
  },
  {
    free: [{ id: "VerticalRocket", quantity: 1 }],
    premium: [{ id: "VerticalRocket", quantity: 2 }],
    requiredKeys: 15,
  },
  {
    free: [{ id: "Coins", quantity: 250 }],
    premium: [{ id: "Coins", quantity: 500 }],
    requiredKeys: 15,
  },
  {
    free: [{ id: "Shuffle", quantity: 1 }],
    premium: [{ id: "Shuffle", quantity: 2 }],
    requiredKeys: 15,
  },
  {
    free: [{ id: "Rocket", quantity: 1 }],
    premium: [{ id: "Rocket", quantity: 2 }],
    requiredKeys: 15,
  },
  {
    free: [
      { id: "TNT", quantity: 1 },
      { id: "VerticalRocket", quantity: 1 },
    ],
    premium: [
      { id: "TNT", quantity: 2 },
      { id: "VerticalRocket", quantity: 2 },
    ],
    requiredKeys: 15,
  },
  {
    free: [{ id: "TNT", time: 15 * 60 }],
    premium: [{ id: "TNT", time: 30 * 60 }],
    requiredKeys: 15,
  },
  {
    free: [{ id: "Hammer", quantity: 1 }],
    premium: [{ id: "Hammer", quantity: 2 }],
    requiredKeys: 15,
  },
  {
    free: [{ id: "DiscoBall", quantity: 1 }],
    premium: [{ id: "DiscoBall", quantity: 2 }],
    requiredKeys: 15,
  },
  {
    free: [{ id: "Heart", time: 30 * 60 }],
    premium: [{ id: "Heart", time: 60 * 60 }],
    requiredKeys: 15,
  },
  {
    free: [
      { id: "VerticalRocket", quantity: 1 },
      { id: "Rocket", quantity: 1 },
      { id: "TNT", quantity: 1 },
    ],
    premium: [
      { id: "VerticalRocket", quantity: 2 },
      { id: "Rocket", quantity: 2 },
      { id: "TNT", quantity: 2 },
    ],
    requiredKeys: 15,
  },
  {
    free: [{ id: "TNT", quantity: 2 }],
    premium: [{ id: "TNT", quantity: 4 }],
    requiredKeys: 20,
  },
  {
    free: [{ id: "DiscoBall", quantity: 2 }],
    premium: [{ id: "DiscoBall", quantity: 4 }],
    requiredKeys: 20,
  },
  {
    free: [{ id: "Rocket", time: 15 * 60 }],
    premium: [{ id: "Rocket", time: 30 * 60 }],
    requiredKeys: 20,
  },
  {
    free: [{ id: "Coins", quantity: 500 }],
    premium: [{ id: "Coins", quantity: 1000 }],
    requiredKeys: 20,
  },
  {
    free: [
      { id: "Heart", time: 30 * 60 },
      { id: "Hammer", quantity: 1 },
      { id: "DiscoBall", quantity: 1 },
    ],
    premium: [
      { id: "Heart", time: 60 * 60 },
      { id: "Hammer", quantity: 2 },
      { id: "DiscoBall", quantity: 2 },
    ],
    requiredKeys: 20,
  },
  {
    free: [{ id: "HorizontalRocket", quantity: 1 }],
    premium: [{ id: "HorizontalRocket", quantity: 2 }],
    requiredKeys: 20,
  },
  {
    free: [{ id: "Shuffle", quantity: 2 }],
    premium: [{ id: "Shuffle", quantity: 3 }],
    requiredKeys: 20,
  },
  {
    free: [{ id: "DiscoBall", quantity: 1 }],
    premium: [{ id: "DiscoBall", quantity: 2 }],
    requiredKeys: 20,
  },
  {
    free: [{ id: "TNT", time: 30 * 60 }],
    premium: [{ id: "TNT", time: 60 * 60 }],
    requiredKeys: 20,
  },
  {
    free: [
      { id: "Rocket", quantity: 3 },
      { id: "DiscoBall", quantity: 3 },
      { id: "TNT", quantity: 3 },
      { id: "Shuffle", quantity: 3 },
    ],
    premium: [
      { id: "Rocket", quantity: 6 },
      { id: "DiscoBall", quantity: 6 },
      { id: "TNT", quantity: 6 },
      { id: "Shuffle", quantity: 6 },
    ],
    requiredKeys: 20,
  },
  {
    free: [],
    premium: [],
    requiredKeys: 500,
  },
];

namespace BattlePass {
  const MAX_BONUS_BANK_KEYS = 500;

  export type MetaData = {
    tier: number;
    tierKeys: number;
    premium: boolean;
  };

  type BattlePassData = MetaData & { totalKeys: number };

  const rawData: MetaData = {
    tier: 0,
    tierKeys: 0,
    premium: false,
  };

  export const config: Leaderboards.Config = {
    leaderboardID: "BattlePass",
    authoritative: true,
    metadata: { rewards: BattlePassRewards },
    operator: nkruntime.Operator.INCREMENTAL,
    // resetSchedule: "0 0 * 1 *",
    resetSchedule: "*/1 * * * *",
    sortOrder: nkruntime.SortOrder.DESCENDING,
  };

  export function init(nk: nkruntime.Nakama) {
    nk.leaderboardCreate(
      config.leaderboardID,
      config.authoritative,
      config.sortOrder,
      config.operator,
      config.resetSchedule,
      config.metadata
    );
  }

  export function get(nk: nkruntime.Nakama, userId: string): BattlePassData {
    try {
      const { leaderboardID } = config;
      const recordData = nk.leaderboardRecordsList(leaderboardID, [userId], 1);
      let { premium, tier, tierKeys }: MetaData = rawData;
      let totalKeys: number = 0;
      if (recordData.ownerRecords && recordData.ownerRecords.length > 0) {
        ({ premium, tier, tierKeys } = recordData.ownerRecords[0]
          .metadata as MetaData);
        totalKeys = recordData.ownerRecords[0].score;
      }
      return { totalKeys, tier, tierKeys, premium };
    } catch (error: any) {
      throw new Error(`failed to get BattlePass: ${error.message}`);
    }
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
      if (tierKeys !== undefined)
        metadata.tierKeys = Math.min(MAX_BONUS_BANK_KEYS, tierKeys);
      if (tier !== undefined) metadata.tier = tier;
      if (premium !== undefined) metadata.premium = premium;
      const newMeta: MetaData = metadata;

      nk.leaderboardRecordWrite(
        leaderboardID,
        userId,
        undefined,
        keys,
        undefined,
        newMeta
      );
    } catch (error: any) {
      throw new Error(`failed to set Battlepass metadata: ${error.message}`);
    }
  }

  function addReward(
    nk: nkruntime.Nakama,
    userId: string,
    tier: number,
    expiry: number,
    subType: "premium" | "free"
  ) {
    const tierRewards = BattlePassRewards[tier][subType];
    if (tierRewards.length < 1) return;
    const reward: Rewards.Reward = {
      id: `BP-${subType}-${tier}`,
      items: tierRewards,
      type: "BattlePass",
    };
    Rewards.add(nk, userId, reward, expiry);
  }

  function getStats(nk: nkruntime.Nakama) {
    const leaderboard = nk.leaderboardsGetId([config.leaderboardID])[0];
    return leaderboard;
  }

  function premiumfy(nk: nkruntime.Nakama, userId: string) {
    const data = get(nk, userId);
    if (data.premium) return;
    const stats = getStats(nk);
    const expiry = stats.nextReset * 1000;
    for (
      let tier = 0;
      tier < data.tier || tier < BattlePassRewards.length;
      tier++
    ) {
      addReward(nk, userId, tier, expiry, "premium");
    }
    update(nk, userId, undefined, undefined, undefined, true);
  }

  export function addKeys(
    nk: nkruntime.Nakama,
    logger: nkruntime.Logger,
    userId: string,
    keys: number
  ) {
    try {
      let { tier, tierKeys, premium } = get(nk, userId);

      const newTier = getTierByKeys(keys, tier, tierKeys);
      const stats = getStats(nk);
      const expiry = stats.nextReset * 1000;
      while (newTier.tier > tier) {
        if (premium) addReward(nk, userId, tier, expiry, "premium");
        addReward(nk, userId, tier, expiry, "free");
        tier++;
      }
      update(nk, userId, keys, newTier.keys, newTier.tier);
    } catch (error: any) {
      throw new Error(`failed to add battlepass keys: ${error.message}`);
    }
  }

  export function getTierByKeys(
    keys: number,
    latestTier: number,
    tierKeys: number
  ) {
    try {
      let tier = latestTier;
      let remainedKeys = keys + tierKeys;
      const lastTier = BattlePassRewards.length - 1;
      while (
        tier < lastTier &&
        remainedKeys >= BattlePassRewards[tier].requiredKeys
      ) {
        remainedKeys -= BattlePassRewards[tier].requiredKeys;
        tier++;
      }
      if (tier >= lastTier)
        remainedKeys = Math.min(MAX_BONUS_BANK_KEYS, remainedKeys);
      return { tier, keys: remainedKeys };
    } catch (error: any) {
      throw new Error(`failed to getTierByKeys: ${error.message}`);
    }
  }

  export function BattlePassReset(
    nk: nkruntime.Nakama,
    logger: nkruntime.Logger,
    reset: number
  ) {
    let cursor: string | undefined = undefined;
    let notifications: nkruntime.Notification[] = [];
    const { leaderboardID } = config;
    const batchSize = 100;
    do {
      const recordData = nk.leaderboardRecordsList(
        leaderboardID,
        undefined,
        batchSize,
        cursor,
        reset
      );
      if (!recordData || !recordData.records) break;

      const { records } = recordData;
      for (const r of records) {
        const userId = r.ownerId;
        const metadata = r.metadata as MetaData;

        if (metadata.tier < BattlePassRewards.length - 1) continue;
        const coins = Math.floor(metadata.tierKeys / 10) * 100;
        if (coins < 1) continue;
        const reward: Rewards.Reward = {
          id: "Bonus Bank",
          items: [{ id: "Coins", quantity: coins }],
          type: "BattlePass",
        };
        Rewards.add(nk, userId, reward);

        const content = {
          reward,
        };
        const notif = Notifications.create(
          Notifications.CODES.BattlePassReset,
          userId,
          content
        );
        notifications.push(notif);
      }
      nk.notificationsSend(notifications);
      notifications = [];
      cursor = recordData.nextCursor;
    } while (cursor);
  }
}
