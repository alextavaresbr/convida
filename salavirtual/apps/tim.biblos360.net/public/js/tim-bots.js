// tim-bots.js - Gerenciamento de Robôs/Usuários Fantasmas

document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('virtual-main');
    const insertBotsButton = document.getElementById('action_insert_bots');
    const removeBotsButton = document.getElementById('action_remove_bots');

    // Nomes organizados por gênero
    const nomesMasculinos = [
        // Primeira lista (45 nomes originais)
        'João', 'Pedro', 'Lucas', 'Rafael', 'Bruno',
        'Diego', 'Thiago', 'Gabriel', 'Mateus', 'André',
        'Henrique', 'Vinícius', 'Leonardo', 'Arthur', 'Nicolas',
        'Felipe', 'Rodrigo', 'Gustavo', 'Daniel', 'Ricardo',
        'Marcelo', 'Eduardo', 'Fernando', 'Carlos', 'Roberto',
        'Fábio', 'Paulo', 'Alexandre', 'Marcos', 'Sérgio',
        'Leandro', 'Augusto', 'William', 'Vítor', 'Márcio',
        'Jefferson', 'Edson', 'Antônio', 'José', 'Renan',
        'Igor', 'César', 'Guilherme', 'Flávio', 'Murilo',
        
        // Segunda lista (45 nomes adicionais únicos)
        'Caio', 'Davi', 'Enzo', 'Miguel', 'Lorenzo',
        'Samuel', 'Benício', 'Benjamin', 'Bernardo', 'Caleb',
        'Emanuel', 'Heitor', 'Theo', 'Vicente', 'Ian',
        'Joaquim', 'Otávio', 'Nathan', 'Gael', 'Ryan',
        'Noah', 'Pietro', 'Anthony', 'Isaac', 'Bento',
        'Ravi', 'Cauã', 'Levi', 'Erick', 'Kevin',
        'Oliver', 'Derick', 'Luan', 'Bryan', 'Yuri',
        'Cauê', 'Raul', 'Leon', 'Matias', 'Henry',
        'Luigi', 'Tomás', 'Lucca', 'Artur', 'Juan'
    ];
    
    const nomesFemininos = [
        // Primeira lista (45 nomes originais)
        'Ana', 'Maria', 'Carla', 'Fernanda', 'Juliana',
        'Camila', 'Larissa', 'Patrícia', 'Beatriz', 'Lívia',
        'Sophia', 'Isabela', 'Giovanna', 'Mariana', 'Valentina',
        'Amanda', 'Letícia', 'Bianca', 'Priscila', 'Vanessa',
        'Tatiana', 'Renata', 'Simone', 'Cristina', 'Adriana',
        'Mônica', 'Silvia', 'Roberta', 'Luana', 'Natália',
        'Débora', 'Michele', 'Luciana', 'Danielle', 'Elizabete',
        'Andréa', 'Cláudia', 'Viviane', 'Fabiana', 'Eliane',
        'Aline', 'Denise', 'Sandra', 'Karina', 'Talita',
        
        // Segunda lista (45 nomes adicionais únicos)
        'Alice', 'Helena', 'Laura', 'Heloísa', 'Luna',
        'Manuela', 'Júlia', 'Cecília', 'Eloá', 'Liz',
        'Giovana', 'Antonella', 'Yasmin', 'Gabriela', 'Sarah',
        'Luiza', 'Agatha', 'Rafaela', 'Melinda', 'Catarina',
        'Clarice', 'Lavínia', 'Vitória', 'Lorena', 'Emanuelly',
        'Esther', 'Melissa', 'Nicole', 'Pietra', 'Stella',
        'Maya', 'Laís', 'Rebeca', 'Mirella', 'Bárbara',
        'Isadora', 'Maitê', 'Milena', 'Joana', 'Bruna',
        'Raquel', 'Eduarda', 'Lorraine', 'Clarice', 'Lara'
    ];

    /**
     * Gerar nome e sexo aleatórios para robô
     * @returns {Object} - { nome: string, sexo: number }
     */
    function getRandomNameAndGender() {
        const useFemaleName = Math.random() > 0.5;
        
        if (useFemaleName) {
            const nome = nomesFemininos[Math.floor(Math.random() * nomesFemininos.length)];
            return { nome, sexo: 2 }; // Feminino = 2
        } else {
            const nome = nomesMasculinos[Math.floor(Math.random() * nomesMasculinos.length)];
            return { nome, sexo: 1 }; // Masculino = 1
        }
    }

    /**
     * Gerar ID único para robô (prefixo '99' + timestamp + random)
     */
    function generateBotId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        // Usar apenas os últimos 6 dígitos do timestamp + 3 dígitos do random
        const shortTimestamp = timestamp.toString().slice(-6);
        const shortRandom = random.toString().padStart(3, '0');
        return parseInt(`99${shortTimestamp}${shortRandom}`);
    }

    /**
     * Renderizar tela de inserção de robôs
     */
    function renderInsertBotsScreen() {
        if (!mainContent) return;

        const html = `
            <div class="admin-content">
                <div class="admin-header">
                    <h2><i class="fas fa-robot"></i> Inserir Robôs</h2>
                    <p class="admin-subtitle">Adicione usuários fantasmas à sala virtual</p>
                </div>
                
                <div class="admin-section">
                    <div class="form-group">
                        <label for="bots-quantity">Quantidade de Robôs:</label>
                        <input type="number" 
                               id="bots-quantity" 
                               class="form-control" 
                               min="1" 
                               max="50" 
                               value="5" 
                               placeholder="Digite a quantidade">
                        <small class="form-text">Máximo: 50 robôs por vez</small>
                    </div>
                    
                    <div class="admin-actions">
                        <button id="execute-insert-bots" class="btn btn-primary">
                            <i class="fas fa-plus-circle"></i> Inserir Robôs
                        </button>
                        <button id="cancel-insert-bots" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </div>
                
                <div id="bots-result" class="admin-result" style="display: none;"></div>
            </div>
        `;

        mainContent.innerHTML = html;

        // Event listeners
        document.getElementById('execute-insert-bots').addEventListener('click', executeInsertBots);
        document.getElementById('cancel-insert-bots').addEventListener('click', () => {
            mainContent.innerHTML = '<div class="admin-welcome">Selecione uma opção no menu lateral</div>';
        });
    }

    /**
     * Executar inserção de robôs
     */
    async function executeInsertBots() {
        const quantityInput = document.getElementById('bots-quantity');
        const resultDiv = document.getElementById('bots-result');
        const executeButton = document.getElementById('execute-insert-bots');

        const quantity = parseInt(quantityInput.value);

        if (!quantity || quantity < 1 || quantity > 50) {
            showResult(resultDiv, 'error', 'Quantidade inválida. Digite um número entre 1 e 50.');
            return;
        }

        executeButton.disabled = true;
        executeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inserindo...';

        try {
            // Gerar robôs
            const bots = [];
            for (let i = 0; i < quantity; i++) {
                const { nome, sexo } = getRandomNameAndGender();
                
                bots.push({
                    id: generateBotId(),
                    nick: nome,
                    level: 0,
                    equipe: null,
                    sexo: sexo, // Sexo correto baseado no nome: 1=Masculino, 2=Feminino
                    uf: "SP",
                    parceiro: "0",
                    turma: null,
                    grupo: null,
                    rede: null
                });
            }

            // Enviar para o servidor
            const response = await fetch('/admin/tim/api/bots/insert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bots })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            showResult(resultDiv, 'success', 
                `✅ ${result.inserted_count} robôs inseridos com sucesso!<br>
                 Total de participantes na sala: ${result.total_participants}`);

        } catch (error) {
            console.error('❌ Erro ao inserir robôs:', error);
            showResult(resultDiv, 'error', `Erro ao inserir robôs: ${error.message}`);
        } finally {
            executeButton.disabled = false;
            executeButton.innerHTML = '<i class="fas fa-plus-circle"></i> Inserir Robôs';
        }
    }

    /**
     * Mostrar resultado da operação
     */
    function showResult(container, type, message) {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        
        container.innerHTML = `
            <div class="alert ${alertClass}">
                <i class="${icon}"></i>
                ${message}
            </div>
        `;
        container.style.display = 'block';
    }

    /**
     * Executar remoção de robôs diretamente
     */
    async function executeRemoveBotsDirectly() {
        try {
            const response = await fetch('/admin/tim/api/bots/remove', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Exibir resultado em alerta
            if (result.removed_count > 0) {
                alert(`✅ ${result.removed_count} robôs removidos com sucesso!\nTotal de participantes na sala: ${result.total_participants}`);
            } else {
                alert('ℹ️ Nenhum robô encontrado para remover.');
            }

        } catch (error) {
            console.error('❌ Erro ao remover robôs:', error);
            alert(`❌ Erro ao remover robôs: ${error.message}`);
        }
    }

    // Event listeners para os botões do menu
    if (insertBotsButton) {
        insertBotsButton.addEventListener('click', function(e) {
            e.preventDefault();
            renderInsertBotsScreen();
        });
    }

    if (removeBotsButton) {
        removeBotsButton.addEventListener('click', function(e) {
            e.preventDefault();
            executeRemoveBotsDirectly();
        });
    }
});
