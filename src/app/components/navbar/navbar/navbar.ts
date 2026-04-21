import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/home" class="nav-brand">
          <span class="brand-icon">🚌</span>
          <span class="brand-text">BusGo</span>
        </a>
        <div class="nav-links">
          <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
          <a routerLink="/search" routerLinkActive="active">Search Buses</a>
          @if (isLoggedIn()) {
            <a routerLink="/dashboard" routerLinkActive="active">My Bookings</a>
            <div class="user-menu">
              <div class="user-avatar">{{ userInitial() }}</div>
              <div class="dropdown">
                <span class="user-name">{{ userName() }}</span>
                <button (click)="logout()" class="logout-btn">Sign Out</button>
              </div>
            </div>
          } @else {
            <a routerLink="/login" class="btn-outline">Login</a>
            <a routerLink="/signup" class="btn-primary">Sign Up</a>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: rgba(10, 10, 20, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(99, 102, 241, 0.2);
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 70px;
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }
    .brand-icon { font-size: 28px; }
    .brand-text {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 24px;
      background: linear-gradient(135deg, #6366f1, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .nav-links a {
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      font-family: 'DM Sans', sans-serif;
    }
    .nav-links a:hover, .nav-links a.active {
      color: #fff;
      background: rgba(99, 102, 241, 0.15);
    }
    .btn-outline {
      border: 1px solid rgba(99, 102, 241, 0.5) !important;
      color: #a78bfa !important;
    }
    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
      color: #fff !important;
      border: none !important;
    }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    .user-menu { position: relative; display: flex; align-items: center; gap: 10px; }
    .user-avatar {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #6366f1, #a78bfa);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; color: #fff; font-size: 14px;
      cursor: pointer;
    }
    .dropdown { display: flex; align-items: center; gap: 10px; }
    .user-name { color: rgba(255,255,255,0.85); font-size: 14px; font-weight: 500; }
    .logout-btn {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .logout-btn:hover { background: rgba(239, 68, 68, 0.25); }
  `]
})
export class NavbarComponent {
  constructor(private authService: AuthService) {}

  isLoggedIn = computed(() => !!this.authService.currentUser());
  userName = computed(() => {
    const u = this.authService.currentUser();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });
  userInitial = computed(() => {
    const u = this.authService.currentUser();
    return u ? u.firstName[0].toUpperCase() : '';
  });

  logout() { this.authService.logout(); }
}