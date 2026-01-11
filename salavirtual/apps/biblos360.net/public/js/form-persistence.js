/**
 * Script para persistência de dados do formulário de inscrição
 * Restaura valores dos campos a partir dos parâmetros da URL
 */

document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // ========================================
  // EXIBIR ERROS DE VALIDAÇÃO
  // ========================================
  
  const errorsParam = urlParams.get('errors');
  if (errorsParam) {
    try {
      const errors = JSON.parse(decodeURIComponent(errorsParam));
      if (errors && errors.length > 0) {
        // Encontrar a div contents
        const contentsDiv = document.getElementById('contents');
        if (contentsDiv) {
          // Criar estrutura de erro
          const errorRow = document.createElement('div');
          errorRow.className = 'row';
          errorRow.innerHTML = `
            <div class="twelve columns">
              <div class="error">
                <ul>
                  ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
              </div>
            </div>
          `;
          
          // Inserir no início do contents
          contentsDiv.insertBefore(errorRow, contentsDiv.firstChild);
        }
      }
    } catch (e) {
      console.error('Erro ao processar erros de validação:', e);
    }
  }
  
  // ========================================
  // RESTAURAR DADOS PREENCHIDOS
  // ========================================
  
  // Função para restaurar valor de um campo
  function restaurarCampo(fieldName, paramName = null) {
    const param = paramName || fieldName;
    const value = urlParams.get(param);
    
    if (value) {
      const field = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
      
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = value === '1' || value === 'true';
        } else if (field.type === 'radio') {
          field.checked = field.value === value;
        } else {
          field.value = decodeURIComponent(value);
        }
        
        console.log('Restaurado campo:', fieldName, '=', value);
      }
    }
  }
  
  // Função para restaurar campos de checkbox/radio com arrays (name[])
  function restaurarCamposArray(fieldName) {
    const values = urlParams.getAll(fieldName);
    
    if (values && values.length > 0) {
      values.forEach(value => {
        const decodedValue = decodeURIComponent(value);
        const field = document.querySelector(`[name="${fieldName}"][value="${decodedValue}"]`);
        
        if (field) {
          field.checked = true;
          console.log('Restaurado campo array:', fieldName, '=', decodedValue);
        }
      });
    }
  }
  
  // ========================================
  // CAMPOS DO PASSO 1
  // ========================================
  
  restaurarCampo('YDInstaller_nome');
  restaurarCampo('YDInstaller_cpf_cnpj');
  
  // ========================================
  // CAMPOS DO PASSO 2
  // ========================================
  
  restaurarCampo('YDInstaller_apelido');
  restaurarCampo('YDInstaller_sexo');
  restaurarCampo('YDInstaller_estado_civil');
  restaurarCampo('YDInstaller_data_nascimento');
  restaurarCampo('YDInstaller_fone_contato_tipo');
  restaurarCampo('YDInstaller_fone_contato_ddd');
  restaurarCampo('YDInstaller_fone_contato_num');
  restaurarCampo('YDInstaller_email');
  restaurarCampo('YDInstaller_atuacao');
  restaurarCampo('YDInstaller_igreja');
  restaurarCampo('YDInstaller_denominacao');
  restaurarCampo('YDInstaller_pais');
  restaurarCampo('YDInstaller_cidade');
  restaurarCampo('YDInstaller_uf');
  restaurarCampo('YDInstaller_mailing');
  
  // ========================================
  // CAMPOS DO PASSO 3
  // ========================================
  
  // Campos de array (checkboxes)
  restaurarCamposArray('YDInstaller_divulgacao_social[]');
  restaurarCamposArray('YDInstaller_divulgacao_meios[]');
  
  // Campo de observações
  restaurarCampo('YDInstaller_obs');
  
  // ========================================
  // RESTAURAR RADIO BUTTONS
  // ========================================
  
  // Para radio buttons, precisamos marcar apenas o valor correspondente
  ['YDInstaller_sexo', 'YDInstaller_estado_civil', 'YDInstaller_fone_contato_tipo'].forEach(fieldName => {
    const value = urlParams.get(fieldName);
    if (value) {
      const radioButton = document.querySelector(`input[name="${fieldName}"][value="${value}"]`);
      if (radioButton) {
        radioButton.checked = true;
        console.log('Restaurado radio button:', fieldName, '=', value);
      }
    }
  });
  
  // ========================================
  // LIMPAR URL APÓS RESTAURAR DADOS
  // ========================================
  
  // Limpar a URL dos parâmetros após processar (mantém apenas o path)
  if (window.history && window.history.replaceState && urlParams.toString()) {
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }
  
  console.log('✅ Form persistence: dados restaurados com sucesso');
});
