const flights = [
  { id: 1, flightNo: "FDA101", from: "Sydney", to: "Melbourne", depart: "08:30 AM", arrive: "10:05 AM", duration: "1h 35m", aircraft: "Airbus A320", price: 220 },
  { id: 2, flightNo: "FDA102", from: "Sydney", to: "Melbourne", depart: "04:20 PM", arrive: "05:55 PM", duration: "1h 35m", aircraft: "Boeing 737", price: 245 },
  { id: 3, flightNo: "FDA202", from: "Sydney", to: "Singapore", depart: "10:45 AM", arrive: "05:30 PM", duration: "8h 45m", aircraft: "Boeing 787", price: 780 },
  { id: 4, flightNo: "FDA203", from: "Singapore", to: "Sydney", depart: "09:00 AM", arrive: "07:45 PM", duration: "7h 45m", aircraft: "Boeing 787", price: 820 },
  { id: 5, flightNo: "FDA303", from: "Melbourne", to: "Brisbane", depart: "01:15 PM", arrive: "03:25 PM", duration: "2h 10m", aircraft: "Boeing 737", price: 290 },
  { id: 6, flightNo: "FDA304", from: "Brisbane", to: "Melbourne", depart: "02:30 PM", arrive: "05:00 PM", duration: "2h 30m", aircraft: "Boeing 737", price: 310 },
  { id: 7, flightNo: "FDA404", from: "Sydney", to: "Dhaka", depart: "09:20 PM", arrive: "06:10 AM", duration: "13h 50m", aircraft: "Boeing 777", price: 1150 },
  { id: 8, flightNo: "FDA405", from: "Dhaka", to: "Sydney", depart: "11:45 PM", arrive: "04:20 PM", duration: "14h 35m", aircraft: "Boeing 777", price: 1180 },
  { id: 9, flightNo: "FDA505", from: "Brisbane", to: "Sydney", depart: "06:00 PM", arrive: "07:35 PM", duration: "1h 35m", aircraft: "Airbus A321", price: 260 },
  { id: 10, flightNo: "FDA506", from: "Sydney", to: "Brisbane", depart: "07:15 AM", arrive: "08:45 AM", duration: "1h 30m", aircraft: "Airbus A320", price: 250 },
  { id: 11, flightNo: "FDA606", from: "Melbourne", to: "Sydney", depart: "11:00 AM", arrive: "12:35 PM", duration: "1h 35m", aircraft: "Airbus A320", price: 240 },
  { id: 12, flightNo: "FDA707", from: "Melbourne", to: "Singapore", depart: "08:45 PM", arrive: "02:50 AM", duration: "8h 05m", aircraft: "Boeing 787", price: 760 },
  { id: 13, flightNo: "FDA808", from: "Singapore", to: "Melbourne", depart: "11:30 PM", arrive: "09:20 AM", duration: "7h 50m", aircraft: "Boeing 787", price: 790 },
  { id: 14, flightNo: "FDA909", from: "Brisbane", to: "Singapore", depart: "12:10 PM", arrive: "06:40 PM", duration: "8h 30m", aircraft: "Airbus A330", price: 735 },
  { id: 15, flightNo: "FDA910", from: "Singapore", to: "Brisbane", depart: "07:45 PM", arrive: "05:35 AM", duration: "7h 50m", aircraft: "Airbus A330", price: 755 },
  { id: 16, flightNo: "FDA111", from: "Dhaka", to: "Singapore", depart: "03:20 PM", arrive: "09:25 PM", duration: "4h 05m", aircraft: "Airbus A321", price: 430 },
  { id: 17, flightNo: "FDA112", from: "Singapore", to: "Dhaka", depart: "01:25 PM", arrive: "03:10 PM", duration: "3h 45m", aircraft: "Airbus A321", price: 450 }
];

const state = {
  step: 1,
  search: {},
  results: [],
  selectedFlight: null,
  selectedSeat: null,
  lastBooking: null
};

const stepIds = {
  1: "stepSearch",
  2: "stepFlights",
  3: "stepPassenger",
  4: "stepSeats",
  5: "stepReview",
  6: "stepConfirm"
};

