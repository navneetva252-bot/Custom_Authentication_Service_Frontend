/**
 * app.js
 * Main application entry point and initialization
 */

import { store } from './store/store.js';
import { showToast } from './utils/helpers.js';
import { STORAGE_KEYS } from './utils/constants.js';

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
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
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
      'activity': './src/pages/activity.html'
    };

    const cleanRoute = route.split('?')[0]; // Remove query params
    return routes[cleanRoute] || './src/pages/dashboard.html';
  }

  /**
   * Initialize page controller
   */
  async initializePageController(route) {
    const cleanRoute = route.split('?')[0];
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
    
    if (theme === 'dark') {
      document.body.style.backgroundColor = '#1e1e1e';
      document.body.style.color = '#f0f0f0';
    } else {
      document.body.style.backgroundColor = '#f5f5f5';
      document.body.style.color = '#333';
    }
  }

  /**
   * Show error notification
   */
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
   * Logout
   */
  logout() {
    this.store.logout();
    this.navigateTo('/login');
    this.showSuccess('Logged out successfully');
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
