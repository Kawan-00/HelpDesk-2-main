function formatCategory(category) {
  const categories = {
    'tecnico': 'Técnico',
    'software': 'Software',
    'hardware': 'Hardware',
    'outro': 'Outro'
  };
  return categories[category] || category;
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

function formatDate(isoString) {
  const date = new Date(isoString);
  // Formato mais compacto: DD/MM HH:MM
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', '');
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

function showSuccessMessage(message) {
  const alert = document.createElement('div');
  alert.className = 'message success';
  alert.textContent = message;

  const form = document.getElementById('ticketForm');
  if (form) {
    form.appendChild(alert);

    setTimeout(() => {
      alert.remove();
    }, 5000);
  }
}


function enviarTicket() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const titulo = document.getElementById('ticketTitle').value.trim();
  const mensagem = document.getElementById('ticketMsg').value.trim();
  const prioridade = document.getElementById('ticketPriority').value;
  const categoria = document.getElementById('ticketCategory').value;

  if (!titulo || !mensagem || !prioridade || !categoria) {
    alert("Preencha todos os campos!");
    return;
  }

  const tickets = getTickets();
  const novoTicket = {
    id: Date.now(),
    titulo,
    mensagem,
    priority: prioridade,
    category: categoria,
    usuario: currentUser.email,
    usuarioNome: currentUser.name,
    status: 'Aberto',
    data: new Date().toISOString(),
    respostas: [],
    tecnico: ""
  };

  tickets.push(novoTicket);
  saveTickets(tickets);

  // Adicionar notificação para admin
  const users = getUsers();
  const admin = users.find(u => u.role === 'admin');
  if (admin) {
    addNotification(admin.id, `Novo ticket criado por ${currentUser.name}: ${titulo}`);
  }

  // Limpar campos
  document.getElementById('ticketTitle').value = '';
  document.getElementById('ticketMsg').value = '';

  // Recarregar tickets
  carregarTicketsUsuario();
  showSuccessMessage('Ticket enviado com sucesso!');
}

function carregarTicketsUsuario() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const tickets = getTickets();
  const userTickets = tickets
    .filter(t => t.usuario === currentUser.email)
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  container.innerHTML = userTickets.map(ticket => `
        <div class="ticket ${ticket.priority}">
          <div class="ticket-header">
            <h4 class="ticket-title">
              <i class="bi bi-ticket-perforated"></i>
              ${ticket.titulo.length > 30 ? ticket.titulo.substring(0, 30) + '...' : ticket.titulo}
            </h4>
            <span class="status ${ticket.status.toLowerCase().replace(' ', '-')}">
              ${ticket.status.substring(0, 3)}
            </span>
          </div>
          
          <div class="ticket-content">
            <p class="ticket-desc">${ticket.mensagem.length > 100 ? ticket.mensagem.substring(0, 100) + '...' : ticket.mensagem}</p>
            
            <div class="ticket-meta">
              <span title="Prioridade"><i class="bi bi-flag"></i> ${formatPriority(ticket.priority).substring(0, 1)}</span>
              <span title="Data"><i class="bi bi-calendar"></i> ${formatDate(ticket.data).substring(0, 5)}</span>
              ${ticket.tecnico ? `<span title="Técnico"><i class="bi bi-person"></i> ${ticket.tecnico.split(' ')[0]}</span>` : ''}
            </div>
          </div>
          
          ${ticket.respostas.length > 0 ? `
            <div class="ticket-actions">
              <button class="btn btn-sm btn-link" onclick="verRespostas(${ticket.id})">
                <i class="bi bi-chat"></i> ${ticket.respostas.length}
              </button>
            </div>
          ` : ''}
        </div>
      `).join('');
}


document.addEventListener('DOMContentLoaded', function () {
  // Verificar autenticação
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = '../index.html';
    return;
  }

  // Configurar sidebar
  setupSidebar();

  // Configurar formulário
  const ticketForm = document.getElementById('ticketForm');
  ticketForm.addEventListener('submit', function (e) {
    e.preventDefault();
    enviarTicket();
  });

  // Carregar tickets do usuário
  carregarTicketsUsuario();
});

