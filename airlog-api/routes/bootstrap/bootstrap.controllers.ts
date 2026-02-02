import { HTTPMethods } from "../../HTTPMethods";
import type { ResponseError } from "../../lib/responseError";
import { bootstrapUser } from "./bootstrap.service";

const getBearerToken = (req: Request): string | null => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
};

export const bootstrapRoutes = {
  // GET /v1/bootstrap → get all essential user data for app initialization
  "/v1/bootstrap": async (req: Request) => {
    if (req.method !== HTTPMethods.GET) {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const token = getBearerToken(req);
      if (!token) {
        const errorPayload: ResponseError = {
          error: "Unauthorized",
          status: 401,
        };
        return Response.json(errorPayload, { status: 401 });
      }

      const result = await bootstrapUser(token);

      const [data, error] = result;
      if (error) {
        const errorPayload: ResponseError = {
          error: error.message,
          status: error.status,
        };
        return Response.json(errorPayload, { status: error.status });
      }

      return Response.json(data);
    } catch (error) {
      console.error("Error bootstrapping user data:", error);
      const errorPayload: ResponseError = {
        error: "Failed to bootstrap user data",
        status: 500,
      };
      return Response.json(errorPayload, { status: 500 });
    }
  },
};
