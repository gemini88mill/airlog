type FlightCardProps = {
  airlineIata: string | null;
  flightNumber: string;
  role: 'passenger' | 'crew';
  visibility: 'private' | 'shared';
  originIata: string | null;
  destinationIata: string | null;
  flightDate: string;
  status?: 'upcoming' | 'recent';
  statusText?: string;
};

export const FlightCard = ({
  airlineIata,
  flightNumber,
  role,
  visibility,
  originIata,
  destinationIata,
  flightDate,
  statusText,
}: FlightCardProps) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatRole = (role: string): string => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const route = originIata && destinationIata 
    ? `${originIata} → ${destinationIata}`
    : originIata 
    ? `${originIata} → TBD`
    : destinationIata
    ? `TBD → ${destinationIata}`
    : 'Route TBD';

  const airlineCode = airlineIata || 'XX';

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-3 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">✈</span>
            <span className="font-semibold text-gray-900">
              {airlineCode} {flightNumber}
            </span>
            <span className="text-sm text-gray-600">{formatRole(role)}</span>
            <span className="text-sm text-gray-600">{visibility === 'shared' ? 'Shared' : 'Private'}</span>
          </div>
          <div className="text-gray-700 mb-1">{route}</div>
          {statusText && (
            <div className="text-sm text-gray-600">{statusText}</div>
          )}
        </div>
        <div className="text-sm text-gray-500 ml-4">
          {formatDate(flightDate)}
        </div>
      </div>
    </div>
  );
};
