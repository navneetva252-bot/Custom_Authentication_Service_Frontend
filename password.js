import { initValidation } from "./reset-validate.js";
import { initFormSubmit } from "./reset-submit.js";

const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");
const form = document.querySelector(".auth-form");


const messages = window.messages;
const strongPasswordRegex = window.strongPasswordRegex;

document.querySelectorAll(".toggle-eye").forEach(eye => {
  eye.addEventListener("click", () => {
    const input = document.getElementById(eye.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  });
});


initValidation({
  passwordInput,
  confirmInput,
  passwordError: document.getElementById("passwordError"),
  confirmError: document.getElementById("confirmError"),
  messages,
  strongPasswordRegex
});


initFormSubmit({
  form,
  passwordInput,
  confirmInput,
  messages,
  strongPasswordRegex
});

