function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR');
  }
  
  function formatPriority(priority) {
    const priorities = {
      'baixa': 'Baixa',
      'media': 'Média',
      'alta': 'Alta',
      'critica': 'Crítica'
    };
    return priorities[priority] || priority;
  }
  
  
  function updateNotificationBadge() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const unreadCount = currentUser.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    
    if (badge) {
      badge.textContent = unreadCount;
      badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
  }
  
  // ========== FUNÇÕES PRINCIPAIS ========== //
  document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação e permissões
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      window.location.href = '../../index.html';
      return;
    }
    
    setupSidebar();
    loadAdminStats();
    loadRecentTickets();
  });
  
  function loadAdminStats() {
    const tickets = getTickets();
    
    document.getElementById('totalTickets').textContent = tickets.length;
    document.getElementById('openTickets').textContent = tickets.filter(t => t.status === 'Aberto').length;
    document.getElementById('inProgressTickets').textContent = tickets.filter(t => t.status === 'Em andamento').length;
    document.getElementById('solvedTickets').textContent = tickets.filter(t => t.status === 'Resolvido').length;
  }
  
  function loadRecentTickets() {
    const tickets = getTickets()
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 5);
    
    const container = document.getElementById('recentTickets');
    
    if (tickets.length === 0) {
      container.innerHTML = '<div class="empty-message">Nenhum ticket recente encontrado.</div>';
      return;
    }
    
    container.innerHTML = tickets.map(ticket => `
      <div class="ticket-item ${ticket.priority}">
        <div class="ticket-header">
          <span class="ticket-id">#${ticket.id}</span>
          <span class="ticket-status ${ticket.status.toLowerCase().replace(' ', '-')}">
            ${ticket.status}
          </span>
        </div>
        <h4 class="ticket-title">${ticket.titulo}</h4>
        <div class="ticket-meta">
          <span class="ticket-user"><i class="bi bi-person"></i> ${ticket.usuarioNome}</span>
          <span class="ticket-date"><i class="bi bi-calendar"></i> ${formatDate(ticket.data)}</span>
        </div>
        <div class="ticket-priority ${ticket.priority}">
          <i class="bi bi-flag"></i> ${formatPriority(ticket.priority)}
        </div>
      </div>
    `).join('');
  }

  
  function loadAdminStats() {
    const tickets = getTickets();
    
    document.getElementById('totalTickets').textContent = tickets.length;
    document.getElementById('openTickets').textContent = tickets.filter(t => t.status === 'Aberto').length;
    document.getElementById('inProgressTickets').textContent = tickets.filter(t => t.status === 'Em andamento').length;
    document.getElementById('solvedTickets').textContent = tickets.filter(t => t.status === 'Resolvido').length;
  }
  
  function loadRecentTickets() {
    const tickets = getTickets()
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 5);
    
    const container = document.getElementById('recentTickets');
    
    if (tickets.length === 0) {
      container.innerHTML = '<div class="empty-message">Nenhum ticket recente encontrado.</div>';
      return;
    }
    
    container.innerHTML = tickets.map(ticket => `
      <div class="ticket-item ${ticket.priority}">
        <div class="ticket-header">
          <span class="ticket-id">#${ticket.id}</span>
          <span class="ticket-status ${ticket.status.toLowerCase().replace(' ', '-')}">
            ${ticket.status}
          </span>
        </div>
        <h4 class="ticket-title">${ticket.titulo}</h4>
        <div class="ticket-meta">
          <span class="ticket-user"><i class="bi bi-person"></i> ${ticket.usuarioNome}</span>
          <span class="ticket-date"><i class="bi bi-calendar"></i> ${formatDate(ticket.data)}</span>
        </div>
        <div class="ticket-priority ${ticket.priority}">
          <i class="bi bi-flag"></i> ${formatPriority(ticket.priority)}
        </div>
      </div>
    `).join('');
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
  // Funções auxiliares (como formatDate e formatPriority)