// tim-users.js

document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('virtual-main');
    const userListButton = document.getElementById('action_user_list');

    // Cache para armazenar dados dos usuários
    let usersCache = [];
    let participantsCache = [];

    /**
     * Buscar participantes do arquivo JSON
     */
    async function fetchParticipants() {
        try {
            const response = await fetch('/admin/tim/api/participantes.json', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            participantsCache = data || [];
            return participantsCache;
        } catch (error) {
            console.error('❌ Erro ao carregar participantes:', error);
            participantsCache = [];
            return participantsCache;
        }
    }

    /**
     * Buscar usuários do Supabase
     */
    async function fetchUsers() {
        try {
            const response = await fetch('/admin/tim/api/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            usersCache = data.users || [];
            return usersCache;
        } catch (error) {
            console.error('❌ Erro ao carregar usuários:', error);
            usersCache = [];
            throw error;
        }
    }

    /**
     * Criar overlay para mostrar detalhes do usuário
     */
    function createUserDetailsOverlay(user) {
        // Remover overlay existente se houver
        const existingOverlay = document.getElementById('user-details-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.id = 'user-details-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box';

        const modal = document.createElement('div');
        modal.className = 'bg bg_bordered';
        modal.style.cssText = 'max-width:800px;width:100%;max-height:90vh;overflow-y:auto;position:relative';

        // Mapeamento de situações
        const situacaoMap = {
            0: 'Inativo',
            1: 'Ativo',
            2: 'Inscrito',
            3: 'Participante',
            4: 'Concluído',
            5: 'Certificado'
        };

        // Mapeamento de níveis
        const levelMap = {
            0: 'Participante',
            1: 'Moderador', 
            2: 'Docente',
            3: 'Administrador'
        };

        modal.innerHTML = `
            <div class="bg bg_bordered mb10">
                <div class="clearfix">
                    <div class="grid_11 alpha">
                        <h3 class="mb0">
                            <i class="fas fa-user"></i> Detalhes do Usuário
                        </h3>
                    </div>
                    <div class="grid_1 omega">
                        <a href="#" id="close-overlay" class="action">×</a>
                    </div>
                </div>
            </div>
            
            <div class="bg bg_bordered mb20">
                <div class="mb15">
                    <div class="mb10"><strong>ID:</strong> ${user.id || 'N/A'}</div>
                    <div class="mb10"><strong>Nome:</strong> ${user.nome || 'N/A'}</div>
                    <div class="mb10"><strong>Apelido:</strong> ${user.apelido || 'N/A'}</div>
                    <div class="mb10"><strong>Data Nascimento:</strong> ${user.data_nascimento || 'N/A'}</div>
                    <div class="mb10"><strong>Sexo:</strong> ${user.sexo === 1 ? 'Masculino' : user.sexo === 2 ? 'Feminino' : 'N/A'}</div>
                    <div class="mb10"><strong>Estado Civil:</strong> ${user.estado_civil === 1 ? 'Solteiro' : user.estado_civil === 2 ? 'Casado' : user.estado_civil === 3 ? 'Divorciado' : user.estado_civil === 4 ? 'Viúvo' : 'N/A'}</div>
                    <div class="mb10"><strong>País:</strong> ${user.pais || 'N/A'}</div>
                    <div class="mb10"><strong>Cidade:</strong> ${user.cidade || 'N/A'}</div>
                    <div class="mb10"><strong>UF:</strong> ${user.uf || 'N/A'}</div>
                    <div class="mb10"><strong>Graduado:</strong> ${user.graduado ? 'Sim' : 'Não'}</div>
                    <div class="mb10"><strong>Situação:</strong> ${situacaoMap[user.situacao] || user.situacao || 'N/A'}</div>
                    <div class="mb10"><strong>Nível:</strong> ${levelMap[user.level] || user.level || 'N/A'}</div>
                    <div class="mb10"><strong>Equipe:</strong> ${user.equipe || 'N/A'}</div>
                    <div class="mb10"><strong>Turma:</strong> ${user.turma || 'N/A'}</div>
                    <div class="mb10"><strong>Grupo:</strong> ${user.grupo || 'N/A'}</div>
                    <div class="mb10"><strong>Rede:</strong> ${user.rede || 'N/A'}</div>
                    <div class="mb10"><strong>Hospedagem:</strong> ${user.hospedagem || 'N/A'}</div>
                    <div class="mb10"><strong>Quarto:</strong> ${user.quarto || 'N/A'}</div>
                    <div class="mb10"><strong>Parceiro:</strong> ${user.parceiro || 'N/A'}</div>
                    <div class="mb10"><strong>Ocupação Secular:</strong> ${user.ocupacao_secular || 'N/A'}</div>
                    <div class="mb10"><strong>Ocupação Religiosa:</strong> ${user.ocupacao_religiosa || 'N/A'}</div>
                    <div class="mb10"><strong>Área de Atuação:</strong> ${user.area_de_atuacao || 'N/A'}</div>
                    <div class="mb10"><strong>Igreja Local:</strong> ${user.igreja_local || 'N/A'}</div>
                    <div class="mb10"><strong>Denominação:</strong> ${user.denominacao || 'N/A'}</div>
                    <div class="mb10"><strong>Pesquisa 1:</strong> ${user.pesquisa1 || 'N/A'}</div>
                    <div class="mb10"><strong>Pesquisa 2:</strong> ${user.pesquisa2 || 'N/A'}</div>
                    <div class="mb10"><strong>Mailing:</strong> ${user.mailing ? 'Sim' : 'Não'}</div>
                    <div class="mb10"><strong>Criado em:</strong> ${user.created_at ? new Date(user.created_at).toLocaleString('pt-BR') : 'N/A'}</div>
                    <div class="mb0"><strong>Atualizado em:</strong> ${user.updated_at ? new Date(user.updated_at).toLocaleString('pt-BR') : 'N/A'}</div>
                </div>
            </div>
            
            ${user.observacoes ? `
                <div class="bg bg_bordered mb0">
                    <div class="mb10">
                        <strong>Observações:</strong>
                    </div>
                    <div class="bg2 bg_bordered">
                        ${user.observacoes}
                    </div>
                </div>
            ` : ''}
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Event listeners para fechar
        document.getElementById('close-overlay').addEventListener('click', (e) => {
            e.preventDefault();
            overlay.remove();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    /**
     * Criar overlay de confirmação para exclusão de usuário
     */
    function createDeleteConfirmationOverlay(user, onSuccess) {
        // Remover overlay existente se houver
        const existingOverlay = document.getElementById('delete-confirmation-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.id = 'delete-confirmation-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box';

        const modal = document.createElement('div');
        modal.className = 'bg bg_bordered';
        modal.style.cssText = 'max-width:500px;width:100%;position:relative';

        modal.innerHTML = `
            <div class="bg bg_bordered mb10">
                <div class="clearfix">
                    <div class="grid_11 alpha">
                        <h3 class="mb0">
                            <i class="fas fa-exclamation-triangle"></i>
                            Confirmar Exclusão
                        </h3>
                    </div>
                    <div class="grid_1 omega">
                        <a href="#" id="close-delete-overlay" class="action">×</a>
                    </div>
                </div>
            </div>
            <div class="bg bg_bordered mb20">
                <div class="mb20">
                    <div class="mb15">
                        <i class="fas fa-user-times fa-3x"></i>
                    </div>
                    <p class="mb10 bold">
                        Tem certeza que deseja excluir este usuário?
                    </p>
                    <div class="bg2 bg_bordered mb15">
                        <div class="bold">${user.nome || 'N/A'}</div>
                        <div class="fs09 sep">ID: ${user.id} | Email: ${user.email || 'N/A'}</div>
                    </div>
                    <p class="fs09 mb10">
                        ⚠️ <strong>Esta ação é IRREVERSÍVEL!</strong><br>
                        O usuário será removido da sala virtual.
                    </p>
                </div>
                <div class="clearfix">
                    <div class="grid_6 alpha">
                        <a href="#" id="cancel-delete-btn" class="action">Cancelar</a>
                    </div>
                    <div class="grid_6 omega">
                        <a href="#" id="confirm-delete-btn" class="action">
                            <i class="fas fa-user-minus"></i> Excluir da Sala
                        </a>
                    </div>
                </div>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Event listeners para fechar
        document.getElementById('close-delete-overlay').addEventListener('click', (e) => {
            e.preventDefault();
            overlay.remove();
        });

        document.getElementById('cancel-delete-btn').addEventListener('click', (e) => {
            e.preventDefault();
            overlay.remove();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        // Event listener para confirmar exclusão
        document.getElementById('confirm-delete-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            
            const confirmBtn = e.target.closest('a');
            const originalText = confirmBtn.innerHTML;
            
            try {
                // Mostrar loading
                confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Excluindo...';
                confirmBtn.style.pointerEvents = 'none';
                
                await deleteUser(user.id);
                
                // Fechar overlay
                overlay.remove();
                
                // Callback de sucesso (recarregar lista)
                if (onSuccess) {
                    onSuccess();
                }
                
            } catch (error) {
                console.error('❌ Erro ao excluir usuário:', error);
                
                // Restaurar botão
                confirmBtn.innerHTML = originalText;
                confirmBtn.style.pointerEvents = 'auto';
                
                // Mostrar mensagem de erro
                alert(`Erro ao excluir usuário: ${error.message}`);
            }
        });
    }

    /**
     * Excluir usuário no Supabase
     */
    async function deleteUser(userId) {
        try {
            const response = await fetch(`/admin/tim/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            return result;
        } catch (error) {
            console.error('❌ Erro ao excluir usuário:', error);
            throw error;
        }
    }

    /**
     * Criar overlay de confirmação para inclusão na sala
     */
    function createIncludeConfirmationOverlay(user, onSuccess) {
        // Remover overlay existente se houver
        const existingOverlay = document.getElementById('include-confirmation-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.id = 'include-confirmation-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box';

        const modal = document.createElement('div');
        modal.className = 'bg bg_bordered';
        modal.style.cssText = 'max-width:500px;width:100%;position:relative';

        modal.innerHTML = `
            <div class="bg bg_bordered mb10">
                <div class="clearfix">
                    <div class="grid_11 alpha">
                        <h3 class="mb0">
                            <i class="fas fa-user-plus"></i> Incluir na Sala
                        </h3>
                    </div>
                    <div class="grid_1 omega">
                        <a href="#" id="close-include-overlay" class="action">×</a>
                    </div>
                </div>
            </div>
            <div class="bg bg_bordered mb20">
                <div class="mb20">
                    <div class="mb15">
                        <i class="fas fa-user-plus fa-3x" style="color: #27ae60;"></i>
                    </div>
                    <p class="mb10 bold">
                        Tem certeza que deseja incluir este usuário na sala?
                    </p>
                    <div class="bg2 bg_bordered mb15">
                        <div class="bold">${user.nome || 'N/A'}</div>
                        <div class="fs09 sep">ID: ${user.id} | Email: ${user.email || 'N/A'}</div>
                    </div>
                    <p class="fs09 mb10">
                        ✅ O usuário será adicionado à sala virtual automaticamente.
                    </p>
                </div>
                <div class="clearfix">
                    <div class="grid_6 alpha">
                        <a href="#" id="cancel-include-btn" class="action">Cancelar</a>
                    </div>
                    <div class="grid_6 omega">
                        <a href="#" id="confirm-include-btn" class="action">
                            <i class="fas fa-user-plus"></i> Incluir na Sala
                        </a>
                    </div>
                </div>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Event listeners para fechar
        document.getElementById('close-include-overlay').addEventListener('click', (e) => {
            e.preventDefault();
            overlay.remove();
        });

        document.getElementById('cancel-include-btn').addEventListener('click', (e) => {
            e.preventDefault();
            overlay.remove();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        // Event listener para confirmar inclusão
        document.getElementById('confirm-include-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            
            const confirmBtn = e.target.closest('a');
            const originalText = confirmBtn.innerHTML;
            
            try {
                // Mostrar loading
                confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Incluindo...';
                confirmBtn.style.pointerEvents = 'none';
                
                await includeUser(user.id);
                
                console.log('✅ Usuário incluído com sucesso, recarregando lista...');
                
                // Fechar overlay
                overlay.remove();
                
                // Callback de sucesso (recarregar lista)
                if (onSuccess) {
                    onSuccess();
                }
                
            } catch (error) {
                console.error('❌ Erro ao incluir usuário na sala:', error);
                
                // Restaurar botão
                confirmBtn.innerHTML = originalText;
                confirmBtn.style.pointerEvents = 'auto';
                
                // Mostrar mensagem de erro
                alert(`Erro ao incluir usuário na sala: ${error.message}`);
            }
        });
    }

    /**
     * Incluir usuário na sala virtual (adicionar ao participants.json)
     */
    async function includeUser(userId) {
        try {
            const response = await fetch(`/admin/tim/api/users/${userId}/include`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            return result;
        } catch (error) {
            console.error('❌ Erro ao incluir usuário na sala:', error);
            throw error;
        }
    }

    /**
     * Renderizar lista de usuários
     */
    async function renderUserList() {
        console.log('🔄 Recarregando lista de usuários...');
        
        // Limpar conteúdo atual
        mainContent.innerHTML = '';

        // Criar container principal
        const container = document.createElement('div');
        container.className = 'container_12';

        // Criar título
        const titleDiv = document.createElement('div');
        titleDiv.className = 'grid_12 mb20';
        titleDiv.innerHTML = `
            <div class="bg bg_bordered">
                <h2 class="mb0">
                    <i class="fas fa-users"></i>
                    Lista de Usuários
                </h2>
            </div>
        `;
        container.appendChild(titleDiv);

        // Criar grid
        const grid = document.createElement('div');
        grid.className = 'grid_12';
        container.appendChild(grid);

        // Mostrar loading
        const loadingDiv = document.createElement('div');
        loadingDiv.innerHTML = `
            <div class="loading-container">
                <i class="fas fa-spinner fa-spin fa-2x"></i>
                <div class="loading-text">Carregando usuários...</div>
            </div>
        `;
        grid.appendChild(loadingDiv);
        mainContent.appendChild(container);

        try {
            const [users, participants] = await Promise.all([
                fetchUsers(),
                fetchParticipants()
            ]);

            console.log(`📊 Carregados ${users.length} usuários e ${participants.length} participantes`);
            console.log('👥 Participantes na sala:', participants.map(p => `${p.nick} (ID: ${p.id})`));

            // Remover loading
            if (grid.contains(loadingDiv)) {
                grid.removeChild(loadingDiv);
            }

            const userListContainer = document.createElement('div');
            
            if (users.length === 0) {
                userListContainer.innerHTML = `
                    <div class="bg bg_bordered mb10 empty-state">
                        <i class="fas fa-users fa-2x empty-state-icon"></i>
                        <div>Nenhum usuário encontrado</div>
                    </div>
                `;
            } else {
                users.forEach(user => {
                    const userCard = document.createElement('div');
                    userCard.className = 'bg bg_bordered mb10';
                    
                    // Verificar se usuário está na sala (participants.json)
                    const isInRoom = participants.some(p => p.id === user.id);
                    
                    // Mapeamentos
                    const levelMap = { 0: 'Participante', 1: 'Moderador', 2: 'Docente', 3: 'Admin' };
                    const situacaoMap = { 0: 'Inativo', 1: 'Ativo', 2: 'Inscrito', 3: 'Participante', 4: 'Concluído', 5: 'Certificado' };
                    
                    // Ícone e ação baseados no status da sala
                    const actionButton = isInRoom 
                        ? `<a href="#" class="action tooltip delete-user-btn" data-user-id="${user.id}" data-user-name="${user.nome}" data-pt-title="Excluir da Sala">
                               <i class="fas fa-user-minus" style="color: #e74c3c;"></i>
                           </a>`
                        : `<a href="#" class="action tooltip include-user-btn" data-user-id="${user.id}" data-user-name="${user.nome}" data-pt-title="Re-incluir na Sala">
                               <i class="fas fa-user-plus" style="color: #27ae60;"></i>
                           </a>`;
                    
                    userCard.innerHTML = `
                        <div class="clearfix">
                            <div class="grid_3 alpha">
                                <strong class="fs12">${user.nome || 'N/A'}</strong>
                                <div class="fs09 sep">ID: ${user.id || 'N/A'} | Apelido: ${user.apelido || 'N/A'}</div>
                                ${isInRoom ? '<div class="fs09" style="color: #27ae60;"><i class="fas fa-check-circle"></i> Na sala</div>' : '<div class="fs09" style="color: #95a5a6;"><i class="fas fa-times-circle"></i> Fora da sala</div>'}
                            </div>
                            <div class="grid_3">
                                <span>${user.email || 'N/A'}</span>
                                <div class="fs09 sep">${user.cidade || 'N/A'}, ${user.uf || 'N/A'}</div>
                            </div>
                            <div class="grid_2">
                                <span>${levelMap[user.level] || 'N/A'}</span>
                                <div class="fs09 sep">Turma: ${user.turma || 'N/A'}</div>
                            </div>
                            <div class="grid_2">
                                <span class="bold">${situacaoMap[user.situacao] || user.situacao || 'N/A'}</span>
                            </div>
                            <div class="grid_2 omega mobile_clearboth">
                                <a href="#" class="action tooltip view-details-btn" data-user-id="${user.id}" data-pt-title="Ver Detalhes">
                                    <i class="fas fa-eye"></i>
                                </a>
                                ${actionButton}
                                </a>
                            </div>
                        </div>
                    `;
                    userListContainer.appendChild(userCard);
                });

                // Adicionar event listeners para "Ver Detalhes"
                userListContainer.querySelectorAll('.view-details-btn').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        const userId = parseInt(this.getAttribute('data-user-id'));
                        const user = users.find(u => u.id === userId);
                        if (user) {
                            createUserDetailsOverlay(user);
                        }
                    });
                });

                // Adicionar event listeners para "Excluir"
                userListContainer.querySelectorAll('.delete-user-btn').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        const userId = parseInt(this.getAttribute('data-user-id'));
                        const userName = this.getAttribute('data-user-name');
                        const user = users.find(u => u.id === userId);
                        if (user) {
                            createDeleteConfirmationOverlay(user, () => renderUserList());
                        }
                    });
                });

                // Adicionar event listeners para "Re-incluir na Sala"
                userListContainer.querySelectorAll('.include-user-btn').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        const userId = parseInt(this.getAttribute('data-user-id'));
                        const userName = this.getAttribute('data-user-name');
                        const user = users.find(u => u.id === userId);
                        if (user) {
                            createIncludeConfirmationOverlay(user, () => renderUserList());
                        }
                    });
                });
            }

            grid.appendChild(userListContainer);

            // Adicionar estatísticas
            const usersInRoom = users.filter(u => participants.some(p => p.id === u.id)).length;
            const usersOutRoom = users.length - usersInRoom;
            
            const statsDiv = document.createElement('div');
            statsDiv.className = 'bg bg_bordered mb10';
            statsDiv.innerHTML = `
                <div class="clearfix">
                    <div class="grid_3 alpha"><strong>Total de Usuários:</strong> ${users.length}</div>
                    <div class="grid_3"><strong>Na Sala:</strong> <span style="color: #27ae60;">${usersInRoom}</span></div>
                    <div class="grid_3"><strong>Fora da Sala:</strong> <span style="color: #95a5a6;">${usersOutRoom}</span></div>
                    <div class="grid_3 omega"><strong>Último carregamento:</strong> ${new Date().toLocaleTimeString('pt-BR')}</div>
                </div>
            `;
            grid.appendChild(statsDiv);

        } catch (error) {
            // Limpar loading em caso de erro
            if (grid.contains(loadingDiv)) {
                grid.removeChild(loadingDiv);
            }
            
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `
                <div class="bg bg_bordered mb10 error-state">
                    <i class="fas fa-exclamation-triangle fa-2x error-icon"></i>
                    <div><strong>Erro ao carregar usuários</strong></div>
                    <div class="error-message">${error.message}</div>
                    <button onclick="location.reload()" class="error-reload-btn">
                        Tentar Novamente
                    </button>
                </div>
            `;
            grid.appendChild(errorDiv);
        }
    }

    // Event listener para o botão de lista de usuários
    if (userListButton) {
        userListButton.addEventListener('click', function(e) {
            e.preventDefault();
            renderUserList();
        });
    }
});
