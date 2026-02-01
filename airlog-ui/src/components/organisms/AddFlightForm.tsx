import { useState, useEffect } from "react";
import { Field, Label } from "@headlessui/react";
import { FlightCombobox } from "../molecules/FlightCombobox";
import { AirlineCombobox, type Airline } from "../molecules/AirlineCombobox";
import { AirportCombobox, type Airport } from "../molecules/AirportCombobox";
import { FormField } from "../molecules/FormField";
import { SelectField } from "../molecules/SelectField";
import { Button } from "../atoms/Button";
import { ErrorMessage } from "../atoms/ErrorMessage";
import { apiClient } from "../../lib/apiClient";

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

type AddFlightFormProps = {
  userId: string;
  activeCircleId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type FlightFormData = {
  flight_number: string;
  flight_date: string;
  airline_iata: string;
  origin_iata: string;
  destination_iata: string;
  role: "passenger" | "crew";
  visibility: "private" | "shared";
};

export const AddFlightForm = ({
  userId,
  activeCircleId,
  onSuccess,
  onCancel,
}: AddFlightFormProps) => {
  const [selectedFlight, setSelectedFlight] = useState<FlightData | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Airline combobox state
  const [selectedAirline, setSelectedAirline] = useState<Airline | null>(null);

  // Airport combobox state
  const [selectedOriginAirport, setSelectedOriginAirport] =
    useState<Airport | null>(null);
  const [selectedDestinationAirport, setSelectedDestinationAirport] =
    useState<Airport | null>(null);

  const [formData, setFormData] = useState<FlightFormData>({
    flight_number: "",
    flight_date: "",
    airline_iata: "",
    origin_iata: "",
    destination_iata: "",
    role: "passenger",
    visibility: "private",
  });

  // Auto-fill form when flight is selected from combobox
  useEffect(() => {
    if (selectedFlight) {
      setFormData({
        flight_number:
          selectedFlight.flight.iata || selectedFlight.flight.number,
        flight_date: selectedFlight.departure.scheduled
          ? new Date(selectedFlight.departure.scheduled)
              .toISOString()
              .split("T")[0]
          : "",
        airline_iata: selectedFlight.airline.iata || "",
        origin_iata: selectedFlight.departure.iata || "",
        destination_iata: selectedFlight.arrival.iata || "",
        role: "passenger",
        visibility: "private",
      });

      // Fetch and set selected airline
      if (selectedFlight.airline.iata) {
        const fetchAirline = async () => {
          try {
            const response = await apiClient.get(
              `/v1/airlines?q=${encodeURIComponent(
                selectedFlight.airline.iata
              )}&limit=1`
            );
            if (response.ok) {
              const data = await response.json();
              const airline = data.airlines?.find(
                (a: Airline) => a.iata === selectedFlight.airline.iata
              );
              if (airline) {
                setSelectedAirline(airline);
              }
            }
          } catch (err) {
            console.error("Failed to fetch airline:", err);
          }
        };
        fetchAirline();
      }

      // Fetch and set selected origin airport
      if (selectedFlight.departure.iata) {
        const fetchOriginAirport = async () => {
          try {
            const response = await apiClient.get(
              `/v1/airports?q=${encodeURIComponent(
                selectedFlight.departure.iata
              )}&limit=1`
            );
            if (response.ok) {
              const data = await response.json();
              const airport = data.airports?.find(
                (a: Airport) => a.iata_code === selectedFlight.departure.iata
              );
              if (airport) {
                setSelectedOriginAirport(airport);
              }
            }
          } catch (err) {
            console.error("Failed to fetch origin airport:", err);
          }
        };
        fetchOriginAirport();
      }

      // Fetch and set selected destination airport
      if (selectedFlight.arrival.iata) {
        const fetchDestinationAirport = async () => {
          try {
            const response = await apiClient.get(
              `/v1/airports?q=${encodeURIComponent(
                selectedFlight.arrival.iata
              )}&limit=1`
            );
            if (response.ok) {
              const data = await response.json();
              const airport = data.airports?.find(
                (a: Airport) => a.iata_code === selectedFlight.arrival.iata
              );
              if (airport) {
                setSelectedDestinationAirport(airport);
              }
            }
          } catch (err) {
            console.error("Failed to fetch destination airport:", err);
          }
        };
        fetchDestinationAirport();
      }

      setShowManualEntry(false);
    }
  }, [selectedFlight]);

  const handleInputChange =
    (field: keyof FlightFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  // Handle airline selection
  const handleAirlineChange = (airline: Airline | null) => {
    setSelectedAirline(airline);
    setFormData((prev) => ({
      ...prev,
      airline_iata: airline?.iata || "",
    }));
  };

  // Handle origin airport selection
  const handleOriginAirportChange = (airport: Airport | null) => {
    setSelectedOriginAirport(airport);
    setFormData((prev) => ({
      ...prev,
      origin_iata: airport?.iata_code || "",
    }));
  };

  // Handle destination airport selection
  const handleDestinationAirportChange = (airport: Airport | null) => {
    setSelectedDestinationAirport(airport);
    setFormData((prev) => ({
      ...prev,
      destination_iata: airport?.iata_code || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        flight_number: formData.flight_number,
        flight_date: formData.flight_date,
        user_id: userId,
        airline_iata: formData.airline_iata || null,
        origin_iata: formData.origin_iata || null,
        destination_iata: formData.destination_iata || null,
        role: formData.role,
        visibility: formData.visibility,
        circle_id: activeCircleId || null,
      };

      const response = await apiClient.post("/v1/flights", payload);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to add flight" }));
        throw new Error(errorData.error || "Failed to add flight");
      }

      // Reset form
      setSelectedFlight(null);
      setFormData({
        flight_number: "",
        flight_date: "",
        airline_iata: "",
        origin_iata: "",
        destination_iata: "",
        role: "passenger",
        visibility: "private",
      });
      setShowManualEntry(false);
      setHasSearched(false);
      setSearchQuery("");
      setSelectedAirline(null);
      setSelectedOriginAirport(null);
      setSelectedDestinationAirport(null);

      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNoResults = (searched: boolean, query: string) => {
    setHasSearched(searched);
    setSearchQuery(query);
  };

  const handleManualEntryClick = () => {
    setShowManualEntry(true);
    setSelectedFlight(null);
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Flight</h2>
        <p className="text-gray-600">
          Search for your flight or enter details manually
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!showManualEntry && (
          <Field className="mb-4">
            <Label>Search Flight</Label>
            <FlightCombobox
              value={selectedFlight}
              onChange={setSelectedFlight}
              placeholder="Search for a flight (e.g., DL296)"
              onQueryChange={setSearchQuery}
              onNoResults={handleNoResults}
            />
            {hasSearched && searchQuery.length >= 2 && !selectedFlight && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800 mb-2">
                  Couldn't find your flight? You can enter the details manually.
                </p>
                <button
                  type="button"
                  onClick={handleManualEntryClick}
                  className="text-sm font-medium text-yellow-900 hover:text-yellow-700 underline"
                >
                  Enter flight details manually
                </button>
              </div>
            )}
            {!hasSearched && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleManualEntryClick}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Or enter flight details manually
                </button>
              </div>
            )}
          </Field>
        )}

        {showManualEntry && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Manual Entry
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowManualEntry(false);
                  setSelectedFlight(null);
                }}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Search instead
              </button>
            </div>
          </div>
        )}

        <FormField
          id="flight_number"
          label="Flight Number"
          value={formData.flight_number}
          onChange={handleInputChange("flight_number")}
          placeholder="e.g., DL296"
          required
          disabled={loading}
        />

        <FormField
          id="flight_date"
          label="Flight Date"
          type="date"
          value={formData.flight_date}
          onChange={handleInputChange("flight_date")}
          required
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <AirlineCombobox
            value={selectedAirline}
            onChange={handleAirlineChange}
            disabled={loading}
            label="Airline"
          />

          <AirportCombobox
            value={selectedOriginAirport}
            onChange={handleOriginAirportChange}
            disabled={loading}
            label="Origin Airport"
          />
        </div>

        <AirportCombobox
          value={selectedDestinationAirport}
          onChange={handleDestinationAirportChange}
          disabled={loading}
          label="Destination Airport"
        />
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            id="role"
            label="Role"
            value={formData.role}
            onChange={handleInputChange("role")}
            options={[
              { value: "passenger", label: "Passenger" },
              { value: "crew", label: "Crew" },
            ]}
            disabled={loading}
          />

          <SelectField
            id="visibility"
            label="Visibility"
            value={formData.visibility}
            onChange={handleInputChange("visibility")}
            options={[
              { value: "private", label: "Private" },
              { value: "shared", label: "Shared" },
            ]}
            disabled={loading}
          />
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="flex gap-4 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            fullWidth={!onCancel}
            loading={loading}
            disabled={loading}
          >
            {loading ? "Adding Flight..." : "Add Flight"}
          </Button>
        </div>
      </form>
    </div>
  );
};
