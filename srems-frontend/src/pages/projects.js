import { projectsService } from '../js/services/projects.service.js';
import { store } from '../js/store/store.js';
import { showToast, showConfirmDialog, showModal, hideModal, debounce, formatDate } from '../js/utils/helpers.js';
import { validateFormData } from '../js/utils/config.js';
import { PHASES, PROJECT_STATUS, STATUS_COLORS as COLORS } from '../js/utils/constants.js';

export class ProjectsPage {
  constructor() {
    this.projects = [];
    this.filteredProjects = [];
    this.editingProjectId = null;
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadProjects();
  }

  attachEventListeners() {
    // Create project buttons
    document.getElementById('btnCreateProject')?.addEventListener('click', () => this.openCreateModal());
    document.getElementById('btnCreateProjectEmpty')?.addEventListener('click', () => this.openCreateModal());

    // Form submission
    document.getElementById('projectForm')?.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Filters
    document.getElementById('filterStatus')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('searchProjects')?.addEventListener('input', debounce(() => this.applyFilters(), 300));
  }

  async loadProjects() {
    try {
      const container = document.getElementById('projectsContainer');
      container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading projects...</p></div>';

      const data = await projectsService.getProjects();
      this.projects = Array.isArray(data) ? data : [];
      this.filteredProjects = this.projects;
      this.renderProjects();
    } catch (error) {
      showToast(error.message || 'Failed to load projects', 'error');
      // Initialize with empty arrays to prevent .filter() errors
      this.projects = [];
      this.filteredProjects = [];
      document.getElementById('projectsContainer').innerHTML = `<div class="error-message">${error.message || 'Failed to load projects'}</div>`;
    }
  }

  applyFilters() {
    const status = document.getElementById('filterStatus').value;
    const search = document.getElementById('searchProjects').value.toLowerCase();
    // Ensure projects is always an array
    if (!Array.isArray(this.projects)) {
      this.projects = [];
    }
    this.filteredProjects = this.projects.filter(p => {
      const statusMatch = !status || p.currentPhase === status;
      const searchMatch = p.name.toLowerCase().includes(search) || p.description?.toLowerCase().includes(search);
      return statusMatch && searchMatch;
    });

    this.renderProjects();
  }

  renderProjects() {
    const container = document.getElementById('projectsContainer');
    const empty = document.getElementById('emptyProjects');

    if (this.filteredProjects.length === 0) {
      container.classList.add('hidden');
      empty.classList.remove('hidden');
      return;
    }

    container.classList.remove('hidden');
    empty.classList.add('hidden');
    container.innerHTML = this.filteredProjects.map(project => this.createProjectCard(project)).join('');

    // Attach card event listeners
    container.querySelectorAll('.project-card').forEach(card => {
      this.attachCardListeners(card);
    });
  }

  createProjectCard(project) {
    const statusBadge = PHASES[project.currentPhase] || project.currentPhase;
    const statusColor = COLORS.phases[project.currentPhase] || '#6c757d';

    return `
      <div class="project-card" data-project-id="${project._id}">
        <div class="card-header">
          <h3 class="card-title">${project.name}</h3>
          <span class="badge" style="background: ${statusColor};">${statusBadge}</span>
        </div>
        <p class="card-description">${project.description || 'No description'}</p>
        <div class="card-meta">
          <div class="meta-item">
            <span class="meta-label">Manager:</span>
            <span class="meta-value">${project.projectManager}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Start:</span>
            <span class="meta-value">${formatDate(project.startDate)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Status:</span>
            <span class="meta-value">${project.projectStatus}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn btn-sm btn-primary view-project">View</button>
          <button class="btn btn-sm btn-secondary edit-project">Edit</button>
          <button class="btn btn-sm btn-danger delete-project">Delete</button>
        </div>
      </div>
    `;
  }

  attachCardListeners(card) {
    const projectId = card.dataset.projectId;

    card.querySelector('.view-project')?.addEventListener('click', () => {
      store.setCurrentProject(projectId);
      window.location.hash = `#/requirements?project=${projectId}`;
    });

    card.querySelector('.edit-project')?.addEventListener('click', () => this.openEditModal(projectId));

    card.querySelector('.delete-project')?.addEventListener('click', () => this.deleteProject(projectId));
  }

  openCreateModal() {
    this.editingProjectId = null;
    document.getElementById('projectForm').reset();
    document.getElementById('projectModalTitle').textContent = 'Create New Project';
    showModal('projectModal');
  }

  openEditModal(projectId) {
    const project = this.projects.find(p => p._id === projectId);
    if (!project) return;

    this.editingProjectId = projectId;
    document.getElementById('projectModalTitle').textContent = 'Edit Project';
    
    document.getElementById('projectName').value = project.name;
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectManager').value = project.projectManager;
    document.getElementById('projectBudget').value = project.budget || '';
    document.getElementById('startDate').value = project.startDate.split('T')[0];
    document.getElementById('endDate').value = project.endDate ? project.endDate.split('T')[0] : '';
    document.getElementById('projectType').value = project.type || '';
    
    showModal('projectModal');
  }

  async handleFormSubmit(event) {
    event.preventDefault();

    const formData = {
      name: document.getElementById('projectName').value,
      description: document.getElementById('projectDescription').value,
      projectManager: document.getElementById('projectManager').value,
      budget: parseFloat(document.getElementById('projectBudget').value) || 0,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      type: document.getElementById('projectType').value,
    };

    // Validate
    const errors = validateFormData(formData, 'project');
    if (errors.length > 0) {
      errors.forEach(err => {
        const errorEl = document.getElementById(`error-${err.field}`);
        if (errorEl) errorEl.textContent = err.message;
      });
      return;
    }

    try {
      showToast(`${this.editingProjectId ? 'Updating' : 'Creating'} project...`, 'info');

      if (this.editingProjectId) {
        await projectsService.updateProject(this.editingProjectId, formData);
        showToast('Project updated successfully', 'success');
      } else {
        const newProject = await projectsService.createProject(formData);
        showToast('Project created successfully', 'success');
        store.setCurrentProject(newProject._id);
      }

      hideModal('projectModal');
      await this.loadProjects();
    } catch (error) {
      showToast(error.message || 'Failed to save project', 'error');
    }
  }

  async deleteProject(projectId) {
    const confirmed = await showConfirmDialog(
      'Delete Project?',
      'This action cannot be undone. All requirements and data will be deleted.',
      'Delete',
      'Cancel'
    );

    if (!confirmed) return;

    try {
      showToast('Deleting project...', 'info');
      await projectsService.deleteProject(projectId);
      showToast('Project deleted successfully', 'success');
      await this.loadProjects();
    } catch (error) {
      showToast(error.message || 'Failed to delete project', 'error');
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ProjectsPage();
  });
} else {
  new ProjectsPage();
}
