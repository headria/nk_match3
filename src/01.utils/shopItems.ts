type ShopItem = {
  id: string;
  name: string;
  type: string;
  items: Rewards.RewardItem[];
  price: number;
};

const SHOP_ITEMS: ShopItem[] = [
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

const initShop = (nk: nkruntime.Nakama) => {
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
