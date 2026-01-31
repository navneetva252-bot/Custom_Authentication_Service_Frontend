export function initFormSubmit({ 
  form, 
  phoneField, 
  emailField, 
  phoneInput, 
  emailInput, 
  countryCodeSelect, 
  messages, 
  emailRegex, 
  applyAuthMode, 
  AUTH_MODE 
}) {
  const phoneError = document.getElementById("phoneError");
  const resetError = document.getElementById("resetError");
  const resetSuccess = document.getElementById("resetSuccess");

  form.addEventListener("submit", e => {
    e.preventDefault();

    // 🔹 Clear messages
    resetError.textContent = "";
    resetSuccess.textContent = "";
    phoneError.textContent = "";
    const successMessage = document.getElementById("successMessage");
    if (successMessage) successMessage.textContent = "";

    const selectedOption = countryCodeSelect.options[countryCodeSelect.selectedIndex];
    const requiredLength = Number(selectedOption.dataset.length);

    // 🔹 Validation
    if (phoneInput.value && phoneInput.value.length !== requiredLength) { 
      resetError.textContent = messages.phoneLength(requiredLength); 
      return; 
    }

    if (emailInput.value && !emailRegex.test(emailInput.value.trim())) { 
      resetError.textContent = messages.emailInvalid; 
      return; 
    }

    if (!phoneInput.value && !emailInput.value) {
      resetError.textContent = "Enter either phone or email";
      return;
    }

    const finalPhoneNumber = phoneInput.value ? countryCodeSelect.value + phoneInput.value.trim() : "";
    console.log("Final Phone:", finalPhoneNumber);
    resetSuccess.textContent = messages.forgetSuccess;

    // 🔹 Reset inputs and toggle
    phoneInput.value = "";
    emailInput.value = "";
    phoneInput.oninput = null;
    emailInput.oninput = null;
    phoneInput.disabled = false;
    emailInput.disabled = false;

    applyAuthMode(AUTH_MODE, phoneField, emailField, phoneInput, emailInput);
  });
}
