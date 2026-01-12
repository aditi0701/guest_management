
import React from 'react';
import { Guest, TransportType } from '../types';
import { VEHICLES } from '../constants';

interface TransportAllocationProps {
  guests: Guest[];
  onUpdate: (guest: Guest) => void;
}

const TransportAllocation: React.FC<TransportAllocationProps> = ({ guests, onUpdate }) => {
  const handleAllocate = (guest: Guest, transport: TransportType) => {
    onUpdate({ ...guest, transport });
  };

  const getVehicleIcon = (type?: TransportType) => {
    switch (type) {
      case 'Innova': return 'fa-bus';
      case 'Ertiga': return 'fa-shuttle-van';
      case 'Swift': return 'fa-car-side';
      case 'Ciaz': return 'fa-car';
      default: return 'fa-ban';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Fleet Management</h2>
        <p className="text-sm text-slate-500">Assign vehicles for airport transfers and local duties.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {guests.map((guest) => (
          <div key={guest.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{guest.rank}</p>
                <h3 className="font-bold text-slate-800 text-lg">{guest.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{guest.eventName || 'No Event'}</p>
              </div>
              <div className={`p-3 rounded-xl ${guest.transport ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                <i className={`fa-solid ${getVehicleIcon(guest.transport)} text-xl`}></i>
              </div>
            </div>
            
            <div className="p-5">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Vehicle Assignment</label>
              <div className="grid grid-cols-2 gap-2">
                {VEHICLES.map((vehicle) => (
                  <button
                    key={vehicle}
                    onClick={() => handleAllocate(guest, vehicle)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${guest.transport === vehicle 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}
                    `}
                  >
                    {vehicle}
                  </button>
                ))}
                <button
                  onClick={() => handleAllocate(guest, 'None' as TransportType)}
                  className={`
                    col-span-2 mt-2 px-3 py-2 rounded-lg text-sm font-medium border border-dashed
                    ${guest.transport === 'None' || !guest.transport
                      ? 'bg-slate-100 text-slate-400 border-slate-300' 
                      : 'text-rose-600 border-rose-200 hover:bg-rose-50'}
                  `}
                >
                  No Transport Needed
                </button>
              </div>
            </div>
          </div>
        ))}

        {guests.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 py-20 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <i className="fa-solid fa-car text-5xl mb-4"></i>
            <p className="text-lg font-medium">No active guests to allocate transport</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportAllocation;
