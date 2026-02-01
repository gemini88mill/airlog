import { HTTPMethods } from "../../HTTPMethods";
import {
  getSessionForToken,
  loginWithPassword,
  logoutWithToken,
} from "./auth.service";

interface AuthBody {
  email: string;
  password: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === "string";

const getBearerToken = (req: Request): string | null => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
};

export const authRoutes = {
  // POST /v1/auth/login → login with email and password
  "/v1/auth/login": async (req: Request) => {
    if (req.method !== HTTPMethods.POST) {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const data = await req.json().catch(() => ({}));

      if (!isRecord(data)) {
        return Response.json(
          { error: "Invalid request body" },
          { status: 400 }
        );
      }

      const body = data as Partial<AuthBody>;

      if (!isString(body.email) || !isString(body.password)) {
        return Response.json(
          { error: "Missing required fields: email, password" },
          { status: 400 }
        );
      }

      const result = await loginWithPassword(body.email, body.password);

      if ("error" in result) {
        return Response.json(
          { error: result.error },
          { status: result.status }
        );
      }

      return Response.json(result.data);
    } catch (error) {
      console.error("Error processing login request:", error);
      return Response.json(
        { error: "Failed to process login request" },
        { status: 500 }
      );
    }
  },

  // POST /v1/auth/logout → logout current user
  "/v1/auth/logout": async (req: Request) => {
    if (req.method !== HTTPMethods.POST) {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const token = getBearerToken(req);
      if (!token) {
        return Response.json(
          { error: "Missing or invalid authorization header" },
          { status: 401 }
        );
      }

      const result = await logoutWithToken(token);

      if ("error" in result) {
        return Response.json(
          { error: result.error },
          { status: result.status }
        );
      }

      return Response.json(result.data);
    } catch (error) {
      console.error("Error processing logout request:", error);
      return Response.json(
        { error: "Failed to process logout request" },
        { status: 500 }
      );
    }
  },

  // GET /v1/auth/session → get current session
  "/v1/auth/session": async (req: Request) => {
    if (req.method !== HTTPMethods.GET) {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const token = getBearerToken(req);
      if (!token) {
        return Response.json({ user: null, session: null });
      }

      const result = await getSessionForToken(token);

      if ("error" in result) {
        return Response.json(
          { error: result.error },
          { status: result.status }
        );
      }

      return Response.json(result.data);
    } catch (error) {
      console.error("Error processing session request:", error);
      return Response.json({ user: null, session: null });
    }
  },
};
