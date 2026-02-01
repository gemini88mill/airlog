import { HTTPMethods } from "../HTTPMethods";
import { supabase } from "../supabaseClient";

export const airportsRoutes = {
  // GET /v1/airports → get all airports
  "/v1/airports": async (req: Request) => {
    if (req.method === HTTPMethods.GET) {
      try {
        const url = new URL(req.url);
        const query = url.searchParams.get("q") || "";
        const limit = parseInt(url.searchParams.get("limit") || "100", 10);

        let supabaseQuery = supabase
          .from("airports")
          .select("id, name, iata_code, icao_code, city, country")
          .order("name", { ascending: true })
          .limit(limit);

        // If there's a search query, filter by name, iata_code, city, or country
        if (query) {
          supabaseQuery = supabaseQuery.or(
            `name.ilike.%${query}%,iata_code.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%`
          );
        }

        const { data: airports, error } = await supabaseQuery;

        if (error) {
          return Response.json(
            { error: error.message },
            { status: 400 }
          );
        }

        return Response.json({
          airports: airports || [],
        });
      } catch (error) {
        console.error("Error fetching airports:", error);
        return Response.json(
          { error: "Failed to fetch airports" },
          { status: 500 }
        );
      }
    }

    return new Response("Method not allowed", { status: 405 });
  },
};
