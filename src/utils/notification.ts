namespace Notifications {
  export enum CODES {
    SYSTEM,
    BucketReset,
    BattlePassReset,
  }

  type NotifConfig = Omit<nkruntime.Notification, "content" | "userId">;
  type NotifCodes = Exclude<CODES, 0>;
  type Notif = {
    [code in NotifCodes]: NotifConfig;
  };

  export const Notifs: Notif = {
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
  export function create(
    code: NotifCodes,
    userId: string,
    content: { [key: string]: any }
  ): nkruntime.Notification {
    const { persistent, senderId, subject } = Notifs[code];
    const data: nkruntime.Notification = {
      code,
      content,
      persistent,
      senderId,
      subject,
      userId,
    };
    return data;
  }
}
