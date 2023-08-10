const GameApi = {
  LastLevel: class {
    static Keys = {
      collection: "Levels",
      key: "Data",
    };
    static id = "progress";
    static get(nk: nkruntime.Nakama, userId: string): number {
      try {
        const storageObjects = nk.storageRead([
          {
            collection: this.Keys.collection,
            key: this.Keys.key,
            userId,
          },
        ]);
        const lastLevel: number = storageObjects[0].value[this.id];
        return lastLevel;
      } catch (error: any) {
        throw new Error("failed to get Last level: " + error.message);
      }
    }

    static set(nk: nkruntime.Nakama, userId: string, newValue: number) {
      try {
        const value = { [this.id]: newValue };
        nk.storageWrite([
          {
            collection: this.Keys.collection,
            key: this.Keys.key,
            version: "*",
            userId,
            value,
          },
        ]);
      } catch (error: any) {
        throw new Error("failed to set Last level: " + error.message);
      }
    }
  },
  LevelLog: class {
    static Keys = {
      collection: "Levels",
    };
    static save(
      nk: nkruntime.Nakama,
      userId: string,
      data: LevelValidation.ILevelLog
    ): void {
      nk.storageWrite([
        {
          collection: this.Keys.collection,
          key: data.levelNumber.toString(),
          userId,
          version: "*",
          value: data,
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
    }
    static get(nk: nkruntime.Nakama, userId: string, levelNumber: string) {
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
    static write(
      nk: nkruntime.Nakama,
      userId: string,
      levelLog: LevelValidation.ILevelLog,
      cheats: string[]
    ): void {
      nk.storageWrite([
        {
          collection: this.Keys.collection,
          key: levelLog.levelNumber.toString(),
          userId,
          value: { cheats, levelLog },
          version: "*",
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
    }
  },
  Crypto: class {
    static Keys = {
      collection: "Crypto",
      key: "Wallet",
    };
  },
};
