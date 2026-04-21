export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface Schedule {
  id: number;
  fromCity: string;
  toCity: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  boardingPoint: string;
  droppingPoint: string;
  duration: string;
  bus: Bus;
}

export interface Bus {
  id: number;
  busNumber: string;
  busName: string;
  busType: string;
  totalSeats: number;
  amenities: string;
}

export interface Booking {
  id: number;
  bookingReference: string;
  scheduleId: number;
  numberOfSeats: number;
  seatNumbers: string[];
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING' | 'COMPLETED';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED';
  bookedAt: string;
  fromCity: string;
  toCity: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  busName: string;
  busNumber: string;
  busType: string;
  passengerName: string;
  passengerEmail: string;
}

export interface SearchParams {
  fromCity: string;
  toCity: string;
  travelDate: string;
  seats: number;
}