import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BusService } from '../../../services/bus';
import { Schedule } from '../../../models/models';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="booking-page">
      <div class="booking-container">
        @if (loading()) {
          <div class="loading"><div class="spinner"></div><p>Loading...</p></div>
        } @else if (schedule()) {

          @if (!confirmed()) {
            <!-- Booking Form -->
            <div class="booking-layout">
              <div class="booking-main">
                <div class="back-link" (click)="goBack()">← Back to results</div>
                <h1>Complete Your Booking</h1>

                <!-- Bus Info -->
                <div class="bus-summary">
                  <div class="bs-header">
                    <div>
                      <h2>{{ schedule()!.bus.busName }}</h2>
                      <span class="type-badge">{{ formatType(schedule()!.bus.busType) }}</span>
                    </div>
                    <div class="bs-price">₹{{ schedule()!.price }}<span>/seat</span></div>
                  </div>
                  <div class="bs-route">
                    <div class="route-point">
                      <div class="time">{{ schedule()!.departureTime }}</div>
                      <div class="city">{{ schedule()!.fromCity }}</div>
                      <div class="sub">{{ schedule()!.boardingPoint }}</div>
                    </div>
                    <div class="route-mid">
                      <div class="line"></div>
                      <span>🚌</span>
                      <div class="line"></div>
                    </div>
                    <div class="route-point right">
                      <div class="time">{{ schedule()!.arrivalTime }}</div>
                      <div class="city">{{ schedule()!.toCity }}</div>
                      <div class="sub">{{ schedule()!.droppingPoint }}</div>
                    </div>
                  </div>
                  <div class="bs-meta">
                    <span>📅 {{ schedule()!.travelDate }}</span>
                    <span>💺 {{ schedule()!.availableSeats }} seats available</span>
                  </div>
                </div>

                <!-- Seat Selection -->
                <div class="section-card">
                  <h3>Select Seats</h3>
                  <div class="seat-controls">
                    <button (click)="adjustSeats(-1)" [disabled]="seats <= 1">−</button>
                    <span>{{ seats }}</span>
                    <button (click)="adjustSeats(1)" [disabled]="seats >= schedule()!.availableSeats">+</button>
                  </div>
                  <div class="seat-grid">
                    @for (seat of seatOptions; track seat) {
                      <div class="seat" [class.selected]="selectedSeats.includes(seat)"
                           [class.available]="!selectedSeats.includes(seat)"
                           (click)="toggleSeat(seat)">
                        {{ seat }}
                      </div>
                    }
                  </div>
                  <p class="seat-hint">Select {{ seats }} seat(s). Selected: {{ selectedSeats.join(', ') || 'None' }}</p>
                </div>

                <!-- Amenities -->
                <div class="section-card">
                  <h3>Amenities</h3>
                  <div class="amenities-list">
                    @for (a of getAmenities(schedule()!.bus.amenities); track a) {
                      <span class="amenity">✓ {{ a }}</span>
                    }
                  </div>
                </div>
              </div>

              <!-- Price Summary -->
              <aside class="price-summary">
                <h3>Price Summary</h3>
                <div class="price-row">
                  <span>{{ seats }} × ₹{{ schedule()!.price }}</span>
                  <span>₹{{ totalAmount() }}</span>
                </div>
                <div class="price-row">
                  <span>Service Fee</span>
                  <span>₹0</span>
                </div>
                <div class="price-divider"></div>
                <div class="price-total">
                  <span>Total</span>
                  <span>₹{{ totalAmount() }}</span>
                </div>
                @if (error()) {
                  <div class="alert-error">{{ error() }}</div>
                }
                <button class="pay-btn" (click)="confirmBooking()" [disabled]="bookingLoading() || selectedSeats.length !== seats">
                  @if (bookingLoading()) { <span class="spinner-sm"></span> Processing... }
                  @else { Pay ₹{{ totalAmount() }} }
                </button>
                <p class="secure-note">🔒 Secure & encrypted payment</p>
              </aside>
            </div>
          } @else {
            <!-- Confirmation -->
            <div class="confirmation">
              <div class="conf-icon">🎉</div>
              <h1>Booking Confirmed!</h1>
              <p>Your journey is all set. Have a great trip!</p>
              <div class="ticket">
                <div class="ticket-header">
                  <span>🚌 BusGo</span>
                  <span class="ref">{{ booking()?.bookingReference }}</span>
                </div>
                <div class="ticket-body">
                  <div class="tk-route">
                    <div class="tk-city">{{ booking()?.fromCity }}</div>
                    <div class="tk-arrow">→</div>
                    <div class="tk-city">{{ booking()?.toCity }}</div>
                  </div>
                  <div class="tk-details">
                    <div class="tk-item"><span>Date</span><strong>{{ booking()?.travelDate }}</strong></div>
                    <div class="tk-item"><span>Departure</span><strong>{{ booking()?.departureTime }}</strong></div>
                    <div class="tk-item"><span>Seats</span><strong>{{ booking()?.seatNumbers?.join(', ') }}</strong></div>
                    <div class="tk-item"><span>Amount Paid</span><strong>₹{{ booking()?.totalAmount }}</strong></div>
                    <div class="tk-item"><span>Bus</span><strong>{{ booking()?.busName }}</strong></div>
                    <div class="tk-item"><span>Status</span><strong class="status-confirmed">{{ booking()?.status }}</strong></div>
                  </div>
                </div>
              </div>
              <div class="conf-actions">
                <a routerLink="/dashboard" class="btn-primary">View My Bookings</a>
                <a routerLink="/search" class="btn-outline">Book Another</a>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
    * { box-sizing: border-box; }
    .booking-page { background: #080812; min-height: 100vh; font-family: 'DM Sans', sans-serif; color: #fff; padding: 32px 24px; }
    .booking-container { max-width: 1100px; margin: 0 auto; }
    .loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 80px; }
    .spinner { width: 40px; height: 40px; border: 3px solid rgba(99,102,241,0.2); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .back-link { color: rgba(255,255,255,0.4); font-size: 14px; cursor: pointer; margin-bottom: 20px; display: inline-block; }
    .back-link:hover { color: #a78bfa; }
    h1 { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; margin-bottom: 24px; }

    .booking-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; }
    .booking-main { display: flex; flex-direction: column; gap: 20px; }

    .bus-summary {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px; padding: 24px;
    }
    .bs-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .bs-header h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
    .type-badge { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #a78bfa; padding: 3px 10px; border-radius: 100px; font-size: 12px; }
    .bs-price { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 700; color: #a78bfa; }
    .bs-price span { font-size: 13px; color: rgba(255,255,255,0.4); }
    .bs-route { display: flex; align-items: center; gap: 16px; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px; margin-bottom: 16px; }
    .route-point { flex: 1; }
    .route-point.right { text-align: right; }
    .time { font-size: 22px; font-weight: 700; }
    .city { font-size: 15px; font-weight: 600; margin: 4px 0; }
    .sub { font-size: 12px; color: rgba(255,255,255,0.35); }
    .route-mid { flex: 1; display: flex; align-items: center; gap: 8px; }
    .line { flex: 1; height: 1px; background: rgba(99,102,241,0.4); }
    .bs-meta { display: flex; gap: 20px; font-size: 13px; color: rgba(255,255,255,0.5); }

    .section-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; }
    .section-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 16px; }

    .seat-controls { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .seat-controls button { width: 36px; height: 36px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #a78bfa; border-radius: 8px; cursor: pointer; font-size: 20px; }
    .seat-controls button:disabled { opacity: 0.3; cursor: not-allowed; }
    .seat-controls span { font-size: 20px; font-weight: 700; min-width: 30px; text-align: center; }
    .seat-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; margin-bottom: 12px; }
    .seat { padding: 8px 4px; text-align: center; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.15s; border: 1px solid; }
    .seat.available { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); }
    .seat.available:hover { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.1); }
    .seat.selected { background: rgba(99,102,241,0.2); border-color: #6366f1; color: #a78bfa; }
    .seat-hint { font-size: 12px; color: rgba(255,255,255,0.4); }

    .amenities-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .amenity { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); color: #4ade80; padding: 5px 12px; border-radius: 8px; font-size: 13px; }

    /* Price Summary */
    .price-summary { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 24px; position: sticky; top: 90px; }
    .price-summary h3 { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
    .price-row { display: flex; justify-content: space-between; font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 12px; }
    .price-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 12px 0; }
    .price-total { display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; margin-bottom: 20px; }
    .alert-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; }
    .pay-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .pay-btn:hover:not(:disabled) { opacity: 0.9; box-shadow: 0 8px 25px rgba(99,102,241,0.35); }
    .pay-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .spinner-sm { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
    .secure-note { text-align: center; color: rgba(255,255,255,0.35); font-size: 12px; margin-top: 12px; }

    /* Confirmation */
    .confirmation { max-width: 600px; margin: 0 auto; text-align: center; padding: 40px 0; }
    .conf-icon { font-size: 72px; margin-bottom: 20px; animation: bounce 0.6s ease; }
    @keyframes bounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }
    .confirmation h1 { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; margin-bottom: 8px; }
    .confirmation > p { color: rgba(255,255,255,0.5); font-size: 16px; margin-bottom: 32px; }
    .ticket { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden; margin-bottom: 32px; }
    .ticket-header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 16px 24px; display: flex; justify-content: space-between; font-weight: 600; }
    .ref { font-size: 14px; opacity: 0.85; letter-spacing: 1px; }
    .ticket-body { padding: 24px; }
    .tk-route { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .tk-city { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 700; flex: 1; }
    .tk-arrow { font-size: 24px; color: #6366f1; }
    .tk-city:last-child { text-align: right; }
    .tk-details { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; text-align: left; }
    .tk-item { display: flex; flex-direction: column; gap: 4px; }
    .tk-item span { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; }
    .tk-item strong { font-size: 14px; font-weight: 600; }
    .status-confirmed { color: #4ade80; }
    .conf-actions { display: flex; gap: 16px; justify-content: center; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; }
    .btn-outline { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 500; font-size: 15px; }
  `]
})
export class BookingComponent implements OnInit {
  schedule = signal<Schedule | null>(null);
  loading = signal(true);
  bookingLoading = signal(false);
  error = signal('');
  confirmed = signal(false);
  booking = signal<any>(null);
  seats = 1;
  selectedSeats: string[] = [];
  seatOptions: string[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private busService: BusService) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('scheduleId')!;
    this.seats = +this.route.snapshot.queryParams['seats'] || 1;
    this.busService.getSchedule(id).subscribe({
      next: (s) => {
        this.schedule.set(s);
        this.buildSeats(s.bus?.totalSeats || 40);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.router.navigate(['/search']); }
    });
  }

  buildSeats(total: number) {
    this.seatOptions = Array.from({ length: Math.min(total, 40) }, (_, i) => `S${i + 1}`);
  }

  toggleSeat(seat: string) {
    if (this.selectedSeats.includes(seat)) {
      this.selectedSeats = this.selectedSeats.filter(s => s !== seat);
    } else if (this.selectedSeats.length < this.seats) {
      this.selectedSeats = [...this.selectedSeats, seat];
    }
  }

  adjustSeats(delta: number) {
    this.seats = Math.max(1, Math.min(this.seats + delta, this.schedule()!.availableSeats));
    if (this.selectedSeats.length > this.seats) {
      this.selectedSeats = this.selectedSeats.slice(0, this.seats);
    }
  }

  totalAmount() { return this.seats * (this.schedule()?.price || 0); }

  confirmBooking() {
    this.bookingLoading.set(true); this.error.set('');
    this.busService.createBooking(this.schedule()!.id, this.seats).subscribe({
      next: (b) => { this.booking.set(b); this.confirmed.set(true); this.bookingLoading.set(false); },
      error: (err) => { this.error.set(err.error || 'Booking failed.'); this.bookingLoading.set(false); }
    });
  }

  goBack() { this.router.navigate(['/search']); }
  formatType(type: string | undefined): string { return (type || '').replace(/_/g, ' '); }
  getAmenities(amenities: string | undefined): string[] {
    return (amenities || '').split(',').map(a => a.trim()).filter(Boolean);
  }
}