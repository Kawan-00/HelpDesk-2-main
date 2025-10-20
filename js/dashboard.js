document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = '../index.html';
      return;
    }
    
    // Configurar sidebar
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');
    
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
    
    // Atualizar badge de notificações
    updateNotificationBadge();
    
    // Carregar dados do dashboard
    loadUserStats();
    loadRecentTickets();
  });
  
  function loadUserStats() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const tickets = getTickets();
    const userTickets = tickets.filter(t => t.usuario === currentUser.email);
    
    const openCount = userTickets.filter(t => t.status === 'Aberto').length;
    const progressCount = userTickets.filter(t => t.status === 'Em andamento').length;
    const solvedCount = userTickets.filter(t => t.status === 'Resolvido').length;
    
    document.getElementById('openTicketsCount').textContent = openCount;
    document.getElementById('progressTicketsCount').textContent = progressCount;
    document.getElementById('solvedTicketsCount').textContent = solvedCount;
  }
  
  function loadRecentTickets() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const tickets = getTickets();
    const userTickets = tickets
      .filter(t => t.usuario === currentUser.email)
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 5);
    
    const container = document.getElementById('userRecentTickets');
    
    if (userTickets.length === 0) {
      container.innerHTML = '<p class="empty-message">Nenhum ticket recente encontrado.</p>';
      return;
    }
    
    container.innerHTML = userTickets.map(ticket => `
      <div class="ticket ${ticket.priority}">
        <h4>${ticket.titulo} <span class="category">${formatCategory(ticket.category)}</span></h4>
        <div class="meta">
          <span class="priority">${formatPriority(ticket.priority)}</span>
          <span class="status ${ticket.status.toLowerCase().replace(' ', '')}">${ticket.status}</span>
        </div>
        <div class="content">
          <p>${ticket.mensagem}</p>
        </div>
        <small class="date">${formatDate(ticket.data)}</small>
      </div>
    `).join('');
  }
  
  // Funções auxiliares
  function formatPriority(priority) {
    const priorities = {
      'baixa': 'Baixa',
      'media': 'Média',
      'alta': 'Alta',
      'critica': 'Crítica'
    };
    return priorities[priority] || priority;
  }
  
  function formatCategory(category) {
    const categories = {
      'tecnico': 'Técnico',
      'software': 'Software',
      'hardware': 'Hardware',
      'outro': 'Outro'
    };
    return categories[category] || category;
  }
  
  function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR');
  }