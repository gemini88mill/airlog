import { useState, useEffect, useCallback } from 'react';
import { Combobox } from '../atoms/Combobox';
import { useDebounce } from '../../lib/useDebounce';

type FlightData = {
  flight: {
    iata: string;
    icao: string | null;
    number: string;
  };
  airline: {
    name: string;
    iata: string;
    icao: string | null;
  };
  departure: {
    airport: string;
    iata: string;
    icao: string | null;
    scheduled: string;
  };
  arrival: {
    airport: string;
    iata: string;
    icao: string | null;
    scheduled: string;
  };
};

type FlightOption = {
  id: string;
  value: FlightData;
  label: string;
};

type AviationStackResponse = {
  data: FlightData[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
};

type FlightComboboxProps = {
  value: FlightData | null;
  onChange: (flight: FlightData | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onQueryChange?: (query: string) => void;
  onNoResults?: (hasSearched: boolean, query: string) => void;
};

const AVIATIONSTACK_API_KEY = import.meta.env.VITE_AVIATIONSTACK_API_KEY;
const AVIATIONSTACK_BASE_URL = import.meta.env.VITE_AVIATIONSTACK_BASE_URL
  || 'https://api.aviationstack.com/v1';

const searchFlights = async (query: string): Promise<FlightData[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  if (!AVIATIONSTACK_API_KEY) {
    console.error(
      'AviationStack API key is missing. Please set VITE_AVIATIONSTACK_API_KEY in your .env file.',
    );
    return [];
  }

  try {
    const params = new URLSearchParams({
      access_key: AVIATIONSTACK_API_KEY,
      limit: '100',
      offset: '0',
      flight_iata: query.toUpperCase(),
    });

    const response = await fetch(
      `${AVIATIONSTACK_BASE_URL}/flights?${params.toString()}`,
      {
        headers: {
          accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`AviationStack API error: ${response.status}`);
    }

    const data = (await response.json()) as AviationStackResponse;
    return data.data || [];
  } catch (error) {
    console.error('Error searching flights:', error);
    return [];
  }
};

const formatFlightLabel = (flight: FlightData): string => {
  const airline = flight.airline.name || flight.airline.iata;
  const flightNumber = flight.flight.iata || flight.flight.number;
  const departure = flight.departure.iata || flight.departure.airport;
  const arrival = flight.arrival.iata || flight.arrival.airport;

  return `${airline} ${flightNumber} - ${departure} → ${arrival}`;
};

export const FlightCombobox = ({
  value,
  onChange,
  placeholder = 'Search for a flight (e.g., DL296)',
  disabled = false,
  className = '',
  onQueryChange,
  onNoResults,
}: FlightComboboxProps) => {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<FlightOption[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  const fetchFlights = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 2) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const flights = await searchFlights(searchQuery);
        const flightOptions: FlightOption[] = flights.map((flight) => ({
          id: `${flight.flight.iata || flight.flight.number}-${
            flight.departure.iata
          }-${flight.arrival.iata}`,
          value: flight,
          label: formatFlightLabel(flight),
        }));
        setOptions(flightOptions);

        // Notify parent if no results found
        if (flightOptions.length === 0 && onNoResults) {
          onNoResults(true, searchQuery);
        }
      } catch (error) {
        console.error('Error fetching flights:', error);
        setOptions([]);
        if (onNoResults) {
          onNoResults(true, searchQuery);
        }
      } finally {
        setLoading(false);
      }
    },
    [onNoResults],
  );

  useEffect(() => {
    fetchFlights(debouncedQuery);
  }, [debouncedQuery, fetchFlights]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    onQueryChange?.(newQuery);
  };

  const displayValue = (flight: FlightData | null): string => {
    if (!flight) {
      return '';
    }
    return formatFlightLabel(flight);
  };

  return (
    <Combobox<FlightData>
      value={value}
      onChange={onChange}
      options={options}
      displayValue={displayValue}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      onQueryChange={handleQueryChange}
      loading={loading}
      emptyMessage={
        query.length < 2
          ? 'Type at least 2 characters to search'
          : 'No flights found'
      }
    />
  );
};
