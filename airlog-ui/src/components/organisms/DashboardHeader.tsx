import { useState } from 'react';

type Circle = {
  id: string;
  name: string;
  role: string;
};

type DashboardHeaderProps = {
  circles: Circle[];
  activeCircleId: string | null;
  onCircleChange?: (circleId: string | null) => void;
  onProfileClick?: () => void;
  displayName?: string;
};

export const DashboardHeader = ({
  circles,
  activeCircleId,
  onCircleChange,
  onProfileClick,
  displayName,
}: DashboardHeaderProps) => {
  const activeCircle = circles.find(c => c.id === activeCircleId) || circles[0];
  const [isCircleDropdownOpen, setIsCircleDropdownOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-bold text-gray-900">Airlog</h1>
        <div className="relative">
          <button
            onClick={() => setIsCircleDropdownOpen(!isCircleDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-900">
              {activeCircle?.name || 'Select Circle'}
            </span>
            <span className="text-gray-500">▾</span>
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
                      onCircleChange?.(circle.id);
                      setIsCircleDropdownOpen(false);
                    }}
                    className={`
                      w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors
                      ${activeCircleId === circle.id ? 'bg-blue-50 font-medium' : ''}
                    `}
                  >
                    {circle.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <button
        onClick={onProfileClick}
        className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
      >
        {displayName ? `(${displayName})` : '(Profile)'}
      </button>
    </header>
  );
};
