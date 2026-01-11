// tim-helpers.js

/**
 * Limpa o conteúdo da área principal.
 * @param {HTMLElement} mainContent - O elemento principal a ser limpo.
 */
function clearMainContent(mainContent) {
    if (mainContent) {
        mainContent.innerHTML = '';
    }
}

/**
 * Cria um contêiner padrão com título para uma nova seção.
 * @param {string} titleHTML - O HTML para o título da seção (ex: '<h2><i class="fas fa-users"></i> Título</h2>').
 * @returns {object} - Um objeto contendo o contêiner principal e o grid para adicionar conteúdo.
 */
function createContentContainer(titleHTML) {
    const container = document.createElement('div');
    container.className = 'container_12';

    const grid = document.createElement('div');
    grid.className = 'grid_12';

    const title = document.createElement('h2');
    title.innerHTML = titleHTML;
    grid.appendChild(title);
    
    container.appendChild(grid);

    return { container, grid };
}
