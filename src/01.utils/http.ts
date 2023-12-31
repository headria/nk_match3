namespace HTTP {
  type Response = {
    success: boolean;
    code: number;
    data: any;
    message: string;
  };

  const TIMEOUT = 4000; //ms
  const BaseHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // export const BaseUrl: string = "http://host.docker.internal:8003/";
  export const BaseUrl: string = "http://nk.planetmemes.com/";
  export const CustomServerUrl: string = "https://api.planetmemes.com/";

  export function request(
    nk: nkruntime.Nakama,
    url: string,
    method: nkruntime.RequestMethod,
    body?: any,
    headers?: { [key: string]: any }
  ) {
    try {
      let finalHeaders = Object.assign({}, BaseHeaders, headers);
      const requestBody = JSON.stringify(body);
      const res = nk.httpRequest(
        url,
        method,
        finalHeaders,
        requestBody,
        TIMEOUT
      );
      const resBody = JSON.parse(res.body);
      return resBody;
    } catch (error: any) {
      throw new Error(`failed to get response: ${error.message}`);
    }
  }
}
