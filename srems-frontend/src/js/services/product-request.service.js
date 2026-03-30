/**
 * product-request.service.js
 * Product request management operations
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class ProductRequestService {
  /**
   * Create product request
   */
  async createProductRequest(requestData) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.PRODUCT_REQUESTS}/create`,
      requestData
    );
  }

  /**
   * Get all product requests
   */
  async getProductRequests(page = 1, pageSize = 10) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.PRODUCT_REQUESTS}/list?page=${page}&pageSize=${pageSize}`
    );
  }

  /**
   * Get product request by ID
   */
  async getProductRequestById(requestId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.PRODUCT_REQUESTS}/get/${requestId}`
    );
  }

  /**
   * Update product request
   */
  async updateProductRequest(requestId, updateData) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PRODUCT_REQUESTS}/update/${requestId}`,
      updateData
    );
  }

  /**
   * Delete product request
   */
  async deleteProductRequest(requestId) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.PRODUCT_REQUESTS}/delete/${requestId}`
    );
  }

  /**
   * Get product requests by priority
   */
  async getProductRequestsByPriority(priority) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.PRODUCT_REQUESTS}/priority/${priority}`
    );
  }

  /**
   * Get product requests by status
   */
  async getProductRequestsByStatus(status) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.PRODUCT_REQUESTS}/status/${status}`
    );
  }
}

export const productRequestService = new ProductRequestService();
export default productRequestService;
