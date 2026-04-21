import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="home">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-bg">
          <div class="orb orb1"></div>
          <div class="orb orb2"></div>
          <div class="orb orb3"></div>
          <div class="grid-lines"></div>
        </div>
        <div class="hero-content">
          <div class="hero-badge">✨ India's smartest bus booking platform</div>
          <h1 class="hero-title">
            Travel Anywhere,<br>
            <span class="gradient-text">Anytime, Effortlessly</span>
          </h1>
          <p class="hero-subtitle">Book bus tickets across 500+ routes in India. Safe, comfortable, and affordable journeys await you.</p>

          <!-- Search Box -->
          <div class="search-box">
            <div class="search-grid">
              <div class="search-field">
                <label>FROM</label>
                <div class="field-wrapper">
                  <span class="field-icon">📍</span>
                  <input type="text" [(ngModel)]="fromCity" placeholder="Delhi" list="cities-from" />
                  <datalist id="cities-from">
                    @for (city of cities; track $index) {<option [value]="city">{{ city }}</option> }
                  </datalist>
                </div>
              </div>
              <button class="swap-btn" (click)="swapCities()" title="Swap cities">⇄</button>
              <div class="search-field">
                <label>TO</label>
                <div class="field-wrapper">
                  <span class="field-icon">📍</span>
                  <input type="text" [(ngModel)]="toCity" placeholder="Mumbai" list="cities-to" />
                  <datalist id="cities-to">
                    @for (city of cities; track $index) { <option [value]="city"></option> }
                  </datalist>
                </div>
              </div>
              <div class="search-field">
                <label>DATE</label>
                <div class="field-wrapper">
                  <span class="field-icon">📅</span>
                  <input type="date" [(ngModel)]="travelDate" [min]="today" />
                </div>
              </div>
              <div class="search-field">
                <label>SEATS</label>
                <div class="field-wrapper">
                  <span class="field-icon">👥</span>
                  <select [(ngModel)]="seats">
                    @for (n of [1,2,3,4,5,6]; track n) {
                      <option [value]="n">{{ n }} {{ n === 1 ? 'Seat' : 'Seats' }}</option>
                    }
                  </select>
                </div>
              </div>
            </div>
            <button class="search-btn" (click)="searchBuses()">
              🔍 Search Buses
            </button>
          </div>
        </div>
      </section>

      <!-- Popular Routes -->
      <section class="routes-section">
        <div class="section-container">
          <h2>Popular Routes</h2>
          <div class="routes-grid">
            @for (route of popularRoutes; track route.from) {
              <div class="route-card" (click)="quickSearch(route)">
                <div class="route-from">{{ route.from }}</div>
                <div class="route-arrow">→</div>
                <div class="route-to">{{ route.to }}</div>
                <div class="route-meta">
                  <span>From ₹{{ route.price }}</span>
                  <span>{{ route.duration }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="features-section">
        <div class="section-container">
          <h2>Why Choose BusGo?</h2>
          <div class="features-grid">
            @for (f of features; track f.title) {
              <div class="feature-card">
                <div class="feature-icon">{{ f.icon }}</div>
                <h3>{{ f.title }}</h3>
                <p>{{ f.desc }}</p>
              </div>
            }
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .home { background: #080812; min-height: 100vh; font-family: 'DM Sans', sans-serif; color: #fff; }

    /* Hero */
    .hero {
      min-height: calc(100vh - 70px);
      display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden; padding: 60px 24px;
    }
    .hero-bg { position: absolute; inset: 0; pointer-events: none; }
    .orb { position: absolute; border-radius: 50%; filter: blur(100px); }
    .orb1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(99,102,241,0.2), transparent); top: -200px; left: -200px; }
    .orb2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(167,139,250,0.15), transparent); bottom: -100px; right: -100px; }
    .orb3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(59,130,246,0.1), transparent); top: 40%; left: 50%; }
    .grid-lines {
      position: absolute; inset: 0;
      background-image: linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px);
      background-size: 60px 60px;
    }
    .hero-content { position: relative; z-index: 1; text-align: center; max-width: 900px; width: 100%; }
    .hero-badge {
      display: inline-block;
      background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.3);
      color: #a78bfa; padding: 8px 20px; border-radius: 100px;
      font-size: 13px; font-weight: 500; margin-bottom: 28px;
      animation: fadeDown 0.6s ease;
    }
    @keyframes fadeDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .hero-title {
      font-family: 'Syne', sans-serif; font-size: clamp(40px, 6vw, 72px);
      font-weight: 800; line-height: 1.1; margin-bottom: 24px;
      animation: fadeUp 0.6s ease 0.1s both;
    }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .gradient-text {
      background: linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #818cf8 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      color: rgba(255,255,255,0.55); font-size: 18px; max-width: 550px;
      margin: 0 auto 48px; line-height: 1.6;
      animation: fadeUp 0.6s ease 0.2s both;
    }

    /* Search Box */
    .search-box {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px; padding: 32px;
      animation: fadeUp 0.6s ease 0.3s both;
    }
    .search-grid {
      display: grid;
      grid-template-columns: 1fr 40px 1fr 1fr 1fr;
      gap: 16px; align-items: end; margin-bottom: 24px;
    }
    .search-field { display: flex; flex-direction: column; gap: 8px; }
    .search-field label {
      color: rgba(255,255,255,0.4); font-size: 11px;
      font-weight: 600; letter-spacing: 1.5px;
    }
    .field-wrapper { position: relative; display: flex; align-items: center; }
    .field-icon { position: absolute; left: 12px; font-size: 16px; pointer-events: none; }
    .field-wrapper input, .field-wrapper select {
      width: 100%; padding: 14px 14px 14px 40px;
      background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px; color: #fff; font-size: 15px; font-weight: 500;
      transition: all 0.2s; font-family: 'DM Sans', sans-serif;
    }
    .field-wrapper select { appearance: none; cursor: pointer; }
    .field-wrapper input::placeholder { color: rgba(255,255,255,0.3); }
    .field-wrapper input:focus, .field-wrapper select:focus {
      outline: none; border-color: rgba(99,102,241,0.6); background: rgba(99,102,241,0.1);
    }
    .swap-btn {
      background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3);
      color: #a78bfa; border-radius: 10px; width: 40px; height: 46px;
      font-size: 18px; cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
    }
    .swap-btn:hover { background: rgba(99,102,241,0.3); transform: rotate(180deg); }
    .search-btn {
      width: 100%; padding: 18px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff; border: none; border-radius: 14px;
      font-size: 17px; font-weight: 600; cursor: pointer;
      transition: all 0.2s; font-family: 'DM Sans', sans-serif;
      letter-spacing: 0.3px;
    }
    .search-btn:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 12px 30px rgba(99,102,241,0.4); }

    /* Sections */
    .routes-section, .features-section {
      padding: 80px 24px;
    }
    .features-section { background: rgba(255,255,255,0.02); }
    .section-container { max-width: 1100px; margin: 0 auto; }
    h2 {
      font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800;
      text-align: center; margin-bottom: 48px;
    }

    /* Routes */
    .routes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .route-card {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; padding: 20px; cursor: pointer;
      transition: all 0.2s; text-align: center;
    }
    .route-card:hover {
      border-color: rgba(99,102,241,0.4); background: rgba(99,102,241,0.08);
      transform: translateY(-3px);
    }
    .route-from { font-size: 16px; font-weight: 600; color: #fff; }
    .route-arrow { color: #6366f1; font-size: 20px; margin: 8px 0; }
    .route-to { font-size: 16px; font-weight: 600; color: #fff; }
    .route-meta { display: flex; justify-content: space-between; margin-top: 12px; }
    .route-meta span { font-size: 13px; color: rgba(255,255,255,0.45); }

    /* Features */
    .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }
    .feature-card {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
      border-radius: 20px; padding: 28px; transition: all 0.2s;
    }
    .feature-card:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-3px); }
    .feature-icon { font-size: 36px; margin-bottom: 14px; }
    .feature-card h3 { font-size: 17px; font-weight: 600; margin-bottom: 8px; }
    .feature-card p { color: rgba(255,255,255,0.45); font-size: 14px; line-height: 1.6; }
  `]
})
export class HomeComponent {
  fromCity = '';
  toCity = '';
  travelDate = '';
  seats = 1;
  today = new Date().toISOString().split('T')[0];

  cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Agra', 'Jaipur', 'Goa', 'Kolkata'];

  popularRoutes = [
    { from: 'Delhi', to: 'Agra', price: 450, duration: '4h' },
    { from: 'Mumbai', to: 'Pune', price: 500, duration: '3h' },
    { from: 'Delhi', to: 'Jaipur', price: 500, duration: '5h' },
    { from: 'Bangalore', to: 'Chennai', price: 650, duration: '6h' },
    { from: 'Delhi', to: 'Mumbai', price: 1200, duration: '12h' },
    { from: 'Mumbai', to: 'Goa', price: 1100, duration: '10h' },
  ];

  features = [
    { icon: '🎟️', title: 'Easy Booking', desc: 'Book tickets in under 2 minutes with our streamlined checkout process.' },
    { icon: '💰', title: 'Best Prices', desc: 'Guaranteed lowest fares with no hidden charges on 500+ routes.' },
    { icon: '🔒', title: 'Secure Payments', desc: 'Industry-standard encryption keeps your payment data safe.' },
    { icon: '📱', title: 'Instant Tickets', desc: 'Get your e-ticket immediately after booking. No printout needed.' },
    { icon: '🚌', title: 'Premium Buses', desc: 'Travel in AC Sleepers, Volvos, and Luxury buses with top amenities.' },
    { icon: '⚡', title: 'Live Tracking', desc: 'Track your bus in real-time and never miss your departure.' },
  ];

  constructor(private router: Router) {
    this.travelDate = this.today;
  }

  swapCities() {
    [this.fromCity, this.toCity] = [this.toCity, this.fromCity];
  }

  searchBuses() {
    if (!this.fromCity || !this.toCity || !this.travelDate) return;
    this.router.navigate(['/search'], { queryParams: {
      fromCity: this.fromCity, toCity: this.toCity,
      travelDate: this.travelDate, seats: this.seats
    }});
  }

  quickSearch(route: any) {
    this.fromCity = route.from;
    this.toCity = route.to;
    this.travelDate = this.today;
    this.searchBuses();
  }
}