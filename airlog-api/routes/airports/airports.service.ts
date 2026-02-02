import { fetchAirports, type AirportRecord } from "./airports.repository";

type ServiceResult =
  | [{ airports: AirportRecord[] }, null]
  | [null, { message: string; status: number }];

export const listAirports = async (
  query: string,
  limit: number
): Promise<ServiceResult> => {
  const [data, error] = await fetchAirports(query, limit);

  if (error) {
    return [null, { message: error, status: 400 }];
  }

  if (!data) {
    return [null, { message: "Failed to fetch airports", status: 500 }];
  }

  return [{ airports: data }, null];
};
