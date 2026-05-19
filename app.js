const flights = [
  { id: 1, flightNo: "FDA101", from: "Sydney", to: "Melbourne", depart: "08:30 AM", arrive: "10:05 AM", duration: "1h 35m", aircraft: "Airbus A320", price: 220, status: "On Time" },
  { id: 2, flightNo: "FDA102", from: "Sydney", to: "Melbourne", depart: "04:20 PM", arrive: "05:55 PM", duration: "1h 35m", aircraft: "Boeing 737", price: 245, status: "On Time" },
  { id: 3, flightNo: "FDA202", from: "Sydney", to: "Singapore", depart: "10:45 AM", arrive: "05:30 PM", duration: "8h 45m", aircraft: "Boeing 787", price: 780, status: "Boarding Soon" },
  { id: 4, flightNo: "FDA203", from: "Singapore", to: "Sydney", depart: "09:00 AM", arrive: "07:45 PM", duration: "7h 45m", aircraft: "Boeing 787", price: 820, status: "On Time" },
  { id: 5, flightNo: "FDA303", from: "Melbourne", to: "Brisbane", depart: "01:15 PM", arrive: "03:25 PM", duration: "2h 10m", aircraft: "Boeing 737", price: 290, status: "On Time" },
  { id: 6, flightNo: "FDA304", from: "Brisbane", to: "Melbourne", depart: "02:30 PM", arrive: "05:00 PM", duration: "2h 30m", aircraft: "Boeing 737", price: 310, status: "Delayed" },
  { id: 7, flightNo: "FDA404", from: "Sydney", to: "Dhaka", depart: "09:20 PM", arrive: "06:10 AM", duration: "13h 50m", aircraft: "Boeing 777", price: 1150, status: "On Time" },
  { id: 8, flightNo: "FDA405", from: "Dhaka", to: "Sydney", depart: "11:45 PM", arrive: "04:20 PM", duration: "14h 35m", aircraft: "Boeing 777", price: 1180, status: "On Time" },
  { id: 9, flightNo: "FDA505", from: "Brisbane", to: "Sydney", depart: "06:00 PM", arrive: "07:35 PM", duration: "1h 35m", aircraft: "Airbus A321", price: 260, status: "On Time" },
  { id: 10, flightNo: "FDA506", from: "Sydney", to: "Brisbane", depart: "07:15 AM", arrive: "08:45 AM", duration: "1h 30m", aircraft: "Airbus A320", price: 250, status: "On Time" },
  { id: 11, flightNo: "FDA606", from: "Melbourne", to: "Sydney", depart: "11:00 AM", arrive: "12:35 PM", duration: "1h 35m", aircraft: "Airbus A320", price: 240, status: "On Time" },
  { id: 12, flightNo: "FDA707", from: "Melbourne", to: "Singapore", depart: "08:45 PM", arrive: "02:50 AM", duration: "8h 05m", aircraft: "Boeing 787", price: 760, status: "On Time" },
  { id: 13, flightNo: "FDA808", from: "Singapore", to: "Melbourne", depart: "11:30 PM", arrive: "09:20 AM", duration: "7h 50m", aircraft: "Boeing 787", price: 790, status: "On Time" },
  { id: 14, flightNo: "FDA909", from: "Brisbane", to: "Singapore", depart: "12:10 PM", arrive: "06:40 PM", duration: "8h 30m", aircraft: "Airbus A330", price: 735, status: "On Time" }
];

const STORAGE_KEY = "flyDreamBookings";

const bookingState = {
  step: 1,
  search: {},
  results: [],
  selectedFlight: null,
  selectedSeat: null
};

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initHomeSearch();
  initBookingPage();
  initManageBookingPage();
  initFlightStatusPage();
  initContactPage();
});

function initNavigation() {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
  }
}

