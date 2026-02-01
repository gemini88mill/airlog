import { fetchAirports, type AirportRecord } from "./airports.repository";

type ServiceResult =
  | { data: { airports: AirportRecord[] } }
  | { error: string };

export const listAirports = async (
  query: string,
  limit: number
): Promise<ServiceResult> => {
  const result = await fetchAirports(query, limit);

  if ("error" in result) {
    return { error: result.error };
  }

  return { data: { airports: result.data } };
};
