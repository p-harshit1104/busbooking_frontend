import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BusService } from '../../../services/bus';
import { Schedule } from '../../../models/models';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="search-page">
      <!-- Search Bar -->
      <div class="search-bar">
        <div class="sb-container">
          <div class="sb-field">
            <label>FROM</label>
            <input type="text" [(ngModel)]="params.fromCity" placeholder="Delhi" />
          </div>
          <button class="swap-btn" (click)="swap()">⇄</button>
          <div class="sb-field">
            <label>TO</label>
            <input type="text" [(ngModel)]="params.toCity" placeholder="Mumbai" />
          </div>
          <div class="sb-field">
            <label>DATE</label>
            <input type="date" [(ngModel)]="params.travelDate" [min]="today" />
          </div>
          <div class="sb-field">
            <label>SEATS</label>
            <select [(ngModel)]="params.seats">
              @for (n of [1,2,3,4,5,6]; track n) { <option [value]="n">{{ n }}</option> }
            </select>
          </div>
          <button class="search-btn" (click)="search()">Search</button>
        </div>
      </div>

      <div class="results-container">
        <!-- Filters -->
        <aside class="filters">
          <h3>Filters</h3>
          <div class="filter-group">
            <h4>Bus Type</h4>
            @for (type of busTypes; track type) {
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="selectedTypes[type]" (change)="applyFilters()" />
                <span>{{ formatBusType(type) }}</span>
              </label>
            }
          </div>
          <div class="filter-group">
            <h4>Price Range</h4>
            <div class="price-range">
              <span>₹{{ minPrice }}</span>
              <input type="range" [(ngModel)]="maxPrice" [min]="minPrice" [max]="maxPossible" (input)="applyFilters()" />
              <span>₹{{ maxPrice }}</span>
            </div>
          </div>
          <button class="clear-btn" (click)="clearFilters()">Clear Filters</button>
        </aside>

        <!-- Results -->
        <main class="results">
          @if (loading()) {
            <div class="loading-state">
              <div class="spinner-large"></div>
              <p>Finding the best buses for you...</p>
            </div>
          } @else if (error()) {
            <div class="empty-state">
              <div class="empty-icon">⚠️</div>
              <h3>Something went wrong</h3>
              <p>{{ error() }}</p>
            </div>
          } @else if (filteredSchedules().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">🚌</div>
              <h3>No buses found</h3>
              <p>Try different dates or routes</p>
            </div>
          } @else {
            <div class="results-header">
              <span>{{ filteredSchedules().length }} buses found</span>
              <select [(ngModel)]="sortBy" (change)="applyFilters()">
                <option value="price">Price: Low to High</option>
                <option value="departure">Departure Time</option>
                <option value="seats">Most Seats</option>
              </select>
            </div>
            @for (schedule of filteredSchedules(); track schedule.id) {
              <div class="bus-card">
                <div class="bus-header">
                  <div class="bus-info">
                    <h3>{{ schedule.bus?.busName }}</h3>
                    <span class="bus-type-badge">{{ formatBusType(schedule.bus?.busType || '') }}</span>
                    <span class="bus-number">{{ schedule.bus?.busNumber }}</span>
                  </div>
                  <div class="bus-price">
                    <span class="price">₹{{ schedule.price }}</span>
                    <span class="per-seat">per seat</span>
                  </div>
                </div>
                <div class="bus-timing">
                  <div class="time-block">
                    <div class="time">{{ schedule.departureTime }}</div>
                    <div class="city">{{ schedule.fromCity }}</div>
                    <div class="point">{{ schedule.boardingPoint }}</div>
                  </div>
                  <div class="duration-block">
                    <div class="duration-line"></div>
                    <span class="bus-icon-travel">🚌</span>
                  </div>
                  <div class="time-block right">
                    <div class="time">{{ schedule.arrivalTime }}</div>
                    <div class="city">{{ schedule.toCity }}</div>
                    <div class="point">{{ schedule.droppingPoint }}</div>
                  </div>
                </div>
                <div class="bus-footer">
                  <div class="amenities">
                    @for (a of getAmenities(schedule.bus?.amenities || ''); track a) {
                      <span class="amenity-tag">{{ a }}</span>
                    }
                  </div>
                  <div class="seats-book">
                    <span class="seats-left">{{ schedule.availableSeats }} seats left</span>
                    <button class="book-btn" (click)="bookNow(schedule)">Book Now →</button>
                  </div>
                </div>
              </div>
            }
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
    * { box-sizing: border-box; }
    .search-page { background: #080812; min-height: 100vh; font-family: 'DM Sans', sans-serif; color: #fff; }

    .search-bar { background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 20px 24px; }
    .sb-container { max-width: 1200px; margin: 0 auto; display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
    .sb-field { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 120px; }
    .sb-field label { color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 600; letter-spacing: 1.5px; }
    .sb-field input, .sb-field select {
      padding: 12px 14px; background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12); border-radius: 10px;
      color: #fff; font-size: 14px; font-family: 'DM Sans', sans-serif;
    }
    .sb-field input::placeholder { color: rgba(255,255,255,0.3); }
    .sb-field input:focus, .sb-field select:focus { outline: none; border-color: rgba(99,102,241,0.6); }
    .swap-btn { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #a78bfa; border-radius: 8px; width: 38px; height: 44px; cursor: pointer; font-size: 16px; transition: all 0.2s; align-self: flex-end; }
    .swap-btn:hover { background: rgba(99,102,241,0.3); }
    .search-btn { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; padding: 12px 24px; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; white-space: nowrap; align-self: flex-end; font-family: 'DM Sans', sans-serif; }
    .search-btn:hover { opacity: 0.9; }

    .results-container { max-width: 1200px; margin: 0 auto; padding: 24px; display: grid; grid-template-columns: 260px 1fr; gap: 24px; }

    /* Filters */
    .filters { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; height: fit-content; position: sticky; top: 90px; }
    .filters h3 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 20px; }
    .filter-group { margin-bottom: 24px; }
    .filter-group h4 { color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
    .checkbox-label { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; cursor: pointer; font-size: 14px; color: rgba(255,255,255,0.7); }
    .checkbox-label input[type=checkbox] { accent-color: #6366f1; width: 16px; height: 16px; }
    .price-range { display: flex; align-items: center; gap: 10px; font-size: 13px; color: rgba(255,255,255,0.6); }
    .price-range input[type=range] { flex: 1; accent-color: #6366f1; }
    .clear-btn { width: 100%; padding: 10px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; border-radius: 8px; cursor: pointer; font-size: 14px; margin-top: 8px; }

    /* Results */
    .results { display: flex; flex-direction: column; gap: 16px; }
    .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .results-header span { color: rgba(255,255,255,0.6); font-size: 14px; }
    .results-header select { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #fff; padding: 8px 12px; border-radius: 8px; font-size: 13px; }

    .loading-state, .empty-state { text-align: center; padding: 80px 20px; }
    .spinner-large { width: 48px; height: 48px; border: 3px solid rgba(99,102,241,0.2); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon { font-size: 64px; margin-bottom: 16px; }
    .empty-state h3 { font-size: 20px; margin-bottom: 8px; }
    .empty-state p, .loading-state p { color: rgba(255,255,255,0.45); font-size: 14px; }

    /* Bus Card */
    .bus-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 24px; transition: all 0.2s; }
    .bus-card:hover { border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.05); transform: translateY(-2px); }
    .bus-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .bus-info h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .bus-type-badge { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #a78bfa; padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 500; margin-right: 8px; }
    .bus-number { color: rgba(255,255,255,0.4); font-size: 13px; }
    .bus-price { text-align: right; }
    .price { display: block; font-size: 28px; font-weight: 700; color: #a78bfa; font-family: 'Syne', sans-serif; }
    .per-seat { color: rgba(255,255,255,0.4); font-size: 12px; }
    .bus-timing { display: flex; align-items: center; gap: 0; margin-bottom: 20px; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 14px; }
    .time-block { flex: 1; }
    .time-block.right { text-align: right; }
    .time { font-size: 24px; font-weight: 700; font-family: 'Syne', sans-serif; }
    .city { font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.8); margin: 4px 0; }
    .point { font-size: 12px; color: rgba(255,255,255,0.35); }
    .duration-block { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .duration-line { width: 100%; height: 2px; background: linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent); }
    .bus-icon-travel { font-size: 20px; }
    .bus-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
    .amenities { display: flex; gap: 8px; flex-wrap: wrap; }
    .amenity-tag { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.55); padding: 4px 10px; border-radius: 100px; font-size: 12px; }
    .seats-book { display: flex; align-items: center; gap: 16px; }
    .seats-left { color: #4ade80; font-size: 13px; font-weight: 500; }
    .book-btn { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
    .book-btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.35); }
  `]
})
export class SearchComponent implements OnInit {
  params = { fromCity: '', toCity: '', travelDate: '', seats: 1 };
  today = new Date().toISOString().split('T')[0];
  loading = signal(false);
  error = signal('');
  schedules = signal<Schedule[]>([]);
  filteredSchedules = signal<Schedule[]>([]);
  busTypes = ['VOLVO', 'AC_SLEEPER', 'AC_SEATER', 'NON_AC_SLEEPER', 'NON_AC_SEATER', 'LUXURY'];
  selectedTypes: Record<string, boolean> = {};
  minPrice = 0; maxPrice = 5000; maxPossible = 5000;
  sortBy = 'price';

  constructor(private route: ActivatedRoute, private router: Router, private busService: BusService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['fromCity']) {
        this.params = { fromCity: p['fromCity'], toCity: p['toCity'], travelDate: p['travelDate'], seats: +p['seats'] || 1 };
        this.search();
      }
    });
  }

  search() {
    if (!this.params.fromCity || !this.params.toCity) return;
    this.loading.set(true); this.error.set('');
    this.busService.searchSchedules(this.params).subscribe({
      next: (data) => {
        this.schedules.set(data);
        if (data.length > 0) {
          const prices = data.map(s => s.price);
          this.minPrice = Math.min(...prices);
          this.maxPossible = Math.max(...prices);
          this.maxPrice = this.maxPossible;
        }
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => { this.error.set('Failed to fetch schedules.'); this.loading.set(false); }
    });
  }

  applyFilters() {
    let result = [...this.schedules()];
    const active = Object.keys(this.selectedTypes).filter(k => this.selectedTypes[k]);
    if (active.length > 0) result = result.filter(s => active.includes(s.bus?.busType));
    result = result.filter(s => s.price <= this.maxPrice);
    if (this.sortBy === 'price') result.sort((a, b) => a.price - b.price);
    else if (this.sortBy === 'departure') result.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    else if (this.sortBy === 'seats') result.sort((a, b) => b.availableSeats - a.availableSeats);
    this.filteredSchedules.set(result);
  }

  clearFilters() {
    this.selectedTypes = {};
    this.maxPrice = this.maxPossible;
    this.applyFilters();
  }

  swap() { [this.params.fromCity, this.params.toCity] = [this.params.toCity, this.params.fromCity]; }

  bookNow(schedule: Schedule) { this.router.navigate(['/booking', schedule.id], { queryParams: { seats: this.params.seats } }); }

  formatBusType(type: string): string {
    return (type || '').replace(/_/g, ' ');
  }

  getAmenities(amenities: string): string[] {
    return (amenities || '').split(',').map(a => a.trim()).filter(Boolean).slice(0, 4);
  }
}