
import React, { useState, useEffect } from 'react';
import { Guest, Rank } from '../types';

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

  // Sync with editingGuest if provided
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
    } else {
      setFormData({
        name: '',
        rank: '',
        arrival: '',
        departure: '',
        additionalGuests: 0,
        eventName: ''
      });
    }
  }, [editingGuest]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.arrival || !formData.departure || !formData.rank) {
      alert("Please fill in all required fields including name and rank.");
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
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {editingGuest ? 'Edit Guest Registration' : 'New Arrival Registration'}
          </h2>
          <p className="text-sm text-slate-500">
            {editingGuest ? `Modifying record for ${editingGuest.name}` : 'Enter guest details for scheduling and allocation.'}
          </p>
        </div>
        {editingGuest && (
          <button 
            onClick={onCancel}
            className="text-sm text-slate-500 hover:text-rose-600 font-medium px-3 py-1 border border-slate-200 rounded-lg hover:bg-rose-50"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name & Rank */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Guest Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Rank / Designation</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. Colonel, Director, VIP"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value as Rank })}
              />
            </div>
          </div>

          {/* Event & Additional Guests */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Event / Purpose</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. Conference, Site Visit"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Additional Guests Count</label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.additionalGuests}
                onChange={(e) => setFormData({ ...formData, additionalGuests: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Timing */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Arrival Date & Time (24h)</label>
            <input
              type="datetime-local"
              required
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.arrival}
              onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Departure Date & Time (24h)</label>
            <input
              type="datetime-local"
              required
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.departure}
              onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
          >
            <i className={`fa-solid ${editingGuest ? 'fa-save' : 'fa-plus'}`}></i>
            {editingGuest ? 'Save Changes' : 'Register Guest'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GuestInput;
