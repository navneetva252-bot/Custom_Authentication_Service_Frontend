import { requirementsService } from '../js/services/requirements.service.js';
import { store } from '../js/store/store.js';
import { showToast, showModal, hideModal } from '../js/utils/helpers.js';

export class ElaborationPage {
  constructor() {
    this.requirements = [];
    this.currentReqIndex = 0;
    this.elaborationData = {};
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadRequirements();
  }

  attachEventListeners() {
    document.getElementById('btnStartElaboration')?.addEventListener('click', () => this.startElaboration());
    document.getElementById('elaborationForm')?.addEventListener('submit', (e) => this.handleFormSubmit(e));
  }

  async loadRequirements() {
    try {
      const projectId = store.getState().currentProject;
      if (!projectId) {
        showToast('Please select a project', 'warning');
        return;
      }

      this.requirements = await RequirementsService.getRequirements(projectId);
      this.renderRequirementsQueue();
    } catch (error) {
      showToast(error.message || 'Failed to load requirements', 'error');
    }
  }

  renderRequirementsQueue() {
    const container = document.getElementById('elaborationContainer');
    if (this.requirements.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No requirements to elaborate</p></div>';
      return;
    }

    const elaboratedCount = this.requirements.filter(r => r.elaborated).length;
    document.getElementById('reqToElaborate').textContent = this.requirements.filter(r => !r.elaborated).length;
    document.getElementById('reqCompleted').textContent = elaboratedCount;
    document.getElementById('elaborationProgress').style.width = `${(elaboratedCount / this.requirements.length) * 100}%`;

    container.innerHTML = this.requirements.map((req, idx) => `
      <div class="elaboration-item ${req.elaborated ? 'completed' : ''}" data-index="${idx}">
        <div class="item-header">
          <div class="item-number">${idx + 1}</div>
          <div class="item-content">
            <p class="item-description">${req.description}</p>
            <div class="item-meta">
              <span class="badge">${req.type}</span>
              <span class="badge">${req.priority}</span>
            </div>
          </div>
          <div class="item-status">
            ${req.elaborated ? '<span class="badge success">✓ Done</span>' : '<button class="btn btn-sm btn-primary elaborate-btn">Elaborate</button>'}
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.elaborate-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('.elaboration-item').dataset.index);
        this.openElaborationModal(index);
      });
    });
  }

  openElaborationModal(index) {
    this.currentReqIndex = index;
    const req = this.requirements[index];

    document.getElementById('elaborationTitle').textContent = `Elaborate: ${req.description.substring(0, 50)}...`;
    document.getElementById('reqDisplay').innerHTML = `
      <div class="requirement-preview">
        <p><strong>Description:</strong> ${req.description}</p>
        <p><strong>Type:</strong> ${req.type}</p>
        <p><strong>Priority:</strong> ${req.priority}</p>
      </div>
    `;

    document.getElementById('elab-acceptance-criteria').value = this.elaborationData[req._id]?.acceptanceCriteria || '';
    document.getElementById('elab-dependencies').value = this.elaborationData[req._id]?.dependencies || '';
    document.getElementById('elab-effort').value = this.elaborationData[req._id]?.effort || '';
    document.getElementById('elab-risk-level').value = this.elaborationData[req._id]?.riskLevel || '';
    document.getElementById('elab-notes').value = this.elaborationData[req._id]?.technicalNotes || '';

    showModal('elaborationModal');
  }

  async handleFormSubmit(event) {
    event.preventDefault();

    const req = this.requirements[this.currentReqIndex];
    const formData = {
      acceptanceCriteria: document.getElementById('elab-acceptance-criteria').value,
      dependencies: document.getElementById('elab-dependencies').value,
      effort: parseFloat(document.getElementById('elab-effort').value) || 0,
      riskLevel: document.getElementById('elab-risk-level').value,
      technicalNotes: document.getElementById('elab-notes').value,
    };

    try {
      await RequirementsService.updateRequirement(req._id, {
        elaborated: true,
        elaborationDetails: formData,
      });

      this.elaborationData[req._id] = formData;
      showToast('Elaboration saved', 'success');
      
      hideModal('elaborationModal');
      await this.loadRequirements();

      // Move to next
      if (this.currentReqIndex < this.requirements.length - 1) {
        setTimeout(() => this.openElaborationModal(this.currentReqIndex + 1), 500);
      }
    } catch (error) {
      showToast(error.message || 'Failed to save elaboration', 'error');
    }
  }

  startElaboration() {
    const unelaborated = this.requirements.findIndex(r => !r.elaborated);
    if (unelaborated === -1) {
      showToast('All requirements already elaborated!', 'info');
      return;
    }
    this.openElaborationModal(unelaborated);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ElaborationPage();
  });
} else {
  new ElaborationPage();
}
