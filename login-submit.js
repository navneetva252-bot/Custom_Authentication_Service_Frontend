
export function initFormSubmit({ form,  phoneInput, emailInput, passwordInput, countryCodeSelect, messages, emailRegex, applyAuthMode, AUTH_MODE }) {
  form.addEventListener("submit", e => {
    e.preventDefault();
    const successMessage = document.getElementById("successMessage");

    successMessage.textContent = "";

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

    const finalPhoneNumber = phoneInput.value ? countryCodeSelect.value + phoneInput.value.trim() : "";
    console.log("Final Phone:", finalPhoneNumber);
    alert(messages.loginSuccess);

    phoneInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    phoneInput.oninput = null;
    emailInput.oninput = null;
    phoneInput.disabled = false;
    emailInput.disabled = false;
    applyAuthMode(AUTH_MODE, phoneField, emailField, phoneInput, emailInput);
  });
}
