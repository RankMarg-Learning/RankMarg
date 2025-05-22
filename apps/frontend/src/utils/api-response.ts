type JsonResponseOptions = {
    status?: number;
    message?: string;
    success?: boolean;
    headers?: Record<string, string>;
  };
  
  /**
   * A unified API response helper.
   * @param data - Payload to return (null if error)
   * @param options - Optional response settings (status, message, success, custom headers)
   */
  export function jsonResponse<T>(
    data: T,
    {
      status = 200,
      message = "OK",
      success = true,
      headers = {},
    }: JsonResponseOptions = {}
  ): Response {
    return new Response(
      JSON.stringify({
        success,
        message,
        data,
      }),
      {
        status,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      }
    );
  }