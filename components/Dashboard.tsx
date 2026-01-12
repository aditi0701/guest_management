
import React from 'react';
import { Guest } from '../types';
import { ROOMS } from '../constants';

interface DashboardProps {
  guests: Guest[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ guests, onEdit, onDelete }) => {
  const totalGuests = guests.reduce((acc, g) => acc + 1 + g.additionalGuests, 0);
  const allocatedRooms = guests.filter(g => g.roomId).length;
  const transportNeeded = guests.filter(g => g.transport && g.transport !== 'None').length;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const stats = [
    { label: 'Total Guests', value: totalGuests, icon: 'fa-users', color: 'bg-blue-500' },
    { label: 'Rooms Occupied', value: `${allocatedRooms}/${ROOMS.length}`, icon: 'fa-door-open', color: 'bg-emerald-500' },
    { label: 'Active Transport', value: transportNeeded, icon: 'fa-car', color: 'bg-amber-500' },
    { label: 'Events Today', value: new Set(guests.map(g => g.eventName)).size, icon: 'fa-calendar-check', color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white mr-4 shadow-lg`}>
              <i className={`fa-solid ${stat.icon} text-lg`}></i>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800">Master Guest Roster</h2>
          <div className="flex gap-2">
            <span className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-600 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              7-Day Retention Enabled
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Guest Information</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Arrival (24h)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Departure (24h)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Room / Transport</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {guests.map((guest) => {
                const room = ROOMS.find(r => r.id === guest.roomId);
                return (
                  <tr key={guest.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm mr-3">
                          {guest.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{guest.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 uppercase font-bold text-[9px]">{guest.rank}</span>
                            {guest.additionalGuests > 0 && <span>• +{guest.additionalGuests} Guests</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{formatDate(guest.arrival)}</div>
                      <div className="text-xs text-slate-400">{formatTime(guest.arrival)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{formatDate(guest.departure)}</div>
                      <div className="text-xs text-slate-400">{formatTime(guest.departure)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {room ? (
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-xs font-semibold text-emerald-700">{room.name}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 italic">No Room</span>
                        )}
                        {guest.transport && guest.transport !== 'None' ? (
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span className="text-xs font-semibold text-amber-700">{guest.transport}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 italic">No Vehicle</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(guest.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
                          title="Edit Entry"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => onDelete(guest.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"
                          title="Delete Entry"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {guests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <img src="https://picsum.photos/id/10/200/200" alt="empty" className="w-32 h-32 object-cover rounded-full opacity-20 mb-4 grayscale" />
                      <p className="text-slate-400 font-medium">No records found. Start by registering a guest.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
