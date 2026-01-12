
import React from 'react';
import { Guest, Room } from '../types';
import { ROOMS } from '../constants';

interface RoomAllocationProps {
  guests: Guest[];
  onUpdate: (guest: Guest) => void;
}

const RoomAllocation: React.FC<RoomAllocationProps> = ({ guests, onUpdate }) => {
  // Logic to check if room is available for a specific guest's timeframe
  const isRoomAvailable = (room: Room, guest: Guest) => {
    const arrival1 = new Date(guest.arrival).getTime();
    const departure1 = new Date(guest.departure).getTime();

    // Check all other guests who are assigned to this room
    return !guests.some(other => {
      if (other.id === guest.id || other.roomId !== room.id) return false;
      
      const arrival2 = new Date(other.arrival).getTime();
      const departure2 = new Date(other.departure).getTime();

      // Standard overlap check: (start1 < end2) && (end1 > start2)
      return (arrival1 < departure2) && (departure1 > arrival2);
    });
  };

  const handleAllocate = (guest: Guest, roomId: string) => {
    onUpdate({ ...guest, roomId: roomId === 'none' ? undefined : roomId });
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', { 
      day: '2-digit', month: 'short', 
      hour: '2-digit', minute: '2-digit', 
      hour12: false 
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Room Assignment Control</h2>
        <p className="text-sm text-slate-500">Conflicts are automatically prevented based on arrival and departure schedules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {guests.map((guest) => {
          const availableRooms = ROOMS.filter(r => isRoomAvailable(r, guest));
          const currentRoom = ROOMS.find(r => r.id === guest.roomId);

          return (
            <div key={guest.id} className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {guest.rank}
                  </span>
                  <h3 className="font-bold text-slate-800">{guest.name}</h3>
                </div>
                <div className="flex flex-col gap-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <i className="fa-regular fa-clock w-4"></i>
                    {formatDateTime(guest.arrival)} — {formatDateTime(guest.departure)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-users w-4"></i>
                    +{guest.additionalGuests} additional
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-auto">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Room</label>
                <select
                  className={`w-full sm:w-48 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${guest.roomId ? 'border-green-200 bg-green-50 text-green-700' : 'border-slate-200 bg-slate-50'}`}
                  value={guest.roomId || 'none'}
                  onChange={(e) => handleAllocate(guest, e.target.value)}
                >
                  <option value="none">Not Allocated</option>
                  {/* Current room must stay in dropdown if already allocated */}
                  {currentRoom && <option value={currentRoom.id}>{currentRoom.name} (Current)</option>}
                  {availableRooms
                    .filter(r => r.id !== guest.roomId)
                    .map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name} ({room.type})
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>
          );
        })}

        {guests.length === 0 && (
          <div className="lg:col-span-2 py-20 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <i className="fa-solid fa-bed text-5xl mb-4"></i>
            <p className="text-lg font-medium">No guests registered yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomAllocation;
