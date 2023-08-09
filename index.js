"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var serverId = "1a52749c-15d6-43ad-8fef-01e2997ad6e0";
var PMC_Leaderboard = {
    config: {
        id: "PMC-Leaderboard",
        authoritative: false,
        sort: "descending" /* nkruntime.SortOrder.DESCENDING */,
        operator: "set" /* nkruntime.Operator.SET */,
        reset_schedule: "0 0 * * 1", // Every Monday at 00:00
    },
    calculateScore: function (balance, lastLevel) {
        var score = lastLevel * 1000 + balance * 250;
        return score;
    },
    initalizeLeaderboard: function (ctx, logger, nk) {
        try {
            nk.leaderboardCreate(PMC_Leaderboard.config.id, PMC_Leaderboard.config.authoritative, PMC_Leaderboard.config.sort, PMC_Leaderboard.config.operator, PMC_Leaderboard.config.reset_schedule);
        }
        catch (error) {
            logger.error("failed to create leaderboard: ".concat(error.message));
        }
    },
};
var setRecord = function (ctx, logger, nk, payload) {
    if (ctx.userId !== serverId)
        throw Error("Unauthorized");
    var data = JSON.parse(payload);
    logger.debug(payload);
    nk.leaderboardRecordWrite(PMC_Leaderboard.config.id, data.userId, data.username, data.score);
};
var InitModule = function (ctx, logger, nk, initializer) {
    logger.info("MODULE INJECTED");
    //initiate user wallet
    initializer.registerAfterAuthenticateDevice(InitiateUser);
    //Register Leaderboards
    PMC_Leaderboard.initalizeLeaderboard(ctx, logger, nk);
    initializer.registerRpc("pmc/setRecord", setRecord);
    //validators
    initializer.registerRpc("levelValidator", levelValidatorRPC);
    initializer.registerRpc("addDataToStorage", addDataToStorage);
};
var addDataToStorage = function (ctx, logger, nk, payload) {
    var _a = JSON.parse(payload), collection = _a.collection, key = _a.key, value = _a.value, permissionRead = _a.permissionRead, permissionWrite = _a.permissionWrite;
    if (!ctx.userId) {
        // Reject non server-to-server call
        throw Error("Cannot invoke this function from user session");
    }
    var write = {
        collection: collection,
        key: key,
        userId: ctx.userId,
        value: { number1: 0, score: 120 },
        version: "1",
        permissionRead: permissionRead,
        permissionWrite: permissionWrite,
    };
    nk.storageWrite([write]);
    return JSON.stringify("HELLOOO");
};
var InitialWallet = {
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
    Discoball: {
        endDate: 0,
        isUnlimited: false,
        quantity: 3,
    },
    Rocket: {
        endDate: 0,
        isUnlimited: false,
        quantity: 3,
    },
    Hammer: 0,
    Shuffle: 0,
    HorizontalRocket: 0,
    VerticalRocket: 0,
    Coins: 0,
    Gems: 0,
    Score: 0,
};
var initialCrypto = {
    address: null,
    balance: null,
};
var InitiateUser = function (ctx, logger, nk, data) {
    try {
        if (!data.created)
            return;
        nk.storageWrite([
            {
                collection: "Economy",
                key: "Wallet",
                value: InitialWallet,
                userId: ctx.userId,
                permissionRead: 1,
                permissionWrite: 1,
            },
            {
                collection: "Crypto",
                key: "Wallet",
                value: initialCrypto,
                userId: ctx.userId,
                permissionRead: 1,
                permissionWrite: 0,
            },
        ]);
        logger.info("New User Joined: ".concat(ctx.userId));
    }
    catch (error) {
        throw new Error("Failed to initiate user. cause: ".concat(error.message));
    }
};
var LevelValidator = /** @class */ (function () {
    function LevelValidator(levelLog) {
        this.levelLog = levelLog;
    }
    LevelValidator.prototype.cheatCheck = function () {
        try {
            var _a = this.levelLog, atStart = _a.atStart, atEnd = _a.atEnd;
            var detectedCheats = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], this.checkHearts(atStart.heart), true), this.checkBoosters(atStart.boostersCount, atEnd.boostersCount, atStart.selectedBoosters), true), this.checkMoves(atEnd.totalMoves, atEnd.levelMaxMoves, atEnd.purchasedMovesCount), true), this.checkTime(atStart.time, atEnd.time), true), this.checkCoins(atStart.coins, atEnd.coins, atEnd.purchasedMovesCoins, atEnd.purchasedPowerUps), true), this.checkPowerUps(atStart.powerUpsCount, atEnd.powerUpsCount, atEnd.purchasedPowerUps, atEnd.usedItems), true), this.checkAbilityUsage(atEnd.targetAbilityblocksPoped, atEnd.abilitUsedTimes), true);
            return detectedCheats;
        }
        catch (error) {
            throw new Error("Cheat Check Error: ".concat(error.message));
        }
    };
    LevelValidator.prototype.checkHearts = function (heartCount) {
        if (heartCount === 0)
            return ["Started level with no heart!"];
        else if (heartCount < -1 || heartCount > 5)
            return ["Invalid Heart Count: Hearts = ".concat(heartCount)];
        else
            return [];
    };
    LevelValidator.prototype.checkBoosters = function (startCounts, endCounts, selectedBoosters) {
        var detectedCheats = [];
        for (var _i = 0, _a = LevelValidator.Boosters; _i < _a.length; _i++) {
            var booster = _a[_i];
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
    LevelValidator.prototype.checkMoves = function (totalMoves, levelMaxMoves, purchasedMovesCount) {
        if (levelMaxMoves === -1)
            return []; // time based level
        return totalMoves > levelMaxMoves + purchasedMovesCount
            ? [
                "Invalid Extra Moves: totalMoves(".concat(totalMoves, ") > levelMaxMoves(").concat(levelMaxMoves, ") + purchasedMovesCount(").concat(purchasedMovesCount, ")"),
            ]
            : [];
    };
    LevelValidator.prototype.checkTime = function (startTime, endTime) {
        return endTime - startTime < 1000 ? ["Time less than one second"] : [];
    };
    LevelValidator.prototype.checkCoins = function (startCoins, endCoins, purchasedMovesCoins, purchasedPowerUps) {
        var purchasedPowerUpsPrice = Math.floor(purchasedPowerUps.reduce(function (acc, curr) { return acc + curr; }, 0) / 3) *
            600;
        return endCoins !==
            startCoins - purchasedMovesCoins - purchasedPowerUpsPrice
            ? ["Invalid Coin Count!"]
            : [];
    };
    LevelValidator.prototype.checkPowerUps = function (startPowerUpsCount, endPowerUpsCount, purchasedPowerUps, usedItems) {
        var detectedCheats = [];
        for (var _i = 0, _a = LevelValidator.PowerUps; _i < _a.length; _i++) {
            var powerUp = _a[_i];
            var name_2 = powerUp.name, index = powerUp.index;
            var before = startPowerUpsCount[index];
            var after = endPowerUpsCount[index];
            var purchased = purchasedPowerUps[index];
            var used = usedItems[index];
            if (after !== before + purchased - used) {
                detectedCheats.push("Cheat In PowerUps: ".concat(name_2));
            }
        }
        return detectedCheats;
    };
    LevelValidator.prototype.checkAbilityUsage = function (targetAbilityblocksPoped, abilitUsedTimes) {
        return abilitUsedTimes > targetAbilityblocksPoped / 10
            ? [
                "Used ability more than allowed count: allowed: ".concat(Math.floor(targetAbilityblocksPoped / 10), " used: ").concat(abilitUsedTimes),
            ]
            : [];
    };
    LevelValidator.PowerUps = [
        { name: "Hammer", id: "HAMMER", index: 0 },
        { name: "VerticalRocket", id: "VERTICAL_ROCKET", index: 1 },
        { name: "Shuffle", id: "SHUFFLE", index: 2 },
        { name: "HorizontalRocket", id: "HORIZONTAL_ROCKET", index: 3 },
    ];
    LevelValidator.Boosters = [
        { name: "TNT", id: "TNT", index: 0 },
        { name: "DiscoBall", id: "DISCO_BALL", index: 1 },
        { name: "Rocket", id: "ROCKET", index: 2 },
    ];
    return LevelValidator;
}());
var levelValidatorRPC = function (ctx, logger, nk, payload) {
    var levelLog = JSON.parse(payload);
    var validator = new LevelValidator(levelLog);
    var cheats = validator.cheatCheck();
    logger.debug(JSON.stringify(cheats));
    var lastLevel = getLastLevel(nk, ctx.userId);
    logger.debug(JSON.stringify(lastLevel));
    if (levelLog.levelNumber > lastLevel + 1) {
        throw new Error("level skip detected: lastLevel:".concat(lastLevel, "  current:").concat(levelLog.levelNumber));
    }
    setLastLevel(nk, ctx.userId, lastLevel + 1);
    if (cheats.length > 0) {
        throw new Error("cheats detected:\n ".concat(cheats.toString()));
    }
};
var LastLevelKeys = {
    collection: "levels",
    key: "data",
    id: "number",
};
var getLastLevel = function (nk, userId) {
    try {
        var storageObjects = nk.storageRead([
            { collection: LastLevelKeys.collection, key: LastLevelKeys.key, userId: userId },
        ]);
        var lastLevel = storageObjects[0].value[LastLevelKeys.id];
        return lastLevel;
    }
    catch (error) {
        throw new Error("failed to get Last level: " + error.message);
    }
};
var setLastLevel = function (nk, userId, newValue) {
    var _a;
    try {
        var value = (_a = {}, _a[LastLevelKeys.id] = newValue, _a);
        nk.storageWrite([
            {
                collection: LastLevelKeys.collection,
                key: LastLevelKeys.key,
                userId: userId,
                value: value,
            },
        ]);
    }
    catch (error) {
        throw new Error("failed to set Last level: " + error.message);
    }
};
