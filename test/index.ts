import { Client } from "@heroiclabs/nakama-js";
import { v4 } from "uuid";
import { encode } from "js-base64";
import { ApiUpdateAccountRequest } from "@heroiclabs/nakama-js/dist/api.gen";

var client = new Client("defaultkey", "nk.planetmemes.com", "443", true);

const newUser = async (): Promise<void> => {
  const deviceId = v4();

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
const updateAccount = async () => {
  const deviceId = v4();
  console.log(deviceId);
  try {
    const session = await client.authenticateDevice(deviceId);

    const data: ApiUpdateAccountRequest = {
      display_name: "Ahmad",
      timezone: "GST",
    };

    const result = await client.updateAccount(session, data);
    console.log(result);
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

const updateWallet = async () => {
  const deviceId = "1ddd1b2a-1bac-49e5-931e-a6e69b68f586";
  console.log(deviceId);
  try {
    const session = await client.authenticateDevice(deviceId);

    const data = {
      address: "Ahmad",
    };

    var response = await client.rpc(session, "user/walletconnect", data);
    console.log(response);
  } catch (err: any) {
    console.log(
      "Error authenticating device: %o:%o",
      err.statusCode,
      err.message,
      err.bodyUsed,
      err.status,
      err.url,
      err.body,
      err.statusText
    );
  }
};

updateWallet();
