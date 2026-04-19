/* eslint-disable @typescript-eslint/no-explicit-any */
import { default as handler } from "../dist/server/index.js";

export default async (req: any, res: any) => {
  try {
    // Construct the full URL from the request
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host =
      req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url = new URL(req.url || "/", `${protocol}://${host}`);

    console.log(`[SSR] Handling ${req.method} ${url.pathname}`);

    // Collect the request body for non-GET requests
    let body = null;
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      body = await new Promise((resolve: any, reject: any) => {
        let data = "";
        req.on("data", (chunk: any) => (data += chunk));
        req.on("end", () => resolve(Buffer.from(data)));
        req.on("error", reject);
      });
    }

    // Create a Web API Request object from the Node request
    const webRequest = new Request(url.toString(), {
      method: req.method || "GET",
      headers: new Headers(req.headers),
      body: body,
    });

    // Call the TanStack Start handler with the Web API Request
    const webResponse = await handler(webRequest);

    // Copy status code
    res.statusCode = webResponse.status || 200;

    // Copy headers from the response to Node.js res
    webResponse.headers.forEach((value: any, key: any) => {
      res.setHeader(key, value);
    });

    // Handle the response body
    if (webResponse.body) {
      const buffer = await webResponse.arrayBuffer();
      res.end(Buffer.from(buffer));
    } else {
      res.end();
    }
  } catch (error) {
    console.error("[SSR] Error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end("Internal Server Error");
  }
};
