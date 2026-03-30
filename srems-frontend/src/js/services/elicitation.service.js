/**
 * elicitation.service.js
 * Elicitation management operations
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class ElicitationService {
  /**
   * Create elicitation
   */
  async createElicitation(elicitationData) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.ELICITATION}/create`,
      elicitationData
    );
  }

  /**
   * Get all elicitations
   */
  async getElicitations(page = 1, pageSize = 10) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.ELICITATION}/list?page=${page}&pageSize=${pageSize}`
    );
  }

  /**
   * Get elicitation by ID
   */
  async getElicitationById(elicitationId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.ELICITATION}/get/${elicitationId}`
    );
  }

  /**
   * Update elicitation
   */
  async updateElicitation(elicitationId, updateData) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.ELICITATION}/update/${elicitationId}`,
      updateData
    );
  }

  /**
   * Delete elicitation
   */
  async deleteElicitation(elicitationId) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.ELICITATION}/delete/${elicitationId}`
    );
  }

  /**
   * Get elicitations by project
   */
  async getElicitationsByProject(projectId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.ELICITATION}/project/${projectId}`
    );
  }
}

export const elicitationService = new ElicitationService();
export default elicitationService;
