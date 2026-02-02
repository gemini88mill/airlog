import { HTTPMethods } from "../../HTTPMethods";
import type { ResponseError } from "../../lib/responseError";
import { createFlight, listFlights } from "./flights.service";

export const flightsRoutes = {
  // POST /v1/flights → add flight
  // GET /v1/flights?scope=mine|shared|circle&circleId=...
  "/v1/flights": async (req: Request) => {
    const url = new URL(req.url);

    switch (req.method) {
      case HTTPMethods.POST: {
        try {
          const data = (await req.json().catch(() => ({}))) as Record<
            string,
            unknown
          >;

          const result = await createFlight(data);

          const [created, error] = result;
          if (error) {
            const errorPayload: ResponseError = { error: error.message };
            return Response.json(errorPayload, { status: error.status });
          }

          return Response.json(created, { status: 201 });
        } catch (error) {
          console.error("Error processing flight request:", error);
          return Response.json(
            { error: "Failed to process request" },
            { status: 500 }
          );
        }
      }
      case HTTPMethods.GET: {
        try {
          const scope = url.searchParams.get("scope") || "mine";
          const circleId = url.searchParams.get("circleId");

          const result = await listFlights({ scope, circleId });

          const [data, error] = result;
          if (error) {
            const errorPayload: ResponseError = { error: error.message };
            return Response.json(errorPayload, { status: error.status });
          }

          return Response.json(data);
        } catch (error) {
          console.error("Error fetching flights:", error);
          return Response.json(
            { error: "Failed to fetch flights" },
            { status: 500 }
          );
        }
      }
      default:
        return new Response("Method not allowed", { status: 405 });
    }
  },
};