function initHomeSearch() {
  const form = document.getElementById("homeSearchForm");
  if (!form) return;

  setMinTravelDate("homeDate");

  form.addEventListener("submit", event => {
    event.preventDefault();

    const from = document.getElementById("homeFrom").value;
    const to = document.getElementById("homeTo").value;
    const date = document.getElementById("homeDate").value;

    if (from === to) {
      alert("Departure and arrival cities cannot be the same.");
      return;
    }

    const params = new URLSearchParams({ from, to, date });
    window.location.href = `booking.html?${params.toString()}`;
  });
}

function initBookingPage() {
  const searchForm = document.getElementById("searchForm");
  if (!searchForm) return;

  setMinTravelDate("departureDate");

  const params = new URLSearchParams(window.location.search);
  if (params.get("from")) document.getElementById("fromCity").value = params.get("from");
  if (params.get("to")) document.getElementById("toCity").value = params.get("to");
  if (params.get("date")) document.getElementById("departureDate").value = params.get("date");

  searchForm.addEventListener("submit", handleSearch);

  const changeSearchBtn = document.getElementById("changeSearchBtn");
  if (changeSearchBtn) changeSearchBtn.addEventListener("click", () => goToStep(1));

  const continueToSeatsBtn = document.getElementById("continueToSeatsBtn");
  if (continueToSeatsBtn) continueToSeatsBtn.addEventListener("click", handlePassengerContinue);

  const continueToReviewBtn = document.getElementById("continueToReviewBtn");
  if (continueToReviewBtn) continueToReviewBtn.addEventListener("click", handleReviewContinue);

  const confirmBookingBtn = document.getElementById("confirmBookingBtn");
  if (confirmBookingBtn) confirmBookingBtn.addEventListener("click", confirmBooking);

  const newBookingBtn = document.getElementById("newBookingBtn");
  if (newBookingBtn) newBookingBtn.addEventListener("click", resetBookingFlow);

  document.querySelectorAll("[data-step]").forEach(button => {
    button.addEventListener("click", () => goToStep(Number(button.dataset.step)));
  });

  document.querySelectorAll(".addon").forEach(addon => addon.addEventListener("change", updateReview));

  ["passengers", "cabinClass", "tripType", "departureDate"].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.addEventListener("change", updateReview);
  });

  if (params.get("from") && params.get("to") && params.get("date")) {
    searchForm.requestSubmit();
  } else {
    goToStep(1);
  }
}

function handleSearch(event) {
  event.preventDefault();

  const from = document.getElementById("fromCity").value;
  const to = document.getElementById("toCity").value;
  const date = document.getElementById("departureDate").value;
  const tripType = document.getElementById("tripType").value;
  const passengers = Number(document.getElementById("passengers").value);
  const cabin = document.getElementById("cabinClass").value;

  if (!from || !to || !date) {
    alert("Please complete the flight search details.");
    return;
  }

  if (from === to) {
    alert("Departure and arrival cities cannot be the same.");
    return;
  }

  bookingState.search = { from, to, date, tripType, passengers, cabin };
  bookingState.selectedFlight = null;
  bookingState.selectedSeat = null;
  bookingState.results = flights.filter(flight => flight.from === from && flight.to === to);

  document.getElementById("routeSummary").textContent = `${from} to ${to} • ${date} • ${tripType} • ${passengers} passenger(s) • ${cabin}`;
  renderFlights();
  goToStep(2);
}

function renderFlights() {
  const flightResults = document.getElementById("flightResults");
  flightResults.innerHTML = "";

  if (!bookingState.results.length) {
    flightResults.innerHTML = `<p class="empty-state">No matching flights were found. Please change your search criteria.</p>`;
    return;
  }

  bookingState.results.forEach(flight => {
    const card = document.createElement("article");
    card.className = "flight-card";
    card.innerHTML = `
      <div>
        <h3>${flight.from} → ${flight.to}</h3>
        <p>${flight.flightNo} • ${flight.aircraft} • ${flight.duration}</p>
      </div>
      <div class="flight-times">
        <div><small>Depart</small><strong>${flight.depart}</strong></div>
        <div class="flight-line"></div>
        <div><small>Arrive</small><strong>${flight.arrive}</strong></div>
      </div>
      <div class="flight-price">
        <strong>$${flight.price}</strong>
        <button class="primary-btn" type="button">Select</button>
      </div>
    `;

    card.querySelector("button").addEventListener("click", () => selectFlight(flight.id));
    flightResults.appendChild(card);
  });
}

