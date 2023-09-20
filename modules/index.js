"use strict";
const InitModule = function (ctx, logger, nk, initializer) {
    //register storage index
    StorageIndex.registerIndexes(initializer);
    //initialize battlepass
    BattlePass.init(nk);
    Rewards.init(initializer);
    //initialize shop
    initShop(nk);
    VirtualShop.init(initializer, nk);
    CryptoPurchase.init(initializer);
    MyketPurchase.init(initializer);
    //initiate user wallet
    initializer.registerAfterAuthenticateDevice(InitiateUser);
    initializer.registerBeforeReadStorageObjects(BeforeGetStorage);
    //create Leaderboards
    Leaderboards.initalizeLeaderboards(initializer, nk, logger);
    Bucket.initializeLeaderboards(nk, initializer);
    //Register Leaderboards rpcs
    initializer.registerRpc("user/WalletConnect", WalletConnect);
    //validators
    initializer.registerRpc("level/validate", levelValidatorRPC);
};
const InitialWallet = {
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
var Levels;
(function (Levels) {
    Levels.difficulty = {
        "1": 1,
        "2": 1,
        "3": 1,
        "4": 1,
        "5": 1,
        "6": 1,
        "7": 1,
        "8": 1,
        "9": 1,
        "10": 1,
        "11": 1,
        "12": 2,
        "13": 3,
        "14": 2,
        "15": 2,
        "16": 2,
        "17": 3,
        "18": 2,
        "19": 3,
        "20": 2,
        "21": 3,
        "22": 2,
        "23": 3,
        "24": 2,
        "25": 2,
        "26": 2,
        "27": 3,
        "28": 2,
        "29": 3,
        "30": 2,
        "31": 4,
        "32": 3,
        "33": 4,
        "34": 3,
        "35": 2,
        "36": 2,
        "37": 3,
        "38": 4,
        "39": 4,
        "40": 3,
        "41": 4,
        "42": 3,
        "43": 3,
        "44": 2,
        "45": 3,
        "46": 2,
        "47": 3,
        "48": 4,
        "49": 3,
        "50": 2,
        "51": 2,
        "52": 3,
        "53": 2,
        "54": 2,
        "55": 2,
        "56": 2,
        "57": 3,
        "58": 2,
        "59": 2,
        "60": 4,
        "61": 3,
        "62": 3,
        "63": 3,
        "64": 2,
        "65": 3,
        "66": 2,
        "67": 2,
        "68": 2,
        "69": 2,
        "70": 3,
        "71": 2,
        "72": 3,
        "73": 2,
        "74": 3,
        "75": 2,
        "76": 2,
        "77": 3,
        "78": 2,
        "79": 2,
        "80": 3,
        "81": 4,
        "82": 4,
        "83": 3,
        "84": 4,
        "85": 4,
        "86": 4,
        "87": 2,
        "88": 4,
        "89": 3,
        "90": 2,
        "91": 3,
        "92": 3,
        "93": 3,
        "94": 2,
        "95": 3,
        "96": 3,
        "97": 4,
        "98": 2,
        "99": 3,
        "100": 4,
        "101": 3,
        "102": 2,
        "103": 2,
        "104": 2,
        "105": 4,
        "106": 2,
        "107": 3,
        "108": 2,
        "109": 3,
        "110": 4,
        "111": 2,
        "112": 3,
        "113": 2,
        "114": 3,
        "115": 2,
        "116": 3,
        "117": 2,
        "118": 2,
        "119": 4,
        "120": 2,
        "121": 3,
        "122": 2,
        "123": 3,
        "124": 2,
        "125": 3,
        "126": 2,
        "127": 2,
        "128": 2,
        "129": 3,
        "130": 4,
        "131": 3,
        "132": 3,
        "133": 2,
        "134": 3,
        "135": 4,
        "136": 2,
        "137": 3,
        "138": 2,
        "139": 3,
        "140": 3,
        "141": 3,
        "142": 3,
        "143": 2,
        "144": 3,
        "145": 3,
        "146": 2,
        "147": 2,
        "148": 3,
        "149": 4,
        "150": 4,
        "151": 2,
        "152": 2,
        "153": 3,
        "154": 2,
        "155": 2,
        "156": 3,
        "157": 3,
        "158": 2,
        "159": 3,
        "160": 3,
        "161": 2,
        "162": 3,
        "163": 2,
        "164": 3,
        "165": 3,
        "166": 3,
        "167": 3,
        "168": 3,
        "169": 3,
        "170": 3,
        "171": 2,
        "172": 2,
        "173": 2,
        "174": 3,
        "175": 2,
        "176": 2,
        "177": 2,
        "178": 3,
        "179": 3,
        "180": 4,
        "181": 3,
        "182": 2,
        "183": 3,
        "184": 3,
        "185": 4,
        "186": 3,
        "187": 4,
        "188": 2,
        "189": 3,
        "190": 4,
        "191": 3,
        "192": 3,
        "193": 4,
        "194": 2,
        "195": 3,
        "196": 2,
        "197": 2,
        "198": 3,
        "199": 3,
        "200": 1,
        "201": 3,
        "202": 2,
        "203": 3,
        "204": 3,
        "205": 2,
        "206": 4,
        "207": 4,
        "208": 4,
        "209": 4,
        "210": 3,
        "211": 4,
        "212": 2,
        "213": 2,
        "214": 4,
        "215": 2,
        "216": 3,
        "217": 2,
        "218": 4,
        "219": 3,
        "220": 4,
        "221": 3,
        "222": 2,
        "223": 2,
        "224": 4,
        "225": 2,
        "226": 2,
        "227": 4,
    };
})(Levels || (Levels = {}));
const SystemUserId = "00000000-0000-0000-0000-000000000000";
const GameApi = {
    LastLevel: class {
        static Keys = {
            collection: "Levels",
            key: "Data",
        };
        static id = "progress";
        static get(nk, userId) {
            try {
                const storageObjects = nk.storageRead([
                    {
                        collection: this.Keys.collection,
                        key: this.Keys.key,
                        userId,
                    },
                ]);
                const lastLevel = storageObjects[0].value[this.id];
                return { version: storageObjects[0].version, level: lastLevel };
            }
            catch (error) {
                throw new Error("failed to get Last level: " + error.message);
            }
        }
        static set(nk, userId, newValue, version) {
            try {
                const value = { [this.id]: newValue };
                const writeReq = {
                    collection: this.Keys.collection,
                    key: this.Keys.key,
                    userId,
                    value,
                };
                if (version !== undefined)
                    writeReq.version = version;
                nk.storageWrite([writeReq]);
            }
            catch (error) {
                throw new Error("failed to set Last level => " + error.message);
            }
        }
        static increment(nk, userId) {
            const { level, version } = GameApi.LastLevel.get(nk, userId);
            GameApi.LastLevel.set(nk, userId, level + 1, version);
        }
    },
    LevelLog: class {
        static Keys = {
            collection: "Levels",
        };
        static save(nk, userId, data) {
            try {
                nk.storageWrite([
                    {
                        collection: this.Keys.collection,
                        key: (data.levelNumber || -1).toString(),
                        userId,
                        value: data,
                        permissionRead: 2,
                        permissionWrite: 0,
                    },
                ]);
            }
            catch (error) {
                throw new Error(`failed to save LevelLog => ${error.message}`);
            }
        }
        static get(nk, userId, levelNumber) {
            const data = nk.storageRead([
                { collection: this.Keys.collection, key: levelNumber, userId },
            ]);
            return data;
        }
    },
    Cheat: class {
        static Keys = {
            collection: "Cheats",
        };
        static write(nk, levelNumber, userId, cheats) {
            try {
                nk.storageWrite([
                    {
                        collection: this.Keys.collection,
                        key: levelNumber.toString(),
                        userId,
                        value: { cheats },
                        permissionRead: 2,
                        permissionWrite: 0,
                    },
                ]);
            }
            catch (error) {
                throw new Error(`failed to save Cheats => ${error.message}`);
            }
        }
    },
};
var HTTP;
(function (HTTP) {
    const TIMEOUT = 4000; //ms
    const BaseHeaders = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };
    // export const BaseUrl: string = "http://host.docker.internal:8003/";
    HTTP.BaseUrl = "http://nk.planetmemes.com/";
    HTTP.CustomServerUrl = "https://api.planetmemes.com/";
    function request(nk, url, method, body, headers) {
        try {
            let finalHeaders = Object.assign({}, BaseHeaders, headers);
            const requestBody = JSON.stringify(body);
            const res = nk.httpRequest(url, method, finalHeaders, requestBody, TIMEOUT);
            const resBody = JSON.parse(res.body);
            return resBody;
        }
        catch (error) {
            throw new Error(`failed to get response: ${error.message}`);
        }
    }
    HTTP.request = request;
})(HTTP || (HTTP = {}));
var Notifications;
(function (Notifications) {
    let CODES;
    (function (CODES) {
        CODES[CODES["SYSTEM"] = 0] = "SYSTEM";
        CODES[CODES["BucketReset"] = 1] = "BucketReset";
        CODES[CODES["BattlePassReset"] = 2] = "BattlePassReset";
    })(CODES = Notifications.CODES || (Notifications.CODES = {}));
    Notifications.Notifs = {
        1: {
            subject: "Leaderboard End",
            code: CODES.BucketReset,
            senderId: SystemUserId,
            persistent: true,
        },
        2: {
            code: CODES.BattlePassReset,
            persistent: true,
            senderId: SystemUserId,
            subject: "BattlePass Reset",
        },
    };
    function create(code, userId, content) {
        const { persistent, senderId, subject } = Notifications.Notifs[code];
        const data = {
            code,
            content,
            persistent,
            senderId,
            subject,
            userId,
        };
        return data;
    }
    Notifications.create = create;
})(Notifications || (Notifications = {}));
const SHOP_ITEMS = [
    {
        id: "ADMIRAL_RESOURCES",
        name: "AdmiralResources",
        type: "SpecialOffer",
        items: [
            { id: "Hammer", quantity: 10 },
            { id: "Shuffle", quantity: 10 },
            { id: "VerticalRocket", quantity: 10 },
            { id: "HorizontalRocket", quantity: 10 },
            { id: "Heart", time: 64800 },
            { id: "Rocket", time: 259200 },
            { id: "DiscoBall", time: 259200 },
            { id: "TNT", time: 259200 },
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
            { id: "Heart", time: 3600 },
            { id: "Rocket", time: 3600 },
            { id: "DiscoBall", time: 3600 },
            { id: "TNT", time: 3600 },
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
            { id: "Heart", time: 7200 },
            { id: "Rocket", time: 43200 },
            { id: "DiscoBall", time: 43200 },
            { id: "TNT", time: 43200 },
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
            { id: "Heart", time: 21600 },
            { id: "Rocket", time: 64800 },
            { id: "DiscoBall", time: 64800 },
            { id: "TNT", time: 64800 },
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
            { id: "Heart", time: 86400 },
            { id: "Rocket", time: 36000 },
            { id: "DiscoBall", time: 36000 },
            { id: "TNT", time: 36000 },
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
            { id: "Heart", time: 3600 },
            { id: "Rocket", time: 3600 },
            { id: "DiscoBall", time: 3600 },
            { id: "TNT", time: 3600 },
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
            { id: "Heart", time: 43200 },
            { id: "Rocket", time: 86400 },
            { id: "DiscoBall", time: 86400 },
            { id: "TNT", time: 86400 },
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
    {
        id: "TEST1",
        name: "Test1",
        type: "coin",
        items: [{ id: "Coins", quantity: 1000 }],
        price: 0.01,
    },
];
const initShop = (nk) => {
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
    }
    catch (error) { }
};
var CryptoPurchase;
(function (CryptoPurchase) {
    CryptoPurchase.collection = "Purchase";
    CryptoPurchase.key = "Crypto";
    function init(initializer) {
        initializer.registerRpc("crypto/validate", validateTransaction);
    }
    CryptoPurchase.init = init;
    function validator(nk, address, txHash) {
        const body = {
            address,
            txHash,
        };
        try {
            const res = HTTP.request(nk, HTTP.CustomServerUrl + "iap-mcm/crypto/validate", "post", body);
            if (!res.success)
                throw new Error(res.message);
            const { packageId } = res.data;
            if (!packageId)
                throw new Error("invalid transaction method");
            return packageId;
        }
        catch (error) {
            throw new Error(`failed to validate transaction: ${error.message}`);
        }
    }
    CryptoPurchase.validator = validator;
    function addTransaction(nk, userId, hash) {
        try {
            const data = nk.storageRead([{ collection: CryptoPurchase.collection, key: CryptoPurchase.key, userId }]);
            let transactions = data.length > 0 ? data[0].value.transactions : [];
            transactions.push(hash);
            nk.storageWrite([
                {
                    collection: CryptoPurchase.collection,
                    key: CryptoPurchase.key,
                    userId,
                    value: { transactions },
                    permissionRead: 2,
                    permissionWrite: 0,
                },
            ]);
        }
        catch (error) {
            throw new Error("failed to write purchase record: " + error.message);
        }
    }
    CryptoPurchase.addTransaction = addTransaction;
    function txHashExists(nk, txHash) {
        const query = `transactions:/(${txHash})/`;
        const res = nk.storageIndexList(StorageIndex.configs.txHash.name, query, 1);
        return res.length > 0;
    }
    CryptoPurchase.txHashExists = txHashExists;
})(CryptoPurchase || (CryptoPurchase = {}));
const validateTransaction = (ctx, logger, nk, payload) => {
    try {
        const userId = ctx.userId;
        if (!userId)
            return Res.CalledByServer();
        const input = JSON.parse(payload);
        const { hash } = input;
        if (!hash)
            return Res.BadRequest();
        if (CryptoPurchase.txHashExists(nk, hash)) {
            return Res.response(false, "alreadyExists", undefined, "transaction hash already exists");
        }
        const wallet = CryptoWallet.get(nk, userId);
        if (!wallet || !wallet.address)
            return Res.notFound("wallet address");
        const { address } = wallet;
        const packageId = CryptoPurchase.validator(nk, address, hash);
        const rewards = SHOP_ITEMS.filter((i) => i.id === packageId);
        if (rewards.length < 1)
            return Res.notFound("shop item");
        const reward = {
            id: rewards[0].id,
            items: rewards[0].items,
            type: "Shop",
        };
        const newWallet = Rewards.addNcliam(nk, userId, reward);
        //write purchase record
        CryptoPurchase.addTransaction(nk, userId, hash);
        return newWallet.code === "success"
            ? Res.Success(newWallet.data)
            : Res.Error(logger, "failed to claim reward", newWallet.message);
    }
    catch (error) {
        return Res.Error(logger, "failed to validate purchase", error);
    }
};
var CryptoWallet;
(function (CryptoWallet) {
    const collection = "Crypto";
    const key = "Wallet";
    function get(nk, userId) {
        const res = nk.storageRead([{ collection, key, userId }]);
        if (res.length > 0)
            return res[0].value;
        return null;
    }
    CryptoWallet.get = get;
    function set(nk, userId, newWallet) {
        nk.storageWrite([
            {
                collection,
                key,
                userId,
                value: newWallet,
                permissionRead: 2,
                permissionWrite: 0,
            },
        ]);
    }
    CryptoWallet.set = set;
})(CryptoWallet || (CryptoWallet = {}));
var MyketPurchase;
(function (MyketPurchase) {
    MyketPurchase.collection = "Purchase";
    const accessToken = "044f102f-f59a-4bd8-a0a5-51090647767f";
    const PackageName = "com.PlanetMemes.MemeCoinMania";
    const ValidateURL = (sku, token) => `https://developer.myket.ir/api/applications/${PackageName}/purchases/products/${sku}/tokens/${token}`;
    function init(initializer) {
        initializer.registerRpc("purchase", PurchaseRPC);
    }
    MyketPurchase.init = init;
    function save(nk, key, userId, data) {
        try {
            nk.storageWrite([
                {
                    collection: MyketPurchase.collection,
                    key,
                    userId,
                    value: data,
                    permissionRead: 2,
                    permissionWrite: 0,
                },
            ]);
        }
        catch (error) {
            throw new Error(`failed to save Purchase data => ${error.message}`);
        }
    }
    function validateToken(nk, sku, token) {
        const url = ValidateURL(sku, token);
        let res;
        try {
            const headers = { "X-Access-Token": accessToken };
            const body = {
                sku,
                token,
            };
            res = HTTP.request(nk, url, "get", body, headers);
        }
        catch (error) {
            return {
                code: "error",
                message: `validation request failed => ${error.message}`,
            };
        }
        const data = {
            purchaseTime: res.purchaseTime,
            payload: res.developerPayload,
        };
        return res.purchaseState === 0
            ? { code: "success", data }
            : {
                code: "failed",
                message: `purchase has been failed => ${res.messageCode}`,
            };
    }
    function purchaseTokenExists(nk, token, sku) {
        const query = `+token:${token} +sku:${sku}`;
        const { name } = StorageIndex.configs.purchase;
        const results = nk.storageIndexList(name, query, 1);
        return results.length > 0 ? results[0] : undefined;
    }
    function processPurchase(nk, userId, packageId) {
        const filterResults = SHOP_ITEMS.filter((item) => item.id === packageId);
        if (filterResults.length < 1)
            return { code: "notFound", message: "Shop item not found" };
        const item = filterResults[0];
        item.type = "Shop";
        const claimRes = Rewards.addNcliam(nk, userId, item);
        if (claimRes.code !== "success")
            return {
                code: claimRes.code,
                message: `failed to claim item => ${claimRes.message}`,
            };
        return { code: "success" };
    }
    MyketPurchase.purchase = (ctx, logger, nk, payload) => {
        const userId = ctx.userId;
        if (!userId)
            return Res.CalledByServer();
        const { token, sku } = JSON.parse(payload);
        if (!token || !sku)
            return Res.BadRequest();
        const tokenExists = purchaseTokenExists(nk, token, sku);
        if (tokenExists !== undefined)
            return tokenExists.userId === userId
                ? Res.response(false, "alreadyClaimed", undefined, "you have already claimed this")
                : Res.response(false, "expired", undefined, "Duplicate purchase token");
        const validateRes = validateToken(nk, sku, token);
        if (validateRes.code !== "success")
            return Res.response(false, validateRes.code, undefined, validateRes.message);
        const { purchaseTime, payload: purchasePayload } = validateRes.data;
        const result = processPurchase(nk, userId, sku);
        if (result.code !== "success")
            return Res.response(false, result.code, undefined, result.message);
        try {
            const key = `${sku}-${token}`;
            save(nk, key, userId, {
                sku,
                purchaseTime,
                token,
                payload: purchasePayload,
            });
        }
        catch (error) {
            return Res.Error(logger, "failed to save Purchase data in database", error);
        }
        return Res.Success();
    };
})(MyketPurchase || (MyketPurchase = {}));
const PurchaseRPC = (ctx, logger, nk, payload) => {
    return MyketPurchase.purchase(ctx, logger, nk, payload);
};
var Rewards;
(function (Rewards) {
    const collection = "Rewards";
    function init(initializer) {
        initializer.registerRpc("rewards/claim", ClaimRewardRPC);
        initializer.registerRpc("rewards/notClaimed", notClaimedRPC);
    }
    Rewards.init = init;
    function get(nk, type, userId) {
        const data = nk.storageRead([{ collection, key: type, userId }]);
        let rewards = data.length > 0 ? data[0].value.rewards : [];
        let version = data.length > 0 ? data[0].version : undefined;
        return { rewards, version };
    }
    Rewards.get = get;
    function set(nk, userId, type, newRewards, version) {
        const writeObj = {
            collection,
            key: type,
            userId,
            value: { rewards: newRewards },
            permissionRead: 1,
            permissionWrite: 0,
        };
        if (version !== undefined)
            writeObj.version = version;
        const res = nk.storageWrite([writeObj]);
        return res[0].version;
    }
    //add new reward
    function add(nk, userId, reward, expiry) {
        while (true) {
            try {
                const { rewards, version } = get(nk, reward.type, userId);
                reward.claimed = false;
                reward.addTime = Date.now();
                if (expiry !== undefined)
                    reward.expiry = expiry;
                rewards.push(reward);
                set(nk, userId, reward.type, rewards, version);
                break;
            }
            catch (error) {
                if (error.message.indexOf("version check failed") === -1)
                    throw new Error(`failed to add reward: ${error.message}`);
            }
        }
    }
    Rewards.add = add;
    function addNcliam(nk, userId, reward) {
        add(nk, userId, reward);
        return claim(nk, userId, reward.type, reward.id);
    }
    Rewards.addNcliam = addNcliam;
    function rewardIndex(id, rewards) {
        let rewardIndex = -1;
        //reverse order for accessing latest rewards
        const now = Date.now();
        for (let i = rewards.length - 1; i >= 0; i--) {
            const reward = rewards[i];
            if (reward.id === id && reward.claimed === false) {
                if (reward.expiry !== undefined && reward.expiry < now) {
                    continue;
                }
                rewardIndex = i;
                break;
            }
        }
        return rewardIndex;
    }
    function claim(nk, userId, type, rewardId) {
        while (true) {
            try {
                let { rewards, version } = get(nk, type, userId);
                const index = rewardIndex(rewardId, rewards);
                if (index === -1)
                    return { code: "notFound" };
                const rewardItems = rewards[index].items;
                const { wallet } = Wallet.update(nk, userId, rewardItems);
                rewards[index].claimed = true;
                rewards[index].claimTime = Date.now();
                set(nk, userId, type, rewards, version);
                return { code: "success", data: wallet };
            }
            catch (error) {
                if (error.message.indexOf("version check failed") === -1)
                    return { code: "error", message: error.message };
            }
        }
    }
    Rewards.claim = claim;
    function getTierByRank(rank, tierConfig) {
        const TierRanking = ["gold", "silver", "bronze", "normal"];
        if (rank > 0) {
            for (const tier of TierRanking) {
                const tierMaxRank = tierConfig[tier];
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
    function notClaimedRewards(nk, userId, type) {
        const { rewards } = Rewards.get(nk, type, userId);
        const now = Date.now();
        const result = rewards.filter((r) => {
            if (r.expiry !== undefined && r.expiry < now)
                return false;
            if (r.claimed === false)
                return true;
        });
        return result;
    }
    Rewards.notClaimedRewards = notClaimedRewards;
})(Rewards || (Rewards = {}));
const ClaimRewardRPC = (ctx, logger, nk, payload) => {
    const userId = ctx.userId;
    if (!userId)
        return Res.CalledByServer();
    try {
        const input = JSON.parse(payload);
        const { id, type } = input;
        if (!id || !type)
            return Res.BadRequest();
        const res = Rewards.claim(nk, userId, type, id);
        if (res.code === "notFound")
            return Res.notFound("reward");
        return res.code === "success"
            ? Res.Success(res.data, "reward claimed")
            : Res.Error(logger, "failed to claim reward", res.message);
    }
    catch (error) {
        return Res.Error(logger, "failed to claim reward", error);
    }
};
const notClaimedRPC = (ctx, logger, nk, payload) => {
    try {
        const userId = ctx.userId;
        if (!userId)
            return Res.CalledByServer();
        const { type } = JSON.parse(payload);
        if (!type)
            return Res.BadRequest();
        const notClaimed = Rewards.notClaimedRewards(nk, userId, type);
        const ids = notClaimed.map((r) => r.id);
        return Res.Success(ids);
    }
    catch (error) {
        return Res.Error(logger, "failed to get not claimed rewards", error);
    }
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
const VirtualPurchaseRPC = (ctx, logger, nk, payload) => {
    try {
        const userId = ctx.userId;
        if (!userId)
            return Res.CalledByServer();
        let id;
        id = JSON.parse(payload).id;
        if (!id)
            return Res.BadRequest();
        const items = VirtualShop.items.filter((item) => item.id === id);
        if (items.length < 1)
            return Res.notFound("item");
        const item = {
            id: items[0].id,
            items: items[0].items,
            type: "Shop",
        };
        const { wallet } = Wallet.get(nk, userId);
        if (items[0].price > wallet.Coins.quantity)
            return Res.response(false, "notEnoughCoins", null, "not enough coins");
        const newWallet = Wallet.update(nk, userId, [
            { id: "Coins", quantity: -items[0].price },
        ]);
        if (item.items.length > 0)
            Rewards.addNcliam(nk, userId, item);
        return Res.Success(newWallet, "successful purchase");
    }
    catch (error) {
        return Res.Error(logger, "failed to purchase item", error);
    }
};
var Wallet;
(function (Wallet) {
    Wallet.collection = "Economy";
    Wallet.key = "Wallet";
    // const HeartFillInterval = 20 * 60 * 1000; // every 20 minutes
    const HeartFillInterval = 5 * 60 * 1000; // every 5 minute
    const MAX_HEARTS = 5;
    const unlimitables = ["Heart", "TNT", "DiscoBall", "Rocket"];
    function updateWallet(wallet, changeset) {
        changeset.map((cs) => {
            const key = cs.id;
            const item = wallet[key];
            if (cs.time) {
                if (unlimitables.indexOf(key) === -1 || item.endDate === undefined)
                    throw new Error("Cannot add duration to non-unlimited items.");
                const endDate = item.isUnlimited ? item.endDate : Date.now();
                wallet[key].endDate = endDate + cs.time * 1000;
                wallet[key].isUnlimited = true;
            }
            if (cs.quantity && cs.quantity !== 0) {
                if (key === "Heart" && item.quantity + cs.quantity > MAX_HEARTS) {
                    wallet[key].quantity = MAX_HEARTS;
                }
                else {
                    if (wallet[key].quantity + cs.quantity < 0)
                        throw new Error("using more than the quantity");
                    wallet[key].quantity += cs.quantity;
                }
            }
        });
        return wallet;
    }
    function get(nk, userId) {
        const data = nk.storageRead([{ collection: Wallet.collection, key: Wallet.key, userId }]);
        if (data.length < 1)
            throw new Error(`failed to get wallet for ${userId}`);
        const wallet = data[0].value;
        const version = data[0].version;
        return { wallet, version };
    }
    Wallet.get = get;
    function init(nk, userId) {
        set(nk, userId, InitialWallet);
    }
    Wallet.init = init;
    function set(nk, userId, wallet, version) {
        try {
            const writeObj = {
                collection: Wallet.collection,
                key: Wallet.key,
                userId,
                value: wallet,
                permissionRead: 1,
                permissionWrite: 0,
            };
            if (version)
                writeObj.version = version;
            const res = nk.storageWrite([writeObj]);
            const newVersion = res[0].version;
            return newVersion;
        }
        catch (error) {
            throw new Error(`failed to set wallet: wallet: ${JSON.stringify(wallet)} error:${error.message}`);
        }
    }
    function update(nk, userId, changeset) {
        while (true) {
            try {
                let { wallet, version } = get(nk, userId);
                const newWallet = updateWallet(wallet, changeset);
                const newVersion = set(nk, userId, newWallet, version);
                return { wallet: newWallet, version: newVersion };
            }
            catch (error) {
                if (error.message.indexOf("version check failed") === -1)
                    throw new Error(`failed to update Wallet: ${error.message}`);
            }
        }
    }
    Wallet.update = update;
    function checkExpired(nk, userId) {
        try {
            let { wallet, version } = Wallet.get(nk, userId);
            let hasChanged = false;
            for (const key of Object.keys(wallet)) {
                const item = wallet[key];
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
        catch (error) {
            throw new Error(`failed to check expired: ${error.message}`);
        }
    }
    Wallet.checkExpired = checkExpired;
    function heartFillUp(nk, logger, userId) {
        try {
            while (true) {
                let { wallet, version } = get(nk, userId);
                const hearts = wallet.Heart.quantity;
                let nextHeart = wallet.Heart?.next;
                if (hearts >= MAX_HEARTS) {
                    if (nextHeart && nextHeart !== 0) {
                        wallet.Heart.next = 0;
                        set(nk, userId, wallet, version);
                    }
                    return;
                }
                if (!nextHeart || nextHeart === 0) {
                    wallet.Heart.next = Date.now() + HeartFillInterval;
                    nextHeart = wallet.Heart.next;
                    version = set(nk, userId, wallet, version);
                }
                if (Date.now() < nextHeart)
                    return;
                let count = 0;
                while (nextHeart < Date.now()) {
                    count++;
                    nextHeart += HeartFillInterval;
                    if (count + hearts === MAX_HEARTS) {
                        nextHeart = 0;
                        break;
                    }
                }
                const changeSet = [{ id: "Heart", quantity: count }];
                wallet.Heart.next = nextHeart;
                wallet = updateWallet(wallet, changeSet);
                set(nk, userId, wallet, version);
                return;
            }
        }
        catch (error) {
            if (error.message.indexOf("version check") === -1)
                throw new Error(`Heart fillup failed: ${error.message}`);
        }
    }
    Wallet.heartFillUp = heartFillUp;
})(Wallet || (Wallet = {}));
//disable unlimited items if they are expired
const BeforeGetStorage = (ctx, logger, nk, data) => {
    data.objectIds?.forEach((element) => {
        if (element.collection === Wallet.collection &&
            element.key === Wallet.key) {
            const userId = element.userId;
            Wallet.heartFillUp(nk, logger, userId);
            Wallet.checkExpired(nk, userId);
        }
    });
    return data;
};
const BattlePassRewards = [
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
var BattlePass;
(function (BattlePass) {
    const MAX_BONUS_BANK_KEYS = 500;
    const rawData = {
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
        resetSchedule: "*/30 * * * *",
        sortOrder: "descending" /* nkruntime.SortOrder.DESCENDING */,
    };
    function init(nk) {
        nk.leaderboardCreate(BattlePass.config.leaderboardID, BattlePass.config.authoritative, BattlePass.config.sortOrder, BattlePass.config.operator, BattlePass.config.resetSchedule, BattlePass.config.metadata);
    }
    BattlePass.init = init;
    function get(nk, userId) {
        try {
            const { leaderboardID } = BattlePass.config;
            const recordData = nk.leaderboardRecordsList(leaderboardID, [userId], 1);
            let { premium, tier, tierKeys } = rawData;
            let totalKeys = 0;
            if (recordData.ownerRecords && recordData.ownerRecords.length > 0) {
                ({ premium, tier, tierKeys } = recordData.ownerRecords[0]
                    .metadata);
                totalKeys = recordData.ownerRecords[0].score;
            }
            return { totalKeys, tier, tierKeys, premium };
        }
        catch (error) {
            throw new Error(`failed to get BattlePass: ${error.message}`);
        }
    }
    BattlePass.get = get;
    function update(nk, userId, keys, tierKeys, tier, premium) {
        try {
            const { leaderboardID } = BattlePass.config;
            let metadata = get(nk, userId);
            if (tierKeys !== undefined)
                metadata.tierKeys = Math.min(MAX_BONUS_BANK_KEYS, tierKeys);
            if (tier !== undefined)
                metadata.tier = tier;
            if (premium !== undefined)
                metadata.premium = premium;
            const newMeta = metadata;
            nk.leaderboardRecordWrite(leaderboardID, userId, undefined, keys, undefined, newMeta);
        }
        catch (error) {
            throw new Error(`failed to set Battlepass metadata: ${error.message}`);
        }
    }
    BattlePass.update = update;
    function addReward(nk, userId, tier, expiry, subType) {
        const tierRewards = BattlePassRewards[tier][subType];
        if (tierRewards.length < 1)
            return;
        const reward = {
            id: `BP-${subType}-${tier}`,
            items: tierRewards,
            type: "BattlePass",
        };
        Rewards.add(nk, userId, reward, expiry);
    }
    function getStats(nk) {
        const leaderboard = nk.leaderboardsGetId([BattlePass.config.leaderboardID])[0];
        return leaderboard;
    }
    function premiumfy(nk, userId) {
        const data = get(nk, userId);
        if (data.premium)
            return;
        const stats = getStats(nk);
        const expiry = stats.nextReset * 1000;
        for (let tier = 0; tier < data.tier || tier < BattlePassRewards.length; tier++) {
            addReward(nk, userId, tier, expiry, "premium");
        }
        update(nk, userId, undefined, undefined, undefined, true);
    }
    function addKeys(nk, logger, userId, keys) {
        try {
            let { tier, tierKeys, premium } = get(nk, userId);
            const newTier = getTierByKeys(keys, tier, tierKeys);
            const stats = getStats(nk);
            const expiry = stats.nextReset * 1000;
            while (newTier.tier > tier) {
                if (premium)
                    addReward(nk, userId, tier, expiry, "premium");
                addReward(nk, userId, tier, expiry, "free");
                tier++;
            }
            update(nk, userId, keys, newTier.keys, newTier.tier);
        }
        catch (error) {
            throw new Error(`failed to add battlepass keys: ${error.message}`);
        }
    }
    BattlePass.addKeys = addKeys;
    function getTierByKeys(keys, latestTier, tierKeys) {
        try {
            let tier = latestTier;
            let remainedKeys = keys + tierKeys;
            const lastTier = BattlePassRewards.length - 1;
            while (tier < lastTier &&
                remainedKeys >= BattlePassRewards[tier].requiredKeys) {
                remainedKeys -= BattlePassRewards[tier].requiredKeys;
                tier++;
            }
            if (tier >= lastTier)
                remainedKeys = Math.min(MAX_BONUS_BANK_KEYS, remainedKeys);
            return { tier, keys: remainedKeys };
        }
        catch (error) {
            throw new Error(`failed to getTierByKeys: ${error.message}`);
        }
    }
    BattlePass.getTierByKeys = getTierByKeys;
    function BattlePassReset(nk, logger, reset) {
        let cursor = undefined;
        let notifications = [];
        const { leaderboardID } = BattlePass.config;
        const batchSize = 100;
        do {
            const recordData = nk.leaderboardRecordsList(leaderboardID, undefined, batchSize, cursor, reset);
            if (!recordData || !recordData.records)
                break;
            const { records } = recordData;
            for (const r of records) {
                const userId = r.ownerId;
                const metadata = r.metadata;
                if (metadata.tier < BattlePassRewards.length - 1)
                    continue;
                const coins = Math.floor(metadata.tierKeys / 10) * 100;
                if (coins < 1)
                    continue;
                const reward = {
                    id: "Bonus Bank",
                    items: [{ id: "Coins", quantity: coins }],
                    type: "BattlePass",
                };
                Rewards.add(nk, userId, reward);
                const content = {
                    reward,
                };
                const notif = Notifications.create(Notifications.CODES.BattlePassReset, userId, content);
                notifications.push(notif);
            }
            nk.notificationsSend(notifications);
            notifications = [];
            cursor = recordData.nextCursor;
        } while (cursor);
    }
    BattlePass.BattlePassReset = BattlePassReset;
})(BattlePass || (BattlePass = {}));
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
const MAX_SCORE = 1000000;
const leaderboardRewards = {
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
            type: "Leaderboard",
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
        joinRewards: {
            id: "Cup Join",
            items: [{ id: "Heart", time: 900 }],
            type: "Leaderboard",
        },
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
    Endless: {
        config: { gold: 1 },
        gold: [
            { id: "Hammer", quantity: 4 },
            { id: "Shuffle", quantity: 4 },
            { id: "VerticalRocket", quantity: 4 },
            { id: "HorizontalRocket", quantity: 4 },
            { id: "Heart", time: 7200 },
            { id: "Rocket", time: 43200 },
            { id: "DiscoBall", time: 43200 },
            { id: "TNT", time: 43200 },
            { id: "Coins", quantity: 10000 },
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
    Bucket.initializeLeaderboards = (nk, initializer) => {
        for (const id of Object.keys(Bucket.configs)) {
            init(nk, Bucket.configs[id]);
        }
        initializer.registerTournamentReset(tournamentReset);
        initializer.registerBeforeJoinTournament(beforeJointournament);
        initializer.registerRpc(`leaderboard/getRecords`, GetRecordsRPC);
    };
    const init = function (nk, config) {
        nk.tournamentCreate(config.tournamentID, config.authoritative, config.sortOrder, config.operator, config.duration, config.resetSchedule, config.metadata, config.title, config.description, config.category, config.startTime, config.endTime, config.maxSize, config.maxNumScore, config.joinRequired);
    };
    Bucket.configs = {
        Weekly: {
            tournamentID: "Weekly",
            authoritative: true,
            category: Category.WEEKLY,
            duration: 7 * 24 * 60 * 60,
            // duration: 15 * 60, development
            description: "",
            bucketSize: 10,
            endTime: null,
            joinRequired: true,
            maxNumScore: MAX_SCORE,
            maxSize: 1000000,
            metadata: leaderboardRewards.Weekly,
            operator: "increment" /* nkruntime.Operator.INCREMENTAL */,
            resetSchedule: "0 0 * * 1",
            // resetSchedule: "*/15 * * * *",
            sortOrder: "descending" /* nkruntime.SortOrder.DESCENDING */,
            startTime: 0,
            title: "Weekly Leaderboard",
        },
        Cup: {
            tournamentID: "Cup",
            authoritative: true,
            category: Category.CUP,
            duration: 3 * 24 * 60 * 60,
            // duration: 15 * 60,
            description: "",
            bucketSize: 50,
            endTime: null,
            joinRequired: true,
            maxNumScore: MAX_SCORE,
            maxSize: 100000000,
            metadata: leaderboardRewards.Cup,
            operator: "increment" /* nkruntime.Operator.INCREMENTAL */,
            // resetSchedule: "*/15 * * * *",
            resetSchedule: "0 0 */3 * *",
            sortOrder: "descending" /* nkruntime.SortOrder.DESCENDING */,
            startTime: 0,
            title: "Baby Cup",
        },
        Rush: {
            tournamentID: "Rush",
            authoritative: true,
            category: Category.RUSH,
            duration: 12 * 60 * 60,
            // duration: 15 * 60,
            description: "",
            bucketSize: 10,
            endTime: null,
            joinRequired: true,
            maxNumScore: MAX_SCORE,
            maxSize: 100000000,
            metadata: leaderboardRewards.Rush,
            operator: "increment" /* nkruntime.Operator.INCREMENTAL */,
            // resetSchedule: "*/15 * * * *",
            resetSchedule: "* */12 * * *",
            sortOrder: "descending" /* nkruntime.SortOrder.DESCENDING */,
            startTime: 0,
            title: "Baby Rush",
        },
        Endless: {
            tournamentID: "Endless",
            authoritative: true,
            category: Category.ENDLESS,
            duration: 3 * 24 * 60 * 60,
            // duration: 10 * 60,
            description: "",
            bucketSize: 50,
            endTime: null,
            joinRequired: true,
            maxNumScore: MAX_SCORE,
            maxSize: 100000000,
            metadata: leaderboardRewards.Endless,
            operator: "increment" /* nkruntime.Operator.INCREMENTAL */,
            resetSchedule: "0 0 */3 * *",
            // resetSchedule: "*/10 * * * *",
            sortOrder: "descending" /* nkruntime.SortOrder.DESCENDING */,
            startTime: 0,
            title: "Endless Event",
        },
    };
    function getLatestBucketId(nk, leaderBoadrdId) {
        try {
            const collection = leaderBoadrdId;
            const key = Bucket.storage.keys.latest;
            const valueKey = "id";
            const latestBucket = nk.storageRead([
                { collection, key, userId: SystemUserId },
            ]);
            let latestVersion, latestId;
            if (latestBucket.length < 1) {
                latestId = 0;
                latestVersion = setLatestBucketId(nk, leaderBoadrdId, latestId);
            }
            else {
                latestVersion = latestBucket[0].version;
                latestId = parseInt(latestBucket[0].value[valueKey]);
            }
            return { latestId, latestVersion };
        }
        catch (error) {
            throw new Error(`failed to getLatestBucketId: ${error.message}`);
        }
    }
    Bucket.getLatestBucketId = getLatestBucketId;
    function setLatestBucketId(nk, leaderBoadrdId, newId, version) {
        try {
            const collection = leaderBoadrdId;
            const key = Bucket.storage.keys.latest;
            const value = { id: newId };
            const writeObj = {
                collection,
                key,
                userId: SystemUserId,
                value,
                permissionRead: 2,
                permissionWrite: 0,
            };
            if (version)
                writeObj.version = version;
            const res = nk.storageWrite([writeObj]);
            return res[0].version;
        }
        catch (error) {
            throw new Error(`failed to setLatestBucketId: ${error.message}`);
        }
    }
    Bucket.setLatestBucketId = setLatestBucketId;
    function getBucketById(nk, leaderboard, id) {
        const collection = Bucket.storage.collection;
        const key = `${leaderboard}#${id}`;
        try {
            const res = nk.storageRead([{ collection, key, userId: SystemUserId }]);
            if (res.length < 1)
                throw new Error(`Bucket ${key} doesn't exists`);
            const version = res[0].version;
            const bucket = res[0].value;
            return { bucket, version };
        }
        catch (error) {
            throw new Error(`failed to getBucketById: key:${key} collection:${collection} error: ${error.message}`);
        }
    }
    Bucket.getBucketById = getBucketById;
    function createNewBucket(nk, logger, leaderBoadrdId, id, latestBucketVersion) {
        let key = `${leaderBoadrdId}#${id}`;
        try {
            let latestVersion = setLatestBucketId(nk, leaderBoadrdId, id, latestBucketVersion);
            const tournamentInfo = nk.tournamentsGetId([leaderBoadrdId])[0];
            const resetTimeUnix = tournamentInfo.endActive ?? tournamentInfo.endTime ?? 0;
            let bucket = {
                userIds: [],
                resetTimeUnix,
            };
            const res = nk.storageWrite([
                {
                    collection: Bucket.storage.collection,
                    key,
                    userId: SystemUserId,
                    value: bucket,
                    version: "*",
                    permissionRead: 2,
                    permissionWrite: 0,
                },
            ]);
            const version = res[0].version;
            return { bucket, version, latestVersion };
        }
        catch (error) {
            throw new Error(`failed to createNewBucket with id ${key}: ${error.message}`);
        }
    }
    Bucket.createNewBucket = createNewBucket;
    function addUserToBucket(nk, leaderBoadrdId, bucketId, version, bucket) {
        try {
            const collection = Bucket.storage.collection;
            const key = `${leaderBoadrdId}#${bucketId}`;
            nk.storageWrite([
                {
                    collection,
                    key,
                    version,
                    userId: SystemUserId,
                    value: bucket,
                    permissionRead: 2,
                    permissionWrite: 0,
                },
            ]);
        }
        catch (error) {
            throw new Error(`failed to addUserToBucket: ${error.message}`);
        }
    }
    Bucket.addUserToBucket = addUserToBucket;
    function setUserBucket(nk, userId, leaderBoadrdId, id) {
        try {
            nk.storageWrite([
                {
                    collection: Bucket.storage.collection,
                    key: leaderBoadrdId,
                    userId,
                    value: { id },
                    permissionRead: 2,
                    permissionWrite: 0,
                },
            ]);
        }
        catch (error) {
            throw new Error(`failed to setUserBucket: ${error.message}`);
        }
    }
    Bucket.setUserBucket = setUserBucket;
    function getUserBucketId(nk, leaderBoadrdId, userId) {
        const collection = Bucket.storage.collection;
        const userBucket = nk.storageRead([
            { collection, key: leaderBoadrdId, userId },
        ]);
        if (userBucket.length < 1)
            return null;
        const { id } = userBucket[0].value;
        return id;
    }
    Bucket.getUserBucketId = getUserBucketId;
    function getUserBucket(nk, config, userId) {
        try {
            const leaderBoadrdId = config.tournamentID;
            const userBucketId = getUserBucketId(nk, leaderBoadrdId, userId);
            if (!userBucketId)
                return null;
            const { bucket } = Bucket.getBucketById(nk, leaderBoadrdId, userBucketId);
            return bucket;
        }
        catch (error) {
            throw new Error(`failed to getUserBucket: ${error.message}`);
        }
    }
    Bucket.getUserBucket = getUserBucket;
    function joinLeaderboard(nk, logger, ctx, config) {
        const userId = ctx.userId;
        const leaderBoadrdId = config.tournamentID;
        const userBucket = getUserBucket(nk, config, userId);
        if (userBucket) {
            throw new Error(`User Has already joined ${leaderBoadrdId} leaderboard`);
        }
        let attempts = 0;
        //get last bucket
        while (true) {
            try {
                const latestRes = Bucket.getLatestBucketId(nk, leaderBoadrdId);
                let { latestId, latestVersion } = latestRes;
                if (latestId === 0) {
                    const data = Bucket.createNewBucket(nk, logger, leaderBoadrdId, ++latestId, latestVersion);
                    latestVersion = data.latestVersion;
                }
                let { bucket, version } = Bucket.getBucketById(nk, leaderBoadrdId, latestId);
                // if full create new bucket
                if (bucket.userIds.length >= config.bucketSize) {
                    const data = Bucket.createNewBucket(nk, logger, leaderBoadrdId, ++latestId, latestVersion);
                    version = data.version;
                    latestVersion = data.latestVersion;
                    bucket = data.bucket;
                }
                //if not full add user to it
                bucket.userIds.push(userId);
                Bucket.addUserToBucket(nk, leaderBoadrdId, latestId, version, bucket);
                Bucket.setUserBucket(nk, userId, leaderBoadrdId, latestId);
                const rewards = leaderboardRewards[leaderBoadrdId].joinRewards;
                if (rewards)
                    Rewards.addNcliam(nk, userId, rewards);
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
            const tournament = nk.tournamentRecordsList(config.tournamentID, bucket.userIds, config.bucketSize, undefined, time);
            const sorted = tournament.ownerRecords?.sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                return a.updateTime - b.updateTime;
            });
            sorted?.forEach((scoreObj, index) => (scoreObj.rank = index + 1));
            return sorted;
        }
        catch (error) {
            throw new Error(`failed to getRecords: ${error.message}`);
        }
    }
    Bucket.getBucketRecords = getBucketRecords;
    function getBucketRecordsRpc(ctx, nk, config) {
        const userId = ctx.userId;
        if (!userId)
            return Res.CalledByServer();
        //get user bucket
        let bucket = Bucket.getUserBucket(nk, config, userId);
        //if not exists
        if (!bucket)
            return Res.response(false, "dosentExist", null, "user does not exist in this leaderboard");
        const records = getBucketRecords(nk, bucket, config);
        return Res.Success(records);
    }
    Bucket.getBucketRecordsRpc = getBucketRecordsRpc;
    function deleteUserBuckets(nk, logger, tournament) {
        try {
            const config = Bucket.configs[tournament.id];
            const bucketCollection = Bucket.storage.collection;
            const batchSize = 100;
            const leaderBoadrdId = tournament.id;
            let cursur;
            let userObjToDelete = [];
            let notifications = [];
            do {
                const userBuckets = nk.storageList(undefined, bucketCollection, batchSize, cursur);
                if (!userBuckets.objects || userBuckets?.objects.length < 1)
                    return;
                const leaderboardBuckets = userBuckets.objects.filter((o) => o.key === leaderBoadrdId);
                leaderboardBuckets.map((b) => {
                    const userId = b.userId;
                    if (userId === SystemUserId)
                        return;
                    const obj = {
                        collection: bucketCollection,
                        key: leaderBoadrdId,
                        userId,
                    };
                    if (b.value && b.value.id) {
                        const bucketId = b.value.id;
                        const { bucket } = Bucket.getBucketById(nk, leaderBoadrdId, bucketId);
                        const records = Bucket.getBucketRecords(nk, bucket, config, tournament.endActive);
                        let reward = undefined;
                        const userRecord = records?.filter((r) => r.ownerId === userId);
                        if (userRecord && userRecord.length > 0) {
                            const rank = userRecord[0].rank;
                            const rewardsConfig = leaderboardRewards[leaderBoadrdId].config;
                            const tier = Rewards.getTierByRank(rank, rewardsConfig);
                            if (tier) {
                                const rewardItems = leaderboardRewards[leaderBoadrdId][tier];
                                if (rewardItems) {
                                    reward = {
                                        id: leaderBoadrdId,
                                        type: "Leaderboard",
                                        items: rewardItems,
                                    };
                                    Rewards.add(nk, userId, reward);
                                }
                            }
                        }
                        const content = {
                            id: tournament.id,
                            records: records,
                            reward: reward,
                        };
                        let notif = Notifications.create(Notifications.CODES.BucketReset, userId, content);
                        notifications.push(notif);
                        userObjToDelete.push(obj);
                    }
                });
                nk.notificationsSend(notifications);
                nk.storageDelete(userObjToDelete);
                notifications = [];
                cursur = userBuckets.cursor;
            } while (cursur);
        }
        catch (error) {
            logger.error(`failed to delete userBuckets: ${error.message}`);
        }
    }
    Bucket.deleteUserBuckets = deleteUserBuckets;
    function deleteBuckets(nk, logger, leaderBoardId) {
        try {
            const storageIds = nk.storageList(SystemUserId, Bucket.storage.collection, 1000);
            const bucketsToDelete = storageIds.objects?.filter((bucket) => bucket.key.indexOf(leaderBoardId) !== -1);
            if (bucketsToDelete && bucketsToDelete.length > 0) {
                const deleteRequests = bucketsToDelete.map((bucket) => ({
                    collection: bucket.collection,
                    key: bucket.key,
                    userId: SystemUserId,
                }));
                nk.storageDelete(deleteRequests);
            }
        }
        catch (error) {
            logger.error(`failed to delete buckets: ${error.message}`);
        }
    }
    Bucket.deleteBuckets = deleteBuckets;
})(Bucket || (Bucket = {}));
const GetRecordsRPC = (ctx, logger, nk, payload) => {
    try {
        if (!ctx.userId)
            return Res.CalledByServer();
        let id;
        const input = JSON.parse(payload);
        id = input.id;
        if (!id)
            return Res.BadRequest();
        const config = Bucket.configs[id];
        return Bucket.getBucketRecordsRpc(ctx, nk, config);
    }
    catch (error) {
        return Res.Error(logger, "failed to get records", error);
    }
};
// Before Join Leaderboards Hooks
const beforeJointournament = (ctx, logger, nk, data) => {
    const tournamentId = data.tournamentId;
    if (!tournamentId)
        throw new Error("Invalid tournament id");
    const config = Bucket.configs[tournamentId];
    Bucket.joinLeaderboard(nk, logger, ctx, config);
    return data;
};
const tournamentReset = (ctx, logger, nk, tournament, end, reset) => {
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
        // PMC: {
        //   leaderboardID: "PMC",
        //   authoritative: true,
        //   sortOrder: nkruntime.SortOrder.DESCENDING,
        //   operator: nkruntime.Operator.SET,
        //   resetSchedule: "0 0 * * 1", // Every Monday at 00:00
        // },
    };
    class Leaderboard {
        config;
        constructor(config) {
            this.config = config;
        }
        initialize(nk, logger) {
            try {
                nk.leaderboardCreate(this.config.leaderboardID, this.config.authoritative, this.config.sortOrder, this.config.operator, this.config.resetSchedule, this.config.metadata);
                logger.info(`${this.config.leaderboardID} leaderboard created`);
            }
            catch (error) {
                logger.error(`failed to create ${this.config.leaderboardID} leaderboard`);
            }
        }
    }
    Leaderboards.Leaderboard = Leaderboard;
    Leaderboards.initalizeLeaderboards = (initializer, nk, logger) => {
        for (const key of Object.keys(Leaderboards.configs)) {
            const conf = Leaderboards.configs[key];
            new Leaderboard(conf).initialize(nk, logger);
        }
        initializer.registerRpc("leaderboards/metadata", leaderboardMetadataRPC);
        initializer.registerLeaderboardReset(leaderboardReset);
    };
    const updateGlobal = (nk, userId, username, score, subScore) => {
        try {
            const leaderboard = Leaderboards.configs.global;
            nk.leaderboardRecordWrite(leaderboard.leaderboardID, userId, username, score, subScore);
        }
        catch (error) {
            throw new Error(`failed to update global Leaderboard: ${error.message}`);
        }
    };
    function updateEvents(nk, userId, username, levelDifficulty, rushScore) {
        Object.keys(Bucket.configs).map((tournamentId) => {
            try {
                switch (tournamentId) {
                    case "Rush":
                        nk.tournamentRecordWrite(tournamentId, userId, username, rushScore);
                        break;
                    case "Weekly":
                        nk.tournamentRecordWrite(tournamentId, userId, username, 1);
                        break;
                    default:
                        nk.tournamentRecordWrite(tournamentId, userId, username, levelDifficulty);
                        break;
                }
            }
            catch (error) { }
        });
    }
    Leaderboards.UpdateLeaderboards = (nk, logger, userId, username, levelLog) => {
        const { levelNumber } = levelLog;
        //calculate leaderboard score
        const rushScore = levelLog.atEnd.discoBallTargettedTiles || 0;
        const levelDifficulty = Levels.difficulty[levelNumber] || 0;
        updateGlobal(nk, userId, username, 1);
        if (levelLog.levelNumber > 39)
            BattlePass.addKeys(nk, logger, userId, levelDifficulty);
        updateEvents(nk, userId, username, levelDifficulty, rushScore);
    };
})(Leaderboards || (Leaderboards = {}));
const leaderboardMetadataRPC = (ctx, logger, nk, payload) => {
    try {
        let id;
        const input = JSON.parse(payload);
        id = input.id;
        if (!id)
            return Res.BadRequest();
        const leaderboards = nk.leaderboardsGetId([id]);
        if (leaderboards.length < 1)
            return Res.notFound("leaderboard");
        const data = leaderboards[0];
        return Res.Success(data);
    }
    catch (error) {
        return Res.Error(logger, "failed to get metadata", error);
    }
};
const leaderboardReset = (ctx, logger, nk, leaderboard, reset) => {
    switch (leaderboard.id) {
        case BattlePass.config.leaderboardID:
            BattlePass.BattlePassReset(nk, logger, reset);
            break;
    }
};
var Res;
(function (Res) {
    let Code;
    (function (Code) {
        Code[Code["success"] = 0] = "success";
        Code[Code["error"] = 1] = "error";
        Code[Code["notFound"] = 2] = "notFound";
        Code[Code["dosentExist"] = 3] = "dosentExist";
        Code[Code["badRequest"] = 4] = "badRequest";
        Code[Code["serverInternalError"] = 5] = "serverInternalError";
        Code[Code["calledByServer"] = 6] = "calledByServer";
        Code[Code["calledByClient"] = 7] = "calledByClient";
        Code[Code["notEnoughCoins"] = 8] = "notEnoughCoins";
        Code[Code["cheatDetected"] = 9] = "cheatDetected";
        Code[Code["alreadyExists"] = 10] = "alreadyExists";
        Code[Code["expired"] = 11] = "expired";
        Code[Code["failed"] = 12] = "failed";
        Code[Code["alreadyClaimed"] = 13] = "alreadyClaimed";
    })(Code = Res.Code || (Res.Code = {}));
    function response(success, code, data, message, error) {
        const res = {
            success,
            code: Code[code],
            data,
            message,
            error: error?.message,
        };
        return JSON.stringify(res);
    }
    Res.response = response;
    function Success(data, message) {
        return response(true, "success", data, message);
    }
    Res.Success = Success;
    function BadRequest(error) {
        return response(false, "badRequest", undefined, "invalid request body", error);
    }
    Res.BadRequest = BadRequest;
    function CalledByServer() {
        return response(false, "calledByServer", undefined, "called by a server");
    }
    Res.CalledByServer = CalledByServer;
    function Error(logger, message, error) {
        logger.error(`${message}: ${error.message}`);
        return response(false, "error", undefined, message, error);
    }
    Res.Error = Error;
    function notFound(name) {
        return response(false, "notFound", undefined, `${name} not found`);
    }
    Res.notFound = notFound;
})(Res || (Res = {}));
var StorageIndex;
(function (StorageIndex) {
    const MAX_ENTRIES = 1000000000;
    StorageIndex.configs = {
        cryptoWallet: {
            name: "crypto-wallet",
            collection: "Crypto",
            storageKey: "Wallet",
            fields: ["address"],
            maxEntries: MAX_ENTRIES,
        },
        txHash: {
            name: "txHash",
            collection: CryptoPurchase.collection,
            fields: ["transactions"],
            maxEntries: MAX_ENTRIES,
            storageKey: CryptoPurchase.key,
        },
        purchase: {
            name: "purchase",
            collection: MyketPurchase.collection,
            fields: ["token", "sku"],
            maxEntries: MAX_ENTRIES,
            storageKey: "",
        },
    };
    function registerIndexes(initializer) {
        for (const key in StorageIndex.configs) {
            const config = StorageIndex.configs[key];
            const { collection, fields, maxEntries, name, storageKey } = config;
            initializer.registerStorageIndex(name, collection, storageKey, fields, maxEntries);
        }
    }
    StorageIndex.registerIndexes = registerIndexes;
})(StorageIndex || (StorageIndex = {}));
const InitiateUser = (ctx, logger, nk, data, request) => {
    try {
        if (!data.created)
            return;
        Wallet.init(nk, ctx.userId);
        GameApi.LastLevel.set(nk, ctx.userId, 0);
        logger.info(`New User Joined: ${ctx.userId}`);
    }
    catch (error) {
        throw new Error(`Failed to initiate user. cause: ${error.message}`);
    }
};
var WalletIndex;
(function (WalletIndex) {
    const queryMaker = (address) => `+address:${address}`;
    WalletIndex.get = (nk, address) => {
        try {
            const query = queryMaker(address);
            const res = nk.storageIndexList(StorageIndex.configs.cryptoWallet.name, query, 1);
            return res.length > 0 ? res[0] : null;
        }
        catch (error) {
            throw new Error(`failed to check wallet address existance: ${error.message}`);
        }
    };
})(WalletIndex || (WalletIndex = {}));
const WalletConnect = (ctx, logger, nk, payload) => {
    const userId = ctx.userId;
    if (!userId)
        return Res.CalledByServer();
    let data;
    data = JSON.parse(payload);
    if (!data || !data.address)
        return Res.BadRequest();
    let { address } = data;
    try {
        CryptoWallet.set(nk, userId, { address });
        return Res.Success(undefined, "wallet has been connected");
    }
    catch (error) {
        return Res.Error(logger, `Error While Connecting Wallet`, error);
    }
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
    class Validator {
        cheatCheck(levelLog, initialValues) {
            try {
                const { atStart, atEnd } = levelLog;
                const detectedCheats = [
                    ...this.checkHearts(initialValues.heart),
                    ...this.checkBoosters(initialValues.boostersCount, atStart.selectedBoosters),
                    ...this.checkMoves(atEnd.totalMoves, atEnd.levelMaxMoves, atEnd.purchasedMovesCount),
                    ...this.checkPowerUps(initialValues.powerUpsCount, atEnd.usedItems),
                    ...this.checkAbilityUsage(atEnd.targetAbilityblocksPoped, atEnd.abilitUsedTimes),
                ];
                return detectedCheats;
            }
            catch (error) {
                throw new Error(`Cheat Check Error: ${error.message}`);
            }
        }
        checkHearts(heartCount) {
            if (heartCount === 0)
                return ["Started level with no heart!"];
            else if (heartCount < -1 || heartCount > 5)
                return [`Invalid Heart Count: Hearts = ${heartCount}`];
            else
                return [];
        }
        checkBoosters(startCounts, selectedBoosters) {
            const detectedCheats = [];
            for (const booster of LevelValidation.Boosters) {
                const { name, index } = booster;
                const startCount = startCounts[index];
                if (selectedBoosters.indexOf(name) !== -1 && startCount === 0)
                    detectedCheats.push(`Used a Booster Without Having it: ${name}`);
            }
            return detectedCheats;
        }
        checkMoves(totalMoves, levelMaxMoves, purchasedMovesCount) {
            if (levelMaxMoves === -1)
                return []; // time based level
            return totalMoves > levelMaxMoves + purchasedMovesCount
                ? [
                    `Invalid Extra Moves: totalMoves(${totalMoves}) > levelMaxMoves(${levelMaxMoves}) + purchasedMovesCount(${purchasedMovesCount})`,
                ]
                : [];
        }
        static checkLevel(levelNumber, lastLevel) {
            if (levelNumber > lastLevel + 1) {
                return [
                    `level skip detected: lastLevel:${lastLevel}  current:${levelNumber}`,
                ];
            }
            return [];
        }
        checkCoins(startCoins, purchasedMovesCoins, purchasedPowerUps) {
            const purchasedPowerUpsPrice = Math.floor(purchasedPowerUps.reduce((acc, curr) => acc + curr, 0) / 3) *
                600;
            return startCoins < purchasedMovesCoins + purchasedPowerUpsPrice
                ? [
                    `Invalid Coin Count! start(${startCoins}) < purchasedMoves(${purchasedMovesCoins}) + purchasedPowerUps(${purchasedPowerUpsPrice})`,
                ]
                : [];
        }
        checkPowerUps(startPowerUpsCount, usedItems) {
            const detectedCheats = [];
            for (const powerUp of LevelValidation.PowerUps) {
                const { name, index } = powerUp;
                const before = startPowerUpsCount[index];
                const used = usedItems[index];
                if (before < used) {
                    detectedCheats.push(`${name} before:${before} used:${used}`);
                }
            }
            return detectedCheats.length > 0
                ? ["Cheat in PowerUps: " + detectedCheats.join(", ")]
                : [];
        }
        checkAbilityUsage(targetAbilityblocksPoped, abilitUsedTimes) {
            return abilitUsedTimes > targetAbilityblocksPoped / 10
                ? [
                    `Used ability more than allowed count: allowed: ${Math.floor(targetAbilityblocksPoped / 10)} used: ${abilitUsedTimes}`,
                ]
                : [];
        }
    }
    LevelValidation.Validator = Validator;
    function extractData(log, initialValues) {
        try {
            const boosters = LevelValidation.Boosters.reduce((acc, curr) => {
                const selected = log.atStart.selectedBoosters.indexOf(curr.name);
                const initCount = initialValues.boostersCount[curr.index];
                const result = selected !== -1 ? -1 : 0;
                if (initCount > 0 && result !== 0) {
                    acc.push({
                        id: curr.name,
                        quantity: result,
                    });
                }
                return acc;
            }, []);
            const powerUps = LevelValidation.PowerUps.reduce((acc, curr) => {
                const usedCount = log.atEnd.usedItems[curr.index];
                const initCount = initialValues.powerUpsCount[curr.index];
                const result = initCount - (initCount + usedCount);
                if (result !== 0) {
                    acc.push({
                        id: LevelValidation.PowerUps[curr.index].name,
                        quantity: result,
                    });
                }
                return acc;
            }, []);
            const coins = {
                id: "Coins",
                quantity: log.atEnd.coinsRewarded,
            };
            const heartCount = log.atEnd.result !== "win" && initialValues.heart > 0 ? -1 : 0;
            const hearts = {
                id: "Heart",
                quantity: heartCount,
            };
            const result = [
                ...boosters,
                ...powerUps,
                coins,
                hearts,
            ];
            return result;
        }
        catch (error) {
            throw new Error(`Error while extracting data from log: ${error.message}`);
        }
    }
    LevelValidation.extractData = extractData;
    LevelValidation.initialValues = (nk, userId) => {
        const { wallet } = Wallet.get(nk, userId);
        const boostersCount = [
            wallet.TNT.isUnlimited ? -1 : wallet.TNT.quantity,
            wallet.DiscoBall.isUnlimited ? -1 : wallet.DiscoBall.quantity,
            wallet.Rocket.isUnlimited ? -1 : wallet.Rocket.quantity,
        ];
        const powerUpsCount = [
            wallet.Hammer.quantity,
            wallet.VerticalRocket.quantity,
            wallet.Shuffle.quantity,
            wallet.HorizontalRocket.quantity,
        ];
        return {
            boostersCount,
            coins: wallet.Coins.quantity,
            powerUpsCount,
            heart: wallet.Heart.isUnlimited ? -1 : wallet.Heart.quantity,
        };
    };
})(LevelValidation || (LevelValidation = {}));
const levelValidatorRPC = (ctx, logger, nk, payload) => {
    try {
        const userId = ctx.userId;
        if (!userId)
            return Res.CalledByServer();
        const initalValues = LevelValidation.initialValues(nk, userId);
        let levelLog;
        levelLog = JSON.parse(payload);
        if (!levelLog)
            return Res.BadRequest();
        //save log in storage
        GameApi.LevelLog.save(nk, userId, levelLog);
        //checking cheats
        const validator = new LevelValidation.Validator();
        const cheats = validator.cheatCheck(levelLog, initalValues);
        if (cheats.length > 0) {
            GameApi.Cheat.write(nk, levelLog.levelNumber, userId, cheats);
            return Res.response(false, "cheatDetected", cheats, "cheats detected");
        }
        if (levelLog.atEnd.result === "win") {
            GameApi.LastLevel.increment(nk, userId);
            Leaderboards.UpdateLeaderboards(nk, logger, userId, ctx.username, levelLog);
        }
        //update inventory
        const changeSet = LevelValidation.extractData(levelLog, initalValues);
        const { wallet } = Wallet.update(nk, userId, changeSet);
        return Res.Success(wallet);
    }
    catch (error) {
        return Res.Error(logger, `failed to validate level`, error);
    }
};
