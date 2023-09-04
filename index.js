"use strict";
var __setFunctionName =
  (this && this.__setFunctionName) ||
  function (f, name, prefix) {
    if (typeof name === "symbol")
      name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", {
      configurable: true,
      value: prefix ? "".concat(prefix, " ", name) : name,
    });
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
var InitModule = function (ctx, logger, nk, initializer) {
  //register storage index
  StorageIndex.registerIndexes(initializer);
  //initialize battlepass
  BattlePass.init(nk);
  //initialize shop
  initShop(nk);
  VirtualShop.init(initializer, nk);
  //initiate user wallet
  initializer.registerAfterAuthenticateDevice(InitiateUser);
  initializer.registerBeforeReadStorageObjects(BeforeGetStorage);
  initializer.registerRpc("rewards/claim", ClaimRewardRPC);
  //create Leaderboards
  Leaderboards.initalizeLeaderboards(nk, logger);
  Bucket.initializeLeaderboards(nk, initializer);
  //Register Leaderboards rpcs
  initializer.registerRpc("user/WalletConnect", WalletConnect);
  //validators
  initializer.registerRpc("level/validate", levelValidatorRPC);
};
var BattlePassRewards = [
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
var BattlePass;
(function (BattlePass) {
  var rawData = {
    tier: 0,
    tierKeys: 0,
    premium: false,
  };
  BattlePass.config = {
    leaderboardID: "BattlePass",
    authoritative: true,
    metadata: { rewards: BattlePassRewards },
    operator: "increment" /* nkruntime.Operator.INCREMENTAL */,
    // resetSchedule: "0 0 * 1 *",
    resetSchedule: "0 */1 * * *",
    sortOrder: "descending" /* nkruntime.SortOrder.DESCENDING */,
  };
  function init(nk) {
    var leaderboardID = BattlePass.config.leaderboardID,
      authoritative = BattlePass.config.authoritative,
      metadata = BattlePass.config.metadata,
      operator = BattlePass.config.operator,
      resetSchedule = BattlePass.config.resetSchedule,
      sortOrder = BattlePass.config.sortOrder;
    nk.leaderboardCreate(
      leaderboardID,
      authoritative,
      sortOrder,
      operator,
      resetSchedule,
      metadata
    );
  }
  BattlePass.init = init;
  function get(nk, userId) {
    var leaderboardID = BattlePass.config.leaderboardID;
    var recordData = nk.leaderboardRecordsList(leaderboardID, [userId], 1);
    var data = rawData;
    if (recordData.ownerRecords && recordData.ownerRecords.length > 0) {
      data = recordData.ownerRecords[0].metadata;
    }
    return data;
  }
  BattlePass.get = get;
  function update(nk, userId, keys, tierKeys, tier, premium) {
    try {
      var leaderboardID = BattlePass.config.leaderboardID;
      var metadata = get(nk, userId);
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
    } catch (error) {
      throw new Error(
        "failed to set Battlepass metadata: ".concat(error.message)
      );
    }
  }
  BattlePass.update = update;
  function addReward(nk, userId, tier, subType) {
    var tierRewards = BattlePassRewards[tier][subType];
    if (tierRewards.length < 1) return;
    var reward = {
      id: "BP-".concat(subType, "-").concat(tier),
      items: tierRewards,
    };
    Rewards.add(nk, userId, reward);
  }
  function premiumfy(nk, userId) {
    var data = get(nk, userId);
    if (data.premium) return;
    for (
      var tier = 0;
      tier < data.tier || tier < BattlePassRewards.length;
      tier++
    ) {
      addReward(nk, userId, tier, "premium");
    }
    update(nk, userId, undefined, undefined, undefined, true);
  }
  function addKeys(nk, userId, keys) {
    var _a = get(nk, userId),
      tier = _a.tier,
      tierKeys = _a.tierKeys,
      premium = _a.premium;
    var newTier = getTierByKeys(keys, tier, tierKeys);
    while (newTier.tier > tier) {
      var subType = premium ? "premium" : "free";
      addReward(nk, userId, tier, subType);
      tier++;
    }
    update(nk, userId, keys, newTier.keys, newTier.tier);
  }
  BattlePass.addKeys = addKeys;
  function getTierByKeys(keys, latestTier, tierKeys) {
    var remainedKeys = keys + tierKeys;
    var tier = latestTier;
    var lastTier = BattlePassRewards.length - 1;
    var lastTierKeys = BattlePassRewards[latestTier].requiredKeys;
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
    return { tier: tier, keys: remainedKeys };
  }
  BattlePass.getTierByKeys = getTierByKeys;
})(BattlePass || (BattlePass = {}));
var Levels;
(function (Levels) {
  Levels.difficulty = {
    1: 1,
    2: 1,
    3: 1,
    4: 1,
    5: 1,
    6: 1,
    7: 1,
    8: 1,
    9: 1,
    10: 1,
    11: 1,
    12: 2,
    13: 3,
    14: 2,
    15: 2,
    16: 2,
    17: 3,
    18: 2,
    19: 3,
    20: 2,
    21: 3,
    22: 2,
    23: 3,
    24: 2,
    25: 2,
    26: 2,
    27: 3,
    28: 2,
    29: 3,
    30: 2,
    31: 4,
    32: 3,
    33: 4,
    34: 3,
    35: 2,
    36: 2,
    37: 3,
    38: 4,
    39: 4,
    40: 3,
    41: 4,
    42: 3,
    43: 3,
    44: 2,
    45: 3,
    46: 2,
    47: 3,
    48: 4,
    49: 3,
    50: 2,
    51: 2,
    52: 3,
    53: 2,
    54: 2,
    55: 2,
    56: 2,
    57: 3,
    58: 2,
    59: 2,
    60: 4,
    61: 3,
    62: 3,
    63: 3,
    64: 2,
    65: 3,
    66: 2,
    67: 2,
    68: 2,
    69: 2,
    70: 3,
    71: 2,
    72: 3,
    73: 2,
    74: 3,
    75: 2,
    76: 2,
    77: 3,
    78: 2,
    79: 2,
    80: 3,
    81: 4,
    82: 4,
    83: 3,
    84: 4,
    85: 4,
    86: 4,
    87: 2,
    88: 4,
    89: 3,
    90: 2,
    91: 3,
    92: 3,
    93: 3,
    94: 2,
    95: 3,
    96: 3,
    97: 4,
    98: 2,
    99: 3,
    100: 4,
    101: 3,
    102: 2,
    103: 2,
    104: 2,
    105: 4,
    106: 2,
    107: 3,
    108: 2,
    109: 3,
    110: 4,
    111: 2,
    112: 3,
    113: 2,
    114: 3,
    115: 2,
    116: 3,
    117: 2,
    118: 2,
    119: 4,
    120: 2,
    121: 3,
    122: 2,
    123: 3,
    124: 2,
    125: 3,
    126: 2,
    127: 2,
    128: 2,
    129: 3,
    130: 4,
    131: 3,
    132: 3,
    133: 2,
    134: 3,
    135: 4,
    136: 2,
    137: 3,
    138: 2,
    139: 3,
    140: 3,
    141: 3,
    142: 3,
    143: 2,
    144: 3,
    145: 3,
    146: 2,
    147: 2,
    148: 3,
    149: 4,
    150: 4,
    151: 2,
    152: 2,
    153: 3,
    154: 2,
    155: 2,
    156: 3,
    157: 3,
    158: 2,
    159: 3,
    160: 3,
    161: 2,
    162: 3,
    163: 2,
    164: 3,
    165: 3,
    166: 3,
    167: 3,
    168: 3,
    169: 3,
    170: 3,
    171: 2,
    172: 2,
    173: 2,
    174: 3,
    175: 2,
    176: 2,
    177: 2,
    178: 3,
    179: 3,
    180: 4,
    181: 3,
    182: 2,
    183: 3,
    184: 3,
    185: 4,
    186: 3,
    187: 4,
    188: 2,
    189: 3,
    190: 4,
    191: 3,
    192: 3,
    193: 4,
    194: 2,
    195: 3,
    196: 2,
    197: 2,
    198: 3,
    199: 3,
    200: 1,
    201: 3,
    202: 2,
    203: 3,
    204: 3,
    205: 2,
    206: 4,
    207: 4,
    208: 4,
    209: 4,
    210: 3,
    211: 4,
    212: 2,
    213: 2,
    214: 4,
    215: 2,
    216: 3,
    217: 2,
    218: 4,
    219: 3,
    220: 4,
    221: 3,
    222: 2,
    223: 2,
    224: 4,
    225: 2,
    226: 2,
    227: 4,
  };
})(Levels || (Levels = {}));
var Rewards;
(function (Rewards) {
  var collection = "Economy";
  var key = "Rewards";
  function get(nk, userId) {
    var data = nk.storageRead([
      { collection: collection, key: key, userId: userId },
    ]);
    var rewards;
    var version;
    if (data.length < 1) {
      rewards = [];
      version = undefined;
    } else {
      rewards = data[0].value.rewards;
      version = data[0].version;
    }
    return { rewards: rewards, version: version };
  }
  Rewards.get = get;
  function set(nk, userId, newRewards, version) {
    var writeObj = {
      collection: collection,
      key: key,
      userId: userId,
      value: { rewards: newRewards },
      permissionRead: 1,
      permissionWrite: 0,
    };
    writeObj.version = version ? version : "*";
    var res = nk.storageWrite([writeObj]);
    return res[0].version;
  }
  //add new reward
  function add(nk, userId, reward) {
    var _a = get(nk, userId),
      rewards = _a.rewards,
      version = _a.version;
    reward.claimed = false;
    reward.addTime = Date.now();
    rewards.push(reward);
    set(nk, userId, rewards, version);
  }
  Rewards.add = add;
  function addNcliam(nk, userId, reward) {
    add(nk, userId, reward);
    return claim(nk, userId, reward.id);
  }
  Rewards.addNcliam = addNcliam;
  function rewardIndex(id, rewards) {
    var rewardIndex = -1;
    //reverse order for accessing latest rewards
    for (var i = rewards.length - 1; i >= 0; i--) {
      var reward = rewards[i];
      if (reward.id === id && reward.claimed === false) {
        rewardIndex = i;
        break;
      }
    }
    return rewardIndex;
  }
  function claim(nk, userId, rewardId) {
    while (true) {
      try {
        var _a = get(nk, userId),
          rewards = _a.rewards,
          version = _a.version;
        var index = rewardIndex(rewardId, rewards);
        if (index === -1) return { code: Res.Code.notFound };
        var rewardItems = rewards[index].items;
        var wallet = Wallet.update(nk, userId, rewardItems).wallet;
        rewards[index].claimed = true;
        rewards[index].claimTime = Date.now();
        set(nk, userId, rewards, version);
        return { code: Res.Code.success, data: wallet };
      } catch (error) {
        if (error.message.indexOf("version check failed") === -1)
          return { code: Res.Code.error, error: error.message };
      }
    }
  }
  Rewards.claim = claim;
  function getTierByRank(rank, tierConfig) {
    var TierRanking = ["gold", "silver", "bronze", "normal"];
    if (rank > 0) {
      for (
        var _i = 0, TierRanking_1 = TierRanking;
        _i < TierRanking_1.length;
        _i++
      ) {
        var tier = TierRanking_1[_i];
        var tierMaxRank = tierConfig[tier];
        if (!tierMaxRank) break;
        if (rank <= tierMaxRank) {
          return tier;
        }
      }
    }
    return null;
  }
  Rewards.getTierByRank = getTierByRank;
})(Rewards || (Rewards = {}));
var ClaimRewardRPC = function (ctx, logger, nk, payload) {
  var userId = ctx.userId;
  if (!userId) return Res.CalledByServer();
  var rewardId;
  try {
    var input = JSON.parse(payload);
    rewardId = input.id;
  } catch (error) {
    return Res.BadRequest(error);
  }
  var res = Rewards.claim(nk, userId, rewardId);
  if (res.code === Res.Code.notFound) return Res.notFound("reward");
  res.code === Res.Code.success
    ? Res.Success(res.data, "reward claimed")
    : Res.Error(logger, "failed to claim reward", res.error);
};
var VirtualShop;
(function (VirtualShop) {
  VirtualShop.items = [
    {
      id: "Extra Move",
      items: [],
      price: 900,
    },
    {
      id: "Hammer Pack",
      items: [
        {
          id: "Hammer",
          quantity: 3,
        },
      ],
      price: 1200,
    },
    {
      id: "Horizontal Rocket Pack",
      items: [
        {
          id: "HorizontalRocket",
          quantity: 3,
        },
      ],
      price: 1000,
    },
    {
      id: "Vertical Rocket Pack",
      items: [
        {
          id: "VerticalRocket",
          quantity: 3,
        },
      ],
      price: 1200,
    },
    {
      id: "Shuffle Pack",
      items: [
        {
          id: "Shuffle",
          quantity: 3,
        },
      ],
      price: 600,
    },
    {
      id: "Refill Lives",
      items: [
        {
          id: "Heart",
          quantity: 5,
        },
      ],
      price: 900,
    },
  ];
  function init(initializer, nk) {
    nk.storageWrite([
      {
        collection: "Shop",
        key: "Virtual",
        userId: SystemUserId,
        value: { items: VirtualShop.items },
        permissionRead: 2,
        permissionWrite: 0,
      },
    ]);
    initializer.registerRpc("virtualShop/purchase", VirtualPurchaseRPC);
  }
  VirtualShop.init = init;
})(VirtualShop || (VirtualShop = {}));
var VirtualPurchaseRPC = function (ctx, logger, nk, payload) {
  var userId = ctx.userId;
  if (!userId) return Res.CalledByServer();
  var id;
  try {
    id = JSON.parse(payload).id;
  } catch (error) {
    return Res.BadRequest(error);
  }
  var items = VirtualShop.items.filter(function (item) {
    return item.id === id;
  });
  if (items.length < 0) return Res.notFound("item");
  var item = items[0];
  var wallet = Wallet.get(nk, userId).wallet;
  if (item.price > wallet.Coins.quantity)
    return Res.response(
      false,
      Res.Code.notEnoughCoins,
      null,
      "not enough coins"
    );
  try {
    var wallet_1 = Wallet.update(nk, userId, [
      { id: "Coins", quantity: -item.price },
    ]).wallet;
    if (item.items.length > 0) Rewards.addNcliam(nk, userId, item);
    return Res.Success(wallet_1, "successful purchase");
  } catch (error) {
    return Res.Error(logger, "failed to purchase item", error);
  }
};
var Wallet;
(function (Wallet) {
  Wallet.collection = "Economy";
  Wallet.key = "Wallet";
  // const HeartFillInterval = 20 * 60 * 1000; // every 20 minutes
  var HeartFillInterval = 5 * 60 * 1000; // every 5 minute
  var MAX_HEARTS = 5;
  var unlimitables = ["Heart", "TNT", "DiscoBall", "Rocket"];
  Wallet.InitialWallet = {
    Heart: {
      endDate: 0,
      isUnlimited: false,
      quantity: 5,
      next: 0,
    },
    TNT: {
      endDate: 0,
      isUnlimited: false,
      quantity: 3,
    },
    DiscoBall: {
      endDate: 0,
      isUnlimited: false,
      quantity: 3,
    },
    Rocket: {
      endDate: 0,
      isUnlimited: false,
      quantity: 3,
    },
    Hammer: { quantity: 0 },
    Shuffle: { quantity: 0 },
    HorizontalRocket: { quantity: 0 },
    VerticalRocket: { quantity: 0 },
    Coins: { quantity: 1000 },
    Gems: { quantity: 0 },
    Score: { quantity: 0 },
  };
  function updateWallet(wallet, changeset) {
    changeset.map(function (cs) {
      var key = cs.id;
      var item = wallet[key];
      if (cs.time) {
        if (unlimitables.indexOf(key) === -1 || item.endDate === undefined)
          throw new Error("Cannot add duration to non-unlimited items.");
        var endDate = item.isUnlimited ? item.endDate : Date.now();
        wallet[key].endDate = endDate + cs.time * 1000;
        wallet[key].isUnlimited = true;
      }
      if (cs.quantity && cs.quantity !== 0) {
        if (key === "Heart" && item.quantity + cs.quantity > MAX_HEARTS) {
          wallet[key].quantity = MAX_HEARTS;
        } else {
          if (wallet[key].quantity + cs.quantity < 0)
            throw new Error("using more than the quantity");
          wallet[key].quantity += cs.quantity;
        }
      }
    });
    return wallet;
  }
  function get(nk, userId) {
    var data = nk.storageRead([
      { collection: Wallet.collection, key: Wallet.key, userId: userId },
    ]);
    if (data.length < 1)
      throw new Error("failed to get wallet for ".concat(userId));
    var wallet = data[0].value;
    var version = data[0].version;
    return { wallet: wallet, version: version };
  }
  Wallet.get = get;
  function init(nk, userId) {
    set(nk, userId, Wallet.InitialWallet);
  }
  Wallet.init = init;
  function set(nk, userId, wallet, version) {
    try {
      var writeObj = {
        collection: Wallet.collection,
        key: Wallet.key,
        userId: userId,
        value: wallet,
        permissionRead: 1,
        permissionWrite: 0,
      };
      if (version) writeObj.version = version;
      var res = nk.storageWrite([writeObj]);
      var newVersion = res[0].version;
      return newVersion;
    } catch (error) {
      throw new Error(
        "failed to set wallet: wallet: "
          .concat(JSON.stringify(wallet), " error:")
          .concat(error.message)
      );
    }
  }
  function update(nk, userId, changeset) {
    while (true) {
      try {
        var _a = get(nk, userId),
          wallet = _a.wallet,
          version = _a.version;
        var newWallet = updateWallet(wallet, changeset);
        var newVersion = set(nk, userId, newWallet, version);
        return { wallet: newWallet, version: newVersion };
      } catch (error) {
        if (error.message.indexOf("version check failed") === -1)
          throw new Error("failed to update Wallet: ".concat(error.message));
      }
    }
  }
  Wallet.update = update;
  function checkExpired(nk, userId) {
    try {
      var _a = Wallet.get(nk, userId),
        wallet = _a.wallet,
        version = _a.version;
      var hasChanged = false;
      for (var _i = 0, _b = Object.keys(wallet); _i < _b.length; _i++) {
        var key_1 = _b[_i];
        var item = wallet[key_1];
        if (item.isUnlimited && item.endDate) {
          if (Date.now() > item.endDate) {
            item.isUnlimited = false;
            hasChanged = true;
          }
        }
      }
      if (hasChanged) set(nk, userId, wallet, version);
    } catch (error) {
      throw new Error("failed to check expired: ".concat(error.message));
    }
  }
  Wallet.checkExpired = checkExpired;
  function heartFillUp(nk, logger, userId) {
    var _a;
    try {
      while (true) {
        var _b = get(nk, userId),
          wallet = _b.wallet,
          version = _b.version;
        var hearts = wallet.Heart.quantity;
        var nextHeart =
          (_a = wallet.Heart) === null || _a === void 0 ? void 0 : _a.next;
        if (hearts >= MAX_HEARTS) {
          if (nextHeart && nextHeart !== 0) {
            wallet.Heart.next = 0;
            set(nk, userId, wallet, version);
          }
          return;
        }
        if (!nextHeart || nextHeart === 0) {
          logger.debug("Reseting");
          wallet.Heart.next = Date.now() + HeartFillInterval;
          nextHeart = wallet.Heart.next;
          version = set(nk, userId, wallet, version);
        }
        logger.debug(
          "Hearts: "
            .concat(hearts, " next fill up ")
            .concat((nextHeart - Date.now()) / 1000)
        );
        if (Date.now() < nextHeart) return;
        var count = 0;
        while (nextHeart < Date.now()) {
          count++;
          nextHeart += HeartFillInterval;
          if (count + hearts === MAX_HEARTS) {
            nextHeart = 0;
            break;
          }
        }
        var changeSet = [{ id: "Heart", quantity: count }];
        wallet.Heart.next = nextHeart;
        wallet = updateWallet(wallet, changeSet);
        set(nk, userId, wallet, version);
        return;
      }
    } catch (error) {
      if (error.message.indexOf("version check") === -1)
        throw new Error("Heart fillup failed: ".concat(error.message));
    }
  }
  Wallet.heartFillUp = heartFillUp;
})(Wallet || (Wallet = {}));
//disable unlimited items if they are expired
var BeforeGetStorage = function (ctx, logger, nk, data) {
  var _a;
  (_a = data.objectIds) === null || _a === void 0
    ? void 0
    : _a.forEach(function (element) {
        if (
          element.collection === Wallet.collection &&
          element.key === Wallet.key
        ) {
          var userId = element.userId;
          Wallet.heartFillUp(nk, logger, userId);
          Wallet.checkExpired(nk, userId);
        }
      });
  return data;
};
var SystemUserId = "00000000-0000-0000-0000-000000000000";
var Category;
(function (Category) {
  Category[(Category["GLOBAL"] = 0)] = "GLOBAL";
  Category[(Category["WEEKLY"] = 1)] = "WEEKLY";
  Category[(Category["PMC"] = 2)] = "PMC";
  Category[(Category["RUSH"] = 3)] = "RUSH";
  Category[(Category["CUP"] = 4)] = "CUP";
  Category[(Category["FRIENDS"] = 5)] = "FRIENDS";
  Category[(Category["ENDLESS"] = 6)] = "ENDLESS";
})(Category || (Category = {}));
var MAX_SCORE = 1000000;
var leaderboardRewards = {
  Weekly: {
    config: {
      gold: 1,
      silver: 2,
      bronze: 3,
      normal: 10,
    },
    gold: [
      { id: "DiscoBall", quantity: 3 },
      { id: "Heart", quantity: 3 },
    ],
    silver: [
      { id: "DiscoBall", quantity: 2 },
      { id: "Heart", quantity: 2 },
    ],
    bronze: [
      { id: "DiscoBall", quantity: 1 },
      { id: "Heart", quantity: 1 },
    ],
    normal: [{ id: "DiscoBall", quantity: 1 }],
  },
  Rush: {
    joinRewards: {
      id: "Rush Join",
      items: [
        { id: "Heart", time: 900 },
        { id: "DiscoBall", time: 900 },
        { id: "Rocket", time: 900 },
        { id: "TNT", time: 900 },
      ],
    },
    config: {
      gold: 1,
    },
    gold: [
      { id: "DiscoBall", quantity: 3 },
      { id: "Hammer", quantity: 3 },
      { id: "Shuffle", quantity: 3 },
      { id: "Rocket", quantity: 3 },
      { id: "TNT", quantity: 3 },
      { id: "VerticalRocket", quantity: 3 },
      { id: "HorizontalRocket", quantity: 2 },
      { id: "Coins", quantity: 1000 },
      { id: "Heart", time: 10800 },
    ],
  },
  Cup: {
    joinRewards: { id: "Cup Join", items: [{ id: "Heart", time: 900 }] },
    config: {
      gold: 1,
      silver: 2,
      bronze: 3,
      normal: 10,
    },
    gold: [
      { id: "DiscoBall", quantity: 3 },
      { id: "Hammer", quantity: 3 },
      { id: "Shuffle", quantity: 3 },
      { id: "Rocket", quantity: 3 },
      { id: "TNT", quantity: 3 },
      { id: "VerticalRocket", quantity: 3 },
      { id: "HorizontalRocket", quantity: 2 },
      { id: "Coins", quantity: 1000 },
      { id: "Heart", time: 10800 },
    ],
    silver: [
      { id: "DiscoBall", quantity: 3 },
      { id: "Hammer", quantity: 3 },
      { id: "Shuffle", quantity: 3 },
      { id: "Rocket", quantity: 3 },
      { id: "TNT", quantity: 3 },
      { id: "Coins", quantity: 700 },
      { id: "Heart", time: 7200 },
    ],
    bronze: [
      { id: "DiscoBall", quantity: 2 },
      { id: "Rocket", quantity: 2 },
      { id: "TNT", quantity: 2 },
      { id: "Coins", quantity: 500 },
      { id: "Heart", time: 3600 },
    ],
    normal: [
      { id: "DiscoBall", quantity: 1 },
      { id: "TNT", quantity: 1 },
      { id: "Rocket", quantity: 1 },
      { id: "Coins", quantity: 200 },
    ],
  },
  //TODO: Mush change
  Endless: {
    config: { gold: 1 },
    gold: [{ id: "Coins", quantity: 100 }],
  },
};
var Bucket;
(function (Bucket) {
  Bucket.storage = {
    collection: "Buckets",
    keys: {
      latest: "Latest",
      userBucketIds: "IDs",
    },
  };
  Bucket.initializeLeaderboards = function (nk, initializer) {
    for (var _i = 0, _a = Object.keys(Bucket.configs); _i < _a.length; _i++) {
      var id = _a[_i];
      init(nk, Bucket.configs[id]);
    }
    initializer.registerTournamentReset(tournamentReset);
    initializer.registerBeforeJoinTournament(beforeJointournament);
    initializer.registerRpc("leaderboard/getRecords", GetRecordsRPC);
  };
  var init = function (nk, config) {
    nk.tournamentCreate(
      config.tournamentID,
      config.authoritative,
      config.sortOrder,
      config.operator,
      config.duration,
      config.resetSchedule,
      config.metadata,
      config.title,
      config.description,
      config.category,
      config.startTime,
      config.endTime,
      config.maxSize,
      config.maxNumScore,
      config.joinRequired
    );
  };
  Bucket.configs = {
    Weekly: {
      tournamentID: "Weekly",
      authoritative: true,
      category: Category.WEEKLY,
      // duration: 7 * 24 * 60 * 60,
      duration: 15 * 60,
      description: "",
      bucketSize: 10,
      endTime: null,
      joinRequired: true,
      maxNumScore: MAX_SCORE,
      maxSize: 1000000,
      metadata: leaderboardRewards.Weekly,
      operator: "increment" /* nkruntime.Operator.INCREMENTAL */,
      // resetSchedule: "0 0 * * 1",
      resetSchedule: "*/15 * * * *",
      sortOrder: "descending" /* nkruntime.SortOrder.DESCENDING */,
      startTime: 0,
      title: "Weekly Leaderboard",
    },
    Cup: {
      tournamentID: "Cup",
      authoritative: true,
      category: Category.CUP,
      // duration: 3 * 24 * 60 * 60,
      duration: 15 * 60,
      description: "",
      bucketSize: 50,
      endTime: null,
      joinRequired: true,
      maxNumScore: MAX_SCORE,
      maxSize: 100000000,
      metadata: leaderboardRewards.Cup,
      operator: "increment" /* nkruntime.Operator.INCREMENTAL */,
      resetSchedule: "*/15 * * * *",
      // resetSchedule: "0 0 */3 * *",
      sortOrder: "descending" /* nkruntime.SortOrder.DESCENDING */,
      startTime: 0,
      title: "Pepe Cup",
    },
    Rush: {
      tournamentID: "Rush",
      authoritative: true,
      category: Category.RUSH,
      // duration: 12 * 60 * 60,
      duration: 15 * 60,
      description: "",
      bucketSize: 10,
      endTime: null,
      joinRequired: true,
      maxNumScore: MAX_SCORE,
      maxSize: 100000000,
      metadata: leaderboardRewards.Rush,
      operator: "increment" /* nkruntime.Operator.INCREMENTAL */,
      resetSchedule: "*/15 * * * *",
      sortOrder: "descending" /* nkruntime.SortOrder.DESCENDING */,
      startTime: 0,
      title: "Pepe Rush",
    },
    Endless: {
      tournamentID: "Endless",
      authoritative: true,
      category: Category.ENDLESS,
      // duration: 3 * 24 * 60 * 60,
      duration: 10 * 60,
      description: "",
      bucketSize: 50,
      endTime: null,
      joinRequired: true,
      maxNumScore: MAX_SCORE,
      maxSize: 100000000,
      metadata: {},
      operator: "increment" /* nkruntime.Operator.INCREMENTAL */,
      // resetSchedule: "0 0 */3 * *",
      resetSchedule: "*/10 * * * *",
      sortOrder: "descending" /* nkruntime.SortOrder.DESCENDING */,
      startTime: 0,
      title: "Endless Event",
    },
  };
  function getLatestBucketId(nk, leaderBoadrdId) {
    try {
      var collection = leaderBoadrdId;
      var key = Bucket.storage.keys.latest;
      var valueKey = "id";
      var latestBucket = nk.storageRead([
        { collection: collection, key: key, userId: SystemUserId },
      ]);
      var latestVersion = void 0,
        latestId = void 0;
      if (latestBucket.length < 1) {
        latestId = 0;
        latestVersion = setLatestBucketId(nk, leaderBoadrdId, latestId);
      } else {
        latestVersion = latestBucket[0].version;
        latestId = parseInt(latestBucket[0].value[valueKey]);
      }
      return { latestId: latestId, latestVersion: latestVersion };
    } catch (error) {
      throw new Error("failed to getLatestBucketId: ".concat(error.message));
    }
  }
  Bucket.getLatestBucketId = getLatestBucketId;
  function setLatestBucketId(nk, leaderBoadrdId, newId, version) {
    try {
      var collection = leaderBoadrdId;
      var key = Bucket.storage.keys.latest;
      var value = { id: newId };
      var writeObj = {
        collection: collection,
        key: key,
        userId: SystemUserId,
        value: value,
        permissionRead: 2,
        permissionWrite: 0,
      };
      if (version) writeObj.version = version;
      var res = nk.storageWrite([writeObj]);
      return res[0].version;
    } catch (error) {
      throw new Error("failed to setLatestBucketId: ".concat(error.message));
    }
  }
  Bucket.setLatestBucketId = setLatestBucketId;
  function getBucketById(nk, leaderboard, id) {
    var collection = Bucket.storage.collection;
    var key = "".concat(leaderboard, "#").concat(id);
    try {
      var res = nk.storageRead([
        { collection: collection, key: key, userId: SystemUserId },
      ]);
      if (res.length < 1)
        throw new Error("Bucket ".concat(key, " doesn't exists"));
      var version = res[0].version;
      var bucket = res[0].value;
      return { bucket: bucket, version: version };
    } catch (error) {
      throw new Error(
        "failed to getBucketById: key:"
          .concat(key, " collection:")
          .concat(collection, " error: ")
          .concat(error.message)
      );
    }
  }
  Bucket.getBucketById = getBucketById;
  function createNewBucket(
    nk,
    logger,
    leaderBoadrdId,
    id,
    latestBucketVersion
  ) {
    var _a, _b;
    var key = "".concat(leaderBoadrdId, "#").concat(id);
    try {
      var latestVersion = setLatestBucketId(
        nk,
        leaderBoadrdId,
        id,
        latestBucketVersion
      );
      var tournamentInfo = nk.tournamentsGetId([leaderBoadrdId])[0];
      var resetTimeUnix =
        (_b =
          (_a = tournamentInfo.endActive) !== null && _a !== void 0
            ? _a
            : tournamentInfo.endTime) !== null && _b !== void 0
          ? _b
          : 0;
      var bucket = {
        userIds: [],
        resetTimeUnix: resetTimeUnix,
      };
      var res = nk.storageWrite([
        {
          collection: Bucket.storage.collection,
          key: key,
          userId: SystemUserId,
          value: bucket,
          version: "*",
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
      var version = res[0].version;
      logger.debug(
        "created new bucket: ".concat(leaderBoadrdId, "#").concat(id)
      );
      return { bucket: bucket, version: version, latestVersion: latestVersion };
    } catch (error) {
      throw new Error(
        "failed to createNewBucket with id "
          .concat(key, ": ")
          .concat(error.message)
      );
    }
  }
  Bucket.createNewBucket = createNewBucket;
  function addUserToBucket(nk, leaderBoadrdId, bucketId, version, bucket) {
    try {
      var collection = Bucket.storage.collection;
      var key = "".concat(leaderBoadrdId, "#").concat(bucketId);
      nk.storageWrite([
        {
          collection: collection,
          key: key,
          version: version,
          userId: SystemUserId,
          value: bucket,
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
    } catch (error) {
      throw new Error("failed to addUserToBucket: ".concat(error.message));
    }
  }
  Bucket.addUserToBucket = addUserToBucket;
  function setUserBucket(nk, userId, leaderBoadrdId, id) {
    try {
      nk.storageWrite([
        {
          collection: Bucket.storage.collection,
          key: leaderBoadrdId,
          userId: userId,
          value: { id: id },
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
    } catch (error) {
      throw new Error("failed to setUserBucket: ".concat(error.message));
    }
  }
  Bucket.setUserBucket = setUserBucket;
  function getUserBucketId(nk, leaderBoadrdId, userId) {
    var collection = Bucket.storage.collection;
    var userBucket = nk.storageRead([
      { collection: collection, key: leaderBoadrdId, userId: userId },
    ]);
    if (userBucket.length < 1) return null;
    var id = userBucket[0].value.id;
    return id;
  }
  Bucket.getUserBucketId = getUserBucketId;
  function getUserBucket(nk, config, userId) {
    try {
      var leaderBoadrdId = config.tournamentID;
      var userBucketId = getUserBucketId(nk, leaderBoadrdId, userId);
      if (!userBucketId) return null;
      var bucket = Bucket.getBucketById(
        nk,
        leaderBoadrdId,
        userBucketId
      ).bucket;
      return bucket;
    } catch (error) {
      throw new Error("failed to getUserBucket: ".concat(error.message));
    }
  }
  Bucket.getUserBucket = getUserBucket;
  function joinLeaderboard(nk, logger, ctx, config) {
    var userId = ctx.userId;
    var leaderBoadrdId = config.tournamentID;
    var userBucket = getUserBucket(nk, config, userId);
    if (userBucket) {
      throw new Error(
        "User Has already joined ".concat(leaderBoadrdId, " leaderboard")
      );
    }
    var attempts = 0;
    //get last bucket
    while (true) {
      try {
        var latestRes = Bucket.getLatestBucketId(nk, leaderBoadrdId);
        var latestId = latestRes.latestId,
          latestVersion = latestRes.latestVersion;
        if (latestId === 0) {
          var data = Bucket.createNewBucket(
            nk,
            logger,
            leaderBoadrdId,
            ++latestId,
            latestVersion
          );
          latestVersion = data.latestVersion;
        }
        var _a = Bucket.getBucketById(nk, leaderBoadrdId, latestId),
          bucket = _a.bucket,
          version = _a.version;
        // if full create new bucket
        if (bucket.userIds.length >= config.bucketSize) {
          var data = Bucket.createNewBucket(
            nk,
            logger,
            leaderBoadrdId,
            ++latestId,
            latestVersion
          );
          version = data.version;
          latestVersion = data.latestVersion;
          bucket = data.bucket;
        }
        //if not full add user to it
        bucket.userIds.push(userId);
        Bucket.addUserToBucket(nk, leaderBoadrdId, latestId, version, bucket);
        Bucket.setUserBucket(nk, userId, leaderBoadrdId, latestId);
        var rewards = leaderboardRewards[leaderBoadrdId].joinRewards;
        if (rewards) Rewards.addNcliam(nk, userId, rewards);
        return;
      } catch (error) {
        if (attempts > 100) throw error;
        attempts++;
      }
    }
  }
  Bucket.joinLeaderboard = joinLeaderboard;
  function getBucketRecords(nk, bucket, config, time) {
    try {
      var tournament = nk.tournamentRecordsList(
        config.tournamentID,
        bucket.userIds,
        config.bucketSize,
        undefined,
        time
      );
      return tournament.ownerRecords;
    } catch (error) {
      throw new Error("failed to getRecords: ".concat(error.message));
    }
  }
  Bucket.getBucketRecords = getBucketRecords;
  function getBucketRecordsRpc(ctx, nk, config) {
    var userId = ctx.userId;
    if (!userId) return Res.CalledByServer();
    //get user bucket
    var bucket = Bucket.getUserBucket(nk, config, userId);
    //if not exists
    if (!bucket)
      return Res.response(
        false,
        Res.Code.dosentExist,
        null,
        "user does not exist in this leaderboard"
      );
    var records = getBucketRecords(nk, bucket, config);
    return Res.Success(records);
  }
  Bucket.getBucketRecordsRpc = getBucketRecordsRpc;
  function deleteUserBuckets(nk, logger, tournament) {
    try {
      var config_1 = Bucket.configs[tournament.id];
      var bucketCollection_1 = Bucket.storage.collection;
      var batchSize = 100;
      var leaderBoadrdId_1 = tournament.id;
      var cursur = void 0;
      var userObjToDelete_1 = [];
      var notifications_1 = [];
      do {
        var userBuckets = nk.storageList(
          undefined,
          bucketCollection_1,
          batchSize,
          cursur
        );
        if (
          !userBuckets.objects ||
          (userBuckets === null || userBuckets === void 0
            ? void 0
            : userBuckets.objects.length) < 1
        )
          return;
        var leaderboardBuckets = userBuckets.objects.filter(function (o) {
          return o.key === leaderBoadrdId_1;
        });
        leaderboardBuckets.map(function (b) {
          var userId = b.userId;
          if (userId === SystemUserId) return;
          var obj = {
            collection: bucketCollection_1,
            key: leaderBoadrdId_1,
            userId: userId,
          };
          if (b.value && b.value.id) {
            var bucketId = b.value.id;
            var bucket = Bucket.getBucketById(
              nk,
              leaderBoadrdId_1,
              bucketId
            ).bucket;
            var records = Bucket.getBucketRecords(
              nk,
              bucket,
              config_1,
              tournament.endActive
            );
            var reward = undefined;
            var userRecord =
              records === null || records === void 0
                ? void 0
                : records.filter(function (r) {
                    return r.ownerId === userId;
                  });
            if (userRecord && userRecord.length > 0) {
              var rank = userRecord[0].rank;
              var rewardsConfig = leaderboardRewards[leaderBoadrdId_1].config;
              var tier = Rewards.getTierByRank(rank, rewardsConfig);
              if (tier) {
                var rewardItems = leaderboardRewards[leaderBoadrdId_1][tier];
                if (rewardItems) {
                  reward = {
                    id: tournament.id,
                    items: rewardItems,
                  };
                  Rewards.add(nk, userId, reward);
                }
              }
            }
            var notif = {
              userId: userId,
              subject: "Leaderboard End",
              content: {
                id: tournament.id,
                records: records,
                reward: reward,
              },
              code: 1,
              senderId: SystemUserId,
              persistent: true,
            };
            notifications_1.push(notif);
            userObjToDelete_1.push(obj);
          }
        });
        nk.notificationsSend(notifications_1);
        nk.storageDelete(userObjToDelete_1);
        cursur = userBuckets.cursor;
      } while (cursur);
    } catch (error) {
      logger.error("failed to delete userBuckets: ".concat(error.message));
    }
  }
  Bucket.deleteUserBuckets = deleteUserBuckets;
  function deleteBuckets(nk, logger, leaderBoardId) {
    var _a;
    try {
      var storageIds = nk.storageList(
        SystemUserId,
        Bucket.storage.collection,
        1000
      );
      var bucketsToDelete =
        (_a = storageIds.objects) === null || _a === void 0
          ? void 0
          : _a.filter(function (bucket) {
              return bucket.key.indexOf(leaderBoardId) !== -1;
            });
      if (bucketsToDelete && bucketsToDelete.length > 0) {
        var deleteRequests = bucketsToDelete.map(function (bucket) {
          return {
            collection: bucket.collection,
            key: bucket.key,
            userId: SystemUserId,
          };
        });
        nk.storageDelete(deleteRequests);
      }
    } catch (error) {
      logger.error("failed to delete buckets: ".concat(error.message));
    }
  }
  Bucket.deleteBuckets = deleteBuckets;
})(Bucket || (Bucket = {}));
var GetRecordsRPC = function (ctx, logger, nk, payload) {
  if (!ctx.userId) return Res.CalledByServer();
  var id;
  try {
    var input = JSON.parse(payload);
    id = input.id;
  } catch (error) {
    return Res.BadRequest(error);
  }
  try {
    var config = Bucket.configs[id];
    return Bucket.getBucketRecordsRpc(ctx, nk, config);
  } catch (error) {
    return Res.Error(logger, "failed to get records", error);
  }
};
// Before Join Leaderboards Hooks
var beforeJointournament = function (ctx, logger, nk, data) {
  var tournamentId = data.tournamentId;
  if (!tournamentId) throw new Error("Invalid tournament id");
  var config = Bucket.configs[tournamentId];
  Bucket.joinLeaderboard(nk, logger, ctx, config);
  return data;
};
var tournamentReset = function (ctx, logger, nk, tournament, end, reset) {
  Bucket.deleteUserBuckets(nk, logger, tournament);
  Bucket.deleteBuckets(nk, logger, tournament.id);
  Bucket.setLatestBucketId(nk, tournament.id, 0);
};
var Leaderboards;
(function (Leaderboards) {
  Leaderboards.configs = {
    global: {
      leaderboardID: "Global",
      authoritative: true,
      sortOrder: "descending" /* nkruntime.SortOrder.DESCENDING */,
      operator: "increment" /* nkruntime.Operator.INCREMENTAL */,
      resetSchedule: null,
    },
    PMC: {
      leaderboardID: "PMC",
      authoritative: true,
      sortOrder: "descending" /* nkruntime.SortOrder.DESCENDING */,
      operator: "set" /* nkruntime.Operator.SET */,
      resetSchedule: "0 0 * * 1", // Every Monday at 00:00
    },
  };
  var Leaderboard = /** @class */ (function () {
    function Leaderboard(config) {
      this.config = config;
    }
    Leaderboard.prototype.initialize = function (nk, logger) {
      try {
        nk.leaderboardCreate(
          this.config.leaderboardID,
          this.config.authoritative,
          this.config.sortOrder,
          this.config.operator,
          this.config.resetSchedule,
          this.config.metadata
        );
        logger.info(
          "".concat(this.config.leaderboardID, " leaderboard created")
        );
      } catch (error) {
        logger.error(
          "failed to create ".concat(this.config.leaderboardID, " leaderboard")
        );
      }
    };
    return Leaderboard;
  })();
  Leaderboards.Leaderboard = Leaderboard;
  Leaderboards.initalizeLeaderboards = function (nk, logger) {
    for (
      var _i = 0, _a = Object.keys(Leaderboards.configs);
      _i < _a.length;
      _i++
    ) {
      var key = _a[_i];
      var conf = Leaderboards.configs[key];
      new Leaderboard(conf).initialize(nk, logger);
    }
  };
  var updateGlobal = function (nk, userId, username, score, subScore) {
    try {
      var leaderboard = Leaderboards.configs.global;
      nk.leaderboardRecordWrite(
        leaderboard.leaderboardID,
        userId,
        username,
        score,
        subScore
      );
    } catch (error) {
      throw new Error(
        "failed to update global Leaderboard: ".concat(error.message)
      );
    }
  };
  function updateBattlePass(nk, userId, keys) {
    BattlePass.addKeys(nk, userId, keys);
  }
  Leaderboards.updateBattlePass = updateBattlePass;
  Leaderboards.UpdateLeaderboards = function (nk, userId, username, levelLog) {
    var levelNumber = levelLog.levelNumber;
    //calculate leaderboard score
    var rushScore = levelLog.atEnd.discoBallTargettedTiles || 0;
    var levelDifficulty = Levels.difficulty[levelNumber] || 0;
    updateGlobal(nk, userId, username, 1);
    updateBattlePass(nk, userId, levelDifficulty);
    Object.keys(Bucket.configs).map(function (tournamentId) {
      try {
        switch (tournamentId) {
          case "Rush":
            nk.tournamentRecordWrite(tournamentId, userId, username, rushScore);
            break;
          case "Weekly":
            nk.tournamentRecordWrite(tournamentId, userId, username, 1);
            break;
          default:
            nk.tournamentRecordWrite(
              tournamentId,
              userId,
              username,
              levelDifficulty
            );
            break;
        }
      } catch (error) {}
    });
  };
})(Leaderboards || (Leaderboards = {}));
var Res;
(function (Res) {
  var Code;
  (function (Code) {
    Code[(Code["success"] = 0)] = "success";
    Code[(Code["error"] = 1)] = "error";
    Code[(Code["notFound"] = 2)] = "notFound";
    Code[(Code["dosentExist"] = 3)] = "dosentExist";
    Code[(Code["badRequest"] = 4)] = "badRequest";
    Code[(Code["serverInternalError"] = 5)] = "serverInternalError";
    Code[(Code["calledByServer"] = 6)] = "calledByServer";
    Code[(Code["calledByClient"] = 7)] = "calledByClient";
    Code[(Code["notEnoughCoins"] = 8)] = "notEnoughCoins";
    Code[(Code["cheatDetected"] = 9)] = "cheatDetected";
  })((Code = Res.Code || (Res.Code = {})));
  function response(success, code, data, message, error) {
    var res = {
      success: success,
      code: code,
      data: data,
      message: message,
      error: error === null || error === void 0 ? void 0 : error.message,
    };
    return JSON.stringify(res);
  }
  Res.response = response;
  function Success(data, message) {
    return response(true, Res.Code.success, data, message);
  }
  Res.Success = Success;
  function BadRequest(error) {
    return response(
      false,
      Code.badRequest,
      undefined,
      "invalid request body",
      error
    );
  }
  Res.BadRequest = BadRequest;
  function CalledByServer() {
    return response(
      false,
      Code.calledByServer,
      undefined,
      "called by a server"
    );
  }
  Res.CalledByServer = CalledByServer;
  function Error(logger, message, error) {
    logger.error("".concat(message, ": ").concat(error.message));
    return response(false, Code.error, undefined, message, error);
  }
  Res.Error = Error;
  function notFound(name) {
    return response(
      false,
      Code.serverInternalError,
      undefined,
      "".concat(name, " not found")
    );
  }
  Res.notFound = notFound;
})(Res || (Res = {}));
var StorageIndex;
(function (StorageIndex) {
  var MAX_ENTRIES = 1000000000;
  var configs = {
    cryptoWallet: {
      name: "crypto-wallet",
      collection: "Crypto",
      storageKey: "Wallet",
      fields: ["address"],
      maxEntries: MAX_ENTRIES,
    },
  };
  function registerIndexes(initializer) {
    for (var key in configs) {
      var config = configs[key];
      var collection = config.collection,
        fields = config.fields,
        maxEntries = config.maxEntries,
        name_1 = config.name,
        storageKey = config.storageKey;
      initializer.registerStorageIndex(
        name_1,
        collection,
        storageKey,
        fields,
        maxEntries
      );
    }
  }
  StorageIndex.registerIndexes = registerIndexes;
})(StorageIndex || (StorageIndex = {}));
var initialCrypto = {
  address: null,
  balance: null,
};
var InitiateUser = function (ctx, logger, nk, data, request) {
  try {
    if (!data.created) return;
    Wallet.init(nk, ctx.userId);
    nk.storageWrite([
      {
        collection: "Crypto",
        key: "Wallet",
        value: initialCrypto,
        userId: ctx.userId,
        permissionRead: 1,
        permissionWrite: 0,
      },
    ]);
    GameApi.LastLevel.set(nk, ctx.userId, 0);
    logger.info("New User Joined: ".concat(ctx.userId));
  } catch (error) {
    throw new Error("Failed to initiate user. cause: ".concat(error.message));
  }
};
var WalletIndex;
(function (WalletIndex) {
  var queryMaker = function (address) {
    return "+address:".concat(address);
  };
  WalletIndex.get = function (nk, address) {
    try {
      var query = queryMaker(address);
      var res = nk.storageIndexList("crypto-wallet", query, 1);
      return res.length > 0 ? res[0] : null;
    } catch (error) {
      throw new Error(
        "failed to check wallet address existance: ".concat(error.message)
      );
    }
  };
})(WalletIndex || (WalletIndex = {}));
var WalletConnect = function (ctx, logger, nk, payload) {
  var userId = ctx.userId;
  if (!userId) return Res.CalledByServer();
  var data;
  try {
    data = JSON.parse(payload);
    if (!data || !data.address) throw Error();
  } catch (error) {
    return Res.BadRequest(error);
  }
  var address = data.address;
  try {
    nk.storageWrite([
      {
        collection: "Crypto",
        key: "Wallet",
        userId: userId,
        value: { address: address, balance: 0 },
        permissionRead: 2,
        permissionWrite: 0,
      },
    ]);
    return Res.Success(undefined, "wallet has been connected");
  } catch (error) {
    return Res.Error(logger, "Error While Connecting Wallet", error);
  }
};
var _a, _b, _c, _d;
var GameApi = {
  LastLevel:
    ((_a = /** @class */ (function () {
      function class_1() {}
      class_1.get = function (nk, userId) {
        try {
          var storageObjects = nk.storageRead([
            {
              collection: this.Keys.collection,
              key: this.Keys.key,
              userId: userId,
            },
          ]);
          var lastLevel = storageObjects[0].value[this.id];
          return lastLevel;
        } catch (error) {
          throw new Error("failed to get Last level: " + error.message);
        }
      };
      class_1.set = function (nk, userId, newValue) {
        var _a;
        try {
          var value = ((_a = {}), (_a[this.id] = newValue), _a);
          nk.storageWrite([
            {
              collection: this.Keys.collection,
              key: this.Keys.key,
              userId: userId,
              value: value,
            },
          ]);
        } catch (error) {
          throw new Error("failed to set Last level: " + error.message);
        }
      };
      class_1.increment = function (nk, userId) {
        var lastLevel = GameApi.LastLevel.get(nk, userId);
        GameApi.LastLevel.set(nk, userId, lastLevel + 1);
      };
      return class_1;
    })()),
    __setFunctionName(_a, "LastLevel"),
    (_a.Keys = {
      collection: "Levels",
      key: "Data",
    }),
    (_a.id = "progress"),
    _a),
  LevelLog:
    ((_b = /** @class */ (function () {
      function class_2() {}
      class_2.save = function (nk, userId, data) {
        try {
          nk.storageWrite([
            {
              collection: this.Keys.collection,
              key: (data.levelNumber || -1).toString(),
              userId: userId,
              value: data,
              permissionRead: 2,
              permissionWrite: 0,
            },
          ]);
        } catch (error) {
          throw new Error("failed to save LevelLog: ".concat(error.message));
        }
      };
      class_2.get = function (nk, userId, levelNumber) {
        var data = nk.storageRead([
          {
            collection: this.Keys.collection,
            key: levelNumber,
            userId: userId,
          },
        ]);
        return data;
      };
      return class_2;
    })()),
    __setFunctionName(_b, "LevelLog"),
    (_b.Keys = {
      collection: "Levels",
    }),
    _b),
  Cheat:
    ((_c = /** @class */ (function () {
      function class_3() {}
      class_3.write = function (nk, levelNumber, userId, cheats) {
        try {
          nk.storageWrite([
            {
              collection: this.Keys.collection,
              key: (levelNumber || -2).toString(),
              userId: userId,
              value: { cheats: cheats },
              permissionRead: 2,
              permissionWrite: 0,
            },
          ]);
        } catch (error) {
          throw new Error("failed to save Cheats: ".concat(error.message));
        }
      };
      return class_3;
    })()),
    __setFunctionName(_c, "Cheat"),
    (_c.Keys = {
      collection: "Cheats",
    }),
    _c),
  Crypto:
    ((_d = /** @class */ (function () {
      function class_4() {}
      return class_4;
    })()),
    __setFunctionName(_d, "Crypto"),
    (_d.Keys = {
      collection: "Crypto",
      key: "Wallet",
    }),
    _d),
};
var SHOP_ITEMS = [
  {
    id: "ADMIRAL_RESOURCES",
    name: "AdmiralResources",
    type: "SpecialOffer",
    items: [
      { id: "Hammer", quantity: 10 },
      { id: "Shuffle", quantity: 10 },
      { id: "VerticalRocket", quantity: 10 },
      { id: "HorizontalRocket", quantity: 10 },
      { id: "Heart", time: 64800, quantity: 0, isUnlimited: true },
      { id: "Rocket", time: 259200, quantity: 0, isUnlimited: true },
      { id: "DiscoBall", time: 259200, quantity: 0, isUnlimited: true },
      { id: "TNT", time: 259200, quantity: 0, isUnlimited: true },
      { id: "Coins", quantity: 50000 },
    ],
    price: 99.99,
  },
  {
    id: "ASTRONAUT_RESOURCES",
    name: "AstronautResources",
    type: "SpecialOffer",
    items: [
      { id: "Hammer", quantity: 2 },
      { id: "Shuffle", quantity: 2 },
      { id: "VerticalRocket", quantity: 2 },
      { id: "HorizontalRocket", quantity: 2 },
      { id: "Heart", time: 3600, quantity: 0, isUnlimited: true },
      { id: "Rocket", time: 3600, quantity: 0, isUnlimited: true },
      { id: "DiscoBall", time: 3600, quantity: 0, isUnlimited: true },
      { id: "TNT", time: 3600, quantity: 0, isUnlimited: true },
      { id: "Coins", quantity: 5000 },
    ],
    price: 9.99,
  },
  {
    id: "CAPTAIN_RESOURCES",
    name: "CaptainResources",
    type: "SpecialOffer",
    items: [
      { id: "Hammer", quantity: 4 },
      { id: "Shuffle", quantity: 4 },
      { id: "VerticalRocket", quantity: 4 },
      { id: "HorizontalRocket", quantity: 4 },
      { id: "Heart", time: 7200, quantity: 0, isUnlimited: true },
      { id: "Rocket", time: 43200, quantity: 0, isUnlimited: true },
      { id: "DiscoBall", time: 43200, quantity: 0, isUnlimited: true },
      { id: "TNT", time: 43200, quantity: 0, isUnlimited: true },
      { id: "Coins", quantity: 10000 },
    ],
    price: 22.99,
  },
  {
    id: "COMMANDER_RESOURCES",
    name: "CommanderResources",
    type: "SpecialOffer",
    items: [
      { id: "Hammer", quantity: 6 },
      { id: "Shuffle", quantity: 6 },
      { id: "VerticalRocket", quantity: 6 },
      { id: "HorizontalRocket", quantity: 6 },
      { id: "Heart", time: 21600, quantity: 0, isUnlimited: true },
      { id: "Rocket", time: 64800, quantity: 0, isUnlimited: true },
      { id: "DiscoBall", time: 64800, quantity: 0, isUnlimited: true },
      { id: "TNT", time: 64800, quantity: 0, isUnlimited: true },
      { id: "Coins", quantity: 10000 },
    ],
    price: 44.99,
  },
  {
    id: "ELDER_RESOURCES",
    name: "ElderResources",
    type: "SpecialOffer",
    items: [
      { id: "Hammer", quantity: 15 },
      { id: "Shuffle", quantity: 15 },
      { id: "VerticalRocket", quantity: 15 },
      { id: "HorizontalRocket", quantity: 15 },
      { id: "Heart", time: 86400, quantity: 0, isUnlimited: true },
      { id: "Rocket", time: 36000, quantity: 0, isUnlimited: true },
      { id: "DiscoBall", time: 36000, quantity: 0, isUnlimited: true },
      { id: "TNT", time: 36000, quantity: 0, isUnlimited: true },
      { id: "Coins", quantity: 65000 },
    ],
    price: 110.99,
  },
  {
    id: "SPECIAL_OFFER",
    name: "SpecialOffer",
    type: "SpecialOffer",
    items: [
      { id: "Hammer", quantity: 1 },
      { id: "Shuffle", quantity: 1 },
      { id: "VerticalRocket", quantity: 1 },
      { id: "HorizontalRocket", quantity: 1 },
      { id: "Heart", time: 3600, quantity: 0, isUnlimited: true },
      { id: "Rocket", time: 3600, quantity: 0, isUnlimited: true },
      { id: "DiscoBall", time: 3600, quantity: 0, isUnlimited: true },
      { id: "TNT", time: 3600, quantity: 0, isUnlimited: true },
      { id: "Coins", quantity: 5000 },
    ],
    price: 1.99,
  },
  {
    id: "VICE_ADMIRAL_RESOURCES",
    name: "ViceAdmiralResources",
    type: "SpecialOffer",
    items: [
      { id: "Hammer", quantity: 8 },
      { id: "Shuffle", quantity: 8 },
      { id: "VerticalRocket", quantity: 8 },
      { id: "HorizontalRocket", quantity: 8 },
      { id: "Heart", time: 43200, quantity: 0, isUnlimited: true },
      { id: "Rocket", time: 86400, quantity: 0, isUnlimited: true },
      { id: "DiscoBall", time: 86400, quantity: 0, isUnlimited: true },
      { id: "TNT", time: 86400, quantity: 0, isUnlimited: true },
      { id: "Coins", quantity: 25000 },
    ],
    price: 89.99,
  },
  {
    id: "CURRENCY_PACK_01",
    name: "Currencypack01",
    type: "Coin",
    items: [{ id: "Coins", quantity: 1000 }],
    price: 1.99,
  },
  {
    id: "CURRENCY_PACK_02",
    name: "Currencypack02",
    type: "Coin",
    items: [{ id: "Coins", quantity: 5000 }],
    price: 8.99,
  },
  {
    id: "CURRENCY_PACK_03",
    name: "Currencypack03",
    type: "Coin",
    items: [{ id: "Coins", quantity: 10000 }],
    price: 17.99,
  },
  {
    id: "CURRENCY_PACK_04",
    name: "Currencypack04",
    type: "Coin",
    items: [{ id: "Coins", quantity: 25000 }],
    price: 34.99,
  },
  {
    id: "CURRENCY_PACK_05",
    name: "Currencypack05",
    type: "Coin",
    items: [{ id: "Coins", quantity: 50000 }],
    price: 59.99,
  },
  {
    id: "CURRENCY_PACK_06",
    name: "Currencypack06",
    type: "Coin",
    items: [{ id: "Coins", quantity: 100000 }],
    price: 99.99,
  },
];
var initShop = function (nk) {
  try {
    nk.storageWrite([
      {
        collection: "Shop",
        key: "RealMoney",
        userId: SystemUserId,
        value: { items: SHOP_ITEMS },
        permissionRead: 2,
        permissionWrite: 0,
      },
    ]);
  } catch (error) {}
};
var LevelValidation;
(function (LevelValidation) {
  LevelValidation.PowerUps = [
    { name: "Hammer", index: 0 },
    { name: "VerticalRocket", index: 1 },
    { name: "Shuffle", index: 2 },
    { name: "HorizontalRocket", index: 3 },
  ];
  LevelValidation.Boosters = [
    { name: "TNT", index: 0 },
    { name: "DiscoBall", index: 1 },
    { name: "Rocket", index: 2 },
  ];
  var Validator = /** @class */ (function () {
    function Validator() {}
    Validator.prototype.cheatCheck = function (levelLog, initialValues) {
      try {
        var atStart = levelLog.atStart,
          atEnd = levelLog.atEnd;
        var detectedCheats = __spreadArray(
          __spreadArray(
            __spreadArray(
              __spreadArray(
                __spreadArray([], this.checkHearts(initialValues.heart), true),
                this.checkBoosters(
                  initialValues.boostersCount,
                  atStart.selectedBoosters
                ),
                true
              ),
              this.checkMoves(
                atEnd.totalMoves,
                atEnd.levelMaxMoves,
                atEnd.purchasedMovesCount
              ),
              true
            ),
            this.checkPowerUps(initialValues.powerUpsCount, atEnd.usedItems),
            true
          ),
          this.checkAbilityUsage(
            atEnd.targetAbilityblocksPoped,
            atEnd.abilitUsedTimes
          ),
          true
        );
        return detectedCheats;
      } catch (error) {
        throw new Error("Cheat Check Error: ".concat(error.message));
      }
    };
    Validator.prototype.checkHearts = function (heartCount) {
      if (heartCount === 0) return ["Started level with no heart!"];
      else if (heartCount < -1 || heartCount > 5)
        return ["Invalid Heart Count: Hearts = ".concat(heartCount)];
      else return [];
    };
    Validator.prototype.checkBoosters = function (
      startCounts,
      selectedBoosters
    ) {
      var detectedCheats = [];
      for (
        var _i = 0, Boosters_1 = LevelValidation.Boosters;
        _i < Boosters_1.length;
        _i++
      ) {
        var booster = Boosters_1[_i];
        var name_2 = booster.name,
          index = booster.index;
        var startCount = startCounts[index];
        if (selectedBoosters.indexOf(name_2) !== -1 && startCount === 0)
          detectedCheats.push(
            "Used a Booster Without Having it: ".concat(name_2)
          );
      }
      return detectedCheats;
    };
    Validator.prototype.checkMoves = function (
      totalMoves,
      levelMaxMoves,
      purchasedMovesCount
    ) {
      if (levelMaxMoves === -1) return []; // time based level
      return totalMoves > levelMaxMoves + purchasedMovesCount
        ? [
            "Invalid Extra Moves: totalMoves("
              .concat(totalMoves, ") > levelMaxMoves(")
              .concat(levelMaxMoves, ") + purchasedMovesCount(")
              .concat(purchasedMovesCount, ")"),
          ]
        : [];
    };
    Validator.checkLevel = function (levelNumber, lastLevel) {
      if (levelNumber > lastLevel + 1) {
        return [
          "level skip detected: lastLevel:"
            .concat(lastLevel, "  current:")
            .concat(levelNumber),
        ];
      }
      return [];
    };
    Validator.prototype.checkCoins = function (
      startCoins,
      purchasedMovesCoins,
      purchasedPowerUps
    ) {
      var purchasedPowerUpsPrice =
        Math.floor(
          purchasedPowerUps.reduce(function (acc, curr) {
            return acc + curr;
          }, 0) / 3
        ) * 600;
      return startCoins < purchasedMovesCoins + purchasedPowerUpsPrice
        ? [
            "Invalid Coin Count! start("
              .concat(startCoins, ") < purchasedMoves(")
              .concat(purchasedMovesCoins, ") + purchasedPowerUps(")
              .concat(purchasedPowerUpsPrice, ")"),
          ]
        : [];
    };
    Validator.prototype.checkPowerUps = function (
      startPowerUpsCount,
      usedItems
    ) {
      var detectedCheats = [];
      for (
        var _i = 0, PowerUps_1 = LevelValidation.PowerUps;
        _i < PowerUps_1.length;
        _i++
      ) {
        var powerUp = PowerUps_1[_i];
        var name_3 = powerUp.name,
          index = powerUp.index;
        var before = startPowerUpsCount[index];
        var used = usedItems[index];
        if (before < used) {
          detectedCheats.push(
            "".concat(name_3, " before:").concat(before, " used:").concat(used)
          );
        }
      }
      return detectedCheats.length > 0
        ? ["Cheat in PowerUps: " + detectedCheats.join(", ")]
        : [];
    };
    Validator.prototype.checkAbilityUsage = function (
      targetAbilityblocksPoped,
      abilitUsedTimes
    ) {
      return abilitUsedTimes > targetAbilityblocksPoped / 10
        ? [
            "Used ability more than allowed count: allowed: "
              .concat(Math.floor(targetAbilityblocksPoped / 10), " used: ")
              .concat(abilitUsedTimes),
          ]
        : [];
    };
    return Validator;
  })();
  LevelValidation.Validator = Validator;
  function extractData(log, initialValues) {
    try {
      var boosters = LevelValidation.Boosters.reduce(function (acc, curr) {
        var selected = log.atStart.selectedBoosters.indexOf(curr.name);
        var initCount = initialValues.boostersCount[curr.index];
        var result = selected !== -1 ? -1 : 0;
        if (initCount > 0 && result !== 0) {
          acc.push({
            id: curr.name,
            quantity: result,
          });
        }
        return acc;
      }, []);
      var powerUps = LevelValidation.PowerUps.reduce(function (acc, curr) {
        var usedCount = log.atEnd.usedItems[curr.index];
        var initCount = initialValues.powerUpsCount[curr.index];
        var result = initCount - (initCount + usedCount);
        if (result !== 0) {
          acc.push({
            id: LevelValidation.PowerUps[curr.index].name,
            quantity: result,
          });
        }
        return acc;
      }, []);
      var coins = {
        id: "Coins",
        quantity: log.atEnd.coinsRewarded,
      };
      var heartCount =
        log.atEnd.result !== "win" && initialValues.heart > 0 ? -1 : 0;
      var hearts = {
        id: "Heart",
        quantity: heartCount,
      };
      var result = __spreadArray(
        __spreadArray(__spreadArray([], boosters, true), powerUps, true),
        [coins, hearts],
        false
      );
      return result;
    } catch (error) {
      throw new Error(
        "Error while extracting data from log: ".concat(error.message)
      );
    }
  }
  LevelValidation.extractData = extractData;
  LevelValidation.initialValues = function (nk, userId) {
    var wallet = Wallet.get(nk, userId).wallet;
    var boostersCount = [
      wallet.TNT.isUnlimited ? -1 : wallet.TNT.quantity,
      wallet.DiscoBall.isUnlimited ? -1 : wallet.DiscoBall.quantity,
      wallet.Rocket.isUnlimited ? -1 : wallet.Rocket.quantity,
    ];
    var powerUpsCount = [
      wallet.Hammer.quantity,
      wallet.VerticalRocket.quantity,
      wallet.Shuffle.quantity,
      wallet.HorizontalRocket.quantity,
    ];
    return {
      boostersCount: boostersCount,
      coins: wallet.Coins.quantity,
      powerUpsCount: powerUpsCount,
      heart: wallet.Heart.isUnlimited ? -1 : wallet.Heart.quantity,
    };
  };
})(LevelValidation || (LevelValidation = {}));
var levelValidatorRPC = function (ctx, logger, nk, payload) {
  try {
    var userId = ctx.userId;
    if (!userId) return Res.CalledByServer();
    var initalValues = LevelValidation.initialValues(nk, userId);
    var levelLog = void 0;
    levelLog = JSON.parse(payload);
    if (!levelLog) return Res.BadRequest();
    //save log in storage
    GameApi.LevelLog.save(nk, userId, levelLog);
    //checking cheats
    var validator = new LevelValidation.Validator();
    var cheats = validator.cheatCheck(levelLog, initalValues);
    if (cheats.length > 0) {
      GameApi.Cheat.write(nk, levelLog.levelNumber, userId, cheats);
      return Res.response(
        false,
        Res.Code.cheatDetected,
        cheats,
        "cheats detected"
      );
    }
    if (levelLog.atEnd.result === "win") {
      GameApi.LastLevel.increment(nk, userId);
      Leaderboards.UpdateLeaderboards(nk, userId, ctx.username, levelLog);
    }
    //update inventory
    var changeSet = LevelValidation.extractData(levelLog, initalValues);
    var wallet = Wallet.update(nk, userId, changeSet).wallet;
    return Res.Success(wallet);
  } catch (error) {
    return Res.Error(logger, "failed to validate level", error);
  }
};
