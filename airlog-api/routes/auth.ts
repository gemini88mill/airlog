import { HTTPMethods } from "../HTTPMethods";
import { supabase } from "../supabaseClient";

const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

      if (!isString(data.email) || !isString(data.password)) {
        return Response.json(
          { error: "Missing required fields: email, password" },
          { status: 400 }
        );
      }

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return Response.json(
          { error: error.message },
          { status: 401 }
        );
      }

      if (!authData.session) {
        return Response.json(
          { error: "No session created" },
          { status: 401 }
        );
      }

      return Response.json({
        user: authData.user,
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at,
        },
      });
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
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return Response.json(
          { error: "Missing or invalid authorization header" },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      
      // Verify token is valid before logging out
      const { error: verifyError } = await supabase.auth.getUser(token);
      
      if (verifyError) {
        // Token is already invalid, but we'll still return success
        return Response.json({ message: "Logged out successfully" });
      }

      // For logout, we just need to verify the token was valid
      // The actual session invalidation happens client-side by removing the token
      // Supabase tokens are stateless JWTs, so there's no server-side session to invalidate
      return Response.json({ message: "Logged out successfully" });
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
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return Response.json(
          { user: null, session: null }
        );
      }

      const token = authHeader.substring(7);
      
      // Verify the token and get user
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return Response.json(
          { user: null, session: null }
        );
      }

      return Response.json({
        user,
        session: {
          access_token: token,
        },
      });
    } catch (error) {
      console.error("Error processing session request:", error);
      return Response.json(
        { user: null, session: null }
      );
    }
  },
};
