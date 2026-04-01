import { requirementsService } from '../js/services/requirements.service.js';
import { store } from '../js/store/store.js';
import { showToast, showModal, hideModal } from '../js/utils/helpers.js';

export class NegotiationPage {
  constructor() {
    this.requirements = [];
    this.currentReqIndex = 0;
    this.votes = {};
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadRequirements();
  }

  attachEventListeners() {
    document.getElementById('btnStartVoting')?.addEventListener('click', () => this.startVoting());
    document.getElementById('votingForm')?.addEventListener('submit', (e) => this.handleVoteSubmit(e));

    // Sliders for score calculation
    document.getElementById('vote-importance')?.addEventListener('input', () => this.updateScore());
    document.getElementById('vote-effort')?.addEventListener('input', () => this.updateScore());
    document.getElementById('vote-risk')?.addEventListener('input', () => this.updateScore());
  }

  async loadRequirements() {
    try {
      const projectId = store.getState().currentProject;
      if (!projectId) {
        showToast('Please select a project', 'warning');
        return;
      }

      this.requirements = await requirementsService.getRequirements(projectId);
      this.renderVotingSummary();
      this.renderVotingItems();
    } catch (error) {
      showToast(error.message || 'Failed to load requirements', 'error');
    }
  }

  renderVotingSummary() {
    document.getElementById('totalReqs').textContent = this.requirements.length;
    const votedCount = this.requirements.filter(r => r.negotiationVotes?.length > 0).length;
    document.getElementById('votesCompleted').textContent = votedCount;

    const avgScore = this.requirements.reduce((sum, r) => {
      const votes = r.negotiationVotes || [];
      const avg = votes.length > 0 ? votes.reduce((s, v) => s + (v.priorityScore || 0), 0) / votes.length : 0;
      return sum + avg;
    }, 0) / this.requirements.length;

    document.getElementById('avgScore').textContent = avgScore.toFixed(1);
  }

  renderVotingItems() {
    const container = document.getElementById('votingContainer');
    if (this.requirements.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No requirements to vote on</p></div>';
      return;
    }

    container.innerHTML = this.requirements.map((req, idx) => {
      const voteCount = req.negotiationVotes?.length || 0;
      const avgScore = voteCount > 0 
        ? req.negotiationVotes.reduce((s, v) => s + (v.priorityScore || 0), 0) / voteCount 
        : 0;

      return `
        <div class="voting-item" data-index="${idx}">
          <div class="item-content">
            <h4>${req.description}</h4>
            <div class="item-badges">
              <span class="badge">${req.type}</span>
              <span class="badge">${req.priority}</span>
            </div>
          </div>
          <div class="item-voting-stats">
            <div class="stat">
              <span class="label">Votes:</span>
              <span class="value">${voteCount}</span>
            </div>
            <div class="stat">
              <span class="label">Avg Score:</span>
              <span class="value">${avgScore.toFixed(1)}</span>
            </div>
            <button class="btn btn-sm btn-primary vote-btn">Vote</button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('.voting-item').dataset.index);
        this.openVotingModal(index);
      });
    });
  }

  openVotingModal(index) {
    this.currentReqIndex = index;
    const req = this.requirements[index];

    document.getElementById('votingReqPreview').innerHTML = `
      <div class="requirement-info">
        <h4>${req.description}</h4>
        <div class="info-badges">
          <span>${req.type}</span>
          <span>${req.priority}</span>
        </div>
        <p>${req.context || ''}</p>
      </div>
    `;

    // Reset sliders
    document.getElementById('vote-importance').value = 5;
    document.getElementById('vote-effort').value = 5;
    document.getElementById('vote-risk').value = 5;
    document.getElementById('vote-comment').value = '';

    this.updateScore();
    showModal('votingModal');
  }

  updateScore() {
    const importance = parseInt(document.getElementById('vote-importance').value);
    const effort = parseInt(document.getElementById('vote-effort').value);
    const risk = parseInt(document.getElementById('vote-risk').value);

    // Calculate priority score: (importance * 2 - effort + risk) normalized to 0-100
    const score = Math.max(0, (importance * 2 - effort) * 5 - risk);
    
    document.getElementById('importance-value').textContent = importance;
    document.getElementById('effort-value').textContent = effort;
    document.getElementById('risk-value').textContent = risk;
    document.getElementById('calculatedScore').textContent = Math.min(100, score);
  }

  async handleVoteSubmit(event) {
    event.preventDefault();

    const req = this.requirements[this.currentReqIndex];
    const importance = parseInt(document.getElementById('vote-importance').value);
    const effort = parseInt(document.getElementById('vote-effort').value);
    const risk = parseInt(document.getElementById('vote-risk').value);
    const comment = document.getElementById('vote-comment').value;

    const score = Math.max(0, (importance * 2 - effort) * 5 - risk);

    try {
      // In a real app, send this to backend
      const voteData = {
        importance,
        effort,
        risk,
        priorityScore: Math.min(100, score),
        comment,
        votedBy: store.getState().userId || 'anonymous',
        votedAt: new Date().toISOString(),
      };

      // Add to local votes tracking
      if (!req.negotiationVotes) req.negotiationVotes = [];
      req.negotiationVotes.push(voteData);

      showToast('Vote recorded successfully', 'success');
      hideModal('votingModal');
      this.renderVotingSummary();
      this.renderVotingItems();
    } catch (error) {
      showToast(error.message || 'Failed to record vote', 'error');
    }
  }

  startVoting() {
    const unvoted = this.requirements.findIndex(r => !r.negotiationVotes || r.negotiationVotes.length === 0);
    if (unvoted === -1) {
      showToast('All requirements have been voted on!', 'info');
      return;
    }
    this.openVotingModal(unvoted);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new NegotiationPage();
  });
} else {
  new NegotiationPage();
}
