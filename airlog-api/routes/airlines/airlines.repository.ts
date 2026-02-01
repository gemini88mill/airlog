import { supabase } from "../../supabaseClient";

export type AirlineRecord = {
  id: number;
  name: string;
  iata: string | null;
  icao: string | null;
};

type FetchAirlinesResult =
  | { data: AirlineRecord[] }
  | { error: string };

export const fetchAirlines = async (
  query: string,
  limit: number
): Promise<FetchAirlinesResult> => {
  let supabaseQuery = supabase
    .from("airlines")
    .select("id, name, iata, icao")
    .eq("active", true)
    .order("name", { ascending: true })
    .limit(limit);

  if (query) {
    supabaseQuery = supabaseQuery.or(
      `name.ilike.%${query}%,iata.ilike.%${query}%`
    );
  }

  const { data, error } = await supabaseQuery;

  if (error) {
    return { error: error.message };
  }

  return { data: data || [] };
};
