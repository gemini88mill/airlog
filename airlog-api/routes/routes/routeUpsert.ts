import { supabase } from "../../supabaseClient";
import type { TablesInsert, TablesUpdate } from "../../database.types";

interface UpsertRouteInput {
  airlineIata: string;
  originIata: string;
  destinationIata: string;
  flightNumber: string;
}

interface RouteLookupMaps {
  airlineByIata: Map<string, number>;
  airportByIata: Map<string, number>;
}

interface RouteIds {
  airlineId: number;
  originId: number;
  destinationId: number;
}

const resolveRouteIds = async (
  input: UpsertRouteInput,
  maps?: RouteLookupMaps
): Promise<RouteIds | { error: string }> => {
  const { airlineIata, originIata, destinationIata } = input;

  if (maps) {
    const airlineId = maps.airlineByIata.get(airlineIata);
    const originId = maps.airportByIata.get(originIata);
    const destinationId = maps.airportByIata.get(destinationIata);

    if (!airlineId) {
      return { error: `Unknown airline code: ${airlineIata}` };
    }
    if (!originId) {
      return { error: `Unknown source airport code: ${originIata}` };
    }
    if (!destinationId) {
      return { error: `Unknown destination airport code: ${destinationIata}` };
    }

    return { airlineId, originId, destinationId };
  }

  const [
    { data: airline, error: airlineError },
    { data: origin, error: originError },
    { data: destination, error: destinationError },
  ] = await Promise.all([
    supabase
      .from("airlines")
      .select("id, iata")
      .eq("iata", airlineIata)
      .maybeSingle(),
    supabase
      .from("airports")
      .select("id, iata_code")
      .eq("iata_code", originIata)
      .maybeSingle(),
    supabase
      .from("airports")
      .select("id, iata_code")
      .eq("iata_code", destinationIata)
      .maybeSingle(),
  ]);

  if (airlineError) {
    return { error: airlineError.message };
  }
  if (originError) {
    return { error: originError.message };
  }
  if (destinationError) {
    return { error: destinationError.message };
  }

  if (!airline) {
    return { error: `Unknown airline code: ${airlineIata}` };
  }
  if (!origin) {
    return { error: `Unknown source airport code: ${originIata}` };
  }
  if (!destination) {
    return { error: `Unknown destination airport code: ${destinationIata}` };
  }

  return {
    airlineId: airline.id,
    originId: origin.id,
    destinationId: destination.id,
  };
};

export const upsertRouteByAirlineAndAirports = async (
  input: UpsertRouteInput,
  maps?: RouteLookupMaps
): Promise<{ error?: string }> => {
  const { airlineIata, originIata, destinationIata, flightNumber } = input;

  if (!airlineIata || !originIata || !destinationIata || !flightNumber) {
    return { error: "Missing required route fields" };
  }

  const resolvedIds = await resolveRouteIds(input, maps);
  if ("error" in resolvedIds) {
    return { error: resolvedIds.error };
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
      airline_id: resolvedIds.airlineId,
      source_airport_id: resolvedIds.originId,
      destination_airport_id: resolvedIds.destinationId,
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
    airline_id: resolvedIds.airlineId,
    source_airport_code: originIata,
    source_airport_id: resolvedIds.originId,
    destination_airport_code: destinationIata,
    destination_airport_id: resolvedIds.destinationId,
    flight_num: flightNumber,
  };

  const { error: insertError } = await supabase.from("routes").insert(routeData);

  if (insertError) {
    return { error: insertError.message };
  }

  return {};
};

interface BulkUpsertResult {
  upserted: number;
  skipped: number;
  errors: string[];
}

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

  const airlineCodes = new Set<string>();
  const airportCodes = new Set<string>();
  for (const route of uniqueRoutes.values()) {
    airlineCodes.add(route.airlineIata);
    airportCodes.add(route.originIata);
    airportCodes.add(route.destinationIata);
  }

  const [airlinesResult, airportsResult] = await Promise.all([
    supabase
      .from("airlines")
      .select("id, iata")
      .in("iata", Array.from(airlineCodes)),
    supabase
      .from("airports")
      .select("id, iata_code")
      .in("iata_code", Array.from(airportCodes)),
  ]);

  if (airlinesResult.error) {
    return {
      upserted: 0,
      skipped: routes.length,
      errors: [airlinesResult.error.message],
    };
  }

  if (airportsResult.error) {
    return {
      upserted: 0,
      skipped: routes.length,
      errors: [airportsResult.error.message],
    };
  }

  const airlineByIata = new Map<string, number>();
  for (const airline of airlinesResult.data || []) {
    if (airline.iata) {
      airlineByIata.set(airline.iata, airline.id);
    }
  }

  const airportByIata = new Map<string, number>();
  for (const airport of airportsResult.data || []) {
    if (airport.iata_code) {
      airportByIata.set(airport.iata_code, airport.id);
    }
  }

  const lookupMaps: RouteLookupMaps = { airlineByIata, airportByIata };

  for (const route of uniqueRoutes.values()) {
    const { error } = await upsertRouteByAirlineAndAirports(route, lookupMaps);
    if (error) {
      errors.push(error);
    } else {
      upserted += 1;
    }
  }

  skipped += errors.length;

  return { upserted, skipped, errors };
};
