import React from 'react';
import { Guest, TransportType } from '../types.ts';
import { VEHICLES } from '../constants.ts';

interface TransportAllocationProps {
  guests: Guest[];
  onUpdate: (guest: Guest) => void;
}

const TransportAllocation: React.FC<TransportAllocationProps> = ({ guests, onUpdate }) => {
  const handleAllocate = (guest: Guest, transport: TransportType) => {
    onUpdate({ ...guest, transport });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Fleet Management</h2>
        <p className="text-sm text-slate-500">Assign vehicles for airport transfers and local duties.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {guests.map((guest) => (
          <div key={guest.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 text-lg">{guest.name}</h3>
            <p className="text-xs text-slate-500 mb-4">{guest.rank}</p>
            
            <div className="grid grid-cols-2 gap-2">
              {VEHICLES.map((vehicle) => (
                <button
                  key={vehicle}
                  onClick={() => handleAllocate(guest, vehicle)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${guest.transport === vehicle ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                >
                  {vehicle}
                </button>
              ))}
              <button
                onClick={() => handleAllocate(guest, 'None' as TransportType)}
                className="col-span-2 mt-2 px-3 py-2 rounded-lg text-sm font-medium border border-dashed border-rose-200 text-rose-600"
              >
                No Transport
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransportAllocation;