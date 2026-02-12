// ===== Elements =====
const otpBoxes = document.querySelectorAll(".otp-box");
const verifyBtn = document.getElementById("verifyOtpBtn");
const resendBtn = document.getElementById("resendOtp");
const otpError = document.getElementById("otpError");
const otpSuccess = document.getElementById("otpSuccess");
const otpMessage = document.getElementById("otpMessage");
const otpTimerEl = document.getElementById("otpTimer");

// ===== State =====
let otpTimeLeft = 120;
let otpInterval;
let resendInterval;
let canResend = true;

// ===== Signup info =====
const deliveryMode = localStorage.getItem("otpDeliveryMode");
const email = localStorage.getItem("signupEmail");
const phone = localStorage.getItem("signupPhone");

// ===== Masking =====
function maskEmail(email) {
  const [user, domain] = email.split("@");
  return `***${user.slice(-3)}@${domain}`;
}

function maskPhone(phone) {
  return `****${phone.slice(-4)}`;
}

otpMessage.textContent =
  deliveryMode === "EMAIL"
    ? `OTP sent to email ${maskEmail(email)}`
    : `OTP sent to phone ${maskPhone(phone)}`;

function handleOtpChange() {
  const otp = Array.from(otpBoxes)
    .map((box) => box.value)
    .join("");

  if (otp.length === 6 && /^\d{6}$/.test(otp)) {
    otpError.textContent = ""; // 🔥 auto clear error
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
});

// ===== OTP Expiry Timer =====
function startOtpTimer() {
  clearInterval(otpInterval);
  otpTimeLeft = 120;

  otpInterval = setInterval(() => {
    const m = Math.floor(otpTimeLeft / 60);
    const s = otpTimeLeft % 60;

    otpTimerEl.textContent = `OTP expires in ${m}:${String(s).padStart(2, "0")}`;
    otpTimeLeft--;

    if (otpTimeLeft < 0) {
      clearInterval(otpInterval);
      otpTimerEl.textContent = "OTP expired. Please resend.";
      verifyBtn.disabled = true;
      verifyBtn.style.opacity = "0.6";
    }
  }, 1000);
}

// ===== Verify OTP =====
verifyBtn.addEventListener("click", () => {
  const otp = [...otpBoxes].map((b) => b.value).join("");

  if (!/^\d{6}$/.test(otp)) {
    otpError.textContent = "Please enter all 6 digits";
    return;
  }

  otpError.textContent = "";
  otpSuccess.textContent = "OTP verified successfully! Redirecting...";

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
});

// ===== Resend OTP =====

resendBtn.addEventListener("click", () => {
  if (!canResend) return;

  canResend = false;

  // UI lock
  resendBtn.classList.add("disabled");
  resendBtn.textContent = "Resending...";

  // 🔁 clear old interval if any
  if (resendInterval) clearInterval(resendInterval);

  setTimeout(() => {
    otpSuccess.textContent = "OTP resent successfully";
    otpError.textContent = "";

    // reset OTP expiry
    otpTimeLeft = 120;
    verifyBtn.disabled = false;
    verifyBtn.style.opacity = "1";
    startOtpTimer();

    let timeLeft = 30;
    resendBtn.textContent = `Resend in ${timeLeft}s`;

    resendInterval = setInterval(() => {
      timeLeft--;
      resendBtn.textContent = `Resend in ${timeLeft}s`;

      if (timeLeft <= 0) {
        clearInterval(resendInterval);
        resendBtn.textContent = "Resend";
        resendBtn.classList.remove("disabled");
        canResend = true;
      }
    }, 1000);
  }, 1000);
});

// ===== Start OTP timer on load =====
startOtpTimer();
