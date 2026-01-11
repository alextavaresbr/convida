/**
 * TIM LEVELS - Gerenciamento de Níveis de Acesso
 * Sistema para edição de níveis de acesso dos participantes
 */

(function() {
    'use strict';

    let mainContent;
    let participantsCache = [];

    /**
     * Inicializar sistema de níveis de acesso
     */
    function initializeLevels() {
        console.log('🚀 Inicializando TIM Levels...');
        
        const actionButton = document.getElementById('action_roles');
        mainContent = document.getElementById('virtual-main');
        
        if (!actionButton) {
            console.error('❌ Botão action_roles não encontrado');
            return;
        }
        
        if (!mainContent) {
            console.error('❌ Elemento virtual-main não encontrado');
            return;
        }

        updateExistingButton(actionButton);
    }

    /**
     * Atualizar botão existente para mostrar seção de níveis
     */
    function updateExistingButton(button) {
        console.log('🔧 Configurando botão de níveis de acesso...');
        
        // Remover event listeners antigos
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Adicionar novo event listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🎯 Botão de níveis clicado');
            
            // Remover classe ativa de outros botões
            document.querySelectorAll('.action').forEach(btn => btn.classList.remove('ativo'));
            
            // Adicionar classe ativa ao botão atual
            this.classList.add('ativo');
            
            // Mostrar seção de níveis
            showLevelsSection();
        });
    }

    /**
     * Mostrar seção de gerenciamento de níveis
     */
    async function showLevelsSection() {
        console.log('📋 Exibindo seção de níveis de acesso...');
        
        // Limpar conteúdo atual
        mainContent.innerHTML = '';

        // Criar container principal
        const container = document.createElement('div');
        container.className = 'container_12';

        // Título
        const titleDiv = document.createElement('div');
        titleDiv.className = 'grid_12 mb20';
        titleDiv.innerHTML = `
            <div class="bg bg_bordered">
                <h2 class="mb0">
                    <i class="fas fa-user-shield"></i>
                    Níveis de Acesso
                </h2>
            </div>
        `;
        container.appendChild(titleDiv);

        // Informações sobre níveis
        const infoDiv = document.createElement('div');
        infoDiv.className = 'grid_12 mb20';
        infoDiv.innerHTML = `
            <div class="bg bg_bordered">
                <div class="mb15">
                    <strong><i class="fas fa-info-circle"></i> Níveis de Acesso Disponíveis:</strong>
                </div>
                <div class="clearfix">
                    <div class="grid_3 alpha">
                        <div class="bg2 bg_bordered">
                            <div class="bold">Nível 0</div>
                            <div class="fs09">Participante</div>
                            <div class="fs08 sep">Acesso básico à sala</div>
                        </div>
                    </div>
                    <div class="grid_3">
                        <div class="bg2 bg_bordered">
                            <div class="bold">Nível 1</div>
                            <div class="fs09">Moderador</div>
                            <div class="fs08 sep">Moderação de chat e usuários</div>
                        </div>
                    </div>
                    <div class="grid_3">
                        <div class="bg2 bg_bordered">
                            <div class="bold">Nível 2</div>
                            <div class="fs09">Docente</div>
                            <div class="fs08 sep">Controle total da sala</div>
                        </div>
                    </div>
                    <div class="grid_3 omega">
                        <div class="bg2 bg_bordered" style="opacity: 0.5;">
                            <div class="bold">Nível 3</div>
                            <div class="fs09">Administrador</div>
                            <div class="fs08 sep">Acesso restrito ao sistema</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(infoDiv);

        // Container da lista
        const listDiv = document.createElement('div');
        listDiv.className = 'grid_12';
        container.appendChild(listDiv);

        // Loading
        const loadingDiv = document.createElement('div');
        loadingDiv.innerHTML = `
            <div class="loading-container">
                <i class="fas fa-spinner fa-spin fa-2x"></i>
                <div class="loading-text">Carregando participantes...</div>
            </div>
        `;
        listDiv.appendChild(loadingDiv);
        mainContent.appendChild(container);

        try {
            // Carregar participantes
            await loadParticipants();
            
            // Remover loading
            if (listDiv.contains(loadingDiv)) {
                listDiv.removeChild(loadingDiv);
            }

            // Renderizar lista
            renderParticipantsList(listDiv);

        } catch (error) {
            console.error('❌ Erro ao carregar participantes:', error);
            listDiv.innerHTML = `
                <div class="bg bg_bordered mb10">
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle fa-2x"></i>
                        <div>Erro ao carregar participantes: ${error.message}</div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Carregar lista de participantes
     */
    async function loadParticipants() {
        try {
            console.log('📡 Carregando participantes...');
            const response = await fetch('/api/participantes.json');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            participantsCache = await response.json();
            console.log(`📊 Carregados ${participantsCache.length} participantes`);
            
            return participantsCache;
        } catch (error) {
            console.error('❌ Erro ao carregar participantes:', error);
            participantsCache = [];
            throw error;
        }
    }

    /**
     * Renderizar lista de participantes com controles de nível
     */
    function renderParticipantsList(container) {
        if (participantsCache.length === 0) {
            container.innerHTML = `
                <div class="bg bg_bordered mb10">
                    <div class="empty-state">
                        <i class="fas fa-users fa-2x"></i>
                        <div>Nenhum participante encontrado na sala</div>
                    </div>
                </div>
            `;
            return;
        }

        // Ordenar por nível (maior para menor) e depois por nick
        const sortedParticipants = [...participantsCache].sort((a, b) => {
            if (a.level !== b.level) {
                return b.level - a.level; // Nível maior primeiro
            }
            return (a.nick || '').localeCompare(b.nick || '');
        });

        const listContainer = document.createElement('div');
        
        sortedParticipants.forEach(participant => {
            const participantCard = document.createElement('div');
            participantCard.className = 'bg bg_bordered mb10';
            
            // Mapeamento de níveis
            const levelInfo = {
                0: { name: 'Participante', color: '#95a5a6', icon: 'fas fa-user' },
                1: { name: 'Moderador', color: '#f39c12', icon: 'fas fa-user-tie' },
                2: { name: 'Docente', color: '#e74c3c', icon: 'fas fa-chalkboard-teacher' },
                3: { name: 'Administrador', color: '#9b59b6', icon: 'fas fa-user-cog' }
            };

            const currentLevel = levelInfo[participant.level] || levelInfo[0];
            
            participantCard.innerHTML = `
                <div class="clearfix">
                    <div class="grid_4 alpha">
                        <div class="mb5">
                            <strong class="fs12">${participant.nick || 'N/A'}</strong>
                            <span class="fs09 sep">ID: ${participant.id}</span>
                        </div>
                        <div class="fs09">
                            <span class="sep">${participant.uf || 'N/A'}</span>
                            ${participant.equipe ? `| Equipe: ${participant.equipe}` : ''}
                            ${participant.turma ? `| Turma: ${participant.turma}` : ''}
                        </div>
                    </div>
                    <div class="grid_3">
                        <div class="level-indicator" style="color: ${currentLevel.color};">
                            <i class="${currentLevel.icon}"></i>
                            <span class="bold">${currentLevel.name}</span>
                        </div>
                        <div class="fs09 sep">Nível ${participant.level}</div>
                    </div>
                    <div class="grid_3">
                        <label class="fs09 bold mb5">Alterar Nível:</label>
                        <select class="level-select" data-participant-id="${participant.id}" data-current-level="${participant.level}">
                            <option value="0" ${participant.level === 0 ? 'selected' : ''}>Nível 0 - Participante</option>
                            <option value="1" ${participant.level === 1 ? 'selected' : ''}>Nível 1 - Moderador</option>
                            <option value="2" ${participant.level === 2 ? 'selected' : ''}>Nível 2 - Docente</option>
                        </select>
                    </div>
                    <div class="grid_2 omega">
                        <button class="save-level-btn" data-participant-id="${participant.id}" style="display: none;">
                            <i class="fas fa-save"></i> Salvar
                        </button>
                        <div class="fs09 sep">
                            Última atividade:<br>
                            ${participant.lastActivity ? new Date(participant.lastActivity).toLocaleString('pt-BR') : 'N/A'}
                        </div>
                    </div>
                </div>
            `;
            
            listContainer.appendChild(participantCard);
        });

        container.appendChild(listContainer);

        // Adicionar event listeners
        setupLevelChangeListeners(listContainer);
    }

    /**
     * Configurar event listeners para mudanças de nível
     */
    function setupLevelChangeListeners(container) {
        // Event listeners para selects de nível
        container.querySelectorAll('.level-select').forEach(select => {
            select.addEventListener('change', function() {
                const participantId = this.getAttribute('data-participant-id');
                const currentLevel = parseInt(this.getAttribute('data-current-level'));
                const newLevel = parseInt(this.value);
                
                const saveBtn = container.querySelector(`button[data-participant-id="${participantId}"]`);
                
                if (newLevel !== currentLevel) {
                    // Mostrar botão salvar
                    saveBtn.style.display = 'inline-block';
                    this.style.borderColor = '#e74c3c';
                } else {
                    // Esconder botão salvar
                    saveBtn.style.display = 'none';
                    this.style.borderColor = '';
                }
            });
        });

        // Event listeners para botões salvar
        container.querySelectorAll('.save-level-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const participantId = parseInt(this.getAttribute('data-participant-id'));
                const select = container.querySelector(`select[data-participant-id="${participantId}"]`);
                const newLevel = parseInt(select.value);
                
                const originalText = this.innerHTML;
                
                try {
                    // Mostrar loading
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
                    this.disabled = true;
                    
                    await updateParticipantLevel(participantId, newLevel);
                    
                    // Atualizar cache local
                    const participant = participantsCache.find(p => p.id === participantId);
                    if (participant) {
                        participant.level = newLevel;
                    }
                    
                    // Atualizar interface
                    select.setAttribute('data-current-level', newLevel);
                    this.style.display = 'none';
                    select.style.borderColor = '';
                    
                    // Feedback de sucesso
                    const card = this.closest('.bg');
                    card.style.backgroundColor = '#d4edda';
                    setTimeout(() => {
                        card.style.backgroundColor = '';
                    }, 1500);
                    
                    console.log(`✅ Nível do participante ${participantId} alterado para ${newLevel}`);
                    
                } catch (error) {
                    console.error('❌ Erro ao salvar nível:', error);
                    
                    // Restaurar select
                    const originalLevel = select.getAttribute('data-current-level');
                    select.value = originalLevel;
                    
                    // Mostrar erro
                    alert(`Erro ao salvar nível: ${error.message}`);
                    
                } finally {
                    // Restaurar botão
                    this.innerHTML = originalText;
                    this.disabled = false;
                }
            });
        });
    }

    /**
     * Atualizar nível do participante
     */
    async function updateParticipantLevel(participantId, newLevel) {
        try {
            const response = await fetch('/api/participants/level', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participantId: participantId,
                    level: newLevel
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('❌ Erro ao atualizar nível do participante:', error);
            throw error;
        }
    }

    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeLevels);
    } else {
        initializeLevels();
    }

})();
