const GameApi = {
  LastLevel: {
    Keys: {
      collection: "levels",
      key: "data",
      id: "number",
    },
    get: (nk: nkruntime.Nakama, userId: string): number => {
      try {
        const keys = GameApi.LastLevel.Keys;
        const storageObjects = nk.storageRead([
          {
            collection: keys.collection,
            key: keys.key,
            userId,
          },
        ]);
        const lastLevel: number = storageObjects[0].value[keys.id];
        return lastLevel;
      } catch (error: any) {
        throw new Error("failed to get Last level: " + error.message);
      }
    },

    set: (nk: nkruntime.Nakama, userId: string, newValue: number) => {
      try {
        const keys = GameApi.LastLevel.Keys;
        const value = { [keys.id]: newValue };
        nk.storageWrite([
          {
            collection: keys.collection,
            key: keys.key,
            userId,
            value,
          },
        ]);
      } catch (error: any) {
        throw new Error("failed to set Last level: " + error.message);
      }
    },
  },
  LevelLog: {
    Keys: {
      collection: "Levels",
      key: "Log",
    },
    set: (
      nk: nkruntime.Nakama,
      userId: string,
      data: LevelValidation.ILevelLog
    ) => {
      const keys = GameApi.LevelLog.Keys;
      nk.storageWrite([
        {
          collection: keys.collection,
          key: keys.key,
          userId,
          value: data,
          permissionRead: 2,
          permissionWrite: 0,
        },
      ]);
    },
    get: (nk: nkruntime.Nakama, userId: string) => {
      const keys = GameApi.LevelLog.Keys;
      const data = nk.storageRead([
        { collection: keys.collection, key: keys.key, userId },
      ]);
    },
  },
};
