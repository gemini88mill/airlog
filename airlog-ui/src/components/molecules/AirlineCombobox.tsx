import { useState, useEffect, useCallback } from 'react';
import { Combobox } from '../atoms/Combobox';
import { useDebounce } from '../../lib/useDebounce';
import { apiClient } from '../../lib/apiClient';

export interface Airline {
  id: number;
  name: string;
  iata: string | null;
  icao: string | null;
}

type AirlineComboboxProps = {
  value: Airline | null;
  onChange: (airline: Airline | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
  onQueryChange?: (query: string) => void;
};

const fetchAirlines = async (query: string): Promise<Airline[]> => {
  try {
    const queryParam = query ? `?q=${encodeURIComponent(query)}&limit=50` : '?limit=50';
    const response = await apiClient.get(`/v1/airlines${queryParam}`);
    if (response.ok) {
      const data = await response.json();
      return data.airlines || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching airlines:', error);
    return [];
  }
};

export const AirlineCombobox = ({
  value,
  onChange,
  placeholder = 'Search for an airline...',
  disabled = false,
  className = '',
  label = 'Airline',
  required = false,
  onQueryChange,
}: AirlineComboboxProps) => {
  const [query, setQuery] = useState('');
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  const fetchAirlinesData = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      const fetchedAirlines = await fetchAirlines(searchQuery);
      setAirlines(fetchedAirlines);
    } catch (error) {
      console.error('Error fetching airlines:', error);
      setAirlines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAirlinesData(debouncedQuery);
  }, [debouncedQuery, fetchAirlinesData]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    onQueryChange?.(newQuery);
  };

  const displayValue = (airline: Airline | null): string => {
    return airline?.name || '';
  };

  return (
    <Combobox<Airline>
      value={value}
      onChange={onChange}
      options={airlines.map((airline) => ({
        id: airline.id,
        value: airline,
        label: airline.name,
      }))}
      displayValue={displayValue}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      loading={loading}
      onQueryChange={handleQueryChange}
      emptyMessage="No airlines found"
      label={label}
      required={required}
    />
  );
};
