import { flightsRoutes } from "./routes/flights";
import { circlesRoutes } from "./routes/circles";
import { authRoutes } from "./routes/auth";
import { bootstrapRoutes } from "./routes/bootstrap";
import { airlinesRoutes } from "./routes/airlines";
import { airportsRoutes } from "./routes/airports";
import { routesRoutes } from "./routes/routes";
import { aviationStackRoutes } from "./routes/aviationStack";

const ALLOWED_ORIGINS = [
  "http://localhost:5137",
  "http://localhost:5173",
  "http://localhost:3000",
];

const addCorsHeaders = (response: Response, origin: string | null): Response => {
  const headers = new Headers(response.headers);
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Max-Age", "86400");

  // Create a new response with CORS headers and the original body
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

type RouteRequest = Request & {
  params?: Record<string, string>;
  cookies?: Record<string, string>;
};

type RouteHandler = (req: Request) => Response | Promise<Response>;

const allRoutes = {
  "/": () => new Response("Welcome to Bun!"),
  "/abc": () => Response.redirect("/source", 301),
  "/source": () => new Response(Bun.file(import.meta.path)),
  "/api": () => Response.json({ some: "buns", for: "you" }),
  "/api/post": async (req: Request) => {
    const data = await req.json();
    console.log("Received JSON:", data);
    return Response.json({ success: true, data });
  },
  ...authRoutes,
  ...bootstrapRoutes,
  ...circlesRoutes,
  ...flightsRoutes,
  ...airlinesRoutes,
  ...airportsRoutes,
  ...routesRoutes,
  ...aviationStackRoutes,
} as unknown as Record<string, RouteHandler>;

const server = Bun.serve({
  fetch: async (req) => {
    const origin = req.headers.get("Origin");
    const url = new URL(req.url);

    // Handle preflight OPTIONS requests
    if (req.method === "OPTIONS") {
      const headers = new Headers();
      if (origin && ALLOWED_ORIGINS.includes(origin)) {
        headers.set("Access-Control-Allow-Origin", origin);
        headers.set("Access-Control-Allow-Credentials", "true");
      }
      headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      headers.set("Access-Control-Max-Age", "86400");
      return new Response(null, { status: 204, headers });
    }

    // Check exact route match first
    const exactHandler = allRoutes[url.pathname];
    if (exactHandler) {
      try {
        const response = await exactHandler(req);
        return addCorsHeaders(response, origin);
      } catch (error) {
        console.error("Error handling route:", error);
        const errorResponse = Response.json(
          { error: "Internal server error" },
          { status: 500 }
        );
        return addCorsHeaders(errorResponse, origin);
      }
    }

    // Handle parameterized routes (e.g., /v1/circles/:circleId/members)
    for (const [routePath, handler] of Object.entries(allRoutes)) {
      if (routePath.includes(":")) {
        // Convert route pattern to regex (e.g., /v1/circles/:circleId/members -> /v1/circles/([^/]+)/members)
        const routePattern = "^" + routePath.replace(/:[^/]+/g, "([^/]+)") + "$";
        const regex = new RegExp(routePattern);
        const match = url.pathname.match(regex);
        
        if (match) {
          // Extract params and create BunRequest-like object
          const paramNames = routePath.match(/:[^/]+/g)?.map(name => name.substring(1)) || [];
          const params: Record<string, string> = {};
          paramNames.forEach((name, index) => {
            params[name] = match[index + 1] || "";
          });

          // Create a request-like object with params (for BunRequest compatibility)
          const reqWithParams = Object.assign(req, {
            params,
            cookies: {},
          }) as RouteRequest;
          
          try {
            const response = await handler(reqWithParams);
            return addCorsHeaders(response, origin);
          } catch (error) {
            console.error("Error handling param route:", error);
            const errorResponse = Response.json(
              { error: "Internal server error" },
              { status: 500 }
            );
            return addCorsHeaders(errorResponse, origin);
          }
        }
      }
    }

    const notFoundResponse = Response.json({ error: "Not found" }, { status: 404 });
    return addCorsHeaders(notFoundResponse, origin);
  },
});

console.log(`Listening on ${server.url}`);
