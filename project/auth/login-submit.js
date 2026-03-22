
export function initFormSubmit({ form, phoneInput, emailInput, passwordInput, countryCodeSelect, messages, emailRegex, applyAuthMode, AUTH_MODE, phoneDropdown }) {
  form.addEventListener("submit", async e => {
    e.preventDefault();

    const successMessage = document.getElementById("successMessage");
    const loginError = document.getElementById("loginError");
    const submitBtn = form.querySelector("button[type='submit']");

    successMessage.textContent = "";
    if (loginError) loginError.textContent = "";

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

    const countryCode = countryCodeSelect.value.replace("+", "");
    const localNumber = phoneInput.value.trim();

    const requestBody = { password: passwordInput.value };

    if (emailInput.value) requestBody.email = emailInput.value.trim();
    if (localNumber) {
      requestBody.countryCode = countryCode;
      requestBody.localNumber = localNumber;
      requestBody.phone = `+${countryCode}${localNumber}`;
    }

    const API_BASE = window.RUNTIME_ENV.API_BASE_URL;
    const deviceUUID = getDeviceUUID();

    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      const res = await fetch(`${API_BASE}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-uuid": deviceUUID,
          "x-device-name": getDeviceName(),
          "x-device-type": getDeviceType(),
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // For AccessDenied errors, use warning field (contains deactivation message)
        let displayMsg = data.message || "Login failed.";
        
        if (data.type === "AccessDenied" && data.warning) {
          displayMsg = data.warning;
        }
        
        // Check if account is deactivated and show activation link
        if (displayMsg.toLowerCase().includes("deactivated")) {
          if (loginError) {
            loginError.innerHTML = `${displayMsg} <a href="activate.html">Activate now</a>`;
          } else {
            alert(displayMsg);
          }
        } else {
          if (loginError) loginError.textContent = displayMsg;
          else alert(displayMsg);
        }
        return;
      }

      // 2FA required — redirect to OTP
      if (data.requires2FA) {
        localStorage.setItem("otpDeliveryMode", emailInput.value ? "EMAIL" : "PHONE");
        localStorage.setItem("otpPurpose", "DEVICE_VERIFICATION");
        localStorage.setItem("signupEmail", emailInput.value || "");
        localStorage.setItem("signupPhone", localNumber ? `+${countryCode}${localNumber}` : "");
        window.location.href = "otp.html";
        return;
      }

      // Store access token from response header
      const accessToken = res.headers.get("x-access-token");
      if (accessToken) localStorage.setItem("accessToken", accessToken);

      successMessage.textContent = messages.loginSuccess;
      setTimeout(() => { window.location.href = "../app/dashboard.html"; }, 1000);

    } catch (err) {
      if (loginError) loginError.textContent = "Network error. Please check your connection.";
      else alert("Network error. Please check your connection.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
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
