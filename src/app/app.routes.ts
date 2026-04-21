import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/auth/signup/signup').then(m => m.SignupComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./components/search/search/search').then(m => m.SearchComponent)
  },
  {
    path: 'booking/:scheduleId',
    loadComponent: () => import('./components/booking/booking/booking').then(m => m.BookingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/home' }
];