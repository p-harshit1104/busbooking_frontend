import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-signup',
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
          <h1>Create Account</h1>
          <p>Start booking your bus journeys today</p>
        </div>
        @if (error()) {
          <div class="alert-error">{{ error() }}</div>
        }
        @if (success()) {
          <div class="alert-success">Account created! Redirecting to login...</div>
        }
        <form (ngSubmit)="onSignup()" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label>First Name</label>
              <input type="text" [(ngModel)]="form.firstName" name="firstName" placeholder="John" required />
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input type="text" [(ngModel)]="form.lastName" name="lastName" placeholder="Doe" required />
            </div>
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <div class="input-wrapper">
              <span class="input-icon">✉</span>
              <input type="email" [(ngModel)]="form.email" name="email" placeholder="you@example.com" required />
            </div>
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <div class="input-wrapper">
              <span class="input-icon">📱</span>
              <input type="tel" [(ngModel)]="form.phone" name="phone" placeholder="+91 98765 43210" />
            </div>
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input [type]="showPw() ? 'text' : 'password'" [(ngModel)]="form.password" name="password"
                     placeholder="Min 6 characters" required minlength="6" />
              <button type="button" class="toggle-pw" (click)="showPw.set(!showPw())">
                {{ showPw() ? '🙈' : '👁' }}
              </button>
            </div>
          </div>
          <button type="submit" class="btn-submit" [disabled]="loading()">
            @if (loading()) { <span class="spinner"></span> Creating account... }
            @else { Create Account }
          </button>
        </form>
        <p class="auth-footer">
          Already have an account? <a routerLink="/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; }
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #080812; position: relative; overflow: hidden;
      font-family: 'DM Sans', sans-serif; padding: 40px 16px;
    }
    .auth-bg { position: absolute; inset: 0; pointer-events: none; }
    .bg-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.15; }
    .orb1 { width: 500px; height: 500px; background: radial-gradient(circle, #6366f1, transparent); top: -100px; left: -100px; }
    .orb2 { width: 400px; height: 400px; background: radial-gradient(circle, #a78bfa, transparent); bottom: -100px; right: -100px; }
    .auth-card {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px; padding: 48px 40px; width: 100%; max-width: 480px;
      position: relative; z-index: 1; backdrop-filter: blur(20px);
      animation: fadeUp 0.5s ease;
    }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-logo { font-size: 48px; margin-bottom: 12px; }
    h1 { color: #fff; font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; margin: 0 0 8px; }
    p { color: rgba(255,255,255,0.5); margin: 0; font-size: 14px; }
    .alert-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #f87171; padding: 12px 16px; border-radius: 12px; font-size: 14px; margin-bottom: 20px; text-align: center; }
    .alert-success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; padding: 12px 16px; border-radius: 12px; font-size: 14px; margin-bottom: 20px; text-align: center; }
    .auth-form { display: flex; flex-direction: column; gap: 18px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    label { color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 500; }
    .input-wrapper { position: relative; display: flex; align-items: center; }
    .input-icon { position: absolute; left: 14px; font-size: 16px; pointer-events: none; }
    input {
      width: 100%; padding: 13px 44px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; color: #fff; font-size: 14px; transition: border-color 0.2s;
      font-family: 'DM Sans', sans-serif;
    }
    .form-row input { padding: 13px 14px; }
    input::placeholder { color: rgba(255,255,255,0.25); }
    input:focus { outline: none; border-color: rgba(99,102,241,0.6); background: rgba(99,102,241,0.08); }
    .toggle-pw { position: absolute; right: 12px; background: none; border: none; cursor: pointer; font-size: 16px; }
    .btn-submit {
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none;
      padding: 16px; border-radius: 12px; font-size: 16px; font-weight: 600;
      cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
      font-family: 'DM Sans', sans-serif; margin-top: 4px;
    }
    .btn-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(99,102,241,0.3); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-footer { text-align: center; color: rgba(255,255,255,0.4); font-size: 14px; margin-top: 20px; }
    .auth-footer a { color: #a78bfa; text-decoration: none; font-weight: 500; }
  `]
})
export class SignupComponent {
  form = { firstName: '', lastName: '', email: '', password: '', phone: '' };
  loading = signal(false);
  error = signal('');
  success = signal(false);
  showPw = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  onSignup() {
    this.loading.set(true);
    this.error.set('');
    this.authService.signup(this.form).subscribe({
      next: () => {
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: any) => {
        this.error.set(err.error?.message || 'Registration failed. Please try again.');
        this.loading.set(false);
      }
    });
  }
}