function enviarTicket() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const titulo = document.getElementById('ticketTitle').value.trim();
  const mensagem = document.getElementById('ticketMsg').value.trim();
  const prioridade = document.getElementById('ticketPriority').value;
  const categoria = document.getElementById('ticketCategory').value;

  if (!titulo || !mensagem || !prioridade || !categoria) {
    alert("Preencha todos os campos!");
    return;
  }

  const tickets = getTickets();
  const novoTicket = {
    id: Date.now(),
    titulo,
    mensagem,
    priority: prioridade,
    category: categoria,
    usuario: currentUser.email,
    usuarioNome: currentUser.name,
    status: 'Aberto',
    data: new Date().toISOString(),
    respostas: [],
    tecnico: ""
  };

  tickets.push(novoTicket);
  saveTickets(tickets);

  // Adicionar notificação para admin
  const users = getUsers();
  const admin = users.find(u => u.role === 'admin');
  if (admin) {
    addNotification(admin.id, `Novo ticket criado por ${currentUser.name}: ${titulo}`);
  }

  // Limpar campos
  document.getElementById('ticketTitle').value = '';
  document.getElementById('ticketMsg').value = '';

  // Recarregar tickets
  carregarTicketsUsuario();
  showSuccessMessage('Ticket enviado com sucesso!');
}

function carregarTicketsUsuario() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const tickets = getTickets();
  const userTickets = tickets
    .filter(t => t.usuario === currentUser.email)
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  const container = document.getElementById('userTickets');

  if (userTickets.length === 0) {
    container.innerHTML = '<p class="empty-message">Você ainda não abriu nenhum ticket.</p>';
    return;
  }

  container.innerHTML = userTickets.map(ticket => `
      <div class="ticket ${ticket.priority}">
        <h4>${ticket.titulo} <span class="category">${formatCategory(ticket.category)}</span></h4>
        <div class="meta">
          <span class="priority">${formatPriority(ticket.priority)}</span>
          <span class="status ${ticket.status.toLowerCase().replace(' ', '')}">${ticket.status}</span>
          ${ticket.tecnico ? `<span>Técnico: ${ticket.tecnico}</span>` : ''}
        </div>
        <div class="content">
          <p>${ticket.mensagem}</p>
        </div>
        ${ticket.respostas.length > 0 ? `
          <div class="replies">
            <h5>Respostas do Suporte:</h5>
            ${ticket.respostas.map((r, i) => `
              <div class="reply">
                <strong>Resposta #${i + 1}:</strong> ${r}
              </div>
            `).join('')}
          </div>
        ` : ''}
        <small class="date">${formatDate(ticket.data)}</small>
      </div>
    `).join('');

}

function showSuccessMessage(message) {
  const alert = document.createElement('div');
  alert.className = 'message success';
  alert.textContent = message;

  const form = document.getElementById('ticketForm');
  form.appendChild(alert);

  setTimeout(() => {
    alert.remove();
  }, 5000);
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
// Funções auxiliares (as mesmas do dashboard.js)

function setupTicketFilters() {
  const filterStatus = document.getElementById('filterStatus');
  const refreshBtn = document.querySelector('.btn-refresh');

  if (!filterStatus) return;

  // Filtro por status
  filterStatus.addEventListener('change', function () {
    const status = this.value;
    const tickets = document.querySelectorAll('.ticket');

    tickets.forEach(ticket => {
      const ticketStatus = ticket.getAttribute('data-status');

      if (status === 'todos' || ticketStatus === status) {
        ticket.style.display = 'block';
      } else {
        ticket.style.display = 'none';
      }
    });
  });

  // Botão de refresh
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function () {
      carregarTicketsUsuario();
    });
  }


}

function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggleBtn');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

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