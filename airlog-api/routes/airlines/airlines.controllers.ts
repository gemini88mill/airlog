import { HTTPMethods } from "../../HTTPMethods";
import type { ResponseError } from "../../lib/responseError";
import { listAirlines } from "./airlines.service";

const parseLimit = (value: string | null, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const airlinesRoutes = {
  // GET /v1/airlines → get all airlines
  "/v1/airlines": async (req: Request) => {
    if (req.method !== HTTPMethods.GET) {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const url = new URL(req.url);
      const query = url.searchParams.get("q") || "";
      const limit = parseLimit(url.searchParams.get("limit"), 100);

      const result = await listAirlines(query, limit);

      const [data, error] = result;
      if (error) {
        const errorPayload: ResponseError = { error: error.message };
        return Response.json(errorPayload, { status: error.status });
      }

      return Response.json(data);
    } catch (error) {
      console.error("Error fetching airlines:", error);
      return Response.json(
        { error: "Failed to fetch airlines" },
        { status: 500 }
      );
    }
  },
};
