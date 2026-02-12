import { applyAuthMode} from "./auth-mode.js";
import { initCountryDropdown } from "./country-dropdown.js";
import { initValidation } from "./login-validate.js";
import { initFormSubmit } from "./login-submit.js";

const AUTH_MODE = window.RUNTIME_ENV.AUTH_MODE;

const phoneField = document.getElementById("phoneField");
const emailField = document.getElementById("emailField");
const countryCodeSelect = document.getElementById("countryCode");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const phoneError = document.getElementById("phoneError");
const form = document.querySelector(".auth-form");
const phoneDropdown = document.getElementById("countryCode");

const messages = window.messages;
const emailRegex = window.emailRegex;
const countries = window.countries;

applyAuthMode(
  AUTH_MODE,
  phoneField,
  emailField,
  phoneInput,
  emailInput,
  phoneDropdown
);
initCountryDropdown(countries, countryCodeSelect, phoneInput, phoneError);
initValidation({
  phoneInput,
  emailInput,
  passwordInput,
  countryCodeSelect,
  phoneError,
  messages,
  emailRegex,
});

initFormSubmit({
  form,
  phoneInput,
  emailInput,
  passwordInput,
  countryCodeSelect,
  messages,
  emailRegex,
  applyAuthMode,
  AUTH_MODE,
  phoneDropdown
});
