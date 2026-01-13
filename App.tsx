import React, { useState, useEffect, useCallback } from 'react';
import { Guest, View, TransportType } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import GuestInput from './components/GuestInput.tsx';
import RoomAllocation from './components/RoomAllocation.tsx';
import TransportAllocation from './components/TransportAllocation.tsx';
import Sidebar from './components/Sidebar.tsx';
import { supabase, isSupabaseConfigured } from './lib/supabase.ts';

const STORAGE_KEY = 'guesthub_local_data';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [forceLocal, setForceLocal] = useState(!isSupabaseConfigured);

  // Map DB format to UI format
  const mapGuest = (dbGuest: any): Guest => ({
    id: dbGuest.id,
    name: dbGuest.name,
    rank: dbGuest.rank,
    arrival: dbGuest.arrival,
    departure: dbGuest.departure,
    additionalGuests: dbGuest.additional_guests ?? 0,
    eventName: dbGuest.event_name || '',
    roomId: dbGuest.room_id,
    transport: dbGuest.transport as TransportType,
    createdAt: dbGuest.created_at
  });

  const cleanupOldEntries = (allGuests: Guest[]) => {
    const now = new Date().getTime();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    
    return allGuests.filter(guest => {
      const departureTime = new Date(guest.departure).getTime();
      const isExpired = (now - departureTime) > SEVEN_DAYS_MS;
      
      if (isExpired && isSupabaseConfigured && !forceLocal) {
        // Async delete from cloud if possible
        supabase?.from('guests').delete().eq('id', guest.id).then();
      }
      
      return !isExpired;
    });
  };

  const fetchGuests = useCallback(async () => {
    if (forceLocal || !supabase) {
      const local = localStorage.getItem(STORAGE_KEY);
      const parsed = local ? JSON.parse(local) : [];
      setGuests(cleanupOldEntries(parsed));
      setIsLoading(false);
      return;
    }

    setIsSyncing(true);
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('arrival', { ascending: true });

      if (error) throw error;
      const mapped = (data || []).map(mapGuest);
      setGuests(cleanupOldEntries(mapped));
    } catch (err) {
      console.error('Cloud fetch failed, switching to local:', err);
      setForceLocal(true);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [forceLocal]);

  useEffect(() => {
    fetchGuests();

    if (isSupabaseConfigured && !forceLocal && supabase) {
      const channel = supabase
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' }, () => {
          fetchGuests();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [fetchGuests, forceLocal]);

  const saveGuests = async (updatedGuests: Guest[]) => {
    setGuests(updatedGuests);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGuests));
  };

  const handleUpsertGuest = async (guest: Guest) => {
    setIsSyncing(true);
    try {
      if (!forceLocal && supabase) {
        const dbPayload = {
          id: guest.id,
          name: guest.name,
          rank: guest.rank,
          arrival: guest.arrival,
          departure: guest.departure,
          additional_guests: guest.additionalGuests,
          event_name: guest.eventName,
          room_id: guest.roomId,
          transport: guest.transport
        };
        const { error } = await supabase.from('guests').upsert(dbPayload);
        if (error) throw error;
      } else {
        const existing = guests.filter(g => g.id !== guest.id);
        saveGuests([...existing, guest]);
      }
      
      setEditingGuestId(null);
      setActiveView('dashboard');
    } catch (err) {
      alert('Cloud sync failed. Data saved locally.');
      const existing = guests.filter(g => g.id !== guest.id);
      saveGuests([...existing, guest]);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateGuest = async (updatedGuest: Guest) => {
    setIsSyncing(true);
    try {
      if (!forceLocal && supabase) {
        const { error } = await supabase
          .from('guests')
          .update({
            room_id: updatedGuest.roomId,
            transport: updatedGuest.transport
          })
          .eq('id', updatedGuest.id);
        if (error) throw error;
      } else {
        const newGuests = guests.map(g => g.id === updatedGuest.id ? updatedGuest : g);
        saveGuests(newGuests);
      }
    } catch (err) {
      console.error(err);
      const newGuests = guests.map(g => g.id === updatedGuest.id ? updatedGuest : g);
      saveGuests(newGuests);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this entry?')) return;
    
    setIsSyncing(true);
    try {
      if (!forceLocal && supabase) {
        const { error } = await supabase.from('guests').delete().eq('id', id);
        if (error) throw error;
      }
      const newGuests = guests.filter(g => g.id !== id);
      saveGuests(newGuests);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEditClick = (id: string) => {
    setEditingGuestId(id);
    setActiveView('input');
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4"></i>
          <p className="font-medium tracking-wide">Accessing Records...</p>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard guests={guests} onEdit={handleEditClick} onDelete={handleDeleteGuest} />;
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
        return <Dashboard guests={guests} onEdit={handleEditClick} onDelete={handleDeleteGuest} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        activeView={activeView} 
        onViewChange={(view) => {
          if (view !== 'input') setEditingGuestId(null);
          setActiveView(view);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-md md:hidden"
            >
              <i className="fa-solid fa-bars text-slate-600"></i>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800 capitalize">
                {activeView === 'dashboard' ? 'Overview' : activeView.replace(/([A-Z])/g, ' $1')}
              </h1>
              
              {!forceLocal ? (
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all ${isSyncing ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-green-200 bg-green-50 text-green-600 sync-pulse'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></span>
                  {isSyncing ? 'Syncing...' : 'Cloud Active'}
                </div>
              ) : (
                <div 
                  onClick={() => isSupabaseConfigured && setForceLocal(false)}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider cursor-help"
                  title="Environment variables not found. Using local storage."
                >
                  <i className="fa-solid fa-cloud-slash"></i>
                  Offline Mode
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-sm text-slate-500 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <button 
              onClick={fetchGuests}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Manual Refresh"
            >
              <i className={`fa-solid fa-arrows-rotate ${isSyncing ? 'fa-spin' : ''}`}></i>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </div>
      </main>

      {/* Cloud Configuration Modal (Only if not configured) */}
      {!isSupabaseConfigured && forceLocal && activeView === 'dashboard' && guests.length === 0 && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-white p-5 rounded-2xl shadow-2xl border border-blue-100 z-50 animate-bounce">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-cloud"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Enable Cloud Sync</p>
              <p className="text-xs text-slate-500 mt-1">To share data with other users, add your Supabase URL and Key to the project environment variables.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;