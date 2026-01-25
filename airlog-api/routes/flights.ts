import { supabase } from "../supabaseClient";
import type { TablesInsert } from "../database.types";

export const flightsRoutes = {
  // POST /v1/flights → add flight
  // GET /v1/flights?scope=mine|shared|circle&circleId=...
  "/v1/flights": async (req: Request) => {
    const url = new URL(req.url);
    
    if (req.method === "POST") {
      try {
        const data = await req.json().catch(() => ({})) as Record<string, unknown>;
        
        // Validate required fields
        if (!data.flight_date || !data.flight_number || !data.user_id) {
          return Response.json(
            { error: "Missing required fields: flight_date, flight_number, user_id" },
            { status: 400 }
          );
        }

        const flightData: TablesInsert<"flights"> = {
          flight_date: data.flight_date as string,
          flight_number: data.flight_number as string,
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
          return Response.json(
            { error: error.message },
            { status: 400 }
          );
        }

        return Response.json(
          { 
            message: "Flight added",
            data: flight 
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
    
    if (req.method === "GET") {
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

        const { data: flights, error } = await query.order("flight_date", { ascending: false });

        if (error) {
          return Response.json(
            { error: error.message },
            { status: 400 }
          );
        }

        return Response.json({
          scope,
          circleId,
          flights: flights || []
        });
      } catch (error) {
        return Response.json(
          { error: "Failed to fetch flights" },
          { status: 500 }
        );
      }
    }
    
    return new Response("Method not allowed", { status: 405 });
  },
};
