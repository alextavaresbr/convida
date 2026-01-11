/**
 * TIM-MANU.JS
 * Sistema de Manutenção do Timotin
 * Permite ativar/desativar modo de manutenção da sala virtual
 */

class TimMaintenance {
    constructor() {
        this.maintenanceKey = 'tim_maintenance_mode';
        this.init();
    }

    /**
     * Inicializa o sistema de manutenção
     */
    async init() {
        await this.syncWithServer();
        this.updateExistingButton(); // Atualiza o botão existente
        this.checkMaintenanceMode();
        this.bindEvents();
    }

    /**
     * Sincroniza o status local com o servidor
     */
    async syncWithServer() {
        try {
            const serverStatus = await this.loadMaintenanceFromServer();
            console.log('🔄 Status sincronizado com servidor:', serverStatus);
        } catch (error) {
            console.warn('Não foi possível sincronizar com servidor:', error);
        }
    }

    /**
     * Atualiza o botão existente com o status atual
     */
    updateExistingButton() {
        const existingButton = document.getElementById('action_maintenance');
        if (!existingButton) return;

        const isMaintenanceActive = this.getMaintenanceStatus();
        const icon = existingButton.querySelector('i');
        
        if (icon) {
            icon.style.color = isMaintenanceActive ? '#ff4757' : 'inherit';
        }
        
        // Atualiza o tooltip para refletir o status
        const currentTitle = isMaintenanceActive 
            ? 'Ferramentas de manutenção do banco (MODO ATIVO)'
            : 'Ferramentas de manutenção do banco';
        existingButton.setAttribute('data-pt-title', currentTitle);
    }

