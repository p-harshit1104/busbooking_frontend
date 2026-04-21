import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="bg-orb orb1"></div>
        <div class="bg-orb orb2"></div>
      </div>
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">🚌</div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue your journey</p>
        </div>
        @if (error()) {
          <div class="alert-error">{{ error() }}</div>
        }
        <form (ngSubmit)="onLogin()" class="auth-form">
          <div class="form-group">
            <label>Email Address</label>
            <div class="input-wrapper">
              <span class="input-icon">✉</span>
              <input type="email" [(ngModel)]="email" name="email"
                     placeholder="you@example.com" required />
            </div>
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input [type]="showPassword() ? 'text' : 'password'"
                     [(ngModel)]="password" name="password"
                     placeholder="Enter your password" required />
              <button type="button" class="toggle-pw" (click)="showPassword.set(!showPassword())">
                {{ showPassword() ? '🙈' : '👁' }}
              </button>
            </div>
          </div>
          <button type="submit" class="btn-submit" [disabled]="loading()">
            @if (loading()) { <span class="spinner"></span> Signing in... }
            @else { Sign In }
          </button>
        </form>
        <div class="demo-creds">
          <p>Demo: <strong>john@example.com</strong> / <strong>password123</strong></p>
        </div>
        <p class="auth-footer">
          Don't have an account? <a routerLink="/signup">Create one</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; }
    .auth-page {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: #080812;
      position: relative; overflow: hidden;
      font-family: 'DM Sans', sans-serif;
    }
    .auth-bg { position: absolute; inset: 0; pointer-events: none; }
    .bg-orb {
      position: absolute; border-radius: 50%;
      filter: blur(80px); opacity: 0.15;
    }
    .orb1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, #6366f1, transparent);
      top: -100px; left: -100px;
    }
    .orb2 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, #a78bfa, transparent);
      bottom: -100px; right: -100px;
    }
    .auth-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      padding: 48px 40px;
      width: 100%; max-width: 440px;
      position: relative; z-index: 1;
      backdrop-filter: blur(20px);
      animation: fadeUp 0.5s ease;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-logo { font-size: 48px; margin-bottom: 12px; }
    h1 {
      color: #fff; font-family: 'Syne', sans-serif;
      font-size: 28px; font-weight: 800; margin: 0 0 8px;
    }
    p { color: rgba(255,255,255,0.5); margin: 0; font-size: 14px; }
    .alert-error {
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
      color: #f87171; padding: 12px 16px; border-radius: 12px;
      font-size: 14px; margin-bottom: 20px; text-align: center;
    }
    .auth-form { display: flex; flex-direction: column; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    label { color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 500; }
    .input-wrapper {
      position: relative; display: flex; align-items: center;
    }
    .input-icon {
      position: absolute; left: 14px; font-size: 16px;
      pointer-events: none; z-index: 1;
    }
    input {
      width: 100%; padding: 14px 44px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; color: #fff; font-size: 14px;
      transition: border-color 0.2s;
      font-family: 'DM Sans', sans-serif;
    }
    input::placeholder { color: rgba(255,255,255,0.25); }
    input:focus {
      outline: none;
      border-color: rgba(99,102,241,0.6);
      background: rgba(99,102,241,0.08);
    }
    .toggle-pw {
      position: absolute; right: 12px;
      background: none; border: none; cursor: pointer;
      font-size: 16px; padding: 4px;
    }
    .btn-submit {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff; border: none;
      padding: 16px; border-radius: 12px;
      font-size: 16px; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      font-family: 'DM Sans', sans-serif;
      margin-top: 4px;
    }
    .btn-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(99,102,241,0.3); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .demo-creds {
      background: rgba(99,102,241,0.08);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 10px; padding: 12px 16px;
      text-align: center; margin-top: 16px;
    }
    .demo-creds p { color: rgba(255,255,255,0.5); font-size: 13px; }
    .demo-creds strong { color: #a78bfa; }
    .auth-footer {
      text-align: center; color: rgba(255,255,255,0.4);
      font-size: 14px; margin-top: 20px;
    }
    .auth-footer a { color: #a78bfa; text-decoration: none; font-weight: 500; }
  `]
})
export class LoginComponent {
  email = ''; password = '';
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.loading.set(true);
    this.error.set('');
    this.authService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: any) => {
        this.error.set(err.error?.message || 'Invalid email or password');
        this.loading.set(false);
      }
    });
  }
}