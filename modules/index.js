"use strict";
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var InitModule = function (ctx, logger, nk, initializer) {
    //register storage index
    cryptoWalletIndex(initializer);
    //initialize shop
    initShop(nk);
    //initiate user wallet
    initializer.registerAfterAuthenticateDevice(InitiateUser);
    initializer.registerBeforeReadStorageObjects(BeforeGetStorage);
    initializer.registerRpc("rewards/claim", ClaimRewardRPC);
    //create Leaderboards
    Leaderboards.initalizeLeaderboards(nk, logger);
    Bucket.initializeLeaderboards(nk, initializer);
    //Register Leaderboards rpcs
    initializer.registerRpc("leaderboard/setRecord/pmc", updateScore);
    initializer.registerRpc("user/WalletConnect", WalletConnect);
    //validators
    initializer.registerRpc("level/validate", levelValidatorRPC);
};
var Rewards;
(function (Rewards) {
    var collection = "Economy";
    var key = "Rewards";
    function get(nk, userId) {
        var data = nk.storageRead([{ collection: collection, key: key, userId: userId }]);
        var rewards;
        var version;
        if (data.length < 1) {
            rewards = [];
            version = undefined;
        }
        else {
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
        if (version)
            writeObj.version = version;
        nk.storageWrite([writeObj]);
    }
    function add(nk, userId, reward) {
        var _a = get(nk, userId), rewards = _a.rewards, version = _a.version;
        rewards.push(reward);
        set(nk, userId, rewards, version);
    }
    Rewards.add = add;
    function remove(nk, userId, rewardId) {
        var _a = get(nk, userId), rewards = _a.rewards, version = _a.version;
        var indexToRemove = -1;
        for (var i = 0; i < rewards.length; i++) {
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
    function claim(nk, userId, rewardId) {
        while (true) {
            try {
                var _a = get(nk, userId), rewards = _a.rewards, version = _a.version;
                var rewardIndex = -1;
                for (var i = 0; i < rewards.length; i++) {
                    if (rewards[i].id === rewardId) {
                        rewardIndex = i;
                        break;
                    }
                }
                if (rewardIndex === -1)
                    throw new Error("No matching rewards found for claim");
                var rewardItems = rewards[rewardIndex].items;
                rewards.splice(rewardIndex, 1);
                set(nk, userId, rewards, version);
                Wallet.update(nk, userId, rewardItems);
                return;
            }
            catch (error) {
                if (error.message.indexOf("version check failed") === -1)
                    throw error;
            }
        }
    }
    Rewards.claim = claim;
    function getTierByRank(rank, tierConfig) {
        var TierRanking = ["gold", "silver", "bronze", "normal"];
        if (rank > 0) {
            for (var _i = 0, TierRanking_1 = TierRanking; _i < TierRanking_1.length; _i++) {
                var tier = TierRanking_1[_i];
                var tierMaxRank = tierConfig[tier];
                if (!tierMaxRank)
                    break;
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
    var input = JSON.parse(payload);
    var rewardId = input.id;
    var userId = ctx.userId;
    Rewards.claim(nk, userId, rewardId);
};
var Wallet;
(function (Wallet) {
    Wallet.collection = "Economy";
    Wallet.key = "Wallet";
    var unlimitables = ["Heart", "TNT", "DiscoBall", "Rocket"];
    // export interface IWallet {
    //   Heart: WalletItem;
    //   TNT: WalletItem;
    //   DiscoBall: WalletItem;
    //   Rocket: WalletItem;
    //   Hammer: WalletItem;
    //   Shuffle: WalletItem;
    //   HorizontalRocket: WalletItem;
    //   VerticalRocket: WalletItem;
    //   Coins: WalletItem;
    //   Gems: WalletItem;
    //   Score: WalletItem;
    // }
    Wallet.InitialWallet = {
        Heart: {
            endDate: 0,
            isUnlimited: false,
            quantity: 5,
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
        Coins: { quantity: 0 },
        Gems: { quantity: 0 },
        Score: { quantity: 0 },
    };
    function updateWallet(wallet, changeset) {
        changeset.map(function (cs) {
            var key = cs.id;
            var item = wallet[key];
            if (cs.time) {
                if (unlimitables.indexOf(key) === -1 || !item.endDate)
                    throw new Error("Cannot add duration to non-unlimited items.");
                var newEndDate = item.isUnlimited ? item.endDate : Date.now();
                item.endDate = newEndDate + cs.time * 1000;
                item.isUnlimited = true;
            }
            if (cs.quantity !== 0) {
                item.quantity += cs.quantity;
            }
            wallet[key] = item;
        });
        return wallet;
    }
    function get(nk, userId) {
        var data = nk.storageRead([{ collection: Wallet.collection, key: Wallet.key, userId: userId }]);
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
    function set(nk, userId, newWallet, version) {
        var writeObj = {
            collection: Wallet.collection,
            key: Wallet.key,
            userId: userId,
            value: newWallet,
            permissionRead: 1,
            permissionWrite: 0,
        };
        if (version)
            writeObj.version = version;
        nk.storageWrite([writeObj]);
    }
    function checkExpired(nk, userId) {
        var _a = get(nk, userId), wallet = _a.wallet, version = _a.version;
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
        if (hasChanged)
            set(nk, userId, wallet, version);
    }
    Wallet.checkExpired = checkExpired;
    function update(nk, userId, changeset) {
        while (true) {
            try {
                var _a = get(nk, userId), wallet = _a.wallet, version = _a.version;
                var newWallet = updateWallet(wallet, changeset);
                set(nk, userId, newWallet, version);
                return;
            }
            catch (error) {
                if (error.message.indexOf("version check failed") === -1)
                    throw error;
            }
        }
    }
    Wallet.update = update;
})(Wallet || (Wallet = {}));
//disable unlimited items if they are expired
var BeforeGetStorage = function (ctx, logger, nk, data) {
    var _a;
    (_a = data.objectIds) === null || _a === void 0 ? void 0 : _a.forEach(function (element) {
        if (element.collection === Wallet.collection &&
            element.key === Wallet.key) {
            Wallet.checkExpired(nk, element.userId);
        }
    });
    return data;
};
var SystemUserId = "00000000-0000-0000-0000-000000000000";
var Category;
(function (Category) {
    Category[Category["GLOBAL"] = 0] = "GLOBAL";
    Category[Category["WEEKLY"] = 1] = "WEEKLY";
    Category[Category["PMC"] = 2] = "PMC";
    Category[Category["RUSH"] = 3] = "RUSH";
    Category[Category["CUP"] = 4] = "CUP";
    Category[Category["FRIENDS"] = 5] = "FRIENDS";
    Category[Category["ENDLESS"] = 6] = "ENDLESS";
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
    Cup: {
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
        nk.tournamentCreate(config.tournamentID, config.authoritative, config.sortOrder, config.operator, config.duration, config.resetSchedule, config.metadata, config.title, config.description, config.category, config.startTime, config.endTime, config.maxSize, config.maxNumScore, config.joinRequired);
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
            duration: 3 * 24 * 60 * 60,
            description: "",
            bucketSize: 50,
            endTime: null,
            joinRequired: true,
            maxNumScore: MAX_SCORE,
            maxSize: 100000000,
            metadata: leaderboardRewards.Cup,
            operator: "increment" /* nkruntime.Operator.INCREMENTAL */,
            resetSchedule: "0 0 */3 * *",
            sortOrder: "descending" /* nkruntime.SortOrder.DESCENDING */,
            startTime: 0,
            title: "Pepe Cup",
        },
        Rush: {
            tournamentID: "Rush",
            authoritative: true,
            category: Category.RUSH,
            duration: 12 * 60 * 60,
            description: "",
            bucketSize: 10,
            endTime: null,
            joinRequired: true,
            maxNumScore: MAX_SCORE,
            maxSize: 100000000,
            metadata: leaderboardRewards.Rush,
            operator: "increment" /* nkruntime.Operator.INCREMENTAL */,
            resetSchedule: "0 */12 * * *",
            sortOrder: "descending" /* nkruntime.SortOrder.DESCENDING */,
            startTime: 0,
            title: "Pepe Rush",
        },
        Endless: {
            tournamentID: "Endless",
            authoritative: true,
            category: Category.ENDLESS,
            duration: 3 * 24 * 60 * 60,
            description: "",
            bucketSize: 50,
            endTime: null,
            joinRequired: true,
            maxNumScore: MAX_SCORE,
            maxSize: 100000000,
            metadata: {},
            operator: "increment" /* nkruntime.Operator.INCREMENTAL */,
            resetSchedule: "0 0 */3 * *",
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
            var latestVersion = void 0, latestId = void 0;
            if (latestBucket.length < 1) {
                latestId = 0;
                latestVersion = setLatestBucketId(nk, leaderBoadrdId, latestId);
            }
            else {
                latestVersion = latestBucket[0].version;
                latestId = parseInt(latestBucket[0].value[valueKey]);
            }
            return { latestId: latestId, latestVersion: latestVersion };
        }
        catch (error) {
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
            if (version)
                writeObj.version = version;
            var res = nk.storageWrite([writeObj]);
            return res[0].version;
        }
        catch (error) {
            throw new Error("failed to setLatestBucketId: ".concat(error.message));
        }
    }
    Bucket.setLatestBucketId = setLatestBucketId;
    function getBucketById(nk, leaderboard, id) {
        var collection = Bucket.storage.collection;
        var key = "".concat(leaderboard, "#").concat(id);
        try {
            var res = nk.storageRead([{ collection: collection, key: key, userId: SystemUserId }]);
            var version = res[0].version;
            var bucket = res[0].value;
            return { bucket: bucket, version: version };
        }
        catch (error) {
            throw new Error("failed to getBucketById: key:".concat(key, " collection:").concat(collection, " error: ").concat(error.message));
        }
    }
    Bucket.getBucketById = getBucketById;
    function createNewBucket(nk, logger, leaderBoadrdId, id, latestBucketVersion) {
        var _a, _b;
        var key = "".concat(leaderBoadrdId, "#").concat(id);
        try {
            var latestVersion = setLatestBucketId(nk, leaderBoadrdId, id, latestBucketVersion);
            var tournamentInfo = nk.tournamentsGetId([leaderBoadrdId])[0];
            var resetTimeUnix = (_b = (_a = tournamentInfo.endActive) !== null && _a !== void 0 ? _a : tournamentInfo.endTime) !== null && _b !== void 0 ? _b : 0;
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
            logger.debug("created new bucket: ".concat(leaderBoadrdId, "#").concat(id));
            return { bucket: bucket, version: version, latestVersion: latestVersion };
        }
        catch (error) {
            throw new Error("failed to createNewBucket with id ".concat(key, ": ").concat(error.message));
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
        }
        catch (error) {
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
        }
        catch (error) {
            throw new Error("failed to setUserBucket: ".concat(error.message));
        }
    }
    Bucket.setUserBucket = setUserBucket;
    function getUserBucketId(nk, leaderBoadrdId, userId) {
        var collection = Bucket.storage.collection;
        var userBucket = nk.storageRead([
            { collection: collection, key: leaderBoadrdId, userId: userId },
        ]);
        if (userBucket.length < 1)
            return null;
        var id = userBucket[0].value.id;
        return id;
    }
    Bucket.getUserBucketId = getUserBucketId;
    function getUserBucket(nk, config, userId) {
        try {
            var leaderBoadrdId = config.tournamentID;
            var userBucketId = getUserBucketId(nk, leaderBoadrdId, userId);
            if (!userBucketId)
                return null;
            var bucket = Bucket.getBucketById(nk, leaderBoadrdId, userBucketId).bucket;
            return bucket;
        }
        catch (error) {
            throw new Error("failed to getUserBucket: ".concat(error.message));
        }
    }
    Bucket.getUserBucket = getUserBucket;
    function joinLeaderboard(nk, logger, ctx, config) {
        var userId = ctx.userId;
        var leaderBoadrdId = config.tournamentID;
        var userBucket = getUserBucket(nk, config, userId);
        if (userBucket) {
            throw new Error("User Has already joined ".concat(leaderBoadrdId, " leaderboard"));
        }
        var attempts = 0;
        //get last bucket
        while (true) {
            try {
                var latestRes = Bucket.getLatestBucketId(nk, leaderBoadrdId);
                var latestId = latestRes.latestId, latestVersion = latestRes.latestVersion;
                if (latestId === 0) {
                    var data = Bucket.createNewBucket(nk, logger, leaderBoadrdId, ++latestId, latestVersion);
                    latestVersion = data.latestVersion;
                }
                var _a = Bucket.getBucketById(nk, leaderBoadrdId, latestId), bucket = _a.bucket, version = _a.version;
                // if full create new bucket
                if (bucket.userIds.length >= config.bucketSize) {
                    var data = Bucket.createNewBucket(nk, logger, leaderBoadrdId, ++latestId, latestVersion);
                    version = data.version;
                    latestVersion = data.latestVersion;
                    bucket = data.bucket;
                }
                //if not full add user to it
                bucket.userIds.push(userId);
                Bucket.addUserToBucket(nk, leaderBoadrdId, latestId, version, bucket);
                Bucket.setUserBucket(nk, userId, leaderBoadrdId, latestId);
                return;
            }
            catch (error) {
                if (attempts > 100)
                    throw error;
                attempts++;
            }
        }
    }
    Bucket.joinLeaderboard = joinLeaderboard;
    function getBucketRecords(nk, bucket, config, time) {
        try {
            var tournament = nk.tournamentRecordsList(config.tournamentID, bucket.userIds, config.bucketSize, undefined, time);
            return tournament.records;
        }
        catch (error) {
            throw new Error("failed to getRecords: ".concat(error.message));
        }
    }
    Bucket.getBucketRecords = getBucketRecords;
    function getBucketRecordsRpc(ctx, nk, config) {
        var userId = ctx.userId;
        //get user bucket
        var bucket = Bucket.getUserBucket(nk, config, userId);
        //if not exists
        if (!bucket)
            throw new Error("user does not exist in this leaderboard");
        var records = getBucketRecords(nk, bucket, config);
        return JSON.stringify(records);
    }
    Bucket.getBucketRecordsRpc = getBucketRecordsRpc;
    function deleteUserBuckets(nk, logger, tournament) {
        var config = Bucket.configs[tournament.id];
        var bucketCollection = Bucket.storage.collection;
        var batchSize = 100;
        var cursur;
        var userObjToDelete = [];
        var notifications = [];
        do {
            var userBuckets = nk.storageList(undefined, bucketCollection, batchSize, cursur);
            if (userBuckets.objects && (userBuckets === null || userBuckets === void 0 ? void 0 : userBuckets.objects.length) > 0) {
                userBuckets.objects.map(function (b) {
                    var userId = b.userId;
                    if (userId === SystemUserId)
                        return;
                    var obj = {
                        collection: bucketCollection,
                        key: tournament.id,
                        userId: userId,
                    };
                    if (b.value && b.value.id) {
                        var bucketId = b.value.id;
                        var bucket = Bucket.getBucketById(nk, tournament.id, bucketId).bucket;
                        var records = Bucket.getBucketRecords(nk, bucket, config, tournament.endActive);
                        var reward = undefined;
                        var userRecord = records === null || records === void 0 ? void 0 : records.filter(function (r) { return r.ownerId === userId; });
                        if (userRecord && userRecord.length > 0) {
                            var rank = userRecord[0].rank;
                            var rewardsConfig = leaderboardRewards[tournament.id].config;
                            var tier = Rewards.getTierByRank(rank, rewardsConfig);
                            if (tier) {
                                var rewardItems = leaderboardRewards[tournament.id][tier];
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
                        notifications.push(notif);
                        userObjToDelete.push(obj);
                    }
                });
                nk.notificationsSend(notifications);
                nk.storageDelete(userObjToDelete);
            }
            cursur = userBuckets.cursor;
        } while (cursur);
    }
    Bucket.deleteUserBuckets = deleteUserBuckets;
    function deleteBuckets(nk, leaderBoardId) {
        var _a;
        var storageIds = nk.storageList(SystemUserId, Bucket.storage.collection, 1000);
        var bucketsToDelete = (_a = storageIds.objects) === null || _a === void 0 ? void 0 : _a.filter(function (bucket) { return bucket.key.indexOf(leaderBoardId) !== -1; });
        if (bucketsToDelete && bucketsToDelete.length > 0) {
            var deleteRequests = bucketsToDelete.map(function (bucket) { return ({
                collection: bucket.collection,
                key: bucket.key,
                userId: SystemUserId,
            }); });
            nk.storageDelete(deleteRequests);
        }
    }
    Bucket.deleteBuckets = deleteBuckets;
})(Bucket || (Bucket = {}));
var GetRecordsRPC = function (ctx, logger, nk, payload) {
    var id = JSON.parse(payload).id;
    var config = Bucket.configs[id];
    return Bucket.getBucketRecordsRpc(ctx, nk, config);
};
// Before Join Leaderboards Hooks
var beforeJointournament = function (ctx, logger, nk, data) {
    var tournamentId = data.tournamentId;
    if (!tournamentId)
        throw new Error("Invalid tournament id");
    var config = Bucket.configs[tournamentId];
    Bucket.joinLeaderboard(nk, logger, ctx, config);
    return data;
};
var tournamentReset = function (ctx, logger, nk, tournament, end, reset) {
    Bucket.deleteUserBuckets(nk, logger, tournament);
    Bucket.deleteBuckets(nk, tournament.id);
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
                nk.leaderboardCreate(this.config.leaderboardID, this.config.authoritative, this.config.sortOrder, this.config.operator, this.config.resetSchedule, this.config.metadata);
                logger.info("".concat(this.config.leaderboardID, " leaderboard created"));
            }
            catch (error) {
                logger.error("failed to create ".concat(this.config.leaderboardID, " leaderboard"));
            }
        };
        return Leaderboard;
    }());
    Leaderboards.Leaderboard = Leaderboard;
    Leaderboards.initalizeLeaderboards = function (nk, logger) {
        for (var _i = 0, _a = Object.keys(Leaderboards.configs); _i < _a.length; _i++) {
            var key = _a[_i];
            var conf = Leaderboards.configs[key];
            new Leaderboard(conf).initialize(nk, logger);
        }
    };
    var updateGlobal = function (nk, userId, username, score, subScore) {
        var leaderboard = Leaderboards.configs.global;
        nk.leaderboardRecordWrite(leaderboard.leaderboardID, userId, username, score, subScore);
    };
    Leaderboards.UpdateLeaderboards = function (nk, userId, username, levelLog) {
        var score = 1;
        var subScore = 0;
        //calculate leaderboard score
        var rushScore = levelLog.atEnd.discoBallTargettedTiles;
        updateGlobal(nk, userId, username, score, subScore);
        Object.keys(Bucket.configs).map(function (tournamentId) {
            try {
                if (tournamentId === "Rush") {
                    nk.tournamentRecordWrite(tournamentId, userId, username, rushScore, subScore);
                }
                else {
                    nk.tournamentRecordWrite(tournamentId, userId, username, score, subScore);
                }
            }
            catch (error) { }
        });
    };
})(Leaderboards || (Leaderboards = {}));
var updateScore = function (ctx, logger, nk, payload) {
    try {
        if (ctx.userId)
            throw Error("Unauthorized");
        var data = JSON.parse(payload);
        logger.debug(payload);
        nk.leaderboardRecordWrite(Leaderboards.configs.PMC.leaderboardID, data.userId, data.username, data.score);
    }
    catch (error) {
        logger.error(error.message);
    }
};
var cryptoWalletIndex = function (initializer) {
    var name = "crypto-wallet";
    var collection = "Crypto";
    var key = "Wallet";
    var fields = ["address"];
    var maxEntries = 1000000000;
    initializer.registerStorageIndex(name, collection, key, fields, maxEntries);
};
var initialCrypto = {
    address: null,
    balance: null,
};
var InitiateUser = function (ctx, logger, nk, data, request) {
    try {
        if (!data.created)
            return;
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
    }
    catch (error) {
        throw new Error("Failed to initiate user. cause: ".concat(error.message));
    }
};
var WalletIndex;
(function (WalletIndex) {
    var queryMaker = function (address) { return "+address:".concat(address); };
    WalletIndex.get = function (nk, address) {
        try {
            var query = queryMaker(address);
            var res = nk.storageIndexList("crypto-wallet", query, 1);
            return res.length > 0 ? res[0] : null;
        }
        catch (error) {
            throw new Error("failed to check wallet address existance: ".concat(error.message));
        }
    };
})(WalletIndex || (WalletIndex = {}));
var WalletConnect = function (ctx, logger, nk, payload) {
    var data;
    try {
        data = JSON.parse(payload);
        if (!data || !data.address)
            throw Error();
    }
    catch (error) {
        throw new Error("invalid request body");
    }
    var address = data.address;
    try {
        nk.storageWrite([
            {
                collection: "Crypto",
                key: "Wallet",
                userId: ctx.userId,
                value: { address: address, balance: 0 },
                permissionRead: 2,
                permissionWrite: 0,
            },
        ]);
        return;
    }
    catch (error) {
        throw new Error("Error While Connecting Wallet: ".concat(error.message));
    }
};
var _a, _b, _c, _d;
var GameApi = {
    LastLevel: (_a = /** @class */ (function () {
            function class_1() {
            }
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
                }
                catch (error) {
                    throw new Error("failed to get Last level: " + error.message);
                }
            };
            class_1.set = function (nk, userId, newValue) {
                var _a;
                try {
                    var value = (_a = {}, _a[this.id] = newValue, _a);
                    nk.storageWrite([
                        {
                            collection: this.Keys.collection,
                            key: this.Keys.key,
                            userId: userId,
                            value: value,
                        },
                    ]);
                }
                catch (error) {
                    throw new Error("failed to set Last level: " + error.message);
                }
            };
            return class_1;
        }()),
        __setFunctionName(_a, "LastLevel"),
        _a.Keys = {
            collection: "Levels",
            key: "Data",
        },
        _a.id = "progress",
        _a),
    LevelLog: (_b = /** @class */ (function () {
            function class_2() {
            }
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
                }
                catch (error) {
                    throw new Error("failed to save LevelLog: ".concat(error.message));
                }
            };
            class_2.get = function (nk, userId, levelNumber) {
                var data = nk.storageRead([
                    { collection: this.Keys.collection, key: levelNumber, userId: userId },
                ]);
                return data;
            };
            return class_2;
        }()),
        __setFunctionName(_b, "LevelLog"),
        _b.Keys = {
            collection: "Levels",
        },
        _b),
    Cheat: (_c = /** @class */ (function () {
            function class_3() {
            }
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
                }
                catch (error) {
                    throw new Error("failed to save Cheats: ".concat(error.message));
                }
            };
            return class_3;
        }()),
        __setFunctionName(_c, "Cheat"),
        _c.Keys = {
            collection: "Cheats",
        },
        _c),
    Crypto: (_d = /** @class */ (function () {
            function class_4() {
            }
            return class_4;
        }()),
        __setFunctionName(_d, "Crypto"),
        _d.Keys = {
            collection: "Crypto",
            key: "Wallet",
        },
        _d),
};
var SHOP_ITEMS = [
    {
        name: "Admiral Resources",
        id: "ADMIRAL_RESOURCES",
        items: [
            {
                id: "Hammer",
                quantity: 10,
            },
            {
                id: "Shuffle",
                quantity: 10,
            },
            {
                id: "VerticalRocket",
                quantity: 10,
            },
            {
                id: "HorizontalRocket",
                quantity: 10,
            },
            {
                id: "Heart",
                isUnlimited: true,
                quantity: 0,
                time: 64800,
            },
            {
                id: "Rocket",
                isUnlimited: true,
                quantity: 0,
                time: 259200,
            },
            {
                id: "DiscoBall",
                isUnlimited: true,
                quantity: 0,
                time: 259200,
            },
            {
                id: "TNT",
                isUnlimited: true,
                quantity: 0,
                time: 259200,
            },
            {
                id: "Coins",
                quantity: 50000,
            },
        ],
        price: 99.99,
        type: "Special Offer",
    },
    {
        name: "Astronaut Resources",
        id: "ASTRONAUT_RESOURCES",
        items: [
            {
                id: "Hammer",
                quantity: 2,
            },
            {
                id: "Shuffle",
                quantity: 2,
            },
            {
                id: "VerticalRocket",
                quantity: 2,
            },
            {
                id: "HorizontalRocket",
                quantity: 2,
            },
            {
                id: "Heart",
                isUnlimited: true,
                quantity: 0,
                time: 3600,
            },
            {
                id: "Rocket",
                isUnlimited: true,
                quantity: 0,
                time: 3600,
            },
            {
                id: "DiscoBall",
                isUnlimited: true,
                quantity: 0,
                time: 3600,
            },
            {
                id: "TNT",
                isUnlimited: true,
                quantity: 0,
                time: 3600,
            },
            {
                id: "Coins",
                quantity: 5000,
            },
        ],
        price: 9.99,
        type: "Special Offer",
    },
    {
        name: "Captain Resources",
        id: "CAPTAIN_RESOURCES",
        items: [
            {
                id: "Hammer",
                quantity: 4,
            },
            {
                id: "Shuffle",
                quantity: 4,
            },
            {
                id: "VerticalRocket",
                quantity: 4,
            },
            {
                id: "HorizontalRocket",
                quantity: 4,
            },
            {
                id: "Heart",
                isUnlimited: true,
                quantity: 0,
                time: 7200,
            },
            {
                id: "Rocket",
                isUnlimited: true,
                quantity: 0,
                time: 43200,
            },
            {
                id: "DiscoBall",
                isUnlimited: true,
                quantity: 0,
                time: 43200,
            },
            {
                id: "TNT",
                isUnlimited: true,
                quantity: 0,
                time: 43200,
            },
            {
                id: "Coins",
                quantity: 10000,
            },
        ],
        price: 22.99,
        type: "Special Offer",
    },
    {
        name: "Commander Resources",
        id: "COMMANDER_RESOURCES",
        items: [
            {
                id: "Hammer",
                quantity: 6,
            },
            {
                id: "Shuffle",
                quantity: 6,
            },
            {
                id: "VerticalRocket",
                quantity: 6,
            },
            {
                id: "HorizontalRocket",
                quantity: 6,
            },
            {
                id: "Heart",
                isUnlimited: true,
                quantity: 0,
                time: 21600,
            },
            {
                id: "Rocket",
                isUnlimited: true,
                quantity: 0,
                time: 64800,
            },
            {
                id: "DiscoBall",
                isUnlimited: true,
                quantity: 0,
                time: 64800,
            },
            {
                id: "TNT",
                isUnlimited: true,
                quantity: 0,
                time: 64800,
            },
            {
                id: "Coins",
                quantity: 10000,
            },
        ],
        price: 44.99,
        type: "Special Offer",
    },
    {
        name: "Elder Resources",
        id: "ELDER_RESOURCES",
        items: [
            {
                id: "Hammer",
                quantity: 15,
            },
            {
                id: "Shuffle",
                quantity: 15,
            },
            {
                id: "VerticalRocket",
                quantity: 15,
            },
            {
                id: "HorizontalRocket",
                quantity: 15,
            },
            {
                id: "Heart",
                isUnlimited: true,
                quantity: 0,
                time: 86400,
            },
            {
                id: "Rocket",
                isUnlimited: true,
                quantity: 0,
                time: 36000,
            },
            {
                id: "DiscoBall",
                isUnlimited: true,
                quantity: 0,
                time: 36000,
            },
            {
                id: "TNT",
                isUnlimited: true,
                quantity: 0,
                time: 36000,
            },
            {
                id: "Coins",
                quantity: 65000,
            },
        ],
        price: 110.99,
        type: "Special Offer",
    },
    {
        name: "Special Offer",
        id: "SPECIAL_OFFER",
        items: [
            {
                id: "Hammer",
                quantity: 1,
            },
            {
                id: "Shuffle",
                quantity: 1,
            },
            {
                id: "VerticalRocket",
                quantity: 1,
            },
            {
                id: "HorizontalRocket",
                quantity: 1,
            },
            {
                id: "Heart",
                isUnlimited: true,
                quantity: 0,
                time: 3600,
            },
            {
                id: "Rocket",
                isUnlimited: true,
                quantity: 0,
                time: 3600,
            },
            {
                id: "DiscoBall",
                isUnlimited: true,
                quantity: 0,
                time: 3600,
            },
            {
                id: "TNT",
                isUnlimited: true,
                quantity: 0,
                time: 3600,
            },
            {
                id: "Coins",
                quantity: 5000,
            },
        ],
        price: 1.99,
        type: "Special Offer",
    },
    {
        name: "Vice Admiral Resources",
        id: "VICE_ADMIRAL_RESOURCES",
        items: [
            {
                id: "Hammer",
                quantity: 8,
            },
            {
                id: "Shuffle",
                quantity: 8,
            },
            {
                id: "VerticalRocket",
                quantity: 8,
            },
            {
                id: "HorizontalRocket",
                quantity: 8,
            },
            {
                id: "Heart",
                isUnlimited: true,
                quantity: 0,
                time: 43200,
            },
            {
                id: "Rocket",
                isUnlimited: true,
                quantity: 0,
                time: 86400,
            },
            {
                id: "DiscoBall",
                isUnlimited: true,
                quantity: 0,
                time: 86400,
            },
            {
                id: "TNT",
                isUnlimited: true,
                quantity: 0,
                time: 86400,
            },
            {
                id: "Coins",
                quantity: 25000,
            },
        ],
        price: 89.99,
        type: "Special Offer",
    },
    {
        name: "Currency pack 01",
        id: "CURRENCY_PACK_01",
        items: [
            {
                id: "Coins",
                quantity: 1000,
            },
        ],
        price: 1.99,
        type: "Coin",
    },
    {
        name: "Currency pack 02",
        id: "CURRENCY_PACK_02",
        items: [
            {
                id: "Coins",
                quantity: 5000,
            },
        ],
        price: 8.99,
        type: "Coin",
    },
    {
        name: "Currency pack 03",
        id: "CURRENCY_PACK_03",
        items: [
            {
                id: "Coins",
                quantity: 10000,
            },
        ],
        price: 17.99,
        type: "Coin",
    },
    {
        name: "Currency pack 04",
        id: "CURRENCY_PACK_04",
        items: [
            {
                id: "Coins",
                quantity: 25000,
            },
        ],
        price: 34.99,
        type: "Coin",
    },
    {
        name: "Currency pack 05",
        id: "CURRENCY_PACK_05",
        items: [
            {
                id: "Coins",
                quantity: 50000,
            },
        ],
        price: 59.99,
        type: "Coin",
    },
    {
        name: "Currency pack 06",
        id: "CURRENCY_PACK_06",
        items: [
            {
                id: "Coins",
                quantity: 100000,
            },
        ],
        price: 99.99,
        type: "Coin",
    },
];
var initShop = function (nk) {
    nk.storageWrite([
        {
            collection: "Shop",
            key: "Items",
            userId: SystemUserId,
            value: { items: SHOP_ITEMS },
            permissionRead: 2,
            permissionWrite: 0,
        },
    ]);
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
        function Validator() {
        }
        Validator.prototype.cheatCheck = function (levelLog, initialValues) {
            try {
                var atStart = levelLog.atStart, atEnd = levelLog.atEnd;
                var detectedCheats = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], this.checkHearts(initialValues.heart), true), this.checkBoosters(initialValues.boostersCount, atEnd.boostersCount, atStart.selectedBoosters), true), this.checkMoves(atEnd.totalMoves, atEnd.levelMaxMoves, atEnd.purchasedMovesCount), true), this.checkCoins(initialValues.coins, atEnd.coins, atEnd.purchasedMovesCoins, atEnd.purchasedPowerUps), true), this.checkPowerUps(initialValues.powerUpsCount, atEnd.powerUpsCount, atEnd.purchasedPowerUps, atEnd.usedItems), true), this.checkAbilityUsage(atEnd.targetAbilityblocksPoped, atEnd.abilitUsedTimes), true);
                return detectedCheats;
            }
            catch (error) {
                throw new Error("Cheat Check Error: ".concat(error.message));
            }
        };
        Validator.prototype.checkHearts = function (heartCount) {
            if (heartCount === 0)
                return ["Started level with no heart!"];
            else if (heartCount < -1 || heartCount > 5)
                return ["Invalid Heart Count: Hearts = ".concat(heartCount)];
            else
                return [];
        };
        Validator.prototype.checkBoosters = function (startCounts, endCounts, selectedBoosters) {
            var detectedCheats = [];
            for (var _i = 0, Boosters_1 = LevelValidation.Boosters; _i < Boosters_1.length; _i++) {
                var booster = Boosters_1[_i];
                var name_1 = booster.name, index = booster.index;
                var startCount = startCounts[index];
                var endCount = endCounts[index];
                if (selectedBoosters.indexOf(name_1) !== -1) {
                    if (startCount === 0) {
                        detectedCheats.push("Used a Booster Without Having it: ".concat(name_1));
                    }
                    else if (startCount !== -1 && startCount <= endCount) {
                        detectedCheats.push("Used a booster without reducing quantity: ".concat(name_1));
                    }
                }
                else if (startCount < -1 || endCount > startCount || endCount < -1) {
                    detectedCheats.push("Invalid Booster Count! ".concat(name_1, " = { before: ").concat(startCount, " after: ").concat(endCount, " }"));
                }
            }
            return detectedCheats;
        };
        Validator.prototype.checkMoves = function (totalMoves, levelMaxMoves, purchasedMovesCount) {
            if (levelMaxMoves === -1)
                return []; // time based level
            return totalMoves > levelMaxMoves + purchasedMovesCount
                ? [
                    "Invalid Extra Moves: totalMoves(".concat(totalMoves, ") > levelMaxMoves(").concat(levelMaxMoves, ") + purchasedMovesCount(").concat(purchasedMovesCount, ")"),
                ]
                : [];
        };
        Validator.checkLevel = function (levelNumber, lastLevel) {
            if (levelNumber > lastLevel + 1) {
                return [
                    "level skip detected: lastLevel:".concat(lastLevel, "  current:").concat(levelNumber),
                ];
            }
            return [];
        };
        Validator.prototype.checkTime = function (startTime, endTime) {
            return endTime - startTime < 1000 ? ["Time less than one second"] : [];
        };
        Validator.prototype.checkCoins = function (startCoins, endCoins, purchasedMovesCoins, purchasedPowerUps) {
            var purchasedPowerUpsPrice = Math.floor(purchasedPowerUps.reduce(function (acc, curr) { return acc + curr; }, 0) / 3) *
                600;
            return endCoins !==
                startCoins - purchasedMovesCoins - purchasedPowerUpsPrice
                ? ["Invalid Coin Count! start:".concat(startCoins, " end:").concat(endCoins)]
                : [];
        };
        Validator.prototype.checkPowerUps = function (startPowerUpsCount, endPowerUpsCount, purchasedPowerUps, usedItems) {
            var detectedCheats = [];
            for (var _i = 0, PowerUps_1 = LevelValidation.PowerUps; _i < PowerUps_1.length; _i++) {
                var powerUp = PowerUps_1[_i];
                var name_2 = powerUp.name, index = powerUp.index;
                var before = startPowerUpsCount[index];
                var after = endPowerUpsCount[index];
                var purchased = purchasedPowerUps[index];
                var used = usedItems[index];
                if (after !== before + purchased - used) {
                    detectedCheats.push("".concat(name_2, " before:").concat(before, " after:").concat(after));
                }
            }
            return detectedCheats.length > 0
                ? ["Cheat in PowerUps: " + detectedCheats.join(", ")]
                : [];
        };
        Validator.prototype.checkAbilityUsage = function (targetAbilityblocksPoped, abilitUsedTimes) {
            return abilitUsedTimes > targetAbilityblocksPoped / 10
                ? [
                    "Used ability more than allowed count: allowed: ".concat(Math.floor(targetAbilityblocksPoped / 10), " used: ").concat(abilitUsedTimes),
                ]
                : [];
        };
        return Validator;
    }());
    LevelValidation.Validator = Validator;
    function extractData(log, initialValues) {
        try {
            var boosters = LevelValidation.Boosters.reduce(function (acc, curr) {
                var finalCount = log.atEnd.boostersCount[curr.index];
                var initCount = initialValues.boostersCount[curr.index];
                if (initCount > -1) {
                    acc.push({
                        id: curr.name,
                        quantity: finalCount - initCount,
                    });
                }
                return acc;
            }, []);
            var powerUps = LevelValidation.PowerUps.reduce(function (acc, curr) {
                var finalCount = log.atEnd.powerUpsCount[curr.index];
                var initCount = initialValues.powerUpsCount[curr.index];
                var result = finalCount - initCount;
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
                quantity: log.atEnd.coins - initialValues.coins,
            };
            var hearts = {
                id: "Heart",
                quantity: log.atEnd.result !== "win" ? -1 : 0,
            };
            var result = __spreadArray(__spreadArray(__spreadArray([], boosters, true), powerUps, true), [
                coins,
                hearts,
            ], false);
            return result;
        }
        catch (error) {
            throw new Error("Error while extracting data from log: ".concat(error.message));
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
        if (!userId)
            throw new Error("called by a server");
        var initalValues = LevelValidation.initialValues(nk, userId);
        logger.debug(JSON.stringify(initalValues));
        var levelLog = void 0;
        try {
            levelLog = JSON.parse(payload);
            if (!levelLog)
                throw new Error();
        }
        catch (error) {
            throw new Error("Invalid request body");
        }
        GameApi.LevelLog.save(nk, userId, levelLog);
        var validator = new LevelValidation.Validator();
        var cheats = validator.cheatCheck(levelLog, initalValues);
        if (cheats.length > 0) {
            GameApi.Cheat.write(nk, levelLog.levelNumber, userId, cheats);
            return JSON.stringify({ success: false, error: cheats });
        }
        var lastLevel = GameApi.LastLevel.get(nk, userId);
        if (levelLog.atEnd.result === "win") {
            GameApi.LastLevel.set(nk, userId, lastLevel + 1);
            Leaderboards.UpdateLeaderboards(nk, userId, ctx.username, levelLog);
        }
        // cheats.push(
        //   ...LevelValidation.Validator.checkLevel(levelLog.levelNumber, lastLevel)
        // );
        //update inventory
        var changeSet = LevelValidation.extractData(levelLog, initalValues);
        Wallet.update(nk, userId, changeSet);
        return JSON.stringify({ success: true });
    }
    catch (error) {
        throw new Error("failed to validate level: ".concat(error.message));
    }
};
