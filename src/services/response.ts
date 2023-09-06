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
  }

  type Response = {
    success: boolean;
    code: Code;
    data?: any;
    message?: string;
    error?: string;
  };

  export function response(
    success: boolean,
    code: Code,
    data?: any,
    message?: string,
    error?: any
  ) {
    const res: Response = {
      success,
      code,
      data,
      message,
      error: error?.message,
    };
    return JSON.stringify(res);
  }

  export function Success(data?: any, message?: string) {
    return response(true, Res.Code.success, data, message);
  }

  export function BadRequest(error?: any) {
    return response(
      false,
      Code.badRequest,
      undefined,
      "invalid request body",
      error
    );
  }

  export function CalledByServer() {
    return response(
      false,
      Code.calledByServer,
      undefined,
      "called by a server"
    );
  }

  export function Error(logger: nkruntime.Logger, message: string, error: any) {
    logger.error(`${message}: ${error.message}`);
    return response(false, Code.error, undefined, message, error);
  }

  export function notFound(name: string) {
    return response(
      false,
      Code.serverInternalError,
      undefined,
      `${name} not found`
    );
  }
}
