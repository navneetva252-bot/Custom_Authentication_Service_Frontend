
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
const phoneDropdown = document.getElementById("countryCode");

const messages = window.messages;
const emailRegex = window.emailRegex;
const countries = window.countries;

applyAuthMode(AUTH_MODE, phoneField, emailField, phoneInput, emailInput,phoneDropdown);
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
  phoneDropdown
});
