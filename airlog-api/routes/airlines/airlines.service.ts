import { fetchAirlines, type AirlineRecord } from "./airlines.repository";

type ServiceResult =
  | { data: { airlines: AirlineRecord[] } }
  | { error: string };

export const listAirlines = async (
  query: string,
  limit: number
): Promise<ServiceResult> => {
  const result = await fetchAirlines(query, limit);

  if ("error" in result) {
    return { error: result.error };
  }

  return { data: { airlines: result.data } };
};
