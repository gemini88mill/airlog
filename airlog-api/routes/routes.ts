import { supabase } from "../supabaseClient";
import { HTTPMethods } from "../HTTPMethods";
import { upsertRouteByAirlineAndAirports, upsertRoutesBulk } from "./routeUpsert";

const normalizeFlightNumber = (flightNumber: string): string => {
  return flightNumber.replace(/\s+/g, "").toUpperCase();
};

const parseFlightNumber = (
  flightNumber: string
): { airlineCode: string; number: string } | null => {
  const normalized = normalizeFlightNumber(flightNumber);
  const match = normalized.match(/^([A-Z]{2,3})(\d+)$/);
  if (!match || !match[1] || !match[2]) {
    return null;
  }

  return { airlineCode: match[1], number: match[2] };
};

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

      const normalized = normalizeFlightNumber(flightNumber);
      const candidates =
        normalized === flightNumber ? [normalized] : [flightNumber, normalized];

      const { data: routeMatch, error: routeError } = await supabase
        .from("routes")
        .select(
          "airline_code, source_airport_code, destination_airport_code, flight_num"
        )
        .in("flight_num", candidates)
        .maybeSingle();

      if (routeError) {
        return Response.json({ error: routeError.message }, { status: 400 });
      }

      if (!routeMatch) {
        const parsed = parseFlightNumber(flightNumber);
        if (parsed) {
          const { data: parsedRoute, error: parsedError } = await supabase
            .from("routes")
            .select(
              "airline_code, source_airport_code, destination_airport_code, flight_num"
            )
            .eq("airline_code", parsed.airlineCode)
            .eq("flight_num", parsed.number)
            .maybeSingle();

          if (parsedError) {
            return Response.json(
              { error: parsedError.message },
              { status: 400 }
            );
          }

          if (parsedRoute) {
            return Response.json({
              data: {
                flight_number: parsedRoute.flight_num || normalized,
                flight_date: null,
                user_id: null,
                airline_iata: parsedRoute.airline_code,
                origin_iata: parsedRoute.source_airport_code,
                destination_iata: parsedRoute.destination_airport_code,
                role: "passenger",
                visibility: "private",
                circle_id: null,
                note: null,
              },
            });
          }
        }

        return Response.json(
          { error: "Route not found for flight number" },
          { status: 404 }
        );
      }

      return Response.json({
        data: {
          flight_number: routeMatch.flight_num || normalized,
          flight_date: null,
          user_id: null,
          airline_iata: routeMatch.airline_code,
          origin_iata: routeMatch.source_airport_code,
          destination_iata: routeMatch.destination_airport_code,
          role: "passenger",
          visibility: "private",
          circle_id: null,
          note: null,
        },
      });
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

      const { error } = await upsertRouteByAirlineAndAirports({
        airlineIata,
        originIata,
        destinationIata,
        flightNumber,
      });

      if (error) {
        return Response.json({ error }, { status: 400 });
      }

      return Response.json({ message: "Route upserted" });
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

      const result = await upsertRoutesBulk(normalizedRoutes);

      return Response.json({
        message: "Routes upserted",
        ...result,
      });
    } catch (error) {
      console.error("Error bulk upserting routes:", error);
      return Response.json(
        { error: "Failed to bulk upsert routes" },
        { status: 500 }
      );
    }
  },
};