function selectFlight(id) {
  bookingState.selectedFlight = flights.find(flight => flight.id === id);
  bookingState.selectedSeat = null;
  document.getElementById("selectedSeatText").textContent = "No seat selected";
  document.querySelectorAll(".addon").forEach(addon => (addon.checked = false));
  createSeatMap();
  updateReview();
  goToStep(3);
}

function handlePassengerContinue() {
  const passenger = getPassenger();

  if (!passenger.fullName || !passenger.email || !passenger.phone || !passenger.passport || !passenger.nationality || !passenger.dob) {
    alert("Please complete all passenger details.");
    return;
  }

  if (!isValidEmail(passenger.email)) {
    alert("Please enter a valid email address.");
    return;
  }

  goToStep(4);
}

function handleReviewContinue() {
  if (!bookingState.selectedSeat) {
    alert("Please select a seat.");
    return;
  }

  updateReview();
  goToStep(5);
}

function createSeatMap() {
  const seatMap = document.getElementById("seatMap");
  seatMap.innerHTML = "";

  const rows = ["A", "B", "C", "D", "E", "F"];
  const bookedSeats = ["A2", "B4", "C1", "D5", "E3", "F6"];

  rows.forEach(row => {
    for (let col = 1; col <= 6; col++) {
      const seat = `${row}${col}`;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "seat";
      button.textContent = seat;

      if (bookedSeats.includes(seat)) {
        button.classList.add("booked");
        button.disabled = true;
      }

      button.addEventListener("click", () => {
        document.querySelectorAll(".seat").forEach(item => item.classList.remove("selected"));
        button.classList.add("selected");
        bookingState.selectedSeat = seat;
        document.getElementById("selectedSeatText").textContent = `Selected Seat: ${seat}`;
        updateReview();
      });

      seatMap.appendChild(button);
    }
  });
}

function getPassenger() {
  return {
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    passport: document.getElementById("passport").value.trim(),
    nationality: document.getElementById("nationality").value.trim(),
    dob: document.getElementById("dob").value
  };
}

function getSelectedAddons() {
  return Array.from(document.querySelectorAll(".addon:checked")).map(addon => ({
    name: addon.value,
    price: Number(addon.dataset.price)
  }));
}

function calculateTotal() {
  if (!bookingState.selectedFlight) return 0;

  const passengers = Number(document.getElementById("passengers").value || 1);
  const cabin = document.getElementById("cabinClass").value;
  const tripType = document.getElementById("tripType").value;
  const addons = getSelectedAddons();

  let base = bookingState.selectedFlight.price;

  if (cabin === "Business") base *= 1.8;
  if (cabin === "First Class") base *= 2.6;
  if (tripType === "Return") base *= 2;

  let total = base * passengers;

  addons.forEach(addon => {
    total += addon.price * passengers;
  });

  return Math.round(total);
}

