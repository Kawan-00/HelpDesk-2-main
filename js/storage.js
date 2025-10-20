function getUsers() {
    return JSON.parse(localStorage.getItem('helpdesk_users')) || [
      { 
        id: 1, 
        email: "user@teste.com", 
        password: "123", 
        role: "user", 
        name: "Usuário Teste",
        department: "TI",
        notifications: []
      },
      { 
        id: 2, 
        email: "admin@teste.com", 
        password: "123", 
        role: "admin", 
        name: "Administrador",
        department: "Suporte",
        notifications: []
      }
    ];
  }
  
  function getTickets() {
    return JSON.parse(localStorage.getItem('helpdesk_tickets')) || [
      { 
        id: 1, 
        titulo: "Problema com login", 
        mensagem: "Não consigo acessar minha conta",
        priority: "alta",
        category: "tecnico",
        usuario: "user@teste.com",
        usuarioNome: "Usuário Teste",
        status: "Aberto", 
        data: new Date().toISOString(),
        respostas: [],
        tecnico: ""
      }
    ];
  }
  
  function setCurrentUser(user) {
    localStorage.setItem('helpdesk_currentUser', JSON.stringify(user));
  }
  
  function getCurrentUser() {
    return JSON.parse(localStorage.getItem('helpdesk_currentUser'));
  }
  
  function saveUsers(users) {
    localStorage.setItem('helpdesk_users', JSON.stringify(users));
  }
  
  function saveTickets(tickets) {
    localStorage.setItem('helpdesk_tickets', JSON.stringify(tickets));
  }
  
  function addNotification(userId, message) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
      const notification = {
        id: Date.now(),
        message,
        date: new Date().toISOString(),
        read: false
      };
      
      user.notifications.unshift(notification);
      saveUsers(users);
      
      // Atualizar badge se for o usuário atual
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        updateNotificationBadge();
      }
    }
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
  
  function logout() {
    const currentUser = getCurrentUser();
    if (currentUser) {
      addNotification(currentUser.id, `Logout realizado em ${new Date().toLocaleString()}`);
    }
    
    localStorage.removeItem('helpdesk_currentUser');
    window.location.href = 'index.html';
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

function logout() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    addNotification(currentUser.id, `Logout realizado em ${new Date().toLocaleString()}`);
  }
  
  localStorage.removeItem('helpdesk_currentUser');
  window.location.href = '../index.html';
}