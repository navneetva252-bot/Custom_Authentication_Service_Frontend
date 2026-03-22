export function initFormSubmit({
  form,
  passwordInput,
  confirmInput,
  messages,
  strongPasswordRegex,
}) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const passwordError = document.getElementById("passwordError");
    const confirmError = document.getElementById("confirmError");
    const submitBtn = form.querySelector("button[type='submit']");

    passwordError.textContent = "";
    confirmError.textContent = "";

    if (!passwordInput.value) {
      passwordError.textContent = messages.passwordWeak;
      return;
    }

    if (!strongPasswordRegex.test(passwordInput.value)) {
      passwordError.textContent = messages.passwordWeak;
      return;
    }

    if (confirmInput.value !== passwordInput.value) {
      confirmError.textContent = messages.passwordsMismatch;
      return;
    }

    // Read stored data from forgot-password + OTP flow
    const email = localStorage.getItem("signupEmail");
    const phone = localStorage.getItem("signupPhone");
    const deliveryMode = localStorage.getItem("otpDeliveryMode");
    const code = localStorage.getItem("resetCode");

    console.log("🔑 Password Reset Flow:");
    console.log("   Email:", email || "none");
    console.log("   Phone:", phone || "none");
    console.log("   Delivery Mode:", deliveryMode);
    console.log("   Reset Code:", code || "MISSING!");

    if (!code) {
      passwordError.textContent = "Session expired. Please restart the forgot-password flow.";
      return;
    }

    const requestBody = {
      code,
      newPassword: passwordInput.value,
      confirmPassword: confirmInput.value,
    };

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

    const API_BASE = window.RUNTIME_ENV.API_BASE_URL;

    submitBtn.disabled = true;
    submitBtn.textContent = "Resetting...";

    try {
      console.log("📤 Sending Password Reset Request:");
      console.log("   Endpoint:", `${API_BASE}/password/reset-password`);
      console.log("   Request Body:", {
        code: requestBody.code,
        newPassword: "***hidden***",
        confirmPassword: "***hidden***",
        email: requestBody.email || "not included",
        countryCode: requestBody.countryCode || "not included",
        localNumber: requestBody.localNumber || "not included",
        phone: requestBody.phone || "not included"
      });

      const res = await fetch(`${API_BASE}/password/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-uuid": getDeviceUUID(),
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      const data = await res.json();

      console.log("📥 Password Reset Response:");
      console.log("   Status:", res.status);
      console.log("   Success:", data.success);
      console.log("   Message:", data.message);

      if (!res.ok || !data.success) {
        passwordError.textContent = data.message || "Password reset failed.";
        return;
      }

      // Clear stored data
      localStorage.removeItem("signupEmail");
      localStorage.removeItem("signupPhone");
      localStorage.removeItem("otpDeliveryMode");
      localStorage.removeItem("otpPurpose");
      localStorage.removeItem("resetCode");

      // Mark that password was just reset for login flow
      localStorage.setItem("justResetPassword", "true");
      localStorage.setItem("resetPasswordEmail", email || "");

      window.location.href = "reset-success.html";

    } catch (err) {
      passwordError.textContent = "Network error. Please check your connection.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Reset";
    }
  });
}

function getDeviceUUID() {
  let uuid = localStorage.getItem("deviceUUID");
  if (!uuid) { uuid = crypto.randomUUID(); localStorage.setItem("deviceUUID", uuid); }
  return uuid;
}
