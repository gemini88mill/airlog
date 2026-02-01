import { supabase } from "../../supabaseClient";
import type { TablesInsert } from "../../database.types";

export interface FlightsQueryFilters {
  scope: string;
  circleId: string | null;
}

interface RepositorySuccess<T> {
  data: T;
}

interface RepositoryError {
  error: string;
}

type RepositoryResult<T> = RepositorySuccess<T> | RepositoryError;

export const insertFlight = async (
  flightData: TablesInsert<"flights">
): Promise<RepositoryResult<Record<string, unknown>>> => {
  const { data, error } = await supabase
    .from("flights")
    .insert(flightData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: data as Record<string, unknown> };
};

export const fetchFlights = async (
  filters: FlightsQueryFilters
): Promise<RepositoryResult<Array<Record<string, unknown>>>> => {
  const { scope, circleId } = filters;

  let query = supabase.from("flights").select("*");

  if (scope === "circle" && circleId) {
    query = query.eq("circle_id", circleId);
  } else if (scope === "shared") {
    query = query.eq("visibility", "shared");
  }

  const { data, error } = await query.order("flight_date", {
    ascending: false,
  });

  if (error) {
    return { error: error.message };
  }

  return { data: (data || []) as Array<Record<string, unknown>> };
};
