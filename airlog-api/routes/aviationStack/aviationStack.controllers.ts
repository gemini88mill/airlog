import { HTTPMethods } from "../../HTTPMethods";
import { getAviationStackFlights } from "./aviationStack.service";

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

      const result = await getAviationStackFlights(
        flightIata,
        url.searchParams.get("limit"),
        url.searchParams.get("offset")
      );

      const [data, error] = result;
      if (error) {
        return Response.json(
          { error: error.message },
          { status: error.status }
        );
      }

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