function updateReview() {
  if (!bookingState.selectedFlight || !document.getElementById("reviewDetails")) return;

  const passenger = getPassenger();
  const addons = getSelectedAddons();
  const total = calculateTotal();

  document.getElementById("totalPrice").textContent = `$${total}`;

  document.getElementById("reviewDetails").innerHTML = `
    ${reviewRow("Passenger", passenger.fullName || "Not completed")}
    ${reviewRow("Email", passenger.email || "Not completed")}
    ${reviewRow("Flight", `${bookingState.selectedFlight.flightNo} • ${bookingState.selectedFlight.aircraft}`)}
    ${reviewRow("Route", `${bookingState.selectedFlight.from} → ${bookingState.selectedFlight.to}`)}
    ${reviewRow("Departure Date", document.getElementById("departureDate").value || "Not selected")}
    ${reviewRow("Time", `${bookingState.selectedFlight.depart} → ${bookingState.selectedFlight.arrive}`)}
    ${reviewRow("Trip Type", document.getElementById("tripType").value)}
    ${reviewRow("Cabin", document.getElementById("cabinClass").value)}
    ${reviewRow("Passengers", document.getElementById("passengers").value)}
    ${reviewRow("Seat", bookingState.selectedSeat || "Not selected")}
    ${reviewRow("Travel Services", addons.length ? addons.map(addon => addon.name).join(", ") : "None")}
    ${reviewRow("Total", `$${total}`)}
  `;
}

function reviewRow(label, value) {
  return `<div class="review-row"><span>${label}</span><strong>${value}</strong></div>`;
}

function confirmBooking() {
  if (!bookingState.selectedFlight || !bookingState.selectedSeat) {
    alert("Please complete the booking before confirmation.");
    return;
  }

  const passenger = getPassenger();

  const booking = normalizeBooking({
    reference: generateReference(),
    status: "Confirmed",
    createdAt: new Date().toLocaleString(),
    search: { ...bookingState.search },
    passenger,
    flight: { ...bookingState.selectedFlight },
    seat: bookingState.selectedSeat,
    addons: getSelectedAddons(),
    total: calculateTotal()
  });

  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);

  renderTicket(booking, "ticketOutput");
  goToStep(6);
}

function goToStep(step) {
  const stepMap = {
    1: "stepSearch",
    2: "stepFlights",
    3: "stepPassenger",
    4: "stepSeats",
    5: "stepReview",
    6: "stepConfirm"
  };

  Object.entries(stepMap).forEach(([number, id]) => {
    const element = document.getElementById(id);
    if (element) element.classList.toggle("active", Number(number) === step);
  });

  document.querySelectorAll(".progress-step").forEach((item, index) => {
    const current = index + 1;
    item.classList.toggle("active", current === step);
    item.classList.toggle("done", current < step);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetBookingFlow() {
  bookingState.step = 1;
  bookingState.search = {};
  bookingState.results = [];
  bookingState.selectedFlight = null;
  bookingState.selectedSeat = null;

  document.getElementById("searchForm").reset();
  document.getElementById("passengerForm").reset();
  document.getElementById("passengers").value = 1;
  document.getElementById("tripType").value = "One Way";
  document.getElementById("cabinClass").value = "Economy";
  document.querySelectorAll(".addon").forEach(addon => (addon.checked = false));
  document.getElementById("ticketOutput").innerHTML = "";
  goToStep(1);
}

/* FIXED MANAGE BOOKING SECTION */
function initManageBookingPage() {
  const bookingHistory = document.getElementById("bookingHistory");
  if (!bookingHistory) return;

  migrateOldBookings();
  renderBookingHistory();

  const search = document.getElementById("bookingSearch");
  if (search) {
    search.addEventListener("input", () => renderBookingHistory(search.value));
  }

  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
      if (!confirm("Clear all saved bookings?")) return;
      localStorage.removeItem(STORAGE_KEY);
      renderBookingHistory();
      const preview = document.getElementById("ticketPreview");
      if (preview) preview.innerHTML = "";
    });
  }
}

