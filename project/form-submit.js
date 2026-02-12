export function initFormSubmit({
  form,
  usernameInput,
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
  phoneDropdown,
}) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const successMessage = document.getElementById("successMessage");
    const passwordError = document.getElementById("passwordError");
    const confirmError = document.getElementById("confirmError");

    successMessage.textContent = "";

    if (!strongPasswordRegex.test(passwordInput.value)) {
      passwordError.textContent = messages.passwordWeak;
      return;
    }

    if (confirmInput.value !== passwordInput.value) {
      confirmError.textContent = messages.passwordsMismatch;
      return;
    }

    const selectedOption =
      countryCodeSelect.options[countryCodeSelect.selectedIndex];
    const requiredLength = Number(selectedOption.dataset.length);

    if (phoneInput.value && phoneInput.value.length !== requiredLength) {
      alert(messages.phoneLength(requiredLength));
      return;
    }

    if (emailInput.value && !emailRegex.test(emailInput.value.trim())) {
      alert(messages.emailInvalid);
      return;
    }
    if (
      !usernameInput.value ||
      usernameInput.value.length < 2 ||
      usernameInput.value.length > 10 ||
      /\s/.test(usernameInput.value)
    ) {
      alert(messages.nameInvalid);
      return;
    }

    const finalPhoneNumber = phoneInput.value
      ? countryCodeSelect.value + phoneInput.value.trim()
      : "";
    console.log("Final Phone:", finalPhoneNumber);
    // Decide OTP delivery mode
    let otpDeliveryMode = "PHONE";

    if (AUTH_MODE === "EMAIL") otpDeliveryMode = "EMAIL";
    else if (AUTH_MODE === "PHONE") otpDeliveryMode = "PHONE";
    else if (AUTH_MODE === "EITHER") {
      otpDeliveryMode = emailInput.value ? "EMAIL" : "PHONE";
    }
    // BOTH case → SMS only
    else if (AUTH_MODE === "BOTH") otpDeliveryMode = "PHONE";

    // Store data for OTP page
    localStorage.setItem("otpDeliveryMode", otpDeliveryMode);
    localStorage.setItem("signupEmail", emailInput.value || "");
    localStorage.setItem("signupPhone", finalPhoneNumber || "");

    // 🔥 redirect
    window.location.href = "otp.html";
  });
}
