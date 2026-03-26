/**
 * store.js
 * Centralized state management (like Redux but simpler)
 * Single source of truth for all application state
 */

import { storage } from '../utils/helpers.js';
import { STORAGE_KEYS } from '../utils/constants.js';

class Store {
  constructor() {
    // Initialize state with defaults
    this.state = {
      // User authentication
      user: {
        id: null,
        role: null,
        token: null,
        isAuthenticated: false
      },

      // Projects
      projects: {
        list: [],
        current: null,
        loading: false,
        error: null,
        filters: {
          status: null,
          search: '',
          page: 1,
          pageSize: 10
        }
      },

      // Stakeholders
      stakeholders: {
        list: [],
        loading: false,
        error: null,
        page: 1,
        pageSize: 10
      },

      // Requirements
      requirements: {
        list: [],
        byType: {
          FUNCTIONAL: [],
          NON_FUNCTIONAL: [],
          EXCITED: []
        },
        current: null,
        loading: false,
        error: null,
        filters: {
          type: null,
          status: null,
          search: '',
          elicitationId: null
        }
      },

      // Scope
      scope: {
        inScope: [],
        outOfScope: [],
        partialScope: [],
        loading: false,
        error: null
      },

      // Features
      features: {
        list: [],
        loading: false,
        error: null
      },

      // Elicitation
      elicitation: {
        data: null,
        method: null,
        loading: false,
        error: null
      },

      // Elaboration
      elaboration: {
        data: null,
        loading: false,
        error: null
      },

      // Negotiation
      negotiation: {
        data: null,
        voting: {},
        loading: false,
        error: null
      },

      // Specification
      specification: {
        data: null,
        loading: false,
        error: null
      },

      // Validation
      validation: {
        data: null,
        approvals: {},
        loading: false,
        error: null
      },

      // Comments
      comments: {
        byEntity: {},
        loading: false,
        error: null
      },

      // Activity tracking
      activity: {
        list: [],
        loading: false,
        error: null,
        page: 1,
        pageSize: 20
      },

      // UI state
      ui: {
        modalOpen: false,
        modalType: null,
        sidebarOpen: true,
        notification: null,
        theme: storage.get(STORAGE_KEYS.THEME) || 'light'
      }
    };

    // Store subscribers for reactive state changes
    this.subscribers = new Set();

    // Load persisted state from localStorage
    this.loadPersistedState();
  }

  /**
   * Load persisted state from localStorage
   */
  loadPersistedState() {
    const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);
    const userId = storage.get(STORAGE_KEYS.USER_ID);
    const userRole = storage.get(STORAGE_KEYS.USER_ROLE);

