/**
 * inception.service.js
 * Inception management operations
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class InceptionService {
  /**
   * Create inception document
   */
  async createInception(inceptionData) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.INCEPTION}/create`,
      inceptionData
    );
  }

  /**
   * Get all inception documents
   */
  async getInceptions(page = 1, pageSize = 10) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.INCEPTION}/list?page=${page}&pageSize=${pageSize}`
    );
  }

  /**
   * Get inception document by ID
   */
  async getInceptionById(inceptionId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.INCEPTION}/get/${inceptionId}`
    );
  }

  /**
   * Update inception document
   */
  async updateInception(inceptionId, updateData) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.INCEPTION}/update/${inceptionId}`,
      updateData
    );
  }

  /**
   * Delete inception document
   */
  async deleteInception(inceptionId) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.INCEPTION}/delete/${inceptionId}`
    );
  }

  /**
   * Get inception documents by project
   */
  async getInceptionsByProject(projectId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.INCEPTION}/project/${projectId}`
    );
  }
}

export const inceptionService = new InceptionService();
export default inceptionService;
