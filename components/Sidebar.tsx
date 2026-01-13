import React from 'react';
import { View } from '../types.ts';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen }) => {
  const menuItems: { id: View; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'input', label: 'Guest Entry', icon: 'fa-user-plus' },
    { id: 'rooms', label: 'Room Allocation', icon: 'fa-bed' },
    { id: 'transport', label: 'Transport', icon: 'fa-car' },
  ];

  return (
    <aside className={`
      fixed md:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <span className="text-lg font-bold tracking-tight">GuestHub</span>
      </div>

      <nav className="mt-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`
              w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200
              ${activeView === item.id 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
          >
            <i className={`fa-solid ${item.icon} w-6`}></i>
            <span className="ml-3 font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;