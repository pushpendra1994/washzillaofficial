import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { hasSupabaseConfig, supabaseConfig } from "./supabase-config.js?v=2026-06-09-3";
import { hasSheetsConfig, sheetsConfig } from "./sheets-config.js?v=2026-06-09-3";

const phoneNumber = "917398233605";          // Primary  — Q&A, general WhatsApp, top "Book Now" CTA
const bookingPhoneNumber = "917398233605";   // Primary recipient of booking submissions
const bookingCopyNumber = "917869697297";    // Secondary copy of every booking submission

const defaultMessage =
  "Hello WashZilla, I would like to book a vehicle wash.%0A%0AFull Name:%0AMobile Number:%0AVehicle Number:%0APickup %26 Drop:%0APickup Address:%0APreferred Date:%0APreferred Time:%0ANotes:%0A%0APlease confirm availability.%0A%0A(WashZilla, Near Tiya Vani Multispeciality Hospital, IIIT CAP. Dhyan Chandra Chowraha, SJ Academy Gali, Prayagraj %E2%80%93 211015)";

const whatsAppUrl = (message = defaultMessage, number = phoneNumber) =>
  `https://wa.me/${phoneNumber}?text=${message}`;

const supabase = hasSupabaseConfig
  ? createClient(supabaseConfig.url, supabaseConfig.anonKey)
  : null;

// Fire-and-forget POST to the Google Apps Script web app.
// Using `text/plain` + `no-cors` avoids a CORS preflight so the request
// works from a file:// / static site without any backend.
const sendToGoogleSheet = (payload) => {
  if (!hasSheetsConfig) return Promise.resolve({ skipped: true });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  return fetch(sheetsConfig.webAppUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ ...payload, source: "website" }),
    keepalive: true,
    signal: controller.signal,
  })
    .then(() => ({ ok: true }))
    .catch((err) => {
      console.error("Google Sheet save failed:", err);
      return { ok: false, error: err };
    })
    .finally(() => clearTimeout(timeoutId));
};

const statusNode = document.querySelector("#booking-status");
const submitButton = document.querySelector("#booking-submit");

const setStatus = (message, tone = "neutral") => {
  statusNode.textContent = message;
  statusNode.dataset.tone = tone;
  // Keep the message in view so the user always sees what happened.
  if (message) {
    try {
      statusNode.scrollIntoView({ block: "center", behavior: "smooth" });
    } catch (_) {
      /* older browsers */
    }
  }
};

const buildBookingPayload = () => {
  const customerName = document.querySelector("#customer-name").value.trim();
  const customerPhone = document.querySelector("#customer-phone").value.trim();
  const vehicleNumber = document.querySelector("#vehicle-number").value.trim().toUpperCase();
  const pickup = document.querySelector("#pickup").value;
  const address = document.querySelector("#address").value.trim();
  const date = document.querySelector("#date").value;
  const time = document.querySelector("#time").value;
  const notes = document.querySelector("#notes").value.trim();

  return {
    customerName,
    customerPhone,
    vehicleNumber,
    pickup,
    address,
    date,
    time,
    notes,
  };
};

const buildWhatsAppMessage = ({
  customerName,
  customerPhone,
  vehicleNumber,
  pickup,
  address,
  date,
  time,
  notes,
}) =>
  encodeURIComponent(
    `Hello WashZilla, I would like to book a vehicle wash.\n\n` +
      `Full Name: ${customerName}\n` +
      `Mobile Number: ${customerPhone}\n` +
      `Vehicle Number: ${vehicleNumber}\n` +
      `Pickup & Drop: ${pickup}\n` +
      `Pickup Address: ${address || "—"}\n` +
      `Preferred Date: ${date}\n` +
      `Preferred Time: ${time}\n` +
      `Notes: ${notes || "None"}\n\n` +
      `Please confirm availability.\n\n` +
      `(WashZilla, Near Tiya Vani Multispeciality Hospital, IIIT CAP. Dhyan Chandra Chowraha, SJ Academy Gali, Prayagraj – 211015)`
  );

// Helper: scroll to booking form, focus first field, optionally prefill notes.
const focusBookingForm = (prefilledNote) => {
  const form = document.querySelector("#booking-form");
  if (!form) return;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  // Brief highlight so the user notices we jumped there.
  form.classList.add("booking-form--focus");
  setTimeout(() => form.classList.remove("booking-form--focus"), 2200);
  if (prefilledNote) {
    const notesField = document.querySelector("#notes");
    if (notesField && !notesField.value) {
      notesField.value = prefilledNote;
    }
  }
  setTimeout(() => {
    const nameField = document.querySelector("#customer-name");
    if (nameField && !nameField.value) nameField.focus();
  }, 600);
};

// Q&A WhatsApp buttons keep their direct behavior. Booking buttons funnel
// through the form so we can save to Supabase + Google Sheets first.
document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  if (link.dataset.intent === "qa") {
    // Keep direct WhatsApp link for general questions.
    link.href = whatsAppUrl();
    return;
  }
  // Booking-intent button → scroll to form instead of opening WhatsApp.
  link.href = "#booking";
  link.addEventListener("click", (event) => {
    event.preventDefault();
    focusBookingForm();
  });
});

document.querySelectorAll("[data-service]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    focusBookingForm(`Service requested: ${link.dataset.service}`);
  });
});

