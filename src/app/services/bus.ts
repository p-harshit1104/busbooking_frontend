import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Booking, Schedule, SearchParams } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BusService {
  private apiUrl = 'http://localhost:8089/api';

  constructor(private http: HttpClient) {}

  // 🔥 Common headers
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  searchSchedules(params: SearchParams) {
    const httpParams = new HttpParams()
      .set('fromCity', params.fromCity)
      .set('toCity', params.toCity)
      .set('travelDate', params.travelDate)
      .set('seats', params.seats.toString());

    return this.http.get<Schedule[]>(
      `${this.apiUrl}/schedules/search`,
      { params: httpParams, ...this.getHeaders() }
    );
  }

  getSchedule(id: number) {
    return this.http.get<Schedule>(
      `${this.apiUrl}/schedules/${id}`,
      this.getHeaders()
    );
  }

  createBooking(scheduleId: number, numberOfSeats: number) {
    return this.http.post<Booking>(
      `${this.apiUrl}/bookings`,
      { scheduleId, numberOfSeats },
      this.getHeaders()
    );
  }

  getMyBookings() {
    return this.http.get<Booking[]>(
      `${this.apiUrl}/bookings/my-bookings`,
      this.getHeaders()
    );
  }

  cancelBooking(bookingId: number) {
    return this.http.put<Booking>(
      `${this.apiUrl}/bookings/${bookingId}/cancel`,
      {},
      this.getHeaders()
    );
  }

  getBookingByRef(ref: string) {
    return this.http.get<Booking>(
      `${this.apiUrl}/bookings/ref/${ref}`,
      this.getHeaders()
    );
  }
}