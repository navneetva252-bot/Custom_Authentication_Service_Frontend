export function initValidation({
  phoneInput,
  emailInput,
  passwordInput,
  countryCodeSelect,
  phoneError,
  messages,
  emailRegex
}) {
  [phoneInput, emailInput, passwordInput].forEach(input => {
    input.addEventListener("input", () => {
      const successMessage = document.getElementById("successMessage");
      if (successMessage) successMessage.textContent = "";
    });
  });

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
