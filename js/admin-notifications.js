document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação e permissões
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      window.location.href = '../index.html';
      return;
    }
    
    // Configurar sidebar
    setupSidebar();
    
    // Carregar notificações
    loadNotifications();
  });
  
  function loadNotifications() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Ordenar notificações (não lidas primeiro, então por data)
    const sortedNotifications = [...currentUser.notifications].sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return new Date(b.date) - new Date(a.date);
    });
    
    const container = document.getElementById('notificationsContainer');
    const countElement = document.querySelector('.notification-count .total');
    const unreadElement = document.querySelector('.notification-count .unread');
    
    // Atualizar contadores
    const totalCount = currentUser.notifications.length;
    const unreadCount = currentUser.notifications.filter(n => !n.read).length;
    
    countElement.textContent = totalCount;
    unreadElement.textContent = `${unreadCount} não lidas`;
    
    if (sortedNotifications.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="bi bi-bell-slash"></i>
          <h3>Nenhuma notificação</h3>
          <p>Quando você tiver novas notificações, elas aparecerão aqui.</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = sortedNotifications.map(notif => `
      <div class="notification-item ${notif.read ? 'read' : 'unread'}" data-id="${notif.id}">
        <div class="notification-icon">
          <i class="bi ${notif.read ? 'bi-bell' : 'bi-bell-fill'}"></i>
        </div>
        <div class="notification-content">
          <p class="notification-message">${notif.message}</p>
          <div class="notification-footer">
            <span class="notification-date">${formatDate(notif.date)}</span>
            ${!notif.read ? `
              <button onclick="markNotificationAsRead(${notif.id})" class="btn-mark-read">
                <i class="bi bi-check"></i> Marcar como lida
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }
  
  function markNotificationAsRead(notificationId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const notification = currentUser.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      setCurrentUser(currentUser);
      
      // Atualizar no array de usuários
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex] = currentUser;
        saveUsers(users);
      }
      
      // Recarregar notificações
      loadNotifications();
      updateNotificationBadge();
    }
  }
  
  function markAllNotificationsAsRead() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    currentUser.notifications.forEach(notif => {
      notif.read = true;
    });
    
    setCurrentUser(currentUser);
    
    // Atualizar no array de usuários
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex] = currentUser;
      saveUsers(users);
    }
    
    // Recarregar notificações
    loadNotifications();
    updateNotificationBadge();
  }
  
  function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');
    
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
    
    // Atualizar badge de notificações
    updateNotificationBadge();
    
    // Marcar item ativo no menu
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === currentPage) {
        item.classList.add('active');
      }
    });
  }
  
  function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR');
  }