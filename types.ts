
export type Rank = string;

export type TransportType = 'Swift' | 'Innova' | 'Ertiga' | 'Ciaz' | 'None';

export interface Guest {
  id: string;
  name: string;
  rank: Rank;
  arrival: string; // ISO String
  departure: string; // ISO String
  additionalGuests: number;
  eventName: string;
  roomId?: string; // ID of the room
  transport?: TransportType;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  type: string;
}

export type View = 'dashboard' | 'input' | 'rooms' | 'transport';
