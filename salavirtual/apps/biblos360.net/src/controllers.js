/**
 * CONTROLLERS UNIFICADOS - BIBLOS360 VIRTUAL ROOM
 * Todos os controllers do sistema centralizados em um arquivo
 */

// ========================================
// SEÇÁO 0: POLYFILLS PARA NODE.JS ANTIGO
// ========================================

// Polyfill para Headers (necessário para Supabase com Node.js < 18)
if (typeof globalThis.Headers === 'undefined') {
  globalThis.Headers = class Headers {
    constructor(init = {}) {
      this.map = new Map();
      if (init) {
        if (init instanceof Headers) {
          init.forEach((value, key) => this.set(key, value));
        } else if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.set(key, value));
        } else if (typeof init === 'object') {
          Object.keys(init).forEach(key => this.set(key, init[key]));
        }
      }
    }

    append(key, value) {
      const existing = this.get(key);
      this.set(key, existing ? `${existing}, ${value}` : value);
    }

    delete(key) {
      this.map.delete(key.toLowerCase());
    }

    get(key) {
      return this.map.get(key.toLowerCase()) || null;
    }

    has(key) {
      return this.map.has(key.toLowerCase());
    }

    set(key, value) {
      this.map.set(key.toLowerCase(), String(value));
    }

    forEach(callback, thisArg) {
      this.map.forEach((value, key) => callback.call(thisArg, value, key, this));
    }

    keys() {
      return this.map.keys();
    }

    values() {
      return this.map.values();
    }

    entries() {
      return this.map.entries();
    }

    [Symbol.iterator]() {
      return this.entries();
    }
  };
}

// ========================================
// SEÇÁO 1: IMPORTS E DEPENDÊNCIAS
// ========================================

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const services = require('./services');
const { createClient } = require('@supabase/supabase-js');
const errors = require('./errors');

// Configuração do Supabase usando variáveis de ambiente
console.log('🔍 DEBUG DETALHADO - Verificação do Railway:');
console.log('RAILWAY_PROJECT_NAME:', process.env.RAILWAY_PROJECT_NAME);
console.log('RAILWAY_ENVIRONMENT_NAME:', process.env.RAILWAY_ENVIRONMENT_NAME);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Verificar se as variáveis estão definidas
console.log('🔍 SUPABASE vars check:');
console.log('SUPABASE_URL exists in env:', 'SUPABASE_URL' in process.env);
console.log('SUPABASE_ANON_KEY exists in env:', 'SUPABASE_ANON_KEY' in process.env);
console.log('SUPABASE_URL value:', process.env.SUPABASE_URL ? `[DEFINIDA: ${process.env.SUPABASE_URL.substring(0, 50)}...]` : '[INDEFINIDA]');
console.log('SUPABASE_ANON_KEY value:', process.env.SUPABASE_ANON_KEY ? `[DEFINIDA: ${process.env.SUPABASE_ANON_KEY.substring(0, 50)}...]` : '[INDEFINIDA]');

const supabaseUrl = process.env.SUPABASE_URL || 'https://myqwknjakzzrhxqlnoqp.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cXdrbmpha3p6cmh4cWxub3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NzYwNTAsImV4cCI6MjA3MDQ1MjA1MH0.xE_0ZQZmyA9-PuuVYhP9fP6BXDbR4s0NEHVGEzx3KUo';

console.log('🔍 DEBUG - Configuração Supabase:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '[USANDO ENV VAR]' : '[USANDO FALLBACK]');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '[USANDO ENV VAR]' : '[USANDO FALLBACK]');

if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  console.log('✅ SUPABASE - Usando variáveis de ambiente configuradas no Railway');
} else {
  console.log('⚠️  SUPABASE - Usando valores hardcoded (fallback)');
  console.log('💡 PROBLEMA: As variáveis estão configuradas no Railway mas não chegaram ao processo Node.js');
  console.log('💡 SOLUÇÃO: Verifique se fez redeploy após adicionar as variáveis');
}

console.log('✅ CONTROLLERS - Supabase configured with environment variables');

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'api'
  }
});

// ========================================
// SEÇÁO 2: CONTROLLER DE API
// ========================================

/**
 * Health check do sistema
 */
const healthCheck = async (req, res) => {
  try {
    const health = {
      status: 'ok',
      service: 'Biblos360 Virtual Room',
      version: '3.0.0',
      architecture: 'simplified',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: 'Health check failed', message: error.message });
  }
};

/**
 * Timestamp para cache busting
 */
const timestamp = async (req, res) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    res.set('Cache-Control', 'public, max-age=30');
    res.send(timestamp.toString());
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar timestamp', message: error.message });
  }
};

/**
 * Rota raiz - redireciona baseado na autenticação
 */
const rootRedirect = async (req, res) => {
  try {
    const { isAuthenticated, hasInscricao, user, inscricao } = req.biblos360Auth || {};

    // Se tem cookies válidos, redireciona para sala virtual
    if (isAuthenticated && user) {
      // Determina sala baseado na inscrição ou padrão
      let roomId = 'pub'; // Sala padrão

      if (hasInscricao && inscricao?.data?.ev) {
        roomId = inscricao.data.ev;
      } else if (hasInscricao && inscricao?.data?.room_id) {
        roomId = inscricao.data.room_id;
      }

      console.log(`✅ Usuário ${user.data.nome || user.data.apelido} redirecionado para sala ${roomId}`);
      return res.redirect(`/vr/${roomId}`);
    }

    // Caso contrário, redireciona para login
    console.log('🔄 Usuário não autenticado - redirecionando para login');
    res.redirect('/login.html');
  } catch (error) {
    console.error('❌ Erro na rota raiz:', error);
    res.redirect('/login.html');
  }
};

/**
 * Endpoint de status do sistema
 */
const systemStatus = async (req, res) => {
  try {
    const io = req.app.get('io');

    const status = {
      server: {
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      socket: {
        connected_clients: io && io.engine ? io.engine.clientsCount : 0,
        transport_types: io && io.engine ? Object.keys(io.engine.transports || {}) : []
      },
      endpoints: {
        enabled_count: 'N/A'
      },
      timestamp: new Date().toISOString()
    };

    res.json(status);
  } catch (error) {
    console.error('Erro no systemStatus:', error);
    res.status(500).json({
      error: 'Erro ao obter status do sistema',
      message: error.message
    });
  }
};

/**
 * Endpoint de informações do servidor
 */
const serverInfo = async (req, res) => {
  try {
    const info = {
      name: 'Biblos360 Virtual Room',
      version: '3.0.0',
      architecture: 'simplified',
      node_version: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || 'development',
      features: {
        socket_io: true,
        php_compatibility: true,
        video_positions: true,
        file_upload: true,
        real_time_chat: true,
        room_management: true
      },
      endpoints: {
        health: '/health',
        status: '/api/status',
        timestamp: '/vr/timestamp',
        rooms: '/vr/:id',
        api: '/api/*',
        videos: '/videos/pos/*'
      }
    };

    res.json(info);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter informações do servidor', message: error.message });
  }
};

// ========================================
// SEÇÁO 3.1: CONTROLLERS DE INSCRIÇÁO (CADASTRO)
// ========================================

// Utilitário: normaliza CPF (somente dígitos)
function normalizeCPF(value = '') {
  return (value || '').toString().replace(/\D/g, '');
}

// Utilitário: converte data DD/MM/AAAA -> YYYYMMDD (string)
function toYYYYMMDD(dateStr = '') {
  const s = (dateStr || '').toString().trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split('/');
    return `${yyyy}${mm}${dd}`;
  }
  // Já pode vir como YYYYMMDD
  if (/^\d{8}$/.test(s)) return s;
  return '';
}

// Utilitário: compõe telefone a partir de tipo + ddd + número
function composeTelefone(tipo, ddd, numero) {
  const d = (ddd || '').toString().replace(/\D/g, '');
  const n = (numero || '').toString().replace(/\D/g, '');
  const t = (tipo || '').toString();
  if (!d && !n) return null;
  return `${t ? `${t}:` : ''}(${d}) ${n}`.trim();
}

// POST /cadastro/step1
const cadastroStep1 = async (req, res) => {
  try {
    const { YDInstaller_nome, YDInstaller_cpf_cnpj } = req.body || {};

    // Validações obrigatórias
    const errors = [];
    const nome = (YDInstaller_nome || '').toString().trim();
    const cpf = normalizeCPF(YDInstaller_cpf_cnpj);

    if (!nome) {
      errors.push('Por favor, preencha o campo "Nome Completo"');
    }
    if (!cpf) {
      errors.push('Por favor, preencha o campo "CPF"');
    } else {
      // Validar CPF
      const cpfNumbers = cpf.replace(/\D/g, '');
      if (cpfNumbers.length !== 11) {
        errors.push('CPF deve ter 11 dígitos');
      }
    }

    // Se há erros, renderizar a página com erros e dados preenchidos
    if (errors.length > 0) {
      const params = [];
      params.push(`errors=${encodeURIComponent(JSON.stringify(errors))}`);

      // Preservar dados preenchidos
      if (nome) params.push(`YDInstaller_nome=${encodeURIComponent(nome)}`);
      if (cpf) params.push(`YDInstaller_cpf_cnpj=${encodeURIComponent(cpf)}`);

      const queryString = params.join('&');
      return res.redirect(`/inscricao/eventos/pub/step1.html?${queryString}`);
    }

    // Inicia objeto na sessão
    req.session.cadastro = req.session.cadastro || {};
    req.session.cadastro.nome = nome;
    req.session.cadastro.cpf_cnpj = cpf;
    req.session.cadastro.ev = req.session.cadastro.ev || 'pub';

    // Backup em cookie para Railway
    const cadastroData = {
      nome: nome,
      cpf_cnpj: cpf,
      ev: 'pub',
      step: 1
    };
    res.cookie('cadastro_temp', JSON.stringify(cadastroData), {
      maxAge: 60 * 60 * 1000, // 1 hora
      httpOnly: false,
      secure: false
    });

    // Verificar se CPF já existe - BLOQUEAR DUPLICATAS
    try {
      const supabaseService = require('./supabase');
      const existing = cpf ? await supabaseService.getUserByCpfCnpj(cpf) : null;
      if (existing && existing.id) {
        console.warn('[CADASTRO step1] CPF já cadastrado:', cpf, 'User ID:', existing.id);
        // CPF já cadastrado - bloquear novo cadastro
        const params = [];
        params.push(`errors=${encodeURIComponent(JSON.stringify(['Este CPF já está cadastrado no sistema. Se você já se inscreveu anteriormente, use a opção de login.']))}`);

        // Preservar dados preenchidos
        if (nome) params.push(`YDInstaller_nome=${encodeURIComponent(nome)}`);
        if (cpf) params.push(`YDInstaller_cpf_cnpj=${encodeURIComponent(cpf)}`);

        const queryString = params.join('&');
        return res.redirect(`/inscricao/eventos/pub/step1.html?${queryString}`);
      }
    } catch (e) {
      // Não bloqueia o fluxo se lookup falhar
      console.warn('[CADASTRO step1] Lookup CPF falhou:', e.message);
    }

    // Redireciona para step 2 estático
    return res.redirect('/inscricao/eventos/pub/step2.html');
  } catch (error) {
    console.error('[CADASTRO step1] Erro:', error);
    const params = [];
    params.push(`errors=${encodeURIComponent(JSON.stringify(['Erro interno do servidor. Tente novamente.']))}`);

    // Preservar dados preenchidos mesmo em caso de erro interno
    const nome = (req.body.YDInstaller_nome || '').toString().trim();
    const cpf = normalizeCPF(req.body.YDInstaller_cpf_cnpj);

    if (nome) params.push(`YDInstaller_nome=${encodeURIComponent(nome)}`);
    if (cpf) params.push(`YDInstaller_cpf_cnpj=${encodeURIComponent(cpf)}`);

    const queryString = params.join('&');
    return res.redirect(`/inscricao/eventos/pub/step1.html?${queryString}`);
  }
};

