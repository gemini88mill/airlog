type SidebarProps = {
  activeView?: string;
  onViewChange?: (view: string) => void;
};

export const Sidebar = ({ activeView = 'timeline', onViewChange }: SidebarProps) => {
  const menuItems = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'add-flight', label: 'Add Flight' },
    { id: 'circle', label: 'Circle' },
    { id: 'map', label: 'Map', disabled: true },
  ];

  return (
    <div className="w-48 bg-gray-50 border-r border-gray-200 p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.disabled && onViewChange?.(item.id)}
            disabled={item.disabled}
            className={`
              w-full text-left px-4 py-2 rounded-lg transition-colors
              ${activeView === item.id 
                ? 'bg-blue-100 text-blue-900 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
              }
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {item.label}
            {item.disabled && <span className="text-xs text-gray-500 ml-2">(later)</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};
