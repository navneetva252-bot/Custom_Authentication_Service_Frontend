import { showToast, debounce } from '../utils/helpers.js';
import productVisionService from '../js/services/product-vision.service.js';

export class ProductVisionPage {
  constructor() {
    this.visions = [];
    this.filteredVisions = [];
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadProductVisions();
  }

  attachEventListeners() {
    document.getElementById('btnCreateProductVision')?.addEventListener('click', () => this.openCreateModal());
    document.getElementById('btnCreateProductVisionEmpty')?.addEventListener('click', () => this.openCreateModal());
    
    document.getElementById('filterVisionStatus')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('searchProductVision')?.addEventListener('input', debounce(() => this.applyFilters(), 300));
  }

  async loadProductVisions() {
    try {
      const container = document.getElementById('productVisionContainer');
      container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading product vision documents...</p></div>';

      const data = await productVisionService.getProductVisions();
      this.visions = data.data || data || [];
      this.filteredVisions = this.visions;
      this.renderProductVisions();
    } catch (error) {
      console.error('Failed to load product visions:', error);
      showToast(error.message || 'Failed to load product vision documents', 'error');
      this.showEmptyState();
    }
  }

  applyFilters() {
    const status = document.getElementById('filterVisionStatus').value;
    const search = document.getElementById('searchProductVision').value.toLowerCase();

    this.filteredVisions = this.visions.filter(item => {
      const statusMatch = !status || item.status === status;
      const searchMatch = !search || 
        item.title?.toLowerCase().includes(search) ||
        item.productName?.toLowerCase().includes(search);
      return statusMatch && searchMatch;
    });

    this.renderProductVisions();
  }

  renderProductVisions() {
    const container = document.getElementById('productVisionContainer');
    const emptyState = document.getElementById('emptyProductVision');

    if (this.filteredVisions.length === 0) {
      this.showEmptyState();
      return;
    }

    emptyState.classList.add('hidden');
    container.innerHTML = this.filteredVisions.map(item => `
      <div class="card vision-card">
        <div class="card-header">
          <h3>${item.title || 'Untitled Vision'}</h3>
          <span class="status-badge status-${item.status || 'draft'}">${item.status || 'Draft'}</span>
        </div>
        <div class="card-body">
          <p><strong>Product:</strong> ${item.productName || 'N/A'}</p>
          <p><strong>Vision Statement:</strong> ${item.visionStatement || 'Not defined'}</p>
          <p><strong>Target Market:</strong> ${item.targetMarket || 'N/A'}</p>
          <p><strong>Key Objectives:</strong></p>
          <ul class="objectives-list">
            ${(item.keyObjectives || []).slice(0, 3).map(obj => `<li>${obj}</li>`).join('')}
          </ul>
          <p><strong>Created:</strong> ${new Date(item.createdAt).toLocaleDateString() || 'N/A'}</p>
        </div>
        <div class="card-actions">
          <button class="btn btn-sm btn-primary" data-id="${item.id}">View</button>
          <button class="btn btn-sm btn-warning" data-id="${item.id}">Edit</button>
          <button class="btn btn-sm btn-danger" data-id="${item.id}">Delete</button>
        </div>
      </div>
    `).join('');
  }

  showEmptyState() {
    document.getElementById('emptyProductVision')?.classList.remove('hidden');
    document.getElementById('productVisionContainer').innerHTML = '';
  }

  openCreateModal() {
    showToast('Create product vision document feature coming soon', 'info');
  }
}
