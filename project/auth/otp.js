// ===== Elements =====
const otpBoxes = document.querySelectorAll(".otp-box");
const verifyBtn = document.getElementById("verifyOtpBtn");
const resendBtn = document.getElementById("resendOtp");
const otpError = document.getElementById("otpError");
const otpSuccess = document.getElementById("otpSuccess");
const otpMessage = document.getElementById("otpMessage");
const otpTimerEl = document.getElementById("otpTimer");

// ===== State =====
let otpTimeLeft = 600; // 10 minutes default, will be reset by timer on load
let otpInterval;
let resendInterval;
let canResend = true;

// ===== Signup info =====
const deliveryMode = localStorage.getItem("otpDeliveryMode"); // "EMAIL" | "PHONE"
const otpPurpose  = localStorage.getItem("otpPurpose");       // "EMAIL_VERIFICATION" | "PHONE_VERIFICATION" | "DEVICE_VERIFICATION"
const email = localStorage.getItem("signupEmail");
const phone = localStorage.getItem("signupPhone");

const API_BASE = window.RUNTIME_ENV.API_BASE_URL;

// ===== Masking =====
function maskEmail(e) {
  const [user, domain] = e.split("@");
  return `***${user.slice(-3)}@${domain}`;
}

function maskPhone(p) {
  return `****${p.slice(-4)}`;
}

if (deliveryMode === "EMAIL" && email) {
  otpMessage.textContent = `OTP sent to email ${maskEmail(email)}`;
} else if (phone) {
  otpMessage.textContent = `OTP sent to phone ${maskPhone(phone)}`;
} else {
  otpMessage.textContent = "OTP sent. Please check your inbox.";
}

function handleOtpChange() {
  const otp = Array.from(otpBoxes).map((box) => box.value).join("");
  if (otp.length === 6 && /^\d{6}$/.test(otp)) {
    otpError.textContent = "";
  }
}

// ===== OTP Input UX =====
otpBoxes.forEach((box, idx) => {
  box.addEventListener("input", () => {
    box.value = box.value.replace(/\D/g, "");
    if (box.value && idx < otpBoxes.length - 1) {
      otpBoxes[idx + 1].focus();
    }
    handleOtpChange();
  });

  box.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !box.value && idx > 0) {
      otpBoxes[idx - 1].focus();
    }
  });

  box.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
    if (pasted.length <= 6) {
      otpBoxes.forEach((b, i) => {
        b.value = pasted[i] || "";
      });
      otpBoxes[Math.min(pasted.length, 5)].focus();
      handleOtpChange();
    }
  });
});

// ===== OTP Expiry Timer =====
function startOtpTimer() {
  clearInterval(otpInterval);
  otpTimeLeft = 600; // Reset to 10 minutes on each resend

  // Reset verify button only if it's not mid-request
  if (verifyBtn.textContent !== "Verifying...") {
    verifyBtn.disabled = false;
    verifyBtn.style.opacity = "1";
    verifyBtn.textContent = "Verify OTP";
  }

  otpInterval = setInterval(() => {
    if (otpTimeLeft <= 0) {
      clearInterval(otpInterval);
      otpTimerEl.textContent = "OTP expired. Please resend.";
      verifyBtn.disabled = true;
      verifyBtn.style.opacity = "0.6";
      return;
    }
    const m = Math.floor(otpTimeLeft / 60);
    const s = otpTimeLeft % 60;
    otpTimerEl.textContent = `OTP expires in ${m}:${String(s).padStart(2, "0")}`;
    otpTimeLeft--;
  }, 1000);
}

// ===== Device UUID helper =====
function getDeviceUUID() {
  let uuid = localStorage.getItem("deviceUUID");
  if (!uuid) { uuid = crypto.randomUUID(); localStorage.setItem("deviceUUID", uuid); }
  return uuid;
}

