import { fetchAviationStackFlights } from "./aviationStack.repository";

interface ServiceSuccess<T> {
  data: T;
}

interface ServiceError {
  error: string;
  status: number;
}

type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

const parsePositiveInt = (value: string | null, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getAviationStackFlights = async (
  flightIata: string,
  limitParam: string | null,
  offsetParam: string | null
): Promise<ServiceResult<unknown>> => {
  const limit = parsePositiveInt(limitParam, 100);
  const offset = parsePositiveInt(offsetParam, 0);

  const result = await fetchAviationStackFlights(flightIata, limit, offset);

  if ("error" in result) {
    return { error: result.error, status: result.status };
  }

  return { data: result.data };
};
