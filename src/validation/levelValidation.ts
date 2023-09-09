namespace LevelValidation {
  type BeforeStartValues = {
    coins: number;
    heart: number;
    powerUpsCount: number[];
    boostersCount: number[];
  };
  export type ILevelLog = {
    levelNumber: number;
    atStart: {
      tournamentId: string | null;
      selectedBoosters: string[];
      // time: number;
    };
    atEnd: {
      tournamentId: string | null;
      totalMoves: number;
      levelMaxMoves: number;
      purchasedMovesCount: number;
      // purchasedMovesCoins: number;
      // time: number;
      result: string;
      // coins: number;
      coinsRewarded: number;
      // powerUpsCount: number[];
      // purchasedPowerUps: number[];
      // boostersCount: number[];
      targetAbilityblocksPoped: number;
      abilitUsedTimes: number;
      discoBallTargettedTiles: number;
      usedItems: number[];
    };
  };

  export const PowerUps = [
    { name: "Hammer", index: 0 },
    { name: "VerticalRocket", index: 1 },
    { name: "Shuffle", index: 2 },
    { name: "HorizontalRocket", index: 3 },
  ];
  export const Boosters = [
    { name: "TNT", index: 0 },
    { name: "DiscoBall", index: 1 },
    { name: "Rocket", index: 2 },
  ];

  export class Validator {
    cheatCheck(levelLog: ILevelLog, initialValues: BeforeStartValues) {
      try {
        const { atStart, atEnd } = levelLog;
        const detectedCheats: string[] = [
          ...this.checkHearts(initialValues.heart),
          ...this.checkBoosters(
            initialValues.boostersCount,
            atStart.selectedBoosters
          ),
          ...this.checkMoves(
            atEnd.totalMoves,
            atEnd.levelMaxMoves,
            atEnd.purchasedMovesCount
          ),
          ...this.checkPowerUps(initialValues.powerUpsCount, atEnd.usedItems),
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

    checkBoosters(startCounts: number[], selectedBoosters: string[]): string[] {
      const detectedCheats: string[] = [];
      for (const booster of Boosters) {
        const { name, index } = booster;
        const startCount = startCounts[index];
        if (selectedBoosters.indexOf(name) !== -1 && startCount === 0)
          detectedCheats.push(`Used a Booster Without Having it: ${name}`);
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
    checkCoins(
      startCoins: number,
      purchasedMovesCoins: number,
      purchasedPowerUps: number[]
    ): string[] {
      const purchasedPowerUpsPrice =
        Math.floor(purchasedPowerUps.reduce((acc, curr) => acc + curr, 0) / 3) *
        600;

      return startCoins < purchasedMovesCoins + purchasedPowerUpsPrice
        ? [
            `Invalid Coin Count! start(${startCoins}) < purchasedMoves(${purchasedMovesCoins}) + purchasedPowerUps(${purchasedPowerUpsPrice})`,
          ]
        : [];
    }

    checkPowerUps(startPowerUpsCount: number[], usedItems: number[]): string[] {
      const detectedCheats: string[] = [];
      for (const powerUp of PowerUps) {
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

  export function extractData(
    log: ILevelLog,
    initialValues: BeforeStartValues
  ): Wallet.ChangeSetItem[] {
    try {
      const boosters: Wallet.ChangeSetItem[] = Boosters.reduce(
        (acc: Wallet.ChangeSetItem[], curr) => {
          const selected = log.atStart.selectedBoosters.indexOf(curr.name);
          const initCount = initialValues.boostersCount[curr.index];
          const result = selected !== -1 ? -1 : 0;
          if (initCount > 0 && result !== 0) {
            acc.push({
              id: curr.name as keyof Wallet.IWallet,
              quantity: result,
            });
          }
          return acc;
        },
        []
      );
      const powerUps: Wallet.ChangeSetItem[] = PowerUps.reduce(
        (acc: Wallet.ChangeSetItem[], curr) => {
          const usedCount = log.atEnd.usedItems[curr.index];
          const initCount = initialValues.powerUpsCount[curr.index];
          const result = initCount - (initCount + usedCount);
          if (result !== 0) {
            acc.push({
              id: PowerUps[curr.index].name as keyof Wallet.IWallet,
              quantity: result,
            });
          }
          return acc;
        },
        []
      );

      const coins: Wallet.ChangeSetItem = {
        id: "Coins",
        quantity: log.atEnd.coinsRewarded,
      };
      const heartCount =
        log.atEnd.result !== "win" && initialValues.heart > 0 ? -1 : 0;
      const hearts: Wallet.ChangeSetItem = {
        id: "Heart",
        quantity: heartCount,
      };

      const result: Wallet.ChangeSetItem[] = [
        ...boosters,
        ...powerUps,
        coins,
        hearts,
      ];

      return result;
    } catch (error: any) {
      throw new Error(`Error while extracting data from log: ${error.message}`);
    }
  }

  export const initialValues = (nk: nkruntime.Nakama, userId: string) => {
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
}

const levelValidatorRPC: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
) => {
  try {
    const userId: string = ctx.userId;
    if (!userId) return Res.CalledByServer();

    const initalValues = LevelValidation.initialValues(nk, userId);
    let levelLog: LevelValidation.ILevelLog;

    levelLog = JSON.parse(payload);
    if (!levelLog) return Res.BadRequest();

    //save log in storage
    GameApi.LevelLog.save(nk, userId, levelLog);

    //checking cheats
    const validator = new LevelValidation.Validator();
    const cheats = validator.cheatCheck(levelLog, initalValues);

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
      Leaderboards.UpdateLeaderboards(
        nk,
        logger,
        userId,
        ctx.username,
        levelLog
      );
    }

    //update inventory
    const changeSet = LevelValidation.extractData(levelLog, initalValues);
    const { wallet } = Wallet.update(nk, userId, changeSet);
    return Res.Success(wallet);
  } catch (error: any) {
    return Res.Error(logger, `failed to validate level`, error);
  }
};
