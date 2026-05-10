'use strict';

/* ── Mock booking data ── */
const BOOKINGS = [
  {
    id: 'BKG-2025-001',
    date: '15 May 2025',
    time: '9:00 AM',
    pickup: 'Mirpur-10 Metro Station, Gate B',
    from: 'Mirpur DOHS, Dhaka',
    to: 'Motijheel Commercial Area',
    status: 'pending',
    created: '10 May 2025, 2:34 PM',
    adminNote: 'Request is under review by the fleet manager.',
  },
  {
    id: 'BKG-2025-002',
    date: '12 May 2025',
    time: '8:30 AM',
    pickup: 'Banani Kamal Ataturk Ave',
    from: 'Gulshan-2, Dhaka',
    to: 'Karwan Bazar, Dhaka',
    status: 'approved',
    created: '8 May 2025, 11:15 AM',
    adminNote: 'Approved. Toyota Axio (DHA-METRO-GA-12-3456) assigned. Driver: Md. Karim Uddin.',
  },
  {
    id: 'BKG-2025-003',
    date: '10 May 2025',
    time: '7:00 AM',
    pickup: 'Uttara Sector-3, Road 7',
    from: 'Uttara, Dhaka',
    to: 'Chittagong Port, Ctg',
    status: 'rejected',
    created: '7 May 2025, 4:50 PM',
    adminNote: 'No vehicle available for this route on the requested date. Please reschedule.',
  },
];

const STATUS_TIMELINES = {
  pending: [
    { label: 'Request Submitted',  time: null, state: 'done' },
    { label: 'Admin Review',        time: null, state: 'active' },
    { label: 'Decision Pending',    time: null, state: 'pending' },
  ],
  approved: [
    { label: 'Request Submitted',  time: 'Submitted',  state: 'done' },
    { label: 'Admin Review',        time: 'Reviewed',   state: 'done' },
    { label: 'Approved',            time: 'Confirmed',  state: 'done' },
  ],
  rejected: [
    { label: 'Request Submitted',  time: 'Submitted',  state: 'done' },
    { label: 'Admin Review',        time: 'Reviewed',   state: 'done' },
    { label: 'Rejected',            time: 'Closed',     state: 'active' },
  ],
};

/* ── Render booking cards ── */
function renderBookingCards(container, bookings) {
  container.innerHTML = bookings.map((b, i) => `
    <button class="booking-card" data-index="${i}" aria-label="View booking ${b.id}">
      <div class="bk-top">
        <span class="bk-id">${b.id}</span>
        <span class="bk-status bk-status-${b.status}">${statusLabel(b.status)}</span>
      </div>
      <div class="bk-route">
        <div class="sc-dots">
          <div class="sc-dot-start"></div>
          <div class="sc-dot-line"></div>
          <div class="sc-dot-end"></div>
        </div>
        <div class="sc-places">
          <div><p class="bk-place-label">From</p><p class="bk-place-name">${b.from}</p></div>
          <div><p class="bk-place-label">To</p><p class="bk-place-name">${b.to}</p></div>
        </div>
        <div class="sc-chevron">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="m9 18 6-6-6-6"/>
          </svg>
        </div>
      </div>
      <div class="bk-meta">
        <div class="bk-meta-item">
          <span class="bk-meta-label">Pickup</span>
          <span class="bk-meta-value">${b.pickup}</span>
        </div>
        <div class="bk-meta-item">
          <span class="bk-meta-label">Date &amp; Time</span>
          <span class="bk-meta-value">${b.date} · ${b.time}</span>
        </div>
      </div>
      <p class="text-10 text-muted" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
        Submitted: ${b.created}
      </p>
    </button>
  `).join('');

  container.querySelectorAll('.booking-card').forEach(card => {
    card.addEventListener('click', () => {
      openBookingDetail(BOOKINGS[+card.dataset.index]);
    });
  });
}

function statusLabel(status) {
  return { pending: '⏳ Pending', approved: '✓ Approved', rejected: '✕ Rejected' }[status] || status;
}

