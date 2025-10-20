class HelpdeskChatbot {
    constructor() {
        this.currentStep = 0;
        this.userResponses = {
            category: '', // MUDEI para 'category' (inglês)
            priority: '',
            titulo: '',
            mensagem: ''
        };
        this.isOpen = false;
        this.conversationFlow = [
            {
                question: "Olá! Qual tipo de problema você está enfrentando?",
                type: "buttons",
                field: "category", // MUDEI para 'category'
                options: [
                    { label: "💻 Software", value: "software" },
                    { label: "🖥️ Hardware", value: "hardware" },
                    { label: "🌐 Rede", value: "rede" },
                    { label: "🔒 Acesso", value: "acesso" },
                    { label: "📊 Outro", value: "outro" }
                ]
            },
            {
                question: "Qual a urgência do problema?",
                type: "buttons", 
                field: "priority",
                options: [
                    { label: "🟢 Baixa", value: "baixa" },
                    { label: "🟡 Média", value: "media" },
                    { label: "🔴 Alta", value: "alta" },
                    { label: "⚡ Crítica", value: "critica" }
                ]
            },
            {
                question: "Descreva brevemente o problema:",
                type: "input",
                field: "titulo",
                placeholder: "Ex: Não consigo acessar o sistema..."
            },
            {
                question: "Agora nos conte mais detalhes:",
                type: "textarea", 
                field: "mensagem",
                placeholder: "Descreva com mais detalhes o que está acontecendo..."
            }
        ];
        
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const openBtn = document.getElementById('openChatbot');
        const closeBtn = document.getElementById('closeChatbot');
        
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                this.toggleChatbot();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeChatbot();
            });
        }
    }

    toggleChatbot() {
        const widget = document.getElementById('chatbotWidget');
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            widget.classList.add('active');
            this.startConversation();
        } else {
            widget.classList.remove('active');
        }
    }

    closeChatbot() {
        this.isOpen = false;
        const widget = document.getElementById('chatbotWidget');
        if (widget) widget.classList.remove('active');
    }

    startConversation() {
        this.currentStep = 0;
        this.userResponses = {
            category: '', // Mantém em inglês
            priority: '',
            titulo: '',
            mensagem: ''
        };
        this.clearChat();
        this.showStep(this.currentStep);
    }

    showStep(stepIndex) {
        const step = this.conversationFlow[stepIndex];
        
        this.addMessage(step.question, 'bot');
        this.showResponseOptions(step);
    }

    showResponseOptions(step) {
        const actionsContainer = document.getElementById('chatbotActions');
        if (!actionsContainer) return;
        
        if (step.type === 'buttons') {
            actionsContainer.innerHTML = `
                <div class="action-buttons">
                    ${step.options.map(option => `
                        <button class="btn-action" data-field="${step.field}" data-value="${option.value}">
                            ${option.label}
                        </button>
                    `).join('')}
                </div>
            `;
            
            // Adiciona eventos aos botões
            actionsContainer.querySelectorAll('.btn-action').forEach(btn => {
                btn.addEventListener('click', () => {
                    const field = btn.getAttribute('data-field');
                    const value = btn.getAttribute('data-value');
                    const label = btn.textContent;
                    this.selectOption(field, value, label);
                });
            });
            
        } else if (step.type === 'input') {
            actionsContainer.innerHTML = `
                <input type="text" id="chatbotInput" class="form-control" placeholder="${step.placeholder}">
                <button class="btn-submit" data-field="${step.field}">Enviar</button>
            `;
            
            const input = document.getElementById('chatbotInput');
            const button = actionsContainer.querySelector('.btn-submit');
            
            if (input && button) {
                const submitHandler = () => {
                    const field = button.getAttribute('data-field');
                    this.submitInput(field);
                };
                
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') submitHandler();
                });
                
                button.addEventListener('click', submitHandler);
                input.focus();
            }
            
        } else if (step.type === 'textarea') {
            actionsContainer.innerHTML = `
                <textarea id="chatbotTextarea" class="form-control" placeholder="${step.placeholder}" rows="3"></textarea>
                <button class="btn-submit" data-field="${step.field}">Enviar</button>
            `;
            
            const textarea = document.getElementById('chatbotTextarea');
            const button = actionsContainer.querySelector('.btn-submit');
            
            if (textarea && button) {
                button.addEventListener('click', () => {
                    const field = button.getAttribute('data-field');
                    this.submitTextarea(field);
                });
                textarea.focus();
            }
        }
        
        this.scrollToBottom();
    }

    selectOption(field, value, label) {
        console.log(`Selecionado: ${field} = ${value}`);
        this.userResponses[field] = value;
        this.addMessage(label, 'user');
        this.nextStep();
    }

    submitInput(field) {
        const input = document.getElementById('chatbotInput');
        if (!input) return;
        
        const value = input.value.trim();
        if (!value) {
            this.addMessage('Por favor, descreva brevemente o problema.', 'bot');
            return;
        }
        
        console.log(`Input: ${field} = ${value}`);
        this.userResponses[field] = value;
        this.addMessage(value, 'user');
        this.nextStep();
    }

    submitTextarea(field) {
        const textarea = document.getElementById('chatbotTextarea');
        if (!textarea) return;
        
        const value = textarea.value.trim();
        if (!value) {
            this.addMessage('Por favor, forneça mais detalhes.', 'bot');
            return;
        }
        
        console.log(`Textarea: ${field} = ${value}`);
        this.userResponses[field] = value;
        this.addMessage(value, 'user');
        this.nextStep();
    }

    nextStep() {
        this.currentStep++;
        
        if (this.currentStep < this.conversationFlow.length) {
            setTimeout(() => {
                this.showStep(this.currentStep);
            }, 500);
        } else {
            this.finishConversation();
        }
    }

    finishConversation() {
        const actionsContainer = document.getElementById('chatbotActions');
        if (!actionsContainer) return;
        
        // DEBUG: Verificar todos os dados coletados
        console.log('Dados finais coletados:', this.userResponses);
        
        this.addMessage('Revise as informações abaixo e confirme para criar o ticket:', 'bot');
        
        const categoryLabel = this.getCategoryLabel(this.userResponses.category);
        const priorityLabel = this.getPriorityLabel(this.userResponses.priority);
        
        const summary = `
            <div style="background: var(--bg-gray); padding: 12px; border-radius: 8px; margin: 8px 0; font-size: 0.8rem; line-height: 1.4;">
                <strong>📋 Resumo do Ticket:</strong><br><br>
                <strong>Categoria:</strong> ${categoryLabel}<br>
                <strong>Prioridade:</strong> ${priorityLabel}<br>
                <strong>Assunto:</strong> ${this.userResponses.titulo}<br>
                <strong>Descrição:</strong> ${this.userResponses.mensagem}
            </div>
        `;
        
        this.addMessage(summary, 'bot');
        
        actionsContainer.innerHTML = `
            <button class="btn-submit" id="confirmTicket">
                <i class="bi bi-check-circle"></i> Confirmar e Criar Ticket
            </button>
            <button class="btn-action" id="restartChat" style="margin-top: 8px;">
                <i class="bi bi-arrow-clockwise"></i> Recomeçar
            </button>
        `;
        
        // Adiciona eventos diretamente
        document.getElementById('confirmTicket').addEventListener('click', () => {
            this.createTicket();
        });
        
        document.getElementById('restartChat').addEventListener('click', () => {
            this.startConversation();
        });
        
        this.scrollToBottom();
    }

    createTicket() {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
            this.addMessage('❌ Erro: Você precisa estar logado para criar um ticket.', 'bot');
            return;
        }

        // VERIFICAÇÃO FINAL DOS DADOS
        console.log('Criando ticket com dados:', this.userResponses);
        
        // Criar o ticket com a estrutura CORRETA do seu sistema
        const ticketData = {
            id: generateId(),
            usuario: currentUser.email,
            usuarioNome: currentUser.name,
            titulo: this.userResponses.titulo || 'Problema não especificado',
            mensagem: this.userResponses.mensagem || 'Descrição não fornecida',
            category: this.userResponses.category || 'outro', // CORRIGIDO: usa 'category' em inglês
            priority: this.userResponses.priority || 'media',
            status: 'Aberto',
            data: new Date().toISOString(),
            respostas: [],
            tecnico: ""
        };

        console.log('Ticket a ser criado:', ticketData);

        // Salvar no localStorage
        const tickets = getTickets();
        tickets.push(ticketData);
        saveTickets(tickets);

        // Adicionar notificação para admin (igual ao seu sistema)
        const users = getUsers();
        const admin = users.find(u => u.role === 'admin');
        if (admin) {
            addNotification(admin.id, `Novo ticket criado por ${currentUser.name}: ${ticketData.titulo}`);
        }

        // Mensagem de sucesso
        this.addMessage(`✅ <strong>Ticket #${ticketData.id} criado com sucesso!</strong><br><br>Nossa equipe entrará em contato em breve.`, 'bot');
        
        const actionsContainer = document.getElementById('chatbotActions');
        if (actionsContainer) {
            actionsContainer.innerHTML = `
                <button class="btn-submit" id="newTicketBtn">
                    <i class="bi bi-plus-circle"></i> Criar Novo Ticket
                </button>
            `;
            
            document.getElementById('newTicketBtn').addEventListener('click', () => {
                this.startConversation();
            });
        }

        // Recarregar tickets nas páginas
        setTimeout(() => {
            if (typeof loadTickets === 'function') loadTickets();
            if (typeof loadAdminStats === 'function') loadAdminStats();
            if (typeof carregarTicketsUsuario === 'function') carregarTicketsUsuario();
        }, 1000);
    }

    getCategoryLabel(category) {
        const categories = {
            'software': 'Software',
            'hardware': 'Hardware', 
            'rede': 'Rede',
            'acesso': 'Acesso',
            'outro': 'Outro',
            'tecnico': 'Técnico' // Adicionei técnico também
        };
        return categories[category] || 'Não especificado';
    }

    getPriorityLabel(priority) {
        const priorities = {
            'baixa': 'Baixa',
            'media': 'Média', 
            'alta': 'Alta',
            'critica': 'Crítica'
        };
        return priorities[priority] || 'Média';
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatarIcon = sender === 'user' ? 'bi-person' : 'bi-robot';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="bi ${avatarIcon}"></i>
            </div>
            <div class="message-content">
                ${content}
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    clearChat() {
        const messagesContainer = document.getElementById('chatbotMessages');
        const actionsContainer = document.getElementById('chatbotActions');
        
        if (messagesContainer) messagesContainer.innerHTML = '';
        if (actionsContainer) actionsContainer.innerHTML = '';
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    window.chatbot = new HelpdeskChatbot();
});

// Função auxiliar para gerar ID
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}