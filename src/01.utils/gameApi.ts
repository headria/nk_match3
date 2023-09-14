const SystemUserId = "00000000-0000-0000-0000-000000000000";

const GameApi = {
  LastLevel: class {
    static Keys = {
      collection: "Levels",
      key: "Data",
    };
    static id = "progress";
    static get(
      nk: nkruntime.Nakama,
      userId: string
    ): { level: number; version: string } {
      try {
        const storageObjects = nk.storageRead([
          {
            collection: this.Keys.collection,
            key: this.Keys.key,
            userId,
          },
        ]);
        const lastLevel: number = storageObjects[0].value[this.id];
        return { version: storageObjects[0].version, level: lastLevel };
      } catch (error: any) {
        throw new Error("failed to get Last level: " + error.message);
      }
    }

    static set(
      nk: nkruntime.Nakama,
      userId: string,
      newValue: number,
      version?: string
    ) {
      try {
        const value = { [this.id]: newValue };
        const writeReq: nkruntime.StorageWriteRequest = {
          collection: this.Keys.collection,
          key: this.Keys.key,
          userId,
          value,
        };
        if (version !== undefined) writeReq.version = version;
        nk.storageWrite([writeReq]);
      } catch (error: any) {
        throw new Error("failed to set Last level => " + error.message);
      }
    }
    static increment(nk: nkruntime.Nakama, userId: string) {
      const { level, version } = GameApi.LastLevel.get(nk, userId);
      GameApi.LastLevel.set(nk, userId, level + 1, version);
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
        throw new Error(`failed to save LevelLog => ${error.message}`);
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
            key: levelNumber.toString(),
            userId,
            value: { cheats },
            permissionRead: 2,
            permissionWrite: 0,
          },
        ]);
      } catch (error: any) {
        throw new Error(`failed to save Cheats => ${error.message}`);
      }
    }
  },
};
