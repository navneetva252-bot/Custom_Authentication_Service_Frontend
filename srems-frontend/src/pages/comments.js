import { commentsService } from '../js/services/comments.service.js';

/**
 * Comments Page Controller
 * Displays all comments and discussions
 */
class CommentsPage {
  constructor() {
    this.comments = [];
    this.filteredComments = [];
  }

  async init() {
    this.setupEventListeners();
    await this.loadComments();
  }

  setupEventListeners() {
    const searchBox = document.getElementById('searchComments');
    if (searchBox) {
      searchBox.addEventListener('input', () => {
        this.filterComments();
      });
    }

    const typeFilter = document.getElementById('filterType');
    if (typeFilter) {
      typeFilter.addEventListener('change', () => {
        this.filterComments();
      });
    }

    const statusFilter = document.getElementById('filterStatus');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        this.filterComments();
      });
    }
  }

  async loadComments() {
    try {
      const response = await commentsService.listComments();
      this.comments = response.data || [];
      this.filterComments();
      this.renderComments();
    } catch (error) {
      console.error('Failed to load comments:', error);
      this.comments = [];
      this.renderComments();
    }
  }

  filterComments() {
    const search = document.getElementById('searchComments').value.toLowerCase();
    const typeFilter = document.getElementById('filterType').value;
    const statusFilter = document.getElementById('filterStatus').value;

    this.filteredComments = this.comments.filter(comment => {
      const matchesSearch = !search || 
        comment.text?.toLowerCase().includes(search) ||
        comment.author?.toLowerCase().includes(search);
      
      const matchesType = !typeFilter || comment.entityType === typeFilter;
      const matchesStatus = !statusFilter || comment.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });

    this.renderComments();
  }

  renderComments() {
    const container = document.getElementById('commentsList');

    if (!Array.isArray(this.filteredComments) || this.filteredComments.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💬</div>
          <h3>No Comments</h3>
          <p>No comments yet. Start discussions on requirement documents.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.filteredComments.map(comment => `
      <div class="comment-card">
        <div class="comment-header">
          <div class="comment-author">
            <strong>${comment.author || 'Anonymous'}</strong>
            <span class="comment-time">${this.formatDate(comment.createdAt)}</span>
          </div>
          <span class="badge badge-${comment.status?.toLowerCase() || 'default'}">
            ${comment.status || 'OPEN'}
          </span>
        </div>

        <div class="comment-entity">
          <span class="entity-type">${comment.entityType || 'Comment'}</span>
          <span class="entity-id">#${comment.entityId?.substring(0, 8) || 'N/A'}</span>
        </div>

        <div class="comment-body">
          <p>${this.escapeHtml(comment.text || '')}</p>
        </div>

        <div class="comment-meta">
          <div class="meta-item">
            <span>${comment.likes || 0} 👍</span>
          </div>
          ${comment.replies && comment.replies.length > 0 ? `
            <div class="meta-item">
              <span>${comment.replies.length} 💬 replies</span>
            </div>
          ` : ''}
          ${comment.updatedAt && comment.updatedAt !== comment.createdAt ? `
            <div class="meta-item">
              <span style="opacity: 0.6;">Edited ${this.formatDate(comment.updatedAt)}</span>
            </div>
          ` : ''}
        </div>

        <div class="comment-footer">
          <button class="btn btn-sm btn-secondary" onclick="window.commentsPage.likeComment('${comment._id}')">👍 Like</button>
          <button class="btn btn-sm btn-secondary" onclick="window.commentsPage.replyToComment('${comment._id}')">💬 Reply</button>
          <button class="btn btn-sm btn-danger" onclick="window.commentsPage.deleteComment('${comment._id}')">🗑️ Delete</button>
        </div>

        ${comment.replies && comment.replies.length > 0 ? `
          <div class="comment-replies">
            ${comment.replies.map(reply => `
              <div class="reply-card">
                <div class="reply-header">
                  <strong>${reply.author || 'Anonymous'}</strong>
                  <span class="reply-time">${this.formatDate(reply.createdAt)}</span>
                </div>
                <p>${this.escapeHtml(reply.text || '')}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async likeComment(commentId) {
    try {
      await commentsService.likeComment(commentId);
      await this.loadComments();
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  }

  async replyToComment(commentId) {
    const text = prompt('Enter your reply:');
    if (text) {
      try {
        await commentsService.replyToComment(commentId, { text });
        alert('Reply added successfully!');
        await this.loadComments();
      } catch (error) {
        console.error('Failed to add reply:', error);
        alert('Failed to add reply');
      }
    }
  }

  async deleteComment(commentId) {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentsService.deleteComment(commentId);
        alert('Comment deleted!');
        await this.loadComments();
      } catch (error) {
        console.error('Failed to delete:', error);
        alert('Failed to delete comment');
      }
    }
  }
}

// Initialize page
const commentsPage = new CommentsPage();
window.commentsPage = commentsPage;
commentsPage.init();

export { CommentsPage };
