import { supabase } from "../../supabaseClient";

export type AirportRecord = {
  id: number;
  name: string;
  iata_code: string | null;
  icao_code: string | null;
  city: string;
  country: string;
};

type FetchAirportsResult =
  | { data: AirportRecord[] }
  | { error: string };

export const fetchAirports = async (
  query: string,
  limit: number
): Promise<FetchAirportsResult> => {
  let supabaseQuery = supabase
    .from("airports")
    .select("id, name, iata_code, icao_code, city, country")
    .order("name", { ascending: true })
    .limit(limit);

  if (query) {
    supabaseQuery = supabaseQuery.or(
      `name.ilike.%${query}%,iata_code.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%`
    );
  }

  const { data, error } = await supabaseQuery;

  if (error) {
    return { error: error.message };
  }

  return { data: data || [] };
};
