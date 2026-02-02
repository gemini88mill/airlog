import { HTTPMethods } from "../../HTTPMethods";
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
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const result = await bootstrapUser(token);

      const [data, error] = result;
      if (error) {
        return Response.json(
          { error: error.message },
          { status: error.status }
        );
      }

      return Response.json(data);
    } catch (error) {
      console.error("Error bootstrapping user data:", error);
      return Response.json(
        { error: "Failed to bootstrap user data" },
        { status: 500 }
      );
    }
  },
};
