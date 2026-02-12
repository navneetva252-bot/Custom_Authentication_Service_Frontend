export function resetUI(
  phoneField,
  emailField,
  phoneInput,
  emailInput,
  phoneDropdown
) {
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

  if (phoneDropdown) phoneDropdown.disabled = false;
}

export function applyAuthMode(
  mode,
  phoneField,
  emailField,
  phoneInput,
  emailInput,
  phoneDropdown
) {
  resetUI(phoneField, emailField, phoneInput, emailInput, phoneDropdown);

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

      // PHONE → EMAIL disable
      phoneInput.oninput = () => {
        if (phoneInput.value.trim() !== "") {
          emailInput.value = "";
          emailInput.disabled = true;
        } else {
          emailInput.disabled = false;
        }
      };

      // EMAIL → PHONE + DROPDOWN disable
      emailInput.oninput = () => {
        if (emailInput.value.trim() !== "") {
          phoneInput.value = "";
          phoneInput.disabled = true;
          if (phoneDropdown) phoneDropdown.disabled = true;
        } else {
          phoneInput.disabled = false;
          if (phoneDropdown) phoneDropdown.disabled = false;
        }
      };
      break;

    default:
      console.error("Invalid AUTH_MODE");
  }
}
