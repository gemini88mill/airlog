import { supabase } from "../supabaseClient";
import { HTTPMethods } from "../HTTPMethods";
import type { TablesInsert } from "../database.types";
import { upsertRouteByAirlineAndAirports } from "./routeUpsert";

// Helper function to extract just the numeric part from flight number and convert to integer
// Examples: "DL296" -> 296, "DL 296" -> 296, "AA1234" -> 1234, "296" -> 296
const extractFlightNumber = (flightNumber: string): number | null => {
  // Remove leading airline code (2-3 letters, case insensitive) and any spaces
  // Then extract the numeric part
  const cleaned = flightNumber.replace(/^[A-Z]{2,3}\s*/i, "").trim();
  const numericMatch = cleaned.match(/\d+/);

  if (!numericMatch) {
    return null;
  }

  const numericValue = parseInt(numericMatch[0], 10);

  // Validate it's a valid integer
  if (isNaN(numericValue)) {
    return null;
  }

  return numericValue;
};

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

          // Validate required fields
          if (!data.flight_date || !data.flight_number || !data.user_id) {
            return Response.json(
              {
                error:
                  "Missing required fields: flight_date, flight_number, user_id",
              },
              { status: 400 }
            );
          }

          const rawFlightNumber = data.flight_number as string;
          // Extract just the numeric part and convert to integer (e.g., "DL296" -> 296)
          const flightNumberNumeric = extractFlightNumber(rawFlightNumber);

          if (flightNumberNumeric === null) {
            return Response.json(
              {
                error:
                  "Invalid flight number. Could not extract a valid numeric flight number.",
              },
              { status: 400 }
            );
          }

          const flightData: TablesInsert<"flights"> = {
            flight_date: data.flight_date as string,
            flight_number: flightNumberNumeric,
            user_id: data.user_id as string,
            airline_iata: (data.airline_iata as string) || null,
            destination_iata: (data.destination_iata as string) || null,
            origin_iata: (data.origin_iata as string) || null,
            note: (data.note as string) || null,
            circle_id: (data.circle_id as string) || null,
            role: (data.role as "passenger" | "crew") || "passenger",
            visibility: (data.visibility as "private" | "shared") || "private",
          };

          const { data: flight, error } = await supabase
            .from("flights")
            .insert(flightData)
            .select()
            .single();

          if (error) {
            return Response.json({ error: error.message }, { status: 400 });
          }

          // Upsert route if all required fields are present
          if (
            flightData.airline_iata &&
            flightData.origin_iata &&
            flightData.destination_iata
          ) {
            const { error: routeError } =
              await upsertRouteByAirlineAndAirports({
                airlineIata: flightData.airline_iata,
                originIata: flightData.origin_iata,
                destinationIata: flightData.destination_iata,
                flightNumber: rawFlightNumber,
              });

            if (routeError) {
              console.error("Error upserting route:", routeError);
              // Continue without failing the flight creation
            }
          }

          return Response.json(
            {
              message: "Flight added",
              data: flight,
            },
            { status: 201 }
          );
        } catch (error) {
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

          let query = supabase.from("flights").select("*");

          // Apply scope filtering if needed
          if (scope === "circle" && circleId) {
            query = query.eq("circle_id", circleId);
          } else if (scope === "shared") {
            query = query.eq("visibility", "shared");
          }
          // For "mine" scope, you might want to filter by user_id from auth token
          // For now, we'll return all flights

          const { data: flights, error } = await query.order("flight_date", {
            ascending: false,
          });

          if (error) {
            return Response.json({ error: error.message }, { status: 400 });
          }

          return Response.json({
            scope,
            circleId,
            flights: flights || [],
          });
        } catch (error) {
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
