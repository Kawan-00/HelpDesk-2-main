// ========== FUNÇÕES AUXILIARES ========== //
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
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


// ========== CÓDIGO PRINCIPAL ========== //
document.addEventListener('DOMContentLoaded', function() {
  setupAdminSidebar();
  loadTickets();
});

function loadTickets() {
  const tickets = getTickets();
  renderTickets(tickets);
}

function renderTickets(tickets) {
  const container = document.getElementById('ticketsContainer');
  
  if (!tickets || tickets.length === 0) {
    container.innerHTML = '<p class="empty-message">Nenhum ticket encontrado.</p>';
    return;
  }

  container.innerHTML = tickets.map(ticket => `
    <div class="ticket-admin ${ticket.priority}">
      <div class="ticket-header">
        <span class="ticket-id">#${ticket.id}</span>
        <span class="ticket-status ${ticket.status.toLowerCase().replace(' ', '-')}">
          ${ticket.status}
        </span>
      </div>
      <div class="ticket-content">
        <h4>${ticket.titulo}</h4>
        <p>${ticket.mensagem}</p>
        <div class="ticket-meta">
          <span><i class="bi bi-person"></i> ${ticket.usuarioNome}</span>
          <span><i class="bi bi-calendar"></i> ${formatDate(ticket.data)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação e permissões
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      window.location.href = '../index.html';
      return;
    }
    
    // Configurar sidebar
    setupSidebar();
    
    // Carregar tickets
    loadTickets();
  });
  
  function loadTickets() {
    const tickets = getTickets()
      .sort((a, b) => {
        const statusOrder = { 'Aberto': 1, 'Em andamento': 2, 'Resolvido': 3 };
        return statusOrder[a.status] - statusOrder[b.status] || new Date(b.data) - new Date(a.data);
      });
    
    renderTickets(tickets);
  }
  
  function filterTickets() {
    const status = document.getElementById('filterStatus').value;
    const priority = document.getElementById('filterPriority').value;
    
    let filtered = getTickets();
    
    if (status !== 'todos') {
      filtered = filtered.filter(t => t.status === status);
    }
    
    if (priority !== 'todos') {
      filtered = filtered.filter(t => t.priority === priority);
    }
    
    renderTickets(filtered);
  }
  
  function renderTickets(tickets) {
    const container = document.getElementById('ticketsContainer');
    
    if (tickets.length === 0) {
      container.innerHTML = '<div class="empty-message">Nenhum ticket encontrado com esses filtros.</div>';
      return;
    }
    
    container.innerHTML = tickets.map(ticket => `
      <div class="ticket-admin ${ticket.priority}">
        <div class="ticket-header">
          <div class="ticket-id">#${ticket.id}</div>
          <div class="ticket-status ${ticket.status.toLowerCase().replace(' ', '-')}">
            ${ticket.status}
          </div>
        </div>
        
        <div class="ticket-content">
          <h4>${ticket.titulo}</h4>
          <p>${ticket.mensagem}</p>
          
          <div class="ticket-meta">
            <span class="ticket-user"><i class="bi bi-person"></i> ${ticket.usuarioNome}</span>
            <span class="ticket-date"><i class="bi bi-calendar"></i> ${formatDate(ticket.data)}</span>
            ${ticket.tecnico ? `<span class="ticket-tech"><i class="bi bi-headset"></i> ${ticket.tecnico}</span>` : ''}
          </div>
        </div>
        
        <div class="ticket-actions">
          <select onchange="updateTicketStatus(${ticket.id}, this.value)" class="form-control">
            <option value="Aberto" ${ticket.status === 'Aberto' ? 'selected' : ''}>Aberto</option>
            <option value="Em andamento" ${ticket.status === 'Em andamento' ? 'selected' : ''}>Em andamento</option>
            <option value="Resolvido" ${ticket.status === 'Resolvido' ? 'selected' : ''}>Resolvido</option>
          </select>
          
          <div class="reply-section">
            <textarea id="reply-${ticket.id}" placeholder="Digite sua resposta..." class="form-control"></textarea>
            <button onclick="sendReply(${ticket.id})" class="btn btn-primary">
              <i class="bi bi-send"></i> Responder
            </button>
          </div>
        </div>
        
        ${ticket.respostas.length > 0 ? `
          <div class="ticket-replies">
            <h5><i class="bi bi-chat-left-text"></i> Histórico de Respostas</h5>
            ${ticket.respostas.map((r, i) => `
              <div class="reply-item">
                <div class="reply-header">
                  <span class="reply-number">Resposta #${i+1}</span>
                  <span class="reply-date">${formatDate(ticket.data)}</span>
                </div>
                <div class="reply-content">${r}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
  }
  
  function updateTicketStatus(ticketId, newStatus) {
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (ticket) {
      const oldStatus = ticket.status;
      ticket.status = newStatus;
      
      // Se foi atribuído a um técnico e está em andamento
      const currentUser = getCurrentUser();
      if (newStatus === 'Em andamento' && !ticket.tecnico && currentUser) {
        ticket.tecnico = currentUser.name;
      }
      
      saveTickets(tickets);
      
      // Adicionar notificação se o status mudou
      if (oldStatus !== newStatus) {
        const users = getUsers();
        const user = users.find(u => u.email === ticket.usuario);
        if (user) {
          addNotification(user.id, `Status do ticket #${ticket.id} alterado para "${newStatus}"`);
        }
      }
      
      // Recarregar tickets
      loadTickets();
    }
  }
  
  function sendReply(ticketId) {
    const replyText = document.getElementById(`reply-${ticketId}`).value.trim();
    if (!replyText) return;
  
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (ticket) {
      ticket.respostas.push(replyText);
      
      // Se estava aberto e tem uma resposta, muda para "Em andamento"
      if (ticket.status === 'Aberto') {
        ticket.status = 'Em andamento';
        const currentUser = getCurrentUser();
        if (currentUser && !ticket.tecnico) {
          ticket.tecnico = currentUser.name;
        }
      }
      
      saveTickets(tickets);
      
      // Adicionar notificação para o usuário
      const users = getUsers();
      const user = users.find(u => u.email === ticket.usuario);
      if (user) {
        addNotification(user.id, `Seu ticket #${ticket.id} foi respondido: "${replyText.substring(0, 30)}..."`);
      }
      
      // Limpar campo e recarregar
      document.getElementById(`reply-${ticketId}`).value = '';
      loadTickets();
    }
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
  
  // Funções auxiliares (como formatDate)