// POST /cadastro/step2
const cadastroStep2 = async (req, res) => {
  try {
    console.log('[CADASTRO step2] Body recebido:', JSON.stringify(req.body, null, 2));

    const b = req.body || {};
    req.session.cadastro = req.session.cadastro || {};

    // Validações obrigatórias
    const errors = [];

    // Campos obrigatórios
    const apelido = (b.YDInstaller_apelido || '').toString().trim();
    const sexo = b.YDInstaller_sexo ? parseInt(b.YDInstaller_sexo) : null;
    const estado_civil = b.YDInstaller_estado_civil ? parseInt(b.YDInstaller_estado_civil) : null;
    const data_nascimento = b.YDInstaller_data_nascimento || '';
    const fone_tipo = b.YDInstaller_fone_contato_tipo || '';
    const fone_ddd = (b.YDInstaller_fone_contato_ddd || '').toString().trim();
    const fone_num = (b.YDInstaller_fone_contato_num || '').toString().trim();
    const email = (b.YDInstaller_email || '').toString().trim();
    const atuacao = (b.YDInstaller_atuacao || '').toString().trim();
    const igreja = (b.YDInstaller_igreja || '').toString().trim();
    const denominacao = (b.YDInstaller_denominacao || '').toString().trim();
    const pais = (b.YDInstaller_pais || '').toString().trim();

    console.log('[CADASTRO step2] Campos extraídos:', {
      apelido, sexo, estado_civil, data_nascimento, fone_tipo, fone_ddd, fone_num, email, atuacao, igreja, denominacao, pais
    });

    // Validações
    if (!apelido) {
      errors.push('Por favor, preencha o campo "Nome no Crachá"');
    }
    if (!sexo) {
      errors.push('Por favor, preencha o campo "Sexo"');
    }
    if (!estado_civil) {
      errors.push('Por favor, preencha o campo "Estado Civil"');
    }
    if (!data_nascimento) {
      errors.push('Por favor, preencha o campo "Data de Nascimento"');
    }
    if (!fone_tipo) {
      errors.push('Por favor, preencha o campo "Fone para contato em horário comercial"');
    }
    if (!fone_ddd) {
      errors.push('Por favor, preencha o campo "DDD"');
    }
    if (!fone_num) {
      errors.push('Por favor, preencha o campo "Número"');
    }
    if (!email) {
      errors.push('Por favor, preencha o campo "E-mail Pessoal"');
    } else {
      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Por favor, informe um e-mail válido');
      }
    }
    if (!atuacao) {
      errors.push('Por favor, preencha o campo "Área de Atuação"');
    }
    if (!igreja) {
      errors.push('Por favor, preencha o campo "Sua Igreja Local"');
    }
    if (!denominacao) {
      errors.push('Por favor, preencha o campo "Denominação"');
    }
    if (!pais) {
      errors.push('Por favor, preencha o campo "País"');
    }

    console.log('[CADASTRO step2] Erros encontrados:', errors);

    // Se há erros, redirecionar com erros e dados preenchidos
    if (errors.length > 0) {
      console.log('[CADASTRO step2] Redirecionando com erros para step2.html');

      const params = new URLSearchParams();
      params.set('errors', JSON.stringify(errors));

      // Preservar todos os dados preenchidos
      if (apelido) params.set('YDInstaller_apelido', apelido);
      if (sexo) params.set('YDInstaller_sexo', sexo.toString());
      if (estado_civil) params.set('YDInstaller_estado_civil', estado_civil.toString());
      if (data_nascimento) params.set('YDInstaller_data_nascimento', data_nascimento);
      if (fone_tipo) params.set('YDInstaller_fone_contato_tipo', fone_tipo);
      if (fone_ddd) params.set('YDInstaller_fone_contato_ddd', fone_ddd);
      if (fone_num) params.set('YDInstaller_fone_contato_num', fone_num);
      if (email) params.set('YDInstaller_email', email);
      if (atuacao) params.set('YDInstaller_atuacao', atuacao);
      if (igreja) params.set('YDInstaller_igreja', igreja);
      if (denominacao) params.set('YDInstaller_denominacao', denominacao);
      if (pais) params.set('YDInstaller_pais', pais);

      // Preservar campos opcionais também
      const cidade = (b.YDInstaller_cidade || '').toString().trim();
      const uf = (b.YDInstaller_uf || '').toString().trim();
      const mailing = typeof b.YDInstaller_mailing !== 'undefined';

      if (cidade) params.set('YDInstaller_cidade', cidade);
      if (uf) params.set('YDInstaller_uf', uf);
      if (mailing) params.set('YDInstaller_mailing', '1');

      return res.redirect(`/inscricao/eventos/pub/step2.html?${params.toString()}`);
    }

    // Campos relevantes para tabela users - usar novos campos FK
    req.session.cadastro.apelido = apelido;
    req.session.cadastro.sexo_id = sexo; // Campo FK
    req.session.cadastro.data_nascimento = toYYYYMMDD(data_nascimento);
    req.session.cadastro.email = email;
    req.session.cadastro.mailing = typeof b.YDInstaller_mailing !== 'undefined' ? 1 : 0;
    req.session.cadastro.cidade = (b.YDInstaller_cidade || '').toString().trim();
    req.session.cadastro.uf = (b.YDInstaller_uf || '').toString().trim();

    // Telefone
    req.session.cadastro.fone_contato = composeTelefone(
      fone_tipo,
      fone_ddd,
      fone_num
    );

    // Separar campos de telefone
    req.session.cadastro.fone_contato_ddd = fone_ddd;
    req.session.cadastro.fone_contato_num = fone_num;

    // Capturar novos campos diretamente na estrutura principal - usar FK
    req.session.cadastro.estado_civil_id = estado_civil; // Campo FK
    req.session.cadastro.fone_contato_tipo = fone_tipo; // Campo FK (string)
    req.session.cadastro.ocupacao_secular = (b.YDInstaller_natureza || '').toString().trim() || null;
    req.session.cadastro.ocupacao_religiosa = (b.YDInstaller_religiosa || '').toString().trim() || null;
    req.session.cadastro.atuacao = atuacao; // Novo campo da estrutura
    req.session.cadastro.igreja_local = igreja;
    req.session.cadastro.denominacao = denominacao; // Campo FK (string)
    req.session.cadastro.pais = pais;

    // Extras (guardamos para possível uso futuro)
    req.session.cadastro.extras = {
      endereco: b.YDInstaller_endereco || null,
      numero: b.YDInstaller_numero || null,
      complemento: b.YDInstaller_complemento || null,
      bairro: b.YDInstaller_bairro || null,
      cep: b.YDInstaller_cep || null
    };

    // Backup em cookie para Railway - dados completos até step2
    const cadastroData = {
      ...req.session.cadastro,
      step: 2
    };
    res.cookie('cadastro_temp', JSON.stringify(cadastroData), {
      maxAge: 60 * 60 * 1000, // 1 hora
      httpOnly: false,
      secure: false
    });

    return res.redirect('/inscricao/eventos/pub/step3.html');
  } catch (error) {
    console.error('[CADASTRO step2] Erro:', error);

    const params = new URLSearchParams();
    params.set('errors', JSON.stringify(['Erro interno do servidor. Tente novamente.']));

    // Preservar dados preenchidos mesmo em caso de erro interno
    const b = req.body || {};
    if (b.YDInstaller_apelido) params.set('YDInstaller_apelido', b.YDInstaller_apelido.toString().trim());
    if (b.YDInstaller_sexo) params.set('YDInstaller_sexo', b.YDInstaller_sexo.toString());
    if (b.YDInstaller_estado_civil) params.set('YDInstaller_estado_civil', b.YDInstaller_estado_civil.toString());
    if (b.YDInstaller_data_nascimento) params.set('YDInstaller_data_nascimento', b.YDInstaller_data_nascimento.toString());
    if (b.YDInstaller_fone_contato_tipo) params.set('YDInstaller_fone_contato_tipo', b.YDInstaller_fone_contato_tipo.toString());
    if (b.YDInstaller_fone_contato_ddd) params.set('YDInstaller_fone_contato_ddd', b.YDInstaller_fone_contato_ddd.toString().trim());
    if (b.YDInstaller_fone_contato_num) params.set('YDInstaller_fone_contato_num', b.YDInstaller_fone_contato_num.toString().trim());
    if (b.YDInstaller_email) params.set('YDInstaller_email', b.YDInstaller_email.toString().trim());
    if (b.YDInstaller_atuacao) params.set('YDInstaller_atuacao', b.YDInstaller_atuacao.toString().trim());
    if (b.YDInstaller_igreja) params.set('YDInstaller_igreja', b.YDInstaller_igreja.toString().trim());
    if (b.YDInstaller_denominacao) params.set('YDInstaller_denominacao', b.YDInstaller_denominacao.toString().trim());
    if (b.YDInstaller_pais) params.set('YDInstaller_pais', b.YDInstaller_pais.toString().trim());
    if (b.YDInstaller_cidade) params.set('YDInstaller_cidade', b.YDInstaller_cidade.toString().trim());
    if (b.YDInstaller_uf) params.set('YDInstaller_uf', b.YDInstaller_uf.toString().trim());
    if (typeof b.YDInstaller_mailing !== 'undefined') params.set('YDInstaller_mailing', '1');

    return res.redirect(`/inscricao/eventos/pub/step2.html?${params.toString()}`);
  }
};

// POST /cadastro/step3
const cadastroStep3 = async (req, res) => {
  try {
    console.log('[CADASTRO step3] Iniciando processamento...');
    console.log('[CADASTRO step3] Body recebido:', JSON.stringify(req.body, null, 2));
    console.log('[CADASTRO step3] Sessão antes processamento:', JSON.stringify(req.session.cadastro, null, 2));

    const b = req.body || {};
    req.session.cadastro = req.session.cadastro || {};

    // Verificar se temos dados mínimos necessários dos passos anteriores
    if (!req.session.cadastro || !req.session.cadastro.nome || !req.session.cadastro.cpf_cnpj) {
      console.warn('[CADASTRO step3] Sessão vazia ou incompleta, tentando recuperar do cookie...');

      // Tentar recuperar do cookie primeiro
      const cadastroCookie = req.cookies.cadastro_temp;
      if (cadastroCookie) {
        try {
          const dadosCookie = JSON.parse(cadastroCookie);
          console.log('[CADASTRO step3] Dados recuperados do cookie:', JSON.stringify(dadosCookie, null, 2));

          // Restaurar dados na sessão
          req.session.cadastro = dadosCookie;

          // Verificar novamente se tem os dados necessários
          if (!req.session.cadastro.nome || !req.session.cadastro.cpf_cnpj) {
            console.error('[CADASTRO step3] Cookie também não tem dados suficientes:', {
              nome: req.session.cadastro.nome,
              cpf_cnpj: req.session.cadastro.cpf_cnpj
            });
            const params = new URLSearchParams();
            params.set('errors', JSON.stringify(['Dados de cadastro incompletos. Por favor, inicie novamente o processo de cadastro.']));
            return res.redirect(`/inscricao/eventos/pub/step1.html?${params.toString()}`);
          }
        } catch (e) {
          console.error('[CADASTRO step3] Erro ao ler cookie:', e);
          const params = new URLSearchParams();
          params.set('errors', JSON.stringify(['Erro na recuperação de dados. Por favor, inicie o cadastro novamente.']));
          return res.redirect(`/inscricao/eventos/pub/step1.html?${params.toString()}`);
        }
      } else {
        console.error('[CADASTRO step3] ERRO: Dados obrigatórios não encontrados na sessão nem no cookie');
        console.error('[CADASTRO step3] Estado da sessão:', req.session);
        console.error('[CADASTRO step3] Cookies disponíveis:', Object.keys(req.cookies || {}));
        const params = new URLSearchParams();
        params.set('errors', JSON.stringify(['Dados do cadastro foram perdidos. Por favor, reinicie o processo de cadastro.']));
        return res.redirect(`/inscricao/eventos/pub/step1.html?${params.toString()}`);
      }
    }

    console.log('[CADASTRO step3] Body recebido:', JSON.stringify(b, null, 2));
    console.log('[CADASTRO step3] Sessão atual:', JSON.stringify(req.session.cadastro, null, 2));

    // Coleta pesquisas/observações
    const divulgacao_social = b['YDInstaller_divulgacao_social[]'] || b.YDInstaller_divulgacao_social || [];
    const divulgacao_meios = b['YDInstaller_divulgacao_meios[]'] || b.YDInstaller_divulgacao_meios || [];
    const obs = (b.YDInstaller_obs || '').toString().trim();
    const arr = (v) => Array.isArray(v) ? v : (v ? [v] : []);

    // Adicionar campos de pesquisa na estrutura principal - usar novos campos JSONB
    req.session.cadastro.divulgacao_social = arr(divulgacao_social); // JSONB array
    req.session.cadastro.divulgacao_meios = arr(divulgacao_meios); // JSONB array
    req.session.cadastro.como_soube = obs || null; // Novo campo

    req.session.cadastro.extras = {
      ...(req.session.cadastro.extras || {}),
      divulgacao_social: arr(divulgacao_social),
      divulgacao_meios: arr(divulgacao_meios),
      obs
    };

    // Monta payload para Supabase (tabela users) - usar nova estrutura FK
    const payload = {
      // Remover ID para garantir criação de novo usuário
      cpf_cnpj: req.session.cadastro.cpf_cnpj || null,
      data_nascimento: req.session.cadastro.data_nascimento || null, // Será convertido para 'nascimento'
      nome: req.session.cadastro.nome || null,
      apelido: req.session.cadastro.apelido || null,
      email: req.session.cadastro.email || null,
      fone_contato: req.session.cadastro.fone_contato || null,
      fone_contato_ddd: req.session.cadastro.fone_contato_ddd || null,
      fone_contato_num: req.session.cadastro.fone_contato_num || null,
      // Usar campos FK da nova estrutura
      sexo_id: req.session.cadastro.sexo_id || null,
      estado_civil_id: req.session.cadastro.estado_civil_id || null,
      fone_contato_tipo: req.session.cadastro.fone_contato_tipo || null, // String FK
      denominacao: req.session.cadastro.denominacao || null, // String FK
      denominacao_texto: req.session.cadastro.denominacao_texto || req.session.cadastro.denominacao || null, // Backup
      ocupacao_id: req.session.cadastro.ocupacao_id || null, // Integer FK
      ocupacao_secular: req.session.cadastro.ocupacao_secular || null, // Para mapeamento
      pais: req.session.cadastro.pais || null,
      cidade: req.session.cadastro.cidade || null,
      uf: req.session.cadastro.uf || null,
      mailing: typeof req.session.cadastro.mailing === 'number' ? req.session.cadastro.mailing : 1,
      level: 0, // SEMPRE 0 para novos usuários
      parceiro: '0',
      // Novos campos da estrutura
      igreja_local: req.session.cadastro.igreja_local || null,
      atuacao: req.session.cadastro.atuacao || null,
      como_soube: req.session.cadastro.como_soube || null,
      divulgacao_social: req.session.cadastro.divulgacao_social || null, // JSONB
      divulgacao_meios: req.session.cadastro.divulgacao_meios || null, // JSONB
      // Campos de compatibilidade (híbridos)
      ocupacao_natureza: req.session.cadastro.ocupacao_secular || null,
      ocupacao_religiosa: req.session.cadastro.ocupacao_religiosa || null
    };

    console.log('[CADASTRO step3] Payload montado:', JSON.stringify(payload, null, 2));

    // DEBUG específico para campos problemáticos
    console.log('[CADASTRO step3] === DEBUG CAMPOS ESPECÍFICOS ===');
    console.log('[CADASTRO step3] level no payload:', payload.level, typeof payload.level);
    console.log('[CADASTRO step3] denominacao no payload:', payload.denominacao);
    console.log('[CADASTRO step3] denominacao_texto no payload:', payload.denominacao_texto);
    console.log('[CADASTRO step3] ocupacao_id no payload:', payload.ocupacao_id);
    console.log('[CADASTRO step3] ocupacao_secular no payload:', payload.ocupacao_secular);
    console.log('[CADASTRO step3] === FIM DEBUG ===');

    const supabaseService = require('./supabase');

    // SEMPRE CRIAR NOVO USUÁRIO - não fazer update
    console.log('[CADASTRO step3] Criando novo usuário no Supabase...');
    console.log('[CADASTRO step3] URL Supabase:', process.env.SUPABASE_URL ? '[CONFIGURADO]' : '[NÃO CONFIGURADO]');
    console.log('[CADASTRO step3] Key Supabase:', process.env.SUPABASE_ANON_KEY ? '[CONFIGURADO]' : '[NÃO CONFIGURADO]');

    let user;
    try {
      user = await supabaseService.createUser(payload);
      console.log('[CADASTRO step3] Usuário criado com sucesso:', {
        id: user.id,
        nome: user.nome,
        email: user.email
      });
    } catch (dbError) {
      console.error('[CADASTRO step3] ERRO ao salvar no Supabase:', {
        message: dbError.message,
        code: dbError.code,
        details: dbError.details,
        hint: dbError.hint
      });

      // Erro específico do Supabase
      const params = new URLSearchParams();
      params.set('errors', JSON.stringify([
        'Erro ao salvar dados no banco. Por favor, tente novamente.',
        'Se o problema persistir, entre em contato com o suporte.'
      ]));

      // Preservar dados do step3
      const b = req.body || {};
      const divulgacao_social = b['YDInstaller_divulgacao_social[]'] || b.YDInstaller_divulgacao_social || [];
      const divulgacao_meios = b['YDInstaller_divulgacao_meios[]'] || b.YDInstaller_divulgacao_meios || [];
      const obs = (b.YDInstaller_obs || '').toString().trim();

      if (Array.isArray(divulgacao_social) && divulgacao_social.length > 0) {
        divulgacao_social.forEach(item => {
          params.append('YDInstaller_divulgacao_social[]', item);
        });
      }
      if (Array.isArray(divulgacao_meios) && divulgacao_meios.length > 0) {
        divulgacao_meios.forEach(item => {
          params.append('YDInstaller_divulgacao_meios[]', item);
        });
      }
      if (obs) params.set('YDInstaller_obs', obs);

      return res.redirect(`/inscricao/eventos/pub/step3.html?${params.toString()}`);
    }

    // Persistir detalhes extras da inscrição por evento (não bloqueia fluxo se falhar)
    try {
      const ev = req.session.cadastro.ev || 'pub';
      const ex = req.session.cadastro.extras || {};
      await supabaseService.upsertEnrollmentDetails({
        user_id: user.id,
        ev: ev,
        // Dados do formulário salvos nos extras
        igreja: req.session.cadastro.igreja_local || null,
        denominacao: req.session.cadastro.denominacao || null,
        natureza: req.session.cadastro.ocupacao_secular || null,
        atuacao: req.session.cadastro.area_de_atuacao || null,
        estado_civil: req.session.cadastro.estado_civil || null,
        pais: req.session.cadastro.pais || null,
        ocupacao_religiosa: req.session.cadastro.ocupacao_religiosa || null,
        fone_tipo: req.session.cadastro.fone_tipo || null,
        endereco: ex.endereco || null,
        numero: ex.numero || null,
        complemento: ex.complemento || null,
        bairro: ex.bairro || null,
        cep: ex.cep || null,
        divulgacao_social: ex.divulgacao_social || [],
        divulgacao_meios: ex.divulgacao_meios || [],
        obs: ex.obs || null,
        observacoes: req.session.cadastro.observacoes || null,
        pesquisa1: req.session.cadastro.pesquisa1 || null,
        pesquisa2: req.session.cadastro.pesquisa2 || null
      });
    } catch (e) {
      console.warn('[CADASTRO step3] Aviso: detalhes de inscrição não persistidos:', e.message);
    }

    // Define cookies de usuário e inscrição compatíveis com legado
    const sessionId = generateMD5Hash(Date.now().toString() + Math.random().toString());
    const cookieOptions = {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: false,
      secure: false,
      path: '/',
      sameSite: 'lax'
    };

    const userCookie = createBiblos360Cookie({
      id: user.id,
      nome: user.nome,
      email: user.email || `user${user.id}@biblos360.com`,
      cpf_cnpj: user.cpf_cnpj,
      apelido: user.apelido || (user.nome ? user.nome.split(' ')[0] : 'Usuário'),
      level: user.level || 0,
      situacao: user.situacao || 2,
      cidade: user.cidade || '',
      uf: user.uf || '',
      mailing: user.mailing ? 1 : 0
    });

    const inscricaoCookie = createBiblos360Cookie({
      id: sessionId,
      user_id: user.id,
      ev: req.session.cadastro.ev || 'pub',
      acesso: new Date().toISOString().slice(0, 10),
      situacao: '2'
    });

    // Limpa cookies antigos
    res.clearCookie('biblos360_site_usuario');
    res.clearCookie('biblos360_site_inscrito');
    res.clearCookie('biblos360_admin_usuario');
    res.clearCookie('biblos360_admin_inscrito');

    // Seta novos cookies
    res.cookie('biblos360_site_usuario', userCookie, cookieOptions);
    res.cookie('biblos360_site_inscrito', inscricaoCookie, cookieOptions);

    // ========================================
    // ADICIONAR AO PARTICIPANTES.JSON
    // ========================================
    try {
      console.log('[CADASTRO step3] Atualizando participantes.json...');
      const participantsPath = path.join(__dirname, '../../../api/participantes.json');
      console.log('[CADASTRO step3] Caminho do arquivo:', participantsPath);

      // Ler arquivo atual
      let participants = [];
      try {
        const data = await fs.readFile(participantsPath, 'utf8');
        participants = JSON.parse(data);
        console.log(`[CADASTRO step3] Arquivo lido com ${participants.length} participantes existentes`);
      } catch (error) {
        console.warn('[CADASTRO step3] Arquivo participantes.json não existe ou está vazio, criando novo...');
        participants = [];
      }

      // Verificar se usuário já existe
      const userId = parseInt(user.id);
      const existingParticipant = participants.find(p => p.id === userId);

      if (!existingParticipant) {
        // Criar novo participante com dados padrão (usar apenas apelido)
        const newParticipant = {
          id: userId,
          nick: user.apelido || user.nome.split(' ')[0], // Usar apelido primeiro, depois primeiro nome
          level: 0,           // PADRÁO: participante
          equipe: null,       // PADRÁO: sem equipe
          sexo: user.sexo || null,
          uf: user.uf || null,
          parceiro: req.session.cadastro?.parceiro || "0",
          turma: null,        // PADRÁO: sem turma
          grupo: null,        // PADRÁO: sem grupo
          rede: null          // PADRÁO: sem rede
        };

        participants.push(newParticipant);

        // Salvar arquivo atualizado
        await fs.writeFile(participantsPath, JSON.stringify(participants, null, 2), 'utf8');

        console.log(`✅ Usuário ${newParticipant.nick} (${userId}) adicionado ao participantes.json`);
      } else {
        console.log(`ℹ️  Usuário ${userId} já existe no participantes.json`);
      }

    } catch (error) {
      console.error('❌ Erro ao atualizar participantes.json:', {
        message: error.message,
        code: error.code,
        path: error.path
      });
      // NÁO quebrar o fluxo - continuar mesmo com erro no arquivo JSON
      console.warn('⚠️ Continuando cadastro apesar do erro no participantes.json');
    }

    // Limpa a sessão temporária de cadastro
    req.session.cadastro = null;

    // Limpa o cookie temporário de cadastro
    res.clearCookie('cadastro_temp');

    console.log('[CADASTRO step3] ✅ CADASTRO FINALIZADO COM SUCESSO!');
    console.log('[CADASTRO step3] Usuário criado:', {
      id: user.id,
      nome: user.nome,
      email: user.email,
      cpf_cnpj: user.cpf_cnpj
    });
    console.log('[CADASTRO step3] Redirecionando para página de sucesso...');

    // Redireciona para página de sucesso estática
    return res.redirect('/inscricao/eventos/pub/inscrito.html');
  } catch (error) {
    console.error('[CADASTRO step3] ❌ ERRO GERAL NO CADASTRO:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    console.error('[CADASTRO step3] Sessão atual no erro:', JSON.stringify(req.session.cadastro, null, 2));
    console.error('[CADASTRO step3] Cookies disponíveis:', Object.keys(req.cookies || {}));

    // Erro genérico - pode ser qualquer coisa
    const params = new URLSearchParams();
    params.set('errors', JSON.stringify([
      'Erro interno no servidor durante o cadastro.',
      'Por favor, tente novamente. Se o problema persistir, entre em contato com o suporte.'
    ]));

    // Preservar dados preenchidos mesmo em caso de erro interno
    const b = req.body || {};

    // Preservar pesquisas/observações do step3
    const divulgacao_social = b['YDInstaller_divulgacao_social[]'] || b.YDInstaller_divulgacao_social || [];
    const divulgacao_meios = b['YDInstaller_divulgacao_meios[]'] || b.YDInstaller_divulgacao_meios || [];
    const obs = (b.YDInstaller_obs || '').toString().trim();

    if (Array.isArray(divulgacao_social) && divulgacao_social.length > 0) {
      divulgacao_social.forEach(item => {
        params.append('YDInstaller_divulgacao_social[]', item);
      });
    } else if (divulgacao_social) {
      params.set('YDInstaller_divulgacao_social', divulgacao_social.toString());
    }

    if (Array.isArray(divulgacao_meios) && divulgacao_meios.length > 0) {
      divulgacao_meios.forEach(item => {
        params.append('YDInstaller_divulgacao_meios[]', item);
      });
    } else if (divulgacao_meios) {
      params.set('YDInstaller_divulgacao_meios', divulgacao_meios.toString());
    }

    if (obs) params.set('YDInstaller_obs', obs);

    return res.redirect(`/inscricao/eventos/pub/step3.html?${params.toString()}`);
  }
};

// POST /oracao/enviar
const enviarPedidoOracao = async (req, res) => {
  try {
    console.log('[PEDIDO ORAÇÃO] Body recebido:', JSON.stringify(req.body, null, 2));

    const b = req.body || {};

    // Validações obrigatórias
    const errors = [];

    // Campos obrigatórios
    const nome = (b.YDInstaller_apelido || '').toString().trim();
    const fone_tipo = b.YDInstaller_fone_contato_tipo || '';
    const fone_ddd = (b.YDInstaller_fone_contato_ddd || '').toString().trim();
    const fone_num = (b.YDInstaller_fone_contato_num || '').toString().trim();
    const email = (b.YDInstaller_email || '').toString().trim();
    const motivo_oracao = (b.YDInstaller_igreja || '').toString().trim();

    console.log('[PEDIDO ORAÇÃO] Campos extraídos:', {
      nome, fone_tipo, fone_ddd, fone_num, email, motivo_oracao
    });

    // Validações
    if (!nome) {
      errors.push('Por favor, preencha o campo "Nome"');
    }
    if (!fone_tipo) {
      errors.push('Por favor, selecione o tipo de telefone');
    }
    if (!fone_ddd) {
      errors.push('Por favor, preencha o campo "DDD"');
    }
    if (!fone_num) {
      errors.push('Por favor, preencha o campo "Número"');
    }
    if (!email) {
      errors.push('Por favor, preencha o campo "E-mail Pessoal"');
    } else {
      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Por favor, informe um e-mail válido');
      }
    }
    if (!motivo_oracao) {
      errors.push('Por favor, preencha o campo "Motivo(s) de Oração"');
    }

    // Se há erros, retorna para o formulário
    if (errors.length > 0) {
      console.log('[PEDIDO ORAÇÃO] Erros de validação:', errors);
      const params = new URLSearchParams();
      params.set('errors', JSON.stringify(errors));

      // Preservar dados preenchidos
      if (nome) params.set('YDInstaller_apelido', nome);
      if (fone_tipo) params.set('YDInstaller_fone_contato_tipo', fone_tipo);
      if (fone_ddd) params.set('YDInstaller_fone_contato_ddd', fone_ddd);
      if (fone_num) params.set('YDInstaller_fone_contato_num', fone_num);
      if (email) params.set('YDInstaller_email', email);
      if (motivo_oracao) params.set('YDInstaller_igreja', motivo_oracao);

      return res.redirect(`/oracao/pedido.html?${params.toString()}`);
    }

    // Montar dados do pedido
    const pedidoData = {
      nome,
      telefone: `(${fone_ddd}) ${fone_num}`,
      tipo_telefone: fone_tipo,
      email,
      motivo_oracao,
      data_envio: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress
    };

    console.log('[PEDIDO ORAÇÃO] Dados do pedido:', pedidoData);

    // Salvar no arquivo JSON para backup
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const pedidosPath = path.join(__dirname, '../../../api/pedidos_oracao.json');

      let pedidos = [];
      try {
        const data = await fs.readFile(pedidosPath, 'utf8');
        pedidos = JSON.parse(data);
      } catch (error) {
        console.log('[PEDIDO ORAÇÃO] Arquivo de pedidos não existe, criando novo...');
        pedidos = [];
      }

      pedidos.push(pedidoData);
      await fs.writeFile(pedidosPath, JSON.stringify(pedidos, null, 2), 'utf8');
      console.log('[PEDIDO ORAÇÃO] Pedido salvo no arquivo JSON');
    } catch (error) {
      console.error('[PEDIDO ORAÇÃO] Erro ao salvar no arquivo:', error);
    }

    // Enviar email usando o serviço de email
    try {
      const { enviarEmail } = require('./services');

      const emailContent = `
NOVO PEDIDO DE ORAÇÃO - BIBLOS360

Nome: ${nome}
Telefone: ${pedidoData.telefone} (${fone_tipo})
E-mail: ${email}
Data/Hora: ${new Date().toLocaleString('pt-BR')}

MOTIVO(S) DE ORAÇÃO:
${motivo_oracao}

---
IP: ${pedidoData.ip}
Enviado via formulário Biblos360
      `.trim();

      console.log('[PEDIDO ORAÇÃO] Tentando enviar email...');
      const emailResult = await enviarEmail(
        'biblos360net@gmail.com',
        `Novo Pedido de Oração - ${nome}`,
        emailContent
      );

      if (emailResult.success) {
        console.log('[PEDIDO ORAÇÃO] ✅ Email enviado com sucesso:', emailResult.messageId);
      } else {
        console.error('[PEDIDO ORAÇÃO] ❌ Falha no envio de email:', emailResult.error);
      }

    } catch (error) {
      console.error('[PEDIDO ORAÇÃO] Erro ao enviar email:', error);
      // Não falha o processo se o email não foi enviado
    }

    console.log('[PEDIDO ORAÇÃO] ✅ PEDIDO ENVIADO COM SUCESSO!');

    // Redireciona para página de sucesso
    return res.redirect(`/oracao/sucesso?nome=${encodeURIComponent(nome)}`);

  } catch (error) {
    console.error('[PEDIDO ORAÇÃO] ❌ ERRO GERAL:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Erro genérico
    const params = new URLSearchParams();
    params.set('errors', JSON.stringify([
      'Erro interno no servidor ao enviar pedido de oração.',
      'Por favor, tente novamente. Se o problema persistir, entre em contato conosco.'
    ]));

    return res.redirect(`/oracao/pedido.html?${params.toString()}`);
  }
};

