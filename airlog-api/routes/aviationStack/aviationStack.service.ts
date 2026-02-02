import { fetchAviationStackFlights } from "./aviationStack.repository";

interface ServiceError {
  message: string;
  status: number;
}

type ServiceResult<T> = [T, null] | [null, ServiceError];

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

  const [data, error] = await fetchAviationStackFlights(
    flightIata,
    limit,
    offset
  );

  if (error) {
    const status = error.includes("not configured") ? 500 : 502;
    return [null, { message: error, status }];
  }

  if (!data) {
    return [
      null,
      { message: "AviationStack response was empty", status: 502 },
    ];
  }

  return [data, null];
};
