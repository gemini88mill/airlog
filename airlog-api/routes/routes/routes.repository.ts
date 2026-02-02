import { supabase } from "../../supabaseClient";

export interface RouteMatchRecord {
  airline_code: string;
  source_airport_code: string;
  destination_airport_code: string;
  flight_num: string | null;
}

type RepositoryResult<T> = [T, null] | [null, string];

export const findRouteByFlightNumbers = async (
  candidates: string[]
): Promise<RepositoryResult<RouteMatchRecord | null>> => {
  const { data, error } = await supabase
    .from("routes")
    .select(
      "airline_code, source_airport_code, destination_airport_code, flight_num"
    )
    .in("flight_num", candidates)
    .maybeSingle();

  if (error) {
    return [null, error.message];
  }

  if (!data) {
    return [null, "not_found"];
  }

  return [data, null];
};

export const findRouteByAirlineAndNumber = async (
  airlineCode: string,
  flightNumber: string
): Promise<RepositoryResult<RouteMatchRecord | null>> => {
  const { data, error } = await supabase
    .from("routes")
    .select(
      "airline_code, source_airport_code, destination_airport_code, flight_num"
    )
    .eq("airline_code", airlineCode)
    .eq("flight_num", flightNumber)
    .maybeSingle();

  if (error) {
    return [null, error.message];
  }

  if (!data) {
    return [null, "not_found"];
  }

  return [data, null];
};
