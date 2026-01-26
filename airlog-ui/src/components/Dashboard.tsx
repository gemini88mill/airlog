import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/apiClient';
import { DashboardHeader } from './organisms/DashboardHeader';
import { Sidebar } from './organisms/Sidebar';
import { Timeline } from './organisms/Timeline';

type Circle = {
  id: string;
  name: string;
  role: string;
  members: Array<{
    id: string;
    displayName: string;
  }>;
};

type Flight = {
  id: string;
  airline_iata: string | null;
  flight_number: string;
  role: 'passenger' | 'crew';
  visibility: 'private' | 'shared';
  origin_iata: string | null;
  destination_iata: string | null;
  flight_date: string;
};

type BootstrapData = {
  user: {
    id: string;
    displayName: string;
  };
  circles: Circle[];
  defaults: {
    activeCircleId: string | null;
    canCreateFlights: boolean;
  };
};

type DashboardProps = {
  bootstrapData: BootstrapData;
  onLogout: () => void;
};

export const Dashboard = ({ bootstrapData, onLogout }: DashboardProps) => {
  const [activeCircleId, setActiveCircleId] = useState<string | null>(
    bootstrapData.defaults.activeCircleId
  );
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('timeline');
  const [scope, setScope] = useState<'mine' | 'shared' | 'circle'>('mine');

  const fetchFlights = useCallback(async (flightScope: 'mine' | 'shared' | 'circle', circleId?: string | null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ scope: flightScope });
      if (flightScope === 'circle' && circleId) {
        params.append('circleId', circleId);
      }

      const response = await apiClient.get(`/v1/flights?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch flights');
      }

      const data = await response.json();
      setFlights(data.flights || []);
    } catch (error) {
      console.error('Error fetching flights:', error);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights(scope, activeCircleId);
  }, [scope, activeCircleId, fetchFlights]);

  const handleScopeChange = (newScope: 'mine' | 'shared' | 'circle', circleId?: string | null) => {
    setScope(newScope);
    if (newScope === 'circle') {
      setActiveCircleId(circleId || null);
    }
  };

  const handleCircleChange = (circleId: string | null) => {
    setActiveCircleId(circleId);
    if (scope === 'circle') {
      fetchFlights('circle', circleId);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DashboardHeader
        circles={bootstrapData.circles}
        activeCircleId={activeCircleId}
        onCircleChange={handleCircleChange}
        onProfileClick={onLogout}
        displayName={bootstrapData.user.displayName}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <div className="flex-1 overflow-y-auto">
          {activeView === 'timeline' && (
            <Timeline
              flights={flights}
              circles={bootstrapData.circles}
              activeCircleId={activeCircleId}
              onScopeChange={handleScopeChange}
              loading={loading}
            />
          )}
          {activeView === 'add-flight' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Flight</h2>
              <p className="text-gray-600">Add flight form coming soon...</p>
            </div>
          )}
          {activeView === 'circle' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Circle</h2>
              <p className="text-gray-600">Circle management coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
