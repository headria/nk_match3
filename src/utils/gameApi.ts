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
      } catch (error: any) {
        throw new Error(`failed to save LevelLog: ${error.message}`);
      }
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
      levelNumber: number,
      userId: string,
      cheats: string[]
    ): void {
      try {
        nk.storageWrite([
          {
            collection: this.Keys.collection,
            key: (levelNumber || -1).toString(),
            userId,

            value: { cheats },
            permissionRead: 2,
            permissionWrite: 0,
          },
        ]);
      } catch (error: any) {
        throw new Error(`failed to save Cheats: ${error.message}`);
      }
    }
  },
  Crypto: class {
    static Keys = {
      collection: "Crypto",
      key: "Wallet",
    };
  },
};
