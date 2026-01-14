import React, { useState, useEffect } from 'react';
import { Guest, Rank } from '../types.ts';

interface GuestInputProps {
  onSubmit: (guest: Guest) => void;
  editingGuest?: Guest;
  onCancel?: () => void;
}

const GuestInput: React.FC<GuestInputProps> = ({ onSubmit, editingGuest, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    rank: '' as Rank,
    arrival: '',
    departure: '',
    additionalGuests: 0,
    eventName: ''
  });

  // Get current local time in YYYY-MM-DDTHH:mm format for the 'min' attribute
  const getNowString = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  const minDateTime = getNowString();

  useEffect(() => {
    if (editingGuest) {
      setFormData({
        name: editingGuest.name,
        rank: editingGuest.rank,
        arrival: editingGuest.arrival,
        departure: editingGuest.departure,
        additionalGuests: editingGuest.additionalGuests,
        eventName: editingGuest.eventName
      });
    }
  }, [editingGuest]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.arrival || !formData.departure || !formData.rank) {
      alert("Please fill in Name, Rank, Arrival, and Departure.");
      return;
    }

    const arrivalDate = new Date(formData.arrival);
    const departureDate = new Date(formData.departure);
    const now = new Date();

    // Rule: Guest entry can be made only after current day and time
    if (arrivalDate < now) {
      alert("Arrival time must be in the future (after current day and time).");
      return;
    }

    // Logical Check: Departure must be after Arrival
    if (departureDate <= arrivalDate) {
      alert("Departure time must be strictly after the arrival time.");
      return;
    }

    onSubmit({
      ...formData,
      id: editingGuest ? editingGuest.id : Math.random().toString(36).substr(2, 9),
      roomId: editingGuest?.roomId,
      transport: editingGuest?.transport,
      createdAt: editingGuest ? editingGuest.createdAt : new Date().toISOString()
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-4xl mx-auto">
      <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{editingGuest ? 'Edit Guest' : 'New Registration'}</h2>
          <p className="text-sm text-slate-500">Note: Arrival must be scheduled for a future time.</p>
        </div>
        {onCancel && <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-2"><i className="fa-solid fa-xmark text-2xl"></i></button>}
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Identity */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">1. Guest Identity</h3>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Full Name *</label>
              <input type="text" required className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Rank / Designation *</label>
              <input type="text" required className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Major General" value={formData.rank} onChange={(e) => setFormData({ ...formData, rank: e.target.value })} />
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">2. Event Details</h3>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Name of Event</label>
              <input type="text" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Annual Summit" value={formData.eventName} onChange={(e) => setFormData({ ...formData, eventName: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Additional Guests (Number)</label>
              <input type="number" min="0" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.additionalGuests} onChange={(e) => setFormData({ ...formData, additionalGuests: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          {/* Timing */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">3. Arrival & Departure (24h)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Arrival Date & Time *</label>
                <input 
                  type="datetime-local" 
                  required 
                  min={minDateTime}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.arrival} 
                  onChange={(e) => setFormData({ ...formData, arrival: e.target.value })} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Departure Date & Time *</label>
                <input 
                  type="datetime-local" 
                  required 
                  min={formData.arrival || minDateTime}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.departure} 
                  onChange={(e) => setFormData({ ...formData, departure: e.target.value })} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t flex gap-4">
          <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg transition-all active:scale-95">
            {editingGuest ? 'Update Record' : 'Save Registration'}
          </button>
          {onCancel && <button type="button" onClick={onCancel} className="px-8 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl">Cancel</button>}
        </div>
      </form>
    </div>
  );
};

export default GuestInput;