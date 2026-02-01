import { HTTPMethods } from "../HTTPMethods";

const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY;
const AVIATIONSTACK_BASE_URL =
  process.env.AVIATIONSTACK_BASE_URL || "https://api.aviationstack.com/v1";

const parsePositiveInt = (value: string | null, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const aviationStackRoutes = {
  // GET /v1/aviationstack/flights?flight_iata=DL296
  "/v1/aviationstack/flights": async (req: Request) => {
    if (req.method !== HTTPMethods.GET) {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const url = new URL(req.url);
      const flightIata =
        url.searchParams.get("flight_iata") ||
        url.searchParams.get("q") ||
        url.searchParams.get("flightNumber");

      if (!flightIata || flightIata.length < 2) {
        return Response.json(
          { error: "Missing required query param: flight_iata" },
          { status: 400 }
        );
      }

      if (!AVIATIONSTACK_API_KEY) {
        return Response.json(
          { error: "AviationStack API key is not configured" },
          { status: 500 }
        );
      }

      const limit = parsePositiveInt(url.searchParams.get("limit"), 100);
      const offset = parsePositiveInt(url.searchParams.get("offset"), 0);

      const params = new URLSearchParams({
        access_key: AVIATIONSTACK_API_KEY,
        limit: String(limit),
        offset: String(offset),
        flight_iata: flightIata.toUpperCase(),
      });

      const response = await fetch(
        `${AVIATIONSTACK_BASE_URL}/flights?${params.toString()}`,
        {
          headers: {
            accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        return Response.json(
          { error: `AviationStack API error: ${response.status}` },
          { status: 502 }
        );
      }

      const data = await response.json();
      return Response.json(data);
    } catch (error) {
      console.error("Error fetching AviationStack flights:", error);
      return Response.json(
        { error: "Failed to fetch AviationStack flights" },
        { status: 500 }
      );
    }
  },
};
