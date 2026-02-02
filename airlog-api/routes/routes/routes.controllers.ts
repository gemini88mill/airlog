import { HTTPMethods } from "../../HTTPMethods";
import { lookupRoute, upsertRoute, upsertRoutesInBulk } from "./routes.service";

export const routesRoutes = {
  // GET /v1/routes/lookup?flightNumber=DL295
  "/v1/routes/lookup": async (req: Request) => {
    if (req.method !== HTTPMethods.GET) {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const url = new URL(req.url);
      const flightNumber =
        url.searchParams.get("flightNumber") ||
        url.searchParams.get("flight_number");

      if (!flightNumber) {
        return Response.json(
          { error: "Missing required query param: flightNumber" },
          { status: 400 }
        );
      }

      const result = await lookupRoute(flightNumber);

      const [resultData, resultError] = result;
      if (resultError) {
        return Response.json(
          { error: resultError.message },
          { status: resultError.status }
        );
      }

      return Response.json(resultData);
    } catch (error) {
      console.error("Error looking up route:", error);
      return Response.json(
        { error: "Failed to lookup route" },
        { status: 500 }
      );
    }
  },
  // PUT /v1/routes → upsert route
  "/v1/routes": async (req: Request) => {
    if (req.method !== HTTPMethods.PUT) {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const data = (await req.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;

      const airlineIata = data.airline_iata as string;
      const originIata = data.origin_iata as string;
      const destinationIata = data.destination_iata as string;
      const flightNumber = (data.flight_number || data.flight_num) as string;

      if (!airlineIata || !originIata || !destinationIata || !flightNumber) {
        return Response.json(
          {
            error:
              "Missing required fields: airline_iata, origin_iata, destination_iata, flight_number",
          },
          { status: 400 }
        );
      }

      const result = await upsertRoute({
        airlineIata,
        originIata,
        destinationIata,
        flightNumber,
      });

      const [resultData, resultError] = result;
      if (resultError) {
        return Response.json(
          { error: resultError.message },
          { status: resultError.status }
        );
      }

      return Response.json(resultData);
    } catch (error) {
      console.error("Error upserting route:", error);
      return Response.json({ error: "Failed to upsert route" }, { status: 500 });
    }
  },
  // POST /v1/routes/bulk → bulk upsert routes
  "/v1/routes/bulk": async (req: Request) => {
    if (req.method !== HTTPMethods.POST) {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const data = (await req.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;

      const routes = Array.isArray(data.routes) ? data.routes : [];

      if (routes.length === 0) {
        return Response.json(
          { error: "Missing required field: routes" },
          { status: 400 }
        );
      }

      const normalizedRoutes = routes
        .map((route) => route as Record<string, unknown>)
        .map((route) => ({
          airlineIata: route.airline_iata as string,
          originIata: route.origin_iata as string,
          destinationIata: route.destination_iata as string,
          flightNumber: (route.flight_number || route.flight_num) as string,
        }))
        .filter(
          (route) =>
            route.airlineIata &&
            route.originIata &&
            route.destinationIata &&
            route.flightNumber
        );

      if (normalizedRoutes.length === 0) {
        return Response.json(
          {
            error:
              "No valid routes provided. Each route requires airline_iata, origin_iata, destination_iata, flight_number.",
          },
          { status: 400 }
        );
      }

      const result = await upsertRoutesInBulk(normalizedRoutes);

      const [resultData, resultError] = result;
      if (resultError) {
        return Response.json(
          { error: resultError.message },
          { status: resultError.status }
        );
      }

      return Response.json(resultData);
    } catch (error) {
      console.error("Error bulk upserting routes:", error);
      return Response.json(
        { error: "Failed to bulk upsert routes" },
        { status: 500 }
      );
    }
  },
};
