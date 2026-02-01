import {
  findRouteByAirlineAndNumber,
  findRouteByFlightNumbers,
  type RouteMatchRecord,
} from "./routes.repository";
import { upsertRouteByAirlineAndAirports, upsertRoutesBulk } from "./routeUpsert";

interface ServiceSuccess<T> {
  data: T;
}

interface ServiceError {
  error: string;
  status: number;
}

type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

interface RouteLookupResponse {
  data: {
    flight_number: string;
    flight_date: null;
    user_id: null;
    airline_iata: string;
    origin_iata: string;
    destination_iata: string;
    role: "passenger";
    visibility: "private";
    circle_id: null;
    note: null;
  };
}

interface RouteUpsertInput {
  airlineIata: string;
  originIata: string;
  destinationIata: string;
  flightNumber: string;
}

interface BulkRouteUpsertResult {
  message: string;
  upserted: number;
  skipped: number;
  errors: string[];
}

const normalizeFlightNumber = (flightNumber: string): string =>
  flightNumber.replace(/\s+/g, "").toUpperCase();

const parseFlightNumber = (
  flightNumber: string
): { airlineCode: string; number: string } | null => {
  const normalized = normalizeFlightNumber(flightNumber);
  const match = normalized.match(/^([A-Z]{2,3})(\d+)$/);
  if (!match || !match[1] || !match[2]) {
    return null;
  }

  return { airlineCode: match[1], number: match[2] };
};

const buildLookupResponse = (
  route: RouteMatchRecord,
  fallbackFlightNumber: string
): RouteLookupResponse => ({
  data: {
    flight_number: route.flight_num || fallbackFlightNumber,
    flight_date: null,
    user_id: null,
    airline_iata: route.airline_code,
    origin_iata: route.source_airport_code,
    destination_iata: route.destination_airport_code,
    role: "passenger",
    visibility: "private",
    circle_id: null,
    note: null,
  },
});

export const lookupRoute = async (
  flightNumber: string
): Promise<ServiceResult<RouteLookupResponse>> => {
  const normalized = normalizeFlightNumber(flightNumber);
  const candidates =
    normalized === flightNumber ? [normalized] : [flightNumber, normalized];

  const matchResult = await findRouteByFlightNumbers(candidates);

  if ("error" in matchResult) {
    return { error: matchResult.error, status: 400 };
  }

  if (!matchResult.data) {
    const parsed = parseFlightNumber(flightNumber);
    if (parsed) {
      const parsedResult = await findRouteByAirlineAndNumber(
        parsed.airlineCode,
        parsed.number
      );

      if ("error" in parsedResult) {
        return { error: parsedResult.error, status: 400 };
      }

      if (parsedResult.data) {
        return { data: buildLookupResponse(parsedResult.data, normalized) };
      }
    }

    return {
      error: "Route not found for flight number",
      status: 404,
    };
  }

  return { data: buildLookupResponse(matchResult.data, normalized) };
};

export const upsertRoute = async (
  input: RouteUpsertInput
): Promise<ServiceResult<{ message: string }>> => {
  const { error } = await upsertRouteByAirlineAndAirports(input);

  if (error) {
    return { error, status: 400 };
  }

  return { data: { message: "Route upserted" } };
};

export const upsertRoutesInBulk = async (
  routes: RouteUpsertInput[]
): Promise<ServiceResult<BulkRouteUpsertResult>> => {
  const result = await upsertRoutesBulk(routes);

  return {
    data: {
      message: "Routes upserted",
      ...result,
    },
  };
};
