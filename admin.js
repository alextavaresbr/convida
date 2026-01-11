// Senha de acesso (em produção, usar autenticação mais segura)
const ADMIN_PASSWORD = 'metodista2026';
console.log('[INIT] admin.js carregado, senha configurada');

// Configuração da API
const API_URL = 'http://localhost:3000/api';
const USE_SERVER = true; // Mudar para false se não tiver servidor rodando

// Estado global
let currentData = {};
let editors = {};
let isInitialized = false;
let currentMonth = null;
let currentYear = null;
let completedTabs = new Set();

// Ordem das abas
const tabOrder = ['capa', 'pastoral', 'escalas', 'aniversariantes', 'agenda', 'avisos', 'endereco', 'equipe', 'programacao', 'dizimos', 'anuncios'];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initTheme(); // Inicializa tema antes do login
    initLogin();
    initAdmin();
});

// ===== TEMA ESCURO / CLARO =====
function initTheme() {
    // Carregar preferência salva
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        lucide.createIcons();
    }
}

// ===== LOGIN =====
function initLogin() {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('password').value;
        
        if (password === ADMIN_PASSWORD) {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('admin-panel').style.display = 'block';
            sessionStorage.setItem('authenticated', 'true');
        } else {
            document.getElementById('login-error').textContent = 'Senha incorreta!';
        }
    });

    // Verificar se já está autenticado
    if (sessionStorage.getItem('authenticated') === 'true') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
    }
}

function initAdmin() {
    // Botão de tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        // Atualizar ícone inicial após o DOM carregar
        const isDark = document.body.classList.contains('dark-mode');
        updateThemeIcon(isDark);
    }
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', function() {
        sessionStorage.removeItem('authenticated');
        location.reload();
    });

    // Tabs
    initTabs();
    
    // Botão de Tema
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
        updateThemeIcon(document.body.classList.contains('dark-mode'));
    }
    
    // Botão de Auto-preenchimento
    const autoFillBtn = document.getElementById('auto-fill-btn');
    if (autoFillBtn) {
        autoFillBtn.addEventListener('click', autoFillForm);
    }
    
    // Botão de Gerenciar Boletins
    const manageBtn = document.getElementById('manage-boletins-btn');
    if (manageBtn) {
        manageBtn.addEventListener('click', openManageModal);
    }
    
    // Editors
    initEditors();
    
    // Image Uploads
    initImageUploads();
    
    // Sincronizar color picker customizado
    const customColorPicker = document.getElementById('custom-logo-color');
    const customColorHex = document.getElementById('custom-logo-color-hex');
    
    if (customColorPicker && customColorHex) {
        customColorPicker.addEventListener('input', (e) => {
            customColorHex.value = e.target.value.toUpperCase();
            // Desmarcar radio buttons
            document.querySelectorAll('input[name="logo-color"]').forEach(r => r.checked = false);
        });
        
        customColorHex.addEventListener('input', (e) => {
            let value = e.target.value.trim();
            if (!value.startsWith('#')) value = '#' + value;
            if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
                customColorPicker.value = value;
                // Desmarcar radio buttons
                document.querySelectorAll('input[name="logo-color"]').forEach(r => r.checked = false);
            }
        });
    }
    
    // Botões de ação
    document.getElementById('save-btn').addEventListener('click', saveBoletim);
    document.getElementById('preview-btn').addEventListener('click', previewBoletim);
    
    // Monitorar mudança de mês
    document.getElementById('capa-mes').addEventListener('change', updateMonthDisplay);
    document.getElementById('capa-ano').addEventListener('change', updateMonthDisplay);
    
    // Inicializar linhas dinâmicas
    addMatutinoRow();
    addDiaconiaRow();
    addEbdAdultosRow();
    addKidsRow();
    addEbdQuartasRow();
    addEstudoRow();
    addAniversarianteRow();
    addAgendaRow();
    addEquipeRow();
    addProgramacaoRow();
    
    // Carregar rascunho se existir
    loadDraft();
}

// ===== CARREGAR RASCUNHO =====
function loadDraft() {
    const draft = localStorage.getItem('boletim-draft');
    const savedCompletedTabs = localStorage.getItem('boletim-completed-tabs');
    
    if (draft) {
        const shouldLoad = confirm('Foi encontrado um rascunho salvo. Deseja continuar de onde parou?');
        if (shouldLoad) {
            // Carregar dados
            const data = JSON.parse(draft);
            populateFormWithData(data);
            
            // Restaurar abas concluídas
            if (savedCompletedTabs) {
                const tabs = JSON.parse(savedCompletedTabs);
                tabs.forEach(tab => markTabCompleted(tab));
            }
            
            showNotification('Rascunho carregado com sucesso!');
        }
    }
}

// ===== TABS =====
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Remover active de todos
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    // Adicionar active no selecionado
    const selectedBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (selectedBtn) selectedBtn.classList.add('active');
    
    const selectedContent = document.getElementById('tab-' + tabId);
    if (selectedContent) selectedContent.classList.add('active');
    
    // Scroll para o topo
    document.querySelector('.tab-content-wrapper').scrollTop = 0;
}

function markTabCompleted(tabId) {
    completedTabs.add(tabId);
    const tabBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (tabBtn) {
        tabBtn.classList.add('completed');
    }
    updateProgress();
}

function updateProgress() {
    // Atualizar indicador de progresso no header se desejar
    const total = tabOrder.length;
    const completed = completedTabs.size;
    console.log(`Progresso: ${completed}/${total} abas concluídas`);
}

// ===== NAVEGAÇÃO ENTRE ABAS =====
function saveAndNext(currentTab) {
    // Salvar dados da aba atual
    saveTabData(currentTab);
    
    // Marcar como concluída
    markTabCompleted(currentTab);
    
    // Ir para próxima aba
    const currentIndex = tabOrder.indexOf(currentTab);
    if (currentIndex < tabOrder.length - 1) {
        const nextTab = tabOrder[currentIndex + 1];
        switchTab(nextTab);
        
        // Mostrar mensagem de sucesso
        showNotification('✓ Seção salva com sucesso!');
    } else {
        // Última aba - salvar tudo
        showNotification('✓ Todas as seções concluídas!');
        setTimeout(() => {
            if (confirm('Deseja salvar o boletim completo agora?')) {
                saveBoletim();
            }
        }, 500);
    }
}

function goToPrevTab() {
    const currentTab = document.querySelector('.tab-btn.active').dataset.tab;
    const currentIndex = tabOrder.indexOf(currentTab);
    
    if (currentIndex > 0) {
        const prevTab = tabOrder[currentIndex - 1];
        switchTab(prevTab);
    }
}

function saveTabData(tabId) {
    // Salvar no localStorage como backup
    const data = collectFormData();
    localStorage.setItem('boletim-draft', JSON.stringify(data));
    localStorage.setItem('boletim-completed-tabs', JSON.stringify([...completedTabs]));
}