function renderBookingHistory(filter = "") {
  const bookingHistory = document.getElementById("bookingHistory");
  if (!bookingHistory) return;

  const searchTerm = filter.trim().toLowerCase();
  const bookings = getBookings();

  const filteredBookings = bookings.filter(booking => {
    const searchableText = [
      booking.reference,
      booking.status,
      booking.passenger.fullName,
      booking.passenger.email,
      booking.flight.flightNo,
      booking.flight.from,
      booking.flight.to,
      booking.seat
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchTerm);
  });

  if (!filteredBookings.length) {
    bookingHistory.innerHTML = `
      <div class="empty-state">
        <strong>No bookings found.</strong>
        <p>After a booking is confirmed, it will appear here automatically.</p>
      </div>
    `;
    return;
  }

  bookingHistory.innerHTML = "";

  filteredBookings.slice().reverse().forEach(booking => {
    const item = document.createElement("article");
    item.className = "history-item";
    item.innerHTML = `
      <div>
        <h3>${escapeHTML(booking.reference)} • ${escapeHTML(booking.flight.from)} → ${escapeHTML(booking.flight.to)}</h3>
        <p>${escapeHTML(booking.passenger.fullName)} • ${escapeHTML(booking.flight.flightNo)} • Seat ${escapeHTML(booking.seat)} • $${booking.total}</p>
        <p>${escapeHTML(booking.search.date)} • ${escapeHTML(booking.flight.depart)} to ${escapeHTML(booking.flight.arrive)}</p>
        <p>Booked on ${escapeHTML(booking.createdAt)}</p>
        <span class="badge ${booking.status === "Cancelled" ? "cancelled" : ""}">${escapeHTML(booking.status)}</span>
      </div>
      <div class="history-actions">
        <button class="secondary-btn" type="button" data-view="${escapeHTML(booking.reference)}">View Ticket</button>
        ${
          booking.status === "Confirmed"
            ? `<button class="danger-btn" type="button" data-cancel="${escapeHTML(booking.reference)}">Cancel</button>`
            : ""
        }
      </div>
    `;

    item.querySelector("[data-view]").addEventListener("click", () => {
      renderTicket(booking, "ticketPreview");
      const preview = document.getElementById("ticketPreview");
      if (preview) preview.scrollIntoView({ behavior: "smooth" });
    });

    const cancelBtn = item.querySelector("[data-cancel]");
    if (cancelBtn) cancelBtn.addEventListener("click", () => cancelBooking(booking.reference));

    bookingHistory.appendChild(item);
  });
}

function cancelBooking(reference) {
  if (!confirm(`Cancel booking ${reference}?`)) return;

  const bookings = getBookings().map(booking => {
    if (booking.reference === reference) {
      return { ...booking, status: "Cancelled" };
    }
    return booking;
  });

  saveBookings(bookings);
  renderBookingHistory(document.getElementById("bookingSearch")?.value || "");
}

function renderTicket(booking, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  target.innerHTML = `
    <div class="ticket">
      <div class="ticket-head">
        <div>
          <span>Booking Reference</span>
          <strong>${escapeHTML(booking.reference)}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>${escapeHTML(booking.status)}</strong>
        </div>
      </div>
      <div class="ticket-body">
        <div><small>Passenger</small><strong>${escapeHTML(booking.passenger.fullName)}</strong></div>
        <div><small>Flight</small><strong>${escapeHTML(booking.flight.flightNo)}</strong></div>
        <div><small>Route</small><strong>${escapeHTML(booking.flight.from)} → ${escapeHTML(booking.flight.to)}</strong></div>
        <div><small>Date</small><strong>${escapeHTML(booking.search.date)}</strong></div>
        <div><small>Seat</small><strong>${escapeHTML(booking.seat)}</strong></div>
        <div><small>Total Paid</small><strong>$${booking.total}</strong></div>
      </div>
    </div>
  `;
}

/* STORAGE HELPERS */
function getBookings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    if (!Array.isArray(saved)) return [];

    const normalised = saved.map(normalizeBooking).filter(Boolean);
    return normalised;
  } catch (error) {
    console.error("Could not read booking history:", error);
    return [];
  }
}

function saveBookings(bookings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings.map(normalizeBooking).filter(Boolean)));
}

