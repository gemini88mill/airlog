import { useState } from "react";
import { FlightCard } from "../atoms/FlightCard";

type Flight = {
  id: string;
  airline_iata: string | null;
  flight_number: string;
  role: "passenger" | "crew";
  visibility: "private" | "shared";
  origin_iata: string | null;
  destination_iata: string | null;
  flight_date: string;
};

type TimelineProps = {
  flights: Flight[];
  circles: Array<{ id: string; name: string }>;
  activeCircleId: string | null;
  onScopeChange?: (
    scope: "mine" | "shared" | "circle",
    circleId?: string | null
  ) => void;
  onAddFlight?: () => void;
  loading?: boolean;
};

export const Timeline = ({
  flights,
  circles,
  activeCircleId,
  onScopeChange,
  onAddFlight,
  loading = false,
}: TimelineProps) => {
  const [activeScope, setActiveScope] = useState<"mine" | "shared" | "circle">(
    "mine"
  );
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(
    activeCircleId
  );
  const [isCircleDropdownOpen, setIsCircleDropdownOpen] = useState(false);

  const handleScopeChange = (
    scope: "mine" | "shared" | "circle",
    circleId?: string | null
  ) => {
    setActiveScope(scope);
    if (scope === "circle" && circleId) {
      setSelectedCircleId(circleId);
    }
    onScopeChange?.(scope, circleId);
  };

  const now = new Date();
  const upcomingFlights = flights
    .filter((flight) => {
      const flightDate = new Date(flight.flight_date);
      return flightDate >= now;
    })
    .sort(
      (a, b) =>
        new Date(a.flight_date).getTime() - new Date(b.flight_date).getTime()
    );

  const recentFlights = flights
    .filter((flight) => {
      const flightDate = new Date(flight.flight_date);
      return flightDate < now;
    })
    .sort(
      (a, b) =>
        new Date(b.flight_date).getTime() - new Date(a.flight_date).getTime()
    );

  const formatStatusText = (
    flightDate: string,
    isUpcoming: boolean
  ): string => {
    const date = new Date(flightDate);
    const timeString = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    if (isUpcoming) {
      return `Arrives ${timeString}`;
    }
    return `Landed ${timeString}`;
  };

  const selectedCircle = circles.find((c) => c.id === selectedCircleId);

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Timeline</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => handleScopeChange("mine")}
            className={`
              px-4 py-2 rounded-lg transition-colors
              ${
                activeScope === "mine"
                  ? "bg-primary-500 text-white font-medium"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            Mine
          </button>
          <button
            onClick={() => handleScopeChange("shared")}
            className={`
              px-4 py-2 rounded-lg transition-colors
              ${
                activeScope === "shared"
                  ? "bg-blue-600 text-white font-medium"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            Shared
          </button>
          <div className="relative">
            <button
              onClick={() => {
                if (activeScope === "circle") {
                  setIsCircleDropdownOpen(!isCircleDropdownOpen);
                } else {
                  handleScopeChange(
                    "circle",
                    selectedCircleId || activeCircleId
                  );
                }
              }}
              className={`
                px-4 py-2 rounded-lg transition-colors flex items-center gap-2
                ${
                  activeScope === "circle"
                    ? "bg-primary-500 text-white font-medium"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              {selectedCircle?.name || "Select Circle"}
              <span className="text-xs">▾</span>
            </button>
            {isCircleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsCircleDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px]">
                  {circles.map((circle) => (
                    <button
                      key={circle.id}
                      onClick={() => {
                        handleScopeChange("circle", circle.id);
                        setIsCircleDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      {circle.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button className="ml-auto px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
            <span className="text-lg">⌕</span>
          </button>
        </div>
      </div>

      {upcomingFlights.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>
          {upcomingFlights.map((flight) => (
            <FlightCard
              key={flight.id}
              airlineIata={flight.airline_iata}
              flightNumber={flight.flight_number}
              role={flight.role}
              visibility={flight.visibility}
              originIata={flight.origin_iata}
              destinationIata={flight.destination_iata}
              flightDate={flight.flight_date}
              status="upcoming"
              statusText={formatStatusText(flight.flight_date, true)}
            />
          ))}
        </div>
      )}

      {recentFlights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent</h3>
          {recentFlights.map((flight) => (
            <FlightCard
              key={flight.id}
              airlineIata={flight.airline_iata}
              flightNumber={flight.flight_number}
              role={flight.role}
              visibility={flight.visibility}
              originIata={flight.origin_iata}
              destinationIata={flight.destination_iata}
              flightDate={flight.flight_date}
              status="recent"
              statusText={formatStatusText(flight.flight_date, false)}
            />
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-gray-500">
          <p>Loading flights...</p>
        </div>
      )}

      {!loading &&
        upcomingFlights.length === 0 &&
        recentFlights.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No flights found. Add your first flight to get started!</p>
          </div>
        )}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onAddFlight}
          className="w-full px-4 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          <span>Add Flight</span>
        </button>
      </div>
    </div>
  );
};
