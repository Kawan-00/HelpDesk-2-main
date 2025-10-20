document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      fazerLogin();
    });
  });
  
  function fazerLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const messageElement = document.getElementById('loginMessage');
    
    if (!email || !password) {
      showMessage(messageElement, 'Preencha todos os campos!', 'error');
      return;
    }
    
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      
      // Adicionar notificação de login
      addNotification(user.id, `Login realizado em ${new Date().toLocaleString()}`);
      
      // Redirecionar conforme o tipo de usuário
      if (user.role === 'admin') {
        window.location.href = 'admin/dashboard.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    } else {
      showMessage(messageElement, 'Credenciais inválidas!', 'error');
    }
  }
  
  function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
      element.style.display = 'none';
    }, 5000);
  }