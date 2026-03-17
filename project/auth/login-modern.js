// ── Password toggle eye for login ──
function setupLoginToggleEye() {
  const eyeButtons = document.querySelectorAll('.toggle-eye');
  
  eyeButtons.forEach((eye) => {
    eye.style.cursor = 'pointer';
    eye.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const targetId = this.dataset.target;
      const input = document.getElementById(targetId);
      
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          this.textContent = '👁️‍🗨️';
        } else {
          input.type = 'password';
          this.textContent = '👁';
        }
      }
    });
  });
}

// Setup immediately and on DOM ready
setupLoginToggleEye();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupLoginToggleEye);
}
