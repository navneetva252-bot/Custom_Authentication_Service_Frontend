// API Configuration
// Using CORS Proxy on port 3000 to bypass CORS issues
const ADMIN_API_BASE_URL = 'http://localhost:3000/admin-panel-service/api/v1';

const API = {
  // Get auth headers
  getHeaders() {
    const token = localStorage.getItem('adminAuthToken');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  },

  // Generic request method
  async request(method, endpoint, data = null) {
    const url = `${ADMIN_API_BASE_URL}${endpoint}`;
    const config = {
      method,
      headers: this.getHeaders(),
      mode: 'cors',
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired - redirect to login
          localStorage.removeItem('adminAuthToken');
          localStorage.removeItem('adminRefreshToken');
          localStorage.removeItem('adminData');
          window.location.href = '../auth/login.html';
        }
        throw new Error(result.message || `API Error: ${response.status}`);
      }

      return result.data || result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Auth Endpoints
  adminLogin(credentials) {
    return this.request('POST', '/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
  },

  adminLogout() {
    return this.request('POST', '/auth/logout');
  },

  // Admin Endpoints
  getAdmins(page = 1, limit = 10) {
    return this.request('GET', `/admins?page=${page}&limit=${limit}`);
  },

  createAdmin(adminData) {
    return this.request('POST', '/admins', adminData);
  },

  getAdmin(adminId) {
    return this.request('GET', `/admins/${adminId}`);
  },

  updateAdmin(adminId, adminData) {
    return this.request('PUT', `/admins/${adminId}`, adminData);
  },

  blockAdmin(adminId) {
    return this.request('POST', `/admins/${adminId}/block`);
  },

  unblockAdmin(adminId) {
    return this.request('POST', `/admins/${adminId}/unblock`);
  },

  // User Endpoints
  getUsers(page = 1, limit = 10) {
    return this.request('GET', `/users?page=${page}&limit=${limit}`);
  },

  getUser(userId) {
    return this.request('GET', `/users/${userId}`);
  },

  blockUser(userId) {
    return this.request('POST', `/users/${userId}/block`);
  },

  unblockUser(userId) {
    return this.request('POST', `/users/${userId}/unblock`);
  },

  convertUserToClient(userId) {
    return this.request('POST', `/users/${userId}/convert-to-client`);
  },

  // Organization Endpoints
  getOrganizations(page = 1, limit = 10) {
    return this.request('GET', `/organizations?page=${page}&limit=${limit}`);
  },

  createOrganization(orgData) {
    return this.request('POST', '/organizations', orgData);
  },

  getOrganization(orgId) {
    return this.request('GET', `/organizations/${orgId}`);
  },

  updateOrganization(orgId, orgData) {
    return this.request('PUT', `/organizations/${orgId}`, orgData);
  },

  addUserToOrganization(orgId, userId) {
    return this.request('POST', `/organizations/${orgId}/users/${userId}/add`);
  },

  removeUserFromOrganization(orgId, userId) {
    return this.request('POST', `/organizations/${orgId}/users/${userId}/remove`);
  },

  disableOrganization(orgId) {
    return this.request('POST', `/organizations/${orgId}/disable`);
  },

  enableOrganization(orgId) {
    return this.request('POST', `/organizations/${orgId}/enable`);
  },

  // Device Endpoints
  getDevices(page = 1, limit = 10) {
    return this.request('GET', `/devices?page=${page}&limit=${limit}`);
  },

  getDevice(deviceId) {
    return this.request('GET', `/devices/${deviceId}`);
  },

  blockDevice(deviceId) {
    return this.request('POST', `/devices/${deviceId}/block`);
  },

  unblockDevice(deviceId) {
    return this.request('POST', `/devices/${deviceId}/unblock`);
  },

  // Activity Tracker Endpoints
  getActivityTracker(page = 1, limit = 10) {
    return this.request('GET', `/activity-trackers?page=${page}&limit=${limit}`);
  },

  getMyActivities(page = 1, limit = 10) {
    return this.request('GET', `/activity-trackers/my-activities?page=${page}&limit=${limit}`);
  },

  getActivityDetail(activityId) {
    return this.request('GET', `/activity-trackers/${activityId}`);
  },
};

console.log('✅ API module loaded');