    /**
     * Vincula os eventos do botão
     */
    bindEvents() {
        const actionButton = document.getElementById('action_maintenance');
        console.log('🔍 [DEBUG] Procurando botão action_maintenance:', actionButton);
        
        if (actionButton) {
            console.log('✅ [DEBUG] Botão encontrado, vinculando evento');
            actionButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔧 [DEBUG] Botão manutenção clicado!');
                this.showMaintenanceSection();
            });
        } else {
            console.warn('❌ [DEBUG] Botão action_maintenance não encontrado!');
        }
    }

    /**
     * Mostra a seção de manutenção no painel principal
     */
    showMaintenanceSection() {
        console.log('🔧 [DEBUG] showMaintenanceSection chamada');
        const mainContent = document.getElementById('virtual-main');
        console.log('🔍 [DEBUG] Elemento virtual-main:', mainContent);
        
        if (!mainContent) {
            console.warn('❌ [DEBUG] Elemento virtual-main não encontrado!');
            return;
        }

        const isMaintenanceActive = this.getMaintenanceStatus();
        console.log('🔍 [DEBUG] Status de manutenção:', isMaintenanceActive);
        
        const sectionHtml = `
            <div class="content-section">
                <div class="section-header">
                    <h2><i class="fas fa-tools"></i> Ferramentas de Manutenção</h2>
                    <p>Configure o modo de manutenção do sistema da sala virtual</p>
                </div>
                
                <div class="section-content">
                    <div class="maintenance-status-card" style="background: ${isMaintenanceActive ? '#ffe6e6' : '#e6f7ff'}; border: 1px solid ${isMaintenanceActive ? '#ffb3b3' : '#b3e0ff'}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="font-size: 32px; color: ${isMaintenanceActive ? '#ff4757' : '#2ecc71'};">
                                <i class="fas ${isMaintenanceActive ? 'fa-exclamation-triangle' : 'fa-shield-alt'}"></i>
                            </div>
                            <div>
                                <h3 style="margin: 0; color: ${isMaintenanceActive ? '#c0392b' : '#27ae60'};">
                                    Status: ${isMaintenanceActive ? 'MANUTENÇÃO ATIVA' : 'SISTEMA NORMAL'}
                                </h3>
                                <p style="margin: 5px 0 0 0; color: #666;">
                                    ${isMaintenanceActive ? 
                                        'Os usuários públicos estão vendo a página de countdown. Acesso via Railway permanece liberado.' : 
                                        'O sistema está funcionando normalmente e os usuários têm acesso completo.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="maintenance-controls" style="background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
                        <h4><i class="fas fa-cog"></i> Controles de Manutenção</h4>
                        
                        <div style="margin: 20px 0;">
                            <label style="display: flex; align-items: center; cursor: pointer; font-size: 16px;">
                                <input type="checkbox" id="maintenance-toggle" ${isMaintenanceActive ? 'checked' : ''} style="margin-right: 10px; transform: scale(1.2);">
                                <span style="font-weight: bold;">Ativar Modo de Manutenção</span>
                            </label>
                            <p style="color: #666; margin: 8px 0 0 32px; font-size: 14px;">
                                Quando ativado, usuários que acessam via domínio público serão redirecionados para a página de countdown. Acesso via Railway (.railway.app) permanece liberado.
                            </p>
                        </div>

                        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                            <button id="apply-maintenance" class="btn btn-primary" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">
                                <i class="fas fa-save"></i> Aplicar Alterações
                            </button>
                            <button id="refresh-status" class="btn btn-secondary" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; margin-left: 10px;">
                                <i class="fas fa-sync-alt"></i> Atualizar Status
                            </button>
                        </div>
                    </div>

                    <div class="maintenance-info" style="margin-top: 20px; padding: 15px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
                        <h5><i class="fas fa-info-circle"></i> Informações Importantes:</h5>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>O modo de manutenção não afeta administradores logados no Tim</li>
                            <li><strong>NOVO:</strong> Acesso via Railway (.railway.app) sempre permitido para desenvolvimento</li>
                            <li>A página de countdown será exibida apenas para usuários via domínio público</li>
                            <li>Você pode monitorar e alterar o status a qualquer momento</li>
                            <li>As alterações são aplicadas imediatamente em todo o sistema</li>
                        </ul>
                        <div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 4px; font-size: 14px;">
                            <strong>🚀 Desenvolvimento Contínuo:</strong> Com a manutenção ativa, você pode continuar trabalhando via Railway enquanto os usuários públicos veem a página de countdown.
                        </div>
                    </div>
                </div>
            </div>
        `;

        mainContent.innerHTML = sectionHtml;
        
        // Vincular eventos dos controles
        this.bindMaintenanceControls();
    }

    /**
     * Vincula eventos dos controles na seção de manutenção
     */
    bindMaintenanceControls() {
        const applyButton = document.getElementById('apply-maintenance');
        const refreshButton = document.getElementById('refresh-status');
        const toggleCheckbox = document.getElementById('maintenance-toggle');

        if (applyButton) {
            applyButton.addEventListener('click', async () => {
                const newStatus = toggleCheckbox.checked;
                await this.applyMaintenanceStatus(newStatus);
            });
        }

        if (refreshButton) {
            refreshButton.addEventListener('click', async () => {
                await this.refreshMaintenanceStatus();
            });
        }
    }

    /**
     * Aplica o novo status de manutenção
     */
    async applyMaintenanceStatus(status) {
        const action = status ? 'ativar' : 'desativar';
        const message = `Tem certeza que deseja ${action} o modo de manutenção?\n\n${status ? 'Os usuários verão apenas a página de countdown.' : 'Os usuários terão acesso normal ao sistema.'}`;
        
        if (confirm(message)) {
            const applyButton = document.getElementById('apply-maintenance');
            if (applyButton) {
                applyButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Aplicando...';
                applyButton.disabled = true;
            }

            await this.setMaintenanceStatus(status);
            this.updateSidebarButton(status);
            this.showNotification(status);
            
            // Redireciona usuários conectados se ativado
            if (status) {
                this.redirectUsersToMaintenance();
            }

            // Recarrega a seção com o novo status
            setTimeout(() => {
                this.showMaintenanceSection();
            }, 1000);
        }
    }

    /**
     * Atualiza o status de manutenção do servidor
     */
    async refreshMaintenanceStatus() {
        const refreshButton = document.getElementById('refresh-status');
        if (refreshButton) {
            refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
            refreshButton.disabled = true;
        }

        try {
            const serverStatus = await this.loadMaintenanceFromServer();
            const toggleCheckbox = document.getElementById('maintenance-toggle');
            if (toggleCheckbox) {
                toggleCheckbox.checked = serverStatus;
            }
            this.updateSidebarButton(serverStatus);
            this.showMaintenanceSection(); // Recarrega a seção
        } catch (error) {
            alert('Erro ao atualizar status do servidor: ' + error.message);
        }
    }

    /**
     * Atualiza o botão na sidebar
     */
    updateSidebarButton(isActive) {
        const button = document.getElementById('action_maintenance');
        const icon = button?.querySelector('i');
        
        if (icon) {
            icon.style.color = isActive ? '#ff4757' : 'inherit';
        }
        
        // Atualiza o tooltip para refletir o status
        if (button) {
            const currentTitle = isActive 
                ? 'Ferramentas de manutenção do banco (MODO ATIVO)'
                : 'Ferramentas de manutenção do banco';
            button.setAttribute('data-pt-title', currentTitle);
        }
    }

    /**
     * Mostra notificação do status
     */
    showNotification(isActive) {
        const message = isActive 
            ? '🔧 Modo de manutenção ATIVADO! Usuários públicos verão a página de countdown. Acesso via Railway continua liberado.'
            : '✅ Modo de manutenção DESATIVADO! Acesso normal restaurado para todos os domínios.';
        
        // Se existir sistema de alertas do Tim, usa ele
        if (window.TimAlerts && typeof window.TimAlerts.show === 'function') {
            window.TimAlerts.show(message, isActive ? 'warning' : 'success');
        } else {
            // Fallback para alert simples
            alert(message);
        }
    }

    /**
     * Obtém o status atual da manutenção
     */
    getMaintenanceStatus() {
        return localStorage.getItem(this.maintenanceKey) === 'true';
    }

    /**
     * Define o status da manutenção
     */
    async setMaintenanceStatus(status) {
        localStorage.setItem(this.maintenanceKey, status.toString());
        
        // Tenta salvar no servidor
        const success = await this.saveMaintenanceToServer(status);
        
        if (!success) {
            // Se falhou, mostra aviso mas mantém a funcionalidade local
            console.warn('⚠️ Status salvo localmente, mas não foi possível sincronizar com servidor');
        }
    }

    /**
     * Salva o status de manutenção no servidor
     */
    async saveMaintenanceToServer(status) {
        try {
            const response = await fetch('/api/maintenance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    maintenance: status,
                    admin: this.getCurrentAdmin()
                })
            });

            const result = await response.json();
            
            if (!result.success) {
                console.warn('Erro ao salvar status de manutenção no servidor:', result.message);
                return false;
            }
            
            console.log('✅ Status de manutenção salvo no servidor:', result.message);
            return true;
        } catch (error) {
            console.warn('Erro de conexão ao salvar manutenção:', error);
            return false;
        }
    }

    /**
     * Carrega o status de manutenção do servidor
     */
    async loadMaintenanceFromServer() {
        try {
            const response = await fetch('/api/maintenance');
            const result = await response.json();
            
            if (result.success) {
                // Sincroniza com localStorage
                localStorage.setItem(this.maintenanceKey, result.maintenance.toString());
                return result.maintenance;
            }
        } catch (error) {
            console.warn('Erro ao carregar status do servidor:', error);
        }
        
        // Fallback para localStorage
        return this.getMaintenanceStatus();
    }

    /**
     * Obtém o admin atual
     */
    getCurrentAdmin() {
        // Pode ser implementado para pegar dados do admin logado
        return 'Admin Timotin';
    }

    /**
     * Redireciona usuários conectados para manutenção
     */
    redirectUsersToMaintenance() {
        // Emite evento via Socket.IO se disponível
        if (window.socket && typeof window.socket.emit === 'function') {
            window.socket.emit('maintenance_activated', {
                message: 'Sistema em manutenção. Redirecionando...',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Verifica se deve entrar em modo de manutenção na inicialização
     */
    checkMaintenanceMode() {
        // Só aplica manutenção se não estiver na página do admin ou do TIM
        const isAdminPage = document.body.id === 'virtual-admin-pub';
        const isTimPage = window.location.pathname.includes('/tim') || 
                         window.location.pathname.includes('/admin/tim') ||
                         document.title.includes('TIM') ||
                         document.querySelector('title')?.textContent?.includes('TIM');
        
        console.log('🔧 [TIM-MANU] Verificação de modo de manutenção:', {
            isAdminPage,
            isTimPage,
            pathname: window.location.pathname,
            bodyId: document.body.id,
            title: document.title
        });
        
        // Pular redirecionamento se for página admin ou TIM
        if (isAdminPage || isTimPage) {
            console.log('🔧 [TIM-MANU] Pulando redirecionamento - página admin/TIM detectada');
            return;
        }
        
        if (this.getMaintenanceStatus()) {
            console.log('🔧 [TIM-MANU] Modo de manutenção ativo - redirecionando para countdown');
            this.redirectToCountdown();
        }
    }

    /**
     * Redireciona para a página de countdown
     */
    redirectToCountdown() {
        // Previne loops infinitos
        if (window.location.pathname.includes('countdown.html')) {
            return;
        }
        
        setTimeout(() => {
            window.location.href = '/countdown.html';
        }, 1000);
    }

    /**
     * Método público para verificar status (para outras partes do sistema)
     */
    static isMaintenanceActive() {
        return localStorage.getItem('tim_maintenance_mode') === 'true';
    }

    /**
     * Método público para ativar manutenção programaticamente
     */
    static activateMaintenance() {
        const instance = new TimMaintenance();
        instance.setMaintenanceStatus(true);
        return true;
    }

    /**
     * Método público para desativar manutenção programaticamente
     */
    static deactivateMaintenance() {
        const instance = new TimMaintenance();
        instance.setMaintenanceStatus(false);
        return true;
    }
}

// Inicializa automaticamente quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    // Só inicializa na página do admin
    if (document.body.id === 'virtual-admin-pub') {
        window.timMaintenance = new TimMaintenance();
        await window.timMaintenance.init();
    } else {
        // Em outras páginas, apenas verifica se deve redirecionar
        const maintenance = new TimMaintenance();
        // O checkMaintenanceMode já é chamado no constructor
    }
});

// Exporta para uso global
window.TimMaintenance = TimMaintenance;
