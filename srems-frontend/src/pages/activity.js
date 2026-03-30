import { store } from '../js/store/store.js';
import { showToast, formatDate, debounce } from '../js/utils/helpers.js';
import activityTrackerService from '../js/services/activity-tracker.service.js';

export class ActivityPage {
  constructor() {
    this.activities = [];
    this.filteredActivities = [];
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadActivities();
  }

  attachEventListeners() {
    document.getElementById('btnExportActivity')?.addEventListener('click', () => this.exportActivity());
    document.getElementById('filterActivityType')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('filterActivityEntity')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('filterActivityDate')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('searchActivity')?.addEventListener('input', debounce(() => this.applyFilters(), 300));
  }

  async loadActivities() {
    try {
      const data = await activityTrackerService.getActivities();
      this.activities = (data.data || data || []);
      this.filteredActivities = this.activities;
      this.renderActivities();
    } catch (error) {
      console.error('Failed to load activities:', error);
      // Fallback to mock data if backend is not available
      this.loadMockActivities();
    }
  }

  loadMockActivities() {
    // Fallback mock data when backend is not available
    const mockActivities = [
      {
        id: '1',
        type: 'create',
        entity: 'project',
        entityName: 'E-Commerce Platform',
        user: 'John Doe',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        description: 'Created new project',
        changes: {}
      },
      {
        id: '2',
        type: 'create',
        entity: 'requirement',
        entityName: 'User login with email',
        user: 'Jane Smith',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        description: 'Added new functional requirement',
        changes: { type: 'functional', priority: 'critical' }
      },
      {
        id: '3',
        type: 'update',
        entity: 'requirement',
        entityName: 'User login with email',
        user: 'John Doe',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        description: 'Updated requirement priority',
        changes: { priority: { from: 'high', to: 'critical' } }
      },
      {
        id: '4',
        type: 'comment',
        entity: 'requirement',
        entityName: 'User login with email',
        user: 'Alice Johnson',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        description: 'Added comment about two-factor authentication',
        changes: {}
      },
      {
        id: '5',
        type: 'approve',
        entity: 'requirement',
        entityName: 'User login with email',
        user: 'Manager',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        description: 'Approved requirement after stakeholder review',
        changes: {}
      }
    ];

    this.activities = mockActivities;
    this.filteredActivities = this.activities;
    this.renderActivities();
  }

  applyFilters() {
    const typeFilter = document.getElementById('filterActivityType').value;
    const entityFilter = document.getElementById('filterActivityEntity').value;
    const dateFilter = document.getElementById('filterActivityDate').value;
    const searchFilter = document.getElementById('searchActivity').value.toLowerCase();

    this.filteredActivities = this.activities.filter(activity => {
      const typeMatch = !typeFilter || activity.type === typeFilter;
      const entityMatch = !entityFilter || activity.entity === entityFilter;
      const dateMatch = !dateFilter || formatDate(activity.timestamp).startsWith(dateFilter);
      const searchMatch = !searchFilter || 
        activity.entityName.toLowerCase().includes(searchFilter) ||
        activity.description.toLowerCase().includes(searchFilter) ||
        activity.user.toLowerCase().includes(searchFilter);

      return typeMatch && entityMatch && dateMatch && searchMatch;
    });

    this.renderActivities();
  }

  renderActivities() {
    const container = document.getElementById('activityContainer');
    const empty = document.getElementById('emptyActivity');

    if (this.filteredActivities.length === 0) {
      container.classList.add('hidden');
      empty.classList.remove('hidden');
      return;
    }

    container.classList.remove('hidden');
    empty.classList.add('hidden');

    // Group by date
    const grouped = this.groupActivitiesByDate(this.filteredActivities);
    
    container.innerHTML = Object.entries(grouped)
      .map(([date, activities]) => this.createDateGroup(date, activities))
      .join('');
  }

  groupActivitiesByDate(activities) {
    const groups = {};
    
    activities.forEach(activity => {
      const date = formatDate(activity.timestamp).split(' ')[0]; // Get just the date part
      if (!groups[date]) groups[date] = [];
      groups[date].push(activity);
    });

    return groups;
  }

  createDateGroup(date, activities) {
    return `
      <div class="activity-date-group">
        <h3 class="date-header">${date}</h3>
        <div class="activities-list">
          ${activities.map(activity => this.createActivityItem(activity)).join('')}
        </div>
      </div>
    `;
  }

  createActivityItem(activity) {
    const icon = this.getActivityIcon(activity.type);
    const color = this.getActivityColor(activity.type);
    const time = formatDate(activity.timestamp);

    return `
      <div class="activity-item" data-activity-id="${activity.id}">
        <div class="activity-icon" style="background: ${color};">${icon}</div>
        <div class="activity-content">
          <div class="activity-header">
            <h4 class="activity-title">
              <strong>${activity.entityName}</strong>
              <span class="activity-action">${activity.description}</span>
            </h4>
            <span class="activity-time">${time.split(' ')[1] || 'recently'}</span>
          </div>
          <div class="activity-meta">
            <span class="meta-user">by ${activity.user}</span>
            <span class="meta-type badge">${activity.entity}</span>
          </div>
          ${Object.keys(activity.changes).length > 0 ? `
            <div class="activity-changes">
              ${Object.entries(activity.changes).map(([key, value]) => {
                if (typeof value === 'object' && value.from && value.to) {
                  return `<p><code>${key}</code>: <em>${value.from}</em> → <em>${value.to}</em></p>`;
                }
                return `<p><code>${key}</code>: ${JSON.stringify(value)}</p>`;
              }).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  getActivityIcon(type) {
    const icons = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      comment: '💬',
      approve: '✓',
      reject: '✗',
      'status-change': '🔄'
    };
    return icons[type] || '📝';
  }

  getActivityColor(type) {
    const colors = {
      create: '#28a745',    // green
      update: '#0069d9',    // blue
      delete: '#dc3545',    // red
      comment: '#17a2b8',   // cyan
      approve: '#20c997',   // teal
      reject: '#ff6b6b',    // red
      'status-change': '#ffc107' // yellow
    };
    return colors[type] || '#6c757d'; // gray
  }

  exportActivity() {
    // Create CSV content
    const headers = ['Date', 'Time', 'Type', 'Entity', 'Name', 'User', 'Description'];
    const rows = this.filteredActivities.map(activity => [
      formatDate(activity.timestamp).split(' ')[0],
      formatDate(activity.timestamp).split(' ')[1],
      activity.type,
      activity.entity,
      activity.entityName,
      activity.user,
      activity.description
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Activity log exported', 'success');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ActivityPage();
  });
} else {
  new ActivityPage();
}