const searchForm = document.getElementById("searchForm");
const flightResults = document.getElementById("flightResults");
const routeSummary = document.getElementById("routeSummary");
const seatMap = document.getElementById("seatMap");
const selectedSeatText = document.getElementById("selectedSeatText");
const reviewDetails = document.getElementById("reviewDetails");
const totalPrice = document.getElementById("totalPrice");
const bookingHistory = document.getElementById("bookingHistory");
const ticketOutput = document.getElementById("ticketOutput");

searchForm.addEventListener("submit", handleSearch);
document.getElementById("changeSearchBtn").addEventListener("click", () => goToStep(1));
document.getElementById("continueToSeatsBtn").addEventListener("click", handlePassengerContinue);
document.getElementById("continueToReviewBtn").addEventListener("click", handleReviewContinue);
document.getElementById("confirmBookingBtn").addEventListener("click", confirmBooking);
document.getElementById("newBookingBtn").addEventListener("click", resetBookingFlow);
document.getElementById("goManageBtn").addEventListener("click", () => {
  document.getElementById("manageBookings").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("viewBookingsBtn").addEventListener("click", () => {
  document.getElementById("manageBookings").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("clearHistoryBtn").addEventListener("click", clearHistory);

document.querySelectorAll("[data-go-step]").forEach(button => {
  button.addEventListener("click", () => goToStep(Number(button.dataset.goStep)));
});

document.querySelectorAll(".addon").forEach(addon => {
  addon.addEventListener("change", updateReview);
});

["passengers", "cabinClass", "tripType", "departureDate"].forEach(id => {
  document.getElementById(id).addEventListener("change", () => {
    updateReview();
  });
});

function handleSearch(event) {
  event.preventDefault();

  const from = document.getElementById("fromCity").value;
  const to = document.getElementById("toCity").value;
  const date = document.getElementById("departureDate").value;
  const tripType = document.getElementById("tripType").value;
  const passengers = Number(document.getElementById("passengers").value);
  const cabin = document.getElementById("cabinClass").value;

  if (!from || !to || !date) {
    showMessage("Please complete the route and departure date.");
    return;
  }

  if (from === to) {
    showMessage("Departure and arrival cities cannot be the same.");
    return;
  }

  state.search = { from, to, date, tripType, passengers, cabin };
  state.selectedFlight = null;
  state.selectedSeat = null;
  state.results = flights.filter(flight => flight.from === from && flight.to === to);

  routeSummary.textContent = `${from} to ${to} • ${date} • ${tripType} • ${passengers} passenger(s) • ${cabin}`;
  renderFlights();
  goToStep(2);
}

function renderFlights() {
  flightResults.innerHTML = "";

  if (!state.results.length) {
    flightResults.innerHTML = `
      <div class="empty-state">
        No matching flights were found for this route. Please change your search criteria.
      </div>
    `;
    return;
  }

  state.results.forEach(flight => {
    const card = document.createElement("article");
    card.className = "flight-card";

    card.innerHTML = `
      <div class="flight-route">
        <strong>${flight.from} → ${flight.to}</strong>
        <span>${flight.flightNo} • ${flight.aircraft} • ${flight.duration}</span>
      </div>

      <div class="flight-times">
        <div>
          <small>Depart</small>
          <strong>${flight.depart}</strong>
        </div>
        <div class="flight-line"></div>
        <div>
          <small>Arrive</small>
          <strong>${flight.arrive}</strong>
        </div>
      </div>

      <div class="flight-price">
        <strong>$${flight.price}</strong>
        <button class="primary-btn" type="button" data-flight-id="${flight.id}">Select</button>
      </div>
    `;

    card.querySelector("button").addEventListener("click", () => selectFlight(flight.id));
    flightResults.appendChild(card);
  });
}

function selectFlight(id) {
  state.selectedFlight = flights.find(flight => flight.id === id);
  state.selectedSeat = null;
  selectedSeatText.textContent = "No seat selected";
  document.querySelectorAll(".addon").forEach(addon => (addon.checked = false));
  createSeatMap();
  updateReview();
  goToStep(3);
}

function handlePassengerContinue() {
  const passenger = getPassenger();

  if (!passenger.fullName || !passenger.email || !passenger.phone || !passenger.passport || !passenger.nationality || !passenger.dob) {
    showMessage("Please complete all passenger information before continuing.");
    return;
  }

  if (!isValidEmail(passenger.email)) {
    showMessage("Please enter a valid email address.");
    return;
  }

  updateReview();
  goToStep(4);
}

function handleReviewContinue() {
  if (!state.selectedSeat) {
    showMessage("Please select a seat before reviewing your booking.");
    return;
  }

  updateReview();
  goToStep(5);
}

function createSeatMap() {
  seatMap.innerHTML = "";

  const rows = ["A", "B", "C", "D", "E", "F"];
  const bookedSeats = ["A2", "B4", "C1", "D5", "E3", "F6"];

  rows.forEach(row => {
    for (let col = 1; col <= 6; col++) {
      const seat = `${row}${col}`;
      const button = document.createElement("button");
      button.className = "seat";
      button.textContent = seat;
      button.type = "button";

      if (bookedSeats.includes(seat)) {
        button.classList.add("booked");
        button.disabled = true;
      }

      button.addEventListener("click", () => {
        document.querySelectorAll(".seat").forEach(item => item.classList.remove("selected"));
        button.classList.add("selected");
        state.selectedSeat = seat;
        selectedSeatText.textContent = `Selected Seat: ${seat}`;
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
  if (!state.selectedFlight) return 0;

  const passengers = Number(document.getElementById("passengers").value || 1);
  const cabin = document.getElementById("cabinClass").value;
  const tripType = document.getElementById("tripType").value;
  const addons = getSelectedAddons();

  let base = state.selectedFlight.price;

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
  if (!state.selectedFlight) return;

  const passenger = getPassenger();
  const addons = getSelectedAddons();
  const total = calculateTotal();

  totalPrice.textContent = `$${total}`;

  reviewDetails.innerHTML = `
    ${reviewRow("Passenger", passenger.fullName || "Not completed")}
    ${reviewRow("Email", passenger.email || "Not completed")}
    ${reviewRow("Flight", `${state.selectedFlight.flightNo} • ${state.selectedFlight.aircraft}`)}
    ${reviewRow("Route", `${state.selectedFlight.from} → ${state.selectedFlight.to}`)}
    ${reviewRow("Departure Date", document.getElementById("departureDate").value || "Not selected")}
    ${reviewRow("Time", `${state.selectedFlight.depart} → ${state.selectedFlight.arrive}`)}
    ${reviewRow("Trip Type", document.getElementById("tripType").value)}
    ${reviewRow("Cabin", document.getElementById("cabinClass").value)}
    ${reviewRow("Passengers", document.getElementById("passengers").value)}
    ${reviewRow("Seat", state.selectedSeat || "Not selected")}
    ${reviewRow("Add-ons", addons.length ? addons.map(addon => addon.name).join(", ") : "None")}
    ${reviewRow("Total", `$${total}`)}
  `;
}

function reviewRow(label, value) {
  return `
    <div class="review-row">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function confirmBooking() {
  if (!state.selectedFlight) {
    showMessage("Please select a flight first.");
    return;
  }

  if (!state.selectedSeat) {
    showMessage("Please select a seat first.");
    return;
  }

  const passenger = getPassenger();

  if (!passenger.fullName || !passenger.email || !passenger.phone || !passenger.passport || !passenger.nationality || !passenger.dob) {
    showMessage("Please complete passenger information.");
    return;
  }

  const booking = {
    reference: generateReference(),
    status: "Confirmed",
    createdAt: new Date().toLocaleString(),
    search: { ...state.search },
    passenger,
    flight: { ...state.selectedFlight },
    seat: state.selectedSeat,
    addons: getSelectedAddons(),
    total: calculateTotal()
  };

  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem("flyDreamBookings", JSON.stringify(bookings));

  state.lastBooking = booking;
  renderTicket(booking);
  renderBookingHistory();
  goToStep(6);
}

function renderTicket(booking) {
  ticketOutput.innerHTML = `
    <div class="ticket-head">
      <div>
        <span>Booking Reference</span>
        <strong>${booking.reference}</strong>
      </div>
      <div>
        <span>Status</span>
        <strong>${booking.status}</strong>
      </div>
    </div>
    <div class="ticket-body">
      <div>
        <small>Passenger</small>
        <strong>${booking.passenger.fullName}</strong>
      </div>
      <div>
        <small>Flight</small>
        <strong>${booking.flight.flightNo}</strong>
      </div>
      <div>
        <small>Route</small>
        <strong>${booking.flight.from} → ${booking.flight.to}</strong>
      </div>
      <div>
        <small>Date</small>
        <strong>${booking.search.date}</strong>
      </div>
      <div>
        <small>Seat</small>
        <strong>${booking.seat}</strong>
      </div>
      <div>
        <small>Total Paid</small>
        <strong>$${booking.total}</strong>
      </div>
    </div>
  `;
}

function renderBookingHistory() {
  const bookings = getBookings();

  if (!bookings.length) {
    bookingHistory.innerHTML = `<p class="empty-state">No bookings saved yet.</p>`;
    return;
  }

  bookingHistory.innerHTML = "";

  bookings
    .slice()
    .reverse()
    .forEach(booking => {
      const item = document.createElement("article");
      item.className = "history-item";

      item.innerHTML = `
        <div>
          <h4>${booking.reference} • ${booking.flight.from} → ${booking.flight.to}</h4>
          <p>${booking.passenger.fullName} • ${booking.flight.flightNo} • Seat ${booking.seat} • $${booking.total}</p>
          <p>Booked on ${booking.createdAt}</p>
          <span class="badge ${booking.status === "Cancelled" ? "cancelled" : ""}">${booking.status}</span>
        </div>
        <div class="history-actions">
          <button class="secondary-btn" type="button" data-view="${booking.reference}">View</button>
          ${
            booking.status === "Confirmed"
              ? `<button class="danger-btn" type="button" data-cancel="${booking.reference}">Cancel</button>`
              : ""
          }
        </div>
      `;

      const viewButton = item.querySelector("[data-view]");
      viewButton.addEventListener("click", () => {
        renderTicket(booking);
        goToStep(6);
        document.getElementById("bookingApp").scrollIntoView({ behavior: "smooth" });
      });

      const cancelButton = item.querySelector("[data-cancel]");
      if (cancelButton) {
        cancelButton.addEventListener("click", () => cancelBooking(booking.reference));
      }

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

  localStorage.setItem("flyDreamBookings", JSON.stringify(bookings));
  renderBookingHistory();
}

function clearHistory() {
  if (!confirm("Clear all saved bookings from this browser?")) return;
  localStorage.removeItem("flyDreamBookings");
  renderBookingHistory();
}

function getBookings() {
  return JSON.parse(localStorage.getItem("flyDreamBookings")) || [];
}

function generateReference() {
  return `FDA-${Math.floor(100000 + Math.random() * 900000)}`;
}

function resetBookingFlow() {
  state.step = 1;
  state.search = {};
  state.results = [];
  state.selectedFlight = null;
  state.selectedSeat = null;
  state.lastBooking = null;

  searchForm.reset();
  document.getElementById("passengers").value = 1;
  document.getElementById("tripType").value = "One Way";
  document.getElementById("cabinClass").value = "Economy";
  document.getElementById("passengerForm").reset();
  document.querySelectorAll(".addon").forEach(addon => (addon.checked = false));
  seatMap.innerHTML = "";
  selectedSeatText.textContent = "No seat selected";
  reviewDetails.innerHTML = "";
  totalPrice.textContent = "$0";
  ticketOutput.innerHTML = "";

  goToStep(1);
  document.getElementById("bookingApp").scrollIntoView({ behavior: "smooth" });
}

function goToStep(step) {
  state.step = step;

  Object.entries(stepIds).forEach(([number, id]) => {
    document.getElementById(id).classList.toggle("active", Number(number) === step);
  });

  document.querySelectorAll(".progress-step").forEach((item, index) => {
    const current = index + 1;
    item.classList.toggle("active", current === step);
    item.classList.toggle("done", current < step);
  });
}

function showMessage(message) {
  alert(message);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

renderBookingHistory();
goToStep(1);
