export function initFormSubmit({
  form,
  passwordInput,
  confirmInput,
  messages,
  strongPasswordRegex,
}) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const passwordError = document.getElementById("passwordError");
    const confirmError = document.getElementById("confirmError");

    passwordError.textContent = "";
    confirmError.textContent = "";

    if (!passwordInput.value) {
      passwordError.textContent =
        messages.passwordRequired || messages.passwordWeak;
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

    window.location.href = "reset-success.html";
  });
}
