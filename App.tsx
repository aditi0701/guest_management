
import React, { useState, useEffect, useCallback } from 'react';
import { Guest, View } from './types';
import Dashboard from './components/Dashboard';
import GuestInput from './components/GuestInput';
import RoomAllocation from './components/RoomAllocation';
import TransportAllocation from './components/TransportAllocation';
import Sidebar from './components/Sidebar';

const STORAGE_KEY = 'guest_management_data_v1';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);

  // Initialize data and run retention logic
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedGuests: Guest[] = JSON.parse(savedData);
      
      // Retention Policy: Delete entries 7 days after departure
      const now = new Date();
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      
      const filteredGuests = parsedGuests.filter(guest => {
        const departureDate = new Date(guest.departure);
        const diff = now.getTime() - departureDate.getTime();
        return diff < SEVEN_DAYS_MS;
      });

      setGuests(filteredGuests);
      if (filteredGuests.length !== parsedGuests.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredGuests));
      }
    }
  }, []);

  const saveGuests = useCallback((updatedGuests: Guest[]) => {
    setGuests(updatedGuests);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGuests));
  }, []);

  const handleUpsertGuest = (guest: Guest) => {
    const index = guests.findIndex(g => g.id === guest.id);
    if (index > -1) {
      // Update existing
      const updated = [...guests];
      updated[index] = guest;
      saveGuests(updated);
    } else {
      // Add new
      saveGuests([...guests, guest]);
    }
    setEditingGuestId(null);
    setActiveView('dashboard');
  };

  const handleUpdateGuest = (updatedGuest: Guest) => {
    saveGuests(guests.map(g => g.id === updatedGuest.id ? updatedGuest : g));
  };

  const handleEditClick = (id: string) => {
    setEditingGuestId(id);
    setActiveView('input');
  };

  const handleDeleteGuest = (id: string) => {
    if (window.confirm('Are you sure you want to remove this guest entry? This action cannot be undone.')) {
      saveGuests(guests.filter(g => g.id !== id));
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            guests={guests} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteGuest} 
          />
        );
      case 'input':
        const guestToEdit = guests.find(g => g.id === editingGuestId);
        return (
          <GuestInput 
            onSubmit={handleUpsertGuest} 
            editingGuest={guestToEdit} 
            onCancel={() => {
              setEditingGuestId(null);
              setActiveView('dashboard');
            }}
          />
        );
      case 'rooms':
        return <RoomAllocation guests={guests} onUpdate={handleUpdateGuest} />;
      case 'transport':
        return <TransportAllocation guests={guests} onUpdate={handleUpdateGuest} />;
      default:
        return (
          <Dashboard 
            guests={guests} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteGuest} 
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        activeView={activeView} 
        onViewChange={(view) => {
          if (view !== 'input') setEditingGuestId(null);
          setActiveView(view);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-md md:hidden"
            >
              <i className="fa-solid fa-bars text-slate-600"></i>
            </button>
            <h1 className="text-xl font-bold text-slate-800 capitalize">
              {activeView === 'dashboard' ? 'Overview' : activeView.replace(/([A-Z])/g, ' $1')}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-sm text-slate-500 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              GM
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
