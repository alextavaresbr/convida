/**
 * Sistema de validação e exibição de erros para formulários de inscrição
 */

document.addEventListener('DOMContentLoaded', function() {
    // Função para obter parâmetros da URL
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // Função para exibir erros
    function displayErrors(errors) {
        if (!errors || errors.length === 0) return;

        // Encontrar o div contents
        var contentsDiv = document.getElementById('contents');
        if (!contentsDiv) return;

        // Criar a estrutura de erro
        var errorRowDiv = document.createElement('div');
        errorRowDiv.className = 'row';
        
        var errorColDiv = document.createElement('div');
        errorColDiv.className = 'twelve columns';
        
        var errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        
        var errorList = document.createElement('ul');
        
        // Adicionar cada erro como um item da lista
        errors.forEach(function(error) {
            var listItem = document.createElement('li');
            listItem.textContent = error;
            errorList.appendChild(listItem);
        });
        
        errorDiv.appendChild(errorList);
        errorColDiv.appendChild(errorDiv);
        errorRowDiv.appendChild(errorColDiv);
        
        // Inserir no início do contents, após o primeiro filho
        var firstChild = contentsDiv.firstElementChild;
        if (firstChild) {
            contentsDiv.insertBefore(errorRowDiv, firstChild.nextSibling);
        } else {
            contentsDiv.appendChild(errorRowDiv);
        }

        // Scroll para o topo para mostrar os erros
        window.scrollTo(0, 0);
    }

    // Verificar se há erros na URL
    var errorsParam = getUrlParameter('errors');
    if (errorsParam) {
        try {
            var errors = JSON.parse(errorsParam);
            if (Array.isArray(errors)) {
                displayErrors(errors);
            }
        } catch (e) {
            console.error('Erro ao processar erros da URL:', e);
        }
    }

    // Função para validar formulário antes do envio (validação no frontend)
    function validateForm(form) {
        var errors = [];
        
        // Validações específicas por página
        var formName = form.getAttribute('name');
        
        if (formName === 'YDInstaller') {
            var actionUrl = form.getAttribute('action');
            
            if (actionUrl === '/cadastro/step1') {
                // Validações do passo 1
                var nome = form.querySelector('[name="YDInstaller_nome"]');
                var cpf = form.querySelector('[name="YDInstaller_cpf_cnpj"]');
                
                if (!nome || !nome.value.trim()) {
                    errors.push('Por favor, preencha o campo "Nome Completo"');
                }
                
                if (!cpf || !cpf.value.trim()) {
                    errors.push('Por favor, preencha o campo "CPF"');
                }
                
            } else if (actionUrl === '/cadastro/step2') {
                // Validações do passo 2
                var campos = [
                    { name: 'YDInstaller_apelido', label: 'Nome no Crachá' },
                    { name: 'YDInstaller_sexo', label: 'Sexo', type: 'radio' },
                    { name: 'YDInstaller_estado_civil', label: 'Estado Civil', type: 'radio' },
                    { name: 'YDInstaller_data_nascimento', label: 'Data de Nascimento' },
                    { name: 'YDInstaller_fone_contato_tipo', label: 'Fone para contato em horário comercial', type: 'radio' },
                    { name: 'YDInstaller_fone_contato_ddd', label: 'DDD' },
                    { name: 'YDInstaller_fone_contato_num', label: 'Número' },
                    { name: 'YDInstaller_email', label: 'E-mail Pessoal' },
                    { name: 'YDInstaller_atuacao', label: 'Área de Atuação' },
                    { name: 'YDInstaller_igreja', label: 'Sua Igreja Local' },
                    { name: 'YDInstaller_denominacao', label: 'Denominação' },
                    { name: 'YDInstaller_pais', label: 'País' }
                ];
                
                campos.forEach(function(campo) {
                    if (campo.type === 'radio') {
                        var radioInputs = form.querySelectorAll('[name="' + campo.name + '"]');
                        var isChecked = false;
                        for (var i = 0; i < radioInputs.length; i++) {
                            if (radioInputs[i].checked) {
                                isChecked = true;
                                break;
                            }
                        }
                        if (!isChecked) {
                            errors.push('Por favor, preencha o campo "' + campo.label + '"');
                        }
                    } else {
                        var input = form.querySelector('[name="' + campo.name + '"]');
                        if (!input || !input.value.trim()) {
                            errors.push('Por favor, preencha o campo "' + campo.label + '"');
                        }
                        
                        // Validação específica de email
                        if (campo.name === 'YDInstaller_email' && input && input.value.trim()) {
                            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (!emailRegex.test(input.value.trim())) {
                                errors.push('Por favor, informe um e-mail válido');
                            }
                        }
                    }
                });
            }
        }
        
        return errors;
    }

    // Adicionar validação aos formulários
    var forms = document.querySelectorAll('form[name="YDInstaller"]');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            var errors = validateForm(form);
            
            if (errors.length > 0) {
                e.preventDefault();
                
                // Remover erros existentes
                var existingErrors = document.querySelectorAll('.error');
                existingErrors.forEach(function(errorDiv) {
                    var row = errorDiv.closest('.row');
                    if (row) row.remove();
                });
                
                // Mostrar novos erros
                displayErrors(errors);
                return false;
            }
            
            // Mostrar spinner se existe
            var spinner = form.querySelector('.spinner');
            if (spinner) {
                spinner.style.display = 'inline-block';
            }
            
            // Desabilitar botão de submit
            var submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.value = 'Processando...';
            }
        });
    });
});
