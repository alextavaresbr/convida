// Estado global
let currentYear = new Date().getFullYear();
const availableBoletins = new Set(); // Será populado com boletins disponíveis

// Meses do ano
const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initHome();
    loadAvailableBoletins();
});

function initHome() {
    // Botões de ano
    document.getElementById('prev-year').addEventListener('click', () => {
        currentYear--;
        updateYear();
    });
    
    document.getElementById('next-year').addEventListener('click', () => {
        currentYear++;
        updateYear();
    });
    
    updateYear();
}

function updateYear() {
    document.getElementById('current-year').textContent = currentYear;
    renderMonths();
}

function renderMonths() {
    const grid = document.getElementById('months-grid');
    const noBoletins = document.getElementById('no-boletins');
    grid.innerHTML = '';
    
    let hasAnyBoletim = false;
    
    meses.forEach((mes, index) => {
        const monthNumber = index + 1;
        const boletimKey = `${currentYear}-${String(monthNumber).padStart(2, '0')}`;
        const isAvailable = availableBoletins.has(boletimKey);
        
        if (isAvailable) hasAnyBoletim = true;
        
        const card = document.createElement('div');
        card.className = `month-card ${isAvailable ? 'available' : 'unavailable'}`;
        card.innerHTML = `
            <div class="month-name">${mes}</div>
            <div class="month-status">${isAvailable ? 'Disponível' : 'Indisponível'}</div>
        `;
        
        if (isAvailable) {
            card.addEventListener('click', () => {
                openBoletim(currentYear, monthNumber);
            });
        }
        
        grid.appendChild(card);
    });
    
    // Mostrar mensagem se não houver boletins
    if (!hasAnyBoletim) {
        grid.style.display = 'none';
        noBoletins.style.display = 'block';
    } else {
        grid.style.display = 'grid';
        noBoletins.style.display = 'none';
    }
}

async function loadAvailableBoletins() {
    // Em produção, isso buscaria do servidor
    // Por enquanto, vamos carregar do localStorage ou simular
    
    try {
        // Tentar buscar lista de boletins disponíveis
        const response = await fetch('data/boletins.json').catch(() => null);
        
        if (response && response.ok) {
            const data = await response.json();
            data.forEach(boletim => {
                availableBoletins.add(boletim.key);
            });
        } else {
            // Simular alguns boletins disponíveis para teste
            // Adicionar janeiro de 2026 como exemplo
            availableBoletins.add('2026-01');
        }
    } catch (error) {
        console.error('Erro ao carregar boletins:', error);
        // Adicionar boletim de exemplo
        availableBoletins.add('2026-01');
    }
    
    renderMonths();
}

function openBoletim(year, month) {
    const monthStr = String(month).padStart(2, '0');
    window.location.href = `viewer.html?year=${year}&month=${monthStr}`;
}

// Função para registrar novo boletim (chamada quando um boletim é salvo)
function registerBoletim(year, month) {
    const monthStr = String(month).padStart(2, '0');
    const key = `${year}-${monthStr}`;
    availableBoletins.add(key);
    
    // Salvar no localStorage como backup
    const boletinsList = Array.from(availableBoletins);
    localStorage.setItem('available-boletins', JSON.stringify(boletinsList));
    
    renderMonths();
}

// Carregar lista do localStorage se disponível
function loadFromLocalStorage() {
    const stored = localStorage.getItem('available-boletins');
    if (stored) {
        const list = JSON.parse(stored);
        list.forEach(key => availableBoletins.add(key));
    }
}

// Carregar do localStorage ao iniciar
loadFromLocalStorage();
