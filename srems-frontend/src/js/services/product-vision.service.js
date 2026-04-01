/**
 * product-vision.service.js
 * Product vision management operations
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class ProductVisionService {
  /**
   * Create product vision
   */
  async createProductVision(visionData) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.PRODUCT_VISION}/create`,
      visionData
    );
  }

  /**
   * Get product vision for a project
   * Backend: /product-vision/get/:projectId (NO list endpoint)
   */
  async getProductVisions(projectId = 'all') {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.PRODUCT_VISION}/get/${projectId}`
      );
      
      if (!response.success) {
        return [];
      }
      
      // Backend returns single object or array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data ? [response.data] : [];
    } catch (error) {
      console.error('Failed to fetch product visions:', error);
      return [];
    }
  }

  /**
   * Get product vision by ID
   */
  async getProductVisionById(visionId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.PRODUCT_VISION}/get/${visionId}`
    );
  }

  /**
   * Update product vision
   */
  async updateProductVision(visionId, updateData) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PRODUCT_VISION}/update/${visionId}`,
      updateData
    );
  }

  /**
   * Delete product vision
   */
  async deleteProductVision(visionId) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.PRODUCT_VISION}/delete/${visionId}`
    );
  }

  /**
   * Get product visions by product
   */
  async getProductVisionsByProduct(productId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.PRODUCT_VISION}/product/${productId}`
    );
  }

  /**
   * Get product visions by status
   */
  async getProductVisionsByStatus(status) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.PRODUCT_VISION}/status/${status}`
    );
  }
}

export const productVisionService = new ProductVisionService();
export default productVisionService;
