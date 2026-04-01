/**
 * app.js
 * Main application entry point and initialization
 */

import { store } from './store/store.js';
import { showToast } from './utils/helpers.js';
import { STORAGE_KEYS } from './utils/constants.js';

// ═══════════════════════════════════════════════════════════════════════════
// DEVICE MANAGEMENT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get Device UUID - generated once per browser, stored in localStorage
 * Required by backend for device authentication
 */
function getDeviceUUID() {
  let uuid = localStorage.getItem('deviceUUID');
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem('deviceUUID', uuid);
  }
  return uuid;
}

/**
 * Get Device Type - auto-detect from user agent
 * Returns: MOBILE, TABLET, or LAPTOP
 */
function getDeviceType() {
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone/.test(ua)) return 'MOBILE';
  if (/tablet|ipad/.test(ua)) return 'TABLET';
  return 'LAPTOP';
}

/**
 * Get Device Name - extract from user agent string
 */
function getDeviceName() {
  return navigator.userAgent.split(')')[0].split('(')[1] || 'Browser';
}

/**
 * Build auth headers with device info and token
 * Call this in ALL API requests
 */
function authHeaders() {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'x-device-uuid': getDeviceUUID()
  };
  if (token) {
    headers['x-access-token'] = token;
  }
  return headers;
}

/**
 * Save new token from response header
 * Backend sends token in response header: x-access-token
 */
function saveNewToken(res) {
  const token = res.headers.get('x-access-token');
  if (token) {
    localStorage.setItem('accessToken', token);
  }
}

class App {
  constructor() {
    this.store = store;
    this.isInitialized = false;
  }