// GET /oracao/sucesso
const paginaSucessoPedidoOracao = async (req, res) => {
  try {
    const { renderPedidoOracaoSucesso } = require('./errors');
    const nome = req.query.nome || '';

    const html = renderPedidoOracaoSucesso({ nome });
    res.send(html);

  } catch (error) {
    console.error('[PEDIDO ORAÇÃO] Erro ao exibir página de sucesso:', error);
    res.redirect('/oracao/pedido.html');
  }
};

/**
 * Lista todos os usuários (apenas para uso via TIM)
 */
const getUsers = async (req, res) => {
  try {
    console.log('[API] Buscando todos os usuários...');
    const supabaseService = require('./supabase');

    // Busca todos os usuários na tabela api.users (sem limite para mostrar todos)
    const result = await supabaseService.getAllUsers(1000);

    console.log(`[API] Retornando ${result.users.length} usuários encontrados`);

    res.json({
      users: result.users,
      total: result.total,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Erro ao buscar usuários:', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar a lista de usuários',
      timestamp: new Date().toISOString()
    });
  }
};

// ========================================
// SEÇÁO 5: ANALYTICS E RELATÓRIOS
// ========================================
const updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userData = req.body;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        error: 'ID de usuário inválido',
        message: 'O ID deve ser um número válido',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`[API] Atualizando usuário ID: ${userId}...`, userData);
    const supabaseService = require('./supabase');

    // Verificar se o usuário existe antes de tentar atualizar
    const existingUser = await supabaseService.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: `Usuário com ID ${userId} não existe`,
        timestamp: new Date().toISOString()
      });
    }

    // Preparar dados para atualização
    const updateData = {
      nome: userData.nome || existingUser.nome,
      apelido: userData.apelido || existingUser.apelido,
      email: userData.email || existingUser.email,
      cpf_cnpj: userData.cpf_cnpj || existingUser.cpf_cnpj,
      data_nascimento: userData.data_nascimento || existingUser.data_nascimento,
      sexo: userData.sexo !== undefined ? parseInt(userData.sexo) || null : existingUser.sexo,
      estado_civil: userData.estado_civil !== undefined ? parseInt(userData.estado_civil) || null : existingUser.estado_civil,
      telefone: userData.telefone || existingUser.telefone,
      pais: userData.pais || existingUser.pais,
      cidade: userData.cidade || existingUser.cidade,
      uf: userData.uf || existingUser.uf,
      ocupacao_secular: userData.ocupacao_secular || existingUser.ocupacao_secular,
      ocupacao_religiosa: userData.ocupacao_religiosa || existingUser.ocupacao_religiosa,
      area_de_atuacao: userData.area_de_atuacao || existingUser.area_de_atuacao,
      igreja_local: userData.igreja_local || existingUser.igreja_local,
      denominacao: userData.denominacao || existingUser.denominacao,
      level: userData.level !== undefined ? parseInt(userData.level) || 0 : existingUser.level,
      situacao: userData.situacao !== undefined ? parseInt(userData.situacao) || 0 : existingUser.situacao,
      mailing: userData.mailing !== undefined ? parseInt(userData.mailing) || 0 : existingUser.mailing,
      observacoes: userData.observacoes || existingUser.observacoes,
      updated_at: new Date().toISOString()
    };

    // Executar atualização
    const updatedUser = await supabaseService.updateUser(userId, updateData);

    console.log(`[API] Usuário ${updateData.nome} (ID: ${userId}) atualizado com sucesso`);

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: updatedUser,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Erro ao atualizar usuário:', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível atualizar o usuário',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Remover usuário da sala virtual (participants.json apenas)
 */
