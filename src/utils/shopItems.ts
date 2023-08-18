const SHOP_ITEMS = [
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

const initShop = (nk: nkruntime.Nakama) => {
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