function showNotification(message) {
    // Remover notificações existentes
    const existingNotifications = document.querySelectorAll('.notification-toast');
    existingNotifications.forEach(n => n.remove());
    
    // Criar notificação temporária
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 24px;
        background: #16a34a;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Adicionar animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== EDITORS DE TEXTO RICO =====
function initEditors() {
    // Verificar se editores já foram inicializados
    if (editors.pastoral) {
        console.log('Editores já inicializados, pulando...');
        return;
    }
    
    // Paleta de cores expandida + opção customizada
    const colors = [
        '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', 
        '#ffff00', '#ff00ff', '#00ffff', '#888888', '#666666',
        '#88b04b', '#6169ab', '#ffbd53', '#ba244a', '#ff6b6b',
        '#4ecdc4', '#45b7d1', '#96ceb4', '#dfe6e9', '#ffeaa7'
    ];
    
    const toolbarOptions = [
        [{ 'header': [1, 2, 3, false] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        [{ 'color': colors }, { 'background': colors }],
        ['clean']
    ];

    editors.pastoral = new Quill('#pastoral-editor', {
        theme: 'snow',
        modules: { toolbar: toolbarOptions },
        placeholder: 'Digite o texto da pastoral...'
    });

    editors.avisos = new Quill('#avisos-editor', {
        theme: 'snow',
        modules: { toolbar: toolbarOptions },
        placeholder: 'Digite os avisos...'
    });

    editors.endereco = new Quill('#endereco-editor', {
        theme: 'snow',
        modules: { toolbar: toolbarOptions },
        placeholder: 'Digite o endereço e informações de contato...'
    });

    editors.anuncios = new Quill('#anuncios-editor', {
        theme: 'snow',
        modules: { toolbar: toolbarOptions },
        placeholder: 'Digite o expediente...'
    });
    
    // Adicionar inputs customizados de cor após inicializar
    addCustomColorPickers();
}

// Adicionar color pickers customizados aos toolbars do Quill
function addCustomColorPickers() {
    const editorNames = ['pastoral', 'avisos', 'endereco', 'anuncios'];
    
    editorNames.forEach(name => {
        const editor = editors[name];
        if (!editor) return;
        
        const toolbar = editor.getModule('toolbar');
        const container = toolbar.container;
        
        // Encontrar os botões de cor e background
        const colorPicker = container.querySelector('.ql-color');
        const bgPicker = container.querySelector('.ql-background');
        
        if (colorPicker) {
            addColorInput(colorPicker, editor, 'color');
        }
        if (bgPicker) {
            addColorInput(bgPicker, editor, 'background');
        }
    });
}

function addColorInput(pickerButton, editor, type) {
    const container = pickerButton.closest('.ql-formats') || pickerButton.parentElement;
    
    // Criar input de cor customizado
    const inputWrapper = document.createElement('span');
    inputWrapper.style.cssText = 'display: inline-block; margin-left: 4px; vertical-align: middle;';
    
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = `custom-${type}-picker`;
    colorInput.title = `Cor customizada (${type === 'color' ? 'texto' : 'fundo'})`;
    colorInput.style.cssText = 'width: 24px; height: 24px; border: 1px solid #ccc; border-radius: 3px; cursor: pointer; vertical-align: middle;';
    
    colorInput.addEventListener('change', (e) => {
        const range = editor.getSelection();
        if (range) {
            editor.format(type, e.target.value);
        }
    });
    
    inputWrapper.appendChild(colorInput);
    container.appendChild(inputWrapper);
}

// ===== UPLOAD DE IMAGENS =====
function initImageUploads() {
    const uploadAreas = document.querySelectorAll('.image-upload-area');
    
    uploadAreas.forEach(area => {
        const input = area.querySelector('.file-input');
        const preview = area.querySelector('.image-preview');
        const removeBtn = area.querySelector('.btn-remove-image');
        const placeholder = area.querySelector('.upload-placeholder');
        
        // Click to upload
        input.addEventListener('change', function(e) {
            handleImageUpload(e.target.files[0], area, preview, removeBtn, placeholder);
        });
        
        // Drag and drop
        area.addEventListener('dragover', function(e) {
            e.preventDefault();
            area.style.borderColor = 'var(--primary-color)';
        });
        
        area.addEventListener('dragleave', function(e) {
            e.preventDefault();
            area.style.borderColor = 'var(--border-color)';
        });
        
        area.addEventListener('drop', function(e) {
            e.preventDefault();
            area.style.borderColor = 'var(--border-color)';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleImageUpload(file, area, preview, removeBtn, placeholder);
            }
        });
        
        // Remove image
        if (removeBtn) {
            removeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                input.value = '';
                preview.style.display = 'none';
                removeBtn.style.display = 'none';
                placeholder.style.display = 'block';
                area.classList.remove('has-image');
            });
        }
    });
}

function handleImageUpload(file, area, preview, removeBtn, placeholder) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
        if (removeBtn) removeBtn.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
        area.classList.add('has-image');
    };
    reader.readAsDataURL(file);
}

// ===== LINHAS DINÂMICAS - ESCALAS =====
function addMatutinoRow() {
    const list = document.getElementById('escalas-matutino-list');
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.style.gridTemplateColumns = '80px 1fr 1fr';
    row.innerHTML = `
        <input type="text" placeholder="Dia" class="matutino-dia">
        <input type="text" placeholder="P/L (ex: Pr. Alexandre)" class="matutino-pl">
        <input type="text" placeholder="Descrição (opcional)" class="matutino-desc">
        <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">✕</button>
    `;
    list.appendChild(row);
}

function addDiaconiaRow() {
    const list = document.getElementById('escalas-diaconia-list');
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.style.gridTemplateColumns = '80px 1fr 1fr';
    row.innerHTML = `
        <input type="text" placeholder="Data" class="diaconia-data">
        <input type="text" placeholder="Responsável" class="diaconia-resp">
        <input type="text" placeholder="Descrição" class="diaconia-desc">
        <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">✕</button>
    `;
    list.appendChild(row);
}

function addEbdAdultosRow() {
    const list = document.getElementById('escalas-ebd-adultos-list');
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.style.gridTemplateColumns = '80px 1fr 1fr';
    row.innerHTML = `
        <input type="text" placeholder="Data" class="ebd-adultos-data">
        <input type="text" placeholder="Responsável" class="ebd-adultos-resp">
        <input type="text" placeholder="Descrição" class="ebd-adultos-desc">
        <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">✕</button>
    `;
    list.appendChild(row);
}

function addKidsRow() {
    const list = document.getElementById('escalas-kids-list');
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.style.gridTemplateColumns = '80px 1fr 1fr 1fr';
    row.innerHTML = `
        <input type="text" placeholder="Data" class="kids-data">
        <input type="text" placeholder="EBD" class="kids-ebd">
        <input type="text" placeholder="Culto" class="kids-culto">
        <input type="text" placeholder="Apoio" class="kids-apoio">
        <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">✕</button>
    `;
    list.appendChild(row);
}

function addEbdQuartasRow() {
    const list = document.getElementById('escalas-ebd-quartas-list');
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.style.gridTemplateColumns = '80px 1fr';
    row.innerHTML = `
        <input type="text" placeholder="Data" class="ebd-quartas-data">
        <input type="text" placeholder="Responsável" class="ebd-quartas-resp">
        <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">✕</button>
    `;
    list.appendChild(row);
}

function addEstudoRow() {
    const list = document.getElementById('escalas-estudo-list');
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.style.gridTemplateColumns = '80px 1fr';
    row.innerHTML = `
        <input type="text" placeholder="Data" class="estudo-data">
        <input type="text" placeholder="Responsável" class="estudo-resp">
        <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">✕</button>
    `;
    list.appendChild(row);
}

