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
        supabase?.from('guests').delete().eq('id', guest.id).then();
      }
      
      return !isExpired;
    });
  };

  const fetchGuests = useCallback(async () => {
    // If Supabase is not configured, always fallback to Local Storage
    if (!isSupabaseConfigured || forceLocal || !supabase) {
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
      console.error('Cloud fetch failed, using local fallback:', err);
      // Don't permanently force local if it's just a network error, but use local for now
      const local = localStorage.getItem(STORAGE_KEY);
      const parsed = local ? JSON.parse(local) : [];
      setGuests(cleanupOldEntries(parsed));
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

  const saveGuestsLocally = (updatedGuests: Guest[]) => {
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
      }
      
      // Always update local cache for responsiveness
      const existing = guests.filter(g => g.id !== guest.id);
      saveGuestsLocally([...existing, guest]);
      
      setEditingGuestId(null);
      setActiveView('dashboard');
    } catch (err) {
      console.error('Cloud sync failed, data remains local:', err);
      const existing = guests.filter(g => g.id !== guest.id);
      saveGuestsLocally([...existing, guest]);
      setActiveView('dashboard');
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
      }
      const newGuests = guests.map(g => g.id === updatedGuest.id ? updatedGuest : g);
      saveGuestsLocally(newGuests);
    } catch (err) {
      console.error(err);
      const newGuests = guests.map(g => g.id === updatedGuest.id ? updatedGuest : g);
      saveGuestsLocally(newGuests);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!window.confirm('Delete this record?')) return;
    setIsSyncing(true);
    try {
      if (!forceLocal && supabase) {
        await supabase.from('guests').delete().eq('id', id);
      }
      const newGuests = guests.filter(g => g.id !== id);
      saveGuestsLocally(newGuests);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const renderView = () => {
    if (isLoading) return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4"></i>
        <p className="font-medium">Syncing Records...</p>
      </div>
    );

    switch (activeView) {
      case 'dashboard': return <Dashboard guests={guests} onEdit={(id) => { setEditingGuestId(id); setActiveView('input'); }} onDelete={handleDeleteGuest} />;
      case 'input': return <GuestInput onSubmit={handleUpsertGuest} editingGuest={guests.find(g => g.id === editingGuestId)} onCancel={() => { setEditingGuestId(null); setActiveView('dashboard'); }} />;
      case 'rooms': return <RoomAllocation guests={guests} onUpdate={handleUpdateGuest} />;
      case 'transport': return <TransportAllocation guests={guests} onUpdate={handleUpdateGuest} />;
      default: return <Dashboard guests={guests} onEdit={(id) => { setEditingGuestId(id); setActiveView('input'); }} onDelete={handleDeleteGuest} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <Sidebar activeView={activeView} onViewChange={(v) => { setActiveView(v); setIsSidebarOpen(false); }} isOpen={isSidebarOpen} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-md md:hidden"><i className="fa-solid fa-bars"></i></button>
            <h1 className="text-xl font-bold text-slate-800 capitalize">{activeView === 'dashboard' ? 'Overview' : activeView}</h1>
            <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${isSupabaseConfigured && !forceLocal ? 'border-green-200 bg-green-50 text-green-600 sync-pulse' : 'border-amber-200 bg-amber-50 text-amber-600'}`}>
              {isSupabaseConfigured && !forceLocal ? 'Cloud Active' : 'Local Only'}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm font-semibold text-slate-500">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
            <button onClick={fetchGuests} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><i className={`fa-solid fa-arrows-rotate ${isSyncing ? 'fa-spin' : ''}`}></i></button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{renderView()}</div>
        </div>
      </main>
    </div>
  );
};

export default App;