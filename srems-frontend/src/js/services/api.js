/**
 * api.js
 * Base API client wrapper - centralized HTTP communication
 * Like backend's common services
 */

import { API_CONFIG, UI_MESSAGES } from '../utils/constants.js';
import { HTTP_STATUS, ERROR_MESSAGES, API_OPTIONS } from '../utils/config.js';

class ApiClient {
  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}${API_CONFIG.BASE_PATH}${API_CONFIG.API_VERSION}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get auth token from storage
   */
  getAuthToken() {
    return localStorage.getItem('accessToken') || null;
  }

  /**
   * Build complete URL with base
   */
  buildUrl(endpoint) {
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * Build headers with auth token and device info
   */
  buildHeaders() {
    const headers = { ...this.defaultHeaders };
    const token = this.getAuthToken();
    
    // Add required device headers for backend authorization
    headers['x-device-uuid'] = getDeviceUUID();
    headers['x-device-type'] = getDeviceType();
    
    // Add access token in correct header format (NOT Authorization Bearer)
    if (token) {
      headers['x-access-token'] = token;
    }
    
    return headers;
  }

  /**
   * Generic API request method
   */
  async request(method, endpoint, data = null, options = {}) {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders();
    
    const config = {
      method,
      headers,
      ...options
    };

    // Add body for non-GET requests
    if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    try {
      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_OPTIONS.TIMEOUT);
      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Handle response
      const contentType = response.headers.get('content-type');
      let responseData;

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Check if response is OK
      if (!response.ok) {
        const error = new Error(
          responseData?.message || ERROR_MESSAGES[response.status] || 'API Error'
        );
        error.status = response.status;
        error.data = responseData;
        throw error;
      }

      return {
        success: true,
        status: response.status,
        data: responseData
      };

    } catch (error) {
      let errorMessage = error.message;
      let errorCode = error.status || ERROR_MESSAGES.NETWORK_ERROR;

      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Please try again.';
        errorCode = 'TIMEOUT';
      }

      console.error(`[API Error] ${method} ${endpoint}:`, error);

      return {
        success: false,
        status: errorCode,
        message: errorMessage,
        error: error
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET requests
  // ═══════════════════════════════════════════════════════════════════════════

  async get(endpoint, options = {}) {
    return this.request('GET', endpoint, null, options);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // POST requests
  // ═══════════════════════════════════════════════════════════════════════════

  async post(endpoint, data, options = {}) {
    return this.request('POST', endpoint, data, options);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PATCH requests
  // ═══════════════════════════════════════════════════════════════════════════

  async patch(endpoint, data, options = {}) {
    return this.request('PATCH', endpoint, data, options);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE requests
  // ═══════════════════════════════════════════════════════════════════════════

  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, null, options);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUT requests
  // ═══════════════════════════════════════════════════════════════════════════

  async put(endpoint, data, options = {}) {
    return this.request('PUT', endpoint, data, options);
  }

  /**
   * Retry logic for failed requests
   */
  async requestWithRetry(method, endpoint, data = null, retries = API_OPTIONS.RETRY_ATTEMPTS) {
    for (let i = 0; i < retries; i++) {
      const result = await this.request(method, endpoint, data);
      
      if (result.success) {
        return result;
      }

      // Don't retry on client errors (4xx)
      if (result.status >= 400 && result.status < 500) {
        return result;
      }

      // Wait before retry
      if (i < retries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, API_OPTIONS.RETRY_DELAY * (i + 1))
        );
      }
    }

    return result;
  }

  /**
   * Handle error response with user-friendly message
   */
  getErrorMessage(error) {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.data?.message) return error.data.message;
    return UI_MESSAGES.ERROR.API_ERROR;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

export default apiClient;