/* ── Booking detail panel ── */
function openBookingDetail(b) {
  const panel = document.getElementById('bookingDetailPanel');
  if (!panel) return;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('bdId',       b.id);
  set('bdDate',     b.date);
  set('bdTime',     b.time);
  set('bdFrom',     b.from);
  set('bdTo',       b.to);
  set('bdPickup',   b.pickup);
  set('bdRouteFrom',b.from);
  set('bdRouteTo',  b.to);
  set('bdMapFrom',  b.from.split(',')[0]);
  set('bdMapTo',    b.to.split(',')[0]);
  set('bdCreated',  b.created);
  set('bdPanelSubtitle', `${b.id} · ${b.date}`);

  const badge = document.getElementById('bdStatus');
  if (badge) {
    badge.textContent = statusLabel(b.status);
    badge.className = `bk-status bk-status-${b.status}`;
  }

  const noteEl = document.getElementById('bdAdminNote');
  const noteText = document.getElementById('bdAdminText');
  if (noteEl && noteText) {
    noteText.textContent = b.adminNote || 'No comments yet.';
    noteEl.className = `admin-note-card${b.status !== 'pending' ? ` ${b.status}` : ''}`;
    const label = noteEl.querySelector('.admin-note-label');
    if (label) {
      label.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        ${b.status === 'approved' ? 'Approval Note' : b.status === 'rejected' ? 'Rejection Reason' : 'Admin Comment'}`;
    }
  }

  const timeline = document.getElementById('bdTimeline');
  if (timeline) {
    const steps = STATUS_TIMELINES[b.status] || STATUS_TIMELINES.pending;
    timeline.innerHTML = steps.map((s, i) => `
      <div class="bkt-item">
        <div class="bkt-indicator">
          <div class="bkt-dot bkt-dot-${s.state}"></div>
          ${i < steps.length - 1 ? `<div class="bkt-line${s.state === 'done' ? ' bkt-line-done' : ''}"></div>` : ''}
        </div>
        <div class="bkt-body">
          <p class="bkt-title">${s.label}</p>
          ${s.time ? `<p class="bkt-time">${s.time}</p>` : ''}
        </div>
      </div>
    `).join('');
  }

  panel.classList.add('open');
  panel.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function initBookingDetailPanel() {
  const closeBtn = document.getElementById('closeBookingDetail');
  const panel    = document.getElementById('bookingDetailPanel');
  if (!closeBtn || !panel) return;
  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
    document.body.style.overflow = '';
  });
}

/* ── New request panel ── */
function initNewRequestPanel() {
  const panel    = document.getElementById('newRequestPanel');
  const closeBtn = document.getElementById('closeNewRequest');
  const fab      = document.getElementById('newRequestFab');
  const submitBtn = document.getElementById('submitRequestBtn');
  if (!panel) return;

  const open = () => {
    panel.classList.add('open');
    panel.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    panel.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (fab)      fab.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const date   = document.getElementById('reqDate')?.value;
      const time   = document.getElementById('reqTime')?.value;
      const pickup = document.getElementById('pickupInput')?.value;
      const start  = document.getElementById('startInput')?.value;
      const end    = document.getElementById('endInput')?.value;

      if (!date || !time || !pickup || !start || !end) {
        alert('Please fill in all fields before submitting.');
        return;
      }

      /* Optimistically add to list */
      const newBooking = {
        id: `BKG-2025-00${BOOKINGS.length + 1}`,
        date: new Date(date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }),
        time,
        pickup,
        from: start,
        to: end,
        status: 'pending',
        created: new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) + ', ' +
                 new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }),
        adminNote: 'Your request has been submitted and is awaiting review.',
      };
      BOOKINGS.unshift(newBooking);
      renderBookingCards(document.getElementById('bookingCardsList'), BOOKINGS);

      close();
      alert(`Booking request ${newBooking.id} submitted successfully!`);
    });
  }
}

/* ════════════════════════════════════
   MAP PICKER MODAL
════════════════════════════════════ */
let activePickerField = null;
let currentPickerAddress = '';
let currentPickerLatLng = null;
let mapInstance = null;
let mapMarker = null;
let formData = { startPlace: '', startLatLng: null, endPlace: '', endLatLng: null };

function initMapPickerModal() {
  const modal    = document.getElementById('mapPickerModal');
  const closeBtn = document.getElementById('mapPickerClose');
  const confirmBtn = document.getElementById('confirmMapLocation');
  if (!modal) return;

  /* Open when map button clicked */
  document.querySelectorAll('.lf-map-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activePickerField = btn.dataset.field;
      const label = document.getElementById('mapPickerLabel');
      if (label) label.textContent = activePickerField === 'start' ? 'Select Start Location' : 'Select End Location';
      currentPickerAddress = '';
      currentPickerLatLng = null;
      const addrEl = document.getElementById('mapPickerAddress');
      if (addrEl) addrEl.textContent = 'Tap on the map to select a location';
      if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.style.opacity = '0.5'; }
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (!currentPickerAddress) return;
      const input = document.getElementById(activePickerField === 'start' ? 'startInput' : 'endInput');
      if (input) input.value = currentPickerAddress;
      if (activePickerField === 'start') {
        formData.startPlace = currentPickerAddress;
        formData.startLatLng = currentPickerLatLng;
      } else {
        formData.endPlace = currentPickerAddress;
        formData.endLatLng = currentPickerLatLng;
      }
      modal.classList.remove('open');
      document.body.style.overflow = '';
      tryShowRoutePreview();
    });
  }
}

function tryShowRoutePreview() {
  if (!formData.startPlace || !formData.endPlace) return;
  const container = document.getElementById('routePreviewContainer');
  if (container) container.classList.remove('hidden');

  if (!window.google || !formData.startLatLng || !formData.endLatLng) return;

  const mapEl = document.getElementById('routePreviewMap');
  const placeholder = document.getElementById('routeMapPlaceholder');
  if (placeholder) placeholder.style.display = 'none';
  if (!mapEl) return;

  const routeMap = new google.maps.Map(mapEl, {
    zoom: 12,
    center: formData.startLatLng,
    disableDefaultUI: true,
    zoomControl: true,
  });

  const renderer = new google.maps.DirectionsRenderer();
  renderer.setMap(routeMap);

  new google.maps.DirectionsService().route({
    origin: formData.startLatLng,
    destination: formData.endLatLng,
    travelMode: google.maps.TravelMode.DRIVING,
  }, (result, status) => {
    if (status === 'OK') {
      renderer.setDirections(result);
      const leg = result.routes[0].legs[0];
      const distEl = document.getElementById('routeDistance');
      const durEl  = document.getElementById('routeDuration');
      if (distEl) distEl.textContent = leg.distance.text;
      if (durEl)  durEl.textContent  = leg.duration.text;
    }
  });
}

/* ── Google Maps API ready callback ── */
window.onGoogleMapsReady = function () {
  const mapEl = document.getElementById('mapPickerMap');
  if (!mapEl) return;

  /* Clear placeholder */
  mapEl.innerHTML = '';

  mapInstance = new google.maps.Map(mapEl, {
    center: { lat: 23.777, lng: 90.399 }, /* Dhaka */
    zoom: 13,
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
  });

  mapInstance.addListener('click', (e) => {
    placeMapMarker(e.latLng);
    reverseGeocode(e.latLng);
  });

  /* Autocomplete on map picker search input */
  const searchInput = document.getElementById('mapPickerSearch');
  if (searchInput && google.maps.places) {
    const ac = new google.maps.places.Autocomplete(searchInput, {
      fields: ['formatted_address', 'geometry'],
    });
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (place.geometry) {
        mapInstance.panTo(place.geometry.location);
        mapInstance.setZoom(15);
        placeMapMarker(place.geometry.location);
        setPickerAddress(place.formatted_address, place.geometry.location);
      }
    });
  }

  /* Autocomplete on form inputs */
  ['pickupInput', 'startInput', 'endInput'].forEach(id => {
    const input = document.getElementById(id);
    if (!input || !google.maps.places) return;
    const ac = new google.maps.places.Autocomplete(input, {
      fields: ['formatted_address', 'geometry'],
    });
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place.geometry) return;
      if (id === 'startInput') {
        formData.startPlace = place.formatted_address;
        formData.startLatLng = place.geometry.location;
      } else if (id === 'endInput') {
        formData.endPlace = place.formatted_address;
        formData.endLatLng = place.geometry.location;
      }
      tryShowRoutePreview();
    });
  });
};

function placeMapMarker(latLng) {
  if (mapMarker) mapMarker.setMap(null);
  mapMarker = new google.maps.Marker({
    position: latLng,
    map: mapInstance,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: '#F26522',
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 2,
    },
  });
}

function setPickerAddress(address, latLng) {
  currentPickerAddress = address;
  currentPickerLatLng = latLng;
  const addrEl = document.getElementById('mapPickerAddress');
  if (addrEl) addrEl.textContent = address;
  const confirmBtn = document.getElementById('confirmMapLocation');
  if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.style.opacity = '1'; }
}

function reverseGeocode(latLng) {
  if (!window.google) return;
  new google.maps.Geocoder().geocode({ location: latLng }, (results, status) => {
    if (status === 'OK' && results[0]) {
      setPickerAddress(results[0].formatted_address, latLng);
    }
  });
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('bookingCardsList');
  if (listEl) renderBookingCards(listEl, BOOKINGS);
  initNewRequestPanel();
  initBookingDetailPanel();
  initMapPickerModal();
});
