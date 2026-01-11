// tim-dashboard.js

document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('virtual-main');
    const dashboardButton = document.getElementById('action_dashboard');

    function renderDashboard() {
        clearMainContent(mainContent);
        const { container, grid } = createContentContainer('<i class="fas fa-tachometer-alt"></i> Dashboard');
        
        const dashboardContent = document.createElement('p');
        dashboardContent.textContent = 'O conteúdo do dashboard, com gráficos e estatísticas, será exibido aqui.';
        grid.appendChild(dashboardContent);

        // Futuramente, aqui será adicionada a lógica para renderizar gráficos interativos.
        // Ex: const chartContainer = document.createElement('div');
        // grid.appendChild(chartContainer);
        // new Chart(chartContainer, {...});

        mainContent.appendChild(container);
    }

    if (dashboardButton) {
        dashboardButton.addEventListener('click', function(e) {
            e.preventDefault();
            renderDashboard();
        });
    }

    // Renderiza o dashboard como tela inicial
    renderDashboard();
});
