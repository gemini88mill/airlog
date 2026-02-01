import { HTTPMethods } from "../../HTTPMethods";
import { listAirports } from "./airports.service";

const parseLimit = (value: string | null, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const airportsRoutes = {
  // GET /v1/airports → get all airports
  "/v1/airports": async (req: Request) => {
    if (req.method !== HTTPMethods.GET) {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const url = new URL(req.url);
      const query = url.searchParams.get("q") || "";
      const limit = parseLimit(url.searchParams.get("limit"), 100);

      const result = await listAirports(query, limit);

      if ("error" in result) {
        return Response.json({ error: result.error }, { status: 400 });
      }

      return Response.json(result.data);
    } catch (error) {
      console.error("Error fetching airports:", error);
      return Response.json(
        { error: "Failed to fetch airports" },
        { status: 500 }
      );
    }
  },
};
