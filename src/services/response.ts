namespace Res {
  export enum Code {
    success,
    error,
    notFound,
    dosentExist,
    badRequest,
    serverInternalError,
    calledByServer,
    calledByClient,
    notEnoughCoins,
    cheatDetected,
    alreadyExists,
    expired,
    failed,
  }

  export type Response = {
    success: boolean;
    code: Code;
    data?: any;
    message?: string;
    error?: string;
  };

  type CODES = keyof typeof Code;

  export type ServiceRes = Omit<Response, "code" | "success"> & {
    code: CODES;
  };

  export function response(
    success: boolean,
    code: CODES,
    data?: any,
    message?: string,
    error?: any
  ) {
    const res: Response = {
      success,
      code: Code[code],
      data,
      message,
      error: error?.message,
    };
    return JSON.stringify(res);
  }

  export function Success(data?: any, message?: string) {
    return response(true, "success", data, message);
  }

  export function BadRequest(error?: any) {
    return response(
      false,
      "badRequest",
      undefined,
      "invalid request body",
      error
    );
  }

  export function CalledByServer() {
    return response(false, "calledByServer", undefined, "called by a server");
  }

  export function Error(logger: nkruntime.Logger, message: string, error: any) {
    logger.error(`${message}: ${error.message}`);
    return response(false, "error", undefined, message, error);
  }

  export function notFound(name: string) {
    return response(false, "notFound", undefined, `${name} not found`);
  }
}
