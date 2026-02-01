const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY;
const AVIATIONSTACK_BASE_URL =
  process.env.AVIATIONSTACK_BASE_URL || "https://api.aviationstack.com/v1";

interface RepositorySuccess<T> {
  data: T;
}

interface RepositoryError {
  error: string;
  status: number;
}

type RepositoryResult<T> = RepositorySuccess<T> | RepositoryError;

export const fetchAviationStackFlights = async (
  flightIata: string,
  limit: number,
  offset: number
): Promise<RepositoryResult<unknown>> => {
  if (!AVIATIONSTACK_API_KEY) {
    return { error: "AviationStack API key is not configured", status: 500 };
  }

  const params = new URLSearchParams({
    access_key: AVIATIONSTACK_API_KEY,
    limit: String(limit),
    offset: String(offset),
    flight_iata: flightIata.toUpperCase(),
  });

  const response = await fetch(
    `${AVIATIONSTACK_BASE_URL}/flights?${params.toString()}`,
    {
      headers: {
        accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    return {
      error: `AviationStack API error: ${response.status}`,
      status: 502,
    };
  }

  const data = await response.json();
  return { data };
};
