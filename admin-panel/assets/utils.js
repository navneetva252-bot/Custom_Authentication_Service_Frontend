// Utility Functions

// Check authentication
function checkAdminAuth() {
  const token = localStorage.getItem('adminAuthToken');
  const adminData = localStorage.getItem('adminData');
  
  if (!token || !adminData) {
    window.location.href = '../auth/login.html';
    return null;
  }
  
  try {
    return JSON.parse(adminData);
  } catch (e) {
    console.error('Invalid admin data');
    window.location.href = '../auth/login.html';
    return null;
  }
}

// Get admin data from localStorage
function getAdminData() {
  const admin = localStorage.getItem('adminData');
  return admin ? JSON.parse(admin) : null;
}

// Set admin data
function setAdminData(adminData) {
  localStorage.setItem('adminData', JSON.stringify(adminData));
}

// Logout
function logoutAdmin() {
  localStorage.removeItem('adminAuthToken');
  localStorage.removeItem('adminRefreshToken');
  localStorage.removeItem('adminData');
  window.location.href = '../auth/login.html';
}

// Show notification
function showNotification(message, type = 'success', duration = 3000) {
  const notification = document.getElementById('notification');
  if (!notification) {
    const div = document.createElement('div');
    div.id = 'notification';
    div.className = 'notification';
    document.body.appendChild(div);
  }

  const notif = document.getElementById('notification');
  notif.textContent = message;
  notif.className = `notification show ${type}`;

  setTimeout(() => {
    notif.classList.remove('show');
  }, duration);
}

// Format date
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return date.toLocaleDateString('en-US', options);
  } catch (e) {
    return dateString;
  }
}

// Format time
function formatTime(dateString) {
  try {
    const date = new Date(dateString);
    const options = { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    };
    return date.toLocaleTimeString('en-US', options);
  } catch (e) {
    return dateString;
  }
}

// Get status badge HTML
function getStatusBadge(status) {
  const statusMap = {
    'active': { class: 'status-active', label: 'Active' },
    'blocked': { class: 'status-blocked', label: 'Blocked' },
    'pending': { class: 'status-pending', label: 'Pending' },
    'disabled': { class: 'status-blocked', label: 'Disabled' },
  };

  const normalized = status ? status.toLowerCase() : 'active';
  const config = statusMap[normalized] || { class: 'status-active', label: normalized };

  return `<span class="status-badge ${config.class}">${config.label}</span>`;
}

// Open modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Confirm dialog
function confirmAction(message = 'Are you sure?') {
  return confirm(message);
}

// Copy to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copied to clipboard', 'success', 2000);
  }).catch(() => {
    showNotification('Failed to copy', 'error', 2000);
  });
}

// Pagination helper
function getPaginationButtons(currentPage, totalPages) {
  const buttons = [];
  const maxButtons = 5;
  
  if (totalPages <= maxButtons) {
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(i);
    }
  } else {
    buttons.push(1);
    
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    if (startPage > 2) buttons.push('...');
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(i);
    }
    
    if (endPage < totalPages - 1) buttons.push('...');
    buttons.push(totalPages);
  }
  
  return buttons;
}

// Add notification styles if not exist
if (!document.getElementById('notification-styles')) {
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    .notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      background: #48bb78;
      color: white;
      font-weight: 500;
      display: none;
      z-index: 9999;
      animation: slideIn 0.3s ease;
      max-width: 300px;
      word-wrap: break-word;
    }

    .notification.show {
      display: block;
    }

    .notification.success {
      background: #48bb78;
    }

    .notification.error {
      background: #f56565;
    }

    .notification.warning {
      background: #ed8936;
    }

    .notification.info {
      background: #4299e1;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 480px) {
      .notification {
        bottom: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }
    }
  `;
  document.head.appendChild(style);
}

console.log('✅ Utils module loaded');
