import { supabase } from "../supabaseClient";
import type { TablesInsert, TablesUpdate } from "../database.types";

type UpsertRouteInput = {
  airlineIata: string;
  originIata: string;
  destinationIata: string;
  flightNumber: string;
};

export const upsertRouteByAirlineAndAirports = async (
  input: UpsertRouteInput
): Promise<{ error?: string }> => {
  const { airlineIata, originIata, destinationIata, flightNumber } = input;

  if (!airlineIata || !originIata || !destinationIata || !flightNumber) {
    return { error: "Missing required route fields" };
  }

  const { data: existingRoute, error: findError } = await supabase
    .from("routes")
    .select("id")
    .eq("airline_code", airlineIata)
    .eq("source_airport_code", originIata)
    .eq("destination_airport_code", destinationIata)
    .maybeSingle();

  if (findError) {
    return { error: findError.message };
  }

  if (existingRoute) {
    const routeUpdate: TablesUpdate<"routes"> = {
      flight_num: flightNumber,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("routes")
      .update(routeUpdate)
      .eq("id", existingRoute.id);

    if (updateError) {
      return { error: updateError.message };
    }

    return {};
  }

  const routeData: TablesInsert<"routes"> = {
    airline_code: airlineIata,
    source_airport_code: originIata,
    destination_airport_code: destinationIata,
    flight_num: flightNumber,
  };

  const { error: insertError } = await supabase.from("routes").insert(routeData);

  if (insertError) {
    return { error: insertError.message };
  }

  return {};
};

type BulkUpsertResult = {
  upserted: number;
  skipped: number;
  errors: string[];
};

export const upsertRoutesBulk = async (
  routes: UpsertRouteInput[]
): Promise<BulkUpsertResult> => {
  if (!routes.length) {
    return { upserted: 0, skipped: 0, errors: [] };
  }

  const uniqueRoutes = new Map<string, UpsertRouteInput>();
  for (const route of routes) {
    const { airlineIata, originIata, destinationIata, flightNumber } = route;
    if (!airlineIata || !originIata || !destinationIata || !flightNumber) {
      continue;
    }
    const key = `${airlineIata}|${originIata}|${destinationIata}|${flightNumber}`;
    uniqueRoutes.set(key, route);
  }

  let upserted = 0;
  let skipped = routes.length - uniqueRoutes.size;
  const errors: string[] = [];

  for (const route of uniqueRoutes.values()) {
    const { error } = await upsertRouteByAirlineAndAirports(route);
    if (error) {
      errors.push(error);
    } else {
      upserted += 1;
    }
  }

  skipped += errors.length;

  return { upserted, skipped, errors };
};