// ===== Verify OTP (API call) =====
const otpForm = document.getElementById("otpForm");
otpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const otp = [...otpBoxes].map((b) => b.value).join("");

  if (!/^\d{6}$/.test(otp)) {
    otpError.textContent = "Please enter all 6 digits";
    return;
  }

  otpError.textContent = "";
  verifyBtn.disabled = true;
  verifyBtn.textContent = "Verifying...";

  // PASSWORD_RESET: Verify OTP with backend before allowing password reset
  if (otpPurpose === "PASSWORD_RESET") {
    try {
      console.log("🔐 PASSWORD_RESET OTP Verification:");
      console.log("   OTP Code:", otp);
      console.log("   Email:", email || "none");
      console.log("   Phone:", phone || "none");
      console.log("   Calling endpoint: /password/verify-reset-password");

      // Backend needs email or phone to identify user + OTP code
      const requestBody = { code: otp };
      
      if (email) {
        requestBody.email = email;
      } else if (phone) {
        requestBody.phone = phone;
        const match = phone.match(/^\+(\d{1,3})(\d+)$/);
        if (match) {
          requestBody.countryCode = match[1];
          requestBody.localNumber = match[2];
        }
      }

      const res = await fetch(`${API_BASE}/password/verify-reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-uuid": getDeviceUUID(),
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      const data = await res.json();

      console.log("📡 OTP Verification Response:");
      console.log("   Status:", res.status);
      console.log("   Success:", data.success);
      console.log("   Message:", data.message);

      if (!res.ok || !data.success) {
        otpError.textContent = data.message || "Invalid OTP. Please try again.";
        verifyBtn.disabled = false;
        verifyBtn.textContent = "Verify OTP ✓";
        return;
      }

      // OTP verified! Store it for password reset
      localStorage.setItem("resetCode", otp);
      clearInterval(otpInterval);
      
      console.log("✅ OTP verified successfully. resetCode stored =", localStorage.getItem("resetCode"));
      
      otpSuccess.textContent = "OTP confirmed. Redirecting...";
      setTimeout(() => { 
        console.log("→ Redirecting to password.html");
        window.location.href = "password.html"; 
      }, 1200);

    } catch (err) {
      console.error("❌ OTP Verification Error:", err);
      otpError.textContent = "Network error. Please check your connection.";
      verifyBtn.disabled = false;
      verifyBtn.textContent = "Verify OTP ✓";
    }
    return;
  }

  try {
    // Choose endpoint based on delivery mode
    let endpoint;
    const requestBody = { code: otp };

    if (deliveryMode === "EMAIL") {
      endpoint = `${API_BASE}/verification/verify-email`;
      requestBody.email = email;
    } else {
      endpoint = `${API_BASE}/verification/verify-phone`;
      // phone stored as "+919999999999" — split into countryCode + localNumber
      const match = phone.match(/^\+(\d{1,3})(\d+)$/);
      if (match) {
        requestBody.countryCode = match[1];
        requestBody.localNumber = match[2];
        requestBody.phone = phone;
      }
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-uuid": getDeviceUUID(),
      },
      body: JSON.stringify(requestBody),
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      otpError.textContent = data.message || "Invalid OTP. Please try again.";
      verifyBtn.disabled = false;
      verifyBtn.textContent = "Verify OTP ✓";
      return;
    }

    clearInterval(otpInterval);
    // Store access token if backend sent it (e.g. after DEVICE_VERIFICATION)
    const accessToken = res.headers.get("x-access-token");
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    otpSuccess.textContent = data.message || "OTP verified successfully!";

    // Redirect after short delay
    setTimeout(() => {
      if (otpPurpose === "DEVICE_VERIFICATION") {
        // 2FA complete — go to dashboard
        window.location.href = "../app/dashboard.html";
      } else {
        // Signup verification complete — go to login
        window.location.href = "login.html";
      }
    }, 1200);

  } catch (err) {
    otpError.textContent = "Network error. Please check your connection.";
    verifyBtn.disabled = false;
    verifyBtn.textContent = "Verify OTP ✓";
  }
});

// ===== Resend OTP (API call) =====
resendBtn.addEventListener("click", async () => {
  if (!canResend) return;

  canResend = false;
  resendBtn.style.pointerEvents = "none";
  resendBtn.style.opacity = "0.5";
  const originalText = resendBtn.textContent;
  resendBtn.textContent = "Resending...";
  if (resendInterval) clearInterval(resendInterval);

  try {
    const requestBody = { purpose: otpPurpose || "EMAIL_VERIFICATION" };

    // authExistingUserMiddlewares needs email or phone to identify user
    if (deliveryMode === "EMAIL" && email) {
      requestBody.email = email;
    } else if (phone) {
      const match = phone.match(/^\+(\d{1,3})(\d+)$/);
      if (match) {
        requestBody.countryCode = match[1];
        requestBody.localNumber = match[2];
        requestBody.phone = phone;
      }
    }

    const res = await fetch(`${API_BASE}/verification/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-uuid": getDeviceUUID(),
      },
      body: JSON.stringify(requestBody),
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      otpError.textContent = data.message || "Could not resend OTP.";
      resendBtn.style.pointerEvents = "auto";
      resendBtn.style.opacity = "1";
      resendBtn.textContent = originalText;
      canResend = true;
      return;
    }

    otpSuccess.textContent = data.message || "OTP resent successfully";
    otpError.textContent = "";
    startOtpTimer();

  } catch (err) {
    otpError.textContent = "Network error. Could not resend OTP.";
    resendBtn.style.pointerEvents = "auto";
    resendBtn.style.opacity = "1";
    resendBtn.textContent = originalText;
    canResend = true;
    return;
  }

  // Resend cooldown timer — 30s
  let timeLeft = 30;
  resendBtn.textContent = `Resend in ${timeLeft}s`;

  resendInterval = setInterval(() => {
    timeLeft--;
    resendBtn.textContent = `Resend in ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(resendInterval);
      resendBtn.textContent = "Resend OTP";
      resendBtn.style.pointerEvents = "auto";
      resendBtn.style.opacity = "1";
      canResend = true;
    }
  }, 1000);
});

// ===== Start OTP timer on load =====
startOtpTimer();

