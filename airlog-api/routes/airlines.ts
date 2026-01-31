import { supabase } from "../supabaseClient";

export const airlinesRoutes = {
  // GET /v1/airlines → get all airlines
  "/v1/airlines": async (req: Request) => {
    if (req.method === "GET") {
      try {
        const url = new URL(req.url);
        const query = url.searchParams.get("q") || "";
        const limit = parseInt(url.searchParams.get("limit") || "100", 10);

        let supabaseQuery = supabase
          .from("airlines")
          .select("id, name, iata, icao")
          .eq("active", true)
          .order("name", { ascending: true })
          .limit(limit);

        // If there's a search query, filter by name or iata code
        if (query) {
          supabaseQuery = supabaseQuery.or(
            `name.ilike.%${query}%,iata.ilike.%${query}%`
          );
        }

        const { data: airlines, error } = await supabaseQuery;

        if (error) {
          return Response.json(
            { error: error.message },
            { status: 400 }
          );
        }

        return Response.json({
          airlines: airlines || [],
        });
      } catch (error) {
        return Response.json(
          { error: "Failed to fetch airlines" },
          { status: 500 }
        );
      }
    }

    return new Response("Method not allowed", { status: 405 });
  },
};
