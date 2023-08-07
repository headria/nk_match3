type ILevelLog = {
  playerId: string;
  levelNumber: number;
  atStart: {
    coins: number;
    heart: number;
    powerUpsCount: number[];
    boostersCount: number[];
    selectedBoosters: string[];
    time: number;
  };
  atEnd: {
    totalMoves: number;
    levelMaxMoves: number;
    purchasedMovesCount: number;
    purchasedMovesCoins: number;
    time: number;
    result: string;
    coins: number;
    coinsRewarded: number;
    powerUpsCount: number[];
    purchasedPowerUps: number[];
    boostersCount: number[];
    targetAbilityblocksPoped: number;
    abilitUsedTimes: number;
    usedItems: number[];
  };
};

class LevelValidator {
  static PowerUps = [
    { name: "Hammer", id: "HAMMER", index: 0 },
    { name: "VerticalRocket", id: "VERTICAL_ROCKET", index: 1 },
    { name: "Shuffle", id: "SHUFFLE", index: 2 },
    { name: "HorizontalRocket", id: "HORIZONTAL_ROCKET", index: 3 },
  ];
  static Boosters = [
    { name: "TNT", id: "TNT", index: 0 },
    { name: "DiscoBall", id: "DISCO_BALL", index: 1 },
    { name: "Rocket", id: "ROCKET", index: 2 },
  ];

  constructor(private levelLog: ILevelLog) {}

  cheatCheck() {
    try {
      const { atStart, atEnd } = this.levelLog;
      const detectedCheats: string[] = [
        ...this.checkHearts(atStart.heart),
        ...this.checkBoosters(
          atStart.boostersCount,
          atEnd.boostersCount,
          atStart.selectedBoosters
        ),
        ...this.checkMoves(
          atEnd.totalMoves,
          atEnd.levelMaxMoves,
          atEnd.purchasedMovesCount
        ),
        ...this.checkTime(atStart.time, atEnd.time),
        ...this.checkCoins(
          atStart.coins,
          atEnd.coins,
          atEnd.purchasedMovesCoins,
          atEnd.purchasedPowerUps
        ),
        ...this.checkPowerUps(
          atStart.powerUpsCount,
          atEnd.powerUpsCount,
          atEnd.purchasedPowerUps,
          atEnd.usedItems
        ),
        ...this.checkAbilityUsage(
          atEnd.targetAbilityblocksPoped,
          atEnd.abilitUsedTimes
        ),
      ];

      return detectedCheats;
    } catch (error: any) {
      throw new Error(`Cheat Check Error: ${error.message}`);
    }
  }
  checkHearts(heartCount: number): string[] {
    if (heartCount === 0) return ["Started level with no heart!"];
    else if (heartCount < -1 || heartCount > 5)
      return [`Invalid Heart Count: Hearts = ${heartCount}`];
    else return [];
  }

  checkBoosters(
    startCounts: number[],
    endCounts: number[],
    selectedBoosters: string[]
  ): string[] {
    const detectedCheats: string[] = [];
    for (const booster of LevelValidator.Boosters) {
      const { name, index } = booster;
      const startCount = startCounts[index];
      const endCount = endCounts[index];

      if (selectedBoosters.indexOf(name) !== -1) {
        if (startCount === 0) {
          detectedCheats.push(`Used a Booster Without Having it: ${name}`);
        } else if (startCount !== -1 && startCount <= endCount) {
          detectedCheats.push(
            `Used a booster without reducing quantity: ${name}`
          );
        }
      } else if (startCount < -1 || endCount > startCount || endCount < -1) {
        detectedCheats.push(
          `Invalid Booster Count! ${name} = { before: ${startCount} after: ${endCount} }`
        );
      }
    }
    return detectedCheats;
  }

  checkMoves(
    totalMoves: number,
    levelMaxMoves: number,
    purchasedMovesCount: number
  ): string[] {
    if (levelMaxMoves === -1) return []; // time based level

    return totalMoves > levelMaxMoves + purchasedMovesCount
      ? [
          `Invalid Extra Moves: totalMoves(${totalMoves}) > levelMaxMoves(${levelMaxMoves}) + purchasedMovesCount(${purchasedMovesCount})`,
        ]
      : [];
  }

  checkTime(startTime: number, endTime: number): string[] {
    return endTime - startTime < 1000 ? ["Time less than one second"] : [];
  }

  checkCoins(
    startCoins: number,
    endCoins: number,
    purchasedMovesCoins: number,
    purchasedPowerUps: number[]
  ): string[] {
    const purchasedPowerUpsPrice =
      Math.floor(purchasedPowerUps.reduce((acc, curr) => acc + curr, 0) / 3) *
      600;

    return endCoins !==
      startCoins - purchasedMovesCoins - purchasedPowerUpsPrice
      ? ["Invalid Coin Count!"]
      : [];
  }

  checkPowerUps(
    startPowerUpsCount: number[],
    endPowerUpsCount: number[],
    purchasedPowerUps: number[],
    usedItems: number[]
  ): string[] {
    const detectedCheats: string[] = [];
    for (const powerUp of LevelValidator.PowerUps) {
      const { name, index } = powerUp;
      const before = startPowerUpsCount[index];
      const after = endPowerUpsCount[index];
      const purchased = purchasedPowerUps[index];
      const used = usedItems[index];

      if (after !== before + purchased - used) {
        detectedCheats.push(`Cheat In PowerUps: ${name}`);
      }
    }
    return detectedCheats;
  }

  checkAbilityUsage(
    targetAbilityblocksPoped: number,
    abilitUsedTimes: number
  ): string[] {
    return abilitUsedTimes > targetAbilityblocksPoped / 10
      ? [
          `Used ability more than allowed count: allowed: ${Math.floor(
            targetAbilityblocksPoped / 10
          )} used: ${abilitUsedTimes}`,
        ]
      : [];
  }
}

const levelValidatorRPC: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
) => {
  const levelLog: ILevelLog = JSON.parse(payload);
  const validator = new LevelValidator(levelLog);
  const cheats = validator.cheatCheck();
  logger.debug(JSON.stringify(cheats));
  const lastLevel = getLastLevel(nk, ctx.userId);
  logger.debug(JSON.stringify(lastLevel));
  if (levelLog.levelNumber > lastLevel + 1) {
    throw new Error(
      `level skip detected: lastLevel:${lastLevel}  current:${levelLog.levelNumber}`
    );
  }
  setLastLevel(nk, ctx.userId, lastLevel + 1);

  if (cheats.length > 0) {
    throw new Error(`cheats detected:\n ${cheats.toString()}`);
  }
};

const LastLevelKeys = {
  collection: "levels",
  key: "data",
  id: "number",
};

const getLastLevel = (nk: nkruntime.Nakama, userId: string): number => {
  try {
    const storageObjects = nk.storageRead([
      { collection: LastLevelKeys.collection, key: LastLevelKeys.key, userId },
    ]);
    const lastLevel: number = storageObjects[0].value[LastLevelKeys.id];
    return lastLevel;
  } catch (error: any) {
    throw new Error("failed to get Last level: " + error.message);
  }
};

const setLastLevel = (
  nk: nkruntime.Nakama,
  userId: string,
  newValue: number
) => {
  try {
    const value = { [LastLevelKeys.id]: newValue };
    nk.storageWrite([
      {
        collection: LastLevelKeys.collection,
        key: LastLevelKeys.key,
        userId,
        value,
      },
    ]);
  } catch (error: any) {
    throw new Error("failed to set Last level: " + error.message);
  }
};
