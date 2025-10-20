  document.addEventListener('DOMContentLoaded', function() {
      // Verificar autenticação
      const currentUser = getCurrentUser();
      if (!currentUser) {
        window.location.href = '../index.html';
        return;
      }
      
      // Configurar sidebar
      setupSidebar();
      
      // Carregar dados do perfil
      loadProfileData();
      
      // Configurar formulário de edição
      const editForm = document.getElementById('editProfileForm');
      editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfileChanges();
      });
    });
    
    function loadProfileData() {
      const currentUser = getCurrentUser();
      if (!currentUser) return;
      
      // Atualizar avatar
      const avatar = document.getElementById('userAvatar');
      if (currentUser.name) {
        avatar.textContent = currentUser.name.charAt(0).toUpperCase();
      }
      
      // Atualizar informações do cabeçalho
      document.getElementById('userName').textContent = currentUser.name || 'Usuário';
      document.getElementById('userRole').textContent = 
        `${currentUser.role === 'admin' ? 'Administrador' : 'Usuário'} • ${currentUser.department || 'Sem departamento'}`;
      
      // Atualizar informações detalhadas
      document.getElementById('profileName').textContent = currentUser.name || 'Não informado';
      document.getElementById('profileEmail').textContent = currentUser.email;
      document.getElementById('profileDepartment').textContent = currentUser.department || 'Não informado';
      document.getElementById('profileRole').textContent = currentUser.role === 'admin' ? 'Administrador' : 'Usuário padrão';
      document.getElementById('lastLogin').textContent = new Date().toLocaleString();
    }
    
    function openEditProfile() {
      const currentUser = getCurrentUser();
      if (!currentUser) return;
      
      const modal = document.getElementById('profileModal');
      document.getElementById('editName').value = currentUser.name || '';
      document.getElementById('editEmail').value = currentUser.email || '';
      document.getElementById('editDepartment').value = currentUser.department || '';
      document.getElementById('editPassword').value = '';
      modal.style.display = 'flex';
    }
    
    function closeModal(modalId) {
      document.getElementById(modalId).style.display = 'none';
    }
    
    function saveProfileChanges() {
      const currentUser = getCurrentUser();
      if (!currentUser) return;
      
      const newName = document.getElementById('editName').value.trim();
      const newEmail = document.getElementById('editEmail').value.trim();
      const newDepartment = document.getElementById('editDepartment').value.trim();
      const newPassword = document.getElementById('editPassword').value;
      
      if (!newName || !newEmail) {
        alert('Nome e e-mail são obrigatórios!');
        return;
      }
      
      // Atualizar usuário atual
      currentUser.name = newName;
      currentUser.email = newEmail;
      currentUser.department = newDepartment;
      
      if (newPassword) {
        currentUser.password = newPassword;
      }
      
      // Atualizar no array de usuários
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex] = currentUser;
        saveUsers(users);
      }
      
      // Atualizar tickets do usuário
      const tickets = getTickets();
      tickets.forEach(ticket => {
        if (ticket.usuario === currentUser.email) {
          ticket.usuario = newEmail;
          ticket.usuarioNome = newName;
        }
      });
      saveTickets(tickets);
      
      // Atualizar usuário no localStorage
      setCurrentUser(currentUser);
      
      // Fechar modal e recarregar dados
      closeModal('profileModal');
      loadProfileData();
      
      // Adicionar notificação
      addNotification(currentUser.id, 'Seu perfil foi atualizado com sucesso');
      
      // Mostrar mensagem de sucesso
      alert('Perfil atualizado com sucesso!');
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