// ===== LINHAS DINÂMICAS - ANIVERSARIANTES =====
function addAniversarianteRow() {
    const list = document.getElementById('aniv-list');
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.style.gridTemplateColumns = '100px 1fr';
    row.innerHTML = `
        <input type="text" placeholder="DD/MM" class="aniv-data">
        <input type="text" placeholder="Nome" class="aniv-nome">
        <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">✕</button>
    `;
    list.appendChild(row);
}

// ===== LINHAS DINÂMICAS - AGENDA =====
function addAgendaRow() {
    const list = document.getElementById('agenda-list');
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.style.gridTemplateColumns = '80px 1fr 100px 1fr 40px';
    row.innerHTML = `
        <input type="text" placeholder="DD/MM" class="agenda-data">
        <input type="text" placeholder="Título do Evento" class="agenda-titulo">
        <input type="text" placeholder="Hora" class="agenda-hora">
        <input type="text" placeholder="Descrição" class="agenda-desc">
        <label style="display: flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer;" title="Marcar como destaque (alerta vermelho)">
            <input type="checkbox" class="agenda-destaque" style="cursor: pointer;">
            <i data-lucide="alert-triangle" style="width: 16px; height: 16px; color: #fbbf24;"></i>
        </label>
        <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">✕</button>
    `;
    list.appendChild(row);
    lucide.createIcons();
}

// ===== LINHAS DINÂMICAS - EQUIPE PASTORAL =====
function addEquipeRow() {
    const list = document.getElementById('equipe-list');
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.style.gridTemplateColumns = '150px 1fr 150px';
    row.innerHTML = `
        <input type="text" placeholder="Cargo" class="equipe-cargo">
        <input type="text" placeholder="Nome" class="equipe-nome">
        <input type="text" placeholder="Telefone" class="equipe-telefone">
        <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">✕</button>
    `;
    list.appendChild(row);
}

// ===== LINHAS DINÂMICAS - PROGRAMAÇÃO SEMANAL =====
function addProgramacaoRow() {
    const list = document.getElementById('programacao-list');
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.style.gridTemplateColumns = '1fr 200px 40px';
    row.innerHTML = `
        <input type="text" placeholder="Atividade" class="prog-atividade">
        <input type="text" placeholder="Dia e Horário" class="prog-horario">
        <label style="display: flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer;" title="Marcar como destaque (alerta vermelho)">
            <input type="checkbox" class="prog-destaque" style="cursor: pointer;">
            <i data-lucide="alert-triangle" style="width: 16px; height: 16px; color: #fbbf24;"></i>
        </label>
        <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">✕</button>
    `;
    list.appendChild(row);
    lucide.createIcons();
}

// ===== ATUALIZAR DISPLAY DO MÊS =====
function updateMonthDisplay() {
    const mes = document.getElementById('capa-mes').value;
    const ano = document.getElementById('capa-ano').value;
    
    if (mes && ano) {
        const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        document.getElementById('current-month-display').textContent = 
            `${meses[parseInt(mes)]} de ${ano}`;
        currentMonth = parseInt(mes);
        currentYear = parseInt(ano);
        
        // Carregar dados existentes se houver (mas não durante auto-fill ou populate)
        if (!isLoadingBoletim) {
            loadBoletimData(currentMonth, currentYear);
        }
    }
}

// ===== COLETAR DADOS DO FORMULÁRIO =====
function collectFormData() {
    const pastoralImg = document.querySelector('#capa-pastoral-img-area .image-preview')?.src || '';
    const logo1 = document.querySelector('#capa-logo1-area .image-preview')?.src || '';
    const logo2 = document.querySelector('#capa-logo2-area .image-preview')?.src || '';
    
    console.log('Coletando imagens:', {
        pastoralImg: pastoralImg.substring(0, 50),
        logo1: logo1.substring(0, 50),
        logo2: logo2.substring(0, 50)
    });
    
    // Pegar cor do logo (radio button ou customizada)
    let logoColor = document.querySelector('input[name="logo-color"]:checked')?.value;
    const customColorHex = document.getElementById('custom-logo-color-hex').value.trim();
    if (customColorHex && customColorHex.match(/^#[0-9A-Fa-f]{6}$/)) {
        logoColor = customColorHex;
    }
    
    const data = {
        capa: {
            mes: document.getElementById('capa-mes').value,
            ano: document.getElementById('capa-ano').value,
            igreja: document.getElementById('capa-igreja').value,
            numero: document.getElementById('capa-numero').value,
            logoColor: logoColor || '#88b04b',
            pastoralTitulo: document.getElementById('capa-pastoral-titulo').value,
            pastoralImg: pastoralImg,
            logo1: logo1,
            logo2: logo2,
            social: {
                youtube: document.getElementById('capa-youtube').value,
                facebook: document.getElementById('capa-facebook').value,
                instagram: document.getElementById('capa-instagram').value,
                whatsapp: document.getElementById('capa-whatsapp').value
            }
        },
        pastoral: {
            versiculo: document.getElementById('pastoral-versiculo').value,
            referencia: document.getElementById('pastoral-referencia').value,
            texto: editors.pastoral.root.innerHTML
        },
        escalas: {
            matutino: {
                horario: document.getElementById('escalas-matutino-horario').value,
                linhas: collectDynamicRows('escalas-matutino-list', ['matutino-dia', 'matutino-pl', 'matutino-desc'])
            },
            diaconia: collectDynamicRows('escalas-diaconia-list', ['diaconia-data', 'diaconia-resp', 'diaconia-desc']),
            ebdAdultos: collectDynamicRows('escalas-ebd-adultos-list', ['ebd-adultos-data', 'ebd-adultos-resp', 'ebd-adultos-desc']),
            kids: collectDynamicRows('escalas-kids-list', ['kids-data', 'kids-ebd', 'kids-culto', 'kids-apoio']),
            ebdQuartas: {
                horario: document.getElementById('escalas-ebd-quartas-horario').value,
                linhas: collectDynamicRows('escalas-ebd-quartas-list', ['ebd-quartas-data', 'ebd-quartas-resp'])
            },
            estudo: collectDynamicRows('escalas-estudo-list', ['estudo-data', 'estudo-resp'])
        },
        aniversariantes: {
            versiculo: document.getElementById('aniv-versiculo').value,
            imagem: document.querySelector('#aniv-img-area .image-preview')?.src || '',
            lista: collectDynamicRows('aniv-list', ['aniv-data', 'aniv-nome'])
        },
        agenda: {
            imagem: document.querySelector('#agenda-img-area .image-preview')?.src || '',
            eventos: collectDynamicRows('agenda-list', ['agenda-data', 'agenda-titulo', 'agenda-hora', 'agenda-desc', 'agenda-destaque'])
        },
        avisos: editors.avisos.root.innerHTML,
        endereco: editors.endereco.root.innerHTML,
        equipe: collectDynamicRows('equipe-list', ['equipe-cargo', 'equipe-nome', 'equipe-telefone']),
        programacao: collectDynamicRows('programacao-list', ['prog-atividade', 'prog-horario', 'prog-destaque']),
        dizimos: {
            banco: document.getElementById('dizimos-banco').value,
            agencia: document.getElementById('dizimos-agencia').value,
            conta: document.getElementById('dizimos-conta').value,
            pix: document.getElementById('dizimos-pix').value,
            logo: document.querySelector('#dizimos-logo-area .image-preview')?.src || ''
        },
        anuncios: editors.anuncios.root.innerHTML
    };
    
    return data;
}

function collectDynamicRows(listId, classNames) {
    const list = document.getElementById(listId);
    const rows = list.querySelectorAll('.dynamic-row');
    const data = [];
    
    rows.forEach(row => {
        const rowData = {};
        classNames.forEach((className, index) => {
            const input = row.querySelector('.' + className);
            if (input) {
                if (input.type === 'checkbox') {
                    rowData[className.split('-').pop()] = input.checked;
                } else {
                    rowData[className.split('-').pop()] = input.value;
                }
            }
        });
        data.push(rowData);
    });
    
    return data;
}

// ===== SALVAR BOLETIM =====
async function saveBoletim() {
    if (!currentMonth || !currentYear) {
        alert('Selecione o mês e ano antes de salvar!');
        switchTab('capa');
        return;
    }
    
    const data = collectFormData();
    const filename = `boletim-${currentYear}-${String(currentMonth).padStart(2, '0')}.json`;
    
    // LOG: Verificar dados completos
    console.log('[DEBUG] Dados completos sendo salvos:', JSON.stringify(data, null, 2));
    console.log('[DEBUG] Escalas:', data.escalas);
    console.log('[DEBUG] Agenda:', data.agenda);
    console.log('[DEBUG] Equipe:', data.equipe);
    console.log('[DEBUG] Programação:', data.programacao);
    
    // Verificar se já existe
    const exists = await checkBoletimExists(filename);
    if (exists) {
        if (!confirm('Já existe um boletim para este mês. Deseja sobrescrever?')) {
            return;
        }
    }
    
    // Salvar JSON
    const success = await saveToServer(filename, data);
    
    if (success) {
        // Limpar rascunho
        localStorage.removeItem('boletim-draft');
        localStorage.removeItem('boletim-completed-tabs');
        completedTabs.clear();
        
        // Remover checkboxes
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('completed');
        });
        
        showNotification('Boletim salvo com sucesso na pasta data/');
        alert('✓ Boletim salvo com sucesso!');
    } else {
        showNotification('Erro ao salvar boletim');
        alert('✗ Erro ao salvar boletim. Verifique o console.');
    }
}

