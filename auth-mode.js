export function resetUI(phoneField, emailField, phoneInput, emailInput) {
  phoneField.style.display = "none";
  emailField.style.display = "none";
  phoneInput.required = false;
  emailInput.required = false;
  phoneInput.disabled = false;
  emailInput.disabled = false;
  phoneInput.value = "";
  emailInput.value = "";
  phoneInput.oninput = null;
  emailInput.oninput = null;
}

export function applyAuthMode(
  mode,
  phoneField,
  emailField,
  phoneInput,
  emailInput
) {
  resetUI(phoneField, emailField, phoneInput, emailInput);

  switch (mode) {
    case "PHONE":
      phoneField.style.display = "block";
      phoneInput.required = true;
      break;
    case "EMAIL":
      emailField.style.display = "block";
      emailInput.required = true;
      break;
    case "BOTH":
      phoneField.style.display = "block";
      emailField.style.display = "block";
      phoneInput.required = true;
      emailInput.required = true;
      break;
    case "EITHER":
      phoneField.style.display = "block";
      emailField.style.display = "block";
      phoneInput.required = true;
      emailInput.required = true;
      phoneInput.oninput = null;
      emailInput.oninput = null;

      phoneInput.oninput = () => {
        if (phoneInput.value.trim() !== "") {
          emailInput.value = "";
          emailInput.disabled = true;
        } else {
          emailInput.disabled = false;
        }
      };

      emailInput.oninput = () => {
        if (emailInput.value.trim() !== "") {
          phoneInput.value = "";
          phoneInput.disabled = true;
        } else {
          phoneInput.disabled = false;
        }
      };
      break;
    default:
      console.error("Invalid AUTH_MODE");
  }
}
