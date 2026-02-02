import type { TablesInsert } from "../../database.types";
import { upsertRouteByAirlineAndAirports } from "../routes/routeUpsert";
import {
  fetchFlights,
  insertFlight,
  type FlightsQueryFilters,
} from "./flights.repository";

interface ServiceError {
  message: string;
  status: number;
}

type ServiceResult<T> = [T, null] | [null, ServiceError];

interface CreateFlightResponse {
  message: string;
  data: Record<string, unknown>;
}

interface FetchFlightsResponse {
  scope: string;
  circleId: string | null;
  flights: Array<Record<string, unknown>>;
}

const isString = (value: unknown): value is string => typeof value === "string";

const extractFlightNumber = (flightNumber: string): number | null => {
  const cleaned = flightNumber.replace(/^[A-Z]{2,3}\s*/i, "").trim();
  const numericMatch = cleaned.match(/\d+/);

  if (!numericMatch) {
    return null;
  }

  const numericValue = parseInt(numericMatch[0], 10);

  if (Number.isNaN(numericValue)) {
    return null;
  }

  return numericValue;
};

export const createFlight = async (
  payload: Record<string, unknown>
): Promise<ServiceResult<CreateFlightResponse>> => {
  if (
    !isString(payload.flight_date) ||
    !isString(payload.flight_number) ||
    !isString(payload.user_id)
  ) {
    return [
      null,
      {
        message: "Missing required fields: flight_date, flight_number, user_id",
        status: 400,
      },
    ];
  }

  const rawFlightNumber = payload.flight_number;
  const flightNumberNumeric = extractFlightNumber(rawFlightNumber);

  if (flightNumberNumeric === null) {
    return [
      null,
      {
        message:
          "Invalid flight number. Could not extract a valid numeric flight number.",
        status: 400,
      },
    ];
  }

  const flightData: TablesInsert<"flights"> = {
    flight_date: payload.flight_date,
    flight_number: flightNumberNumeric,
    user_id: payload.user_id,
    airline_iata: isString(payload.airline_iata) ? payload.airline_iata : null,
    destination_iata: isString(payload.destination_iata)
      ? payload.destination_iata
      : null,
    origin_iata: isString(payload.origin_iata) ? payload.origin_iata : null,
    note: isString(payload.note) ? payload.note : null,
    circle_id: isString(payload.circle_id) ? payload.circle_id : null,
    role: (payload.role as "passenger" | "crew") || "passenger",
    visibility: (payload.visibility as "private" | "shared") || "private",
  };

  const [insertData, insertError] = await insertFlight(flightData);

  if (insertError) {
    return [null, { message: insertError, status: 400 }];
  }
  if (!insertData) {
    return [null, { message: "Failed to create flight", status: 400 }];
  }

  if (
    flightData.airline_iata &&
    flightData.origin_iata &&
    flightData.destination_iata
  ) {
    const { error: routeError } = await upsertRouteByAirlineAndAirports({
      airlineIata: flightData.airline_iata,
      originIata: flightData.origin_iata,
      destinationIata: flightData.destination_iata,
      flightNumber: rawFlightNumber,
    });

    if (routeError) {
      console.error("Error upserting route:", routeError);
    }
  }

  return [
    {
      message: "Flight added",
      data: insertData,
    },
    null,
  ];
};

export const listFlights = async (
  filters: FlightsQueryFilters
): Promise<ServiceResult<FetchFlightsResponse>> => {
  const [data, error] = await fetchFlights(filters);

  if (error) {
    return [null, { message: error, status: 400 }];
  }
  if (!data) {
    return [null, { message: "Failed to fetch flights", status: 400 }];
  }

  return [
    {
      scope: filters.scope,
      circleId: filters.circleId,
      flights: data,
    },
    null,
  ];
};
