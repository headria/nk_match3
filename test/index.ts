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
  const deviceId = "2d3b8d16-1b01-4a98-a6d0-7d7d8a444c16";
  console.log(deviceId);
  try {
    const session = await client.authenticateDevice(deviceId);

    const data = {
      address: "Ahmad2",
    };

    await client.rpc(session, "user/walletconnect", data);
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
