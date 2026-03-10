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
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const successMessage = document.getElementById("successMessage");
    const passwordError = document.getElementById("passwordError");
    const confirmError = document.getElementById("confirmError");
    const submitBtn = form.querySelector("button[type='submit']");

    successMessage.textContent = "";
    passwordError.textContent = "";
    confirmError.textContent = "";

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
      usernameInput.value.length > 20 ||
      /\s/.test(usernameInput.value)
    ) {
      alert(messages.nameInvalid);
      return;
    }

    const countryCode = countryCodeSelect.value.replace("+", "");
    const localNumber = phoneInput.value.trim();

    const requestBody = {
      firstName: usernameInput.value.trim(),
      password: passwordInput.value,
    };

    if (emailInput.value) requestBody.email = emailInput.value.trim();
    if (localNumber) {
      requestBody.countryCode = countryCode;
      requestBody.localNumber = localNumber;
      requestBody.phone = `+${countryCode}${localNumber}`;
    }

    const API_BASE = window.RUNTIME_ENV.API_BASE_URL;
    const deviceUUID = getDeviceUUID();

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Account...";

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-uuid": deviceUUID,
          "x-device-name": getDeviceName(),
          "x-device-type": getDeviceType(),
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        successMessage.textContent = "";
        alert(data.message || "Signup failed. Please try again.");
        return;
      }

      // Store for OTP page
      const contactMode = data.data?.contactMode || (emailInput.value ? "EMAIL" : "PHONE");
      localStorage.setItem("otpDeliveryMode", contactMode);
      localStorage.setItem("otpPurpose", "EMAIL_VERIFICATION");
      localStorage.setItem("signupEmail", emailInput.value || "");
      localStorage.setItem("signupPhone", localNumber ? `+${countryCode}${localNumber}` : "");

      window.location.href = "otp.html";

    } catch (err) {
      alert("Network error. Please check your connection.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    }
  });
}

function getDeviceUUID() {
  let uuid = localStorage.getItem("deviceUUID");
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem("deviceUUID", uuid);
  }
  return uuid;
}

function getDeviceName() {
  return navigator.userAgent.split(")")[0].split("(")[1] || "Browser";
}

function getDeviceType() {
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone/.test(ua)) return "MOBILE";
  if (/tablet|ipad/.test(ua)) return "TABLET";
  return "LAPTOP";
}
