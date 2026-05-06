const flights = [
  {
    id: 1,
    flightNo: "FDA101",
    from: "Sydney",
    to: "Melbourne",
    depart: "08:30 AM",
    arrive: "10:05 AM",
    duration: "1h 35m",
    aircraft: "Airbus A320",
    price: 220
  },
  {
    id: 2,
    flightNo: "FDA202",
    from: "Sydney",
    to: "Singapore",
    depart: "10:45 AM",
    arrive: "05:30 PM",
    duration: "8h 45m",
    aircraft: "Boeing 787",
    price: 780
  },
  {
    id: 3,
    flightNo: "FDA303",
    from: "Melbourne",
    to: "Brisbane",
    depart: "01:15 PM",
    arrive: "03:25 PM",
    duration: "2h 10m",
    aircraft: "Boeing 737",
    price: 290
  },
  {
    id: 4,
    flightNo: "FDA404",
    from: "Sydney",
    to: "Dhaka",
    depart: "09:20 PM",
    arrive: "06:10 AM",
    duration: "13h 50m",
    aircraft: "Boeing 777",
    price: 1150
  },
  {
    id: 5,
    flightNo: "FDA505",
    from: "Brisbane",
    to: "Sydney",
    depart: "06:00 PM",
    arrive: "07:35 PM",
    duration: "1h 35m",
    aircraft: "Airbus A321",
    price: 260
  }
];

let selectedFlight = null;
let selectedSeat = null;

const searchForm = document.getElementById("searchForm");
const flightResults = document.getElementById("flightResults");
const seatMap = document.getElementById("seatMap");
const selectedSeatText = document.getElementById("selectedSeatText");
const summaryBox = document.getElementById("summaryBox");
const confirmBookingBtn = document.getElementById("confirmBookingBtn");
const bookingHistory = document.getElementById("bookingHistory");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

searchForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const fromCity = document.getElementById("fromCity").value;
  const toCity = document.getElementById("toCity").value;

  if (fromCity === toCity) {
    alert("From and To cities cannot be the same.");
    return;
  }

  const matchedFlights = flights.filter(
    flight => flight.from === fromCity && flight.to === toCity
  );

  displayFlights(matchedFlights);
});

function displayFlights(matchedFlights) {
  flightResults.innerHTML = "";

  if (matchedFlights.length === 0) {
    flightResults.innerHTML = `
      <div class="empty-box">
        No flights found for this route. Please try another route.
      </div>
    `;
    return;
  }

  matchedFlights.forEach(flight => {
    const card = document.createElement("div");
    card.className = "flight-card";

    card.innerHTML = `
      <div>
        <h3>${flight.flightNo}: ${flight.from} → ${flight.to}</h3>
        <p><strong>Aircraft:</strong> ${flight.aircraft}</p>
        <p><strong>Duration:</strong> ${flight.duration}</p>
      </div>

      <div>
        <p><strong>Depart:</strong> ${flight.depart}</p>
        <p><strong>Arrive:</strong> ${flight.arrive}</p>
        <p class="flight-price">$${flight.price}</p>
      </div>

      <button class="primary-btn" onclick="selectFlight(${flight.id})">
        Select Flight
      </button>
    `;

    flightResults.appendChild(card);
  });
}

function selectFlight(id) {
  selectedFlight = flights.find(flight => flight.id === id);
  selectedSeat = null;

  document.querySelectorAll(".addon").forEach(addon => {
    addon.checked = false;
  });

  createSeatMap();
  updateSummary();

  document.getElementById("booking").scrollIntoView({
    behavior: "smooth"
  });
}

function createSeatMap() {
  seatMap.innerHTML = "";

  const seats = [
    "A1", "A2", "A3", "A4",
    "B1", "B2", "B3", "B4",
    "C1", "C2", "C3", "C4",
    "D1", "D2", "D3", "D4"
  ];

  const bookedSeats = ["A2", "B3", "C1"];

  seats.forEach(seat => {
    const button = document.createElement("button");
    button.textContent = seat;
    button.className = "seat";

    if (bookedSeats.includes(seat)) {
      button.classList.add("booked");
      button.disabled = true;
    }

    button.addEventListener("click", function () {
      if (button.classList.contains("booked")) return;

      document.querySelectorAll(".seat").forEach(s => {
        s.classList.remove("selected");
      });

      button.classList.add("selected");
      selectedSeat = seat;
      selectedSeatText.textContent = `Selected Seat: ${seat}`;
      updateSummary();
    });

    seatMap.appendChild(button);
  });

  selectedSeatText.textContent = "No seat selected";
}

document.querySelectorAll(".addon").forEach(addon => {
  addon.addEventListener("change", updateSummary);
});