function normalizeBooking(booking) {
  if (!booking || typeof booking !== "object") return null;

  const flight = booking.flight || {};
  const passenger = booking.passenger || {};

  return {
    reference: booking.reference || generateReference(),
    status: booking.status || "Confirmed",
    createdAt: booking.createdAt || booking.date || new Date().toLocaleString(),
    search: {
      from: booking.search?.from || flight.from || "",
      to: booking.search?.to || flight.to || "",
      date: booking.search?.date || booking.departureDate || "Not recorded",
      tripType: booking.search?.tripType || booking.tripType || "One Way",
      passengers: booking.search?.passengers || booking.passengers || 1,
      cabin: booking.search?.cabin || booking.cabinClass || "Economy"
    },
    passenger: {
      fullName: passenger.fullName || passenger.name || booking.fullName || "Passenger",
      email: passenger.email || booking.email || "Not recorded",
      phone: passenger.phone || booking.phone || "Not recorded",
      passport: passenger.passport || booking.passport || "Not recorded",
      nationality: passenger.nationality || booking.nationality || "Not recorded",
      dob: passenger.dob || booking.dob || "Not recorded"
    },
    flight: {
      id: flight.id || booking.flightId || "",
      flightNo: flight.flightNo || booking.flightNo || "Not recorded",
      from: flight.from || booking.from || "Not recorded",
      to: flight.to || booking.to || "Not recorded",
      depart: flight.depart || booking.depart || "Not recorded",
      arrive: flight.arrive || booking.arrive || "Not recorded",
      duration: flight.duration || booking.duration || "Not recorded",
      aircraft: flight.aircraft || booking.aircraft || "Not recorded",
      price: Number(flight.price || booking.price || 0),
      status: flight.status || "On Time"
    },
    seat: booking.seat || "Not selected",
    addons: Array.isArray(booking.addons) ? booking.addons : [],
    total: Number(booking.total || 0)
  };
}

function migrateOldBookings() {
  const current = getBookings();

  const possibleOldKeys = [
    "flyDreamBookings",
    "flydreamBookings",
    "bookings",
    "bookingHistory"
  ];

  let merged = [...current];

  possibleOldKeys.forEach(key => {
    if (key === STORAGE_KEY) return;

    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(data)) {
        merged = merged.concat(data.map(normalizeBooking).filter(Boolean));
      }
    } catch (error) {
      // Ignore invalid old keys.
    }
  });

  const unique = [];
  const seen = new Set();

  merged.forEach(booking => {
    if (!seen.has(booking.reference)) {
      seen.add(booking.reference);
      unique.push(booking);
    }
  });

  saveBookings(unique);
}

function initFlightStatusPage() {
  const form = document.getElementById("statusForm");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    showFlightStatus(document.getElementById("statusFlightNo").value);
  });

  document.querySelectorAll("[data-flight-code]").forEach(button => {
    button.addEventListener("click", () => {
      document.getElementById("statusFlightNo").value = button.dataset.flightCode;
      showFlightStatus(button.dataset.flightCode);
    });
  });
}

function showFlightStatus(code) {
  const result = document.getElementById("statusResult");
  const flight = flights.find(item => item.flightNo.toLowerCase() === code.trim().toLowerCase());

  if (!flight) {
    result.innerHTML = `<p class="empty-state">No flight found for this flight number.</p>`;
    return;
  }

  result.innerHTML = `
    <div class="status-card">
      <h3>${flight.flightNo} • ${flight.status}</h3>
      <p><strong>Route:</strong> ${flight.from} → ${flight.to}</p>
      <p><strong>Departure:</strong> ${flight.depart}</p>
      <p><strong>Arrival:</strong> ${flight.arrive}</p>
      <p><strong>Aircraft:</strong> ${flight.aircraft}</p>
      <p><strong>Duration:</strong> ${flight.duration}</p>
    </div>
  `;
}

function initContactPage() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    document.getElementById("contactResponse").textContent = "Thank you. Your enquiry has been submitted.";
    form.reset();
  });
}

function generateReference() {
  return `FDA-${Math.floor(100000 + Math.random() * 900000)}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setMinTravelDate(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  input.min = `${yyyy}-${mm}-${dd}`;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
