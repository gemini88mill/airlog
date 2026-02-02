import { fetchAirlines, type AirlineRecord } from "./airlines.repository";

type ServiceResult =
  | [{ airlines: AirlineRecord[] }, null]
  | [null, { message: string; status: number }];

export const listAirlines = async (
  query: string,
  limit: number
): Promise<ServiceResult> => {
  const [data, error] = await fetchAirlines(query, limit);

  if (error) {
    return [null, { message: error, status: 400 }];
  }

  if (!data) {
    return [null, { message: "Failed to fetch airlines", status: 500 }];
  }

  return [{ airlines: data }, null];
};
