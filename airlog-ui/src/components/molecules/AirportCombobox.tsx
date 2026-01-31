import { useState, useEffect, useCallback } from 'react';
import { Combobox } from '../atoms/Combobox';
import { useDebounce } from '../../lib/useDebounce';
import { apiClient } from '../../lib/apiClient';

export interface Airport {
  id: number;
  name: string;
  iata_code: string | null;
  icao_code: string | null;
  city: string;
  country: string;
}

type AirportComboboxProps = {
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
  onQueryChange?: (query: string) => void;
};

const fetchAirports = async (query: string): Promise<Airport[]> => {
  try {
    const queryParam = query ? `?q=${encodeURIComponent(query)}&limit=50` : '?limit=50';
    const response = await apiClient.get(`/v1/airports${queryParam}`);
    if (response.ok) {
      const data = await response.json();
      return data.airports || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching airports:', error);
    return [];
  }
};

export const AirportCombobox = ({
  value,
  onChange,
  placeholder = 'Search for an airport...',
  disabled = false,
  className = '',
  label = 'Airport',
  required = false,
  onQueryChange,
}: AirportComboboxProps) => {
  const [query, setQuery] = useState('');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  const fetchAirportsData = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      const fetchedAirports = await fetchAirports(searchQuery);
      setAirports(fetchedAirports);
    } catch (error) {
      console.error('Error fetching airports:', error);
      setAirports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAirportsData(debouncedQuery);
  }, [debouncedQuery, fetchAirportsData]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    onQueryChange?.(newQuery);
  };

  const displayValue = (airport: Airport | null): string => {
    return airport?.name || '';
  };

  return (
    <Combobox<Airport>
      value={value}
      onChange={onChange}
      options={airports.map((airport) => ({
        id: airport.id,
        value: airport,
        label: `${airport.name} (${airport.iata_code || airport.icao_code || ''})`,
      }))}
      displayValue={displayValue}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      loading={loading}
      onQueryChange={handleQueryChange}
      emptyMessage="No airports found"
      label={label}
      required={required}
    />
  );
};
