import { flightsRoutes } from "./routes/flights";
import { circlesRoutes } from "./routes/circles";

const server = Bun.serve({
  routes: {
    "/": () => new Response("Welcome to Bun!"),
    "/abc": () => Response.redirect("/source", 301),
    "/source": () => new Response(Bun.file(import.meta.path)),
    "/api": () => Response.json({ some: "buns", for: "you" }),
    "/api/post": async (req) => {
      const data = await req.json();
      console.log("Received JSON:", data);
      return Response.json({ success: true, data });
    },
    ...circlesRoutes,
    ...flightsRoutes,
  },
  fetch: async (req) => {
    return Response.json({ error: "Not found" }, { status: 404 });
  },
});

console.log(`Listening on ${server.url}`);