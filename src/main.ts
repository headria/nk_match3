const dummyUserDeviceId = "B1DA5988-FC6F-4B6F-8EA9-217DEEC3CDB6";
const dummyUserDeviceUsername = "dummyUser";

const InitModule: nkruntime.InitModule = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  initializer: nkruntime.Initializer
) {
  // Add at least one user to the system.
  nk.authenticateDevice(dummyUserDeviceId, dummyUserDeviceUsername, true);

  initializer.registerRpc("initialize_user_wallet", rpcInitializeUserWallet);
};
