import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Booking, Schedule, SearchParams } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BusService {
  private apiUrl = 'http://localhost:8089/api';

  constructor(private http: HttpClient) {}

  searchSchedules(params: SearchParams) {
    const httpParams = new HttpParams()
      .set('fromCity', params.fromCity)
      .set('toCity', params.toCity)
      .set('travelDate', params.travelDate)
      .set('seats', params.seats.toString());
    return this.http.get<Schedule[]>(`${this.apiUrl}/schedules/search`, { params: httpParams });
  }

  getSchedule(id: number) {
    return this.http.get<Schedule>(`${this.apiUrl}/schedules/${id}`);
  }

  createBooking(scheduleId: number, numberOfSeats: number) {
    return this.http.post<Booking>(`${this.apiUrl}/bookings`, { scheduleId, numberOfSeats });
  }

  getMyBookings() {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings/my-bookings`);
  }

  cancelBooking(bookingId: number) {
    return this.http.put<Booking>(`${this.apiUrl}/bookings/${bookingId}/cancel`, {});
  }

  getBookingByRef(ref: string) {
    return this.http.get<Booking>(`${this.apiUrl}/bookings/ref/${ref}`);
  }
}