    if (token) {
      this.state.user = {
        id: userId,
        role: userRole,
        token,
        isAuthenticated: true
      };
    }
  }

  /**
   * Get entire state or specific path
   */
  getState(path = null) {
    if (!path) return this.state;
    
    const keys = path.split('.');
    let value = this.state;
    
    for (const key of keys) {
      value = value[key];
      if (value === undefined) return null;
    }
    
    return value;
  }

  /**
   * Update state (immutable)
   */
  setState(updates) {
    this.state = {
      ...this.state,
      ...updates
    };
    
    this.notifySubscribers();
  }

  /**
   * Update nested state
   */
  updateNestedState(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    let target = this.state;
    for (const key of keys) {
      target = target[key];
    }
    
    target[lastKey] = value;
    this.notifySubscribers();
  }

  /**
   * Set user authentication
   */
  setUser(user) {
    this.state.user = {
      ...user,
      isAuthenticated: true
    };
    
    // Persist to localStorage
    storage.set(STORAGE_KEYS.AUTH_TOKEN, user.token);
    storage.set(STORAGE_KEYS.USER_ID, user.id);
    storage.set(STORAGE_KEYS.USER_ROLE, user.role);
    
    this.notifySubscribers();
  }

  /**
   * Logout user
   */
  logout() {
    this.state.user = {
      id: null,
      role: null,
      token: null,
      isAuthenticated: false
    };
    
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER_ID);
    storage.remove(STORAGE_KEYS.USER_ROLE);
    
    this.notifySubscribers();
  }

  /**
   * Set projects
   */
  setProjects(projects) {
    this.state.projects.list = projects;
    this.notifySubscribers();
  }

  /**
   * Set current project
   */
  setCurrentProject(project) {
    this.state.projects.current = project;
    storage.set(STORAGE_KEYS.CURRENT_PROJECT, project);
    this.notifySubscribers();
  }

  /**
   * Update requirements by type (QFD mode)
   */
  setRequirementsByType(type, requirements) {
    if (this.state.requirements.byType[type]) {
      this.state.requirements.byType[type] = requirements;
      this.notifySubscribers();
    }
  }

  /**
   * Add requirement
   */
  addRequirement(requirement) {
    this.state.requirements.list.push(requirement);
    
    if (requirement.type && this.state.requirements.byType[requirement.type]) {
      this.state.requirements.byType[requirement.type].push(requirement);
    }
    
    this.notifySubscribers();
  }

  /**
   * Update requirement
   */
  updateRequirement(requirementId, updates) {
    const index = this.state.requirements.list.findIndex(r => r._id === requirementId);
    if (index !== -1) {
      this.state.requirements.list[index] = {
        ...this.state.requirements.list[index],
        ...updates
      };
      this.notifySubscribers();
    }
  }

  /**
   * Remove requirement
   */
  removeRequirement(requirementId) {
    this.state.requirements.list = this.state.requirements.list.filter(r => r._id !== requirementId);
    
    // Remove from byType as well
    Object.keys(this.state.requirements.byType).forEach(type => {
      this.state.requirements.byType[type] = this.state.requirements.byType[type].filter(r => r._id !== requirementId);
    });
    
    this.notifySubscribers();
  }

  /**
   * Set loading state
   */
  setLoading(section, loading) {
    if (this.state[section]) {
      this.state[section].loading = loading;
      this.notifySubscribers();
    }
  }

  /**
   * Set error state
   */
  setError(section, error) {
    if (this.state[section]) {
      this.state[section].error = error;
      this.notifySubscribers();
    }
  }

  /**
   * Clear error
   */
  clearError(section) {
    if (this.state[section]) {
      this.state[section].error = null;
      this.notifySubscribers();
    }
  }

  /**
   * Add notification
   */
  addNotification(message, type = 'info') {
    this.state.ui.notification = { message, type };
    this.notifySubscribers();
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      this.state.ui.notification = null;
      this.notifySubscribers();
    }, 3000);
  }

  /**
   * Toggle modal
   */
  toggleModal(modalType = null) {
    this.state.ui.modalOpen = modalType !== null;
    this.state.ui.modalType = modalType;
    this.notifySubscribers();
  }

  /**
   * Set theme
   */
  setTheme(theme) {
    this.state.ui.theme = theme;
    storage.set(STORAGE_KEYS.THEME, theme);
    this.notifySubscribers();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers
   */
  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  /**
   * Reset store to initial state
   */
  reset() {
    this.state = {
      ...this.state,
      projects: { ...this.state.projects, list: [], current: null },
      requirements: { ...this.state.requirements, list: [], byType: { FUNCTIONAL: [], NON_FUNCTIONAL: [], EXCITED: [] } },
      stakeholders: { ...this.state.stakeholders, list: [] },
      scope: { ...this.state.scope, inScope: [], outOfScope: [], partialScope: [] },
      features: { ...this.state.features, list: [] }
    };
    
    this.notifySubscribers();
  }
}

// Create singleton instance
export const store = new Store();

/**
 * Helper hook-like function to use state
 */
export function useState(statePath) {
  const state = store.getState(statePath);
  
  return [
    state,
    (updates) => store.updateNestedState(statePath, updates)
  ];
}

export default store;