function getSelectedAddons() {
  const selectedAddons = [];

  document.querySelectorAll(".addon:checked").forEach(addon => {
    selectedAddons.push({
      name: addon.value,
      price: Number(addon.dataset.price)
    });
  });

  return selectedAddons;
}

function calculateTotal() {
  if (!selectedFlight) return 0;

  const passengerCount = Number(document.getElementById("passengers").value);
  const cabinClass = document.getElementById("cabinClass").value;
  const tripType = document.getElementById("tripType").value;
  const addons = getSelectedAddons();

  let basePrice = selectedFlight.price;

  if (cabinClass === "Business") {
    basePrice *= 1.8;
  }

  if (cabinClass === "First Class") {
    basePrice *= 2.6;
  }

  if (tripType === "Return") {
    basePrice *= 2;
  }

  let total = basePrice * passengerCount;

  addons.forEach(addon => {
    total += addon.price;
  });

  return Math.round(total);
}

function updateSummary() {
  if (!selectedFlight) {
    summaryBox.innerHTML = `<p>No flight selected yet.</p>`;
    return;
  }

  const passengerCount = document.getElementById("passengers").value;
  const cabinClass = document.getElementById("cabinClass").value;
  const tripType = document.getElementById("tripType").value;
  const departureDate = document.getElementById("departureDate").value;
  const addons = getSelectedAddons();
  const total = calculateTotal();

  summaryBox.innerHTML = `
    <p><strong>Flight:</strong> ${selectedFlight.flightNo}</p>
    <p><strong>Route:</strong> ${selectedFlight.from} → ${selectedFlight.to}</p>
    <p><strong>Date:</strong> ${departureDate || "Not selected"}</p>
    <p><strong>Trip Type:</strong> ${tripType}</p>
    <p><strong>Cabin:</strong> ${cabinClass}</p>
    <p><strong>Passengers:</strong> ${passengerCount}</p>
    <p><strong>Seat:</strong> ${selectedSeat || "Not selected"}</p>
    <p><strong>Add-ons:</strong> ${
      addons.length ? addons.map(addon => addon.name).join(", ") : "None"
    }</p>
    <p class="flight-price"><strong>Total:</strong> $${total}</p>
  `;
}

document.getElementById("passengers").addEventListener("input", updateSummary);
document.getElementById("cabinClass").addEventListener("change", updateSummary);
document.getElementById("tripType").addEventListener("change", updateSummary);

confirmBookingBtn.addEventListener("click", function () {
  if (!selectedFlight) {
    alert("Please select a flight first.");
    return;
  }

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const passport = document.getElementById("passport").value.trim();
  const nationality = document.getElementById("nationality").value.trim();

  if (!fullName || !email || !phone || !passport || !nationality) {
    alert("Please complete all passenger details.");
    return;
  }

  if (!selectedSeat) {
    alert("Please select a seat.");
    return;
  }

  const booking = {
    reference: generateBookingReference(),
    passenger: {
      fullName,
      email,
      phone,
      passport,
      nationality
    },
    flight: selectedFlight,
    seat: selectedSeat,
    addons: getSelectedAddons(),
    total: calculateTotal(),
    date: new Date().toLocaleString()
  };

  saveBooking(booking);

  alert(`Booking confirmed! Reference: ${booking.reference}`);

  displayBookingHistory();
});

function generateBookingReference() {
  return "FDA-" + Math.floor(100000 + Math.random() * 900000);
}

function saveBooking(booking) {
  const bookings = JSON.parse(localStorage.getItem("flyDreamBookings")) || [];
  bookings.push(booking);
  localStorage.setItem("flyDreamBookings", JSON.stringify(bookings));
}

function displayBookingHistory() {
  const bookings = JSON.parse(localStorage.getItem("flyDreamBookings")) || [];

  if (bookings.length === 0) {
    bookingHistory.innerHTML = `<p>No bookings saved yet.</p>`;
    return;
  }

  bookingHistory.innerHTML = "";

  bookings.slice().reverse().forEach(booking => {
    const item = document.createElement("div");
    item.className = "history-item";

    item.innerHTML = `
      <h3>Booking Ref: ${booking.reference}</h3>
      <p><strong>Name:</strong> ${booking.passenger.fullName}</p>
      <p><strong>Flight:</strong> ${booking.flight.flightNo}</p>
      <p><strong>Route:</strong> ${booking.flight.from} → ${booking.flight.to}</p>
      <p><strong>Seat:</strong> ${booking.seat}</p>
      <p><strong>Total:</strong> $${booking.total}</p>
      <p><strong>Booked On:</strong> ${booking.date}</p>
    `;

    bookingHistory.appendChild(item);
  });
}

clearHistoryBtn.addEventListener("click", function () {
  const confirmClear = confirm("Are you sure you want to clear all booking history?");

  if (confirmClear) {
    localStorage.removeItem("flyDreamBookings");
    displayBookingHistory();
  }
});

displayBookingHistory();