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
      usernameInput.value.length < 3 ||
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
    alert(messages.submitSuccess);
    usernameInput.value = "";
    phoneInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    confirmInput.value = "";
    phoneInput.oninput = null;
    emailInput.oninput = null;
    phoneInput.disabled = false;
    emailInput.disabled = false;
    applyAuthMode(AUTH_MODE, phoneField, emailField, phoneInput, emailInput);
  });
}
