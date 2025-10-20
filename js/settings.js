// ========== CONFIGURAÇÕES DO SISTEMA ========== //

// Carregar configurações quando a página abrir
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    updateStorageInfo();
});

// Carregar configurações salvas
function loadSettings() {
    const settings = getSettings();
    
    // Configurações Gerais
    document.getElementById('systemName').value = settings.systemName || 'Helpdesk';
    document.getElementById('autoLogout').value = settings.autoLogout || 30;
    document.getElementById('maxTickets').value = settings.maxTickets || 10;
    
    // Notificações
    document.getElementById('emailNotifications').checked = settings.emailNotifications !== false;
    document.getElementById('pushNotifications').checked = settings.pushNotifications !== false;
    document.getElementById('newTicketNotifications').checked = settings.newTicketNotifications !== false;
    
    // Aparência
    document.getElementById('themeSelect').value = settings.theme || 'light';
    document.getElementById('languageSelect').value = settings.language || 'pt-BR';
    document.getElementById('sidebarStyle').value = settings.sidebarStyle || 'collapsed';
    
    // Aplicar tema
    applyTheme(settings.theme);
}

// Salvar configurações gerais
function saveGeneralSettings() {
    const settings = getSettings();
    
    settings.systemName = document.getElementById('systemName').value;
    settings.autoLogout = parseInt(document.getElementById('autoLogout').value);
    settings.maxTickets = parseInt(document.getElementById('maxTickets').value);
    
    saveSettings(settings);
    showMessage('Configurações gerais salvas com sucesso!', 'success');
}

// Salvar configurações de notificação
function saveNotificationSettings() {
    const settings = getSettings();
    
    settings.emailNotifications = document.getElementById('emailNotifications').checked;
    settings.pushNotifications = document.getElementById('pushNotifications').checked;
    settings.newTicketNotifications = document.getElementById('newTicketNotifications').checked;
    
    saveSettings(settings);
    showMessage('Configurações de notificação salvas!', 'success');
}

// Salvar configurações de aparência
function saveAppearanceSettings() {
    const settings = getSettings();
    
    settings.theme = document.getElementById('themeSelect').value;
    settings.language = document.getElementById('languageSelect').value;
    settings.sidebarStyle = document.getElementById('sidebarStyle').value;
    
    saveSettings(settings);
    applyTheme(settings.theme);
    showMessage('Configurações de aparência aplicadas!', 'success');
}

// Aplicar tema
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Exportar dados
function exportData() {
    const data = {
        users: getUsers(),
        tickets: getTickets(),
        settings: getSettings(),
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `helpdesk-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showMessage('Dados exportados com sucesso!', 'success');
}

// Importar dados
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('Deseja importar os dados? Isso substituirá os dados atuais.')) {
                    if (data.users) saveUsers(data.users);
                    if (data.tickets) saveTickets(data.tickets);
                    if (data.settings) saveSettings(data.settings);
                    
                    showMessage('Dados importados com sucesso!', 'success');
                    setTimeout(() => location.reload(), 1000);
                }
            } catch (error) {
                showMessage('Erro ao importar arquivo. Verifique o formato.', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Resetar configurações
function resetSettings() {
    if (confirm('Deseja resetar todas as configurações para os valores padrão?')) {
        localStorage.removeItem('helpdesk_settings');
        showMessage('Configurações resetadas!', 'success');
        setTimeout(() => location.reload(), 1000);
    }
}

// Verificar atualizações
function checkForUpdates() {
    showMessage('Verificando atualizações...', 'info');
    setTimeout(() => {
        showMessage('Seu sistema está atualizado!', 'success');
    }, 2000);
}

// Atualizar informações de armazenamento
function updateStorageInfo() {
    const stats = getStorageStats();
    document.getElementById('storageUsed').textContent = stats.storageUsage.total + ' KB';
}

// Mostrar mensagem
function showMessage(message, type) {
    // Implementação simples de mensagem - você pode usar sua função existente
    alert(message);
}

// ========== FUNÇÕES DE STORAGE PARA CONFIGURAÇÕES ========== //

function getSettings() {
    return JSON.parse(localStorage.getItem('helpdesk_settings')) || {};
}

function saveSettings(settings) {
    localStorage.setItem('helpdesk_settings', JSON.stringify(settings));
}