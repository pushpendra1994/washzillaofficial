import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { hasSupabaseConfig, supabaseConfig } from "./supabase-config.js";

const phoneNumber = "917869697297";
const defaultMessage =
  "Hello WashZilla, I would like to book a vehicle wash.%0A%0AFull Name:%0AMobile Number:%0AVehicle Type:%0AService:%0APreferred Date:%0APreferred Time:%0ANotes:%0A%0APlease confirm availability.";

const whatsAppUrl = (message = defaultMessage) =>
  `https://wa.me/${phoneNumber}?text=${message}`;

const supabase = hasSupabaseConfig
  ? createClient(supabaseConfig.url, supabaseConfig.anonKey)
  : null;

const statusNode = document.querySelector("#booking-status");
const submitButton = document.querySelector("#booking-submit");

const setStatus = (message, tone = "neutral") => {
  statusNode.textContent = message;
  statusNode.dataset.tone = tone;
};

const buildBookingPayload = () => {
  const customerName = document.querySelector("#customer-name").value.trim();
  const customerPhone = document.querySelector("#customer-phone").value.trim();
  const vehicle = document.querySelector("#vehicle").value;
  const service = document.querySelector("#service").value;
  const date = document.querySelector("#date").value;
  const time = document.querySelector("#time").value;
  const notes = document.querySelector("#notes").value.trim();

  return {
    customerName,
    customerPhone,
    vehicle,
    service,
    date,
    time,
    notes,
  };
};

const buildWhatsAppMessage = ({
  customerName,
  customerPhone,
  vehicle,
  service,
  date,
  time,
  notes,
}) =>
  encodeURIComponent(
    `Hello WashZilla, I would like to book a vehicle wash.\n\nFull Name: ${customerName}\nMobile Number: ${customerPhone}\nVehicle Type: ${vehicle}\nService: ${service}\nPreferred Date: ${date}\nPreferred Time: ${time}\nNotes: ${notes || "None"}\n\nPlease confirm availability.`
  );

document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.href = whatsAppUrl();
});

document.querySelectorAll("[data-service]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const service = link.dataset.service;
    const message = encodeURIComponent(
      `Hello WashZilla, I want to book ${service}.\n\nFull Name:\nMobile Number:\nVehicle Type:\nPreferred Date:\nPreferred Time:\nNotes:\n\nPlease confirm availability.`
    );
    window.open(whatsAppUrl(message), "_blank", "noopener");
  });
});

document.querySelectorAll("[data-plan]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const plan = link.dataset.plan;
    const message = encodeURIComponent(
      `Hello WashZilla, I am interested in the ${plan}.\n\nFull Name:\nMobile Number:\nPlease share membership details and availability.`
    );
    window.open(whatsAppUrl(message), "_blank", "noopener");
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

document.querySelector("#booking-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = buildBookingPayload();
  if (!/^[0-9]{10}$/.test(payload.customerPhone)) {
    setStatus("Please enter a valid 10-digit mobile number.", "error");
    return;
  }

  submitButton.disabled = true;
  setStatus("Saving booking details...", "loading");

  let saveSucceeded = false;

  if (supabase) {
    const { error } = await supabase.from("bookings").insert({
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      vehicle_type: payload.vehicle,
      service_name: payload.service,
      booking_date: payload.date,
      booking_time: payload.time,
      notes: payload.notes || null,
      source: "website",
    });

    if (error) {
      console.error("Supabase booking save failed:", error);
      setStatus("Database save failed, but WhatsApp booking is still opening.", "warning");
    } else {
      saveSucceeded = true;
      setStatus("Booking saved. Opening WhatsApp confirmation...", "success");
    }
  } else {
    setStatus("Supabase is not configured yet. Opening WhatsApp booking only.", "warning");
  }

  const message = buildWhatsAppMessage(payload);
  window.open(whatsAppUrl(message), "_blank", "noopener");

  if (saveSucceeded) {
    document.querySelector("#booking-form").reset();
    dateInput.value = today;
  }

  submitButton.disabled = false;
});
