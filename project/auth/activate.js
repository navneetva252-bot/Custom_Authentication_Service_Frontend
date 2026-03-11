const API_BASE = window.RUNTIME_ENV.API_BASE_URL;
const AUTH_MODE = window.RUNTIME_ENV.AUTH_MODE;

// ===== Toggle Eye =====
document.querySelectorAll(".toggle-eye").forEach(eye => {
  eye.addEventListener("click", () => {
    const input = document.getElementById(eye.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  });
});

// ===== Apply Auth Mode =====
const phoneField = document.getElementById("phoneField");
const emailField = document.getElementById("emailField");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const countryCodeSelect = document.getElementById("countryCode");

if (AUTH_MODE === "EMAIL") {
  phoneField.style.display = "none";
} else if (AUTH_MODE === "PHONE") {
  emailField.style.display = "none";
}

// Populate country dropdown
if (window.countries) {
  window.countries.forEach(c => {
    const opt = document.createElement("option");
    opt.value = `${c.dialCode}`;
    opt.textContent = `${c.flag || ""} +${c.dialCode} (${c.name})`;
    opt.dataset.length = c.phoneLength;
    countryCodeSelect.appendChild(opt);
  });
}

function getDeviceUUID() {
  let uuid = localStorage.getItem("deviceUUID");
  if (!uuid) { uuid = crypto.randomUUID(); localStorage.setItem("deviceUUID", uuid); }
  return uuid;
}

// ===== Form Submit =====
document.querySelector(".auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = document.querySelector("button[type='submit']");
  const activateError = document.getElementById("activateError");
  const activateSuccess = document.getElementById("activateSuccess");
  activateError.textContent = "";
  activateSuccess.textContent = "";

  const password = document.getElementById("password").value;
  if (!password) { activateError.textContent = "Password is required."; return; }

  const emailVal = emailInput.value.trim();
  const phoneVal = phoneInput.value.trim();

  if (!emailVal && !phoneVal) {
    activateError.textContent = "Please enter your email or phone number.";
    return;
  }

  const body = { password };
  if (emailVal) body.email = emailVal;
  if (phoneVal) {
    const countryCode = countryCodeSelect.value.replace("+", "");
    body.countryCode = countryCode;
    body.localNumber = phoneVal;
    body.phone = `+${countryCode}${phoneVal}`;
  }

  btn.disabled = true;
  btn.textContent = "Activating...";

  try {
    const res = await fetch(`${API_BASE}/account/activate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-uuid": getDeviceUUID(),
      },
      body: JSON.stringify(body),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      activateError.textContent = data.message || "Activation failed. Please check your credentials.";
      btn.disabled = false;
      btn.textContent = "Activate Account";
      return;
    }
    activateSuccess.textContent = data.message || "Account activated! Redirecting to login...";
    setTimeout(() => { window.location.href = "login.html"; }, 1800);
  } catch {
    activateError.textContent = "Network error. Please check your connection.";
    btn.disabled = false;
    btn.textContent = "Activate Account";
  }
});
