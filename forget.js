// window.addEventListener("DOMContentLoaded", () => {
//   const resetInput = document.getElementById("resetId");
//   const resetLabel = document.getElementById("resetLabel");
//   const error = document.getElementById("resetError");
//   const success = document.getElementById("resetSuccess");

//   const AUTH_MODE = window.RUNTIME_ENV.AUTH_MODE;

//   if (AUTH_MODE === "EMAIL") {
//     resetLabel.textContent = "Email";
//     resetInput.placeholder = "Enter email";
//   } else if (AUTH_MODE === "PHONE") {
//     resetLabel.textContent = "Phone";
//     resetInput.placeholder = "Enter phone number";
//   } else {
//     resetLabel.textContent = "Email or Phone";
//     resetInput.placeholder = "Enter email or phone";
//   }

//   document.querySelector(".auth-form").addEventListener("submit", e => {
//     e.preventDefault();
//     error.textContent = "";
//     success.textContent = "";

//     const value = resetInput.value.trim();

//     if (!value) {
//       error.textContent = "This field is required";
//       return;
//     }

//     const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
//     const isPhone = /^[0-9]{10,15}$/.test(value);

//     if (!isEmail && !isPhone) {
//       error.textContent = "Enter a valid email or phone number";
//       return;
//     }

//     success.textContent = "Password reset link sent ✅";

//     resetInput.value = "";
//   });
// });
import { applyAuthMode } from "./auth-mode.js";
import { initCountryDropdown } from "./country-dropdown.js";
import { initValidation } from "./forget-validate.js";
import { initFormSubmit } from "./forget-submit.js";

const AUTH_MODE = window.RUNTIME_ENV.AUTH_MODE;

const phoneField = document.getElementById("phoneField");
const emailField = document.getElementById("emailField");
const countryCodeSelect = document.getElementById("countryCode");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const phoneError = document.getElementById("phoneError");
const form = document.querySelector(".auth-form");

const messages = window.messages;
const emailRegex = window.emailRegex;
const countries = window.countries;

applyAuthMode(AUTH_MODE, phoneField, emailField, phoneInput, emailInput);
initCountryDropdown(countries, countryCodeSelect, phoneInput, phoneError);
initValidation({
  phoneInput,
  emailInput,
  countryCodeSelect,
  phoneError,
  messages,
  emailRegex
});

initFormSubmit({
  form,
  phoneField, 
  emailField,
  phoneInput,
  emailInput,
  countryCodeSelect,
  messages,
  emailRegex,
  applyAuthMode,
  AUTH_MODE,
});
