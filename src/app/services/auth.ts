import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse, User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8089/api/auth';
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify({
          id: res.id, firstName: res.firstName, lastName: res.lastName,
          email: res.email, role: res.role
        }));
        this.currentUser.set({
          id: res.id, firstName: res.firstName, lastName: res.lastName,
          email: res.email, role: res.role
        });
      })
    );
  }

  signup(data: { firstName: string; lastName: string; email: string; password: string; phone: string }) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/signup`, data);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private loadUserFromStorage() {
  if (typeof window !== 'undefined' && localStorage) {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser.set(JSON.parse(user));
    }
  }
}
}