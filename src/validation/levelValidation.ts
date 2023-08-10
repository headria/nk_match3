namespace LevelValidation {
  export type ILevelLog = {
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

  export type WalletItem = {
    id: string;
    quantity: number;
  };

  export const PowerUps = [
    { name: "Hammer", index: 0 },
    { name: "VerticalRocket", index: 1 },
    { name: "Shuffle", index: 2 },
    { name: "HorizontalRocket", index: 3 },
  ];
  export const Boosters = [
    { name: "TNT", index: 0 },
    { name: "Discoball", index: 1 },
    { name: "Rocket", index: 2 },
  ];

  export class Validator {
    cheatCheck(levelLog: ILevelLog) {
      try {
        const { atStart, atEnd } = levelLog;
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
      for (const booster of Boosters) {
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

    static checkLevel(levelNumber: number, lastLevel: number): string[] {
      if (levelNumber > lastLevel + 1) {
        return [
          `level skip detected: lastLevel:${lastLevel}  current:${levelNumber}`,
        ];
      }
      return [];
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
      for (const powerUp of PowerUps) {
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

  export function extractData(log: ILevelLog): WalletItem[] {
    try {
      const boosters: WalletItem[] = Boosters.reduce((acc: any, curr) => {
        const quantity = log.atEnd.boostersCount[curr.index];
        if (quantity > -1) {
          acc.push({
            id: curr.name,
            quantity,
          });
        }
        return acc;
      }, []);

      const powerUps: WalletItem[] = PowerUps.map((curr) => ({
        id: curr.name,
        quantity: log.atEnd.powerUpsCount[curr.index],
      }));

      const coins: WalletItem = {
        id: "Coins",
        quantity: log.atEnd.coins - log.atStart.coins,
      };

      const result: WalletItem[] = [...boosters, ...powerUps, coins];

      if (log.atStart.heart != -1) {
        const hearts =
          log.atEnd.result !== "win"
            ? log.atStart.heart - 1
            : log.atStart.heart;
        result.push({
          id: "Heart",
          quantity: hearts,
        });
      }
      return result;
    } catch (error: any) {
      throw new Error(`Error while extracting data from log: ${error.message}`);
    }
  }
}

const levelValidatorRPC: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
) => {
  try {
    const levelLog: LevelValidation.ILevelLog = JSON.parse(payload);
    GameApi.LevelLog.save(nk, ctx.userId, levelLog);

    const validator = new LevelValidation.Validator();
    const cheats = validator.cheatCheck(levelLog);

    const lastLevel = GameApi.LastLevel.get(nk, ctx.userId);
    if (levelLog.atEnd.result === "win")
      GameApi.LastLevel.set(nk, ctx.userId, lastLevel + 1);

    cheats.push(
      ...LevelValidation.Validator.checkLevel(levelLog.levelNumber, lastLevel)
    );

    if (cheats.length > 0) {
      GameApi.Cheat.write(nk, ctx.userId, levelLog, cheats);
    }

    //update inventory
    const extractData = LevelValidation.extractData(levelLog);
    const wallet = nk.storageRead([
      { collection: "Economy", key: "Wallet", userId: ctx.userId },
    ])[0].value;
    // logger.debug(`Inventory: ${JSON.stringify(wallet)}`);
    // logger.debug(`extracted: ${JSON.stringify(extractData)}`);

    extractData.map((item: LevelValidation.WalletItem) => {
      if (typeof wallet[item.id] === "number") wallet[item.id] = item.quantity;
      else wallet[item.id].quantity = item.quantity;
    });
    // logger.debug(`New Inventory: ${JSON.stringify(wallet)}`);

    nk.storageWrite([
      {
        collection: "Economy",
        key: "Wallet",
        userId: ctx.userId,
        value: wallet,
        version: "*",
        permissionRead: 1,
        permissionWrite: 0,
      },
    ]);
    // logger.debug("Inventory Updated");
  } catch (error: any) {
    logger.error(`failed to validate level: ${error.message}`);
    throw error;
  }
};
