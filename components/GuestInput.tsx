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
      alert("Please fill in all required fields (Name, Rank, Arrival, and Departure).");
      return;
    }

    const resultGuest: Guest = {
      ...formData,
      id: editingGuest ? editingGuest.id : Math.random().toString(36).substr(2, 9),
      roomId: editingGuest?.roomId,
      transport: editingGuest?.transport,
      createdAt: editingGuest ? editingGuest.createdAt : new Date().toISOString()
    };
    onSubmit(resultGuest);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {editingGuest ? 'Edit Guest Details' : 'Register New Guest'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">Fill in the information below to add a guest to the system.</p>
        </div>
        {onCancel && (
          <button 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-2"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Personal Details Section */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <i className="fa-solid fa-user-tag text-blue-500"></i>
            Personal & Rank
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Guest Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Rank / Designation <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="e.g. Major General / CEO"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* Event & Logistics Section */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <i className="fa-solid fa-calendar-star text-amber-500"></i>
            Event Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Name of Event</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="e.g. Annual Summit 2024"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Additional Guests (Count)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  value={formData.additionalGuests}
                  onChange={(e) => setFormData({ ...formData, additionalGuests: parseInt(e.target.value) || 0 })}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Persons</div>
              </div>
            </div>
          </div>
        </section>

        {/* Schedule Section */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <i className="fa-solid fa-clock text-emerald-500"></i>
            Timing (24h Format)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Arrival Date & Time <span className="text-rose-500">*</span></label>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={formData.arrival}
                onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Departure Date & Time <span className="text-rose-500">*</span></label>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={formData.departure}
                onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
              />
            </div>
          </div>
        </section>

        <div className="pt-4 border-t border-slate-100 flex gap-4">
          <button
            type="submit"
            className="flex-1 md:flex-none px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-check"></i>
            {editingGuest ? 'Update Record' : 'Save Registration'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 md:flex-none px-10 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default GuestInput;