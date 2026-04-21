import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { BusService } from '../../services/bus';
import { Booking } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <div class="dash-header">
        <div class="dash-header-inner">
          <div class="welcome">
            <div class="avatar">{{ initial() }}</div>
            <div>
              <h1>Welcome back, {{ firstName() }}!</h1>
              <p>Manage your bookings and travel history</p>
            </div>
          </div>
          <a routerLink="/search" class="new-booking-btn">+ New Booking</a>
        </div>
      </div>

      <div class="dash-container">
        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🎟️</div>
            <div class="stat-value">{{ totalBookings() }}</div>
            <div class="stat-label">Total Bookings</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-value">{{ confirmedCount() }}</div>
            <div class="stat-label">Confirmed</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">❌</div>
            <div class="stat-value">{{ cancelledCount() }}</div>
            <div class="stat-label">Cancelled</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-value">₹{{ totalSpent() }}</div>
            <div class="stat-label">Total Spent</div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="tabs">
          @for (tab of tabs; track tab.value) {
            <button class="tab" [class.active]="activeTab() === tab.value"
                    (click)="activeTab.set(tab.value)">
              {{ tab.label }}
              <span class="tab-count">{{ getTabCount(tab.value) }}</span>
            </button>
          }
        </div>

        <!-- Bookings List -->
        @if (loading()) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        } @else if (filteredBookings().length === 0) {
          <div class="empty">
            <div class="empty-icon">🚌</div>
            <h3>No bookings found</h3>
            <p>You haven't made any {{ activeTab() !== 'ALL' ? activeTab().toLowerCase() : '' }} bookings yet.</p>
            <a routerLink="/search" class="empty-cta">Search Buses</a>
          </div>
        } @else {
          <div class="bookings-list">
            @for (booking of filteredBookings(); track booking.id) {
              <div class="booking-card" [class.cancelled]="booking.status === 'CANCELLED'">
                <!-- Card Header -->
                <div class="bc-header">
                  <div class="bc-ref">
                    <span class="ref-label">Booking Ref</span>
                    <span class="ref-value">{{ booking.bookingReference }}</span>
                  </div>
                  <div class="bc-badges">
                    <span class="status-badge" [class]="'status-' + booking.status.toLowerCase()">
                      {{ getStatusIcon(booking.status) }} {{ booking.status }}
                    </span>
                    <span class="payment-badge" [class]="'pay-' + booking.paymentStatus.toLowerCase()">
                      {{ booking.paymentStatus }}
                    </span>
                  </div>
                </div>

                <!-- Route -->
                <div class="bc-route">
                  <div class="bc-city">
                    <div class="city-name">{{ booking.fromCity }}</div>
                    <div class="city-time">{{ booking.departureTime }}</div>
                  </div>
                  <div class="bc-journey">
                    <div class="journey-line">
                      <div class="dot"></div>
                      <div class="line"></div>
                      <span class="bus-emoji">🚌</span>
                      <div class="line"></div>
                      <div class="dot"></div>
                    </div>
                    <div class="journey-date">{{ booking.travelDate }}</div>
                  </div>
                  <div class="bc-city right">
                    <div class="city-name">{{ booking.toCity }}</div>
                    <div class="city-time">{{ booking.arrivalTime }}</div>
                  </div>
                </div>

                <!-- Details -->
                <div class="bc-details">
                  <div class="bc-detail">
                    <span class="detail-label">Bus</span>
                    <span class="detail-value">{{ booking.busName }}</span>
                  </div>
                  <div class="bc-detail">
                    <span class="detail-label">Type</span>
                    <span class="detail-value">{{ formatBusType(booking.busType) }}</span>
                  </div>
                  <div class="bc-detail">
                    <span class="detail-label">Seats</span>
                    <span class="detail-value">{{ booking.seatNumbers?.join(', ') }}</span>
                  </div>
                  <div class="bc-detail">
                    <span class="detail-label">Passengers</span>
                    <span class="detail-value">{{ booking.numberOfSeats }}</span>
                  </div>
                  <div class="bc-detail">
                    <span class="detail-label">Amount Paid</span>
                    <span class="detail-value highlight">₹{{ booking.totalAmount }}</span>
                  </div>
                  <div class="bc-detail">
                    <span class="detail-label">Booked On</span>
                    <span class="detail-value">{{ formatDate(booking.bookedAt) }}</span>
                  </div>
                </div>

                <!-- Actions -->
                @if (booking.status === 'CONFIRMED') {
                  <div class="bc-actions">
                    <button class="cancel-btn" (click)="cancelBooking(booking)"
                            [disabled]="cancelling() === booking.id">
                      @if (cancelling() === booking.id) { Cancelling... }
                      @else { Cancel Booking }
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
    * { box-sizing: border-box; }
    .dashboard { background: #080812; min-height: 100vh; font-family: 'DM Sans', sans-serif; color: #fff; }

    /* Header */
    .dash-header {
      background: rgba(255,255,255,0.03);
      border-bottom: 1px solid rgba(255,255,255,0.07);
      padding: 32px 24px;
    }
    .dash-header-inner {
      max-width: 1100px; margin: 0 auto;
      display: flex; justify-content: space-between; align-items: center; gap: 20px;
    }
    .welcome { display: flex; align-items: center; gap: 20px; }
    .avatar {
      width: 56px; height: 56px;
      background: linear-gradient(135deg, #6366f1, #a78bfa);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800;
    }
    h1 { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; margin: 0 0 4px; }
    .welcome > div > p { color: rgba(255,255,255,0.45); font-size: 14px; margin: 0; }
    .new-booking-btn {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff; padding: 12px 24px; border-radius: 12px;
      text-decoration: none; font-weight: 600; font-size: 14px;
      white-space: nowrap; transition: all 0.2s;
    }
    .new-booking-btn:hover { opacity: 0.9; transform: translateY(-1px); }

    .dash-container { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }

    /* Stats */
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .stat-card {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; padding: 20px; text-align: center; transition: all 0.2s;
    }
    .stat-card:hover { border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.06); }
    .stat-icon { font-size: 28px; margin-bottom: 8px; }
    .stat-value { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #a78bfa; }
    .stat-label { color: rgba(255,255,255,0.45); font-size: 13px; margin-top: 4px; }

    /* Tabs */
    .tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
    .tab {
      padding: 10px 20px; border-radius: 10px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 500;
      cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px;
      font-family: 'DM Sans', sans-serif;
    }
    .tab:hover { border-color: rgba(99,102,241,0.4); color: #fff; }
    .tab.active { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.5); color: #a78bfa; }
    .tab-count {
      background: rgba(255,255,255,0.1); padding: 1px 8px;
      border-radius: 100px; font-size: 12px;
    }
    .tab.active .tab-count { background: rgba(99,102,241,0.3); }

    /* Loading & Empty */
    .loading { text-align: center; padding: 60px; }
    .spinner { width: 40px; height: 40px; border: 3px solid rgba(99,102,241,0.2); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading p, .empty p { color: rgba(255,255,255,0.4); font-size: 14px; }
    .empty { text-align: center; padding: 80px 20px; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; }
    .empty h3 { font-size: 20px; margin-bottom: 8px; }
    .empty-cta { display: inline-block; margin-top: 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; }

    /* Booking Card */
    .bookings-list { display: flex; flex-direction: column; gap: 16px; }
    .booking-card {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px; padding: 24px; transition: border-color 0.2s;
      animation: slideIn 0.3s ease;
    }
    @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .booking-card:hover { border-color: rgba(99,102,241,0.25); }
    .booking-card.cancelled { opacity: 0.6; }

    /* Card Header */
    .bc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .ref-label { color: rgba(255,255,255,0.35); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; display: block; margin-bottom: 4px; }
    .ref-value { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 1px; }
    .bc-badges { display: flex; gap: 8px; flex-wrap: wrap; }
    .status-badge, .payment-badge {
      padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; border: 1px solid;
    }
    .status-confirmed { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.3); color: #4ade80; }
    .status-cancelled { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: #f87171; }
    .status-pending { background: rgba(234,179,8,0.1); border-color: rgba(234,179,8,0.3); color: #facc15; }
    .status-completed { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3); color: #a78bfa; }
    .pay-paid { background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.2); color: #4ade80; }
    .pay-refunded { background: rgba(234,179,8,0.08); border-color: rgba(234,179,8,0.2); color: #facc15; }
    .pay-pending { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.2); color: #f87171; }

    /* Route */
    .bc-route {
      display: flex; align-items: center; gap: 16px;
      background: rgba(255,255,255,0.03); border-radius: 14px;
      padding: 16px 20px; margin-bottom: 20px;
    }
    .bc-city { flex: 1; }
    .bc-city.right { text-align: right; }
    .city-name { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; }
    .city-time { color: rgba(255,255,255,0.45); font-size: 13px; margin-top: 4px; }
    .bc-journey { flex: 1; text-align: center; }
    .journey-line { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 6px; }
    .dot { width: 8px; height: 8px; background: #6366f1; border-radius: 50%; flex-shrink: 0; }
    .line { flex: 1; height: 2px; background: linear-gradient(90deg, #6366f1, rgba(99,102,241,0.3)); }
    .bus-emoji { font-size: 18px; }
    .journey-date { color: rgba(255,255,255,0.45); font-size: 12px; }

    /* Details */
    .bc-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .bc-detail { display: flex; flex-direction: column; gap: 4px; }
    .detail-label { color: rgba(255,255,255,0.35); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
    .detail-value { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.85); }
    .detail-value.highlight { color: #a78bfa; font-weight: 700; font-size: 16px; }

    /* Actions */
    .bc-actions { padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.07); display: flex; gap: 12px; }
    .cancel-btn {
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
      color: #f87171; padding: 10px 20px; border-radius: 10px;
      font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;
    }
    .cancel-btn:hover:not(:disabled) { background: rgba(239,68,68,0.2); }
    .cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class DashboardComponent implements OnInit {
  bookings = signal<Booking[]>([]);
  loading = signal(true);
  activeTab = signal('ALL');
  cancelling = signal<number | null>(null);

  tabs = [
    { label: 'All', value: 'ALL' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Cancelled', value: 'CANCELLED' },
    { label: 'Completed', value: 'COMPLETED' },
  ];

  constructor(private authService: AuthService, private busService: BusService) {}

  ngOnInit() {
    this.busService.getMyBookings().subscribe({
      next: (data) => { this.bookings.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  initial = computed(() => {
    const u = this.authService.currentUser();
    return u ? u.firstName[0].toUpperCase() : 'U';
  });
  firstName = computed(() => this.authService.currentUser()?.firstName || 'User');

  filteredBookings = computed(() => {
    const tab = this.activeTab();
    if (tab === 'ALL') return this.bookings();
    return this.bookings().filter(b => b.status === tab);
  });

  totalBookings = computed(() => this.bookings().length);
  confirmedCount = computed(() => this.bookings().filter(b => b.status === 'CONFIRMED').length);
  cancelledCount = computed(() => this.bookings().filter(b => b.status === 'CANCELLED').length);
  totalSpent = computed(() =>
    this.bookings().filter(b => b.status !== 'CANCELLED').reduce((s, b) => s + b.totalAmount, 0).toFixed(0)
  );

  getTabCount(tab: string): number {
    if (tab === 'ALL') return this.bookings().length;
    return this.bookings().filter(b => b.status === tab).length;
  }

  cancelBooking(booking: Booking) {
    if (!confirm(`Cancel booking ${booking.bookingReference}?`)) return;
    this.cancelling.set(booking.id);
    this.busService.cancelBooking(booking.id).subscribe({
      next: (updated) => {
        this.bookings.update(list => list.map(b => b.id === updated.id ? updated : b));
        this.cancelling.set(null);
      },
      error: () => this.cancelling.set(null)
    });
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      CONFIRMED: '✅', CANCELLED: '❌', PENDING: '⏳', COMPLETED: '🏁'
    };
    return icons[status] || '';
  }

  formatBusType(type: string): string { return (type || '').replace(/_/g, ' '); }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}