async function checkBoletimExists(filename) {
    if (!USE_SERVER) {
        return false;
    }
    
    try {
        const response = await fetch(`${API_URL}/check-boletim/${filename}`);
        const result = await response.json();
        return result.exists;
    } catch (error) {
        console.error('Erro ao verificar boletim:', error);
        return false;
    }
}

async function saveToServer(filename, data) {
    if (!USE_SERVER) {
        // Fallback: fazer download
        const jsonString = JSON.stringify(data, null, 2);
        downloadJSON(jsonString, filename);
        alert('Boletim baixado! (Servidor não está rodando - faça upload manual para a pasta data/)');
        return true;
    }
    
    try {
        const response = await fetch(`${API_URL}/save-boletim`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: filename,
                content: data
            })
        });
        
        if (!response.ok) {
            throw new Error('Erro ao salvar no servidor');
        }
        
        const result = await response.json();
        console.log('Boletim salvo:', result);
        return true;
    } catch (error) {
        console.error('Erro ao salvar:', error);
        
        // Fallback: fazer download
        const fallback = confirm('Não foi possível salvar no servidor. Deseja fazer download do JSON?');
        if (fallback) {
            const jsonString = JSON.stringify(data, null, 2);
            downloadJSON(jsonString, filename);
            return true;
        }
        return false;
    }
}