const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        error: 'ID de usuário inválido',
        message: 'O ID deve ser um número válido',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`[API] Removendo usuário ID: ${userId} da sala virtual...`);
    const supabaseService = require('./supabase');
    const fs = require('fs').promises;
    const path = require('path');

    // Verificar se o usuário existe no banco
    const existingUser = await supabaseService.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: `Usuário com ID ${userId} não existe`,
        timestamp: new Date().toISOString()
      });
    }

    // Remover usuário do participants.json
    const participantsPath = path.join(__dirname, '../../../api/participantes.json');

    try {
      let participants = [];

      // Ler arquivo de participantes atual
      try {
        const participantsData = await fs.readFile(participantsPath, 'utf8');
        participants = JSON.parse(participantsData);
      } catch (readError) {
        console.warn('[API] Arquivo participantes.json não encontrado ou inválido, assumindo lista vazia');
        participants = [];
      }

      // Verificar se usuário está na lista
      const userIndex = participants.findIndex(p => p.id === userId);

      if (userIndex === -1) {
        return res.status(404).json({
          error: 'Usuário não encontrado na sala',
          message: `Usuário ${existingUser.nome} (ID: ${userId}) não está na sala virtual`,
          timestamp: new Date().toISOString()
        });
      }

      // Remover usuário da lista
      const removedUser = participants.splice(userIndex, 1)[0];

      // Salvar arquivo atualizado
      await fs.writeFile(participantsPath, JSON.stringify(participants, null, 2), 'utf8');

      console.log(`[API] Usuário ${existingUser.nome} (ID: ${userId}) removido da sala virtual`);

      res.json({
        success: true,
        message: 'Usuário removido da sala virtual com sucesso',
        removed_user: {
          id: userId,
          nome: existingUser.nome,
          nick: removedUser.nick || existingUser.apelido,
          email: existingUser.email
        },
        timestamp: new Date().toISOString()
      });

    } catch (fileError) {
      throw new Error(`Erro ao manipular participantes.json: ${fileError.message}`);
    }

  } catch (error) {
    console.error('[API] Erro ao remover usuário da sala:', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível remover o usuário da sala',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Incluir usuário na sala virtual (adicionar ao participants.json)
 */
const includeUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        error: 'ID de usuário inválido',
        message: 'O ID deve ser um número válido',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`[API] Incluindo usuário ID: ${userId} na sala virtual...`);
    const supabaseService = require('./supabase');
    const fs = require('fs').promises;
    const path = require('path');

    // Verificar se o usuário existe no banco
    const existingUser = await supabaseService.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: `Usuário com ID ${userId} não existe`,
        timestamp: new Date().toISOString()
      });
    }

    // Adicionar usuário ao participants.json
    const participantsPath = path.join(__dirname, '../../../api/participantes.json');

    try {
      let participants = [];

      // Ler arquivo de participantes atual
      try {
        const participantsData = await fs.readFile(participantsPath, 'utf8');
        participants = JSON.parse(participantsData);
      } catch (readError) {
        console.warn('[API] Arquivo participantes.json não encontrado ou inválido, criando novo');
        participants = [];
      }

      // Verificar se usuário já está na lista
      const existingParticipant = participants.find(p => p.id === userId);

      if (existingParticipant) {
        return res.status(400).json({
          error: 'Usuário já está na sala',
          message: `Usuário ${existingUser.nome} (ID: ${userId}) já está na sala virtual`,
          timestamp: new Date().toISOString()
        });
      }

      // Criar objeto participante baseado nos dados do usuário
      const newParticipant = {
        id: userId,
        nick: existingUser.apelido || (existingUser.nome ? existingUser.nome.split(' ')[0] : 'Usuário'),
        level: existingUser.level || 0,
        equipe: existingUser.equipe || 'Biblos360',
        sexo: existingUser.sexo || 1,
        uf: existingUser.uf || 'SP',
        parceiro: existingUser.parceiro || '0',
        turma: existingUser.turma || null,
        grupo: existingUser.grupo || null,
        rede: existingUser.rede || null
      };

      // Adicionar usuário à lista
      participants.push(newParticipant);

      // Salvar arquivo atualizado
      await fs.writeFile(participantsPath, JSON.stringify(participants, null, 2), 'utf8');

      console.log(`[API] Usuário ${existingUser.nome} (ID: ${userId}) incluído na sala virtual`);

      res.json({
        success: true,
        message: 'Usuário incluído na sala virtual com sucesso',
        included_user: {
          id: userId,
          nome: existingUser.nome,
          nick: newParticipant.nick,
          email: existingUser.email,
          level: newParticipant.level
        },
        participants_total: participants.length,
        timestamp: new Date().toISOString()
      });

    } catch (fileError) {
      throw new Error(`Erro ao manipular participantes.json: ${fileError.message}`);
    }

  } catch (error) {
    console.error('[API] Erro ao incluir usuário na sala:', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível incluir o usuário na sala',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Inserir robôs (usuários fantasmas) na sala virtual
 */
const insertBots = async (req, res) => {
  try {
    const { bots } = req.body;

    if (!bots || !Array.isArray(bots) || bots.length === 0) {
      return res.status(400).json({
        error: 'Lista de robôs inválida',
        message: 'É necessário fornecer uma lista válida de robôs',
        timestamp: new Date().toISOString()
      });
    }

    if (bots.length > 50) {
      return res.status(400).json({
        error: 'Limite excedido',
        message: 'Máximo de 50 robôs por requisição',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`[TIM-BOTS] Inserindo ${bots.length} robôs na sala virtual...`);

    const fs = require('fs').promises;
    const path = require('path');
    const participantsPath = path.join(__dirname, '../../../api/participantes.json');

    try {
      let participants = [];

      // Ler arquivo de participantes atual
      try {
        const participantsData = await fs.readFile(participantsPath, 'utf8');
        participants = JSON.parse(participantsData);
      } catch (readError) {
        console.warn('[TIM-BOTS] Arquivo participantes.json não encontrado ou inválido, criando novo');
        participants = [];
      }

      // Validar e adicionar robôs
      let insertedCount = 0;
      const validatedBots = [];

      for (const bot of bots) {
        // Garantir que o ID seja numérico e comece com 99
        const botId = parseInt(bot.id);

        if (!botId || !botId.toString().startsWith('99')) {
          console.warn(`[TIM-BOTS] ID inválido para robô ${bot.nick}: ${bot.id}`);
          continue;
        }

        // Verificar se já existe um participante com este ID
        const existingBot = participants.find(p => p.id === botId);
        if (!existingBot) {
          // Validar estrutura do robô com dados similares a usuários reais
          const validBot = {
            id: botId,
            nick: bot.nick || 'Robô',
            level: 0,           // Robôs começam como participantes comuns
            equipe: null,       // Sem equipe específica
            sexo: bot.sexo || 1,
            uf: bot.uf || 'SP',
            parceiro: '0',      // Não é parceiro
            turma: null,        // Sem turma específica
            grupo: null,        // Sem grupo específico
            rede: null          // Sem rede específica
          };

          participants.push(validBot);
          validatedBots.push(validBot);
          insertedCount++;
          console.log(`[TIM-BOTS] Robô ${validBot.nick} (${validBot.id}) adicionado`);
        } else {
          console.log(`[TIM-BOTS] Robô ${botId} já existe, pulando...`);
        }
      }

      // Salvar arquivo atualizado
      await fs.writeFile(participantsPath, JSON.stringify(participants, null, 2), 'utf8');

      // Emitir eventos Socket.IO para atualizar a sala em tempo real
      try {
        const { getIO } = require('./server');
        const io = getIO();

        if (io && insertedCount > 0) {
          // Definir sala padrão (pode ser parametrizada no futuro)
          const roomId = 'pub';

          // Marcar robôs como "online" permanentemente na memória
          const { addUserToOnlineList } = require('./handlers');
          for (const bot of validatedBots) {
            // Adicionar à lista de usuários online sem Socket.IO real
            addUserToOnlineList(roomId, bot.id.toString(), false, null);
            console.log(`[TIM-BOTS] Robô ${bot.nick} (${bot.id}) marcado como online na sala ${roomId}`);
          }

          // INVALIDAR CACHE antes de recarregar
          const { invalidateParticipantsCache } = require('./handlers');
          invalidateParticipantsCache(roomId);

          // Recarregar e enviar lista atualizada para todos os clientes
          const { loadParticipants, formatUsersList, calculateDetailedUserCounts } = require('./handlers');
          const [updatedParticipants, detailedCounts] = await Promise.all([
            loadParticipants(roomId),
            calculateDetailedUserCounts(roomId)
          ]);

          const formattedUsers = formatUsersList(updatedParticipants, roomId);

          // Emitir MÚLTIPLOS eventos para garantir compatibilidade
          io.to(roomId).emit('user-list', formattedUsers);
          io.to(roomId).emit('user-count', detailedCounts);
          io.to(roomId).emit('participants-updated', formattedUsers); // Evento adicional
          io.to(roomId).emit('bots-inserted', { count: insertedCount, bots: validatedBots }); // Evento específico

          // Emitir também para sala global (compatibility)
          io.emit('global-user-count', detailedCounts);

          console.log(`[TIM-BOTS] Eventos Socket.IO enviados para sala ${roomId} com ${insertedCount} novos robôs`);
        }
      } catch (socketError) {
        console.warn('[TIM-BOTS] Erro ao emitir eventos Socket.IO:', socketError.message);
        // Não quebrar o fluxo - robôs foram inseridos com sucesso
      }

      console.log(`[TIM-BOTS] ${insertedCount} robôs inseridos com sucesso. Total de participantes: ${participants.length}`);

      res.json({
        success: true,
        message: `${insertedCount} robôs inseridos com sucesso`,
        inserted_count: insertedCount,
        total_participants: participants.length,
        bots_added: validatedBots.map(bot => ({ id: bot.id, nick: bot.nick })),
        timestamp: new Date().toISOString()
      });

    } catch (fileError) {
      throw new Error(`Erro ao manipular participantes.json: ${fileError.message}`);
    }

  } catch (error) {
    console.error('[TIM-BOTS] Erro ao inserir robôs:', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível inserir os robôs',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Remover todos os robôs da sala virtual
 * Remove robôs com IDs que começam com "99" e os remove da lista online
 */
const removeBots = async (req, res) => {
  try {
    console.log('[TIM-BOTS] Removendo todos os robôs da sala virtual...');

    const fs = require('fs').promises;
    const path = require('path');
    const participantsPath = path.join(__dirname, '../../../api/participantes.json');

    try {
      let participants = [];

      // Ler arquivo de participantes atual
      try {
        const participantsData = await fs.readFile(participantsPath, 'utf8');
        participants = JSON.parse(participantsData);
      } catch (readError) {
        console.warn('[TIM-BOTS] Arquivo participantes.json não encontrado ou inválido');
        return res.json({
          success: true,
          message: 'Nenhum robô encontrado para remover',
          removed_count: 0,
          total_participants: 0,
          timestamp: new Date().toISOString()
        });
      }

      // Filtrar robôs (IDs que começam com '99')
      const originalCount = participants.length;
      const botsToRemove = participants.filter(p => String(p.id).startsWith('99'));
      const filteredParticipants = participants.filter(p => !String(p.id).startsWith('99'));
      const removedCount = originalCount - filteredParticipants.length;

      // Salvar arquivo atualizado
      await fs.writeFile(participantsPath, JSON.stringify(filteredParticipants, null, 2), 'utf8');

      // Remover robôs da lista de usuários online via Socket.IO
      try {
        const { getIO } = require('./server');
        const { removeUserFromOnlineList } = require('./handlers');
        const io = getIO();

        if (io && removedCount > 0) {
          const roomId = 'pub';

          // Remover cada robô da lista online
          for (const bot of botsToRemove) {
            removeUserFromOnlineList(roomId, bot.id.toString(), true); // forceRemove=true para robôs
            console.log(`[TIM-BOTS] Robô ${bot.nick} (${bot.id}) removido da lista online`);
          }

          // INVALIDAR CACHE antes de recarregar
          const { invalidateParticipantsCache } = require('./handlers');
          invalidateParticipantsCache(roomId);

          // Recarregar e enviar lista atualizada para todos os clientes
          const { loadParticipants, formatUsersList, calculateDetailedUserCounts } = require('./handlers');
          const [updatedParticipants, detailedCounts] = await Promise.all([
            loadParticipants(roomId),
            calculateDetailedUserCounts(roomId)
          ]);

          const formattedUsers = formatUsersList(updatedParticipants, roomId);

          // Emitir MÚLTIPLOS eventos para garantir compatibilidade
          io.to(roomId).emit('user-list', formattedUsers);
          io.to(roomId).emit('user-count', detailedCounts);
          io.to(roomId).emit('participants-updated', formattedUsers); // Evento adicional
          io.to(roomId).emit('bots-removed', { count: removedCount, bots: botsToRemove }); // Evento específico

          // Emitir também para sala global (compatibility)
          io.emit('global-user-count', detailedCounts);

          console.log(`[TIM-BOTS] Eventos Socket.IO enviados para sala ${roomId} após remoção de ${removedCount} robôs`);
        }
      } catch (socketError) {
        console.warn('[TIM-BOTS] Erro ao emitir eventos Socket.IO:', socketError.message);
        // Não quebrar o fluxo - robôs foram removidos com sucesso
      }

      console.log(`[TIM-BOTS] ${removedCount} robôs removidos com sucesso. Participantes restantes: ${filteredParticipants.length}`);

      res.json({
        success: true,
        message: `${removedCount} robôs removidos com sucesso`,
        removed_count: removedCount,
        total_participants: filteredParticipants.length,
        bots_removed: botsToRemove.map(bot => ({ id: bot.id, nick: bot.nick })),
        timestamp: new Date().toISOString()
      });

    } catch (fileError) {
      throw new Error(`Erro ao manipular participantes.json: ${fileError.message}`);
    }

  } catch (error) {
    console.error('[TIM-BOTS] Erro ao remover robôs:', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível remover os robôs',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Sincronizar robôs - Força recarregamento dos robôs na lista online
 * Endpoint administrativo para resolver problemas de inconsistência
 */
const syncBots = async (req, res) => {
  try {
    console.log('[TIM-BOTS] Iniciando sincronização forçada dos robôs...');

    const { bootstrapBots, invalidateParticipantsCache } = require('./handlers');
    const roomId = 'pub';

    // Invalidar cache primeiro
    invalidateParticipantsCache(roomId);

    // Executar bootstrap dos robôs
    await bootstrapBots();

    // Emitir eventos Socket.IO para atualizar interface
    try {
      const { getIO } = require('./server');
      const io = getIO();

      if (io) {
        const { loadParticipants, formatUsersList, calculateDetailedUserCounts } = require('./handlers');
        const [updatedParticipants, detailedCounts] = await Promise.all([
          loadParticipants(roomId),
          calculateDetailedUserCounts(roomId)
        ]);

        const formattedUsers = formatUsersList(updatedParticipants, roomId);

        // Emitir eventos de sincronização
        io.to(roomId).emit('user-list', formattedUsers);
        io.to(roomId).emit('user-count', detailedCounts);
        io.to(roomId).emit('participants-updated', formattedUsers);
        io.to(roomId).emit('bots-synced', { timestamp: new Date().toISOString() });

        console.log('[TIM-BOTS] Eventos de sincronização enviados via Socket.IO');
      }
    } catch (socketError) {
      console.warn('[TIM-BOTS] Erro ao emitir eventos de sincronização:', socketError.message);
    }

    console.log('[TIM-BOTS] Sincronização dos robôs concluída com sucesso');

    res.json({
      success: true,
      message: 'Sincronização dos robôs concluída com sucesso',
      action: 'bots-synchronized',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[TIM-BOTS] Erro na sincronização dos robôs:', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível sincronizar os robôs',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Endpoint de configuração pública
 */
const publicConfig = async (req, res) => {
  try {
    const config = {
      features: {
        socket_io: true,
        real_time_chat: true,
        video_positions: true,
        file_upload: true
      },
      limits: {
        max_file_size: '50MB',
        max_files_per_room: 100,
        supported_file_types: [
          'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
          'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar', 'txt',
          'mp4', 'avi', 'mp3'
        ]
      },
      socket: {
        transports: ['websocket', 'polling'],
        ping_timeout: 300000,
        ping_interval: 10000
      },
      cache: {
        timestamp_ttl: 30
      }
    };

    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter configuração pública', message: error.message });
  }
};

/**
 * Controller para retornar formulário de chat para usuários anônimos
 * Retorna o HTML do formulário apenas quando usuário não está logado
 */
const getChatForm = async (req, res) => {
  try {
    // Verificar se usuário está autenticado
    const { isAuthenticated, user } = req.biblos360Auth || {};

    // Se estiver autenticado, não retorna formulário
    if (isAuthenticated && user?.data) {
      return res.json({
        success: false,
        message: 'Usuário já está logado',
        show_form: false,
        user: {
          id: user.data.id,
          nick: user.data.apelido || user.data.nome
        }
      });
    }

    // Formulário HTML para usuários não logados
    const chatFormHtml = `
      <form class="chat-join-form welcome-tooltip-chat" data-step="0" style="display: block;">
        <input type="hidden" class="chat-forced" value="0">
        <div class="chat-nick-error">Este nome já está em uso, por favor escolha outro.</div>
        <div class="chat-blocked">Você foi bloqueado(a).</div>
        <div class="chat-timeout">Você perdeu conexão com o chat.</div>
        <div class="chat-nick-field mb10">
          <!-- <label for="chat-nick-input">Qual seu nome?</label><br> -->
          <input type="text" class="chat-nick-input input_full chat_input" placeholder="Nome" autocomplete="off" maxlength="20" style="max-width: 250px; margin-bottom: 5px"><br>
          <input type="text" class="chat-nick-uf input_full chat_input" placeholder="UF" autocomplete="off" maxlength="2" style="max-width: 40px; margin-bottom: 5px"><br>
          <input type="submit" value="Entrar" style="margin-top: 5px">
        </div>
        <div class="chat-nick-join mb10">
          Quer participar da conversa?<br>
          <input type="submit" value="Entrar no Chat" class="mt5">
        </div>
      </form>
    `;

    console.log('📝 Formulário de chat enviado para usuário não logado');

    res.json({
      success: true,
      show_form: true,
      form_html: chatFormHtml,
      message: 'Formulário de chat disponível'
    });

  } catch (error) {
    console.error('❌ Erro ao gerar formulário de chat:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      show_form: false
    });
  }
};

// ========================================
// SEÇÁO 3: CONTROLLER DE AUTENTICAÇÁO
// ========================================

/**
 * Função utilitária para gerar hash MD5 (compatibilidade PHP)
 */
function generateMD5Hash(str) {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * Função utilitária para criar cookie compatível com PHP
 */
function createBiblos360Cookie(data) {
  // Usar a função correta do services.js
  return services.createBiblos360Cookie(data);
}

/**
 * Função utilitária para gerar hash de sessão
 */
function generateSessionHash(data) {
  const str = `${data.roomId || ''}_${data.userId || ''}_${data.userAgent || ''}_${data.timestamp || Date.now()}`;
  return generateMD5Hash(str);
}

/**
 * GET /logado - Endpoint para fornecer dados de sessão
 */
const getSessionData = async (req, res) => {
  try {
    const userAgent = req.get('User-Agent') || '';
    const sessionId = req.get('x-session-id') || req.query.session || '';
    const userId = req.query.user || req.query.userId || '';
    const roomId = req.query.room || '';

    const { isAuthenticated, user } = req.biblos360Auth || {};

    let sessionData = '';
    if (roomId) {
      sessionData = roomId;
    } else if (isAuthenticated && user?.data?.id) {
      sessionData = user.data.id;
    } else if (userId) {
      sessionData = userId;
    } else {
      sessionData = `${Date.now()}_${userAgent}`;
    }

    const sessionHash = generateSessionHash({
      roomId,
      userId: isAuthenticated ? user?.data?.id : userId,
      userAgent,
      timestamp: Date.now()
    });

    const response = {
      un_str: sessionHash,
      anonymous: sessionHash,
      autoplay: false,
      session_data: sessionData,
      authenticated: isAuthenticated,
      user_id: isAuthenticated ? user?.data?.id : null,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter dados de sessão', message: error.message });
  }
};

/**
 * GET /login - Página de login
 */
const login = async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../public/vr/login.html'));
  } catch (error) {
    res.status(404).send('Página de login não encontrada');
  }
};

/**
 * GET /vr/admin/login.html - Página de login administrativo
 */
const adminLogin = async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../public/vr/admin/login.html'));
  } catch (error) {
    res.status(404).send('Página de login administrativo não encontrada');
  }
};

/**
 * POST /logout - Logout
 */
const logout = async (req, res) => {
  try {
    // Limpar cookies de autenticação
    res.clearCookie('biblos360_site_usuario');
    res.clearCookie('biblos360_site_inscrito');
    res.clearCookie('biblos360_admin_usuario');
    res.clearCookie('biblos360_admin_inscrito');
    res.clearCookie('biblos360_time_sync');

    // Detectar se é requisição de API ou página
    const acceptHeader = req.headers.accept || '';
    const isApiRequest = acceptHeader.includes('application/json') || req.xhr;

    if (isApiRequest) {
      // Resposta JSON para requisições de API
      res.json({ success: true, message: 'Logout realizado com sucesso' });
    } else {
      // Redirecionar para página de saída
      const roomId = req.query.room || req.body.room || 'pub';
      errors.renderError(req, res, errors.ERROR_TYPES.SAIR, { roomId });
    }
  } catch (error) {
    console.error('❌ Erro no logout:', error);
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      res.status(500).json({ error: 'Erro no logout', message: error.message });
    } else {
      errors.renderError(req, res, errors.ERROR_TYPES.GENERIC, {
        message: 'Erro durante o logout'
      });
    }
  }
};

/**
 * GET /auth-status - Status de autenticação
 */
const getAuthStatus = async (req, res) => {
  try {
    const { isAuthenticated, user } = req.biblos360Auth || {};

    res.json({
      authenticated: isAuthenticated,
      user: isAuthenticated ? user.data : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar status de autenticação', message: error.message });
  }
};

/**
 * POST /refresh - Refresh de autenticação
 */
const refreshAuth = async (req, res) => {
  try {
    const { isAuthenticated, user } = req.biblos360Auth || {};

    if (!isAuthenticated) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    res.json({
      success: true,
      user: user.data
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no refresh de autenticação', message: error.message });
  }
};

/**
 * POST /auth/login - Login com CPF e data de nascimento
 */
const processLogin = async (req, res) => {
  console.log('[AUTH DEBUG] ========== PROCESSANDO LOGIN ==========');
  console.log('[AUTH DEBUG] Method:', req.method);
  console.log('[AUTH DEBUG] URL:', req.url);
  console.log('[AUTH DEBUG] Content-Type:', req.headers['content-type']);
  console.log('[AUTH DEBUG] Body original:', req.body);
  console.log('[AUTH DEBUG] Cookies presentes:', Object.keys(req.cookies || {}));
  console.log('[AUTH DEBUG] ================================================');

  try {
    console.log(`[AUTH DEBUG] processLogin chamado com dados:`, req.body);

    // LIMPAR TODOS OS COOKIES EXISTENTES PARA EVITAR CONFLITOS
    const cookiesToClear = [
      'biblos360_site_usuario',
      'biblos360_site_inscrito',
      'biblos360_admin_usuario',
      'biblos360_admin_inscrito',
      'biblos360_time_sync'
    ];

    console.log('[AUTH DEBUG] Limpando cookies:', cookiesToClear);
    cookiesToClear.forEach(cookieName => {
      // Limpar com diferentes configurações para garantir
      res.clearCookie(cookieName, { path: '/' });
      res.clearCookie(cookieName, { path: '/', domain: 'localhost' });
      res.clearCookie(cookieName, { path: '/', domain: '.localhost' });
      res.clearCookie(cookieName);
    });

    const { cpf_cnpj, data_nascimento, _alt } = req.body;

    console.log('[AUTH DEBUG] Dados recebidos:', { cpf_cnpj, data_nascimento, _alt });

    // Validação básica
    if (!cpf_cnpj || !data_nascimento) {
      return res.status(400).json({ error: 'CPF e data de nascimento são obrigatórios' });
    }

    // Limpar CPF
    const cpfLimpo = cpf_cnpj.replace(/\D/g, '');
    console.log('[AUTH DEBUG] CPF limpo:', cpfLimpo);

    // Limpar data de nascimento
    let dataLimpa = data_nascimento.replace(/\D/g, '');
    console.log('[AUTH DEBUG] Data original:', data_nascimento, 'Data limpa:', dataLimpa);

    // Converter data DDMMAAAA para AAAAMMDD se necessário
    if (dataLimpa.length === 8) {
      const possivelDia = dataLimpa.substring(0, 2);
      const possivelMes = dataLimpa.substring(2, 4);
      const possivelAno = dataLimpa.substring(4, 8);

      // Verificar se parece ser formato DDMMYYYY
      if (parseInt(possivelDia) <= 31 && parseInt(possivelMes) <= 12 && parseInt(possivelAno) >= 1900) {
        // Converter DDMMYYYY para YYYYMMDD
        dataLimpa = `${possivelAno}${possivelMes}${possivelDia}`;
        console.log('[AUTH DEBUG] Data convertida de DDMMYYYY para YYYYMMDD:', `${possivelDia}${possivelMes}${possivelAno} -> ${dataLimpa}`);
      } else {
        console.log('[AUTH DEBUG] Data já parece estar em formato YYYYMMDD:', dataLimpa);
      }
    }

    console.log('[AUTH DEBUG] Dados finais para consulta:', { cpfLimpo, dataLimpa });

    // Ler dados dos usuários do Supabase
    const supabaseService = require('./supabase');

    // Debug: listar alguns usuários para verificar formato dos dados
    console.log('[AUTH DEBUG] === LISTANDO USUÁRIOS PARA DEBUG ===');
    await supabaseService.debugListUsers();
    console.log('[AUTH DEBUG] === FIM DA LISTAGEM ===');

    const loginResult = await supabaseService.validateLoginByCpfAndBirth(cpfLimpo, dataLimpa);

    console.log('[AUTH DEBUG] Resultado do login:', loginResult);

    if (!loginResult.success) {
      console.log('[AUTH DEBUG] Login falhou:', loginResult.error);
      return res.status(401).json({ error: 'CPF ou data de nascimento inválidos' });
    }

    const usuario = loginResult.user;

    // Login bem-sucedido - criar cookies
    const sessionId = generateMD5Hash(Date.now().toString() + Math.random().toString());

    const cookieOptions = {
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      httpOnly: false,
      secure: false,
      path: '/',
      sameSite: 'lax' // Importante para compatibilidade do navegador
    };

    // Dados do usuário para o cookie
    const userData = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email || `user${usuario.id}@biblos360.com`,
      cpf_cnpj: usuario.cpf_cnpj,
      apelido: usuario.apelido,
      level: usuario.level,
      situacao: usuario.situacao
    };

    // Dados da inscrição para o cookie
    const inscricaoData = {
      id: sessionId,
      user_id: usuario.id,
      room_id: 'pub',
      status: 'ativo',
      tipo: _alt ? 'chat_only' : 'full_access'
    };

    // Limpar todos os cookies existentes antes de criar novos
    res.clearCookie('biblos360_site_usuario');
    res.clearCookie('biblos360_site_inscrito');
    res.clearCookie('biblos360_admin_usuario');
    res.clearCookie('biblos360_admin_inscrito');

    // Criar cookies
    const usuarioCookieValue = createBiblos360Cookie(userData);
    const inscricaoCookieValue = createBiblos360Cookie(inscricaoData);

    console.log('[AUTH DEBUG] Criando cookies:');
    console.log('[AUTH DEBUG] - biblos360_site_usuario:', usuarioCookieValue.substring(0, 50) + '...');
    console.log('[AUTH DEBUG] - biblos360_site_inscrito:', inscricaoCookieValue.substring(0, 50) + '...');
    console.log('[AUTH DEBUG] - cookieOptions:', cookieOptions);

    res.cookie('biblos360_site_usuario', usuarioCookieValue, cookieOptions);
    res.cookie('biblos360_site_inscrito', inscricaoCookieValue, cookieOptions);

    console.log(`[AUTH] Login bem-sucedido: Usuario ${usuario.id} - CPF: ${cpfLimpo.substring(0, 3)}***`);

    // Redirecionar
    if (_alt && _alt !== '0') {
      return res.redirect(_alt);
    }

    return res.redirect('/vr/pub');

  } catch (error) {
    console.error('[AUTH] Erro no login:', error.message);
    res.status(500).json({ error: 'Erro na autenticação', message: error.message });
  }
};

/**
 * POST /auth/admin-login - Login administrativo (apenas usuários nível 3)
 */
const processAdminLogin = async (req, res) => {
  try {
    const { cpf_cnpj, data_nascimento, _alt } = req.body;

    // Validação básica
    if (!cpf_cnpj || !data_nascimento) {
      return res.status(400).json({ error: 'CPF e data de nascimento são obrigatórios' });
    }

    // Limpar CPF
    const cpfLimpo = cpf_cnpj.replace(/\D/g, '');

    // Limpar data de nascimento
    let dataLimpa = data_nascimento.replace(/\D/g, '');

    // Converter data DDMMAAAA para AAAAMMDD se necessário
    if (dataLimpa.length === 8) {
      const possivelDia = dataLimpa.substring(0, 2);
      const possivelMes = dataLimpa.substring(2, 4);
      const possivelAno = dataLimpa.substring(4, 8);

      // Verificar se parece ser formato DDMMYYYY
      if (parseInt(possivelDia) <= 31 && parseInt(possivelMes) <= 12 && parseInt(possivelAno) >= 1900) {
        // Converter DDMMYYYY para YYYYMMDD
        dataLimpa = `${possivelAno}${possivelMes}${possivelDia}`;
        console.log('[ADMIN-AUTH DEBUG] Data convertida de DDMMYYYY para YYYYMMDD:', `${possivelDia}${possivelMes}${possivelAno} -> ${dataLimpa}`);
      } else {
        console.log('[ADMIN-AUTH DEBUG] Data já parece estar em formato YYYYMMDD:', dataLimpa);
      }
    }

    // Ler dados dos usuários do Supabase
    const supabaseService = require('./supabase');
    const loginResult = await supabaseService.validateLoginByCpfAndBirth(cpfLimpo, dataLimpa);

    if (!loginResult.success) {
      return res.status(401).json({ error: 'CPF ou data de nascimento inválidos' });
    }

    const usuario = loginResult.user;

    // CONTROLE DE ACESSO: Verificar se é usuário nível 3 (Admin)
    if (usuario.level !== 3) {
      console.log(`[ADMIN-LOGIN] Acesso negado para usuário nível ${usuario.level}: ${usuario.apelido} (${usuario.id})`);
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Apenas administradores podem acessar esta área. Entre em contato com o suporte se você deveria ter acesso administrativo.'
      });
    }

    // Login administrativo bem-sucedido - criar cookies de admin
    const sessionId = generateMD5Hash(Date.now().toString() + Math.random().toString());

    const cookieOptions = {
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      httpOnly: false,
      secure: false,
      path: '/'
    };

    // Dados do usuário para o cookie de admin
    const adminUserData = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email || `admin${usuario.id}@biblos360.com`,
      cpf_cnpj: usuario.cpf_cnpj,
      apelido: usuario.apelido,
      level: usuario.level,
      situacao: usuario.situacao,
      admin: true // Marcador especial para administrador
    };

    // Dados da inscrição administrativa para o cookie
    const adminInscricaoData = {
      id: sessionId,
      user_id: usuario.id,
      room_id: 'pub',
      status: 'ativo',
      tipo: 'admin_access',
      admin: true // Marcador especial para administrador
    };

    // Criar cookies de admin
    res.cookie('biblos360_admin_usuario', createBiblos360Cookie(adminUserData), cookieOptions);
    res.cookie('biblos360_admin_inscrito', createBiblos360Cookie(adminInscricaoData), cookieOptions);

    console.log(`[ADMIN-LOGIN] Login administrativo bem-sucedido: ${usuario.apelido} (${usuario.id}) - Nível: ${usuario.level}`);

    // Redirecionar para área administrativa
    return res.redirect('/vr/pub/admin/admin-main.html');

  } catch (error) {
    console.error('[ADMIN-LOGIN] Erro no login administrativo:', error.message);
    res.status(500).json({ error: 'Erro na autenticação administrativa', message: error.message });
  }
};

// ========================================
// SEÇÁO 4: CONTROLLER DE VÍDEO
// ========================================

/**
 * Função utilitária para validar hash MD5
 */
function isValidMD5Hash(hash) {
  return /^[a-f0-9]{32}$/i.test(hash);
}

/**
 * GET /videos/pos/:sessionHash/:videoHashes
 * Busca posições salvas de vídeos
 */
const getVideoPositions = async (req, res) => {
  try {
    const { sessionHash, videoHashes } = req.params;

    // Validação
    if (!isValidMD5Hash(sessionHash)) {
      return res.status(400).json({ error: 'Hash de sessão inválido' });
    }

    if (!videoHashes) {
      return res.status(400).json({ error: 'Hashes de vídeo são obrigatórios' });
    }

    const videoHashArray = videoHashes.split(',').filter(hash => hash.trim());

    // Validar cada hash
    for (const hash of videoHashArray) {
      if (!isValidMD5Hash(hash)) {
        return res.status(400).json({ error: `Hash de vídeo inválido: ${hash}` });
      }
    }

    console.log(`📹 GET video positions - Session: ${sessionHash}, Videos: ${videoHashArray.length}`);

    // Buscar posições (implementação básica - pode ser expandida)
    const positions = {};

    try {
      const positionsFile = path.join(__dirname, '../data/video_positions.json');
      if (fsSync.existsSync(positionsFile)) {
        const data = JSON.parse(fsSync.readFileSync(positionsFile, 'utf8'));
        const sessionData = data[sessionHash] || {};

        videoHashArray.forEach(videoHash => {
          positions[videoHash] = sessionData[videoHash] || { time: 0, duration: 0 };
        });
      } else {
        // Arquivo não existe, retornar posições zeradas
        videoHashArray.forEach(videoHash => {
          positions[videoHash] = { time: 0, duration: 0 };
        });
      }
    } catch (error) {
      console.error('Erro ao ler posições de vídeo:', error);
      // Retornar posições zeradas em caso de erro
      videoHashArray.forEach(videoHash => {
        positions[videoHash] = { time: 0, duration: 0 };
      });
    }

    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'max-age=0',
      'Access-Control-Allow-Methods': 'POST, GET, DELETE, PUT, OPTIONS'
    });

    res.json(positions);

  } catch (error) {
    console.error('❌ Erro ao buscar posições dos vídeos:', error);
    res.status(500).json({ error: 'Erro ao buscar posições dos vídeos', message: error.message });
  }
};

/**
 * POST /videos/pos/:sessionHash/:videoHash
 * Salva posição do vídeo
 */
const saveVideoPosition = async (req, res) => {
  try {
    const { sessionHash, videoHash } = req.params;
    const { seconds, duration, video_id, playlist_id } = req.body;

    // Validação
    if (!isValidMD5Hash(sessionHash)) {
      return res.status(400).json({ error: 'Hash de sessão inválido' });
    }

    if (!isValidMD5Hash(videoHash)) {
      return res.status(400).json({ error: 'Hash de vídeo inválido' });
    }

    const time = parseFloat(seconds) || 0;
    const videoDuration = parseFloat(duration) || 0;

    if (time < 0) {
      return res.status(400).json({ error: 'Posição não pode ser negativa' });
    }

    console.log(`📹 POST video position - Session: ${sessionHash}, Video: ${videoHash}, Time: ${time}s`);

    // Salvar posição
    const positionsFile = path.join(__dirname, '../data/video_positions.json');
    let data = {};

    try {
      if (fsSync.existsSync(positionsFile)) {
        data = JSON.parse(fsSync.readFileSync(positionsFile, 'utf8'));
      }
    } catch (error) {
      console.error('Erro ao ler arquivo de posições:', error);
      data = {};
    }

    // Inicializar sessão se não existir
    if (!data[sessionHash]) {
      data[sessionHash] = {};
    }

    // Salvar posição
    data[sessionHash][videoHash] = {
      time,
      duration: videoDuration,
      video_id: video_id || null,
      playlist_id: playlist_id || null,
      updated: new Date().toISOString()
    };

    // Escrever arquivo
    try {
      fsSync.writeFileSync(positionsFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Erro ao salvar arquivo de posições:', error);
      return res.status(500).json({ error: 'Erro ao salvar posição do vídeo' });
    }

    res.set({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Methods': 'POST, GET, DELETE, PUT, OPTIONS'
    });

    res.json({
      success: true,
      saved: {
        time,
        duration: videoDuration
      },
      timestamp: data[sessionHash][videoHash].updated
    });

  } catch (error) {
    console.error('❌ Erro ao salvar posição do vídeo:', error);
    res.status(500).json({ error: 'Erro ao salvar posição do vídeo', message: error.message });
  }
};

/**
 * DELETE /videos/pos/:sessionHash/:videoHash
 * Remove posição salva de um vídeo específico
 */
const deleteVideoPosition = async (req, res) => {
  try {
    const { sessionHash, videoHash } = req.params;

    // Validação
    if (!isValidMD5Hash(sessionHash)) {
      return res.status(400).json({ error: 'Hash de sessão inválido' });
    }

    if (!isValidMD5Hash(videoHash)) {
      return res.status(400).json({ error: 'Hash de vídeo inválido' });
    }

    console.log(`📹 DELETE video position - Session: ${sessionHash}, Video: ${videoHash}`);

    const positionsFile = path.join(__dirname, '../data/video_positions.json');
    let data = {};

    try {
      if (fsSync.existsSync(positionsFile)) {
        data = JSON.parse(fsSync.readFileSync(positionsFile, 'utf8'));
      }
    } catch (error) {
      return res.status(404).json({ error: 'Posição de vídeo não encontrada' });
    }

    if (!data[sessionHash] || !data[sessionHash][videoHash]) {
      return res.status(404).json({ error: 'Posição de vídeo não encontrada' });
    }

    // Remover posição
    delete data[sessionHash][videoHash];

    // Se a sessão ficou vazia, remover ela também
    if (Object.keys(data[sessionHash]).length === 0) {
      delete data[sessionHash];
    }

    // Salvar arquivo
    fsSync.writeFileSync(positionsFile, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      message: 'Posição de vídeo removida com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao remover posição do vídeo:', error);
    res.status(500).json({ error: 'Erro ao remover posição do vídeo', message: error.message });
  }
};

/**
 * DELETE /videos/pos/:sessionHash
 * Remove todas as posições de uma sessão
 */
const deleteSessionPositions = async (req, res) => {
  try {
    const { sessionHash } = req.params;

    // Validação
    if (!isValidMD5Hash(sessionHash)) {
      return res.status(400).json({ error: 'Hash de sessão inválido' });
    }

    console.log(`📹 DELETE session positions - Session: ${sessionHash}`);

    const positionsFile = path.join(__dirname, '../data/video_positions.json');
    let data = {};

    try {
      if (fsSync.existsSync(positionsFile)) {
        data = JSON.parse(fsSync.readFileSync(positionsFile, 'utf8'));
      }
    } catch (error) {
      return res.json({ success: true, message: '0 posições de vídeo removidas', deletedCount: 0 });
    }

    const deletedCount = data[sessionHash] ? Object.keys(data[sessionHash]).length : 0;

    // Remover sessão
    if (data[sessionHash]) {
      delete data[sessionHash];
    }

    // Salvar arquivo
    fsSync.writeFileSync(positionsFile, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      message: `${deletedCount} posições de vídeo removidas`,
      deletedCount
    });

  } catch (error) {
    console.error('❌ Erro ao remover posições da sessão:', error);
    res.status(500).json({ error: 'Erro ao remover posições da sessão', message: error.message });
  }
};

/**
 * GET /videos/pos/stats/:sessionHash
 * Obtém estatísticas de visualização de uma sessão
 */
const getSessionStats = async (req, res) => {
  try {
    const { sessionHash } = req.params;

    // Validação
    if (!isValidMD5Hash(sessionHash)) {
      return res.status(400).json({ error: 'Hash de sessão inválido' });
    }

    const positionsFile = path.join(__dirname, '../data/video_positions.json');
    let data = {};

    try {
      if (fsSync.existsSync(positionsFile)) {
        data = JSON.parse(fsSync.readFileSync(positionsFile, 'utf8'));
      }
    } catch (error) {
      return res.json({ videos: 0, total_time: 0, last_activity: null });
    }

    const sessionData = data[sessionHash] || {};
    const videos = Object.keys(sessionData).length;
    let totalTime = 0;
    let lastActivity = null;

    Object.values(sessionData).forEach(position => {
      totalTime += position.time || 0;
      if (position.updated && (!lastActivity || position.updated > lastActivity)) {
        lastActivity = position.updated;
      }
    });

    const stats = {
      videos,
      total_time: Math.round(totalTime),
      last_activity: lastActivity
    };

    res.json(stats);

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas da sessão:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas da sessão', message: error.message });
  }
};

// ========================================
// SEÇÁO 5: CONTROLLERS ADMINISTRATIVOS
// ========================================

/**
 * Controller para participantes administrativos
 * Retorna lista de participantes com dados administrativos
 */
const getAdminParticipants = async (req, res) => {
  try {
    const roomId = req.params.id;
    const { isAuthenticated, user } = req.biblos360Auth || {};

    // Verificar se a sala existe
    if (!roomId || !/^[a-zA-Z0-9]+$/.test(roomId)) {
      return res.status(400).json({ error: 'ID da sala inválido' });
    }

    // Carregar participantes da sala usando nova localização
    const participantsPath = path.join(__dirname, '../../../api/participantes.json');

    try {
      const participantsData = await fs.readFile(participantsPath, 'utf8');
      const participants = JSON.parse(participantsData);

      // USAR LISTA REAL DE USUÁRIOS ONLINE DO SOCKET.IO
      const { getRealOnlineUsers } = require('./services');
      const onlineUserIds = getRealOnlineUsers(roomId);

      console.log(`✅ Dados administrativos de participantes enviados para sala ${roomId}: ${participants.length} participantes, ${onlineUserIds.length} online`);

      // Enriquecer dados dos participantes com informações administrativas
      const adminParticipants = participants.map(participant => ({
        ...participant,
        online: onlineUserIds.includes(participant.id), // Usar lista real do Socket.IO
        lastSeen: onlineUserIds.includes(participant.id) ? new Date().toISOString() : null,
        permissions: {
          canKick: true,
          canMute: true,
          canPromote: participant.level < 1,
          canMessage: true
        },
        adminData: {
          joinTime: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Último join nas últimas 1h
          messageCount: Math.floor(Math.random() * 50), // Número aleatório de mensagens
          warnings: 0,
          status: participant.equipe ? 'staff' : 'student'
        }
      }));

      // Calcular estatísticas
      const stats = {
        total: adminParticipants.length,
        online: adminParticipants.filter(p => p.online).length,
        offline: adminParticipants.filter(p => !p.online).length,
        staff: adminParticipants.filter(p => p.equipe).length,
        students: adminParticipants.filter(p => !p.equipe).length,
        byTurma: adminParticipants.reduce((acc, p) => {
          if (p.turma) {
            acc[p.turma] = (acc[p.turma] || 0) + 1;
          }
          return acc;
        }, {}),
        byUF: adminParticipants.reduce((acc, p) => {
          if (p.uf) {
            acc[p.uf] = (acc[p.uf] || 0) + 1;
          }
          return acc;
        }, {})
      };

      res.json({
        roomId,
        participants: adminParticipants,
        stats,
        timestamp: new Date().toISOString(),
        success: true
      });

      console.log(`✅ Dados administrativos de participantes enviados para sala ${roomId}: ${participants.length} participantes, ${stats.online} online`);

    } catch (fileError) {
      console.error('❌ Erro ao ler arquivo de participantes:', fileError);
      res.status(404).json({
        error: 'Arquivo de participantes não encontrado',
        roomId,
        path: participantsPath
      });
    }

  } catch (error) {
    console.error('❌ Erro no controller de participantes admin:', error);
    res.status(500).json({ error: 'Erro interno do servidor', message: error.message });
  }
};

/**
 * Controller para funcionalidades administrativas
 * Retorna menu de funcionalidades disponíveis para administradores
 */
const getAdminFunctions = async (req, res) => {
  try {
    const roomId = req.params.id;

    // Definir funcionalidades administrativas baseadas na documentação
    const adminFunctions = {
      userManagement: {
        title: 'Gestão de Usuários',
        icon: 'fa-users-cog',
        functions: [
          {
            id: 'kick-user',
            title: 'Expulsar Usuário',
            description: 'Remover usuário da sala',
            icon: 'fa-user-times',
            action: 'kick',
            permission: 'moderator'
          },
          {
            id: 'mute-user',
            title: 'Silenciar Usuário',
            description: 'Impedir usuário de enviar mensagens',
            icon: 'fa-volume-mute',
            action: 'mute',
            permission: 'moderator'
          },
          {
            id: 'promote-user',
            title: 'Promover a Staff',
            description: 'Conceder privilégios administrativos',
            icon: 'fa-user-shield',
            action: 'promote',
            permission: 'admin'
          },
          {
            id: 'private-message',
            title: 'Mensagem Privada',
            description: 'Enviar mensagem privada para usuário',
            icon: 'fa-envelope',
            action: 'private-message',
            permission: 'moderator'
          }
        ]
      },
      roomControl: {
        title: 'Controles da Sala',
        icon: 'fa-cogs',
        functions: [
          {
            id: 'lock-room',
            title: 'Trancar Sala',
            description: 'Impedir entrada de novos usuários',
            icon: 'fa-lock',
            action: 'lock-room',
            permission: 'admin'
          },
          {
            id: 'clear-chat',
            title: 'Limpar Chat',
            description: 'Remover todas as mensagens do chat',
            icon: 'fa-broom',
            action: 'clear-chat',
            permission: 'admin'
          },
          {
            id: 'send-announcement',
            title: 'Enviar Anúncio',
            description: 'Mensagem destacada para todos os usuários',
            icon: 'fa-bullhorn',
            action: 'announce',
            permission: 'moderator'
          },
          {
            id: 'toggle-chat',
            title: 'Ativar/Desativar Chat',
            description: 'Controlar se usuários podem enviar mensagens',
            icon: 'fa-comments',
            action: 'toggle-chat',
            permission: 'admin'
          }
        ]
      },
      conference: {
        title: 'Videoconferências',
        icon: 'fa-video',
        functions: [
          {
            id: 'start-meeting',
            title: 'Iniciar Reunião',
            description: 'Sala de reunião geral',
            icon: 'fa-video',
            action: 'start-meeting',
            permission: 'moderator'
          },
          {
            id: 'start-breakout',
            title: 'Grupos de Trabalho',
            description: 'Salas de trabalho em grupo',
            icon: 'fa-users',
            action: 'start-breakout',
            permission: 'moderator'
          },
          {
            id: 'start-turma',
            title: 'Reunião por Turma',
            description: 'Salas separadas por turma',
            icon: 'fa-chalkboard-teacher',
            action: 'start-turma',
            permission: 'moderator'
          },
          {
            id: 'record-session',
            title: 'Gravar Sessão',
            description: 'Iniciar gravação da conferência',
            icon: 'fa-record-vinyl',
            action: 'record',
            permission: 'admin'
          }
        ]
      },
      content: {
        title: 'Gestão de Conteúdo',
        icon: 'fa-file-alt',
        functions: [
          {
            id: 'upload-file',
            title: 'Upload de Arquivo',
            description: 'Compartilhar arquivos com a sala',
            icon: 'fa-upload',
            action: 'upload',
            permission: 'moderator'
          },
          {
            id: 'share-screen',
            title: 'Compartilhar Tela',
            description: 'Transmitir tela para a sala',
            icon: 'fa-desktop',
            action: 'screen-share',
            permission: 'moderator'
          },
          {
            id: 'create-poll',
            title: 'Criar Enquete',
            description: 'Enquete interativa para participantes',
            icon: 'fa-poll',
            action: 'poll',
            permission: 'moderator'
          },
          {
            id: 'timer-control',
            title: 'Controle de Timer',
            description: 'Cronômetro para atividades',
            icon: 'fa-stopwatch',
            action: 'timer',
            permission: 'moderator'
          }
        ]
      },
      streaming: {
        title: 'Transmissão',
        icon: 'fa-broadcast-tower',
        functions: [
          {
            id: 'start-stream',
            title: 'Iniciar Transmissão',
            description: 'Transmissão ao vivo',
            icon: 'fa-play',
            action: 'start-stream',
            permission: 'admin'
          },
          {
            id: 'stop-stream',
            title: 'Parar Transmissão',
            description: 'Encerrar transmissão ao vivo',
            icon: 'fa-stop',
            action: 'stop-stream',
            permission: 'admin'
          },
          {
            id: 'stream-delay',
            title: 'Ajustar Delay',
            description: 'Configurar atraso da transmissão',
            icon: 'fa-clock',
            action: 'stream-delay',
            permission: 'admin'
          }
        ]
      }
    };

    // Estatísticas da sala para contexto
    const roomStats = {
      activeConferences: 0,
      activePolls: 0,
      streamStatus: 'offline',
      chatStatus: 'active',
      roomLocked: false
    };

    res.json({
      roomId,
      functions: adminFunctions,
      roomStats,
      timestamp: new Date().toISOString(),
      success: true
    });

    console.log(`✅ Funcionalidades administrativas enviadas para sala ${roomId}`);

  } catch (error) {
    console.error('❌ Erro no controller de funcionalidades admin:', error);
    res.status(500).json({ error: 'Erro interno do servidor', message: error.message });
  }
};

/**
 * Controller para executar ações administrativas
 * Processa ações administrativas (kick, mute, etc.)
 */
const executeAdminAction = async (req, res) => {
  try {
    const roomId = req.params.id;
    const { action, targetUserId, parameters } = req.body;

    console.log(`🔧 Executando ação administrativa: ${action} na sala ${roomId}`, { targetUserId, parameters });

    // Simular execução da ação (implementação básica)
    let result = {};

    switch (action) {
      case 'kick':
        result = {
          success: true,
          message: `Usuário ${targetUserId} foi removido da sala`,
          action: 'kick',
          targetUserId
        };
        break;

      case 'mute':
        result = {
          success: true,
          message: `Usuário ${targetUserId} foi silenciado`,
          action: 'mute',
          targetUserId
        };
        break;

      case 'promote':
        result = {
          success: true,
          message: `Usuário ${targetUserId} foi promovido a staff`,
          action: 'promote',
          targetUserId
        };
        break;

      case 'announce':
        result = {
          success: true,
          message: 'Anúncio enviado para todos os usuários',
          action: 'announce',
          content: parameters?.message || 'Anúncio administrativo'
        };
        break;

      case 'clear-chat':
        result = {
          success: true,
          message: 'Chat foi limpo',
          action: 'clear-chat'
        };
        break;

      default:
        result = {
          success: false,
          error: `Ação '${action}' não reconhecida`,
          availableActions: ['kick', 'mute', 'promote', 'announce', 'clear-chat']
        };
    }

    res.json({
      roomId,
      timestamp: new Date().toISOString(),
      ...result
    });

  } catch (error) {
    console.error('❌ Erro na execução de ação administrativa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

/**
 * Limpar todos os cookies para resolver problemas de autenticação
 */
const clearCookies = async (req, res) => {
  try {
    // Lista de todos os cookies possíveis do Biblos360
    const cookiesToClear = [
      'biblos360_site_usuario',
      'biblos360_site_inscrito',
      'biblos360_admin_usuario',
      'biblos360_admin_inscrito'
    ];

    // Limpar cada cookie
    cookiesToClear.forEach(cookieName => {
      res.clearCookie(cookieName, {
        domain: undefined,
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
      });
    });

    console.log('🧹 Cookies limpos com sucesso');
    res.json({
      success: true,
      message: 'Todos os cookies foram limpos. Você pode fazer login novamente.',
      cleared: cookiesToClear
    });
  } catch (error) {
    console.error('❌ Erro ao limpar cookies:', error);
    res.status(500).json({ error: 'Erro ao limpar cookies', message: error.message });
  }
};

// ========================================
// SEÇÁO 6: TIMOTIN/TIM CONTROLLERS
// ========================================

/**
 * GET /tim - Página principal do sistema Tim
 */
const timMain = async (req, res) => {
  try {
    const timHtmlPath = path.join(__dirname, '../../../apps/tim.biblos360.net/secure/tim.html');

    // Verificar se o arquivo existe
    if (!fsSync.existsSync(timHtmlPath)) {
      return res.status(404).send(`
        <h1>🔍 Sistema TIM - Em Desenvolvimento</h1>
        <p>O sistema TIM (Timotin) está sendo implementado.</p>
        <p>Arquivo esperado: ${timHtmlPath}</p>
        <p><a href="/">← Voltar ao início</a></p>
      `);
    }

    // Servir arquivo HTML do Tim
    res.sendFile(timHtmlPath);
    console.log('🔍 TIM: Página principal servida');

  } catch (error) {
    console.error('❌ Erro no TIM main:', error);
    res.status(500).send(`
      <h1>Erro no Sistema TIM</h1>
      <p>Erro: ${error.message}</p>
      <p><a href="/">← Voltar ao início</a></p>
    `);
  }
};

/**
 * GET /timotinho/user/:id - Visualização de dados do usuário no Timotin
 */
const getTimotinhoUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId || !/^\d+$/.test(userId)) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Timotinho - Erro</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .error { background: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #e74c3c; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>❌ Erro - ID de usuário inválido</h1>
            <p>O ID do usuário deve ser um número válido.</p>
            <p><a href="/tim">← Voltar ao Tim</a></p>
          </div>
        </body>
        </html>
      `);
    }

    console.log(`🔍 Timotinho: Acessando dados do usuário ${userId}`);

    // Buscar dados do usuário
    let userData = null;

    try {
      // Tentar buscar no Supabase
      const supabaseService = require('./supabase');
      userData = await supabaseService.getUserById(userId);
    } catch (supabaseError) {
      console.warn('⚠️  Timotinho: Erro ao buscar no Supabase:', supabaseError.message);

      // Fallback: buscar nos participantes locais
      try {
        const participantsPath = path.join(__dirname, '../../../api/participantes.json');
        const participantsData = JSON.parse(fsSync.readFileSync(participantsPath, 'utf8'));
        userData = participantsData.find(p => p.id.toString() === userId.toString());
      } catch (localError) {
        console.error('❌ Timotinho: Erro no fallback local:', localError.message);
      }
    }

    if (!userData) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Timotinho - Usuário não encontrado</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .error { background: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #f39c12; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>🔍 Usuário não encontrado</h1>
            <p>Não foram encontrados dados para o usuário ID: ${userId}</p>
            <p><a href="/tim">← Voltar ao Tim</a></p>
          </div>
        </body>
        </html>
      `);
    }

    // Renderizar página do Timotinho
    const timotinhoHtml = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Timotinho - ${userData.nome || userData.apelido}</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }

        .timotinho-container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          overflow: hidden;
        }

        .timotinho-header {
          background: linear-gradient(45deg, #2c3e50, #34495e);
          color: white;
          padding: 30px;
          text-align: center;
          position: relative;
        }

        .timotinho-content {
          padding: 30px;
        }

        .user-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }

        .user-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #3498db;
        }

        .user-stats {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #2ecc71;
        }

        .info-row {
          display: flex;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #ecf0f1;
        }

        .info-label {
          font-weight: bold;
          color: #2c3e50;
          min-width: 120px;
        }

        .info-value {
          color: #34495e;
          flex: 1;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .status-active { background: #2ecc71; color: white; }
        .status-inactive { background: #95a5a6; color: white; }
        .status-admin { background: #e74c3c; color: white; }

        .level-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }

        .level-0 { background: #ecf0f1; color: #2c3e50; }
        .level-1 { background: #f39c12; color: white; }
        .level-2 { background: #e67e22; color: white; }
        .level-3 { background: #e74c3c; color: white; }

        .action-buttons {
          margin-top: 30px;
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .btn-primary { background: #3498db; color: white; }
        .btn-success { background: #2ecc71; color: white; }
        .btn-secondary { background: #95a5a6; color: white; }

        .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }

        .footer {
          text-align: center;
          padding: 20px;
          background: #ecf0f1;
          color: #7f8c8d;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .user-card { grid-template-columns: 1fr; gap: 20px; }
          .action-buttons { flex-direction: column; align-items: center; }
        }
      </style>
    </head>
    <body>
    <div class="timotinho-container">
        <div class="timotinho-header">
            <h1>🔍 Timotinho - Sistema de Gestão de Usuários</h1>
            <p>Visualização detalhada de dados do participante</p>
        </div>

        <div class="timotinho-content">
            <div class="user-card">
                <div class="user-info">
                    <h3><i class="fas fa-user"></i> Informações Pessoais</h3>

                    <div class="info-row">
                        <span class="info-label">ID:</span>
                        <span class="info-value">${userData.id}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Nome:</span>
                        <span class="info-value">${userData.nome || 'Não informado'}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Apelido:</span>
                        <span class="info-value">${userData.apelido || userData.nick || 'Não informado'}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${userData.email || 'Não informado'}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">CPF/CNPJ:</span>
                        <span class="info-value">${userData.cpf_cnpj || 'Não informado'}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Telefone:</span>
                        <span class="info-value">${userData.telefone || 'Não informado'}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Cidade/UF:</span>
                        <span class="info-value">${userData.cidade || 'N/A'}${userData.uf ? ` - ${userData.uf}` : ''}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Sexo:</span>
                        <span class="info-value">${userData.sexo === 1 ? 'Masculino' : userData.sexo === 2 ? 'Feminino' : 'Não informado'}</span>
                    </div>
                </div>

                <div class="user-stats">
                    <h3><i class="fas fa-chart-bar"></i> Status e Estatísticas</h3>

                    <div class="info-row">
                        <span class="info-label">Status:</span>
                        <span class="info-value">
                            <span class="status-badge ${userData.situacao === 1 ? 'status-active' : userData.situacao === 2 ? 'status-active' : 'status-inactive'}">
                                ${userData.situacao === 1 ? 'Ativo' : userData.situacao === 2 ? 'Inscrito' : 'Inativo'}
                            </span>
                        </span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Nível:</span>
                        <span class="info-value">
                            <span class="level-badge level-${userData.level || 0}">
                                <i class="fas fa-${userData.level >= 2 ? 'star' : userData.level >= 1 ? 'star' : 'user'}"></i>
                                Nível ${userData.level || 0} ${userData.level >= 3 ? '(Admin)' : userData.level >= 1 ? '(Staff)' : '(Usuário)'}
                            </span>
                        </span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Graduado:</span>
                        <span class="info-value">${userData.graduado ? 'Sim' : 'Não'}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Mailing:</span>
                        <span class="info-value">${userData.mailing ? 'Aceita comunicações' : 'Não aceita comunicações'}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Equipe:</span>
                        <span class="info-value">${userData.equipe || 'Nenhuma'}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Turma:</span>
                        <span class="info-value">${userData.turma || 'Não definida'}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Grupo:</span>
                        <span class="info-value">${userData.grupo || 'Não definido'}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Rede:</span>
                        <span class="info-value">${userData.rede || 'Não definida'}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Parceiro:</span>
                        <span class="info-value">${userData.parceiro || 'Não definido'}</span>
                    </div>
                </div>
            </div>

            <div class="action-buttons">
                <a href="/vr/pub" class="btn btn-primary">
                    <i class="fas fa-home"></i> Ir para Sala Virtual
                </a>
                <a href="/tim" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i> Voltar ao Tim
                </a>
                ${userData.level >= 3 ? '<a href="/admin" class="btn btn-success"><i class="fas fa-cog"></i> Painel Admin</a>' : ''}
            </div>
        </div>

        <div class="footer">
            <p><strong>Sistema Timotinho</strong> - Dados carregados em ${new Date().toLocaleString('pt-BR')}</p>
            <p>Biblos360 Virtual Room - Versão 3.0</p>
        </div>
    </div>

    <script>
        console.log('🔍 Timotinho carregado para usuário:', ${JSON.stringify(userData)});

        // Auto-refresh a cada 5 minutos para dados atualizados
        setTimeout(() => {
            location.reload();
        }, 5 * 60 * 1000);
    </script>
    </body>
    </html>
    `;

    console.log(`✅ Timotinho: Dados do usuário ${userId} (${userData.nome || userData.apelido}) carregados com sucesso`);

    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    res.send(timotinhoHtml);

  } catch (error) {
    console.error('❌ Timotinho: Erro ao carregar usuário:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Timotinho - Erro</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .error { background: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #e74c3c; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>❌ Erro interno do Timotinho</h1>
          <p>Erro: ${error.message}</p>
          <p><a href="/tim">← Voltar ao Tim</a></p>
        </div>
      </body>
      </html>
    `);
  }
};

/**
 * POST /tim/register - Cadastro administrativo de usuário monitor
 */
const timRegisterUser = async (req, res) => {
  console.log('🔧 [TIM-REGISTER] Iniciando cadastro administrativo de usuário monitor...');

  try {
    // Funções auxiliares
    const cleanCpfCnpj = (cpfCnpj) => {
      if (!cpfCnpj) return null;
      return cpfCnpj.replace(/[.\-\s]/g, ''); // Remove pontos, traços e espaços
    };

    const convertDateToISO = (dateStr) => {
      if (!dateStr) return null;

      // Se já está no formato ISO (YYYY-MM-DD), retorna como está
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }

      // Se está no formato brasileiro (DD/MM/YYYY), converte
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      // Se está no formato DDMMYYYY, converte
      if (/^\d{8}$/.test(dateStr)) {
        const day = dateStr.substring(0, 2);
        const month = dateStr.substring(2, 4);
        const year = dateStr.substring(4, 8);
        return `${year}-${month}-${day}`;
      }

      console.warn('⚠️ Formato de data não reconhecido:', dateStr);
      return null;
    };

    // Teste de conexão com Supabase
    console.log('🔗 [TIM-REGISTER] Testando conexão com Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ [TIM-REGISTER] Erro de conexão com Supabase:', testError);
      return res.status(500).json({
        success: false,
        message: `Erro de conexão com o banco de dados: ${testError.message}`
      });
    }

    console.log('✅ [TIM-REGISTER] Conexão com Supabase confirmada');

    const userData = req.body;
    console.log('📝 [TIM-REGISTER] Dados recebidos:', Object.keys(userData));

    // Limpar CPF para validações e armazenamento
    const cleanedCpf = cleanCpfCnpj(userData.cpf_cnpj);

    // Validação básica
    if (!userData.nome || !cleanedCpf || !userData.email) {
      console.error('❌ [TIM-REGISTER] Dados obrigatórios faltando');
      return res.status(400).json({
        success: false,
        message: 'Nome, CPF e e-mail são obrigatórios'
      });
    }

    // Verificar se CPF já existe
    console.log('🔍 [TIM-REGISTER] Verificando se CPF já existe...', cleanedCpf);
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, nome, email')
      .eq('cpf_cnpj', cleanedCpf)
      .maybeSingle();

    if (checkError) {
      console.error('❌ [TIM-REGISTER] Erro ao verificar CPF:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar CPF no banco de dados'
      });
    }

    if (existingUser) {
      console.error('❌ [TIM-REGISTER] CPF já cadastrado:', userData.cpf_cnpj);
      return res.status(400).json({
        success: false,
        message: `CPF já cadastrado para o usuário: ${existingUser.nome} (${existingUser.email})`
      });
    }

    // Verificar se e-mail já existe
    console.log('🔍 [TIM-REGISTER] Verificando se e-mail já existe...');
    const { data: existingEmail, error: emailError } = await supabase
      .from('users')
      .select('id, nome, cpf_cnpj')
      .eq('email', userData.email)
      .maybeSingle();

    if (emailError) {
      console.error('❌ [TIM-REGISTER] Erro ao verificar e-mail:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar e-mail no banco de dados'
      });
    }

    if (existingEmail) {
      console.error('❌ [TIM-REGISTER] E-mail já cadastrado:', userData.email);
      return res.status(400).json({
        success: false,
        message: `E-mail já cadastrado para o usuário: ${existingEmail.nome} (${existingEmail.cpf_cnpj})`
      });
    }

    // Preparar dados para inserção no Supabase
    const insertData = {
      nome: userData.nome,
      apelido: userData.apelido,
      cpf_cnpj: cleanCpfCnpj(userData.cpf_cnpj),
      data_nascimento: convertDateToISO(userData.data_nascimento),
      sexo: parseInt(userData.sexo) || null,
      estado_civil: parseInt(userData.estado_civil) || null,
      fone_tipo: parseInt(userData.fone_contato_tipo) || null,
      telefone: userData.fone_contato_ddd && userData.fone_contato_num ?
        `(${userData.fone_contato_ddd}) ${userData.fone_contato_num}` : null,
      email: userData.email,
      pais: userData.pais || null,
      cidade: userData.cidade || null,
      uf: userData.uf ? userData.uf.substring(0, 2) : null, // Garantir máximo 2 caracteres
      graduado: parseInt(userData.graduado) || 0,
      situacao: parseInt(userData.situacao) || 1, // Ativo
      level: parseInt(userData.level) || 1,       // Monitor
      equipe: userData.equipe || 'Biblos360',
      turma: userData.turma || null,
      grupo: userData.grupo || null,
      rede: userData.rede || null,
      hospedagem: userData.hospedagem || null,
      quarto: userData.quarto || null,
      parceiro: userData.parceiro || null,
      ocupacao_secular: userData.natureza || null,
      ocupacao_religiosa: userData.religiosa || null,
      area_de_atuacao: userData.atuacao || null,
      igreja_local: userData.igreja || null,
      denominacao: userData.denominacao || null,
      observacoes: userData.observacoes || null,
      pesquisa1: userData.pesquisa1 || null,
      pesquisa2: userData.pesquisa2 || null,
      mailing: parseInt(userData.mailing) || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('� [TIM-REGISTER] Dados preparados para inserção:', {
      nome: insertData.nome,
      cpf_cnpj: insertData.cpf_cnpj,
      email: insertData.email,
      data_nascimento: insertData.data_nascimento,
      sexo: insertData.sexo,
      estado_civil: insertData.estado_civil,
      level: insertData.level,
      equipe: insertData.equipe
    });

    console.log('�💾 [TIM-REGISTER] Inserindo usuário no Supabase...');
    const { data: userResult, error: insertError } = await supabase
      .from('users')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ [TIM-REGISTER] Erro ao inserir usuário:', insertError);
      throw new Error(`Erro ao salvar usuário no banco: ${insertError.message}`);
    }

    console.log('✅ [TIM-REGISTER] Usuário inserido no Supabase:', userResult.id);

    // Adicionar ao participantes.json
    console.log('📋 [TIM-REGISTER] Adicionando ao participantes.json...');
    try {
      const participantsPath = path.join(__dirname, '../../../api/participantes.json');

      // Ler arquivo atual
      let participants = [];
      try {
        const data = await fs.readFile(participantsPath, 'utf8');
        participants = JSON.parse(data);
      } catch (error) {
        console.warn('📋 [TIM-REGISTER] Arquivo participantes.json não existe, criando novo...');
        participants = [];
      }

      // Verificar se usuário já existe
      const userId = parseInt(userResult.id);
      const existingParticipant = participants.find(p => p.id === userId);

      if (!existingParticipant) {
        // Criar novo participante com dados de MONITOR
        const newParticipant = {
          id: userId,
          nick: userResult.apelido || userResult.nome.split(' ')[0],
          level: 1,                    // MONITOR
          equipe: 'Biblos360',         // Equipe fixa
          sexo: userResult.sexo || null,
          uf: userResult.uf || null,
          parceiro: "0",
          turma: null,
          grupo: null,
          rede: null
        };

        participants.push(newParticipant);

        // Salvar arquivo atualizado
        await fs.writeFile(participantsPath, JSON.stringify(participants, null, 2), 'utf8');

        console.log(`✅ [TIM-REGISTER] Usuário ${newParticipant.nick} (${userId}) adicionado ao participantes.json como MONITOR`);
      } else {
        // Atualizar usuário existente para MONITOR (SEM alterar o nick original)
        existingParticipant.level = 1;
        existingParticipant.equipe = 'Biblos360';
        // NÁO alterar o nick - manter o original do participantes.json
        existingParticipant.sexo = userResult.sexo || existingParticipant.sexo;
        existingParticipant.uf = userResult.uf || existingParticipant.uf;

        await fs.writeFile(participantsPath, JSON.stringify(participants, null, 2), 'utf8');

        console.log(`✅ [TIM-REGISTER] Usuário ${userId} atualizado no participantes.json como MONITOR`);
      }

    } catch (error) {
      console.error('❌ [TIM-REGISTER] Erro ao atualizar participantes.json:', error);
      // NÁO quebrar o fluxo - continuar mesmo com erro
    }

    // Resposta de sucesso
    const response = {
      success: true,
      message: 'Usuário monitor cadastrado com sucesso',
      user: {
        id: userResult.id,
        nome: userResult.nome,
        apelido: userResult.apelido,
        email: userResult.email,
        level: userResult.level,
        equipe: userResult.equipe,
        situacao: userResult.situacao
      }
    };

    console.log('✅ [TIM-REGISTER] Cadastro administrativo concluído com sucesso!');
    console.log(`📊 [TIM-REGISTER] Usuário: ${userResult.nome} | E-mail: ${userResult.email} | Level: Monitor (1) | Equipe: Biblos360`);

    res.status(201).json(response);

  } catch (error) {
    console.error('❌ [TIM-REGISTER] Erro no cadastro administrativo:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
};

/**
 * Função auxiliar para obter dados dos usuários (usada pelas rotas TIM)
 */
const getUsersData = async () => {
  try {
    const supabaseService = require('./supabase');
    const result = await supabaseService.getAllUsers(1000);
    return result.users;
  } catch (error) {
    console.error('[getUsersData] Erro ao buscar usuários:', error);
    return [];
  }
};

// ========================================
// SEÇÁO 7: CONTROLLERS FORUM
// ========================================

/**
 * Controller para sistema de fórum
 */
const forumController = {
  /**
   * Renderiza a página HTML do fórum baseada no template estático
   */
  renderForumPage: (roomId, item, userData) => {
    const nickname = userData.nick || 'Visitante';
    const extraData = userData.extra || {};
    
    console.log(`🔥 [FORUM CONTROLLER] Renderizando página - Room: ${roomId}, Item: ${item}, Nick: ${nickname}`);

    // Template HTML do fórum baseado no arquivo estático 1111.html
    const html = `<!doctype html>
<!--[if lt IE 7 ]> <html lang="pt" class="no-js ie6"> <![endif]-->
<!--[if IE 7 ]>    <html lang="pt" class="no-js ie7"> <![endif]-->
<!--[if IE 8 ]>    <html lang="pt" class="no-js ie8"> <![endif]-->
<!--[if IE 9 ]>    <html lang="pt" class="no-js ie9"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!-->
<html lang="pt" class="no-js virtual" prefix="og: http://ogp.me/ns#">
<!--<![endif]-->
<head itemscope itemtype="http://schema.org/Organization">

<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

<title>Fórum - Biblos360 Virtual</title>

<meta name="title" content="Fórum - Biblos360" />
<meta name="description" content="Acesso ao fórum." />
<meta name="author" content="Biblos360" />
<meta name="keywords" content="biblos360 cursos treinamentos eventos liderança" />

<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" href="/favicon-32x32.png" sizes="32x32">
<link rel="icon" href="/favicon-16x16.png" sizes="16x16">

<script type="text/javascript">
  var ___base_url___ = window.location.origin;
</script>

<link href="/css/virtual.css" rel="stylesheet" type="text/css" media="all" />
<link href="/css/bundle.css" rel="stylesheet" type="text/css" media="all" />
<link href="/css/formalize.css" rel="stylesheet" type="text/css" media="all" />

<script>
  EV_CATEGORY = 'essencial';
</script>

</head>
<body id="virtual-${roomId}-forum-${item}" class="virtual virtual-forum fluid-grid" itemscope itemtype="https://schema.org/WebPage">

<meta itemprop="name" content="Fórum - Biblos360" />
<meta itemprop="description" content="Acesso ao fórum." />

<script>
  SESSION_FIXED = true;
  SESSION_ITEM  = ${item};
</script>

<input type="hidden" value="${roomId}" id="ev">

<div id="virtual-container">

  <div id="virtual-main-chat">
    
    <div class="chat-box">

      <div class="chat-header">
        <span class="sidebar-header-actions">
          <span class="chat-leave">
            <a href="/vr/${roomId}"><i class="fas fa-window-close"></i></a>
          </span>
        </span>

        <h4>
          <i class="fas fa-comments"></i>
          <span class="chat-title">FÓRUM</span>
        </h4>
      </div>

      <script>
        NICK = "${nickname}";
        EXTRA = ${JSON.stringify(extraData)};
      </script>

      <div class="chat-loading"><i class="fas fa-spinner fa-pulse"></i></div>
  
      <div class="chat-main" data-chat-server="" data-chat-ev="${roomId}" style="display: none">

        <div class="chat-messages-container">

          <ul class="chat-messages">
            <li class="chat-message-fixed">
              <div class="chat-message-fixed-title">Conexão</div>
              <div class="chat-message-fixed-description markdown">Aproveite este espaço para apresentar-se, trocar informações ou contatos, se assim desejar.</div>
            </li>
            
            <li class="chat-message-top" style="height: 0 !important; width: 0 !important; padding: 0 !important; margin: 0 !important"></li>

            <li class="chat-message-bot" style="height: 0 !important; width: 0 !important; padding: 0 !important; margin: 0 !important"></li>

            <li class="chat-disabled chat-message-system chat-message-error" style="display: none !important">Desabilitado</li>

          </ul>

          <div class="chat-scroll-overlay">
            <div class="chat-bottom" style="display: none">
              <a href="#" class="tooltip" data-pt-position="left" data-pt-title="Rolar para a última mensagem">
                <span class="chat-unread chat-unread-zero" data-item="${item}"></span>MAIS<i class="fas fa-angle-down"></i>
              </a>
            </div>
          </div>

        </div>

        <div class="chat-overlay-container live-hidden">
          <a href="#" class="chat-overlay-close"><i class="fas fa-window-close"></i></a>
          <div class="chat-overlay"><i class="fas fa-spinner fa-pulse"></i></div>
        </div>

        <form class="chat-message-form welcome-tooltip-chat" style="display: none">
          <input type="hidden" class="chat-replyid" value="">
          <textarea class="chat-message-input chat-message-forum chat_input autoresize" 
                    placeholder="Seu comentário..." 
                    autocomplete="off" 
                    name="" 
                    rows="1" 
                    data-pt-position="bottom-left" 
                    data-pt-gravity="false" 
                    data-pt-offset-top="10" 
                    data-pt-offset-left="10" 
                    data-pt-auto-hide="4000" 
                    data-pt-icon="fas fa-info-circle" 
                    data-pt-placement="border" 
                    data-pt-title=""></textarea>
          <input type="submit" name="" value="OK" class="chat-message-submit">
        </form>
        
        <div class="chat-typing-list"></div>

      </div>

    </div>

  </div>

</div>

<!-- Scripts carregados no final para garantir DOM ready -->
<script src="/socket.io/socket.io.js" type="text/javascript"></script>
<script src="/js/libs/bundle.js" type="text/javascript"></script>
<script src="/js/libs/formalize.js" type="text/javascript"></script>
<script src="/js/libs/virtual.js" type="text/javascript"></script>

</body>
</html>`;

    return html;
  }
};

// ========================================
// SEÇÁO 8: CONTROLLERS JITSI GOOGLE CLOUD
// ========================================

/**
 * Verifica o status da instância JITSI no Google Cloud
 */
const getJitsiInstanceStatus = async (req, res) => {
  try {
    const { googleCloudJitsiService } = require('./services');

    // Verificar status da instância
    const instanceStatus = await googleCloudJitsiService.getInstanceStatus();

    // Verificar configuração local
    let localConfig = null;
    try {
      const roomPath = path.join(__dirname, '../../../api/room.json');
      const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));
      localConfig = {
        jitsi_enabled: roomData.config?.jitsi_enabled || false,
        jitsi_domain: roomData.config?.jitsi_domain || null,
        google_cloud: roomData.config?.jitsi_google_cloud || null
      };
    } catch (error) {
      console.warn('⚠️ Erro ao ler configuração local:', error.message);
    }

    const response = {
      timestamp: new Date().toISOString(),
      google_cloud: {
        instance_name: googleCloudJitsiService.config.instanceName,
        instance_status: instanceStatus.status,
        is_running: instanceStatus.isRunning,
        ip: instanceStatus.ip,
        domain: instanceStatus.domain,
        zone: googleCloudJitsiService.config.zone,
        project_id: googleCloudJitsiService.config.projectId
      },
      local_config: localConfig,
      operation_in_progress: googleCloudJitsiService.isOperationInProgress,
      consistency: {
        is_consistent: localConfig?.jitsi_enabled === instanceStatus.isRunning,
        recommendation: localConfig?.jitsi_enabled && !instanceStatus.isRunning ?
          'Instância deveria estar rodando' :
          !localConfig?.jitsi_enabled && instanceStatus.isRunning ?
            'Instância deveria estar parada' :
            'Status consistente'
      }
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Erro ao verificar status da instância JITSI:', error);
    res.status(500).json({
      error: 'Erro ao verificar status da instância JITSI',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Força sincronização entre status local e instância Google Cloud
 */
const syncJitsiStatus = async (req, res) => {
  try {
    const { googleCloudJitsiService } = require('./services');

    // Verificar status atual
    const instanceStatus = await googleCloudJitsiService.getInstanceStatus();

    // Atualizar configuração local baseada no status da instância
    const roomPath = path.join(__dirname, '../../../api/room.json');
    const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));

    const wasEnabled = roomData.config?.jitsi_enabled || false;
    const shouldBeEnabled = instanceStatus.isRunning;

    if (wasEnabled !== shouldBeEnabled) {
      roomData.config = roomData.config || {};
      roomData.config.jitsi_enabled = shouldBeEnabled;
      roomData.config.jitsi_synced_at = new Date().toISOString();

      if (shouldBeEnabled && instanceStatus.domain) {
        roomData.config.jitsi_domain = instanceStatus.domain;
      }

      await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));

      console.log(`🔄 Status JITSI sincronizado: ${wasEnabled} → ${shouldBeEnabled}`);
    }

    res.json({
      success: true,
      message: `Status sincronizado com sucesso`,
      changes: {
        was_enabled: wasEnabled,
        now_enabled: shouldBeEnabled,
        changed: wasEnabled !== shouldBeEnabled
      },
      instance_status: instanceStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao sincronizar status JITSI:', error);
    res.status(500).json({
      error: 'Erro ao sincronizar status JITSI',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Teste de conectividade com instância JITSI (debugging)
 */
const testJitsiConnectivity = async (req, res) => {
  try {
    const { googleCloudJitsiService } = require('./services');

    console.log('🧪 Iniciando teste de conectividade JITSI...');

    // Teste 1: Status da instância
    const instanceStatus = await googleCloudJitsiService.getInstanceStatus();
    console.log('📊 Status da instância:', instanceStatus);

    // Teste 2: Conectividade HTTP
    let httpTest = null;
    if (instanceStatus.isRunning) {
      try {
        const https = require('https');
        const response = await new Promise((resolve, reject) => {
          const req = https.get(`https://${googleCloudJitsiService.config.serverIP}`,
            { rejectUnauthorized: false, timeout: 10000 },
            resolve
          );
          req.on('error', reject);
          req.on('timeout', () => reject(new Error('Timeout')));
        });

        httpTest = {
          success: true,
          status_code: response.statusCode,
          message: 'Conectividade HTTP OK'
        };
        console.log('🌐 Teste HTTP:', httpTest);
      } catch (httpError) {
        httpTest = {
          success: false,
          error: httpError.message,
          message: 'Falha na conectividade HTTP'
        };
        console.log('❌ Teste HTTP falhou:', httpTest);
      }
    } else {
      httpTest = {
        success: false,
        message: 'Instância não está rodando'
      };
    }

    // Teste 3: Configuração local
    let localConfig = null;
    try {
      const roomPath = path.join(__dirname, '../../../api/room.json');
      const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));
      localConfig = {
        jitsi_enabled: roomData.config?.jitsi_enabled || false,
        jitsi_domain: roomData.config?.jitsi_domain || null,
        google_cloud: roomData.config?.jitsi_google_cloud || null
      };
      console.log('⚙️ Configuração local:', localConfig);
    } catch (error) {
      localConfig = { error: error.message };
    }

    const result = {
      timestamp: new Date().toISOString(),
      tests: {
        instance_status: instanceStatus,
        http_connectivity: httpTest,
        local_configuration: localConfig
      },
      overall_status: instanceStatus.isRunning && httpTest?.success ? 'OPERATIONAL' : 'NOT_OPERATIONAL',
      recommendation: instanceStatus.isRunning && !httpTest?.success ?
        'Instância rodando mas JITSI não respondendo - pode estar inicializando' :
        !instanceStatus.isRunning ?
          'Instância parada - precisa ser ligada' :
          'Sistema operacional'
    };

    console.log('🎯 Resultado do teste:', result.overall_status);
    res.json(result);

  } catch (error) {
    console.error('❌ Erro no teste de conectividade:', error);
    res.status(500).json({
      error: 'Erro no teste de conectividade JITSI',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// ========================================
// SEÇÁO 8: EXPORTS
// ========================================

module.exports = {
  // API Controllers
  healthCheck,
  timestamp,
  rootRedirect,
  systemStatus,
  serverInfo,
  publicConfig,
  getUsers,
  updateUser,
  deleteUser,
  includeUser,
  getUsersData,

  // Bot Controllers
  insertBots,
  removeBots,
  syncBots,

  // Chat Form Controller
  getChatForm,

  // Auth Controllers
  getSessionData,
  login,
  adminLogin,
  logout,
  clearCookies,
  getAuthStatus,
  refreshAuth,
  processLogin,
  processAdminLogin,

  // Cadastro Controllers
  cadastroStep1,
  cadastroStep2,
  cadastroStep3,
  enviarPedidoOracao,
  paginaSucessoPedidoOracao,

  // Video Controllers
  getVideoPositions,
  saveVideoPosition,
  deleteVideoPosition,
  deleteSessionPositions,
  getSessionStats,

  // Admin Controllers
  getAdminParticipants,
  getAdminFunctions,
  executeAdminAction,

  // Tim/Timotin Controllers
  timMain,
  timRegisterUser,
  getTimotinhoUser,

  // JITSI Google Cloud Controllers
  getJitsiInstanceStatus,
  syncJitsiStatus,
  testJitsiConnectivity,

  // Forum Controllers
  forumController,

  // Utilities
  renderErrorPage
};

// Função utilitária para renderizar páginas de erro
function renderErrorPage(req, res, page, errors) {
  // Por enquanto, vamos redirecionar com os erros na query string
  // O JavaScript no frontend vai detectar e exibir os erros
  const errorsParam = encodeURIComponent(JSON.stringify(errors));
  return res.redirect(`${page}?errors=${errorsParam}`);
}
