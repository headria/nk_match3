import { Client } from "@heroiclabs/nakama-js";
import { v4 } from "uuid";
import { encode } from "js-base64";

const newUser = async (): Promise<void> => {
  var client = new Client("defaulthttpkey", "nk.planetmemes.com", "443", true);
  const deviceId = await v4();

  console.log(encode("defaulthttpkey" + ":"));
  console.log(deviceId);
  try {
    await client.authenticateDevice(deviceId, true, "headria");
  } catch (err: any) {
    console.log(
      "Error authenticating device: %o:%o",
      err.statusCode,
      err.message,
      err.bodyUsed,
      err.status,
      err.url,
      err.body
    );
  }
};
newUser();