function downloadJSON(jsonString, filename) {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ===== CARREGAR DADOS DO BOLETIM =====
let isLoadingBoletim = false;

async function loadBoletimData(month, year) {
    if (!USE_SERVER) {
        console.log(`Não é possível carregar boletim (servidor desativado)`);
        return;
    }
    
    if (isLoadingBoletim) {
        console.log('Já está carregando um boletim...');
        return;
    }
    
    const filename = `boletim-${year}-${String(month).padStart(2, '0')}.json`;
    
    try {
        isLoadingBoletim = true;
        const response = await fetch(`${API_URL}/load-boletim/${filename}`);
        
        if (response.ok) {
            const data = await response.json();
            populateFormWithData(data);
            showNotification('Boletim carregado com sucesso!');
        } else {
            console.log(`Nenhum boletim encontrado para ${month}/${year}`);
        }
    } catch (error) {
        console.error('Erro ao carregar boletim:', error);
    } finally {
        isLoadingBoletim = false;
    }
}

function populateFormWithData(data) {
    console.log('[POPULATE] ==== INÍCIO DO PREENCHIMENTO ====');
    console.log('[POPULATE] Dados recebidos:', data);
    console.log('[POPULATE] Tem escalas?', data.escalas);
    
    // CAPA
    if (data.capa) {
        document.getElementById('capa-mes').value = data.capa.mes || '';
        document.getElementById('capa-ano').value = data.capa.ano || '';
        document.getElementById('capa-igreja').value = data.capa.igreja || '';
        document.getElementById('capa-numero').value = data.capa.numero || '';
        
        // Cor do logo
        if (data.capa.logoColor) {
            const colorRadio = document.querySelector(`input[name="logo-color"][value="${data.capa.logoColor}"]`);
            if (colorRadio) {
                colorRadio.checked = true;
            } else {
                // Cor customizada
                document.getElementById('custom-logo-color').value = data.capa.logoColor;
                document.getElementById('custom-logo-color-hex').value = data.capa.logoColor;
            }
        }
        
        document.getElementById('capa-pastoral-titulo').value = data.capa.pastoralTitulo || '';
        
        // Imagens
        if (data.capa.pastoralImg) setImagePreview('capa-pastoral-img-area', data.capa.pastoralImg);
        if (data.capa.logo1) setImagePreview('capa-logo1-area', data.capa.logo1);
        if (data.capa.logo2) setImagePreview('capa-logo2-area', data.capa.logo2);
        
        // Redes sociais
        if (data.capa.social) {
            document.getElementById('capa-youtube').value = data.capa.social.youtube || '';
            document.getElementById('capa-facebook').value = data.capa.social.facebook || '';
            document.getElementById('capa-instagram').value = data.capa.social.instagram || '';
            document.getElementById('capa-whatsapp').value = data.capa.social.whatsapp || '';
        }
    }
    
    // PASTORAL
    if (data.pastoral) {
        document.getElementById('pastoral-versiculo').value = data.pastoral.versiculo || '';
        document.getElementById('pastoral-referencia').value = data.pastoral.referencia || '';
        if (editors.pastoral && data.pastoral.texto) {
            editors.pastoral.root.innerHTML = data.pastoral.texto;
        }
    }
    
    // AVISOS
    if (data.avisos && editors.avisos) {
        editors.avisos.root.innerHTML = data.avisos || '';
    }
    
    // ENDEREÇO
    if (data.endereco && editors.endereco) {
        editors.endereco.root.innerHTML = data.endereco || '';
    }
    
    // ANÚNCIOS
    if (data.anuncios && editors.anuncios) {
        editors.anuncios.root.innerHTML = data.anuncios || '';
    }
    
    // DÍZIMOS
    if (data.dizimos) {
        document.getElementById('dizimos-banco').value = data.dizimos.banco || '';
        document.getElementById('dizimos-agencia').value = data.dizimos.agencia || '';
        document.getElementById('dizimos-conta').value = data.dizimos.conta || '';
        document.getElementById('dizimos-pix').value = data.dizimos.pix || '';
        if (data.dizimos.logo) setImagePreview('dizimos-logo-area', data.dizimos.logo);
    }
    
    // ESCALAS
    if (data.escalas) {
        console.log('[POPULATE] Carregando escalas...');
        // Matutino
        if (data.escalas.matutino) {
            console.log('[POPULATE] Matutino:', data.escalas.matutino);
            document.getElementById('escalas-matutino-horario').value = data.escalas.matutino.horario || '';
            const matutinoList = document.getElementById('escalas-matutino-list');
            matutinoList.innerHTML = '';
            if (data.escalas.matutino.linhas) {
                data.escalas.matutino.linhas.forEach((item, index) => {
                    console.log('[POPULATE] Adicionando linha matutino', index, item);
                    addMatutinoRow();
                    const rows = matutinoList.querySelectorAll('.dynamic-row');
                    const lastRow = rows[rows.length - 1];
                    lastRow.querySelector('.matutino-dia').value = item.dia || '';
                    lastRow.querySelector('.matutino-pl').value = item.pl || '';
                    lastRow.querySelector('.matutino-desc').value = item.desc || '';
                });
            }
        }
        
        // Diaconia
        if (data.escalas.diaconia) {
            const diaconiaList = document.getElementById('escalas-diaconia-list');
            diaconiaList.innerHTML = '';
            data.escalas.diaconia.forEach(item => {
                addDiaconiaRow();
                const rows = diaconiaList.querySelectorAll('.dynamic-row');
                const lastRow = rows[rows.length - 1];
                lastRow.querySelector('.diaconia-data').value = item.data || '';
                lastRow.querySelector('.diaconia-resp').value = item.resp || '';
                lastRow.querySelector('.diaconia-desc').value = item.desc || '';
            });
        }
        
        // EBD Adultos
        if (data.escalas.ebdAdultos) {
            const ebdList = document.getElementById('escalas-ebd-adultos-list');
            ebdList.innerHTML = '';
            data.escalas.ebdAdultos.forEach(item => {
                addEbdAdultosRow();
                const rows = ebdList.querySelectorAll('.dynamic-row');
                const lastRow = rows[rows.length - 1];
                lastRow.querySelector('.ebd-adultos-data').value = item.data || '';
                lastRow.querySelector('.ebd-adultos-resp').value = item.resp || '';
                lastRow.querySelector('.ebd-adultos-desc').value = item.desc || '';
            });
        }
        
        // Kids
        if (data.escalas.kids) {
            const kidsList = document.getElementById('escalas-kids-list');
            kidsList.innerHTML = '';
            data.escalas.kids.forEach(item => {
                addKidsRow();
                const rows = kidsList.querySelectorAll('.dynamic-row');
                const lastRow = rows[rows.length - 1];
                lastRow.querySelector('.kids-data').value = item.data || '';
                lastRow.querySelector('.kids-ebd').value = item.ebd || '';
                lastRow.querySelector('.kids-culto').value = item.culto || '';
                lastRow.querySelector('.kids-apoio').value = item.apoio || '';
            });
        }
        
        // EBD Quartas
        if (data.escalas.ebdQuartas) {
            document.getElementById('escalas-ebd-quartas-horario').value = data.escalas.ebdQuartas.horario || '';
            const quartasList = document.getElementById('escalas-ebd-quartas-list');
            quartasList.innerHTML = '';
            if (data.escalas.ebdQuartas.linhas) {
                data.escalas.ebdQuartas.linhas.forEach(item => {
                    addEbdQuartasRow();
                    const rows = quartasList.querySelectorAll('.dynamic-row');
                    const lastRow = rows[rows.length - 1];
                    lastRow.querySelector('.ebd-quartas-data').value = item.data || '';
                    lastRow.querySelector('.ebd-quartas-resp').value = item.resp || '';
                });
            }
        }
        
        // Estudo
        if (data.escalas.estudo) {
            const estudoList = document.getElementById('escalas-estudo-list');
            estudoList.innerHTML = '';
            data.escalas.estudo.forEach(item => {
                addEstudoRow();
                const rows = estudoList.querySelectorAll('.dynamic-row');
                const lastRow = rows[rows.length - 1];
                lastRow.querySelector('.estudo-data').value = item.data || '';
                lastRow.querySelector('.estudo-resp').value = item.resp || '';
            });
        }
    }
    
    // ANIVERSARIANTES
    if (data.aniversariantes) {
        document.getElementById('aniv-versiculo').value = data.aniversariantes.versiculo || '';
        if (data.aniversariantes.imagem) setImagePreview('aniv-img-area', data.aniversariantes.imagem);
        
        const anivList = document.getElementById('aniv-list');
        anivList.innerHTML = '';
        if (data.aniversariantes.lista) {
            data.aniversariantes.lista.forEach(item => {
                addAniversarianteRow();
                const rows = anivList.querySelectorAll('.dynamic-row');
                const lastRow = rows[rows.length - 1];
                lastRow.querySelector('.aniv-data').value = item.data || '';
                lastRow.querySelector('.aniv-nome').value = item.nome || '';
            });
        }
    }
    
    // AGENDA
    if (data.agenda) {
        if (data.agenda.imagem) setImagePreview('agenda-img-area', data.agenda.imagem);
        
        const agendaList = document.getElementById('agenda-list');
        agendaList.innerHTML = '';
        if (data.agenda.eventos) {
            data.agenda.eventos.forEach(item => {
                addAgendaRow();
                const rows = agendaList.querySelectorAll('.dynamic-row');
                const lastRow = rows[rows.length - 1];
                lastRow.querySelector('.agenda-data').value = item.data || '';
                lastRow.querySelector('.agenda-titulo').value = item.titulo || '';
                lastRow.querySelector('.agenda-hora').value = item.hora || '';
                lastRow.querySelector('.agenda-desc').value = item.desc || '';
                if (item.destaque) {
                    lastRow.querySelector('.agenda-destaque').checked = true;
                }
            });
        }
    }
    
    // EQUIPE PASTORAL
    if (data.equipe) {
        const equipeList = document.getElementById('equipe-list');
        equipeList.innerHTML = '';
        data.equipe.forEach(item => {
            addEquipeRow();
            const rows = equipeList.querySelectorAll('.dynamic-row');
            const lastRow = rows[rows.length - 1];
            lastRow.querySelector('.equipe-cargo').value = item.cargo || '';
            lastRow.querySelector('.equipe-nome').value = item.nome || '';
            lastRow.querySelector('.equipe-telefone').value = item.telefone || '';
        });
    }
    
    // PROGRAMAÇÃO SEMANAL
    if (data.programacao) {
        const progList = document.getElementById('programacao-list');
        progList.innerHTML = '';
        data.programacao.forEach(item => {
            addProgramacaoRow();
            const rows = progList.querySelectorAll('.dynamic-row');
            const lastRow = rows[rows.length - 1];
            lastRow.querySelector('.prog-atividade').value = item.atividade || '';
            lastRow.querySelector('.prog-horario').value = item.horario || '';
            if (item.destaque) {
                lastRow.querySelector('.prog-destaque').checked = true;
            }
        });
    }
    
    // Atualizar display do mês
    updateMonthDisplay();
    
    console.log('Formulário preenchido com sucesso');
}

// ===== PREVIEW =====
function previewBoletim() {
    // Se já tem mês/ano selecionado e o boletim foi salvo, abrir com parâmetros
    if (currentMonth && currentYear) {
        const filename = `boletim-${currentYear}-${String(currentMonth).padStart(2, '0')}.json`;
        checkBoletimExists(filename).then(exists => {
            if (exists) {
                // Boletim salvo existe, abrir com parâmetros da URL
                window.open(`viewer.html?year=${currentYear}&month=${String(currentMonth).padStart(2, '0')}`, '_blank');
            } else {
                // Boletim ainda não foi salvo, usar preview temporário
                const data = collectFormData();
                localStorage.setItem('preview-data', JSON.stringify(data));
                window.open('viewer.html', '_blank');
            }
        });
    } else {
        // Sem mês/ano, usar preview temporário
        const data = collectFormData();
        localStorage.setItem('preview-data', JSON.stringify(data));
        window.open('viewer.html', '_blank');
    }
}

// ===== AUTO PREENCHER (TESTE) =====
function autoFillForm() {
    // IMAGENS PLACEHOLDER (Base64 1x1 pixel colorido para cada tipo)
    const placeholderPastoral = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%234F46E5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="white"%3EImagem Pastoral%3C/text%3E%3C/svg%3E';
    const placeholderDizimos = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%238B5CF6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="white"%3EQR Code%3C/text%3E%3C/svg%3E';

    // CAPA
    document.getElementById('capa-mes').value = '1';
    document.getElementById('capa-ano').value = '2026';
    document.getElementById('capa-igreja').value = 'Igreja Metodista em Vila Conde do Pinhal';
    document.getElementById('capa-numero').value = '38';
    // Selecionar cor verde como padrão
    document.querySelector('input[name="logo-color"][value="#88b04b"]').checked = true;
    document.getElementById('capa-pastoral-titulo').value = 'O Verbo se fez carne e habitou entre nós';
    document.getElementById('capa-youtube').value = 'https://www.youtube.com/@igrejametodistaemvilaconde8050';
    document.getElementById('capa-facebook').value = 'https://ms-my.facebook.com/metodistavilaconde/';
    document.getElementById('capa-instagram').value = 'https://www.instagram.com/metodistavilaconde/';
    document.getElementById('capa-whatsapp').value = 'https://api.whatsapp.com/send?phone=5511947462848&lang=pt_br&text=Igreja%20Metodista%20em%20Vila%20Conde';
    
    // Adicionar imagens da capa
    setImagePreview('capa-pastoral-img-area', placeholderPastoral);
    
    // Placeholders inline para logos (caso não consiga carregar via fetch)
    const placeholderLogo1 = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="120"%3E%3Crect width="200" height="120" fill="%236169ab"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="white"%3ELogo 1%3C/text%3E%3C/svg%3E';
    const placeholderLogo2 = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="120"%3E%3Crect width="200" height="120" fill="%238B5CF6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="white"%3ELogo 2%3C/text%3E%3C/svg%3E';
    
    // Tentar carregar logos SVG reais (funciona apenas via servidor http)
    Promise.all([
        loadImageAsDataURL('img/logo1.svg'),
        loadImageAsDataURL('img/logo2.svg')
    ]).then(([logo1Data, logo2Data]) => {
        console.log('Logos carregados:', { logo1Data: !!logo1Data, logo2Data: !!logo2Data });
        // Usar logo real se carregou, senão usar placeholder
        setImagePreview('capa-logo1-area', logo1Data || placeholderLogo1);
        setImagePreview('capa-logo2-area', logo2Data || placeholderLogo2);
    }).catch(error => {
        console.error('Erro ao carregar logos, usando placeholders:', error);
        setImagePreview('capa-logo1-area', placeholderLogo1);
        setImagePreview('capa-logo2-area', placeholderLogo2);
    });
    
    // PASTORAL
    document.getElementById('pastoral-versiculo').value = 'O Verbo se fez carne e habitou entre nós';
    document.getElementById('pastoral-referencia').value = 'João 1.18';
    editors.pastoral.root.innerHTML = `<p><strong>Natal, tempo de renovação e de esperança.</strong> Estamos em tempo de Advento. Em latim "Adventus", que significa "vinda".</p>
    <p>Caminhar em Tempo de Advento é olhar para o nascimento de Cristo, há mais de dois mil anos; é apontar para a Sua última vinda gloriosa; mas é também estarmos vigilantes e atentos às Suas vindas, no hoje das nossas vidas.</p>
    <p>Preparar o Natal é olhar para a vinda de Cristo. Ele já veio. Nasceu num lugar concreto, num país concreto e transformou a nossa história e a nossa vida. Naquela pequena povoação da Judeia, em Belém, nasceu Jesus, filho de Maria, e esse Menino iniciou um caminho do qual todos nós somos herdeiros.</p>
    <p>Olhar para esse acontecimento que marca a história é sermos introduzidos na história da Salvação, no projeto de Deus que vem até nós, de uma forma muito especial, em Seu Filho Jesus.</p>
    <p>Natal é um tempo favorável para a redescoberta de uma esperança não vaga nem ilusória, mas certa e confiável, porque está "ancorada" em Cristo, Deus feito homem, rochedo da nossa salvação.</p>`;
    
    // ESCALAS - Preencher TODAS as seções
    const escalasMatutinoList = document.getElementById('escalas-matutino-list');
    escalasMatutinoList.innerHTML = '';
    ['05/01', '12/01', '19/01', '26/01'].forEach((dia, i) => {
        addMatutinoRow();
        const rows = escalasMatutinoList.querySelectorAll('.dynamic-row');
        const lastRow = rows[rows.length - 1];
        lastRow.querySelector('.matutino-dia').value = dia;
        lastRow.querySelector('.matutino-pl').value = `Pr. ${['Alexandre', 'Carlos', 'João', 'Pedro'][i]}`;
        lastRow.querySelector('.matutino-desc').value = `${i + 1}º Domingo do mês`;
    });
    document.getElementById('escalas-matutino-horario').value = '10h30';
    
    // Diaconia
    const diaconiaList = document.getElementById('escalas-diaconia-list');
    diaconiaList.innerHTML = '';
    ['05/01', '12/01', '19/01', '26/01'].forEach(dia => {
        addDiaconiaRow();
        const rows = diaconiaList.querySelectorAll('.dynamic-row');
        const lastRow = rows[rows.length - 1];
        lastRow.querySelector('.diaconia-data').value = dia;
        lastRow.querySelector('.diaconia-resp').value = 'Equipe Diaconia';
        lastRow.querySelector('.diaconia-desc').value = 'Culto matutino';
    });
    
    // EBD Adultos
    const ebdAdultosList = document.getElementById('escalas-ebd-adultos-list');
    ebdAdultosList.innerHTML = '';
    ['05/01', '12/01', '19/01', '26/01'].forEach(dia => {
        addEbdAdultosRow();
        const rows = ebdAdultosList.querySelectorAll('.dynamic-row');
        const lastRow = rows[rows.length - 1];
        lastRow.querySelector('.ebd-adultos-data').value = dia;
        lastRow.querySelector('.ebd-adultos-resp').value = 'Prof. Maria';
        lastRow.querySelector('.ebd-adultos-desc').value = 'Lição bíblica';
    });
    
    // Kids
    const kidsList = document.getElementById('escalas-kids-list');
    kidsList.innerHTML = '';
    ['05/01', '12/01', '19/01', '26/01'].forEach(dia => {
        addKidsRow();
        const rows = kidsList.querySelectorAll('.dynamic-row');
        const lastRow = rows[rows.length - 1];
        lastRow.querySelector('.kids-data').value = dia;
        lastRow.querySelector('.kids-ebd').value = 'Ana Paula';
        lastRow.querySelector('.kids-culto').value = 'Carlos';
        lastRow.querySelector('.kids-apoio').value = 'Joana';
    });
    
    // EBD Quartas
    const ebdQuartasList = document.getElementById('escalas-ebd-quartas-list');
    ebdQuartasList.innerHTML = '';
    ['08/01', '15/01', '22/01', '29/01'].forEach(dia => {
        addEbdQuartasRow();
        const rows = ebdQuartasList.querySelectorAll('.dynamic-row');
        const lastRow = rows[rows.length - 1];
        lastRow.querySelector('.ebd-quartas-data').value = dia;
        lastRow.querySelector('.ebd-quartas-resp').value = 'Pastor Alexandre';
    });
    
    // Estudo Bíblico
    const estudoList = document.getElementById('escalas-estudo-list');
    estudoList.innerHTML = '';
    ['10/01', '17/01', '24/01', '31/01'].forEach(dia => {
        addEstudoRow();
        const rows = estudoList.querySelectorAll('.dynamic-row');
        const lastRow = rows[rows.length - 1];
        lastRow.querySelector('.estudo-data').value = dia;
        lastRow.querySelector('.estudo-resp').value = 'Pr. Alexandre';
    });
    
    // ANIVERSARIANTES
    document.getElementById('aniv-versiculo').value = 'Ensina-nos a contar os nossos dias, para que alcancemos coração sábio. Salmo 90.12';
    const anivList = document.getElementById('aniv-list');
    anivList.innerHTML = '';
    const anivDatas = [
        {data: '03/01', nome: 'Maria Silva'},
        {data: '08/01', nome: 'João Santos'},
        {data: '12/01', nome: 'Ana Paula Costa'},
        {data: '15/01', nome: 'Pedro Almeida'},
        {data: '18/01', nome: 'Carlos Eduardo'},
        {data: '22/01', nome: 'Mariana Oliveira'},
        {data: '25/01', nome: 'José Roberto'},
        {data: '30/01', nome: 'Fernanda Lima'}
    ];
    anivDatas.forEach(aniv => {
        addAniversarianteRow();
        const rows = anivList.querySelectorAll('.dynamic-row');
        const lastRow = rows[rows.length - 1];
        lastRow.querySelector('.aniv-data').value = aniv.data;
        lastRow.querySelector('.aniv-nome').value = aniv.nome;
    });
    
    // AGENDA
    const agendaList = document.getElementById('agenda-list');
    agendaList.innerHTML = '';
    const agendaItems = [
        {data: '05/01', titulo: 'Culto de Ano Novo', hora: '19h00', desc: 'Celebração especial de início de ano'},
        {data: '12/01', titulo: 'Reunião de Oração', hora: '19h30', desc: 'Encontro de oração intercessória'},
        {data: '15/01', titulo: 'Ensaio do Coral', hora: '20h00', desc: 'Ministério de música'},
        {data: '19/01', titulo: 'Escola Bíblica', hora: '09h00', desc: 'EBD para todas as idades'},
        {data: '22/01', titulo: 'Grupo de Jovens', hora: '18h00', desc: 'Encontro de jovens'},
        {data: '26/01', titulo: 'Visita aos Enfermos', hora: '14h00', desc: 'Ministério de visitação'}
    ];
    agendaItems.forEach(item => {
        addAgendaRow();
        const rows = agendaList.querySelectorAll('.dynamic-row');
        const lastRow = rows[rows.length - 1];
        lastRow.querySelector('.agenda-data').value = item.data;
        lastRow.querySelector('.agenda-titulo').value = item.titulo;
        lastRow.querySelector('.agenda-hora').value = item.hora;
        lastRow.querySelector('.agenda-desc').value = item.desc;
    });
    
    // AVISOS
    editors.avisos.root.innerHTML = ``;
    
    // ENDEREÇO
    editors.endereco.root.innerHTML = `<h3>IGREJA METODISTA EM VILA CONDE DO PINHAL</h3>
    <p><strong>Endereço:</strong> Rua Japaratuba, 588, São João Clímaco. São Paulo - SP. CEP: 04254-000</p>
    
    <p><a href="https://api.whatsapp.com/send?phone=5511947462848&lang=pt_br&text=Igreja%20Metodista%20em%20Vila%20Conde" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; color: #25d366; text-decoration: none; font-weight: 600;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>+55 (11) 94746-2848</a></p>
    
    <p><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.5675288480797!2d-46.59674228739853!3d-23.619838178671095!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5b7d4cf3fd79%3A0x3b98591aa21a3d20!2sR.%20Japaratuba%2C%20588%20-%20Vila%20Conde%20do%20Pinhal%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2004254-000!5e0!3m2!1spt-BR!2sbr!4v1768099713681!5m2!1spt-BR!2sbr" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></p>`;
    
    // EQUIPE PASTORAL
    const equipeList = document.getElementById('equipe-list');
    equipeList.innerHTML = '';
    const equipeItems = [
        {cargo: 'Pastor Titular', nome: 'Rev. Alexandre Ruffa', telefone: ''},
        {cargo: 'Pastor Coadjutor', nome: 'Rev. Alexandre Tavares', telefone: ''}
    ];
    equipeItems.forEach(item => {
        addEquipeRow();
        const rows = equipeList.querySelectorAll('.dynamic-row');
        const lastRow = rows[rows.length - 1];
        lastRow.querySelector('.equipe-cargo').value = item.cargo;
        lastRow.querySelector('.equipe-nome').value = item.nome;
        lastRow.querySelector('.equipe-telefone').value = item.telefone;
    });
    
    // PROGRAMAÇÃO SEMANAL
    const progList = document.getElementById('programacao-list');
    progList.innerHTML = '';
    const progItems = [
        {atividade: 'Escola Dominical', horario: 'domingos, 9h'},
        {atividade: 'Culto de Louvor e Adoração', horario: 'domingos, 10h'},
        {atividade: 'Estudo Bíblico', horario: 'quartas, 20h'},
        {atividade: 'GPS Homens', horario: 'terças, 20h'},
        {atividade: 'Judô / Defesa Pessoal', horario: 'terças, 19h / 20h'},
        {atividade: 'Bazar Beneficente', horario: 'quartas, 9h às 14h'},
        {atividade: 'Reunião de Oração', horario: 'quintas, 20h'},
        {atividade: 'Escoteiros', horario: 'sábados, 14h'}
    ];
    progItems.forEach(item => {
        addProgramacaoRow();
        const rows = progList.querySelectorAll('.dynamic-row');
        const lastRow = rows[rows.length - 1];
        lastRow.querySelector('.prog-atividade').value = item.atividade;
        lastRow.querySelector('.prog-horario').value = item.horario;
    });
    
    // DÍZIMOS E OFERTAS
    document.getElementById('dizimos-banco').value = 'Bradesco';
    document.getElementById('dizimos-agencia').value = '2720';
    document.getElementById('dizimos-conta').value = 'C/C 13.959-9';
    document.getElementById('dizimos-pix').value = '04.083.369/0042-34';
    
    // Adicionar imagem de QR Code
    setImagePreview('dizimos-logo-area', placeholderDizimos);
    
    // EXPEDIENTE
    editors.anuncios.root.innerHTML = `<p><strong>Convida:</strong> Boletim da Igreja Metodista em Vila Conde</p>
    <p><strong>Periodicidade:</strong> mensal</p>
    <p><strong>Edição/design:</strong> Pr. Alexandre Tavares</p>
    
    <p>Para inserir anúncios no Boletim, enviar ao pastor Alexandre Ruffa até quinta-feira às 18h, através do e-mail: <a href="mailto:alexandre_floripa@hotmail.com">alexandre_floripa@hotmail.com</a></p>`;
    
    // Atualizar display do mês
    updateMonthDisplay();
    
    // Mostrar notificação
    showNotification('Formulário preenchido completamente com imagens e textos de exemplo!');
    
    // Ir para primeira aba
    switchTab('capa');
}

// Função auxiliar para adicionar imagem placeholder
function setImagePreview(areaId, imageDataUrl) {
    const area = document.getElementById(areaId);
    if (!area) {
        console.warn(`Área não encontrada: ${areaId}`);
        return;
    }
    
    const preview = area.querySelector('.image-preview');
    const removeBtn = area.querySelector('.btn-remove-image');
    const placeholder = area.querySelector('.upload-placeholder');
    
    if (preview) {
        preview.src = imageDataUrl;
        preview.style.display = 'block';
        console.log(`Imagem definida para ${areaId}:`, imageDataUrl.substring(0, 50) + '...');
    }
    if (removeBtn) removeBtn.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
    area.classList.add('has-image');
}

// ===== CARREGAR IMAGEM COMO DATA URL =====
async function loadImageAsDataURL(url) {
    try {
        console.log(`Tentando carregar: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Erro ao buscar ${url}: ${response.status}`);
            return null;
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log(`Imagem carregada com sucesso: ${url}`);
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error(`Erro ao carregar imagem ${url}:`, error);
        return null;
    }
}

// ===== GERENCIAR BOLETINS =====
async function openManageModal() {
    const modal = document.getElementById('manage-modal');
    modal.style.display = 'flex';
    await loadBoletinsList();
}

function closeManageModal() {
    const modal = document.getElementById('manage-modal');
    modal.style.display = 'none';
}

async function loadBoletinsList() {
    const listContainer = document.getElementById('boletins-list');
    listContainer.innerHTML = '<p class="loading">Carregando boletins...</p>';
    
    if (!USE_SERVER) {
        listContainer.innerHTML = '<div class="empty-state"><p>Servidor não está rodando.<br>Inicie o servidor para gerenciar boletins.</p></div>';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/list-boletins`);
        if (!response.ok) throw new Error('Erro ao carregar lista');
        
        const boletins = await response.json();
        
        if (boletins.length === 0) {
            listContainer.innerHTML = '<div class="empty-state"><p>Nenhum boletim salvo ainda.</p></div>';
            return;
        }
        
        listContainer.innerHTML = '';
        boletins.forEach(boletim => {
            const item = createBoletimItem(boletim);
            listContainer.appendChild(item);
        });
        
        // Reinicializar ícones Lucide após adicionar elementos
        lucide.createIcons();
    } catch (error) {
        console.error('Erro ao carregar boletins:', error);
        listContainer.innerHTML = '<div class="empty-state"><p>Erro ao carregar boletins.</p></div>';
    }
}

function createBoletimItem(boletim) {
    const div = document.createElement('div');
    div.className = 'boletim-item';
    
    // Extrair informações do filename (ex: boletim-2026-01.json)
    const match = boletim.filename.match(/boletim-(\d{4})-(\d{2})\.json/);
    const year = match ? match[1] : '?';
    const month = match ? parseInt(match[2]) : '?';
    const monthName = month !== '?' ? mesesPT[month] : 'Mês desconhecido';
    
    const date = new Date(boletim.modified);
    const dateStr = date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    div.innerHTML = `
        <div class="boletim-info">
            <h3>${monthName} ${year}</h3>
            <p>Última modificação: ${dateStr}</p>
        </div>
        <div class="boletim-actions">
            <button class="btn-edit" onclick="editBoletim('${boletim.filename}')">
                <i data-lucide="edit" style="width: 14px; height: 14px;"></i> Editar
            </button>
            <button class="btn-delete" onclick="deleteBoletim('${boletim.filename}')">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Excluir
            </button>
        </div>
    `;
    
    return div;
}

const mesesPT = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

async function editBoletim(filename) {
    if (!USE_SERVER) {
        alert('Servidor não está rodando. Inicie o servidor para editar boletins.');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/load-boletim/${filename}`);
        if (!response.ok) throw new Error('Erro ao carregar boletim');
        
        const data = await response.json();
        console.log('[EDIT] Dados recebidos do servidor:', data);
        console.log('[EDIT] Tem escalas?', data.escalas);
        console.log('[EDIT] Escalas matutino:', data.escalas?.matutino);
        populateFormWithData(data);
        closeManageModal();
        showNotification('Boletim carregado para edição!');
    } catch (error) {
        console.error('Erro ao carregar boletim:', error);
        alert('Erro ao carregar boletim para edição.');
    }
}

async function deleteBoletim(filename) {
    const match = filename.match(/boletim-(\d{4})-(\d{2})\.json/);
    const year = match ? match[1] : '?';
    const month = match ? parseInt(match[2]) : '?';
    const monthName = month !== '?' ? mesesPT[month] : 'este boletim';
    
    if (!confirm(`Tem certeza que deseja excluir o boletim de ${monthName} ${year}?`)) {
        return;
    }
    
    if (!USE_SERVER) {
        alert('Servidor não está rodando. Inicie o servidor para excluir boletins.');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/delete-boletim/${filename}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erro ao excluir');
        
        showNotification('Boletim excluído com sucesso!');
        await loadBoletinsList(); // Recarregar lista
    } catch (error) {
        console.error('Erro ao excluir boletim:', error);
        alert('Erro ao excluir boletim.');
    }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    if (isInitialized) {
        console.log('Admin já inicializado, ignorando...');
        return;
    }
    
    console.log('Admin.js carregado e inicializando...');
    isInitialized = true;
    initLogin();
    initAdmin();
});

// Updated: 2026-01-10 - Dados bancários Bradesco corretos
