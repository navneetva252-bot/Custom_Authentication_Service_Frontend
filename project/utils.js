// ===== SHARED LOADING MANAGER UTILITY =====
// Include this in all dashboard pages with: <script src="../utils.js"></script>

const LoadingManager = {
  pageLoader: null,
  loadingOverlay: null,
  
  init() {
    this.pageLoader = document.getElementById('pageLoader');
    this.loadingOverlay = document.getElementById('loadingOverlay');
  },
  
  // Page-level loader (full screen with spinner)
  showPageLoader(message = 'Loading...') {
    if (this.pageLoader) {
      const textEl = this.pageLoader.querySelector('.loader-text');
      if (textEl) {
        textEl.innerHTML = `
          ${message}
          <span class="loader-dot"></span>
          <span class="loader-dot"></span>
          <span class="loader-dot"></span>
        `;
      }
      this.pageLoader.classList.remove('hidden');
    }
  },
  
  hidePageLoader() {
    if (this.pageLoader) {
      this.pageLoader.classList.add('hidden');
    }
  },
  
  // Modal overlay loader (for forms/requests)
  showLoadingOverlay(message = 'Processing...') {
    if (this.loadingOverlay) {
      const textEl = this.loadingOverlay.querySelector('#loadingText');
      if (textEl) textEl.textContent = message;
      this.loadingOverlay.classList.add('active');
    }
  },
  
  hideLoadingOverlay() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.remove('active');
    }
  },
  
  // Button loading state
  showButtonLoading(buttonId) {
    const btn = document.getElementById(buttonId);
    if (btn) {
      btn.classList.add('loading');
      btn.disabled = true;
      const originalText = btn.textContent;
      btn.setAttribute('data-original-text', originalText);
    }
  },
  
  hideButtonLoading(buttonId) {
    const btn = document.getElementById(buttonId);
    if (btn) {
      btn.classList.remove('loading');
      btn.disabled = false;
      const originalText = btn.getAttribute('data-original-text');
      if (originalText) btn.textContent = originalText;
    }
  },
  
  // Form field loading state
  showFieldLoading(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) field.classList.add('loading');
  },
  
  hideFieldLoading(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) field.classList.remove('loading');
  }
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    LoadingManager.init();
  });
} else {
  LoadingManager.init();
}
