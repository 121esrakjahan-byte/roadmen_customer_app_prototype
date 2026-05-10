'use strict';

/* ── Mileage line/area chart ── */
function renderMileageChart() {
  const svg = document.getElementById('mileageChart');
  if (!svg) return;

  const points = [40, 55, 35, 60, 48, 70, 52, 65, 58, 75, 62, 80];
  const max = Math.max(...points);
  const W = 280, H = 80;
  const step = W / (points.length - 1);

  const coords = points.map((p, i) => ({
    x: +(i * step).toFixed(2),
    y: +(H - (p / max) * H).toFixed(2),
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;
  const last = coords[coords.length - 1];

  svg.innerHTML = `
    <defs>
      <linearGradient id="chartG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#F26522" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#F26522" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${areaPath}" fill="url(#chartG)"/>
    <path d="${linePath}" fill="none" stroke="#F26522"
          stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${last.x}" cy="${last.y}" r="4" fill="#FF9A5C"/>
  `;
}

/* ── Donut spend breakdown chart ── */
function renderDonutChart() {
  const svg = document.getElementById('donutChart');
  if (!svg) return;

  const segments = [
    { value: 52, color: '#F26522' },
    { value: 22, color: '#38BDF8' },
    { value: 16, color: '#FBBF24' },
    { value: 10, color: '#787896' },
  ];

  const r = 28;
  const C = 2 * Math.PI * r;
  let acc = 0;

  svg.innerHTML = segments.map(s => {
    const len = (s.value / 100) * C;
    const el = `<circle cx="40" cy="40" r="${r}" fill="none"
      stroke="${s.color}" stroke-width="10"
      stroke-dasharray="${len.toFixed(3)} ${C.toFixed(3)}"
      stroke-dashoffset="${(-acc).toFixed(3)}"/>`;
    acc += len;
    return el;
  }).join('');
}

/* ── Cost-per-km mini bar chart ── */
function renderCostBars() {
  const container = document.getElementById('costBars');
  if (!container) return;

  const values = [40, 55, 48, 70, 52, 38, 60];
  container.innerHTML = values
    .map(v => `<div class="bar-item gradient-accent" style="height:${v}%"></div>`)
    .join('');
}

/* ── Side drawer ── */
function initDrawer() {
  const drawer   = document.getElementById('sideDrawer');
  const overlay  = document.getElementById('drawerOverlay');
  const openBtn  = document.getElementById('menuBtn');
  const closeBtn = document.getElementById('drawerClose');
  if (!drawer || !overlay) return;

  const open = () => {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (openBtn)  openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

/* ── Bottom nav tab switching ── */
function initNavTabs() {
  const items = document.querySelectorAll('.nav-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

/* ── Schedule detail page ── */
const SCHEDULE_DATA = [
  {
    reg: 'DHA-METRO-GA-12-3456',
    status: 'active',
    statusLabel: '● Active',
    date: '10 May 2025',
    time: '8:30 AM',
    from: 'Mirpur DOHS',
    to: 'Tejgaon Ind. Area',
  },
  {
    reg: 'DHA-METRO-KHA-22-1188',
    status: 'upcoming',
    statusLabel: 'Upcoming',
    date: '12 May 2025',
    time: '6:00 AM',
    from: 'Gulshan-2',
    to: 'Chittagong EPZ',
  },
  {
    reg: 'DHA-METRO-GA-12-3456',
    status: 'done',
    statusLabel: 'Completed',
    date: '9 May 2025',
    time: '7:45 AM',
    from: 'Uttara Sector-7',
    to: 'Narayanganj Hub',
  },
];

function populateDetail(data) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('dp-reg',    data.reg);
  set('dp-date',   data.date);
  set('dp-time',   data.time);
  set('dp-from',   data.from);
  set('dp-to',     data.to);

  const badge = document.getElementById('dp-status');
  if (badge) {
    badge.textContent = data.statusLabel;
    badge.className = `sc-status sc-status-${data.status}`;
  }

  const pickBtn = document.getElementById('pickFleetBtn');
  if (pickBtn) {
    pickBtn.classList.remove('trip-active');
    pickBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 17H5v-2.5c0-.828.672-1.5 1.5-1.5h11c.828 0 1.5.672 1.5 1.5V17z"/>
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 17H3v-2a2 2 0 0 1 2-2M19 17h2v-2a2 2 0 0 0-2-2"/>
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l1.5-4.5a2 2 0 0 1 1.9-1.5h3.2a2 2 0 0 1 1.9 1.5L17 11"/>
        <circle cx="7.5"  cy="17.5" r="1.5" stroke="currentColor" stroke-width="2" fill="none"/>
        <circle cx="16.5" cy="17.5" r="1.5" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>
      Pick Fleet
    `;
    if (data.status === 'done') {
      pickBtn.disabled = true;
      pickBtn.style.opacity = '0.4';
      pickBtn.innerHTML = 'Trip Completed';
    } else {
      pickBtn.disabled = false;
      pickBtn.style.opacity = '';
    }
  }
}

function initScheduleDetails() {
  const page    = document.getElementById('scheduleDetail');
  const backBtn = document.getElementById('detailBack');
  if (!page) return;

  const open = (data) => {
    populateDetail(data);
    page.classList.add('open');
    page.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    page.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.schedule-card, .sched-card').forEach((card, i) => {
    card.addEventListener('click', () => open(SCHEDULE_DATA[i] || SCHEDULE_DATA[0]));
  });

  if (backBtn) backBtn.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && page.classList.contains('open')) close();
  });
}

/* ── Pick Fleet toggle ── */
function initPickFleet() {
  const btn = document.getElementById('pickFleetBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    const active = btn.classList.toggle('trip-active');
    btn.innerHTML = active
      ? `<span class="fleet-pulse-dot"></span> Trip Active — End Trip`
      : `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 17H5v-2.5c0-.828.672-1.5 1.5-1.5h11c.828 0 1.5.672 1.5 1.5V17z"/>
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 17H3v-2a2 2 0 0 1 2-2M19 17h2v-2a2 2 0 0 0-2-2"/>
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l1.5-4.5a2 2 0 0 1 1.9-1.5h3.2a2 2 0 0 1 1.9 1.5L17 11"/>
          <circle cx="7.5"  cy="17.5" r="1.5" stroke="currentColor" stroke-width="2" fill="none"/>
          <circle cx="16.5" cy="17.5" r="1.5" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        Pick Fleet
      `;
  });
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  renderMileageChart();
  renderDonutChart();
  renderCostBars();
  initNavTabs();
  initDrawer();
  initScheduleDetails();
  initPickFleet();
});
