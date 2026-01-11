// tim-register.js
// Sistema de cadastro de usuário MONITOR no painel administrativo do Timotinho

document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('virtual-main');
    const addUserButton = document.getElementById('action_user_add');

    // Estado do formulário multi-passo
    let registrationData = {};
    let currentStep = 1;

    /**
     * Renderizar formulário de inscrição - Passo 1
     */
    function renderStep1() {
        // Limpar conteúdo atual
        mainContent.innerHTML = '';

        // Criar container principal
        const container = document.createElement('div');
        container.className = 'container_12';
        container.style.cssText = 'max-height: 90vh; overflow-y: auto;';

        // Criar título
        const titleDiv = document.createElement('div');
        titleDiv.className = 'grid_12 mb20';
        titleDiv.innerHTML = `
            <div class="bg bg_bordered">
                <h2 class="mb0">
                    <i class="fas fa-user-plus"></i>
                    Adicionar Usuário Monitor - Passo 1 de 2
                </h2>
            </div>
        `;
        container.appendChild(titleDiv);

        // Criar grid para o formulário
        const grid = document.createElement('div');
        grid.className = 'grid_12';
        
        // Criar formulário usando exatamente a mesma estrutura do passo1.html
        const formContainer = document.createElement('div');
        formContainer.className = 'bg bg_bordered';
        formContainer.style.cssText = 'max-height: 80vh; overflow-y: auto; padding: 20px;';
        formContainer.innerHTML = `
            <div class="mb20">
                <h4 class="mb15">Cadastro de Usuário Monitor</h4>
                <p class="mb10">Este usuário será criado com nível de acesso MONITOR (level 1) e equipe Biblos360.</p>
                <div class="sep mb15"></div>
                
                <form id="register-step1-form">
                    <div style="display: flex; flex-direction: column; align-items: stretch;">
                        <div class="element" style="display: flex; flex-direction: column; align-items: stretch; flex: auto;">
                            <div class="text">
                                <div class="label label-before">
                                    <label for="nome" id="nome_label">Nome Completo</label>
                                </div>
                                <div class="input">
                                    <input maxlength="255" id="nome" type="text" name="nome" value="" required />
                                </div>
                            </div>
                        </div>
                        
                        <div class="element" style="display: flex; flex-direction: column; align-items: stretch; flex: auto;">
                            <div class="text">
                                <div class="label label-before">
                                    <label for="cpf_cnpj" id="cpf_cnpj_label">CPF</label>
                                </div>
                                <div class="input">
                                    <input maxlength="25" style="width: 200px" class="cpf" inputmode="numeric" id="cpf_cnpj" type="text" name="cpf_cnpj" value="" required />
                                </div>
                            </div>
                        </div>
                        
                        <div class="element" style="display: flex; flex-direction: column; align-items: stretch; flex: auto;">
                            <div class="span">
                                <span style="display: block; margin-bottom: 1.2rem">
                                    <strong>Monitor da Sala Virtual</strong><br>
                                    Este usuário terá acesso especial para moderar a sala virtual e auxiliar na administração dos participantes.
                                </span>
                            </div>
                        </div>
                        
                        <div class="buttons">
                            <button type="submit" class="button button-primary">Continuar</button>
                            <button type="button" id="cancel-register" class="button">Cancelar</button>
                        </div>
                    </div>
                </form>
            </div>
        `;

        grid.appendChild(formContainer);
        container.appendChild(grid);
        mainContent.appendChild(container);

        // Aplicar máscara de CPF
        applyCpfMask();

        // Event listeners
        const form = document.getElementById('register-step1-form');
        const cancelBtn = document.getElementById('cancel-register');

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleStep1Submit();
        });

        cancelBtn.addEventListener('click', function() {
            // Voltar para lista de usuários
            if (window.timUsers && window.timUsers.renderUserList) {
                window.timUsers.renderUserList();
            } else {
                // Fallback - recarregar página
                location.reload();
            }
        });
    }

    /**
     * Renderizar formulário de inscrição - Passo 2
     */
    function renderStep2() {
        // Limpar conteúdo atual
        mainContent.innerHTML = '';

        // Criar container principal
        const container = document.createElement('div');
        container.className = 'container_12';
        container.style.cssText = 'max-height: 90vh; overflow-y: auto;';

        // Criar título
        const titleDiv = document.createElement('div');
        titleDiv.className = 'grid_12 mb20';
        titleDiv.innerHTML = `
            <div class="bg bg_bordered">
                <h2 class="mb0">
                    <i class="fas fa-user-plus"></i>
                    Adicionar Usuário Monitor - Passo 2 de 2
                </h2>
            </div>
        `;
        container.appendChild(titleDiv);

        // Criar grid para o formulário
        const grid = document.createElement('div');
        grid.className = 'grid_12';
        
        // Criar formulário usando exatamente a mesma estrutura do passo2.html
        const formContainer = document.createElement('div');
        formContainer.className = 'bg bg_bordered';
        formContainer.style.cssText = 'max-height: 80vh; overflow-y: auto; padding: 20px;';
        formContainer.innerHTML = `
            <div class="mb20">
                <h4 class="mb15">Dados Complementares</h4>
                <p class="mb10">Finalize o cadastro do usuário monitor com as informações adicionais.</p>
                <div class="sep mb15"></div>
                
                <form id="register-step2-form">
                    <div style="display: flex; flex-direction: column; align-items: stretch;">
                        <div class="element" style="display: flex; flex-direction: column; align-items: stretch; flex: auto;">
                            <div class="text">
                                <div class="label label-before">
                                    <label for="apelido" id="apelido_label">Nome no Crachá &nbsp; <span class="counter nowrap">(20 caracteres)</span></label>
                                </div>
                                <div class="input">
                                    <input maxlength="20" style="width: 200px" id="apelido" type="text" name="apelido" value="" required />
                                </div>
                            </div>
                        </div>
                        
                        <div class="element" style="display: flex; flex-direction: column; align-items: stretch; flex: auto;">
                            <fieldset class="radio" style="display: flex; flex-direction: column;">
                                <div class="label">
                                    <label for="sexo" id="sexo_label">Sexo</label>
                                </div>
                                <div class="input" style="display: flex; flex-direction: row; flex-wrap: wrap; column-gap: 2rem">
                                    <label style="display: flex; flex-direction: row; align-items: baseline">
                                        <input id="sexo_1" type="radio" name="sexo" value="1" />
                                        <span class="label-body">Masculino</span>
                                    </label>
                                    <label style="display: flex; flex-direction: row; align-items: baseline">
                                        <input id="sexo_2" type="radio" name="sexo" value="2" />
                                        <span class="label-body">Feminino</span>
                                    </label>
                                </div>
                            </fieldset>
                        </div>
                        
                        <div class="element" style="display: flex; flex-direction: column; align-items: stretch; flex: auto;">
                            <fieldset class="radio" style="display: flex; flex-direction: column;">
                                <div class="label">
                                    <label for="estado_civil" id="estado_civil_label">Estado Civil</label>
                                </div>
                                <div class="input" style="display: flex; flex-direction: row; flex-wrap: wrap; column-gap: 2rem">
                                    <label style="display: flex; flex-direction: row; align-items: baseline">
                                        <input id="estado_civil_1" type="radio" name="estado_civil" value="1" />
                                        <span class="label-body">Solteiro(a)</span>
                                    </label>
                                    <label style="display: flex; flex-direction: row; align-items: baseline">
                                        <input id="estado_civil_2" type="radio" name="estado_civil" value="2" />
                                        <span class="label-body">Casado(a)</span>
                                    </label>
                                    <label style="display: flex; flex-direction: row; align-items: baseline">
                                        <input id="estado_civil_3" type="radio" name="estado_civil" value="3" />
                                        <span class="label-body">Divorciado(a)</span>
                                    </label>
                                    <label style="display: flex; flex-direction: row; align-items: baseline">
                                        <input id="estado_civil_4" type="radio" name="estado_civil" value="4" />
                                        <span class="label-body">Viúvo(a)</span>
                                    </label>
                                </div>
                            </fieldset>
                        </div>
                        
                        <div class="element" style="display: flex; flex-direction: column; align-items: stretch; flex: auto;">
                            <div class="text">
                                <div class="label label-before">
                                    <label for="data_nascimento" id="data_nascimento_label">Data de Nascimento &nbsp; <span class="counter nowrap">dd/mm/aaaa</span></label>
                                </div>
                                <div class="input">
                                    <input maxlength="10" style="width: 200px" class="date birthdate" id="data_nascimento" type="text" name="data_nascimento" value="" required />
                                </div>
                            </div>
                        </div>
                        
                        <div class="element" style="display: flex; flex-direction: column; align-items: stretch; flex: auto;">
                            <fieldset class="radio" style="display: flex; flex-direction: column;">
                                <div class="label">
                                    <label for="fone_contato_tipo" id="fone_contato_tipo_label">Fone para contato em horário comercial</label>
                                </div>
                                <div class="input" style="display: flex; flex-direction: row; flex-wrap: wrap; column-gap: 2rem">
                                    <label style="display: flex; flex-direction: row; align-items: baseline">
                                        <input id="fone_contato_tipo_cel" type="radio" name="fone_contato_tipo" value="cel" />
                                        <span class="label-body">Celular</span>
                                    </label>
                                    <label style="display: flex; flex-direction: row; align-items: baseline">
                                        <input id="fone_contato_tipo_resid" type="radio" name="fone_contato_tipo" value="resid" />
                                        <span class="label-body">Residencial</span>
                                    </label>
                                    <label style="display: flex; flex-direction: row; align-items: baseline">
                                        <input id="fone_contato_tipo_prof" type="radio" name="fone_contato_tipo" value="prof" />
                                        <span class="label-body">Profissional</span>
                                    </label>
                                </div>
                            </fieldset>
                        </div>
                        
                        <div class="element" style="display: flex; flex-direction: column; align-items: stretch; flex: auto;">
                            <div class="text">
                                <div class="label label-before">
                                    <label for="fone_contato_ddd" id="fone_contato_ddd_label">DDD</label>
                                </div>
                                <div class="input">
                                    <input maxlength="3" style="width: 50px" id="fone_contato_ddd" type="text" name="fone_contato_ddd" value="" />
                                </div>
                            </div>
                        </div>
                        
                        <div class="element" style="display: flex; flex-direction: column; align-items: stretch; flex: auto;">
                            <div class="text">
                                <div class="label label-before">
                                    <label for="fone_contato_num" id="fone_contato_num_label">Número &nbsp; <span class="counter nowrap">xxxxx-xxxx</span></label>
                                </div>
                                <div class="input">
                                    <input maxlength="10" style="width: 200px" class="phone" id="fone_contato_num" type="text" name="fone_contato_num" value="" />
                                </div>
                            </div>
                        </div>
                        
                        <div class="element" style="display: flex; flex-direction: column; align-items: stretch; flex: auto;">
                            <div class="span">
                                <span style="display: block; margin-bottom: 1.2rem">
                                    <br>Nosso contato com você é feito principalmente por e-mail.<br>
                                    Por favor, informe um e-mail que você acessa com frequência.
                                </span>
                            </div>
                        </div>
                        
                        <div class="element" style="display: flex; flex-direction: column; align-items: stretch; flex: auto;">
                            <div class="text">
                                <div class="label label-before">
                                    <label for="email" id="email_label">E-mail Pessoal &nbsp; <span class="counter nowrap">email@dominio.com.br</span></label>
                                </div>
                                <div class="input">
                                    <input maxlength="255" class="email" id="email" type="email" name="email" value="" required />
                                </div>
                            </div>
                        </div>
                        
                        <div class="element" style="display: flex; flex-direction: column; align-items: stretch; flex: auto;">
                            <fieldset class="checkbox" style="display: flex; flex-direction: row; align-content: baseline">
                                <div class="input">
                                    <input id="mailing" type="checkbox" name="mailing" checked="checked" />
                                </div>
                                <div class="label label-after">
                                    <label for="mailing" id="mailing_label">Quero receber novidades do Haggai por e-mail, como cursos, vídeos e transmissões ao vivo</label>
                                </div>
                            </fieldset>
                        </div>

                        <div class="element" style="display: flex; flex-direction: column; align-items: stretch; flex: auto;">
                            <div class="select">
                                <div class="label label-before">
                                    <label for="pais" id="pais_label">País</label>
                                </div>
                                <div class="input">
                                    <select class="pais" id="pais" name="pais" required>
                                        <option value="">Selecione o país</option>
                                        <option value="BRA" selected>Brasil</option>
                                        <option value="ARG">Argentina</option>
                                        <option value="BOL">Bolívia</option>
                                        <option value="CHL">Chile</option>
                                        <option value="COL">Colômbia</option>
                                        <option value="ECU">Equador</option>
                                        <option value="PRY">Paraguai</option>
                                        <option value="PER">Peru</option>
                                        <option value="URY">Uruguai</option>
                                        <option value="VEN">Venezuela</option>
                                        <option value="USA">Estados Unidos</option>
                                        <option value="CAN">Canadá</option>
                                        <option value="PRT">Portugal</option>
                                        <option value="ESP">Espanha</option>
                                        <option value="FRA">França</option>
                                        <option value="ITA">Itália</option>
                                        <option value="DEU">Alemanha</option>
                                        <option value="GBR">Reino Unido</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="element" style="display: flex; flex-direction: column; align-items: stretch; flex: auto;">
                            <div class="text">
                                <div class="label label-before">
                                    <label for="cidade" id="cidade_label">Cidade</label>
                                </div>
                                <div class="input">
                                    <input maxlength="255" id="cidade" type="text" name="cidade" value="" required />
                                </div>
                            </div>
                        </div>
                        
                        <div class="element" style="display: flex; flex-direction: column; align-items: stretch; flex: auto;">
                            <div class="select">
                                <div class="label label-before">
                                    <label for="uf" id="uf_label">Estado</label>
                                </div>
                                <div class="input">
                                    <select id="uf" name="uf" required>
                                        <option value="">Selecione o estado</option>
                                        <option value="AC">Acre</option>
                                        <option value="AL">Alagoas</option>
                                        <option value="AP">Amapá</option>
                                        <option value="AM">Amazonas</option>
                                        <option value="BA">Bahia</option>
                                        <option value="CE">Ceará</option>
                                        <option value="DF">Distrito Federal</option>
                                        <option value="ES">Espírito Santo</option>
                                        <option value="GO">Goiás</option>
                                        <option value="MA">Maranhão</option>
                                        <option value="MT">Mato Grosso</option>
                                        <option value="MS">Mato Grosso do Sul</option>
                                        <option value="MG">Minas Gerais</option>
                                        <option value="PA">Pará</option>
                                        <option value="PB">Paraíba</option>
                                        <option value="PR">Paraná</option>
                                        <option value="PE">Pernambuco</option>
                                        <option value="PI">Piauí</option>
                                        <option value="RJ">Rio de Janeiro</option>
                                        <option value="RN">Rio Grande do Norte</option>
                                        <option value="RS">Rio Grande do Sul</option>
                                        <option value="RO">Rondônia</option>
                                        <option value="RR">Roraima</option>
                                        <option value="SC">Santa Catarina</option>
                                        <option value="SP">São Paulo</option>
                                        <option value="SE">Sergipe</option>
                                        <option value="TO">Tocantins</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="buttons">
                            <button type="submit" class="button button-primary" id="submit-register">Cadastrar Usuário Monitor</button>
                            <button type="button" id="back-step1" class="button">Voltar</button>
                            <button type="button" id="cancel-register-step2" class="button">Cancelar</button>
                        </div>
                    </div>
                </form>
            </div>
        `;

        grid.appendChild(formContainer);
        container.appendChild(grid);
        mainContent.appendChild(container);

        // Aplicar máscaras
        applyDateMask();
        applyPhoneMask();

        // Pre-popular campos com dados do passo 1
        if (registrationData.apelido) {
            document.getElementById('apelido').value = registrationData.apelido;
        }

        // Event listeners
        const form = document.getElementById('register-step2-form');
        const backBtn = document.getElementById('back-step1');
        const cancelBtn = document.getElementById('cancel-register-step2');

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleStep2Submit();
        });

        backBtn.addEventListener('click', function() {
            currentStep = 1;
            renderStep1();
        });

        cancelBtn.addEventListener('click', function() {
            // Voltar para lista de usuários
            if (window.timUsers && window.timUsers.renderUserList) {
                window.timUsers.renderUserList();
            } else {
                location.reload();
            }
        });
    }

    /**
     * Processar submissão do Passo 1
     */
    function handleStep1Submit() {
        const form = document.getElementById('register-step1-form');
        const formData = new FormData(form);
        
        // Validar campos obrigatórios
        const nome = formData.get('nome').trim();
        const cpf = formData.get('cpf_cnpj').trim();

        if (!nome) {
            alert('Por favor, informe o nome completo.');
            return;
        }

        if (!cpf) {
            alert('Por favor, informe o CPF.');
            return;
        }

        // Validar CPF básico (apenas formato)
        const cpfNumbers = cpf.replace(/\D/g, '');
        if (cpfNumbers.length !== 11) {
            alert('Por favor, informe um CPF válido.');
            return;
        }

        // Salvar dados do passo 1
        registrationData.nome = nome;
        registrationData.cpf_cnpj = cpf;
        
        // Sugerir apelido baseado no primeiro nome
        const firstName = nome.split(' ')[0];
        registrationData.apelido = firstName.substring(0, 20); // Máximo 20 caracteres

        // Avançar para passo 2
        currentStep = 2;
        renderStep2();
    }

    /**
     * Processar submissão do Passo 2 e realizar cadastro
     */
    async function handleStep2Submit() {
        const form = document.getElementById('register-step2-form');
        const submitBtn = document.getElementById('submit-register');
        const formData = new FormData(form);
        
        // Validar campos obrigatórios
        const apelido = formData.get('apelido').trim();
        const email = formData.get('email').trim();
        const dataNascimento = formData.get('data_nascimento').trim();
        const pais = formData.get('pais');
        const cidade = formData.get('cidade').trim();
        const uf = formData.get('uf');

        if (!apelido) {
            alert('Por favor, informe o nome no crachá.');
            return;
        }

        if (!email) {
            alert('Por favor, informe o e-mail.');
            return;
        }

        if (!dataNascimento) {
            alert('Por favor, informe a data de nascimento.');
            return;
        }

        if (!pais) {
            alert('Por favor, selecione o país.');
            return;
        }

        if (!cidade) {
            alert('Por favor, informe a cidade.');
            return;
        }

        if (!uf) {
            alert('Por favor, selecione o estado.');
            return;
        }

        // Verificar se algum sexo foi selecionado
        const sexoSelected = form.querySelector('input[name="sexo"]:checked');
        if (!sexoSelected) {
            alert('Por favor, selecione o sexo.');
            return;
        }

        // Verificar se algum estado civil foi selecionado
        const estadoCivilSelected = form.querySelector('input[name="estado_civil"]:checked');
        if (!estadoCivilSelected) {
            alert('Por favor, selecione o estado civil.');
            return;
        }

        // Preparar dados completos para cadastro
        const userData = {
            // Dados do passo 1
            nome: registrationData.nome,
            cpf_cnpj: registrationData.cpf_cnpj,
            
            // Dados do passo 2
            apelido: apelido,
            sexo: parseInt(sexoSelected.value),
            estado_civil: parseInt(estadoCivilSelected.value),
            data_nascimento: dataNascimento,
            email: email,
            pais: pais,
            cidade: cidade,
            uf: uf,
            
            // Dados opcionais
            fone_contato_tipo: formData.get('fone_contato_tipo') || null,
            fone_contato_ddd: formData.get('fone_contato_ddd') || null,
            fone_contato_num: formData.get('fone_contato_num') || null,
            mailing: formData.get('mailing') ? 1 : 0,
            
            // Dados específicos para MONITOR
            level: 1,           // Monitor
            equipe: 'Biblos360', // Equipe fixa
            situacao: 1,        // Ativo
            natureza: 0,        // Não remunerado (padrão)
            religiosa: 0,       // Não remunerado (padrão)
            atuacao: '',        // Vazio
            igreja: '',         // Vazio
            denominacao: '',    // Vazio
            
            // Extras para compatibilidade
            extras: {
                parceiro: "0",
                admin_created: true,
                created_by_tim: true
            }
        };

        // Mostrar loading
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
        submitBtn.disabled = true;

        try {
            // Enviar para o endpoint de cadastro administrativo
            const response = await fetch('/tim/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Sucesso!
            alert(`✅ Usuário monitor cadastrado com sucesso!\n\nNome: ${userData.nome}\nE-mail: ${userData.email}\nNível: Monitor (1)\nEquipe: Biblos360`);
            
            // Voltar para lista de usuários
            if (window.timUsers && window.timUsers.renderUserList) {
                window.timUsers.renderUserList();
            } else {
                location.reload();
            }

        } catch (error) {
            console.error('❌ Erro ao cadastrar usuário:', error);
            
            // Restaurar botão
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Mostrar erro
            alert(`❌ Erro ao cadastrar usuário: ${error.message}`);
        }
    }

    /**
     * Aplicar máscara de CPF
     */
    function applyCpfMask() {
        const cpfInput = document.getElementById('cpf_cnpj');
        if (cpfInput) {
            cpfInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            });
        }
    }

    /**
     * Aplicar máscara de data
     */
    function applyDateMask() {
        const dateInput = document.getElementById('data_nascimento');
        if (dateInput) {
            dateInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{2})(\d)/, '$1/$2');
                value = value.replace(/(\d{2})(\d)/, '$1/$2');
                e.target.value = value;
            });
        }
    }

    /**
     * Aplicar máscara de telefone
     */
    function applyPhoneMask() {
        const phoneInput = document.getElementById('fone_contato_num');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 8) {
                    value = value.replace(/(\d{4})(\d)/, '$1-$2');
                } else {
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                }
                e.target.value = value;
            });
        }
    }

    /**
     * Função principal para renderizar formulário de cadastro
     */
    function renderUserRegistration() {
        // Resetar estado
        registrationData = {};
        currentStep = 1;
        
        // Renderizar passo 1
        renderStep1();
    }

    // Event listener para o botão "Novo Usuário"
    if (addUserButton) {
        addUserButton.addEventListener('click', function(e) {
            e.preventDefault();
            renderUserRegistration();
        });
    }

    // Expor função globalmente para compatibilidade
    window.timRegister = {
        renderUserRegistration: renderUserRegistration
    };
});
