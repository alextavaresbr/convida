// tim-room.js - Sistema de Criação de Salas Virtuais
// Baseado no sistema virtual_adv.js (novos/) com configuração dinâmica

document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('virtual-main');
    const createRoomButton = document.getElementById('action_create_room');

    // Configurações avançadas baseadas no virtual_adv.js
    const ROOM_CATEGORIES = {
        'ead': {
            name: 'EAD (Educação à Distância)',
            description: 'Salas para cursos e treinamentos online',
            cssClass: 'virtual-ead',
            icon: 'fas fa-graduation-cap',
            features: ['live', 'chat', 'forum', 'sessions', 'dropbox', 'evaluation']
        },
        'educational': {
            name: 'Educacional Avançado',
            description: 'Salas para programas educacionais especializados',
            cssClass: 'virtual-educational',
            icon: 'fas fa-university',
            features: ['live', 'chat', 'sessions', 'dropbox', 'evaluation', 'popup']
        },
        'forum': {
            name: 'Fórum Temático',
            description: 'Salas focadas em discussões e debates',
            cssClass: 'virtual-forum',
            icon: 'fas fa-comments',
            features: ['forum', 'markdown', 'quote', 'timestamp']
        },
        'chat': {
            name: 'Chat Público',
            description: 'Salas abertas para conversação geral',
            cssClass: 'virtual-chat',
            icon: 'fas fa-comment-dots',
            features: ['chat', 'live', 'users']
        },
        'continuous': {
            name: 'Contínuo',
            description: 'Salas de funcionamento contínuo',
            cssClass: 'virtual-continuous',
            icon: 'fas fa-infinity',
            features: ['live', 'chat', 'users', 'continuous']
        }
    };

    // Tipos de conferência baseados no SALAS array do virtual_adv.js
    const CONFERENCE_TYPES = {
        'sala': {
            name: 'Sala Principal',
            description: 'Sala principal para todos os participantes',
            icon: 'fas fa-home',
            hasTimer: false,
            hasLimit: false,
            category: 'general'
        },
        'turma': {
            name: 'Salas por Turma',
            description: 'Divisão automática por turmas dos participantes',
            icon: 'fas fa-users',
            hasTimer: true,
            hasLimit: false,
            category: 'educational',
            requiresField: 'turma'
        },
        'grupo': {
            name: 'Salas por Grupo',
            description: 'Salas organizadas por grupos de trabalho',
            icon: 'fas fa-layer-group',
            hasTimer: true,
            hasLimit: false,
            category: 'educational',
            requiresField: 'grupo'
        },
        'projeto': {
            name: 'Salas de Projeto',
            description: 'Salas dedicadas a projetos específicos',
            icon: 'fas fa-project-diagram',
            hasTimer: true,
            hasLimit: false,
            category: 'educational',
            requiresField: 'grupo'
        },
        'atendimento': {
            name: 'Atendimento Individual',
            description: 'Salas para atendimento personalizado',
            icon: 'fas fa-user-tie',
            hasTimer: true,
            hasLimit: false,
            category: 'support',
            requiresField: 'grupo'
        },
        'oracao': {
            name: 'Salas de Oração',
            description: 'Espaços dedicados para momentos de oração',
            icon: 'fas fa-pray',
            hasTimer: true,
            hasLimit: false,
            category: 'spiritual',
            requiresField: 'rede'
        },
        'rede': {
            name: 'Salas por Rede',
            description: 'Organização por redes de relacionamento',
            icon: 'fas fa-network-wired',
            hasTimer: true,
            hasLimit: false,
            category: 'network',
            requiresField: 'rede'
        },
        'professor': {
            name: 'Sala dos Professores',
            description: 'Área exclusiva para educadores',
            icon: 'fas fa-chalkboard-teacher',
            hasTimer: false,
            hasLimit: true,
            category: 'staff',
            requiresLevel: 1
        },
        'equipe': {
            name: 'Sala da Equipe',
            description: 'Espaço para coordenação da equipe',
            icon: 'fas fa-users-cog',
            hasTimer: false,
            hasLimit: false,
            category: 'staff',
            requiresLevel: 1
        },
        'reuniao': {
            name: 'Salas de Reunião',
            description: 'Salas para reuniões formais',
            icon: 'fas fa-handshake',
            hasTimer: true,
            hasLimit: false,
            category: 'meeting'
        },
        'breakout': {
            name: 'Breakout Rooms',
            description: 'Salas de discussão em pequenos grupos',
            icon: 'fas fa-comments',
            hasTimer: true,
            hasLimit: false,
            category: 'interactive'
        }
    };

    // Recursos avançados do virtual_adv.js
    const ADVANCED_FEATURES = {
        'popup_interactions': {
            name: 'Interações Pop-up',
            description: 'Pop-ups interativos para avaliações e pesquisas',
            icon: 'fas fa-window-restore'
        },
        'evaluation_system': {
            name: 'Sistema de Avaliação',
            description: 'Avaliações de docentes e eventos',
            icon: 'fas fa-star'
        },
        'presence_control': {
            name: 'Controle de Presença',
            description: 'Sistema de check-in dos participantes',
            icon: 'fas fa-check-circle'
        },
        'poll_system': {
            name: 'Sistema de Enquetes',
            description: 'Enquetes interativas em tempo real',
            icon: 'fas fa-poll'
        },
        'raffle_system': {
            name: 'Sistema de Sorteios',
            description: 'Sorteios automáticos entre participantes',
            icon: 'fas fa-gift'
        },
        'notification_system': {
            name: 'Sistema de Notificações',
            description: 'Notificações push e alertas',
            icon: 'fas fa-bell'
        },
        'timer_system': {
            name: 'Sistema de Timer',
            description: 'Cronômetros e contadores regressivos',
            icon: 'fas fa-stopwatch'
        },
        'dropbox_integration': {
            name: 'Integração Dropbox',
            description: 'Compartilhamento automático de arquivos',
            icon: 'fab fa-dropbox'
        },
        'session_schedule': {
            name: 'Programação de Sessões',
            description: 'Agenda automatizada com sessões',
            icon: 'fas fa-calendar-alt'
        },
        'markdown_support': {
            name: 'Suporte Markdown',
            description: 'Formatação rica em mensagens',
            icon: 'fab fa-markdown'
        }
    };

    // Utilitários
    function clearMainContent(content) {
        content.innerHTML = '';
        // Garantir que o conteúdo principal tenha rolagem
        content.style.overflowY = 'auto';
        content.style.maxHeight = '90vh';
        content.style.padding = '20px';
    }

    function createContentContainer(title) {
        const container = document.createElement('div');
        container.className = 'content-container';
        container.style.width = '100%';
        container.style.overflowY = 'auto';
        
        const header = document.createElement('h2');
        header.innerHTML = title;
        header.style.marginBottom = '20px';
        header.style.position = 'sticky';
        header.style.top = '0';
        header.style.backgroundColor = '#fff';
        header.style.zIndex = '10';
        header.style.padding = '10px 0';
        container.appendChild(header);
        
        const grid = document.createElement('div');
        grid.className = 'grid-container';
        grid.style.paddingBottom = '50px'; // Espaço extra no final
        
        return { container, grid };
    }

    function renderCreateRoom() {
        clearMainContent(mainContent);
        const { container, grid } = createContentContainer('<i class="fas fa-plus-circle"></i> Criar Nova Sala Virtual');
        
        // Formulário de criação de sala com funcionalidades avançadas
        const form = document.createElement('form');
        form.id = 'create-room-form';
        form.style.width = '100%';
        form.style.maxWidth = 'none';
        form.innerHTML = `
            <div class="mb10">
                <h4><i class="fas fa-info-circle"></i> Informações Básicas</h4>
                
                <div class="mb5">
                    <label for="room-id">ID da Sala *</label>
                    <input type="text" id="room-id" name="id" required 
                           pattern="[a-zA-Z0-9]{3,20}" 
                           placeholder="Ex: lideranca2025"
                           title="Apenas letras e números, 3-20 caracteres">
                    <small>Apenas letras e números (3-20 caracteres). Será usado na URL.</small>
                </div>
                
                <div class="mb5">
                    <label for="room-title">Título da Sala *</label>
                    <input type="text" id="room-title" name="title" required 
                           placeholder="Ex: Liderança Avançada 2025">
                </div>
                
                <div class="mb5">
                    <label for="room-subtitle">Subtítulo</label>
                    <input type="text" id="room-subtitle" name="subtitle" 
                           placeholder="Ex: Programa de Formação Continuada">
                    <small>Aparece abaixo do título principal</small>
                </div>
                
                <div class="mb5">
                    <label for="room-category">Categoria *</label>
                    <select id="room-category" name="category" required>
                        <option value="">Selecione uma categoria</option>
                        ${Object.entries(ROOM_CATEGORIES).map(([key, cat]) => 
                            `<option value="${key}" data-features='${JSON.stringify(cat.features)}'>
                                ${cat.name} - ${cat.description}
                            </option>`
                        ).join('')}
                    </select>
                    <div id="category-features" class="mb5" style="display: none;">
                        <small><strong>Recursos incluídos:</strong> <span id="features-list"></span></small>
                    </div>
                </div>
            </div>

            <div class="mb10">
                <h4><i class="fas fa-cogs"></i> Configurações Básicas</h4>
                
                <div class="mb5">
                    <label>
                        <input type="checkbox" id="live-enabled" name="live_enabled" checked>
                        <i class="fas fa-video"></i> Transmissão ao Vivo Habilitada
                    </label>
                </div>
                
                <div class="mb5">
                    <label>
                        <input type="checkbox" id="chat-enabled" name="chat_enabled" checked>
                        <i class="fas fa-comments"></i> Chat Habilitado
                    </label>
                </div>
                
                <div class="mb5">
                    <label>
                        <input type="checkbox" id="jitsi-enabled" name="jitsi_enabled" checked>
                        <i class="fas fa-video"></i> Videoconferências (Jitsi) Habilitadas
                    </label>
                </div>
                
                <div class="mb5">
                    <label>
                        <input type="checkbox" id="salas-unified" name="salas_unified">
                        <i class="fas fa-layer-group"></i> Salas Unificadas
                    </label>
                    <small>Todos os usuários em uma única lista ao invés de separar por tipo de sala</small>
                </div>
                
                <div class="mb5">
                    <label for="virtual-delay">Delay de Conferências (segundos)</label>
                    <input type="number" id="virtual-delay" name="VIRTUAL_DELAY" 
                           min="0" max="300" value="0">
                    <small>Atraso antes de abrir conferências automaticamente</small>
                </div>
                
                <div class="mb5">
                    <label for="live-url">URL da Transmissão</label>
                    <input type="url" id="live-url" name="live_url" 
                           placeholder="https://youtube.com/watch?v=...">
                    <small>URL fixa para transmissão (opcional, pode ser configurada nas sessões)</small>
                </div>
            </div>

            <div class="mb10">
                <h4><i class="fas fa-users"></i> Tipos de Conferência</h4>
                <p>Selecione quais tipos de conferência estarão disponíveis na sala:</p>
                
                <div class="mb5" id="conference-types">
                    ${Object.entries(CONFERENCE_TYPES).map(([key, conf]) => `
                        <div class="conference-type-item mb5">
                            <label>
                                <input type="checkbox" name="salas_enabled" value="${key}" 
                                       ${key === 'sala' ? 'checked' : ''}
                                       data-timer="${conf.hasTimer}" 
                                       data-limit="${conf.hasLimit}"
                                       data-requires="${conf.requiresField || ''}"
                                       data-level="${conf.requiresLevel || 0}">
                                <i class="${conf.icon}"></i> ${conf.name}
                                ${conf.hasTimer ? '<span class="badge">Timer</span>' : ''}
                                ${conf.hasLimit ? '<span class="badge">Limitado</span>' : ''}
                                ${conf.requiresLevel ? '<span class="badge">Staff</span>' : ''}
                            </label>
                            <small>${conf.description}</small>
                            ${conf.requiresField ? `<small><em>Requer campo: ${conf.requiresField}</em></small>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="mb10">
                <h4><i class="fas fa-magic"></i> Recursos Avançados</h4>
                <p>Ative recursos especiais do virtual_adv.js:</p>
                
                <div class="mb5" id="advanced-features">
                    ${Object.entries(ADVANCED_FEATURES).map(([key, feature]) => `
                        <div class="feature-item mb5">
                            <label>
                                <input type="checkbox" name="advanced_features" value="${key}">
                                <i class="${feature.icon}"></i> ${feature.name}
                            </label>
                            <small>${feature.description}</small>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="mb10">
                <h4><i class="fas fa-shield-alt"></i> Permissões e Segurança</h4>
                
                <div class="mb5">
                    <label for="admin-level">Nível Mínimo de Admin</label>
                    <select id="admin-level" name="admin_level">
                        <option value="1">Nível 1 (Voluntário)</option>
                        <option value="2" selected>Nível 2 (Moderador)</option>
                        <option value="3">Nível 3 (Administrador)</option>
                    </select>
                </div>
                
                <div class="mb5">
                    <label for="professor-limit">Restrição Sala Professor</label>
                    <input type="text" id="professor-limit" name="professor_limit" 
                           placeholder="Ex: A,B,C ou 123,456,789">
                    <small>Lista de turmas (letras) ou IDs (números) separados por vírgula</small>
                </div>
                
                <div class="mb5">
                    <label>
                        <input type="checkbox" id="cookie-check" name="cookie_check" checked>
                        <i class="fas fa-cookie-bite"></i> Verificação de Cookie de Inscrição
                    </label>
                    <small>Verificar se usuário tem cookie de participante inscrito</small>
                </div>
                
                <div class="mb5">
                    <label>
                        <input type="checkbox" id="time-sync" name="time_sync" checked>
                        <i class="fas fa-clock"></i> Sincronização de Horário
                    </label>
                    <small>Verificar sincronização de horário do cliente</small>
                </div>
            </div>

            <div class="mb10">
                <h4><i class="fas fa-calendar"></i> Sessões e Programação</h4>
                
                <div class="mb5">
                    <label>
                        <input type="checkbox" id="schedule-enabled" name="schedule_enabled">
                        <i class="fas fa-calendar-alt"></i> Programação Automatizada
                    </label>
                    <small>Ativar sistema de sessões com horários automáticos</small>
                </div>
                
                <div class="mb5">
                    <label>
                        <input type="checkbox" id="dropbox-enabled" name="dropbox_enabled">
                        <i class="fab fa-dropbox"></i> Integração com Dropbox
                    </label>
                    <small>Compartilhamento automático de arquivos</small>
                </div>
                
                <div class="mb5">
                    <label>
                        <input type="checkbox" id="multiday-support" name="multiday_support">
                        <i class="fas fa-calendar-week"></i> Suporte Multi-dia
                    </label>
                    <small>Eventos que se estendem por múltiplos dias</small>
                </div>
            </div>

            <div class="mb10">
                <h4><i class="fas fa-paint-brush"></i> Personalização</h4>
                
                <div class="mb5">
                    <label for="custom-css">CSS Personalizado</label>
                    <textarea id="custom-css" name="custom_css" rows="4" 
                              placeholder="/* CSS personalizado para a sala */"></textarea>
                    <small>CSS adicional que será aplicado apenas nesta sala</small>
                </div>
                
                <div class="mb5">
                    <label for="welcome-message">Mensagem de Boas-vindas</label>
                    <textarea id="welcome-message" name="welcome_message" rows="3" 
                              placeholder="Mensagem que aparece quando o usuário entra na sala"></textarea>
                </div>
            </div>

            <div class="mb10">
                <button type="submit" class="button-primary">
                    <i class="fas fa-rocket"></i> Criar Sala Virtual
                </button>
                <button type="button" onclick="renderRoomsList()" class="button-secondary">
                    <i class="fas fa-arrow-left"></i> Voltar
                </button>
            </div>
        `;

        grid.appendChild(form);
        container.appendChild(grid);
        mainContent.appendChild(container);

        // Event listeners para funcionalidades dinâmicas
        setupFormEventListeners(form);
    }

    function setupFormEventListeners(form) {
        // Listener para mudança de categoria
        const categorySelect = form.querySelector('#room-category');
        const featuresDiv = form.querySelector('#category-features');
        const featuresList = form.querySelector('#features-list');

        categorySelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption.value) {
                const features = JSON.parse(selectedOption.dataset.features || '[]');
                featuresList.textContent = features.join(', ');
                featuresDiv.style.display = 'block';
                
                // Auto-configurar recursos baseado na categoria
                autoConfigureFeatures(form, this.value, features);
            } else {
                featuresDiv.style.display = 'none';
            }
        });

        // Listener para mudança de salas unificadas
        const salasUnified = form.querySelector('#salas-unified');
        salasUnified.addEventListener('change', function() {
            updateConferenceTypesDisplay(form, this.checked);
        });

        // Listener para submission do formulário
        form.addEventListener('submit', handleCreateRoomSubmit);
    }

    function autoConfigureFeatures(form, category, features) {
        // Auto-configurar recursos avançados baseado na categoria
        const advancedFeatures = form.querySelectorAll('input[name="advanced_features"]');
        
        advancedFeatures.forEach(input => {
            input.checked = false; // Reset
            
            // Configurações automáticas por categoria
            if (category === 'ead') {
                if (['evaluation_system', 'presence_control', 'session_schedule', 'dropbox_integration'].includes(input.value)) {
                    input.checked = true;
                }
            } else if (category === 'educational') {
                if (['evaluation_system', 'poll_system', 'presence_control', 'timer_system'].includes(input.value)) {
                    input.checked = true;
                }
            } else if (category === 'forum') {
                if (['markdown_support', 'poll_system'].includes(input.value)) {
                    input.checked = true;
                }
            } else if (category === 'chat') {
                if (['notification_system', 'markdown_support'].includes(input.value)) {
                    input.checked = true;
                }
            } else if (category === 'continuous') {
                if (['presence_control', 'notification_system', 'session_schedule'].includes(input.value)) {
                    input.checked = true;
                }
            }
        });

        // Auto-configurar tipos de conferência baseado na categoria  
        const conferenceInputs = form.querySelectorAll('input[name="salas_enabled"]');
        conferenceInputs.forEach(input => {
            const confType = CONFERENCE_TYPES[input.value];
            if (confType) {
                if (category === 'ead' && ['sala', 'turma', 'grupo', 'projeto'].includes(input.value)) {
                    input.checked = true;
                } else if (category === 'educational' && ['sala', 'turma', 'grupo', 'professor'].includes(input.value)) {
                    input.checked = true;
                } else if (category === 'forum' && ['sala', 'grupo'].includes(input.value)) {
                    input.checked = true;
                } else if (category === 'chat' && ['sala', 'breakout'].includes(input.value)) {
                    input.checked = true;
                } else if (category === 'continuous' && ['sala', 'atendimento', 'oracao'].includes(input.value)) {
                    input.checked = true;
                }
            }
        });
    }

    function updateConferenceTypesDisplay(form, unified) {
        const conferenceTypesDiv = form.querySelector('#conference-types');
        const items = conferenceTypesDiv.querySelectorAll('.conference-type-item');
        
        if (unified) {
            items.forEach(item => {
                const input = item.querySelector('input[name="salas_enabled"]');
                if (input.value !== 'sala') {
                    item.style.opacity = '0.5';
                    input.disabled = true;
                    input.checked = false;
                }
            });
        } else {
            items.forEach(item => {
                const input = item.querySelector('input[name="salas_enabled"]');
                item.style.opacity = '1';
                input.disabled = false;
            });
        }
    }

    async function handleCreateRoomSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        // Converter FormData para objeto
        const roomData = {};
        for (let [key, value] of formData.entries()) {
            if (key === 'salas_enabled' || key === 'advanced_features') {
                if (!roomData[key]) roomData[key] = [];
                roomData[key].push(value);
            } else {
                roomData[key] = value;
            }
        }
        
        // Validações baseadas no virtual_adv.js
        if (!roomData.id || !roomData.title || !roomData.category) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        try {
            const response = await fetch('/api/rooms/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roomData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showSuccessModal(result);
            } else {
                alert(`Erro ao criar sala: ${result.error}`);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro interno do servidor. Tente novamente.');
        }
    }

    async function renderRoomsList() {
        try {
            clearMainContent(mainContent);
            const { container, grid } = createContentContainer('<i class="fas fa-list"></i> Salas Virtuais');
            
            const response = await fetch('/api/rooms');
            const data = await response.json();
            
            if (response.ok) {
                const roomsHtml = `
                    <div class="rooms-header mb10">
                        <span>Total: ${data.rooms.length} salas</span>
                        <button id="create-new-room" class="button-primary">
                            <i class="fas fa-plus"></i> Nova Sala
                        </button>
                    </div>
                    
                    <div class="rooms-grid">
                        ${data.rooms.map(room => `
                            <div class="room-card">
                                <div class="room-info">
                                    <h4>
                                        <i class="${ROOM_CATEGORIES[room.category]?.icon || 'fas fa-door-open'}"></i>
                                        ${room.title}
                                    </h4>
                                    <p class="room-category">${ROOM_CATEGORIES[room.category]?.name || room.category}</p>
                                    <p class="room-id">ID: ${room.id}</p>
                                    <div class="room-features">
                                        ${room.salas_enabled?.map(sala => `<span class="badge">${CONFERENCE_TYPES[sala]?.name || sala}</span>`).join('') || ''}
                                    </div>
                                </div>
                                <div class="room-actions">
                                    <a href="/vr/${room.id}" target="_blank" class="button-primary">
                                        <i class="fas fa-external-link-alt"></i> Acessar
                                    </a>
                                    <button onclick="editRoom('${room.id}')" class="button-secondary">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    ${data.rooms.length === 0 ? `
                        <div style="text-align: center; padding: 40px;">
                            <i class="fas fa-door-open" style="font-size: 64px; color: #ccc; margin-bottom: 20px;"></i>
                            <h3>Nenhuma sala encontrada</h3>
                            <p>Clique em "Nova Sala" para criar sua primeira sala virtual.</p>
                            <button onclick="renderCreateRoom()" class="button-primary">
                                <i class="fas fa-plus"></i> Criar Primeira Sala
                            </button>
                        </div>
                    ` : ''}
                `;
                
                grid.innerHTML = roomsHtml;
                
                // Event listener para botão de nova sala
                const createNewBtn = grid.querySelector('#create-new-room');
                if (createNewBtn) {
                    createNewBtn.addEventListener('click', renderCreateRoom);
                }
                
            } else {
                grid.innerHTML = `
                    <div class="error-message">
                        <p><i class="fas fa-exclamation-triangle"></i> Erro ao carregar salas: ${data.error}</p>
                        <button onclick="location.reload()" class="button-secondary">Tentar Novamente</button>
                    </div>
                `;
            }
            
            container.appendChild(grid);
            mainContent.appendChild(container);
            
        } catch (error) {
            console.error('Erro ao carregar salas:', error);
            clearMainContent(mainContent);
            mainContent.innerHTML = `
                <div class="error-message">
                    <p><i class="fas fa-exclamation-triangle"></i> Erro interno do servidor.</p>
                    <button onclick="location.reload()" class="button-secondary">Tentar Novamente</button>
                </div>
            `;
        }
    }

    function showSuccessModal(room) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-check-circle"></i> Sala Criada com Sucesso!</h3>
                </div>
                <div class="modal-body">
                    <p><strong>ID da Sala:</strong> ${room.id}</p>
                    <p><strong>Título:</strong> ${room.title}</p>
                    <p><strong>Categoria:</strong> ${ROOM_CATEGORIES[room.category]?.name}</p>
                    <p><strong>URL de Acesso:</strong></p>
                    <div class="url-display">
                        <input type="text" value="${window.location.origin}/vr/${room.id}" readonly>
                        <button onclick="copyToClipboard(this.previousElementSibling.value)">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    
                    <div class="room-summary">
                        <h4>Configurações Aplicadas:</h4>
                        <ul>
                            <li><i class="fas fa-video"></i> Transmissão: ${room.live_enabled ? 'Habilitada' : 'Desabilitada'}</li>
                            <li><i class="fas fa-comments"></i> Chat: ${room.chat_enabled ? 'Habilitado' : 'Desabilitado'}</li>
                            <li><i class="fas fa-video"></i> Jitsi: ${room.jitsi_enabled ? 'Habilitado' : 'Desabilitado'}</li>
                            <li><i class="fas fa-users"></i> Conferências: ${room.salas_enabled?.length || 0} tipos</li>
                            <li><i class="fas fa-magic"></i> Recursos: ${room.advanced_features?.length || 0} avançados</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="window.open('/vr/${room.id}', '_blank')" class="button-primary">
                        <i class="fas fa-external-link-alt"></i> Acessar Sala
                    </button>
                    <button onclick="renderRoomsList(); this.closest('.modal-overlay').remove()" class="button-secondary">
                        <i class="fas fa-list"></i> Ver Todas as Salas
                    </button>
                    <button onclick="renderCreateRoom(); this.closest('.modal-overlay').remove()" class="button-secondary">
                        <i class="fas fa-plus"></i> Criar Outra Sala
                    </button>
                    <button onclick="this.closest('.modal-overlay').remove()" class="button-secondary">
                        Fechar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-remover após 30 segundos
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 30000);
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('URL copiada para a área de transferência!');
        });
    }

    function editRoom(roomId) {
        alert(`Funcionalidade de edição em desenvolvimento. Sala: ${roomId}`);
    }

    function renderDashboard() {
        renderRoomsList();
    }

    // Event listener para o botão de criar sala
    if (createRoomButton) {
        createRoomButton.addEventListener('click', function(e) {
            e.preventDefault();
            renderCreateRoom();
        });
    }

    // Expor funções globalmente se necessário
    window.renderCreateRoom = renderCreateRoom;
    window.renderRoomsList = renderRoomsList;
    window.editRoom = editRoom;
    window.copyToClipboard = copyToClipboard;
});
