import { applyAuthMode } from "./auth-mode.js";
import { initCountryDropdown } from "./country-dropdown.js";
import { initValidation } from "./validate.js";
import { initFormSubmit } from "./form-submit.js";

const AUTH_MODE = window.RUNTIME_ENV.AUTH_MODE;

const phoneField = document.getElementById("phoneField");
const emailField = document.getElementById("emailField");
const countryCodeSelect = document.getElementById("countryCode");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");
const phoneError = document.getElementById("phoneError");
const form = document.querySelector(".auth-form");
const usernameInput = document.getElementById("username");
const usernameError = document.getElementById("usernameError");
const phoneDropdown = document.getElementById("countryCode");

const messages = window.messages;
const strongPasswordRegex = window.strongPasswordRegex;
const emailRegex = window.emailRegex;
const countries = window.countries;
document.querySelectorAll(".toggle-eye").forEach(eye => {
  eye.addEventListener("click", () => {
    const input = document.getElementById(eye.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  });
});


applyAuthMode(AUTH_MODE, phoneField, emailField, phoneInput, emailInput,phoneDropdown);
initCountryDropdown(countries, countryCodeSelect, phoneInput, phoneError);
initValidation({
  usernameInput,
  phoneInput,
  emailInput,
  passwordInput,
  confirmInput,
  countryCodeSelect,
  phoneError,
  passwordError: document.getElementById("passwordError"),
  confirmError: document.getElementById("confirmError"),
  usernameError,
  messages,
  strongPasswordRegex,
  emailRegex,
});


initFormSubmit({
  form,
  usernameInput,
  usernameError,
  phoneInput,
  emailInput,
  passwordInput,
  confirmInput,
  countryCodeSelect,
  messages,
  strongPasswordRegex,
  emailRegex,
  applyAuthMode,
  AUTH_MODE,
  phoneDropdown
});