  /**
   * Initialize application
   */
  async init() {
    try {
      console.log('[App] Initializing...');
      
      // ✅ CHECK AUTHENTICATION TOKEN
      const token = localStorage.getItem('accessToken');
      const deviceUUID = localStorage.getItem('deviceUUID');
      
      if (!token) {
        console.log('[App] ⚠️  No authentication token found. Redirecting to login...');
        showToast('Session expired. Please login again.', 'warning');
        // Redirect to Authentication Dashboard
        window.location.href = 'http://localhost:5500';
        return;
      }
      
      console.log('[App] ✅ Auth token found');
      console.log('[App] ✅ Device UUID:', deviceUUID);
      
      // Load persisted state
      this.store.loadPersistedState();
      
      // Check if user is authenticated
      const user = this.store.getState('user');
      if (user.isAuthenticated) {
        console.log('[App] User authenticated:', user.id);
      } else {
        console.log('[App] No authenticated user');
      }
      
      // Initialize UI
      this.setupEventListeners();
      this.setupNavigation();
      this.updateUserDisplay();
      
      // Subscribe to store changes
      this.store.subscribe((state) => this.onStateChange(state));
      
      this.isInitialized = true;
      console.log('[App] Initialization complete');
      
    } catch (error) {
      console.error('[App] Initialization failed:', error);
      showToast('Failed to initialize application', 'error');
    }
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Handle navigation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-link]');
      if (link) {
        e.preventDefault();
        this.navigateTo(link.getAttribute('data-link'));
      }
    });

    // Handle sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('mainSidebar');
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('show');
      });

      // Close sidebar when clicking outside
      document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('show') && 
            !sidebar.contains(e.target) && 
            e.target !== sidebarToggle) {
          sidebar.classList.remove('show');
        }
      });

      // Close sidebar when a link is clicked
      sidebar.querySelectorAll('a[data-link]').forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth < 769) {
            sidebar.classList.remove('show');
          }
        });
      });
    }

    // Handle theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = this.store.getState('ui')?.theme || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.store.setTheme(newTheme);
      });
    }

    // Handle logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }

    // Handle modal close
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('appModal');
      if (modal && e.target === modal) {
        this.closeModal();
      }
      
      const closeBtn = e.target.closest('.modal-close-btn');
      if (closeBtn) {
        this.closeModal();
      }
    });

    // Handle form submission
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.classList.contains('form-validated')) {
        // Validation will be handled by individual form handlers
      }
    });

    // Listen for Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('appModal');
        if (modal && modal.classList.contains('show')) {
          this.closeModal();
        }
      }
    });

    // Handle resize to hide sidebar on large screens
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 769 && sidebar) {
        sidebar.classList.remove('show');
      }
    });
  }

  /**
   * Setup navigation routing
   */
  setupNavigation() {
    const hash = window.location.hash;
    if (hash) {
      this.loadPage(hash.substring(2)); // Remove '#/'
    } else {
      this.loadPage('/');
    }

    // Listen for hash changes
    window.addEventListener('hashchange', (e) => {
      const hash = window.location.hash;
      if (hash) {
        this.loadPage(hash.substring(2));
      } else {
        this.loadPage('/');
      }
    });
  }

  /**
   * Update active menu item in sidebar
   */
  updateActiveMenu(route) {
    // Remove active class from all menu items
    document.querySelectorAll('.sidebar-menu-item').forEach(item => {
      item.classList.remove('active');
    });

    // Add active class to current page menu item
    const cleanRoute = route.split('?')[0] || '/';
    const routeName = cleanRoute === '/' ? 'dashboard' : cleanRoute;

    const activeLink = document.querySelector(`.sidebar-menu-item[data-page="${routeName}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  /**
   * Load page dynamically
   */
  async loadPage(route) {
    const mainContent = document.getElementById('page-content');
    if (!mainContent) {
      console.error('[App] Main content element not found!');
      return;
    }

    console.log('[App] Loading page:', route);

    try {
      const pagePath = this.getPagePath(route);
      console.log('[App] Fetching:', pagePath);
      
      const response = await fetch(pagePath);
      console.log('[App] Response status:', response.status);
      
      if (!response.ok) throw new Error(`Page not found: ${route} (${response.status})`);
      
      const html = await response.text();
      mainContent.innerHTML = html;
      console.log('[App] Page HTML loaded');

      // Update active menu item in sidebar
      this.updateActiveMenu(route);

      // Load and initialize page controller
      await this.initializePageController(route);
    } catch (error) {
      console.error('[App] Failed to load page:', error);
      mainContent.innerHTML = `
        <div class="error-page">
          <h2>Page Not Found</h2>
          <p>${error.message}</p>
          <button class="btn btn-primary" onclick="window.location.hash='#/'">Go to Dashboard</button>
        </div>
      `;
    }
  }

  /**
   * Map route to page path
   */
  getPagePath(route) {
    const routes = {
      '/': './src/pages/dashboard.html',
      'projects': './src/pages/projects.html',
      'requirements': './src/pages/requirements.html',
      'scope': './src/pages/scope.html',
      'features': './src/pages/features.html',
      'stakeholders': './src/pages/stakeholders.html',
      'elaboration': './src/pages/elaboration.html',
      'negotiation': './src/pages/negotiation.html',
      'specification': './src/pages/specification.html',
      'validation': './src/pages/validation.html',
      'activity': './src/pages/activity.html',
      'elicitation': './src/pages/elicitation.html',
      'inception': './src/pages/inception.html',
      'product-request': './src/pages/product-request.html',
      'product-vision': './src/pages/product-vision.html',
      'meetings': './src/pages/meetings.html',
      'participants': './src/pages/participants.html',
      'comments': './src/pages/comments.html'
    };

    const cleanRoute = route.split('?')[0]; // Remove query params
    return routes[cleanRoute] || './src/pages/dashboard.html';
  }

  /**
   * Initialize page controller
   */
  async initializePageController(route) {
    let cleanRoute = route.split('?')[0];
    
    // Normalize empty route to dashboard
    if (!cleanRoute || cleanRoute === '') {
      cleanRoute = '/';
    }
    
    const controllers = {
      'projects': () => import('../pages/projects.js').then(m => new m.ProjectsPage()),
      'requirements': () => import('../pages/requirements.js').then(m => new m.RequirementsPage()),
      'scope': () => import('../pages/scope.js').then(m => new m.ScopePage()),
      'features': () => import('../pages/features.js').then(m => new m.FeaturesPage()),
      'stakeholders': () => import('../pages/stakeholders.js').then(m => new m.StakeholdersPage()),
      'elaboration': () => import('../pages/elaboration.js').then(m => new m.ElaborationPage()),
      'negotiation': () => import('../pages/negotiation.js').then(m => new m.NegotiationPage()),
      'specification': () => import('../pages/specification.js').then(m => new m.SpecificationPage()),
      'validation': () => import('../pages/validation.js').then(m => new m.ValidationPage()),
      'activity': () => import('../pages/activity.js').then(m => new m.ActivityPage()),
      'elicitation': () => import('../pages/elicitation.js').then(m => new m.ElicitationPage()),
      'inception': () => import('../pages/inception.js').then(m => new m.InceptionPage()),
      'product-request': () => import('../pages/product-request.js').then(m => new m.ProductRequestPage()),
      'product-vision': () => import('../pages/product-vision.js').then(m => new m.ProductVisionPage()),
      'meetings': () => import('../pages/meetings.js').then(m => new m.MeetingsPage()),
      'participants': () => import('../pages/participants.js').then(m => new m.ParticipantsPage()),
      'comments': () => import('../pages/comments.js').then(m => new m.CommentsPage()),
      '/': () => import('../pages/dashboard.js').then(m => new m.DashboardPage()),
    };

    const loader = controllers[cleanRoute];
    if (loader) {
      try {
        const controller = await loader();
        console.log('[App] Page controller initialized successfully:', cleanRoute, controller);
      } catch (error) {
        console.error('[App] Failed to initialize page controller for route:', cleanRoute, error);
        console.error('[App] Error details:', error.message, error.stack);
      }
    } else {
      console.warn('[App] No controller found for route:', cleanRoute);
    }
  }

  /**
   * Navigate to a route
   */
  navigateTo(route) {
    window.location.hash = '#' + (route.startsWith('/') ? route : '/' + route);
  }

  /**
   * Show modal
   */
  openModal(modalType, data = null) {
    this.store.toggleModal(modalType);
    
    // Emit custom event for modal handlers
    window.dispatchEvent(new CustomEvent('modal:open', { detail: { type: modalType, data } }));
  }

  /**
   * Close modal
   */
  closeModal() {
    const modal = document.querySelector('.modal.show');
    if (modal) {
      modal.classList.remove('show');
      
      const backdrop = document.querySelector('.modal-backdrop.show');
      if (backdrop) {
        backdrop.classList.remove('show');
      }
      
      this.store.toggleModal(null);
    }
  }

  /**
   * Handle state changes
   */
  onStateChange(state) {
    // Update UI when state changes
    this.updateUserDisplay();
    this.updateNotifications(state);
    this.updateModal(state);
    this.updateTheme(state);
  }

  /**
   * Update notifications
   */
  updateNotifications(state) {
    const notification = state.ui.notification;
    if (notification) {
      showToast(notification.message, notification.type);
    }
  }

  /**
   * Update modal visibility
   */
  updateModal(state) {
    const modal = document.querySelector('.modal');
    const backdrop = document.querySelector('.modal-backdrop');
    
    if (!modal || !backdrop) return;

    if (state.ui.modalOpen) {
      modal.classList.add('show');
      backdrop.classList.add('show');
    } else {
      modal.classList.remove('show');
      backdrop.classList.remove('show');
    }
  }

  /**
   * Update theme
   */
  updateTheme(state) {
    const theme = state.ui.theme;
    document.documentElement.setAttribute('data-theme', theme);
    const themeToggleBtn = document.getElementById('themeToggle');
    
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
      if (themeToggleBtn) themeToggleBtn.textContent = '◑';
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      if (themeToggleBtn) themeToggleBtn.textContent = '◐';
    }
  }

  /**
   * Update user display name in header
   */
  updateUserDisplay() {
    const userNameElement = document.getElementById('user-name');
    if (!userNameElement) return;

    // Try to get from localStorage first (from signup)
    let displayName = localStorage.getItem('userName');
    
    if (!displayName) {
      // Fallback: Get email from localStorage and extract username
      const email = localStorage.getItem('signupEmail');
      if (email) {
        displayName = email.split('@')[0]
          .replace(/[._-]/g, ' ')  // Replace separators with spaces
          .split(' ')              // Split by spaces
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // Capitalize each word
          .join(' ');              // Join back
      }
    }
    
    if (displayName) {
      userNameElement.textContent = displayName;
    }
  }


  showError(message) {
    this.store.addNotification(message, 'error');
  }

  /**
   * Show success notification
   */
  showSuccess(message) {
    this.store.addNotification(message, 'success');
  }

  /**
   * Show warning notification
   */
  showWarning(message) {
    this.store.addNotification(message, 'warning');
  }

  /**
   * Get store
   */
  getStore() {
    return this.store;
  }

  /**
   * Get user
   */
  getUser() {
    return this.store.getState('user');
  }

  /**
   * Logout - clear tokens and redirect to login
   */
  logout() {
    // Clear all authentication tokens from localStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear store
    this.store.logout();
    
    // Show message and redirect
    showToast('Logged out successfully', 'success');
    
    // Redirect to project folder's index.html
    setTimeout(() => {
      window.location.href = '/project/index.html';
    }, 1000);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.store.getState('user.isAuthenticated');
  }

  /**
   * Get current project
   */
  getCurrentProject() {
    return this.store.getState('projects.current');
  }

  /**
   * Set current project
   */
  setCurrentProject(project) {
    this.store.setCurrentProject(project);
  }
}

// Create and export singleton instance
export const app = new App();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Export for global access
window.app = app;

export default app;
