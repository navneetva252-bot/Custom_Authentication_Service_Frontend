import { requirementsService } from '../js/services/requirements.service.js';
import { store } from '../js/store/store.js';
import { showToast, showModal, hideModal } from '../js/utils/helpers.js';

export class ValidationPage {
  constructor() {
    this.requirements = [];
    this.validationData = {};
    this.currentReqIndex = 0;
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadRequirements();
  }

  attachEventListeners() {
    document.getElementById('btnStartValidation')?.addEventListener('click', () => this.startValidation());
    document.getElementById('validationForm')?.addEventListener('submit', (e) => this.handleValidationSubmit(e));

    document.querySelectorAll('.rating-btn')?.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.rating-btn').forEach(b => b.removeAttribute('selected'));
        e.target.setAttribute('selected', 'true');
        document.getElementById('val-rating').value = e.target.dataset.rating;
      });
    });
  }

  async loadRequirements() {
    try {
      const projectId = store.getState().currentProject;
      if (!projectId) {
        showToast('Please select a project', 'warning');
        return;
      }

      this.requirements = await requirementsService.getRequirements(projectId);
      this.renderValidationProgress();
      this.renderValidationItems();
    } catch (error) {
      showToast(error.message || 'Failed to load requirements', 'error');
    }
  }

  renderValidationProgress() {
    const validated = this.requirements.filter(r => r.validationData?.isApproved).length;
    const issues = this.requirements.filter(r => r.validationData?.issues).length;

    document.getElementById('valTotal').textContent = this.requirements.length;
    document.getElementById('valValidated').textContent = validated;
    document.getElementById('valIssues').textContent = issues;

    const allApproved = validated === this.requirements.length && this.requirements.length > 0;
    document.getElementById('valStatus').textContent = allApproved ? 'Approved' : 'In Progress';
    document.getElementById('valStatus').className = allApproved ? 'badge success' : 'badge warning';
  }

  renderValidationItems() {
    const container = document.getElementById('validationContainer');
    if (this.requirements.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No requirements to validate</p></div>';
      return;
    }

    container.innerHTML = this.requirements.map((req, idx) => {
      const valData = req.validationData || {};
      const isApproved = valData.isApproved;
      const score = valData.qualityRating || 0;

      return `
        <div class="validation-item ${isApproved ? 'approved' : ''}" data-index="${idx}">
          <div class="item-header">
            <div class="item-number">${idx + 1}</div>
            <div class="item-content">
              <p class="item-description">${req.description}</p>
              <div class="item-badges">
                <span class="badge">${req.type}</span>
                <span class="badge">${req.priority}</span>
              </div>
            </div>
          </div>
          <div class="item-status">
            ${isApproved ? `
              <div class="approval-badge">
                <span class="approved-check">✓</span> Approved
              </div>
            ` : `
              <button class="btn btn-sm btn-primary validate-btn">Validate</button>
            `}
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.validate-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('.validation-item').dataset.index);
        this.openValidationModal(index);
      });
    });
  }

  openValidationModal(index) {
    this.currentReqIndex = index;
    const req = this.requirements[index];
    const valData = req.validationData || {};

    document.getElementById('valReqPreview').innerHTML = `
      <div class="requirement-details">
        <h4>${req.description}</h4>
        <div class="details-row">
          <span><strong>Type:</strong> ${req.type}</span>
          <span><strong>Priority:</strong> ${req.priority}</span>
          ${req.elaborationDetails?.acceptanceCriteria ? `
            <div class="acceptance">
              <strong>Acceptance Criteria:</strong>
              <pre>${req.elaborationDetails.acceptanceCriteria}</pre>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Load saved validation data
    document.getElementById('val-complete').checked = valData.isComplete || false;
    document.getElementById('val-testable').checked = valData.isTestable || false;
    document.getElementById('val-traceable').checked = valData.isTraceable || false;
    document.getElementById('val-consistent').checked = valData.isConsistent || false;
    document.getElementById('val-feasible').checked = valData.isFeasible || false;
    document.getElementById('val-rating').value = valData.qualityRating || '3';
    document.getElementById('val-issues').value = valData.issues || '';
    document.getElementById('val-comments').value = valData.comments || '';
    document.getElementById('val-approved').checked = valData.isApproved || false;

    // Update rating button states
    document.querySelectorAll('.rating-btn').forEach(btn => {
      btn.removeAttribute('selected');
      if (btn.dataset.rating === String(valData.qualityRating || '3')) {
        btn.setAttribute('selected', 'true');
      }
    });

    showModal('validationModal');
  }

  async handleValidationSubmit(event) {
    event.preventDefault();

    const req = this.requirements[this.currentReqIndex];
    const validationData = {
      isComplete: document.getElementById('val-complete').checked,
      isTestable: document.getElementById('val-testable').checked,
      isTraceable: document.getElementById('val-traceable').checked,
      isConsistent: document.getElementById('val-consistent').checked,
      isFeasible: document.getElementById('val-feasible').checked,
      qualityRating: parseInt(document.getElementById('val-rating').value),
      issues: document.getElementById('val-issues').value,
      comments: document.getElementById('val-comments').value,
      isApproved: document.getElementById('val-approved').checked,
      validatedAt: new Date().toISOString(),
      validatedBy: store.getState().userId || 'validator',
    };

    try {
      await requirementsService.updateRequirement(req._id, { validationData });
      showToast('Validation saved', 'success');
      hideModal('validationModal');
      await this.loadRequirements();

      // Move to next unvalidated
      const nextUnvalidated = this.requirements.findIndex((r, idx) => idx > this.currentReqIndex && !r.validationData?.isApproved);
      if (nextUnvalidated !== -1) {
        setTimeout(() => this.openValidationModal(nextUnvalidated), 500);
      }
    } catch (error) {
      showToast(error.message || 'Failed to save validation', 'error');
    }
  }

  startValidation() {
    const unvalidated = this.requirements.findIndex(r => !r.validationData?.isApproved);
    if (unvalidated === -1) {
      showToast('All requirements validated!', 'info');
      return;
    }
    this.openValidationModal(unvalidated);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ValidationPage();
  });
} else {
  new ValidationPage();
}
