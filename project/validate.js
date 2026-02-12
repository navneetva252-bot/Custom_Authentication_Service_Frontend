export function initValidation({
  usernameInput,
  usernameError,
  phoneInput,
  emailInput,
  passwordInput,
  confirmInput,
  countryCodeSelect,
  phoneError,
  passwordError,
  confirmError,
  messages,
  strongPasswordRegex,
  emailRegex
}) {

  /* =======================
     USERNAME VALIDATION
     ======================= */
  if (usernameInput) {
    usernameInput.addEventListener("input", () => {
      const value = usernameInput.value;

      // 🔹 REQUIRED
      if (value.length === 0) {
        usernameError.textContent = "Username is required";
        return;
      }

      // 🔹 NO SPACES
      if (/\s/.test(value)) {
        usernameError.textContent = "Spaces are not allowed";
        return;
      }

      // 🔹 MIN / MAX
      if (value.length < 2) {
        usernameError.textContent = "Username must be at least 2 characters";
      } else if (value.length > 20) {
        usernameError.textContent = "Username must be max 20 characters";
      } else {
        usernameError.textContent = "";
      }
    });
  }

  /* =======================
     PASSWORD VALIDATION
     ======================= */
  passwordInput.addEventListener("input", () => {
    passwordError.textContent = strongPasswordRegex.test(passwordInput.value)
      ? ""
      : messages.passwordWeak;
  });

  confirmInput.addEventListener("input", () => {
    confirmError.textContent =
      confirmInput.value === passwordInput.value
        ? ""
        : messages.passwordsMismatch;
  });

  /* =======================
     CLEAR SUCCESS MESSAGE
     ======================= */
  [phoneInput, emailInput, passwordInput, confirmInput].forEach(input => {
    input.addEventListener("input", () => {
      const successMessage = document.getElementById("successMessage");
      if (successMessage) successMessage.textContent = "";
    });
  });

  /* =======================
     PHONE VALIDATION
     ======================= */
  phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "");
    const selectedOption =
      countryCodeSelect.options[countryCodeSelect.selectedIndex];
    const requiredLength = Number(selectedOption.dataset.length);

    if (phoneInput.value.length === 0) {
      phoneError.textContent = messages.phoneRequired;
    } else if (phoneInput.value.length < requiredLength) {
      phoneError.textContent = `You must enter ${requiredLength} digits`;
    } else {
      phoneError.textContent = "";
    }
  });
}
