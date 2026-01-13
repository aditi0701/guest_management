import { Room, TransportType } from './types.ts';

export const VEHICLES: TransportType[] = ['Swift', 'Innova', 'Ertiga', 'Ciaz'];

export const ROOMS: Room[] = [
  { id: '101', name: 'Suite 101', type: 'Luxury' },
  { id: '102', name: 'Suite 102', type: 'Luxury' },
  { id: '103', name: 'Suite 103', type: 'Luxury' },
  { id: '201', name: 'Room 201', type: 'Standard' },
  { id: '202', name: 'Room 202', type: 'Standard' },
  { id: '203', name: 'Room 203', type: 'Standard' },
  { id: '204', name: 'Room 204', type: 'Standard' },
  { id: '205', name: 'Room 205', type: 'Standard' },
  { id: '301', name: 'VIP Cottage A', type: 'Cottage' },
  { id: '302', name: 'VIP Cottage B', type: 'Cottage' },
];