document.querySelectorAll("[data-plan]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    focusBookingForm(`Plan interest: ${link.dataset.plan}`);
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const header = document.querySelector(".site-header");

menuToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".site-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const dateInput = document.querySelector("#date");
const today = new Date().toISOString().split("T")[0];
dateInput.min = today;
dateInput.value = today;

// Open native calendar picker on click/focus where supported (Chromium / Edge / mobile).
const openDatePicker = () => {
  if (typeof dateInput.showPicker === "function") {
    try {
      dateInput.showPicker();
    } catch (err) {
      /* ignore — some browsers throw if not user-initiated */
    }
  }
};
dateInput.addEventListener("click", openDatePicker);
dateInput.addEventListener("focus", openDatePicker);

// Show pickup address only when user selects a "Yes" option.
const pickupSelect = document.querySelector("#pickup");
const addressField = document.querySelector("#address-field");
const addressInput = document.querySelector("#address");

const userWantsPickup = () => {
  const selectedOption = pickupSelect.options[pickupSelect.selectedIndex];
  // Primary signal: option's data-pickup attribute (set in HTML).
  if (selectedOption && selectedOption.dataset.pickup) {
    return selectedOption.dataset.pickup.toLowerCase() === "yes";
  }
  // Fallback: look at the value text itself.
  return /^yes\b/i.test(pickupSelect.value || "");
};

const syncAddressVisibility = () => {
  const wantsPickup = userWantsPickup();
  addressField.classList.toggle("is-hidden", !wantsPickup);
  addressField.hidden = !wantsPickup; // belt + braces
  addressInput.required = wantsPickup;
  if (!wantsPickup) {
    addressInput.value = "";
  }
};
pickupSelect.addEventListener("change", syncAddressVisibility);
pickupSelect.addEventListener("input", syncAddressVisibility);
syncAddressVisibility();

// Validate the form ourselves so we can show a clear, focused error.
const validateBooking = (payload) => {
  if (!payload.customerName) {
    return { field: "#customer-name", message: "Please enter your full name." };
  }
  if (!/^[0-9]{10}$/.test(payload.customerPhone)) {
    return { field: "#customer-phone", message: "Please enter a valid 10-digit mobile number." };
  }
  if (!payload.vehicleNumber) {
    return { field: "#vehicle-number", message: "Please enter your vehicle number (e.g. UP70 AB 1234)." };
  }
  if (!payload.pickup) {
    return { field: "#pickup", message: "Please choose a Pickup & Drop option." };
  }
  if (payload.pickup.startsWith("Yes") && !payload.address) {
    return { field: "#address", message: "Please enter your pickup address." };
  }
  if (!payload.date) {
    return { field: "#date", message: "Please pick your preferred date." };
  }
  if (!payload.time) {
    return { field: "#time", message: "Please pick your preferred time slot." };
  }
  return null;
};

document.querySelector("#booking-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = buildBookingPayload();

  // Explicit validation with a visible popup so customers always see the issue.
  const problem = validateBooking(payload);
  if (problem) {
    setStatus(problem.message, "error");
    const node = document.querySelector(problem.field);
    if (node) {
      node.scrollIntoView({ block: "center", behavior: "smooth" });
      setTimeout(() => node.focus(), 300);
    }
    window.alert("⚠️ " + problem.message);
    return;
  }

  submitButton.disabled = true;
  setStatus("Saving your booking...", "loading");

  let supabaseSaved = false;
  let sheetSaved = false;

  // Open WhatsApp FIRST so the customer always lands in chat even if the
  // background save is slow or blocked.
  const message = buildWhatsAppMessage(payload);
  const whatsappWindow = window.open(whatsAppUrl(message), "_blank", "noopener");

  try {
    if (supabase) {
      const { error } = await supabase.from("bookings").insert({
        customer_name: payload.customerName,
        customer_phone: payload.customerPhone,
        vehicle_type: payload.vehicleNumber,
        service_name: "Wash booking",
        booking_date: payload.date,
        booking_time: payload.time,
        notes:
          [
            payload.notes,
            `Pickup: ${payload.pickup}`,
            payload.address ? `Address: ${payload.address}` : null,
          ]
            .filter(Boolean)
            .join(" | ") || null,
        source: "website",
      });
      if (error) {
        console.error("Supabase booking save failed:", error);
      } else {
        supabaseSaved = true;
      }
    }

    if (hasSheetsConfig) {
      const sheetResult = await sendToGoogleSheet(payload);
      sheetSaved = !!sheetResult.ok;
    }
  } catch (err) {
    console.error("Booking save threw:", err);
  }

  const anySaved = supabaseSaved || sheetSaved;

  if (anySaved) {
    setStatus("✅ Booking saved! WhatsApp is opening to confirm.", "success");
    window.alert(
      "✅ Booking submitted successfully!\n\n" +
        `Name: ${payload.customerName}\n` +
        `Mobile: ${payload.customerPhone}\n` +
        `Vehicle: ${payload.vehicleNumber}\n` +
        `Date: ${payload.date}  •  ${payload.time}\n\n` +
        "WhatsApp has opened so you can send the booking message to confirm."
    );
    document.querySelector("#booking-form").reset();
    dateInput.value = today;
    syncAddressVisibility();
  } else if (!supabase && !hasSheetsConfig) {
    setStatus("ℹ️ WhatsApp opened. No database is configured, so booking was not saved.", "warning");
    window.alert(
      "ℹ️ WhatsApp has opened with your booking details.\n\n" +
        "Note: online booking storage is not configured yet, so please send the WhatsApp message to confirm your slot."
    );
  } else {
    setStatus("⚠️ Could not save online, but WhatsApp opened with your booking.", "warning");
    window.alert(
      "⚠️ We could not reach the booking database, but WhatsApp opened with your details.\n\n" +
        "Please send the WhatsApp message so we can confirm your slot."
    );
  }

  // If the WhatsApp tab was blocked by a popup blocker, surface that too.
  if (!whatsappWindow) {
    setStatus(
      "⚠️ WhatsApp tab was blocked by your browser. Please allow popups and try again.",
      "warning"
    );
  }

  submitButton.disabled = false;
});
