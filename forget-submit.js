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
  AUTH_MODE,
  phoneDropdown
}) {
  const phoneError = document.getElementById("phoneError");
  const resetSuccess = document.getElementById("resetSuccess");

  form.addEventListener("submit", e => {
    e.preventDefault();

    // 🔹 Clear messages
    const selectedOption = countryCodeSelect.options[countryCodeSelect.selectedIndex];
    const requiredLength = Number(selectedOption.dataset.length);
    if (phoneInput.value && phoneInput.value.length !== requiredLength) { 
      alert(messages.phoneLength(requiredLength)); 
      return; 
    }

    if (emailInput.value && !emailRegex.test(emailInput.value.trim())) { 
      alert(messages.emailInvalid); 
      return; 
    }
    
    resetSuccess.textContent = "";
    phoneError.textContent = "";
    const successMessage = document.getElementById("successMessage");
    if (successMessage) successMessage.textContent = "";


    // 🔹 Validation
    

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

    applyAuthMode(AUTH_MODE, phoneField, emailField, phoneInput, emailInput,phoneDropdown);
  });
}
