export function initValidation({
  passwordInput,
  confirmInput,
  passwordError,
  confirmError,
  messages,
  strongPasswordRegex
}) {
  passwordInput.addEventListener("input", () => {
    passwordError.textContent = strongPasswordRegex.test(passwordInput.value)
      ? ""
      : messages.passwordWeak;
  });

  confirmInput.addEventListener("input", () => {
    confirmError.textContent =
      confirmInput.value === passwordInput.value
        ? ""
        : messages.passwordsMismatch;
  });
}
