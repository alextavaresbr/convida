/**
 * ROTAS CONSOLIDADAS - BIBLOS360 VIRTUAL ROOM
 * Todas as rotas do sistema centralizadas em um arquivo
 */

// ========================================
// SEÇÁO 1: IMPORTS E DEPENDÊNCIAS
// ========================================

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const QRCode = require('qrcode');
const https = require('https');
const http = require('http');

// Importar controllers consolidados
const controllers = require('./controllers');

// Importar serviços consolidados
const services = require('./services');
const { userStabilityService, heartbeatService } = services;

// ========================================
// MIDDLEWARE DE DEBUG GLOBAL
// ========================================

// Debug middleware para todas as requisições POST
router.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log(`[ROUTE DEBUG] POST Request: ${req.url}`);
    console.log(`[ROUTE DEBUG] Headers:`, req.headers);
    console.log(`[ROUTE DEBUG] Body:`, req.body);
  }
  next();
});

// Importar services consolidados
const {
  loadRoomData,
  getFileIcon,
  formatFileSize
} = require('./services');

// Importar middlewares consolidados
const {
  optionalAuth,
  requireAuth,
  requireRoomAccess,
  asyncErrorHandler,
  commonErrors,
  errors,
  notFoundHandler,
  errorHandler
} = require('./middleware');

// ========================================
// SEÇÁO 2: UTILITÁRIOS
// ========================================

// Importar configuração para acessar os endpoints
const config = require('../config/config');

// ========================================
// ENDPOINT TEMPORÁRIO DE TESTE PARA LOGIN
// ========================================

// ENDPOINT TEMPORÁRIO DE TESTE PARA LOGIN
router.get('/test/login-amet', asyncErrorHandler(async (req, res, next) => {
  console.log('[TEST LOGIN] Simulando login do Amet...');

  // Simular dados do POST
  req.body = {
    cpf_cnpj: '23915131270',
    data_nascimento: '24081984'
  };

  // Chamar o controller de login
  return controllers.processLogin(req, res);
}));


// ========================================
// SEÇÁO 4: ROTAS BÁSICAS
// ========================================

// Rota raiz
router.get('/', controllers.rootRedirect);

// ========================================
// MIDDLEWARE DE MANUTENÇÃO
// ========================================

// Middleware para verificar modo de manutenção
router.use(asyncErrorHandler(async (req, res, next) => {
  console.log(`🔧 [MAINTENANCE DEBUG] Verificando rota: ${req.path}`);

  // Pular verificação para:
  // - Rotas da API (para que o admin possa controlar a manutenção)
  // - Rotas de assets estáticos
  // - Página de countdown
  // - Rotas do Tim (todas as variações)
  // - Health check
  const skipPaths = [
    '/api/',
    '/css/',
    '/js/',
    '/img/',
    'countdown.html',
    '/tim',
    '/admin/tim',
    '/tim.html',
    '/secure/tim.html',
    '/health',
    '/vr/timestamp',
    '/vr/sincronizar',
    '/logado',
    '/vr/pub/sessoes',
    '/inscricao',
    '/cadastro'
  ];

  console.log(`🔍 [MAINTENANCE DEBUG] Verificando skipPaths para: ${req.path}`);

  const shouldSkip = skipPaths.some(skipPath => {
    let matches = false;
    if (skipPath.endsWith('/')) {
      matches = req.path.startsWith(skipPath);
    } else if (skipPath.includes('.html')) {
      matches = req.path.includes(skipPath);
    } else {
      matches = req.path === skipPath || req.path.startsWith(skipPath + '/') || req.path.startsWith(skipPath + '?');
    }

    if (matches) {
      console.log(`🔍 [MAINTENANCE DEBUG] MATCH encontrado: "${req.path}" corresponde ao skipPath "${skipPath}"`);
    }

    return matches;
  });

  if (shouldSkip) {
    console.log(`🔧 [MAINTENANCE] Pulando verificação de manutenção para: ${req.path}`);
    return next();
  }

  // Verificar se o acesso é via Railway (desenvolvimento) - permitir sempre
  const host = req.get('host') || '';
  const isRailwayAccess = host.includes('railway.app') || host.includes('up.railway.app');

  console.log(`🔍 [MAINTENANCE DEBUG] Host: ${host}, Path: ${req.path}`);

  if (isRailwayAccess) {
    console.log(`🔧 [MAINTENANCE] Pulando manutenção - acesso via Railway: ${host}${req.path}`);
    return next();
  }

  console.log(`🔧 [MAINTENANCE DEBUG] Verificando status de manutenção para: ${host}${req.path}`);

  try {
    const maintenanceFile = path.join(__dirname, '../../../api/maintenance.json');
    const data = await fs.readFile(maintenanceFile, 'utf8');
    const maintenanceData = JSON.parse(data);

    if (maintenanceData.maintenance === true) {
      console.log(`🔧 [MAINTENANCE] Redirecionando ${req.path} para countdown.html (host: ${host})`);
      return res.redirect('/countdown.html');
    }
  } catch (error) {
    // Se não conseguir ler o arquivo, considera que não está em manutenção
    console.log('🔧 [MAINTENANCE] Erro ao verificar status, considerando inativo:', error.message);
  }

  next();
}));

// Health check
router.get('/health', controllers.healthCheck);

// ========================================
// SEÇÁO 3.0: ROTAS DE ERRO E SAÍDA
// ========================================

// Página de saída
router.get('/sair', (req, res) => {
  // Capturar dados do usuário ANTES de limpar cookies para reconexão
  const userData = {
    biblos360_site_usuario: req.cookies?.biblos360_site_usuario,
    biblos360_site_inscrito: req.cookies?.biblos360_site_inscrito,
    biblos360_admin_usuario: req.cookies?.biblos360_admin_usuario,
    biblos360_admin_inscrito: req.cookies?.biblos360_admin_inscrito,
    biblos360_time_sync: req.cookies?.biblos360_time_sync
  };

  // Armazenar dados para reconexão (usando sessão temporária)
  const reconnectToken = Date.now().toString(36) + Math.random().toString(36).substr(2);
  req.app.locals.reconnectData = req.app.locals.reconnectData || {};
  req.app.locals.reconnectData[reconnectToken] = userData;

  // Limpar dados antigos (mais de 10 minutos)
  Object.keys(req.app.locals.reconnectData).forEach(token => {
    const timestamp = parseInt(token.substring(0, 8), 36);
    if (Date.now() - timestamp > 600000) { // 10 minutos
      delete req.app.locals.reconnectData[token];
    }
  });

  // Limpar cookies depois de salvar
  res.clearCookie('biblos360_site_usuario');
  res.clearCookie('biblos360_site_inscrito');
  res.clearCookie('biblos360_admin_usuario');
  res.clearCookie('biblos360_admin_inscrito');
  res.clearCookie('biblos360_time_sync');

  const roomId = req.query.room || 'pub';
  errors.renderError(req, res, 'sair', { roomId, reconnectToken });
});

// Página de saída (legado)
router.get('/vr/sair', (req, res) => {
  // Capturar dados do usuário ANTES de limpar cookies para reconexão
  const userData = {
    biblos360_site_usuario: req.cookies?.biblos360_site_usuario,
    biblos360_site_inscrito: req.cookies?.biblos360_site_inscrito,
    biblos360_admin_usuario: req.cookies?.biblos360_admin_usuario,
    biblos360_admin_inscrito: req.cookies?.biblos360_admin_inscrito,
    biblos360_time_sync: req.cookies?.biblos360_time_sync
  };

  // Armazenar dados para reconexão (usando sessão temporária)
  const reconnectToken = Date.now().toString(36) + Math.random().toString(36).substr(2);
  req.app.locals.reconnectData = req.app.locals.reconnectData || {};
  req.app.locals.reconnectData[reconnectToken] = userData;

  // Limpar dados antigos (mais de 10 minutos)
  Object.keys(req.app.locals.reconnectData).forEach(token => {
    const timestamp = parseInt(token.substring(0, 8), 36);
    if (Date.now() - timestamp > 600000) { // 10 minutos
      delete req.app.locals.reconnectData[token];
    }
  });

  // Limpar cookies depois de salvar
  res.clearCookie('biblos360_site_usuario');
  res.clearCookie('biblos360_site_inscrito');
  res.clearCookie('biblos360_admin_usuario');
  res.clearCookie('biblos360_admin_inscrito');
  res.clearCookie('biblos360_time_sync');

  const roomId = req.query.room || 'pub';
  errors.renderError(req, res, 'sair', { roomId, reconnectToken });
});

// Página de logout automatico (timeout, desconexão forçada, etc.)
router.get('/vr/logout', (req, res) => {
  const roomId = req.query.room || 'pub';
  const reason = req.query.reason || 'unknown';

  console.log(`🚪 Página de logout automático acessada - Room: ${roomId}, Reason: ${reason}`);

  // SISTEMA PROFISSIONAL: Limpar TODOS os cookies imediatamente
  const cookiesToClear = [
    'biblos360_site_usuario',
    'biblos360_site_inscrito',
    'biblos360_admin_usuario',
    'biblos360_admin_inscrito',
    'biblos360_time_sync'
  ];

  console.log('🧹 Limpando cookies por desconexão forçada:', cookiesToClear);
  cookiesToClear.forEach(cookieName => {
    res.clearCookie(cookieName, {
      domain: undefined,
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });
  });

  // Capturar dados do usuário ANTES de limpar cookies para reconexão (apenas se necessário)
  const userData = reason !== 'timeout' ? {
    biblos360_site_usuario: req.cookies?.biblos360_site_usuario,
    biblos360_site_inscrito: req.cookies?.biblos360_site_inscrito,
    biblos360_admin_usuario: req.cookies?.biblos360_admin_usuario,
    biblos360_admin_inscrito: req.cookies?.biblos360_admin_inscrito,
    biblos360_time_sync: req.cookies?.biblos360_time_sync
  } : null;

  // Só gerar token de reconexão se houver dados válidos e NÃO for timeout
  let reconnectToken = null;
  if (userData && (userData.biblos360_site_usuario || userData.biblos360_admin_usuario)) {
    reconnectToken = Date.now().toString(36) + Math.random().toString(36).substr(2);
    req.app.locals.reconnectData = req.app.locals.reconnectData || {};
    req.app.locals.reconnectData[reconnectToken] = userData;

    // Limpar dados antigos (mais de 10 minutos)
    Object.keys(req.app.locals.reconnectData).forEach(token => {
      const timestamp = parseInt(token.substring(0, 8), 36);
      if (Date.now() - timestamp > 600000) { // 10 minutos
        delete req.app.locals.reconnectData[token];
      }
    });
  }

  // Para timeouts (20 minutos), não permitir reconexão automática - usuário deve fazer login novamente
  console.log(`🔐 Logout ${reason === 'timeout' ? 'FORÇADO POR TIMEOUT' : 'automático'} - Token de reconexão: ${reconnectToken ? 'gerado' : 'não permitido'}`);

  errors.renderError(req, res, 'sair', { roomId, reconnectToken, reason });
});

// Rota especial de reconexão - restaura cookies e redireciona
router.get('/reconectar/:token/:roomId', (req, res) => {
  const { token, roomId } = req.params;

  console.log(`🔄 Tentativa de reconexão - Token: ${token}, Room: ${roomId}`);

  // Verificar se existe dados de reconexão para este token
  const reconnectData = req.app.locals.reconnectData?.[token];

  if (!reconnectData) {
    console.log('❌ Token de reconexão inválido ou expirado');
    return res.redirect(`/vr/${roomId}`); // Redireciona sem cookies (como convidado)
  }

  console.log('✅ Token de reconexão válido - restaurando cookies e gerando novos');

  // SISTEMA PROFISSIONAL: Gerar novos cookies com dados atualizados
  const cookieOptions = {
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  };

  // Restaurar cookies com novos timestamps
  if (reconnectData.biblos360_site_usuario) {
    try {
      // Atualizar timestamp no cookie para evitar expiração
      const userData = JSON.parse(reconnectData.biblos360_site_usuario);
      userData.timestamp = Date.now(); // Novo timestamp
      res.cookie('biblos360_site_usuario', JSON.stringify(userData), cookieOptions);
      console.log('🍪 Cookie de usuário restaurado com novo timestamp');
    } catch (e) {
      // Se não for JSON, usar valor original
      res.cookie('biblos360_site_usuario', reconnectData.biblos360_site_usuario, cookieOptions);
      console.log('🍪 Cookie de usuário restaurado (formato original)');
    }
  }

  if (reconnectData.biblos360_site_inscrito) {
    res.cookie('biblos360_site_inscrito', reconnectData.biblos360_site_inscrito, cookieOptions);
    console.log('🍪 Cookie de inscrição restaurado');
  }

  if (reconnectData.biblos360_admin_usuario) {
    try {
      // Atualizar timestamp no cookie de admin
      const adminData = JSON.parse(reconnectData.biblos360_admin_usuario);
      adminData.timestamp = Date.now(); // Novo timestamp
      res.cookie('biblos360_admin_usuario', JSON.stringify(adminData), cookieOptions);
      console.log('🍪 Cookie de admin restaurado com novo timestamp');
    } catch (e) {
      // Se não for JSON, usar valor original
      res.cookie('biblos360_admin_usuario', reconnectData.biblos360_admin_usuario, cookieOptions);
      console.log('🍪 Cookie de admin restaurado (formato original)');
    }
  }

  if (reconnectData.biblos360_admin_inscrito) {
    res.cookie('biblos360_admin_inscrito', reconnectData.biblos360_admin_inscrito, cookieOptions);
    console.log('🍪 Cookie de admin inscrição restaurado');
  }

  // Cookie de sincronização de tempo SEMPRE novo
  res.cookie('biblos360_time_sync', Date.now().toString(), cookieOptions);
  console.log('🍪 Cookie de sincronização temporal gerado');

  // Limpar dados de reconexão para evitar reutilização
  delete req.app.locals.reconnectData[token];

  console.log(`🎯 Redirecionando para sala ${roomId} com novos cookies`);
  res.redirect(`/vr/${roomId}?reconnected=true`);
});

// ========================================
// SEÇÁO 3.1: ROTAS DE INSCRIÇÁO (CADASTRO)
// ========================================

// Rota simplificada para inscrição
router.get('/inscricao', (req, res) => {
  res.redirect('/inscricao/eventos/pub/step1.html');
});

// Recebe os formulários dos passos e redireciona conforme o fluxo
router.post('/cadastro/step1', controllers.cadastroStep1);
router.post('/cadastro/step2', controllers.cadastroStep2);
router.post('/cadastro/step3', controllers.cadastroStep3);

// Rota para envio de pedidos de oração
router.post('/oracao/enviar', controllers.enviarPedidoOracao);

// Rota para página de sucesso do pedido de oração
router.get('/oracao/sucesso', controllers.paginaSucessoPedidoOracao);

// Timestamp para cache busting
router.get('/vr/timestamp', controllers.timestamp);

// ========================================
// SEÇÁO 4: ROTAS DE SALA VIRTUAL ESPECÁFICAS
// ========================================

// Rota de participantes (compatível com sistema legado)
router.get('/vr/:id/participant(es|s)', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  const roomId = req.params.id;
  const { isAuthenticated, user } = req.biblos360Auth || {};

  try {
    // Carregar participantes do arquivo base na nova localização
    let participantsPath = path.join(__dirname, '../../../api/participantes.json');
    let participants = [];

    try {
      const data = await fs.readFile(participantsPath, 'utf8');
      participants = JSON.parse(data);
      console.log(`âœ… Participantes carregados para sala ${roomId}: ${participants.length} usuários`);
    } catch (error) {
      console.warn(`Arquivo participantes.json não encontrado para sala ${roomId}`);
      participants = [];
    }

    // USAR LISTA REAL DE USUÁRIOS ONLINE DO SOCKET.IO
    const { getRealOnlineUsers } = require('./services');
    const onlineUserIds = getRealOnlineUsers(roomId);
    console.log(`🔍 DEBUG: Usuários online via Socket.IO para sala ${roomId}: [${onlineUserIds.join(', ')}]`);

    // Se há usuário autenticado, garantir que está na lista de participantes
    if (isAuthenticated && user && user.data) {
      const userId = parseInt(user.data.id);

      // Procurar o usuário na lista de participantes
      let userParticipant = participants.find(p => p.id === userId);

      if (!userParticipant) {
        // Se não está na lista, buscar dados do usuário autenticado e adicionar
        try {
          // Usar dados do cookie/sessão para criar participante
          const newParticipant = {
            id: userId,
            nick: user.data.apelido || (user.data.nome ? user.data.nome.split(' ')[0] : 'Usuário'),
            level: user.data.level || 0,
            equipe: user.data.equipe || null,
            sexo: user.data.sexo || null,
            uf: user.data.uf || null,
            parceiro: user.data.parceiro || "0",
            turma: user.data.turma || null,
            grupo: user.data.grupo || null,
            rede: user.data.rede || null
          };

          participants.push(newParticipant);
          console.log(`âž• Usuário ${newParticipant.nick} (${userId}) adicionado Á  lista de participantes`);

          // Atualizar o arquivo para persistir o novo usuário
          try {
            await fs.writeFile(participantsPath, JSON.stringify(participants, null, 2));
            console.log(`ðŸ’¾ Arquivo participantes.json atualizado com novo usuário ${userId}`);
          } catch (writeError) {
            console.warn('Erro ao salvar participante no arquivo:', writeError.message);
          }
        } catch (error) {
          console.warn('Erro ao buscar dados do usuário:', error.message);
        }
      }
    }

    // Não modificar a estrutura original dos participantes
    // O frontend virtual.js espera os campos exatos como estão
    // Apenas logs para debug, mas mantém formato original
    const responseParticipants = participants.map(participant => ({
      id: participant.id,
      nick: participant.nick,
      level: participant.level || 0,
      equipe: participant.equipe,
      sexo: participant.sexo,
      uf: participant.uf,
      parceiro: participant.parceiro,
      turma: participant.turma,
      grupo: participant.grupo,
      rede: participant.rede
    }));

    console.log(`ðŸ“‹ Enviando ${responseParticipants.length} participantes para sala ${roomId} (${onlineUserIds.length} online via Socket.IO)`);

    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate', // Sem cache para lista de participantes
      'Pragma': 'no-cache',
      'Expires': '0',
      'Content-Type': 'application/json'
    });

    res.json(responseParticipants);

  } catch (error) {
    console.error(`âŒ Erro ao carregar participantes da sala ${roomId}:`, error);
    res.status(500).json([]);
  }
}));

// Rota de mensagens (compatível com sistema legado)
router.get('/vr/:id/messages', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  const roomId = req.params.id;

  try {
    const messagesPath = path.join(__dirname, '../../../api/messages.json');
    let messages = [];

    try {
      const data = await fs.readFile(messagesPath, 'utf8');
      messages = JSON.parse(data);
    } catch (error) {
      console.warn(`Arquivo messages.json não encontrado para sala ${roomId}`);
      messages = [];
    }

    // Filtrar mensagens da sala específica
    let roomMessages = messages.filter(msg =>
      msg.room === `ev:${roomId}` ||
      msg.room_id === roomId ||
      msg.room === roomId
    );

    // CORREÁ‡ÁƒO: Aplicar filtro de mensagens hidden baseado no nível do usuário
    const { isAuthenticated, user } = req.biblos360Auth || {};
    const userLevel = (isAuthenticated && user) ? (user.data?.level || 0) : 0;

    // Filtrar mensagens hidden para usuários comuns (level 0)
    // Moderadores e admins (level 1-3) veem todas as mensagens
    roomMessages = roomMessages.filter(msg => {
      const isHidden = msg.hidden === 1;
      return !isHidden || userLevel >= 1;
    });

    console.log(`ðŸ“¨ Carregando ${roomMessages.length} mensagens para sala ${roomId}, userLevel: ${userLevel}`);

    // Ordenar por timestamp
    roomMessages.sort((a, b) => (a.ts || 0) - (b.ts || 0));

    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    });

    res.json(roomMessages);

  } catch (error) {
    console.error(`âŒ Erro ao carregar mensagens da sala ${roomId}:`, error);
    res.status(500).json([]);
  }
}));

// Rota de chat.json (compatível com sistema legado) - DINÂMICA
router.get('/vr/:id/chat.json', asyncErrorHandler(async (req, res, next) => {
  const roomId = req.params.id;

  try {
    const chatPath = path.join(__dirname, '../../../api/chat.json');
    let chatData = [];

    try {
      const data = await fs.readFile(chatPath, 'utf8');
      chatData = JSON.parse(data);
    } catch (error) {
      console.warn(`Arquivo chat.json não encontrado para sala ${roomId}, retornando dados padrão`);

      // Retornar estrutura padrão baseada na documentação
      chatData = [
        {},
        {
          "sid": "DEFAULT_SESSION_ID",
          "upgrades": ["websocket"],
          "pingInterval": 25000,
          "pingTimeout": 300000
        },
        {}
      ];
    }

    // DINÂMICO: Calcular contadores atualizados para o elemento [2] (contadores)
    try {
      const { calculateDetailedUserCounts } = require('./handlers');
      const currentCounts = await calculateDetailedUserCounts(roomId);

      // Converter contadores simples em formato detalhado para chat.json
      const detailedCounts = {
        "online": currentCounts.total,
        "insc": currentCounts.insc,
        "staff": currentCounts.staff,
        "breakout": currentCounts.breakout,
        "breakout_insc": currentCounts.breakout,
        "breakout_staff": 0,
        "reuniao": currentCounts.reuniao,
        "reuniao_insc": currentCounts.reuniao,
        "reuniao_staff": 0,
        "equipe": currentCounts.equipe,
        "equipe_insc": currentCounts.equipe,
        "equipe_staff": 0,
        "rede": currentCounts.rede,
        "rede_insc": currentCounts.rede,
        "rede_staff": 0,
        "oracao": currentCounts.oracao,
        "oracao_insc": currentCounts.oracao,
        "oracao_staff": 0,
        "atendimento": currentCounts.atendimento,
        "atendimento_insc": currentCounts.atendimento,
        "atendimento_staff": 0,
        "projeto": currentCounts.projeto,
        "projeto_insc": currentCounts.projeto,
        "projeto_staff": 0,
        "grupo": currentCounts.grupo,
        "grupo_insc": currentCounts.grupo,
        "grupo_staff": 0,
        "turma": currentCounts.turma,
        "turma_insc": currentCounts.turma,
        "turma_staff": 0,
        "professor": currentCounts.professor,
        "professor_insc": currentCounts.professor,
        "professor_staff": 0,
        "sala": currentCounts.sala,
        "sala_insc": currentCounts.sala,
        "sala_staff": 0
      };

      // Se existir elemento [2] (contadores), atualizar, senão criar
      if (chatData.length >= 3) {
        chatData[2] = detailedCounts;
      } else {
        chatData.push(detailedCounts);
      }

      console.log(`🔢 DEBUG CHAT.JSON: Contadores dinâmicos para sala ${roomId}:`, {
        projeto: currentCounts.projeto,
        reuniao: currentCounts.reuniao,
        equipe: currentCounts.equipe,
        sala: currentCounts.sala,
        total: currentCounts.total
      });

    } catch (countError) {
      console.error(`❌ Erro ao calcular contadores dinâmicos para ${roomId}:`, countError);
      // Manter dados estáticos como fallback
    }

    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    });

    res.json(chatData);

  } catch (error) {
    console.error(`âŒ Erro ao carregar chat da sala ${roomId}:`, error);
    res.status(500).json([{}, {}, {}]);
  }
}));

// Rota de messages.json (compatível com sistema legado)
router.get('/vr/:id/messages.json', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  const roomId = req.params.id;

  try {
    const messagesPath = path.join(__dirname, '../../../api/messages.json');
    let messages = [];

    try {
      const data = await fs.readFile(messagesPath, 'utf8');
      messages = JSON.parse(data);
    } catch (error) {
      console.warn(`Arquivo messages.json não encontrado para sala ${roomId}`);
      messages = [];
    }

    // Filtrar mensagens da sala específica
    let roomMessages = messages.filter(msg =>
      !msg.room ||
      msg.room === `ev:${roomId}` ||
      msg.room_id === roomId ||
      msg.room === roomId
    );

    // CORREÁ‡ÁƒO: Aplicar filtro de mensagens hidden baseado no nível do usuário
    const { isAuthenticated, user } = req.biblos360Auth || {};
    const userLevel = (isAuthenticated && user) ? (user.data?.level || 0) : 0;

    // Filtrar mensagens hidden para usuários comuns (level 0)
    // Moderadores e admins (level 1-3) veem todas as mensagens
    roomMessages = roomMessages.filter(msg => {
      const isHidden = msg.hidden === 1;
      return !isHidden || userLevel >= 1;
    });

    console.log(`ðŸ“¨ Carregando ${roomMessages.length} mensagens para sala ${roomId}, userLevel: ${userLevel}`);

    // Ordenar por timestamp
    roomMessages.sort((a, b) => (a.ts || 0) - (b.ts || 0));

    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    });

    res.json(roomMessages);

  } catch (error) {
    console.error(`âŒ Erro ao carregar mensagens da sala ${roomId}:`, error);
    res.status(500).json([]);
  }
}));

// Rota de room.json (compatível com sistema legado)
router.get('/vr/:id/api/room.json', asyncErrorHandler(async (req, res, next) => {
  const roomId = req.params.id;

  try {
    const roomPath = path.join(__dirname, '../../../api/room.json');
    let roomData = {};

    try {
      const data = await fs.readFile(roomPath, 'utf8');
      roomData = JSON.parse(data);
    } catch (error) {
      console.warn(`Arquivo room.json não encontrado, retornando dados padrão`);

      roomData = {
        id: roomId,
        title: `Sala Virtual ${roomId}`,
        status: 'active',
        url: `https://biblos360.net/vr/${roomId}/`,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };
    }

    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    });

    res.json(roomData);

  } catch (error) {
    console.error(`âŒ Erro ao carregar dados da sala ${roomId}:`, error);
    res.status(500).json({});
  }
}));

// Rota de sessoes.json (compatível com sistema legado)
router.get('/vr/:id/api/sessoes.json', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  const roomId = req.params.id;

  try {
    const sessoesPath = path.join(__dirname, '../../../api/sessoes.json');
    let sessoesData = [];

    try {
      const data = await fs.readFile(sessoesPath, 'utf8');
      sessoesData = JSON.parse(data);
    } catch (error) {
      console.warn(`Arquivo sessoes.json não encontrado para sala ${roomId}`);
      sessoesData = [];
    }

    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    });

    res.json(sessoesData);

  } catch (error) {
    console.error(`âŒ Erro ao carregar sessões da sala ${roomId}:`, error);
    res.status(500).json([]);
  }
}));

// Rota de extra.json (compatível com sistema legado)
router.get('/vr/:id/api/extra.json', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  const roomId = req.params.id;

  try {
    const extraPath = path.join(__dirname, '../../../api/extra.json');
    let extraData = {};

    try {
      const data = await fs.readFile(extraPath, 'utf8');
      extraData = JSON.parse(data);
    } catch (error) {
      console.warn(`Arquivo extra.json não encontrado para sala ${roomId}`);
      extraData = {};
    }

    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    });

    res.json(extraData);

  } catch (error) {
    console.error(`âŒ Erro ao carregar dados extras da sala ${roomId}:`, error);
    res.status(500).json({});
  }
}));

// Rota de page_info.json (compatível com sistema legado)
router.get('/vr/:id/api/page_info.json', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  const roomId = req.params.id;

  try {
    const pageInfoPath = path.join(__dirname, '../../../api/page_info.json');
    let pageInfoData = {};

    try {
      const data = await fs.readFile(pageInfoPath, 'utf8');
      pageInfoData = JSON.parse(data);
    } catch (error) {
      console.warn(`Arquivo page_info.json não encontrado para sala ${roomId}`);
      pageInfoData = {
        title: `Sala Virtual ${roomId}`,
        description: `Sala virtual de eventos - ${roomId}`,
        version: '4.5',
        updated: new Date().toISOString()
      };
    }

    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    });

    res.json(pageInfoData);

  } catch (error) {
    console.error(`âŒ Erro ao carregar informações da página da sala ${roomId}:`, error);
    res.status(500).json({});
  }
}));

// Endpoint específico para inicialização do chat (fallback HTTP)
router.get('/vr/:id/init-chat', asyncErrorHandler(async (req, res, next) => {
  const roomId = req.params.id;

  try {
    console.log(`ðŸš€ Inicializando chat para sala ${roomId} via HTTP fallback`);

    // Carregar dados essenciais para o chat
    const messagesPath = path.join(__dirname, '../../../api/messages.json');
    const chatPath = path.join(__dirname, '../../../api/chat.json');

    let messages = [];
    let chatData = [];

    // Carregar mensagens
    try {
      const data = await fs.readFile(messagesPath, 'utf8');
      const allMessages = JSON.parse(data);
      messages = allMessages.filter(msg =>
        !msg.room ||
        msg.room === `ev:${roomId}` ||
        msg.room_id === roomId ||
        msg.room === roomId
      );
      messages.sort((a, b) => (a.ts || 0) - (b.ts || 0));

      // Limitar a 40 mensagens mais recentes
      if (messages.length > 40) {
        messages = messages.slice(-40);
      }
    } catch (error) {
      console.warn(`Mensagens não encontradas para sala ${roomId}`);
    }

    // Carregar dados do chat
    try {
      const data = await fs.readFile(chatPath, 'utf8');
      chatData = JSON.parse(data);
    } catch (error) {
      console.warn(`Chat.json não encontrado para sala ${roomId}, usando dados padrão`);
      chatData = [
        {},
        {
          "sid": "FALLBACK_SESSION_ID",
          "upgrades": ["websocket"],
          "pingInterval": 25000,
          "pingTimeout": 300000
        },
        {
          "online": 1,
          "insc": 1,
          "staff": 0
        }
      ];
    }

    console.log(`âœ… Chat inicializado: ${messages.length} mensagens carregadas para sala ${roomId}`);

    // Retornar dados consolidados
    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    });

    res.json({
      success: true,
      roomId: roomId,
      messages: messages,
      chat: chatData,
      timestamp: new Date().toISOString(),
      total: messages.length
    });

  } catch (error) {
    console.error(`âŒ Erro ao inicializar chat da sala ${roomId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno',
      messages: [],
      chat: []
    });
  }
}));

// ========================================
// SEÇÁO 5: AUTENTICAÇÁO
// ========================================

// Página de login
router.get('/login', controllers.login);
router.get('/login.html', controllers.login);
router.get('/vr/login.html', controllers.login);
router.get('/admin', controllers.adminLogin);
router.get('/vr/admin/login.html', controllers.adminLogin);

// Processar login
router.post('/auth/login', asyncErrorHandler(controllers.processLogin));
router.post('/auth/admin-login', asyncErrorHandler(controllers.processAdminLogin));

// Limpar cookies
router.post('/auth/clear-cookies', asyncErrorHandler(controllers.clearCookies));

// Logout voluntário (endpoint de backup)
router.post('/api/voluntary-logout', (req, res) => {
  console.log('📤 Endpoint de logout voluntário chamado');
  res.status(200).json({ status: 'ok' });
});

// Logout
router.post('/logout', asyncErrorHandler(controllers.logout));

// Logout voluntário (via sendBeacon do frontend)
router.post('/api/logout', asyncErrorHandler(async (req, res, next) => {
  try {
    const { action, roomId, userId, timestamp } = req.body;

    if (action === 'voluntary_logout' && roomId && userId) {
      console.log(`🚪 Logout voluntário recebido via HTTP - Usuário: ${userId}, Sala: ${roomId}, Timestamp: ${timestamp}`);

      // Buscar o socket do usuário para notificar logout
      const io = req.app.get('io');
      if (io) {
        // Encontrar o socket do usuário
        const sockets = await io.fetchSockets();
        for (const socket of sockets) {
          const session = socket.handshake?.session;
          if (session && session.userId == userId && session.roomId === roomId) {
            console.log(`🔍 Socket encontrado para logout voluntário: ${socket.id}`);
            socket.voluntaryLogout = true;
            socket.emit('user-logout');
            socket.disconnect(true);
            break;
          }
        }
      }

      res.status(200).json({ success: true, message: 'Logout voluntário processado' });
    } else {
      res.status(400).json({ success: false, message: 'Dados inválidos para logout voluntário' });
    }
  } catch (error) {
    console.error('❌ Erro ao processar logout voluntário via HTTP:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
}));

// Status de autenticação
router.get('/auth-status', controllers.getAuthStatus);

// Refresh de autenticação
router.post('/refresh', asyncErrorHandler(controllers.refreshAuth));

// ========================================
// SEÇÁO 5.1: USUÁRIOS ANÔNIMOS
// ========================================

// Importar funções utilitárias para usuários anônimos
const {
  createAnonymousCookie,
  createAnonymousParticipantCookie,
  formatNickname,
  validateUF
} = require('./middleware');

// Rota para criar cookie anônimo para visitantes não logados
router.post('/api/anonymous/create-visitor', asyncErrorHandler(async (req, res, next) => {
  try {
    const sessionId = require('crypto').randomBytes(16).toString('hex');
    const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';

    console.log(`👤 Criando usuário anônimo visitante - IP: ${ipAddress}`);

    // Criar cookie anônimo
    const anonymousCookieValue = createAnonymousCookie(sessionId, ipAddress, userAgent);

    // Definir opções do cookie
    const cookieOptions = {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      sameSite: 'lax'
    };

    // Configurar cookie
    res.cookie('biblos360_anonymous_user', anonymousCookieValue, cookieOptions);

    console.log(`✅ Cookie anônimo criado com sessão: ${sessionId}`);

    res.json({
      success: true,
      sessionId: sessionId,
      message: 'Usuário anônimo criado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao criar usuário anônimo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}));

// Rota para entrar no chat como usuário anônimo
router.post('/api/anonymous/join-chat', asyncErrorHandler(async (req, res, next) => {
  try {
    const { nick, uf } = req.body;

    // Validar dados de entrada
    if (!nick || !uf) {
      return res.status(400).json({
        success: false,
        message: 'Nome e UF são obrigatórios'
      });
    }

    // Validar UF
    if (!validateUF(uf)) {
      return res.status(400).json({
        success: false,
        message: 'UF inválida'
      });
    }

    // Validar nome (somente letras)
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nick)) {
      return res.status(400).json({
        success: false,
        message: 'Nome deve conter apenas letras'
      });
    }

    // Formatar nome
    const formattedNick = formatNickname(nick);
    const normalizedUF = uf.toUpperCase();

    // Verificar se o nick já está em uso (verificar participantes ativos)
    try {
      const participantsPath = path.join(__dirname, '../../../api/participantes.json');
      const participantsData = await fs.readFile(participantsPath, 'utf8');
      const participants = JSON.parse(participantsData);

      const nickInUse = participants.some(p =>
        p.nick && p.nick.toLowerCase() === formattedNick.toLowerCase()
      );

      if (nickInUse) {
        return res.status(409).json({
          success: false,
          message: 'Este nome já está em uso, por favor escolha outro.'
        });
      }
    } catch (error) {
      // Se não conseguir ler participantes, continua sem verificar
      console.warn('⚠️ Não foi possível verificar nicks em uso:', error.message);
    }

    const sessionId = require('crypto').randomBytes(16).toString('hex');
    const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';

    console.log(`🎯 Usuário anônimo entrando no chat - Nick: ${formattedNick}, UF: ${normalizedUF}`);

    // Criar cookie de participante anônimo
    const participantCookieValue = createAnonymousParticipantCookie(
      sessionId,
      ipAddress,
      userAgent,
      formattedNick,
      normalizedUF
    );

    // Definir opções do cookie
    const cookieOptions = {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      sameSite: 'lax'
    };

    // Configurar cookie de participante anônimo
    res.cookie('biblos360_anonymous_participant', participantCookieValue, cookieOptions);

    console.log(`✅ Usuário anônimo ${formattedNick} (${normalizedUF}) entrou no chat`);

    res.json({
      success: true,
      sessionId: sessionId,
      nick: formattedNick,
      uf: normalizedUF,
      message: 'Entrada no chat realizada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao processar entrada no chat:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}));

// Rota para obter formulário de chat para usuários não logados
router.get('/api/chat/form', optionalAuth, asyncErrorHandler(controllers.getChatForm));

// ========================================
// SEÇÁO 6: APIS DO SISTEMA
// ========================================

// Dados de sessão para sistema de posições
router.get('/logado', controllers.getSessionData);

// ========================================
// SEÇÁO 5: ROTAS DE API
// ========================================

// Status do sistema
router.get('/api/status', optionalAuth, controllers.systemStatus);

// Informações do servidor
router.get('/api/info', controllers.serverInfo);

// Configuração pública
router.get('/api/config', controllers.publicConfig);

// ========================================
// ENDPOINT DE MANUTENÇÃO
// ========================================

// Obter status de manutenção
router.get('/api/maintenance', asyncErrorHandler(async (req, res, next) => {
  try {
    const maintenanceFile = path.join(__dirname, '../../../api/maintenance.json');
    const data = await fs.readFile(maintenanceFile, 'utf8');
    const maintenanceData = JSON.parse(data);

    res.json({
      success: true,
      ...maintenanceData
    });
  } catch (error) {
    console.error('Erro ao ler status de manutenção:', error);
    res.json({
      success: true,
      maintenance: false,
      timestamp: new Date().toISOString(),
      admin: 'Sistema',
      history: []
    });
  }
}));

// Atualizar status de manutenção
router.post('/api/maintenance', asyncErrorHandler(async (req, res, next) => {
  try {
    const { maintenance, admin } = req.body;
    const timestamp = new Date().toISOString();

    const maintenanceFile = path.join(__dirname, '../../../api/maintenance.json');

    // Ler dados atuais
    let currentData;
    try {
      const data = await fs.readFile(maintenanceFile, 'utf8');
      currentData = JSON.parse(data);
    } catch (error) {
      currentData = { maintenance: false, history: [] };
    }

    // Adicionar ao histórico
    currentData.history = currentData.history || [];
    currentData.history.push({
      maintenance: currentData.maintenance,
      timestamp: currentData.timestamp,
      admin: currentData.admin
    });

    // Manter apenas os últimos 50 registros
    if (currentData.history.length > 50) {
      currentData.history = currentData.history.slice(-50);
    }

    // Atualizar dados
    const newData = {
      maintenance,
      timestamp,
      admin: admin || 'Admin Timotin',
      history: currentData.history
    };

    await fs.writeFile(maintenanceFile, JSON.stringify(newData, null, 2));

    console.log(`🔧 [MAINTENANCE] Status alterado para: ${maintenance ? 'ATIVO' : 'INATIVO'} por ${admin}`);

    res.json({
      success: true,
      message: `Modo de manutenção ${maintenance ? 'ativado' : 'desativado'} com sucesso`,
      ...newData
    });
  } catch (error) {
    console.error('Erro ao salvar status de manutenção:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}));

// ========================================
// ENDPOINT DE NÍVEIS DE ACESSO
// ========================================

// Atualizar nível de um participante
router.post('/api/participants/level', asyncErrorHandler(async (req, res, next) => {
  try {
    const { participantId, level } = req.body;

    // Validações
    if (!participantId || level === undefined) {
      return res.status(400).json({
        success: false,
        message: 'ID do participante e nível são obrigatórios'
      });
    }

    const levelNum = parseInt(level);
    if (isNaN(levelNum) || levelNum < 0 || levelNum > 2) {
      return res.status(400).json({
        success: false,
        message: 'Nível deve ser um número entre 0 e 2'
      });
    }

    const participantsFile = path.join(__dirname, '../../../api/participantes.json');

    // Ler dados atuais
    let participants = [];
    try {
      const data = await fs.readFile(participantsFile, 'utf8');
      participants = JSON.parse(data);
    } catch (error) {
      console.error('Erro ao ler participantes.json:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar participantes'
      });
    }

    // Encontrar participante
    const participantIndex = participants.findIndex(p => p.id === participantId);
    if (participantIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Participante não encontrado'
      });
    }

    // Atualizar nível
    const oldLevel = participants[participantIndex].level;
    participants[participantIndex].level = levelNum;
    participants[participantIndex].lastActivity = new Date().toISOString();

    // Salvar arquivo
    await fs.writeFile(participantsFile, JSON.stringify(participants, null, 2));

    const levelNames = { 0: 'Participante', 1: 'Moderador', 2: 'Docente' };
    console.log(`🔐 [LEVELS] Nível do participante ${participantId} alterado de ${oldLevel} (${levelNames[oldLevel]}) para ${levelNum} (${levelNames[levelNum]})`);

    res.json({
      success: true,
      message: `Nível alterado para ${levelNames[levelNum]} com sucesso`,
      data: {
        participantId,
        oldLevel,
        newLevel: levelNum,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar nível do participante:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}));

// ========================================
// ENDPOINT DE TESTE PARA NOTIFICAÇÕES
// ========================================

// Teste de notificação manual (apenas para debug)
router.post('/api/test-notification', asyncErrorHandler(async (req, res, next) => {
  console.log('🧪 [TEST] Endpoint de teste de notificação chamado');

  const { message, extra } = req.body;
  const testMessage = message || 'Teste de notificação do servidor';
  const testExtra = extra || null;

  // Obter instância do Socket.IO do app
  const io = req.app.get('io');

  if (!io) {
    return res.status(500).json({
      error: 'Socket.IO não disponível',
      success: false
    });
  }

  // Verificar quantos clientes estão conectados na sala pub
  const pubRoom = io.sockets.adapter.rooms.get('pub');
  const pubClients = pubRoom?.size || 0;

  console.log(`🧪 [TEST] Enviando notificação de teste para sala 'pub' (${pubClients} clientes)`);
  console.log(`🧪 [TEST] Mensagem: "${testMessage}"${testExtra ? ` | Extra: "${testExtra}"` : ''}`);

  // Enviar notificação para todos na sala pub
  io.to('pub').emit('notification', testMessage, testExtra);

  res.json({
    success: true,
    message: 'Notificação de teste enviada',
    data: {
      targetRoom: 'pub',
      clientCount: pubClients,
      testMessage,
      testExtra
    }
  });
}));

// QR Code Generator
router.get('/api/qr', asyncErrorHandler(async (req, res, next) => {
  try {
    const url = req.query.url || req.query.text;

    if (!url) {
      return res.status(400).json({
        error: 'URL é obrigatória',
        message: 'Use: /api/qr?url=https://exemplo.com'
      });
    }

    // Configurações do QR Code
    const options = {
      type: 'png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: parseInt(req.query.size) || 256
    };

    // Gerar QR code como buffer
    const qrBuffer = await QRCode.toBuffer(url, options);

    // Definir headers para imagem PNG
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': qrBuffer.length,
      'Cache-Control': 'public, max-age=86400' // Cache por 24 horas
    });

    res.send(qrBuffer);

  } catch (error) {
    console.error('Erro ao gerar QR code:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: 'Não foi possível gerar o QR code'
    });
  }
}));

// QR Code específico para sala pública
router.get('/qr/pub', asyncErrorHandler(async (req, res, next) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const pubUrl = `${protocol}://${host}/vr/pub`;

    // Configurações do QR Code para sala pública
    const options = {
      type: 'png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#2563eb', // Azul
        light: '#FFFFFF'
      },
      width: parseInt(req.query.size) || 300
    };

    const qrBuffer = await QRCode.toBuffer(pubUrl, options);

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': qrBuffer.length,
      'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      'X-QR-URL': pubUrl // Header informativo
    });

    res.send(qrBuffer);

  } catch (error) {
    console.error('Erro ao gerar QR code da sala pública:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: 'Não foi possível gerar o QR code da sala pública'
    });
  }
}));

// Página de teste para QR Codes
router.get('/qr-test', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.headers.host;

  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>QR Code Generator - Biblos360</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
                text-align: center;
                background: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .qr-container {
                margin: 20px 0;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 8px;
                background: #fafafa;
            }
            h1 { color: #2563eb; }
            h3 { margin-bottom: 10px; color: #333; }
            img {
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                background: white;
                padding: 10px;
            }
            .url {
                font-family: monospace;
                background: #e5e7eb;
                padding: 8px;
                border-radius: 4px;
                margin: 10px 0;
                word-break: break-all;
            }
            .info {
                background: #eff6ff;
                border: 1px solid #93c5fd;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #1e40af;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔍 QR Code Generator</h1>
            <p>Gerador de QR Codes para Biblos360 Virtual Room</p>

            <div class="info">
                <strong>📍 Endpoints disponíveis:</strong><br>
                • <code>/api/qr?url=URL</code> - QR genérico<br>
                • <code>/qr/pub</code> - QR da sala pública<br>
                • Parâmetro opcional: <code>&size=300</code>
            </div>

            <div class="qr-container">
                <h3>📋 Sala Pública</h3>
                <div class="url">${protocol}://${host}/vr/pub</div>
                <img src="/qr/pub?size=250" alt="QR Code Sala Pública" />
                <br><br>
                <a href="/qr/pub" target="_blank">📱 Ver QR em tamanho real</a>
            </div>

            <div class="qr-container">
                <h3>🔗 QR Personalizado</h3>
                <div class="url">${protocol}://${host}/api/qr?url=${protocol}://${host}/vr/pub</div>
                <img src="/api/qr?url=${protocol}://${host}/vr/pub&size=250" alt="QR Code Personalizado" />
                <br><br>
                <a href="/api/qr?url=${protocol}://${host}/vr/pub" target="_blank">📱 Ver QR em tamanho real</a>
            </div>

            <div class="info">
                <strong>💡 Como usar:</strong><br>
                Compartilhe o QR code para acesso rápido à sala pública.<br>
                O QR nunca expira e é gerado pelo seu próprio servidor.
            </div>
        </div>
    </body>
    </html>
  `);
});

// API Users removida - usar rotas do TIM
router.get('/api/users', (req, res) => {
  res.status(404).json({
    error: 'API removida',
    message: 'Use as rotas do TIM: /admin/tim/api/users',
    timestamp: new Date().toISOString()
  });
});

router.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  res.status(404).json({
    error: 'API removida',
    message: `Use as rotas do TIM: /admin/tim/api/users/${userId}`,
    timestamp: new Date().toISOString()
  });
});

router.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  res.status(404).json({
    error: 'API removida',
    message: `Use as rotas do TIM: /admin/tim/api/users/${userId}`,
    timestamp: new Date().toISOString()
  });
});

router.post('/api/users/:id/include', (req, res) => {
  const userId = req.params.id;
  res.status(404).json({
    error: 'API removida',
    message: `Use as rotas do TIM: /admin/tim/api/users/${userId}/include`,
    timestamp: new Date().toISOString()
  });
});

// ========================================
// SEÇÁO 4A: ROTAS JITSI GOOGLE CLOUD
// ========================================

// Status da instância JITSI no Google Cloud
router.get('/api/jitsi/instance/status', controllers.getJitsiInstanceStatus);

// Sincronizar status local com instância Google Cloud
router.post('/api/jitsi/instance/sync', controllers.syncJitsiStatus);

// Teste de conectividade JITSI (debugging)
router.get('/api/jitsi/test', controllers.testJitsiConnectivity);

// Proxy para external_api.js do Jitsi (contorna CORS e SSL)
router.get('/api/jitsi/external_api.js', asyncErrorHandler(async (req, res, next) => {
  console.log('🔄 [JITSI PROXY] Requisição para external_api.js via proxy');

  const options = {
    hostname: 'meet.biblos360.net',
    port: 443,
    path: '/external_api.js',
    method: 'GET',
    rejectUnauthorized: false, // Aceita certificados auto-assinados
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; BIBLOS360-Proxy/1.0)'
    }
  };

  try {
    const proxyReq = https.request(options, (proxyRes) => {
      console.log(`🌐 [JITSI PROXY] Status: ${proxyRes.statusCode}`);

      // Configurar headers CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'public, max-age=3600');

      // Copiar status code
      res.status(proxyRes.statusCode);

      // Pipe da resposta
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      console.error('❌ [JITSI PROXY] Erro:', error.message);
      res.status(500).json({
        error: 'Proxy failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    });

    proxyReq.on('timeout', () => {
      console.error('⏰ [JITSI PROXY] Timeout');
      res.status(504).json({
        error: 'Proxy timeout',
        timestamp: new Date().toISOString()
      });
    });

    proxyReq.setTimeout(10000); // 10s timeout
    proxyReq.end();

  } catch (error) {
    console.error('💥 [JITSI PROXY] Erro inesperado:', error);
    res.status(500).json({
      error: 'Internal proxy error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// Proxy para interface_config.js do Jitsi (contorna CORS e SSL)
router.get('/api/jitsi/interface_config.js', asyncErrorHandler(async (req, res, next) => {
  console.log('🔄 [JITSI PROXY] Requisição para interface_config.js via proxy');

  const options = {
    hostname: 'meet.biblos360.net',
    port: 443,
    path: '/interface_config.js',
    method: 'GET',
    rejectUnauthorized: false, // Aceita certificados auto-assinados
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; BIBLOS360-Proxy/1.0)'
    }
  };

  try {
    const proxyReq = https.request(options, (proxyRes) => {
      console.log(`🌐 [JITSI PROXY interface_config] Status: ${proxyRes.statusCode}`);

      // Configurar headers CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'public, max-age=3600');

      // Copiar status code
      res.status(proxyRes.statusCode);

      // Pipe da resposta
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      console.error('❌ [JITSI PROXY interface_config] Erro:', error.message);
      res.status(500).json({
        error: 'Proxy failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    });

    proxyReq.on('timeout', () => {
      console.error('⏰ [JITSI PROXY interface_config] Timeout');
      res.status(504).json({
        error: 'Proxy timeout',
        timestamp: new Date().toISOString()
      });
    });

    proxyReq.setTimeout(10000); // 10s timeout
    proxyReq.end();

  } catch (error) {
    console.error('💥 [JITSI PROXY interface_config] Erro inesperado:', error);
    res.status(500).json({
      error: 'Internal proxy error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// Proxy para config.js do Jitsi (contorna CORS e SSL)
router.get('/api/jitsi/config.js', asyncErrorHandler(async (req, res, next) => {
  console.log('🔄 [JITSI PROXY] Requisição para config.js via proxy');

  const options = {
    hostname: 'meet.biblos360.net',
    port: 443,
    path: '/config.js',
    method: 'GET',
    rejectUnauthorized: false, // Aceita certificados auto-assinados
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; BIBLOS360-Proxy/1.0)'
    }
  };

  try {
    const proxyReq = https.request(options, (proxyRes) => {
      console.log(`🌐 [JITSI PROXY config] Status: ${proxyRes.statusCode}`);

      // Configurar headers CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'public, max-age=3600');

      // Copiar status code
      res.status(proxyRes.statusCode);

      // Pipe da resposta
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      console.error('❌ [JITSI PROXY config] Erro:', error.message);
      res.status(500).json({
        error: 'Proxy failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    });

    proxyReq.on('timeout', () => {
      console.error('⏰ [JITSI PROXY config] Timeout');
      res.status(504).json({
        error: 'Proxy timeout',
        timestamp: new Date().toISOString()
      });
    });

    proxyReq.setTimeout(10000); // 10s timeout
    proxyReq.end();

  } catch (error) {
    console.error('💥 [JITSI PROXY config] Erro inesperado:', error);
    res.status(500).json({
      error: 'Internal proxy error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// Proxy para recursos estáticos do JITSI (CSS, JS, imagens, etc.)
router.get('/css/*', asyncErrorHandler(async (req, res, next) => {
  const resourcePath = req.path;
  console.log(`🎨 [JITSI CSS PROXY] Requisição para: ${resourcePath}`);

  const options = {
    hostname: 'meet.biblos360.net',
    port: 443,
    path: resourcePath,
    method: 'GET',
    rejectUnauthorized: false,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; BIBLOS360-Proxy/1.0)'
    }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    console.log(`🌐 [CSS PROXY] Status: ${proxyRes.statusCode}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    console.error(`❌ [CSS PROXY] Erro: ${error.message}`);
    res.status(500).send('Erro no proxy CSS');
  });

  proxyReq.end();
}));

// === ROTAS ESTÁTICAS JAVASCRIPT ===
// IMPORTANTE: Estas rotas devem vir ANTES do proxy JITSI para ter prioridade

// Rotas específicas para TIM (maior prioridade)
router.use('/tim/js', express.static(path.join(__dirname, '../../../apps/tim.biblos360.net/public/js')));
router.use('/tim/css', express.static(path.join(__dirname, '../../../apps/tim.biblos360.net/public/css')));

// Arquivos do TIM têm PRIORIDADE (para /tim servir corretamente)
router.use('/js', express.static(path.join(__dirname, '../../../apps/tim.biblos360.net/public/js')));
router.use('/css', express.static(path.join(__dirname, '../../../apps/tim.biblos360.net/public/css')));

// Fallback para arquivos gerais do sistema principal
router.use('/css', express.static(path.join(__dirname, '../public/css')));
router.use('/js', express.static(path.join(__dirname, '../public/js')));
router.use('/img', express.static(path.join(__dirname, '../public/img')));
router.use('/webfonts', express.static(path.join(__dirname, '../public/webfonts')));

// Proxy para JavaScript do JITSI (apenas para arquivos não encontrados localmente)
router.get('/js/*', asyncErrorHandler(async (req, res, next) => {
  const resourcePath = req.path;
  console.log(`📜 [JITSI JS PROXY] Requisição para: ${resourcePath}`);

  const options = {
    hostname: 'meet.biblos360.net',
    port: 443,
    path: resourcePath,
    method: 'GET',
    rejectUnauthorized: false,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; BIBLOS360-Proxy/1.0)'
    }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    console.log(`🌐 [JS PROXY] Status: ${proxyRes.statusCode}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    console.error(`❌ [JS PROXY] Erro: ${error.message}`);
    res.status(500).send('Erro no proxy JS');
  });

  proxyReq.end();
}));

// Proxy para imagens do JITSI
router.get('/images/*', asyncErrorHandler(async (req, res, next) => {
  const resourcePath = req.path;
  console.log(`🖼️ [JITSI IMAGE PROXY] Requisição para: ${resourcePath}`);

  const options = {
    hostname: 'meet.biblos360.net',
    port: 443,
    path: resourcePath,
    method: 'GET',
    rejectUnauthorized: false,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; BIBLOS360-Proxy/1.0)'
    }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    console.log(`🌐 [IMAGE PROXY] Status: ${proxyRes.statusCode}`);
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Detectar tipo de imagem
    const ext = resourcePath.toLowerCase().split('.').pop();
    const imageTypes = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml'
    };

    res.setHeader('Content-Type', imageTypes[ext] || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    console.error(`❌ [IMAGE PROXY] Erro: ${error.message}`);
    res.status(500).send('Erro no proxy de imagem');
  });

  proxyReq.end();
}));

// Proxy para bibliotecas JavaScript do JITSI
router.get('/libs/*', asyncErrorHandler(async (req, res, next) => {
  const resourcePath = req.path;
  console.log(`📚 [JITSI LIBS PROXY] Requisição para: ${resourcePath}`);

  const options = {
    hostname: 'meet.biblos360.net',
    port: 443,
    path: resourcePath,
    method: 'GET',
    rejectUnauthorized: false,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; BIBLOS360-Proxy/1.0)'
    }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    console.log(`🌐 [LIBS PROXY] Status: ${proxyRes.statusCode}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    console.error(`❌ [LIBS PROXY] Erro: ${error.message}`);
    res.status(500).send('Erro no proxy LIBS');
  });

  proxyReq.end();
}));

// Proxy genérico para recursos do JITSI (css, js, images, etc)
router.get('/api/jitsi/proxy/*', asyncErrorHandler(async (req, res, next) => {
  const resourcePath = req.params[0]; // Pega tudo após /api/jitsi/proxy/
  console.log(`🔄 [JITSI PROXY] Requisição para recurso: ${resourcePath}`);

  const options = {
    hostname: 'meet.biblos360.net',
    port: 443,
    path: '/' + resourcePath,
    method: 'GET',
    rejectUnauthorized: false, // Aceita certificados auto-assinados
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; BIBLOS360-Proxy/1.0)'
    }
  };

  try {
    const proxyReq = https.request(options, (proxyRes) => {
      console.log(`🌐 [JITSI PROXY ${resourcePath}] Status: ${proxyRes.statusCode}`);

      // Configurar headers CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');

      // Detectar tipo de conteúdo baseado na extensão
      const ext = resourcePath.toLowerCase().split('.').pop();
      const contentTypes = {
        'js': 'application/javascript',
        'css': 'text/css',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
        'ttf': 'font/ttf'
      };

      const contentType = contentTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');

      // Copiar status code
      res.status(proxyRes.statusCode);

      // Pipe da resposta
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      console.error(`❌ [JITSI PROXY ${resourcePath}] Erro:`, error.message);
      res.status(500).json({
        error: 'Proxy failed',
        message: error.message,
        resource: resourcePath,
        timestamp: new Date().toISOString()
      });
    });

    proxyReq.on('timeout', () => {
      console.error(`⏰ [JITSI PROXY ${resourcePath}] Timeout`);
      res.status(504).json({
        error: 'Proxy timeout',
        resource: resourcePath,
        timestamp: new Date().toISOString()
      });
    });

    proxyReq.setTimeout(10000); // 10s timeout
    proxyReq.end();

  } catch (error) {
    console.error(`💥 [JITSI PROXY ${resourcePath}] Erro inesperado:`, error);
    res.status(500).json({
      error: 'Internal proxy error',
      message: error.message,
      resource: resourcePath,
      timestamp: new Date().toISOString()
    });
  }
}));

// ========================================
// SEÇÁO JITSI: PROXY TRANSPARENTE
// ========================================

// Rota que simula ser o servidor Jitsi para o JitsiMeetExternalAPI
router.get('/:roomName', asyncErrorHandler(async (req, res, next) => {
  const roomName = req.params.roomName;

  // Verificar se é uma requisição do Jitsi (tem parâmetros específicos)
  const hasJitsiParams = req.query.hasOwnProperty('config.startWithAudioMuted') ||
    req.query.hasOwnProperty('interfaceConfig.APP_NAME') ||
    req.query.hasOwnProperty('jitsi_meet_external_api_id');

  if (!hasJitsiParams) {
    return next(); // Não é requisição Jitsi, passar para próxima rota
  }

  console.log(`🎥 [JITSI PROXY] Requisição para sala: ${roomName}`);
  console.log(`🎥 [JITSI PROXY] Query params:`, Object.keys(req.query));

  // Fazer proxy para o servidor Jitsi real
  const options = {
    hostname: 'meet.biblos360.net',
    port: 443,
    path: `/${roomName}?${new URLSearchParams(req.query)}`,
    method: 'GET',
    rejectUnauthorized: false, // Aceita certificados auto-assinados
    headers: {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (compatible; BIBLOS360-Proxy/1.0)',
      'Accept': req.headers.accept || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': req.headers['accept-language'] || 'pt-BR,pt;q=0.9,en;q=0.8'
    }
  };

  try {
    const proxyReq = https.request(options, (proxyRes) => {
      console.log(`🌐 [JITSI PROXY ${roomName}] Status: ${proxyRes.statusCode}`);

      // Copiar headers relevantes
      Object.keys(proxyRes.headers).forEach(key => {
        if (key.toLowerCase() !== 'content-encoding') {
          res.setHeader(key, proxyRes.headers[key]);
        }
      });

      res.status(proxyRes.statusCode);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      console.error(`❌ [JITSI PROXY ${roomName}] Erro:`, error.message);
      res.status(500).send(`Erro de conexão com servidor Jitsi: ${error.message}`);
    });

    proxyReq.setTimeout(10000);
    proxyReq.end();

  } catch (error) {
    console.error(`💥 [JITSI PROXY ${roomName}] Erro inesperado:`, error);
    res.status(500).send(`Erro interno: ${error.message}`);
  }
}));

// ========================================
// SEÇÁO TIM: ROTAS DE ADMINISTRAÇÁO SEGURA
// ========================================

// Middleware específico para TIM (sem dependência de cookies)
const timAuthMiddleware = (req, res, next) => {
  // Verificar se existe sessão TIM ativa
  if (!req.session.timAuth || !req.session.timAuth.authenticated) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Acesso não autorizado ao TIM',
      redirectTo: '/tim/login'
    });
  }

  // Verificar timeout da sessão
  if (req.session.timAuth.loginTime) {
    const sessionAge = Date.now() - req.session.timAuth.loginTime;
    const maxAge = 10 * 60 * 1000; // 10 minutos

    if (sessionAge > maxAge) {
      req.session.timAuth = null;
      return res.status(401).json({
        error: 'Session expired',
        message: 'Sessão expirada',
        redirectTo: '/tim/login'
      });
    }
  }

  console.log(`[TIM AUTH] Acesso autorizado para: ${req.path}`);
  next();
};

// Middleware para verificar sessão TIM e redirecionar para login se necessário
const timAuthOrRedirect = (req, res, next) => {
  // Verificar se existe sessão TIM ativa
  if (!req.session.timAuth || !req.session.timAuth.authenticated) {
    return res.redirect('/tim/login'); // Redirecionar para login do TIM
  }

  // Verificar timeout da sessão (10 minutos) - só se a sessão existir
  if (req.session.timAuth && req.session.timAuth.loginTime) {
    const sessionAge = Date.now() - req.session.timAuth.loginTime;
    const maxAge = 10 * 60 * 1000; // 10 minutos

    if (sessionAge > maxAge) {
      req.session.timAuth = null;
      return res.redirect('/tim/login'); // Redirecionar para login após timeout
    }
  }

  // Atualizar último acesso - só se a sessão existir
  if (req.session.timAuth) {
    req.session.timAuth.lastActivity = Date.now();
  }

  next();
};

// Página de login TIM (redireciona para rota unificada)
router.get('/admin/tim/login', (req, res) => {
  res.redirect('/tim/login');
});

// === ROTAS DE AUTENTICAÇÃO INDEPENDENTES DO TIM ===

// Login TIM (rota independente)
router.post('/tim/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Credenciais do TIM via variáveis de ambiente
    const timCredentials = {
      [process.env.TIM_ADMIN_USERNAME || 'admin']: process.env.TIM_ADMIN_PASSWORD || 'Virtu41@*'
    };

    if (!timCredentials[username] || timCredentials[username] !== password) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Usuário ou senha inválidos'
      });
    }

    // Criar sessão TIM
    req.session.timAuth = {
      authenticated: true,
      username: username,
      loginTime: Date.now(),
      lastActivity: Date.now()
    };

    console.log(`🔑 [TIM] Login bem-sucedido: ${username}`);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      username: username
    });

  } catch (error) {
    console.error('⚠️ [TIM] Erro no login:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erro interno do servidor'
    });
  }
});

// Logout TIM (rota independente)
router.post('/tim/auth/logout', (req, res) => {
  req.session.timAuth = null;
  res.json({ success: true, message: 'Logout realizado com sucesso' });
});

// Verificar status de autenticação TIM (rota independente)
router.get('/tim/auth/status', (req, res) => {
  const isAuthenticated = req.session.timAuth?.authenticated || false;
  res.json({
    authenticated: isAuthenticated,
    username: isAuthenticated ? req.session.timAuth.username : null
  });
});

// Página de login TIM (rota independente)
router.get('/tim/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TIM - Login de Acesso</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .login-container {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                width: 100%;
                max-width: 400px;
                text-align: center;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: #333;
                margin-bottom: 30px;
                text-transform: uppercase;
                letter-spacing: 3px;
            }
            .form-group {
                margin-bottom: 20px;
                text-align: left;
            }
            label {
                display: block;
                margin-bottom: 8px;
                color: #555;
                font-weight: 500;
            }
            input {
                width: 100%;
                padding: 12px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 16px;
                transition: border-color 0.3s;
                box-sizing: border-box;
            }
            input:focus {
                outline: none;
                border-color: #667eea;
            }
            .login-btn {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s;
            }
            .login-btn:hover {
                transform: translateY(-2px);
            }
            .error {
                color: #e74c3c;
                margin-top: 15px;
                padding: 10px;
                background: #ffeaea;
                border-radius: 6px;
                display: none;
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <div class="logo">TIM</div>
            <form id="loginForm">
                <div class="form-group">
                    <label for="username">Usuário:</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Senha:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" class="login-btn">Entrar</button>
            </form>
            <div id="error" class="error"></div>
        </div>

        <script>
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
                e.preventDefault();

                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const errorDiv = document.getElementById('error');

                try {
                    const response = await fetch('/tim/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ username, password })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        window.location.href = '/tim';
                    } else {
                        errorDiv.textContent = data.message || 'Erro no login';
                        errorDiv.style.display = 'block';
                    }
                } catch (error) {
                    errorDiv.textContent = 'Erro de conexão';
                    errorDiv.style.display = 'block';
                }
            });
        </script>
    </body>
    </html>
  `);
});

// === ROTAS DE AUTENTICAÇÃO ORIGINAIS ===

// Autenticação TIM
router.post('/admin/tim/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Credenciais do TIM via variáveis de ambiente
    const timCredentials = {
      [process.env.TIM_ADMIN_USERNAME || 'admin']: process.env.TIM_ADMIN_PASSWORD || 'Virtu41@*'
    };

    if (!timCredentials[username] || timCredentials[username] !== password) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Usuário ou senha inválidos'
      });
    }

    // Criar sessão TIM
    req.session.timAuth = {
      authenticated: true,
      username: username,
      loginTime: Date.now(),
      lastActivity: Date.now()
    };

    console.log(`ðŸ”’ [TIM] Login bem-sucedido: ${username}`);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      username: username
    });

  } catch (error) {
    console.error('âŒ [TIM] Erro no login:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Erro interno do servidor'
    });
  }
});

// Logout TIM
router.post('/admin/tim/auth/logout', (req, res) => {
  req.session.timAuth = null;
  res.json({ success: true, message: 'Logout realizado com sucesso' });
});

// Verificar status de autenticação TIM
router.get('/admin/tim/auth/status', (req, res) => {
  const isAuthenticated = req.session.timAuth?.authenticated || false;
  res.json({
    authenticated: isAuthenticated,
    username: isAuthenticated ? req.session.timAuth.username : null
  });
});

// Rota principal do painel TIM - Acesso independente (localhost:3000/tim)
router.get('/tim', timAuthOrRedirect, asyncErrorHandler(async (req, res, next) => {
  try {
    const timHtmlPath = path.join(__dirname, '../../../apps/tim.biblos360.net/secure/tim.html');
    const htmlExists = await fs.access(timHtmlPath).then(() => true).catch(() => false);

    if (htmlExists) {
      const html = await fs.readFile(timHtmlPath, 'utf8');
      res.send(html);
    } else {
      res.status(404).json({
        error: 'TIM interface not found',
        message: 'Interface TIM não encontrada'
      });
    }
  } catch (error) {
    console.error('⚠️ Erro ao carregar interface TIM:', error);
    res.status(500).json({
      error: 'Failed to load TIM interface',
      message: 'Erro ao carregar interface TIM'
    });
  }
}));

// Rota principal do painel TIM
router.get('/admin/tim', timAuthMiddleware, asyncErrorHandler(async (req, res, next) => {
  try {
    const timHtmlPath = path.join(__dirname, '../../../apps/tim.biblos360.net/secure/tim.html');
    const htmlExists = await fs.access(timHtmlPath).then(() => true).catch(() => false);

    if (htmlExists) {
      const html = await fs.readFile(timHtmlPath, 'utf8');
      res.send(html);
    } else {
      res.status(404).json({
        error: 'TIM interface not found',
        message: 'Interface TIM não encontrada'
      });
    }
  } catch (error) {
    console.error('âŒ Erro ao carregar interface TIM:', error);
    res.status(500).json({
      error: 'Failed to load TIM interface',
      message: 'Erro ao carregar interface TIM'
    });
  }
}));

// Rota principal do painel TIM (redirecionamento)
router.get('/admin/tim/', timAuthMiddleware, asyncErrorHandler(async (req, res, next) => {
  res.redirect('/admin/tim');
}));

// === ROTAS INDEPENDENTES DO TIM (localhost:3000/tim) ===

// Servir arquivos estáticos específicos do TIM (JS, CSS, etc.)
router.use('/tim/js', express.static(
  path.join(__dirname, '../../../apps/tim.biblos360.net/public/js'),
  {
    maxAge: '1h',
    setHeaders: (res, path) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }
));

router.use('/tim/css', express.static(
  path.join(__dirname, '../../../apps/tim.biblos360.net/public/css'),
  {
    maxAge: '1h',
    setHeaders: (res, path) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }
));

// Redirecionamento para a rota independente
router.get('/tim/', timAuthOrRedirect, asyncErrorHandler(async (req, res, next) => {
  res.redirect('/tim');
}));

// API TIM: Lista de usuários (rota independente)
router.get('/tim/api/users', timAuthMiddleware, controllers.getUsers);

// API TIM: Atualizar usuário (rota independente)
router.put('/tim/api/users/:id', timAuthMiddleware, controllers.updateUser);

// API TIM: Excluir usuário da sala (rota independente)
router.delete('/tim/api/users/:id', timAuthMiddleware, controllers.deleteUser);

// API TIM: Incluir usuário na sala (rota independente)
router.post('/tim/api/users/:id/include', timAuthMiddleware, controllers.includeUser);

// API TIM: Dados dos participantes (rota independente)
router.get('/tim/api/participantes.json', timAuthMiddleware, asyncErrorHandler(async (req, res, next) => {
  try {
    const participantsPath = path.join(__dirname, '../../api/participantes.json');
    const participants = await fs.readFile(participantsPath, 'utf8');
    res.json(JSON.parse(participants));
  } catch (error) {
    console.error('⚠️ Erro ao carregar participantes TIM:', error);
    res.status(500).json([]);
  }
}));

// API TIM: Analytics e estatísticas (rota independente)
router.get('/tim/api/analytics', timAuthMiddleware, asyncErrorHandler(async (req, res, next) => {
  try {
    // Carregar dados de usuários e participantes
    const users = await controllers.getUsersData();
    const participantsPath = path.join(__dirname, '../../api/participantes.json');
    const participants = JSON.parse(await fs.readFile(participantsPath, 'utf8'));

    const analytics = {
      timestamp: new Date().toISOString(),
      session: {
        username: req.session.timAuth.username,
        loginTime: new Date(req.session.timAuth.loginTime).toLocaleString('pt-BR'),
        sessionDuration: Math.round((Date.now() - req.session.timAuth.loginTime) / 1000 / 60) + ' min'
      },
      users: {
        total: users.length,
        active: users.filter(u => [1, 2, 3, 4, 5].includes(u.situacao)).length,
        admins: users.filter(u => u.level >= 3).length,
        moderators: users.filter(u => u.level === 2).length,
        participants: users.filter(u => u.level <= 1).length
      },
      room: {
        totalInRoom: participants.length,
        totalOutRoom: users.length - participants.length,
        participantsIds: participants.map(p => p.id)
      },
      demographics: {
        byUF: users.reduce((acc, u) => {
          acc[u.uf] = (acc[u.uf] || 0) + 1;
          return acc;
        }, {}),
        byLevel: users.reduce((acc, u) => {
          acc[u.level] = (acc[u.level] || 0) + 1;
          return acc;
        }, {}),
        bySituacao: users.reduce((acc, u) => {
          acc[u.situacao] = (acc[u.situacao] || 0) + 1;
          return acc;
        }, {})
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('⚠️ Erro ao carregar analytics TIM:', error);
    res.status(500).json({
      error: 'Failed to load analytics',
      message: 'Erro ao carregar estatísticas'
    });
  }
}));

// Servir arquivos estáticos TIM (rota independente)
router.use('/tim/static', timAuthMiddleware, express.static(
  path.join(__dirname, '../../../apps/tim.biblos360.net/public'),
  {
    maxAge: '1h',
    setHeaders: (res, path) => {
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }
));

// === ROTAS DE ADMIN ORIGINAIS ===

// API TIM: Dados dos participantes
router.get('/admin/tim/api/participantes.json', timAuthMiddleware, asyncErrorHandler(async (req, res, next) => {
  try {
    const participantsPath = path.join(__dirname, '../../api/participantes.json');
    const participants = await fs.readFile(participantsPath, 'utf8');
    res.json(JSON.parse(participants));
  } catch (error) {
    console.error('⚠️ Erro ao carregar participantes TIM:', error);
    res.status(500).json([]);
  }
}));

// API TIM: Atualizar usuário
router.put('/admin/tim/api/users/:id', timAuthMiddleware, controllers.updateUser);

// API TIM: Excluir usuário da sala (soft delete)
router.delete('/admin/tim/api/users/:id', timAuthMiddleware, controllers.deleteUser);

// API TIM: Incluir usuário na sala
router.post('/admin/tim/api/users/:id/include', timAuthMiddleware, controllers.includeUser);

// API TIM: Listar todos os usuários
router.get('/admin/tim/api/users', timAuthMiddleware, controllers.getUsers);

// API TIM: Inserir robôs (usuários fantasmas)
router.post('/admin/tim/api/bots/insert', timAuthMiddleware, controllers.insertBots);

// API TIM: Remover todos os robôs
router.delete('/admin/tim/api/bots/remove', timAuthMiddleware, controllers.removeBots);

// API TIM: Sincronizar robôs (forçar recarregamento)
router.post('/admin/tim/api/bots/sync', timAuthMiddleware, controllers.syncBots);

// API TIM: Dados dos participantes
router.get('/admin/tim/api/participantes.json', timAuthMiddleware, asyncErrorHandler(async (req, res, next) => {
  try {
    const participantsPath = path.join(__dirname, '../../api/participantes.json');
    const participants = await fs.readFile(participantsPath, 'utf8');
    res.json(JSON.parse(participants));
  } catch (error) {
    console.error('âŒ Erro ao carregar participantes TIM:', error);
    res.status(500).json([]);
  }
}));

// API TIM: Analytics e estatísticas
router.get('/admin/tim/api/analytics', timAuthMiddleware, asyncErrorHandler(async (req, res, next) => {
  try {
    // Carregar dados de usuários e participantes
    const users = await controllers.getUsersData();
    const participantsPath = path.join(__dirname, '../../api/participantes.json');
    const participants = JSON.parse(await fs.readFile(participantsPath, 'utf8'));

    const analytics = {
      timestamp: new Date().toISOString(),
      session: {
        username: req.session.timAuth.username,
        loginTime: new Date(req.session.timAuth.loginTime).toLocaleString('pt-BR'),
        sessionDuration: Math.round((Date.now() - req.session.timAuth.loginTime) / 1000 / 60) + ' min'
      },
      users: {
        total: users.length,
        active: users.filter(u => [1, 2, 3, 4, 5].includes(u.situacao)).length,
        admins: users.filter(u => u.level >= 3).length,
        moderators: users.filter(u => u.level === 2).length,
        participants: users.filter(u => u.level <= 1).length
      },
      room: {
        totalInRoom: participants.length,
        totalOutRoom: users.length - participants.length,
        participantsIds: participants.map(p => p.id)
      },
      demographics: {
        byUF: users.reduce((acc, u) => {
          acc[u.uf] = (acc[u.uf] || 0) + 1;
          return acc;
        }, {}),
        byLevel: users.reduce((acc, u) => {
          acc[u.level] = (acc[u.level] || 0) + 1;
          return acc;
        }, {}),
        bySituacao: users.reduce((acc, u) => {
          acc[u.situacao] = (acc[u.situacao] || 0) + 1;
          return acc;
        }, {})
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('âŒ Erro ao carregar analytics TIM:', error);
    res.status(500).json({
      error: 'Failed to load analytics',
      message: 'Erro ao carregar estatísticas'
    });
  }
}));

// Servir arquivos estáticos TIM com autenticação
router.use('/admin/tim/static', timAuthMiddleware, express.static(
  path.join(__dirname, '../../../apps/tim.biblos360.net/public'),
  {
    maxAge: '1h',
    setHeaders: (res, path) => {
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }
));

// ========================================
// FIM SEÇÁO TIM
// ========================================

// Lista de sessões (compatibilidade legado)
router.get('/api/sessions', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  res.json({
    sessions: [],
    total: 0,
    message: 'Endpoint em desenvolvimento'
  });
}));

// Rota de compatibilidade legada para participantes
router.get('/vr/:id/participantes', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const { sortBy = 'turma', filter = 'all', order = 'asc' } = req.query;

    console.log(`ðŸ“‹ Solicitação de participantes para sala ${roomId} com ordenação: ${sortBy}`);

    // Carregar dados dos participantes da sala específica
    const participants = await loadRoomData(roomId, 'participantes');

    // Aplicar filtros se necessário
    let filteredParticipants = participants;

    if (filter !== 'all') {
      filteredParticipants = participants.filter(p => {
        switch (filter) {
          case 'online': return p.online === true;
          case 'offline': return p.online !== true;
          case 'staff': return p.extra && p.extra.level > 1;
          case 'insc': return !p.extra || p.extra.level <= 1;
          default: return true;
        }
      });
    }

    // Aplicar ordenação baseada na seleção do painel administrativo
    const sortedParticipants = filteredParticipants.sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case 'turma':
          valueA = (a.extra?.turma || '').toLowerCase();
          valueB = (b.extra?.turma || '').toLowerCase();
          break;
        case 'grupo':
          valueA = parseInt(a.extra?.grupo || '0');
          valueB = parseInt(b.extra?.grupo || '0');
          return order === 'desc' ? valueB - valueA : valueA - valueB;
        case 'rede':
          valueA = (a.extra?.rede || '').toLowerCase();
          valueB = (b.extra?.rede || '').toLowerCase();
          break;
        case 'watcher':
          valueA = a.watcher || '';
          valueB = b.watcher || '';
          break;
        case 'nick':
        default:
          valueA = (a.nick || '').toLowerCase();
          valueB = (b.nick || '').toLowerCase();
          break;
      }

      if (typeof valueA === 'string') {
        return order === 'desc' ? valueB.localeCompare(valueA, 'pt-BR') : valueA.localeCompare(valueB, 'pt-BR');
      }

      return order === 'desc' ? valueB - valueA : valueA - valueB;
    });

    console.log(`âœ… Participantes ordenados por ${sortBy}: ${sortedParticipants.length} usuários`);

    // Retornar no formato esperado pelo frontend legado
    res.json(sortedParticipants);

  } catch (error) {
    console.error(`âŒ Erro ao carregar participantes da sala ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}));

// API de participantes
router.get('/api/participantes', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const { room = 'default', sortBy = 'turma', filter = 'all', online } = req.query;

    // Carregar dados reais dos participantes
    const participants = await loadRoomData(room, 'participantes');

    // Filtrar participantes se necessário
    let filteredParticipants = participants;

    if (filter !== 'all') {
      filteredParticipants = participants.filter(p => {
        switch (filter) {
          case 'online': return p.online === true;
          case 'turmaA': return p.turma === 'A';
          case 'turmaB': return p.turma === 'B';
          case 'turmaC': return p.turma === 'C';
          case 'turmaD': return p.turma === 'D';
          case 'turmaE': return p.turma === 'E';
          case 'turmaF': return p.turma === 'F';
          case 'parceiros': return p.parceiro === '1' || p.parceiro === 1;
          default: return true;
        }
      });
    }

    // Ordenar participantes
    if (sortBy) {
      filteredParticipants.sort((a, b) => {
        const aVal = a[sortBy] || '';
        const bVal = b[sortBy] || '';
        return aVal.toString().localeCompare(bVal.toString());
      });
    }

    // Contar participantes online (simulado por enquanto)
    const onlineCount = participants.filter(p => p.online === true).length;

    const result = {
      participants: filteredParticipants,
      total: filteredParticipants.length,
      online: onlineCount,
      room: room,
      filter: filter,
      sortBy: sortBy,
      timestamp: new Date().toISOString()
    };

    res.set({
      'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
      'X-Participants-Count': result.total,
      'X-Online-Count': result.online
    });

    res.json(result);
  } catch (error) {
    console.error('Erro ao carregar participantes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      participants: [],
      total: 0,
      online: 0
    });
  }
}));

// API de participantes.json (para compatibilidade com tim-levels.js)
router.get('/api/participantes.json', asyncErrorHandler(async (req, res, next) => {
  try {
    const participantsPath = path.join(__dirname, '../../../api/participantes.json');

    const data = await fs.readFile(participantsPath, 'utf8');
    const participants = JSON.parse(data);

    res.set({
      'Cache-Control': 'public, max-age=30',
      'Content-Type': 'application/json'
    });

    res.json(participants);
  } catch (error) {
    console.error('Erro ao carregar participantes.json:', error);
    res.status(500).json({ error: 'Erro ao carregar participantes' });
  }
}));

// API para atualizar nível de participante
router.post('/api/participants/level', asyncErrorHandler(async (req, res, next) => {
  try {
    const { participantId, level } = req.body;

    if (!participantId || level === undefined) {
      return res.status(400).json({
        success: false,
        message: 'participantId e level são obrigatórios'
      });
    }

    const levelNum = parseInt(level);
    if (isNaN(levelNum) || levelNum < 0 || levelNum > 2) {
      return res.status(400).json({
        success: false,
        message: 'Nível deve ser um número entre 0 e 2'
      });
    }

    // Tentar atualizar no Supabase primeiro
    let supabaseUpdated = false;
    let supabaseError = null;

    try {
      console.log(`🔄 [API] Tentando atualizar nível do participante ${participantId} para ${levelNum} no Supabase...`);
      const { updateSupabaseUser } = require('./supabase');
      const result = await updateSupabaseUser(parseInt(participantId), { level: levelNum });
      supabaseUpdated = true;
      console.log(`🔐 [SUPABASE] Nível do participante ${participantId} alterado para ${levelNum} com sucesso`);
    } catch (error) {
      supabaseError = error;
      console.error('❌ [SUPABASE] Erro ao atualizar:', error.message);
    }

    // Também atualizar no arquivo JSON para compatibilidade
    let jsonUpdated = false;
    try {
      const participantsPath = path.join(__dirname, '../../../api/participantes.json');

      // Ler arquivo JSON atual
      const data = await fs.readFile(participantsPath, 'utf8');
      const participants = JSON.parse(data);

      // Encontrar o participante
      const participantIndex = participants.findIndex(p => p.id === parseInt(participantId));

      if (participantIndex !== -1) {
        const oldLevel = participants[participantIndex].level;
        participants[participantIndex].level = levelNum;
        participants[participantIndex].lastActivity = new Date().toISOString();

        // Salvar arquivo atualizado
        await fs.writeFile(participantsPath, JSON.stringify(participants, null, 2));
        console.log(`📁 [JSON] Nível do participante ${participantId} atualizado no arquivo (${oldLevel} -> ${levelNum})`);
        jsonUpdated = true;
      } else {
        console.warn(`⚠️ [JSON] Participante ${participantId} não encontrado no arquivo`);
      }
    } catch (jsonError) {
      console.error('❌ [JSON] Erro ao atualizar arquivo:', jsonError.message);
    }

    // Se nem Supabase nem JSON funcionaram, retornar erro
    if (!supabaseUpdated && !jsonUpdated) {
      return res.status(500).json({
        success: false,
        message: `Erro ao atualizar participante: ${supabaseError ? supabaseError.message : 'Participante não encontrado'}`
      });
    }

    const levelNames = { 0: 'Participante', 1: 'Moderador', 2: 'Docente' };

    // Incluir informações sobre onde foi atualizado
    const updateInfo = [];
    if (supabaseUpdated) updateInfo.push('Supabase');
    if (jsonUpdated) updateInfo.push('arquivo JSON');

    console.log(`✅ [API] Nível do participante ${participantId} atualizado com sucesso em: ${updateInfo.join(', ')}`);

    // Verificar se a atualização do Supabase realmente funcionou
    if (supabaseUpdated) {
      try {
        const supabaseService = require('./supabase');
        const updatedUser = await supabaseService.getUserById(parseInt(participantId));
        if (updatedUser && updatedUser.level === levelNum) {
          console.log(`✅ [VERIFICAÇÃO] Nível confirmado no Supabase: ${updatedUser.level}`);
        } else {
          console.warn(`⚠️ [VERIFICAÇÃO] Nível no Supabase não confere: esperado ${levelNum}, encontrado ${updatedUser?.level}`);
        }
      } catch (verifyError) {
        console.warn(`⚠️ [VERIFICAÇÃO] Erro ao verificar atualização:`, verifyError.message);
      }
    }

    res.json({
      success: true,
      message: `Nível alterado para ${levelNames[levelNum]} com sucesso`,
      data: {
        participantId: parseInt(participantId),
        newLevel: levelNum,
        updatedIn: updateInfo,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar nível do participante:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}));

// API de mensagens
router.get('/api/messages', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const { room = 'default', limit = 50, offset = 0, forum } = req.query;

    // Determinar o caminho do arquivo
    let dataType = 'messages';
    let messagesPath;

    if (forum === 'true') {
      // Mensagens do fórum - mantém estrutura existente do mapeamento
      messagesPath = path.join(__dirname, `../public/vr/${room}/forum/api/messages.json`);
    } else {
      // Mensagens do chat - nova localização
      messagesPath = path.join(__dirname, '../../../api/messages.json');
    }

    // Carregar mensagens
    let messages = [];
    try {
      const data = await fs.readFile(messagesPath, 'utf8');
      messages = JSON.parse(data);
    } catch (error) {
      console.warn(`Arquivo de mensagens não encontrado: ${messagesPath}`);
      messages = [];
    }

    // CORREÁ‡ÁƒO: Aplicar filtro de mensagens hidden baseado no nível do usuário
    const { isAuthenticated, user } = req.biblos360Auth || {};
    const userLevel = (isAuthenticated && user) ? (user.data?.level || 0) : 0;

    // Filtrar mensagens hidden para usuários comuns (level 0)
    // Moderadores e admins (level 1-3) veem todas as mensagens
    messages = messages.filter(msg => {
      const isHidden = msg.hidden === 1;
      return !isHidden || userLevel >= 1;
    });

    // Ordenar por timestamp (mais recentes primeiro)
    messages.sort((a, b) => b.ts - a.ts);

    // Aplicar paginação
    const startIndex = parseInt(offset) || 0;
    const limitNum = parseInt(limit) || 50;
    const paginatedMessages = messages.slice(startIndex, startIndex + limitNum);

    const result = {
      messages: paginatedMessages,
      total: messages.length,
      returned: paginatedMessages.length,
      room: room,
      limit: limitNum,
      offset: startIndex,
      forum: forum === 'true',
      timestamp: new Date().toISOString()
    };

    res.set({
      'Cache-Control': 'public, max-age=10, stale-while-revalidate=30',
      'X-Messages-Count': result.total,
      'X-Messages-Returned': result.messages.length
    });

    res.json(result);
  } catch (error) {
    console.error('Erro ao carregar mensagens:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      messages: [],
      total: 0
    });
  }
}));

// ========================================
// SEÇÁO 6: ROTAS DE VÁDEO
// ========================================

// Buscar posições de vídeo
router.get('/videos/pos/:sessionHash/:videoHashes', asyncErrorHandler(controllers.getVideoPositions));

// Salvar posição de vídeo
router.post('/videos/pos/:sessionHash/:videoHash', asyncErrorHandler(controllers.saveVideoPosition));

// Remover posição de vídeo específica
router.delete('/videos/pos/:sessionHash/:videoHash', asyncErrorHandler(controllers.deleteVideoPosition));

// Remover todas as posições de uma sessão
router.delete('/videos/pos/:sessionHash', asyncErrorHandler(controllers.deleteSessionPositions));

// Estatísticas de sessão
router.get('/videos/pos/stats/:sessionHash', asyncErrorHandler(controllers.getSessionStats));

// ========================================
// SEÇÁO 6.5: ROTAS DE MENSAGENS (CHAT)
// ========================================

// Soft delete de mensagem (moderação)
router.put('/vr/:id/messages/:msgid/hide', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const msgid = req.params.msgid;
    const { isAuthenticated, user } = req.biblos360Auth || {};

    // Verificar autenticação
    if (!isAuthenticated || !user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const userId = user.data.id;
    const userLevel = user.data.level || 0;

    console.log(`ðŸ—‘ï¸ Soft delete via HTTP - User: ${userId}, Level: ${userLevel}, MsgID: ${msgid}`);

    // Carregar mensagens
    const messagesPath = path.join(__dirname, '../../../api/messages.json');
    let messages = [];

    try {
      const messagesData = await fs.readFile(messagesPath, 'utf8');
      messages = JSON.parse(messagesData);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Mensagens não encontradas'
      });
    }

    // Encontrar a mensagem
    const messageIndex = messages.findIndex(msg => msg.msgid == msgid);

    if (messageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Mensagem não encontrada'
      });
    }

    const targetMessage = messages[messageIndex];

    // Verificar permissões (Level 1-3 ou próprio usuário)
    const canRemove = userLevel >= 1 || targetMessage.userid === userId.toString();

    if (!canRemove) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão para moderar esta mensagem'
      });
    }

    // Fazer soft delete
    messages[messageIndex].hidden = 1;

    // Salvar arquivo
    await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2), 'utf8');

    console.log(`âœ… Mensagem ${msgid} ocultada via HTTP por usuário ${userId} (level ${userLevel})`);

    // Notificar via Socket.IO se disponível
    const io = req.app.get('io');
    if (io) {
      io.to(roomId).emit('message-hidden', parseInt(msgid));
    }

    res.json({
      success: true,
      message: 'Mensagem moderada com sucesso',
      msgid: parseInt(msgid),
      hidden: true
    });

  } catch (error) {
    console.error('âŒ Erro no soft delete HTTP:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// Restaurar mensagem moderada
router.put('/vr/:id/messages/:msgid/restore', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const msgid = req.params.msgid;
    const { isAuthenticated, user } = req.biblos360Auth || {};

    // Verificar autenticação
    if (!isAuthenticated || !user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const userId = user.data.id;
    const userLevel = user.data.level || 0;

    console.log(`ðŸ”„ Restaurar via HTTP - User: ${userId}, Level: ${userLevel}, MsgID: ${msgid}`);

    // Carregar mensagens
    const messagesPath = path.join(__dirname, '../../../api/messages.json');
    let messages = [];

    try {
      const messagesData = await fs.readFile(messagesPath, 'utf8');
      messages = JSON.parse(messagesData);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Mensagens não encontradas'
      });
    }

    // Encontrar a mensagem
    const messageIndex = messages.findIndex(msg => msg.msgid == msgid);

    if (messageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Mensagem não encontrada'
      });
    }

    const targetMessage = messages[messageIndex];

    // Verificar permissões: próprio usuário OU níveis superiores (1,2,3)
    const canRestore = userLevel >= 1 || targetMessage.userid === userId.toString();

    if (!canRestore) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão para restaurar esta mensagem'
      });
    }

    // Restaurar mensagem
    messages[messageIndex].hidden = 0;

    // Salvar arquivo
    await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2), 'utf8');

    console.log(`âœ… Mensagem ${msgid} restaurada via HTTP por usuário ${userId} (level ${userLevel})`);

    // Notificar via Socket.IO se disponível
    const io = req.app.get('io');
    if (io) {
      io.to(roomId).emit('message-restored', parseInt(msgid));
    }

    res.json({
      success: true,
      message: 'Mensagem restaurada com sucesso',
      msgid: parseInt(msgid),
      hidden: false
    });

  } catch (error) {
    console.error('âŒ Erro no restaurar HTTP:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// ========================================
// SEÇÁO 7: ROTAS DE SALAS VIRTUAIS
// ========================================

// Rotas específicas devem vir ANTES da rota genérica /vr/:id
// para evitar que 'expirar', 'sincronizar', etc. sejam interpretados como IDs de sala

// Rotas de sistema que impedem redirecionamentos indesejados
router.get('/vr/expirar', (req, res) => {
  try {
    console.log('ðŸ”„ Rota /vr/expirar acessada - analisando autenticação');

    const { isAuthenticated, hasInscricao, user, inscricao } = req.biblos360Auth || {};

    console.log('ðŸ” Status de autenticação:', {
      isAuthenticated,
      hasInscricao,
      hasUser: !!user,
      hasInscricao: !!inscricao,
      userId: user?.data?.id,
      userName: user?.data?.nome || user?.data?.apelido,
      inscricaoEv: inscricao?.data?.ev
    });

    // Se usuário está autenticado mas chegou aqui por falta de cookie de inscrição
    if (isAuthenticated && user) {
      console.log('âœ… Usuário autenticado detectado - configurando cookies e redirecionando');

      // Determinar sala baseado na inscrição ou usar sala padrão
      let roomId = 'pub'; // Sala padrão
      if (hasInscricao && inscricao?.data?.ev) {
        roomId = inscricao.data.ev;
      }

      // Configurar cookies necessários para evitar futuros redirecionamentos
      const inscritoCookieValue = `a:1:{s:2:"ev";s:${roomId.length}:"${roomId}";}`;
      res.cookie('biblos360_site_inscrito', inscritoCookieValue, {
        httpOnly: false,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });

      res.cookie('biblos360_time_sync', Date.now().toString(), {
        httpOnly: false,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });

      console.log(`âœ… Redirecionando usuário ${user.data.nome || user.data.apelido} para sala ${roomId}`);
      return res.redirect(`/vr/${roomId}`);
    }

    // Configurar cookies básicos para manter sessão válida mesmo sem usuário específico
    const guestCookieValue = `a:1:{s:12:"guest_session";s:4:"true";}`;
    res.cookie('biblos360_site_inscrito', guestCookieValue, {
      httpOnly: false,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    res.cookie('biblos360_time_sync', Date.now().toString(), {
      httpOnly: false,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    // Caso contrário, redireciona para login
    console.log('ðŸ”„ Usuário não autenticado - redirecionando para login');
    res.redirect('/login.html');

  } catch (error) {
    console.error('âŒ Erro na rota /vr/expirar:', error);
    res.redirect('/login.html');
  }
});

// Rota de sincronização de tempo
router.get('/vr/sincronizar', (req, res) => {
  try {
    console.log('â° Rota /vr/sincronizar acessada');

    // Configurar cookie de sincronização
    res.cookie('biblos360_time_sync', Date.now().toString(), {
      httpOnly: false,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    // Resposta de sincronização bem-sucedida
    res.json({
      status: 'synchronized',
      timestamp: Date.now(),
      message: 'Sincronização realizada com sucesso'
    });

  } catch (error) {
    console.error('âŒ Erro na sincronização:', error);
    res.status(500).json({ error: 'Erro na sincronização', timestamp: Date.now() });
  }
});

// Rota de desconexão com limpeza
router.get('/vr/desconectar', (req, res) => {
  try {
    console.log('ðŸ”Œ Rota /vr/desconectar acessada - limpando sessão');

    // Limpar cookies de autenticação
    res.clearCookie('biblos360_site_usuario');
    res.clearCookie('biblos360_site_inscrito');
    res.clearCookie('biblos360_admin_usuario');
    res.clearCookie('biblos360_admin_inscrito');
    res.clearCookie('biblos360_time_sync');

    // Usar sistema de erros padrão para mostrar tela de desconexão
    const { errorTypes } = require('./errors');
    const roomId = req.query.room || req.params.roomId || 'pub';

    console.log('🎨 Gerando tela de desconexão por administrador para sala:', roomId);

    // Usar tipo de erro específico para desconexão por administrador
    const errorResponse = errorTypes.adminLogout({ roomId });

    console.log('✅ Tela de desconexão por administrador gerada, enviando HTML');
    res.send(errorResponse);

  } catch (error) {
    console.error('âŒ Erro na desconexão:', error);
    res.status(500).json({ error: 'Erro na desconexão' });
  }
});

// ========================================
// SEÇÁO 9: ROTAS DE CONFERÊNCIAS JITSI (MOVIDA PARA ANTES DA ROTA GENÉRICA)
// ========================================

/**
 * Rota para sistema de conferências JITSI
 * Suporta 10 tipos de conferências: professor, reuniao, equipe, atendimento,
 * projeto, oracao, breakout, grupo, rede, turma
 * FASE 2: Suporte para iframe embed quando ?embed=true
 */
router.get('/vr/:id/conferencia/:type', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  console.log(`🎥 [DEBUG] ===== INÍCIO ROTA CONFERÊNCIA =====`);
  console.log(`🎥 [DEBUG] Rota de conferência chamada! Room: ${req.params.id}, Type: ${req.params.type}`);
  console.log(`🎥 [ROUTE DEBUG] URL completa: ${req.originalUrl}`);
  console.log(`🎥 [ROUTE DEBUG] Params: ${JSON.stringify(req.params)}`);
  console.log(`🎥 [ROUTE DEBUG] Query: ${JSON.stringify(req.query)}`);
  console.log(`🎥 [ROUTE DEBUG] Method: ${req.method}`);
  console.log(`🎥 [ROUTE DEBUG] User-Agent: ${req.headers['user-agent']}`);
  console.log(`🎥 [DEBUG] ===========================`);

  try {
    const roomId = req.params.id;
    const confType = req.params.type;
    const isEmbedMode = req.query.embed === 'true'; // FASE 2: Modo iframe embed

    console.log(`🎥 [DEBUG] Variáveis extraídas - roomId: "${roomId}", confType: "${confType}", isEmbedMode: ${isEmbedMode}`);

    // Tipos de conferência válidos conforme documentação
    const validConferences = [
      'professor',     // Sala do professor
      'reuniao',       // Reuniões gerais
      'equipe',        // Reuniões de equipe
      'atendimento',   // Atendimento individual
      'projeto',       // Trabalho em projetos
      'oracao',        // Momentos de oração
      'breakout',      // Salas de grupo pequeno (dinâmico)
      'grupo',         // Salas de grupo (dinâmico)
      'rede',          // Salas por rede (dinâmico)
      'turma'          // Salas por turma (dinâmico)
    ];

    if (!validConferences.includes(confType)) {
      return res.status(404).json({
        success: false,
        error: `Tipo de conferência '${confType}' não suportado`
      });
    }

    console.log(`ðŸŽ¥ Solicitação de conferência: Sala ${roomId}, Tipo: ${confType}`);
    console.log(`🎥 [DEBUG] Iniciando verificação de JITSI...`);

    // Verificar se JITSI está habilitado para esta sala
    try {
      const roomPath = path.join(__dirname, '../../../api/room.json');
      const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));

      const isJitsiEnabled = roomData.config?.jitsi_enabled || false;

      if (!isJitsiEnabled) {
        return res.status(503).json({
          success: false,
          error: 'Servidor de videoconferências está desabilitado',
          code: 'JITSI_DISABLED'
        });
      }
    } catch (error) {
      console.warn(`âš ï¸ Erro ao verificar status JITSI:`, error.message);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }

    // Obter dados do usuário para personalização da conferência
    const userData = req.user || {};
    const participantName = userData.nome || userData.nick || 'Participante';
    console.log(`🎥 [DEBUG] ===== CONFERÊNCIA DEBUG DETALHADO =====`);
    console.log(`🎥 [DEBUG] req.user:`, JSON.stringify(req.user, null, 2));
    console.log(`🎥 [DEBUG] req.biblos360Auth:`, JSON.stringify(req.biblos360Auth, null, 2));
    console.log(`🎥 [DEBUG] userData final:`, JSON.stringify(userData, null, 2));
    console.log(`🎥 [DEBUG] Nome do participante: ${participantName}`);
    console.log(`🎥 [DEBUG] ===========================================`);

    // FASE 1: Validação de permissões baseada no plano JITSI_PLANO-10-SALAS.md
    const hasAccess = services.validateConferenceAccess(confType, userData);
    console.log(`🎥 [DEBUG] Acesso validado: ${hasAccess}`);
    if (!hasAccess) {
      // Log da negação de acesso
      const conferenceLogger = new services.ConferenceLogger();
      await conferenceLogger.logConferenceEvent('access_denied', {
        roomId: roomId,
        confType: confType,
        participantId: userData.id,
        participantName: participantName,
        participantLevel: userData.level,
        participantEquipe: userData.equipe,
        participantGrupo: userData.grupo,
        participantRede: userData.rede,
        participantTurma: userData.turma,
        denialReason: getDenialReason(confType, userData),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      });

      return res.status(403).json({
        success: false,
        error: `Acesso negado Á  sala de ${confType}`,
        code: 'ACCESS_DENIED',
        reason: getDenialReason(confType, userData)
      });
    }

    console.log(`🎥 [DEBUG] Obtendo configurações do Jitsi para tipo: ${confType}`);

    console.log(`🎥 [DEBUG] Chamando services.getJitsiConfigByType("${confType}")`);

    // FASE 1: Obter configurações personalizadas por tipo de conferência
    const jitsiTypeConfig = services.getJitsiConfigByType(confType);

    console.log(`🎥 [DEBUG] Configurações obtidas:`, jitsiTypeConfig);

    // Personalização dinâmica do nome da sala baseada em dados do usuário
    function generateRoomName(roomId, confType, userData) {
      const prefix = 'biblos360';
      let roomName = `${prefix}-${roomId}-${confType}`;

      switch (confType) {
        case 'atendimento':
          roomName += `-${userData.grupo || 'geral'}`;
          break;
        case 'projeto':
          roomName += `-${userData.grupo || 'geral'}`;
          break;
        case 'oracao':
          roomName += `-${(userData.rede || 'geral').replace(/[^a-zA-Z0-9]/g, '')}`;
          break;
        case 'breakout':
          // Algoritmo simples de distribuição (FASE 2 terá versão avançada)
          const breakoutNumber = Math.ceil(Math.random() * 5);
          roomName += `-${breakoutNumber}`;
          break;
        case 'grupo':
          roomName += `-${(userData.grupo || 'geral').replace(/[^a-zA-Z0-9]/g, '')}`;
          break;
        case 'rede':
          roomName += `-${(userData.rede || 'geral').replace(/[^a-zA-Z0-9]/g, '')}`;
          break;
        case 'turma':
          roomName += `-${(userData.turma || 'geral').replace(/[^a-zA-Z0-9]/g, '')}`;
          break;
      }

      return roomName;
    }

    console.log(`🎥 [DEBUG] PONTO 2: Após função generateRoomName`);

    // Configurações específicas por tipo de conferência (melhoradas)
    let roomConfig = {
      roomName: generateRoomName(roomId, confType, userData),
      displayName: participantName,
      subject: jitsiTypeConfig.subject,
      config: jitsiTypeConfig.config,
      interfaceConfig: jitsiTypeConfig.interfaceConfig,
      maxParticipants: jitsiTypeConfig.maxParticipants
    };

    console.log(`🎥 [DEBUG] Configuração da sala criada: ${JSON.stringify(roomConfig, null, 2)}`);

    // Função auxiliar para obter motivo da negação de acesso
    function getDenialReason(confType, userData) {
      const level = parseInt(userData.level) || 1;

      switch (confType) {
        case 'professor':
          return level < 3 ? 'Apenas administradores podem acessar a sala do professor' : 'Acesso negado';
        case 'reuniao':
          return level < 2 ? 'Apenas facilitadores e administradores podem acessar reuniões' : 'Acesso negado';
        case 'equipe':
          return userData.equipe !== 'Biblos360' ? 'Apenas membros da equipe Biblos360 podem acessar' :
            level < 2 ? 'Nível insuficiente para acessar sala da equipe' : 'Acesso negado';
        case 'oracao':
          return !userData.rede ? 'Á‰ necessário ter uma rede cadastrada para acessar a sala de oração' : 'Acesso negado';
        case 'grupo':
          return !userData.grupo ? 'Á‰ necessário ter um grupo cadastrado para acessar a sala do grupo' : 'Acesso negado';
        case 'rede':
          return !userData.rede ? 'Á‰ necessário ter uma rede cadastrada para acessar a sala da rede' : 'Acesso negado';
        case 'turma':
          return !userData.turma ? 'Á‰ necessário ter uma turma cadastrada para acessar a sala da turma' : 'Acesso negado';
        default:
          return 'Acesso não autorizado';
      }
    }

    console.log(`🎥 [DEBUG] PONTO 3: Após função getDenialReason`);

    // Determinar domínio JITSI correto (usar IP atual da instância)
    let jitsiDomain = 'meet.biblos360.net'; // Domínio padrão

    console.log(`🎥 [DEBUG] PONTO 4: jitsiDomain inicial: ${jitsiDomain}`);

    try {
      // Verificar se existe configuração de domínio customizado
      const roomPath = path.join(__dirname, '../../../api/room.json');
      const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));

      if (roomData.config?.jitsi_domain) {
        jitsiDomain = roomData.config.jitsi_domain;
        console.log(`ðŸŒ Usando domínio JITSI personalizado: ${jitsiDomain}`);
      } else {
        console.log(`ðŸŒ Usando servidor JITSI Biblos360: ${jitsiDomain}`);
      }
    } catch (error) {
      console.warn(`âš ï¸ Erro ao ler configuração de domínio JITSI:`, error.message);
    }

    // HTML para iframe do Jitsi Meet
    let jitsiHtml;

    console.log(`🎥 [DEBUG] Gerando HTML Jitsi para domínio: ${jitsiDomain}`);
    console.log(`🎥 [DEBUG] isEmbedMode: ${isEmbedMode}, confType: ${confType}`);

    // FASE 2: Se for modo embed, gerar página de teste com iframe
    if (isEmbedMode && confType === 'reuniao') {
      console.log(`🎥 [DEBUG] Usando modo embed para reunião`);
      jitsiHtml = generateEmbedTestPage(jitsiDomain, roomConfig, roomId);
    } else {
      console.log(`🎥 [DEBUG] Usando modo direto - chamando generateJitsiHTML`);
      jitsiHtml = generateJitsiHTML(jitsiDomain, roomConfig);
    }

    console.log(`🎥 [DEBUG] HTML gerado - tamanho: ${jitsiHtml.length} caracteres`);

    // Log da conferência aberta com ConferenceLogger avançado (FASE 1)
    console.log(`âœ… Conferência ${confType} aberta para ${participantName} na sala ${roomId}`);

    // FASE 1: Log avançado usando ConferenceLogger
    try {
      const conferenceLogger = new services.ConferenceLogger();
      await conferenceLogger.logConferenceEvent('join', {
        roomId: roomId,
        confType: confType,
        roomName: roomConfig.roomName,
        participantId: userData.id,
        participantName: participantName,
        participantLevel: userData.level,
        participantEquipe: userData.equipe,
        participantGrupo: userData.grupo,
        participantRede: userData.rede,
        participantTurma: userData.turma,
        accessGranted: true,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      });
    } catch (logError) {
      console.warn(`âš ï¸ Erro ao salvar log avançado de conferência:`, logError.message);

      // Fallback para log simples (compatibilidade)
      try {
        const logsDir = path.join(__dirname, '../../../data/logs');
        const logFile = path.join(logsDir, `conferences-${new Date().toISOString().split('T')[0]}.json`);

        await fs.mkdir(logsDir, { recursive: true });

        let logs = [];
        try {
          const existingLogs = await fs.readFile(logFile, 'utf8');
          logs = JSON.parse(existingLogs);
        } catch (e) {
          // Arquivo não existe ainda
        }

        logs.push({
          timestamp: new Date().toISOString(),
          room_id: roomId,
          conference_type: confType,
          participant_name: participantName,
          participant_id: userData.id || null,
          room_name: roomConfig.roomName
        });

        await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
      } catch (fallbackError) {
        console.warn(`âš ï¸ Erro no fallback de log de conferência:`, fallbackError.message);
      }
    }

    // Retornar HTML da conferência
    console.log(`🎥 [DEBUG] PONTO 5: HTML gerado, enviando resposta. Tamanho: ${jitsiHtml.length} caracteres`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(jitsiHtml);

  } catch (error) {
    console.error(`âŒ Erro na conferência ${req.params.type}:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

/**
 * Função auxiliar para obter o título da conferência
 */
function getConferenceTitle(confType) {
  const titles = {
    professor: 'Sala do Professor',
    reuniao: 'Sala de Reunião',
    equipe: 'Sala da Equipe',
    atendimento: 'Sala de Atendimento',
    projeto: 'Sala de Projetos',
    oracao: 'Sala de Oração',
    breakout: 'Grupo Pequeno',
    grupo: 'Sala do Grupo',
    rede: 'Sala da Rede',
    turma: 'Sala da Turma'
  };

  return titles[confType] || 'Conferência';
}

/**
 * Gera HTML completo para iframe do Jitsi Meet
 */
function generateJitsiHTML(domain, roomConfig) {
  // Preparar configuração do Jitsi como string JSON
  const jitsiConfigJson = JSON.stringify(roomConfig.config || {}, (key, value) => value === undefined ? null : value);

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${roomConfig.subject} - Biblos360</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #111;
            overflow: hidden;
        }

        #jitsi-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 1000;
        }

        #jitsi-meet {
            width: 100%;
            height: 100%;
            border: none;
        }

        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            text-align: center;
            z-index: 999;
        }

        .loading::after {
            content: '';
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid #fff;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s linear infinite;
            margin-left: 10px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div id="jitsi-container">
        <div class="loading" id="loading">Carregando conferência...</div>
        <div id="jitsi-meet"></div>
    </div>

    <!-- SOLUÇÃO DEFINITIVA: Carregar interface_config.js ANTES de qualquer script via PROXY -->
    <script src="/api/jitsi/interface_config.js" onerror="console.warn('⚠️ Não foi possível carregar interface_config.js do servidor')"></script>

    <script>
        // BIBLOS360 - Configuração interfaceConfig CORRETA PARA RESOLVER ERRO
        console.log('🎬 BIBLOS360: Verificando interfaceConfig...');

        // Definir interfaceConfig COMPLETO se não existir
        if (typeof window.interfaceConfig === 'undefined') {
            console.log('🎬 BIBLOS360: Criando interfaceConfig localmente...');
            window.interfaceConfig = {
                APP_NAME: 'BIBLOS360',
                AUDIO_LEVEL_PRIMARY_COLOR: 'rgba(255,255,255,0.4)',
                AUDIO_LEVEL_SECONDARY_COLOR: 'rgba(255,255,255,0.2)',
                AUTO_PIN_LATEST_SCREEN_SHARE: 'remote-only',
                BRAND_WATERMARK_LINK: '',
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop',
                    'fullscreen', 'hangup', 'profile', 'chat', 'recording',
                    'livestreaming', 'etherpad', 'sharedvideo', 'settings',
                    'raisehand', 'videoquality', 'filmstrip', 'feedback',
                    'stats', 'shortcuts'
                ],
                DEFAULT_BACKGROUND: '#474747',
                DEFAULT_WELCOME_PAGE_LOGO_URL: '',
                DEFAULT_REMOTE_DISPLAY_NAME: 'Participante',
                DEFAULT_LOCAL_DISPLAY_NAME: 'Você',
                DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
                DISABLE_FOCUS_INDICATOR: false,
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
                DISABLE_PRESENCE_STATUS: false,
                DISABLE_RINGING: false,
                DISABLE_TRANSCRIPTION_SUBTITLES: false,
                DISABLE_VIDEO_BACKGROUND: false,
                DISPLAY_WELCOME_PAGE_CONTENT: false,
                DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
                FILMSTRIP_ENABLED: true,
                GENERATE_ROOMNAMES_ON_WELCOME_PAGE: true,
                HIDE_INVITE_MORE_HEADER: false,
                INITIAL_TOOLBAR_TIMEOUT: 20000,
                JITSI_WATERMARK_LINK: 'https://jitsi.org',
                LANG_DETECTION: true,
                LIVE_STREAMING_HELP_LINK: 'https://jitsi.org/live',
                LOCAL_THUMBNAIL_RATIO: 1.7777777777777777,
                MAXIMUM_ZOOMING_COEFFICIENT: 1.3,
                MOBILE_APP_PROMO: false,
                MOBILE_DOWNLOAD_LINK_ANDROID: 'https://play.google.com/store/apps/details?id=org.jitsi.meet',
                MOBILE_DOWNLOAD_LINK_F_DROID: 'https://f-droid.org/en/packages/org.jitsi.meet/',
                MOBILE_DOWNLOAD_LINK_IOS: 'https://itunes.apple.com/us/app/jitsi-meet/id1165103905',
                POLICY_LOGO: null,
                PROVIDER_NAME: 'BIBLOS360',
                RECENT_LIST_ENABLED: true,
                REMOTE_THUMBNAIL_RATIO: 1,
                SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
                SHOW_BRAND_WATERMARK: false,
                SHOW_DEEP_LINKING_IMAGE: false,
                SHOW_JITSI_WATERMARK: false,
                SHOW_POWERED_BY: false,
                SHOW_PROMOTIONAL_CLOSE_PAGE: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                SUPPORT_URL: 'https://community.jitsi.org/',
                TILE_VIEW_MAX_COLUMNS: 5,
                TOOLBAR_ALWAYS_VISIBLE: false,
                TOOLBAR_TIMEOUT: 4000,
                UNSUPPORTED_BROWSER_URL: 'https://jitsi.org/what-is-jitsi/',
                VERTICAL_FILMSTRIP: true,
                VIDEO_LAYOUT_FIT: 'both',
                VIDEO_QUALITY_LABEL_DISABLED: false,
                CONNECTION_INDICATOR_AUTO_HIDE_ENABLED: true,
                CONNECTION_INDICATOR_AUTO_HIDE_TIMEOUT: 5000,
                CONNECTION_INDICATOR_DISABLED: false,
                OPTIMAL_BROWSERS: ['chrome', 'chromium', 'firefox', 'nwjs', 'electron', 'safari']
            };
            console.log('✅ BIBLOS360: interfaceConfig criado com sucesso!');
        } else {
            console.log('✅ BIBLOS360: interfaceConfig já existe no servidor');
        }

        // Configuração do domínio JITSI
        const JITSI_DOMAIN = '${domain}';

        // SOLUÇÃO DEFINITIVA: Definir objeto config COMPLETO
        const config = ${jitsiConfigJson};
        console.log('🔧 BIBLOS360: Objeto config definido:', config);

        function loadJitsiAPI() {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = '/api/jitsi/external_api.js'; // Usar proxy em vez do domínio direto
                script.crossOrigin = 'anonymous';

                script.onload = () => {
                    if (typeof window.JitsiMeetExternalAPI !== 'undefined') {
                        resolve();
                    } else {
                        reject(new Error('JitsiMeetExternalAPI não definida'));
                    }
                };

                script.onerror = () => {
                    reject(new Error('Falha ao carregar external_api.js'));
                };

                document.head.appendChild(script);
            });
        }

        // Carregar API e inicializar
        loadJitsiAPI().then(() => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initJitsiWhenReady);
            } else {
                initJitsiWhenReady();
            }
        }).catch((error) => {
            console.error('Erro ao carregar JITSI:', error.message);
            const loading = document.getElementById('loading');
            if (loading) {
                loading.innerHTML =
                    '<div style="color: #ff6b6b; text-align: center;">' +
                    '<h3>Erro de Conexão</h3>' +
                    '<p>Não foi possível conectar ao servidor Jitsi.</p>' +
                    '<p><a href="https://' + JITSI_DOMAIN + '" target="_blank" style="color: #4CAF50;">Teste direto</a></p>' +
                    '</div>';
            }
        });

        function initJitsiWhenReady() {
            const loading = document.getElementById('loading');

            if (typeof JitsiMeetExternalAPI === 'undefined') {
                loading.innerHTML = 'Aguardando API Jitsi...';
                setTimeout(initJitsiWhenReady, 2000);
                return;
            }

            loading.innerHTML = 'Inicializando conferência...';

            // Configuração simplificada
            const options = {
                roomName: '${roomConfig.roomName}',
                width: '100%',
                height: '100%',
                parentNode: document.querySelector('#jitsi-meet'),
                configOverwrite: config,
                interfaceConfigOverwrite: window.interfaceConfig,
                userInfo: {
                    displayName: '${roomConfig.displayName}'
                }
            };

            try {
                const api = new JitsiMeetExternalAPI(JITSI_DOMAIN, options);

                // Eventos essenciais
                api.addEventListener('videoConferenceJoined', () => {
                    loading.style.display = 'none';
                });

                api.addEventListener('videoConferenceLeft', () => {
                    window.close();
                });

                api.addEventListener('readyToClose', () => {
                    window.close();
                });

                api.addEventListener('errorOccurred', (error) => {
                    console.error('Erro Jitsi:', error);
                    loading.innerHTML = 'Erro na conferência: ' + (error.message || 'Erro desconhecido');
                });

            } catch (error) {
                console.error('Erro ao criar Jitsi:', error);
                loading.innerHTML = 'Erro ao carregar conferência: ' + error.message;
            }

            // Timeout para esconder loading
            setTimeout(() => {
                if (loading && loading.style.display !== 'none') {
                    loading.style.display = 'none';
                }
            }, 15000);
        }
    </script>
</body>
</html>`;

  console.log(`🎥 [DEBUG] ===== ENVIANDO RESPOSTA HTML =====`);
  return html;
}

// Redirecionar rota raiz /vr/ para sala padrão
router.get('/vr/', (req, res) => {
  res.redirect('/vr/pub/');
});

// Página de login da sala virtual
router.get('/vr/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/vr/login.html'));
});

/**
 * Função para detectar se o acesso veio via QR Code
 * Detecta baseado no User-Agent de apps de QR Code comuns
 */
function detectQRCodeAccess(req, userAgent) {
  // Lista de User-Agents comuns de leitores de QR Code
  const qrCodePatterns = [
    /qr.*scanner/i,
    /qr.*reader/i,
    /barcode.*scanner/i,
    /zxing/i,
    /scan.*qr/i,
    /camera.*scanner/i,
    // Apps específicos populares
    /qr.*code.*scanner/i,
    /quick.*scan/i,
    /scan.*app/i,
    // Alguns navegadores em modo QR
    /mobile.*safari.*qr/i,
    /chrome.*mobile.*qr/i,
    // Verificar se veio de um mobile com referer vazio (típico de QR)
    /mobile/i
  ];

  // Verificar padrões de User-Agent
  const hasQRPattern = qrCodePatterns.some(pattern => pattern.test(userAgent));

  // Verificar se é mobile sem referer (comum em QR codes)
  const referer = req.get('Referer') || req.get('Referrer') || '';
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  const hasNoReferer = !referer || referer.trim() === '';

  // Detectar se é um acesso direto móvel (típico de QR)
  const isMobileDirectAccess = isMobile && hasNoReferer;

  // Também aceitar se tem parâmetros que sugerem QR
  const hasQRParam = req.query.qr === '1' || req.query.source === 'qr';

  const isQRAccess = hasQRPattern || isMobileDirectAccess || hasQRParam;

  console.log(`🔍 QR Detection - Pattern: ${hasQRPattern}, Mobile: ${isMobile}, NoReferer: ${hasNoReferer}, QRParam: ${hasQRParam}, Result: ${isQRAccess}`);

  return isQRAccess;
}

// Página principal da sala virtual
router.get('/vr/:id', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const roomId = req.params.id;

    // Verificar se sala existe (básico)
    if (!roomId || !/^[a-zA-Z0-9]+$/.test(roomId)) {
      throw commonErrors.badRequest('ID da sala inválido');
    }

    // SISTEMA QR CODE: Detectar se acesso veio via QR Code
    const userAgent = req.get('User-Agent') || '';
    const isFromQRCode = detectQRCodeAccess(req, userAgent);

    console.log(`🔍 QR CODE DEBUG - UserAgent: ${userAgent}`);
    console.log(`🔍 QR CODE DEBUG - Detectado QR Code: ${isFromQRCode}`);

    // Se for sala 'pub' e NÃO veio do QR Code e NÃO está autenticado, redirecionar para login
    if (roomId === 'pub' && !isFromQRCode) {
      const { isAuthenticated } = req.biblos360Auth || {};
      if (!isAuthenticated) {
        console.log('🚫 Acesso direto à sala pública sem QR Code - redirecionando para login');
        return res.redirect('/vr/login');
      }
    }

    // Log de depuração para entender o estado da autenticação
    const { isAuthenticated, isAnonymous, user } = req.biblos360Auth || {};
    console.log('ðŸ” Acesso Á  sala:', {
      roomId,
      isAuthenticated,
      hasUser: !!user,
      userId: user?.data?.id,
      userName: user?.data?.nome || user?.data?.apelido,
      cookies: Object.keys(req.cookies || {}),
      userAgent: req.get('User-Agent')?.substring(0, 50)
    });

    // MODO DEBUG: Permitir acesso temporário sem autenticação rígida
    // Para desenvolvimento e teste
    let userData = null;
    if (isAuthenticated && user) {
      userData = user.data;

      // Buscar nível do usuário no arquivo participantes.json na nova localização
      try {
        const participantesPath = path.join(__dirname, '../../../api/participantes.json');
        const participantesData = JSON.parse(await fs.readFile(participantesPath, 'utf8'));
        const participantRecord = participantesData.find(p => p.id == userData.id);

        if (participantRecord && typeof participantRecord.level !== 'undefined') {
          userData.level = participantRecord.level;
          console.log(`âœ… Nível encontrado em participantes.json: ${userData.apelido} (ID: ${userData.id}) - Nível: ${userData.level}`);
        } else if (participantRecord && participantRecord.extra && typeof participantRecord.extra.level !== 'undefined') {
          userData.level = participantRecord.extra.level;
          console.log(`âœ… Nível encontrado em participantes.json (campo extra): ${userData.apelido} (ID: ${userData.id}) - Nível: ${userData.level}`);
        } else {
          userData.level = userData.level || 0; // Manter o nível do cookie se não encontrar no arquivo
          console.log(`âš ï¸ Usuário não encontrado no participantes.json, usando nível do cookie: ${userData.apelido} (ID: ${userData.id}) - Nível: ${userData.level}`);
        }
      } catch (error) {
        console.error('âŒ Erro ao verificar nível em participantes.json:', error);
        userData.level = userData.level || 0; // Manter nível do cookie em caso de erro
      }

      console.log(`✅ Usuário autenticado: ${userData.nome || userData.apelido} (ID: ${userData.id}) - Nível final: ${userData.level}`);
    } else if (isAnonymous && user) {
      // Usuário anônimo com cookie de participante
      console.log(`👤 Usuário anônimo: ${user.nick} (UF: ${user.uf})`);

      // Formatação padrão para nome: primeira letra maiúscula, resto minúscula
      const formattedNick = formatNickname(user.nick || 'Visitante');

      userData = {
        id: user.participantId || `anon_${Date.now()}`,
        nome: formattedNick,
        apelido: formattedNick,
        level: 0,
        isAnonymous: true,
        uf: user.uf
      };
    } else {
      // Retornar erro se não há usuário autenticado
      console.log('âŒ Usuário não autenticado - redirecionando para login');
      // return res.redirect('/admin/tim/login'); // FIXME: Removido para permitir acesso público

      // ALTERADO: Permitir acesso público como convidado
      console.log("👤 Usuário não autenticado - permitindo acesso como convidado");
      userData = {
        id: 0,
        nome: "Convidado",
        apelido: "Convidado",
        level: 0,
        isGuest: true
      };
    }

    // Configurar cookies apenas se há usuário autenticado ou anônimo
    if ((isAuthenticated || isAnonymous) && userData) {
      // Configurar cookie de inscrição para evitar redirecionamento do JavaScript
      // O JavaScript do cliente verifica a existência deste cookie
      // Formato PHP serializado simplificado para compatibilidade
      const inscritoCookieValue = `a:1:{s:2:"ev";s:${roomId.length}:"${roomId}";}`;
      res.cookie('biblos360_site_inscrito', inscritoCookieValue, {
        httpOnly: false,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });
    }

    // Configurar cookie de sincronização de tempo
    res.cookie('biblos360_time_sync', Date.now().toString(), {
      httpOnly: false,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    console.log(`âœ… Carregando sala ${roomId} para usuário ${userData.nome || userData.apelido}`);

    // Carregar template
    // CORREÇÃO: Para sala admin, usar admin-main.html
    let templatePath;
    if (roomId === 'admin') {
      templatePath = path.join(__dirname, `../public/vr/admin/admin-main.html`);
    } else {
      templatePath = path.join(__dirname, `../public/vr/${roomId}/${roomId}.html`);
    }

    let html = await fs.readFile(templatePath, 'utf8');

    // CONTROLE DE ACESSO: Ocultar elementos administrativos para usuários nível 0
    const userLevel = userData.level || 0;
    console.log(`ðŸ” Controle de acesso: Usuário ${userData.apelido} possui nível ${userLevel}`);

    if (userLevel === 0) {
      console.log('🚫 Ocultando elementos administrativos para usuário nível 0');

      // Remover o div actions_admin completo com conteúdo
      html = html.replace(
        /<div id="actions_admin"[^>]*>[\s\S]*?<\/div>\s*<\/div>/g,
        '<!-- Elementos administrativos ocultos para usuário nível 0 -->'
      );

      // Como garantia adicional, também ocultar por CSS
      html = html.replace(
        '</head>',
        `<style type="text/css">
          #actions_admin {
            display: none !important;
            visibility: hidden !important;
          }
          .more.icon a[href*="admin"],
          .more.icon a[href*="monitor"] {
            display: none !important;
          }
        </style>
        </head>`
      );
    } else if (userLevel >= 1 && userLevel <= 2) {
      console.log(`👁️ Mostrando apenas MONITOR para usuário nível ${userLevel}`);

      // Para níveis 1 e 2: ocultar apenas o botão ADMIN, deixar MONITOR visível
      // Modificar o link do monitor para levar ao admin-main.html
      html = html.replace(
        /(<a href="[^"]*monitor[^"]*"[^>]*>)/g,
        `<a href="/vr/${roomId}/admin/admin-main.html?mode=monitor" title="Entrar no Painel de Monitoramento">`
      );

      // Ocultar apenas o botão ADMIN
      html = html.replace(
        '</head>',
        `<style type="text/css">
          .more.icon a[href*="admin/admin-main.html"]:not([href*="mode=monitor"]) {
            display: none !important;
          }
          .more.icon:has(a[href*="admin/admin-main.html"]:not([href*="mode=monitor"])) {
            display: none !important;
          }
        </style>
        </head>`
      );
    } else if (userLevel === 3) {
      console.log(`👑 Admin completo detectado - corrigindo links do monitor para nível ${userLevel}`);

      // Para admin (nível 3): Modificar o link do monitor para levar ao admin-main.html
      // (o botão admin já funciona normalmente)
      html = html.replace(
        /(<a href="[^"]*monitor[^"]*"[^>]*>)/g,
        `<a href="/vr/${roomId}/admin/admin-main.html?mode=monitor" title="Entrar no Painel de Monitoramento">`
      );

      console.log(`✅ Link do monitor corrigido para admin ${userData.apelido}`);
    } else {
      console.log(`✅ Elementos administrativos completos visíveis para usuário nível ${userLevel}`);
    }

    // Substituições básicas
    html = html.replace(/\{roomId\}/g, roomId);
    html = html.replace(/\{timestamp\}/g, Date.now());

    // Adicionar dados do usuário com padrão correto {{}} e conversão de tipos
    // Para usuários anônimos totais (convidados), deixar NICK vazio para que o formulário apareça
    // Para usuários autenticados, sempre definir um NICK para ocultar o formulário
    const isAnonymousTotal = userData.isGuest || (!isAuthenticated && !isAnonymous);
    const userNick = isAuthenticated ? (userData.apelido || userData.nome || 'Usuário') : '';

    console.log(`🔍 DEBUG NICK - isAuthenticated: ${isAuthenticated}, isAnonymous: ${isAnonymous}, isGuest: ${userData.isGuest}, userNick: "${userNick}"`);

    html = html.replace(/\{\{USER_ID\}\}/g, String(userData.id)); // Converte para string para compatibilidade
    html = html.replace(/\{\{USER_NICK\}\}/g, userNick);
    html = html.replace(/\{\{USER_UF\}\}/g, userData.uf || '');
    html = html.replace(/\{\{USER_SEXO\}\}/g, userData.sexo || '');
    html = html.replace(/\{\{USER_PARCEIRO\}\}/g, userData.parceiro || '0');
    html = html.replace(/\{\{USER_EQUIPE\}\}/g, userData.equipe || '');
    html = html.replace(/\{\{USER_TURMA\}\}/g, userData.turma || '');
    html = html.replace(/\{\{USER_GRUPO\}\}/g, userData.grupo || '');
    html = html.replace(/\{\{USER_REDE\}\}/g, userData.rede || '');

    // Adicionar variável para controlar visibilidade da lista de usuários
    const userAuthStatus = isAuthenticated ? 'authenticated' : 'guest';
    html = html.replace(/\{\{USER_AUTH_STATUS\}\}/g, userAuthStatus);

    // Adicionar classe CSS no body baseada no status de autenticação
    const bodyClassToAdd = isAuthenticated ? 'user-authenticated' : 'user-guest';
    html = html.replace(
      /(<body[^>]*class="[^"]*)(")/,
      `$1 ${bodyClassToAdd}$2`
    );

    // Adicionar CSS para ocultar lista de usuários quando não logado
    const hideUsersListCSS = `
    <style>
    /* Ocultar apenas as listas de nomes para usuários não logados */
    body.user-guest #virtual-sidebar-users ul[class*="users-list-"] {
        display: none !important;
    }
    </style>`;

    // Inserir CSS no head
    html = html.replace('</head>', `${hideUsersListCSS}\n</head>`);

    // Adicionar JavaScript mínimo para detectar login via chat
    const loginDetectionJS = `
    <script>
    // Detectar quando usuário faz login via chat e mostrar lista de participantes
    document.addEventListener('DOMContentLoaded', function() {
        if (document.body.classList.contains('user-guest')) {
            console.log('👤 Usuário não logado - lista de participantes oculta');

            // Observer para detectar quando o chat-box recebe a classe 'joined'
            var chatBox = document.querySelector('.chat-box');
            if (chatBox) {
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                            if (chatBox.classList.contains('joined')) {
                                console.log('✅ Login via chat detectado - mostrando lista de participantes');
                                document.body.classList.remove('user-guest');
                                document.body.classList.add('user-authenticated');
                            }
                        }
                    });
                });

                observer.observe(chatBox, {
                    attributes: true,
                    attributeFilter: ['class']
                });
            }
        }
    });
    </script>`;

    // Inserir JavaScript antes do fechamento do body
    html = html.replace('</body>', `${loginDetectionJS}\n</body>`);

    // Inserir formulário de chat dinamicamente para usuários não logados
    if (!isAuthenticated && !isAnonymous) {
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

      // Inserir o formulário diretamente no local apropriado (sem container extra)
      html = html.replace(
        '</div>\n        <script>',
        `</div>\n        ${chatFormHtml}\n        <script>`
      );

      console.log(`📝 Formulário de chat inserido dinamicamente para usuário não logado na sala ${roomId}`);
    } else {
      console.log(`🔒 Formulário de chat não inserido - usuário autenticado ou anônimo participante na sala ${roomId}`);
    }

    // Injetar mensagem atual do quadro de avisos do room.json
    let currentRoomInfo = '';
    try {
      const roomData = await services.loadRoomData(roomId, 'room');
      currentRoomInfo = roomData?.config?.info_message || '';
    } catch (error) {
      console.warn(`âš ï¸ Erro ao carregar mensagem do quadro de avisos para sala ${roomId}:`, error.message);
    }
    html = html.replace(/data-info="[^"]*"/g, `data-info="${currentRoomInfo.replace(/"/g, '&quot;')}"`);

    console.log(`ðŸ“¢ Mensagem do quadro de avisos injetada para sala ${roomId}: "${currentRoomInfo}"`);
    // Injetar script de detecção de logout (voluntário e forçado)
    const logoutScript = `<script>
(function() {
  console.log('🚀 SCRIPT INJETADO: Sistema de logout iniciado');
  let isLogoutTriggered = false;

  function notifyVoluntaryLogout() {
    if (isLogoutTriggered) return;
    isLogoutTriggered = true;
    console.log('🚪 Logout voluntário detectado');

    if (window.socket && window.socket.connected) {
      window.socket.emit('voluntary-logout');
    }

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/voluntary-logout', '{}');
    }
  }

  function setupForcedLogoutDetection() {
    // REDIRECIONAMENTO AUTOMÁTICO GARANTIDO EM 20 MINUTOS
    setTimeout(function() {
      console.log("🔄 TIMEOUT 20min: Redirecionando automaticamente");
      const path = window.location.pathname;
      const roomId = path.includes("/vr/") ? path.split("/vr/")[1].split("/")[0] : "pub";
      window.location.replace("/vr/logout?room=" + roomId + "&reason=auto_20min&t=" + Date.now());
    }, 1205000); // 20 minutos + 5 segundos de margem
    if (window.socket) {
      window.socket.on('forced-logout', function(data) {
        console.log('🚨 Logout forçado:', data);
        isLogoutTriggered = true;

        const path = window.location.pathname;
        const roomId = path.includes('/vr/') ? path.split('/vr/')[1].split('/')[0] : 'pub';
        window.location.replace('/vr/logout?room=' + roomId + '&reason=' + (data.reason || 'timeout'));
      });

      window.socket.on('disconnect', function(reason) {
        if (isLogoutTriggered) return;
        console.log('⚠️ Desconexão:', reason);

        if (reason === 'io server disconnect' || reason === 'transport close') {
          setTimeout(function() {
            if (!window.socket.connected) {
              const path = window.location.pathname;
              const roomId = path.includes('/vr/') ? path.split('/vr/')[1].split('/')[0] : 'pub';
              window.location.replace('/vr/logout?room=' + roomId + '&reason=disconnect');
            }
          }, 3000); // 3 segundos para problemas de conectividade
        }
      });
    } else {
      setTimeout(setupForcedLogoutDetection, 1000);
    }
  }

  window.addEventListener('beforeunload', notifyVoluntaryLogout);
  window.addEventListener('pagehide', notifyVoluntaryLogout);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupForcedLogoutDetection);
  } else {
    setupForcedLogoutDetection();
  }
})();
</script>`;
    html = html.replace('</body>', logoutScript + '</body>');

    // Adicionar elemento de notificação automática para todos os usuários (autenticados ou não)
    if (true) { // Sempre aplicar o sistema de notificação
      // CÓDIGO COMENTADO - Estava causando problemas no layout
      // Inserir no local correto - após os outros toggles
      /*
      html = html.replace(
        '</div>\n    </div>\n    <script>',
        `</div>
    </div>
    <div id="virtual-sidebar-notifications-toggle" class="noprint">
      <div class="notifications-toggle welcome-tooltip-notifications" data-step="0" style="display: none;">
        <a href="#" class="tooltip" data-pt-title="Clique para ativar notificações">
          <i class="fas fa-bell"></i>
        </a>
      </div>
    </div>
    <script>`
      );
      */

      // Sistema de notificação simplificado - apenas CSS básico
      const notificationScript = `<style>
.welcome-tooltip, .protip-tooltip { z-index: 999999 !important; }
</style>
<script>
// Sistema básico de autorização de notificação
if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
  setTimeout(function() {
  console.log('🚀 SCRIPT INJETADO: Sistema de logout iniciado');
    if (typeof $ !== 'undefined') {
      $('.notifications-toggle').css('display', 'inline-block');
    }
  }, 2000);
}
</script>`;
      html = html.replace('</body>', notificationScript + '</body>');
    }

    // Sistema de notificação sempre ativo para todos os usuários
    const notificationInterceptor = `<script>
// Sistema simples de notificação
(function() {
  console.log('🚀 SCRIPT INJETADO: Sistema de logout iniciado');
  console.log('� Iniciando sistema de notificação');

  function criarNotificacaoVisual(mensagem) {
    console.log('📱 Criando notificação visual:', mensagem);

    // Usar notificações desktop nativas em vez de overlays
    if ('Notification' in window && Notification.permission === 'granted') {
      var notification = new Notification('Sala Virtual - Notificação', {
        body: mensagem,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'sala-virtual-notification',
        requireInteraction: false
      });

      // Auto-fechar após 5 segundos
      setTimeout(function() {
  console.log('🚀 SCRIPT INJETADO: Sistema de logout iniciado');
        notification.close();
      }, 5000);

      // Fechar ao clicar
      notification.onclick = function() {
        window.focus();
        notification.close();
      };
    } else {
      console.log('DESKTOP NOTIFICATIONS NOT AVAILABLE - Mensagem:', mensagem);
    }
  }

  // Aguardar SOCKET
  var tentativas = 0;
  function verificarSocket() {
    tentativas++;
    console.log('🔌 Tentativa', tentativas, '- Verificando SOCKET...');

    if (typeof SOCKET !== 'undefined' && SOCKET && SOCKET.on) {
      console.log('✅ SOCKET encontrado! Configurando listener...');

      SOCKET.on('notification', function(msg, body) {
        console.log('📢 Notificação recebida:', msg);
        criarNotificacaoVisual(msg + (body ? ' - ' + body : ''));
      });

    } else if (tentativas < 10) {
      setTimeout(verificarSocket, 1000);
    } else {
      console.log('❌ SOCKET não encontrado após 10 tentativas');
    }
  }

  verificarSocket();
})();
</script>`;
    // html = html.replace('</body>', notificationInterceptor + '</body>'); // DESABILITADO - usando middleware do server.js

    // CORREÇÕES LIVEPLAYER: Corrigir problemas de tela preta no mobile e vídeos duplicados
    const livePlayerFix = `<script>
(function() {
  console.log('🎥 CORREÇÕES LIVEPLAYER: Iniciando correções para mobile e duplicação');

  // Sobrescrever função loadLivePlayer original para corrigir problemas
  if (typeof window.loadLivePlayer === 'function') {
    const originalLoadLivePlayer = window.loadLivePlayer;
    
    window.loadLivePlayer = function(src, title) {
      console.log('🎥 CORREÇÃO: loadLivePlayer chamado com:', { src, title });
      
      // Verificar se já existe iframe ativo
      const existingIframe = document.querySelector('#liveplayer iframe');
      if (existingIframe && existingIframe.src === src) {
        console.log('🎥 CORREÇÃO: Iframe já carregado com a mesma URL, ignorando');
        return;
      }
      
      // Remover todos os iframes existentes para evitar duplicação
      const allIframes = document.querySelectorAll('#liveplayer iframe');
      allIframes.forEach(iframe => {
        console.log('🎥 CORREÇÃO: Removendo iframe existente');
        iframe.remove();
      });
      
      // Chamar função original
      return originalLoadLivePlayer.call(this, src, title);
    };
  }

  // Correções CSS específicas para mobile
  const mobileFixes = document.createElement('style');
  mobileFixes.innerHTML = \`
    /* CORREÇÕES LIVEPLAYER MOBILE */
    @media screen and (max-width: 767px) {
      .video-box {
        min-height: 200px !important;
        height: auto !important;
        padding-bottom: 56.25% !important;
        position: relative !important;
        background: #000 !important;
      }
      
      .video-box iframe {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        border: 0 !important;
        background: #000 !important;
      }
      
      #liveplayer {
        position: relative !important;
        display: block !important;
        width: 100% !important;
        background: #000 !important;
      }
      
      /* Garantir visibilidade no mobile */
      #liveonline {
        display: block !important;
        visibility: visible !important;
      }
      
      /* Corrigir orientação landscape */
      @media screen and (orientation: landscape) and (max-height: 500px) {
        .video-box {
          height: calc(100vh - 100px) !important;
          padding-bottom: 0 !important;
        }
      }
    }
    
    /* CORREÇÕES GERAIS ANTI-DUPLICAÇÃO */
    #liveplayer {
      position: relative;
      overflow: hidden;
    }
    
    #liveplayer iframe:not(:first-child) {
      display: none !important;
    }
  \`;
  document.head.appendChild(mobileFixes);

  // Observer para detectar criação de múltiplos iframes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        const liveplayer = document.getElementById('liveplayer');
        if (liveplayer) {
          const iframes = liveplayer.querySelectorAll('iframe');
          if (iframes.length > 1) {
            console.log('🎥 CORREÇÃO: Detectados múltiplos iframes, removendo duplicatas');
            // Manter apenas o último iframe (mais recente)
            for (let i = 0; i < iframes.length - 1; i++) {
              iframes[i].remove();
            }
          }
        }
      }
    });
  });

  // Observar mudanças no liveplayer
  const liveplayer = document.getElementById('liveplayer');
  if (liveplayer) {
    observer.observe(liveplayer, {
      childList: true,
      subtree: true
    });
  }

  // Correção para detectar quando o liveplayer é carregado
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🎥 CORREÇÃO: DOM carregado, aplicando correções finais');
    
    // Garantir que apenas um iframe esteja visível
    const iframes = document.querySelectorAll('#liveplayer iframe');
    if (iframes.length > 1) {
      console.log('🎥 CORREÇÃO: Removendo iframes duplicados no carregamento');
      for (let i = 0; i < iframes.length - 1; i++) {
        iframes[i].remove();
      }
    }
    
    // Aplicar correções específicas para mobile
    const isMobile = window.innerWidth <= 767 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      console.log('🎥 CORREÇÃO: Dispositivo mobile detectado, aplicando correções específicas');
      
      const videoBox = document.querySelector('.video-box');
      if (videoBox) {
        videoBox.style.backgroundColor = '#000';
        videoBox.style.minHeight = '200px';
        videoBox.style.position = 'relative';
      }
    }
  });

  console.log('🎥 CORREÇÕES LIVEPLAYER: Correções aplicadas com sucesso');
})();
</script>`;
    
    html = html.replace('</body>', livePlayerFix + '\n</body>');

    res.send(html);
  } catch (error) {
    console.error(`Erro ao carregar sala ${req.params.id}:`, error);
    errors.renderError(req, res, 'notFound', {
      statusCode: 404,
      message: `Sala "${req.params.id}" não encontrada`
    });
  }
}));

// Sessões da sala
router.get('/vr/:id/sessoes', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const sessoes = await loadRoomData(roomId, 'sessoes');

    res.set('Cache-Control', 'public, max-age=300');
    res.json({
      sessions: sessoes,
      total: sessoes.length,
      room_id: roomId
    });
  } catch (error) {
    res.status(500).json({
      sessions: [],
      total: 0,
      error: 'Erro ao carregar sessões'
    });
  }
}));

// Dados extras do usuário
router.get('/vr/:id/extra', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const { isAuthenticated, user, inscricao } = req.biblos360Auth || {};

    // Se não está autenticado, retorna dados básicos de visitante
    if (!isAuthenticated || !user) {
      return res.json({
        extid: null,
        uf: null,
        sexo: null,
        parceiro: "0",
        equipe: null,
        turma: null,
        grupo: null,
        rede: null,
        nivel: 0,
        conf: null,
        breakout: 0,
        evaluation: 0,
        review: 0,
        popup: 0,
        vote: 0,
        watcher: null,
        watcher_item: null,
        checkin: 0
      });
    }

    // Buscar dados completos do usuário no arquivo participantes.json
    const participantesData = await loadRoomData('default', 'participantes');
    const usuario = participantesData?.find(u => u.id == user.data.id) || null;

    // Determinar nível do usuário (prioridade: participantes.json > cookie)
    const userLevel = usuario?.level || usuario?.extra?.level || user.data.level || 0;

    console.log(`ðŸ“Š Extra data para usuário ${user.data.id}: level=${userLevel}, isAdmin=${user.data.isAdmin || false}, from=${usuario ? 'participantes.json' : 'cookie'}`);

    // Construir resposta com dados dinâmicos do usuário autenticado
    const extraData = {
      extid: user.data.id,
      uf: usuario?.uf || user.data.uf || null,
      sexo: usuario?.sexo || user.data.sexo || null,
      parceiro: usuario?.parceiro || user.data.parceiro || "0",
      equipe: usuario?.equipe || user.data.equipe || null,
      turma: usuario?.turma || user.data.turma || null,
      grupo: usuario?.grupo || user.data.grupo || null,
      rede: usuario?.rede || user.data.rede || null,
      nivel: userLevel, // Campo para controle de exibição de elementos administrativos
      level: userLevel, // Compatibilidade adicional
      nick: usuario?.nick || usuario?.apelido || (usuario?.nome ? usuario.nome.split(' ')[0] : null) || (user.data.apelido ? user.data.apelido : (user.data.nome ? user.data.nome.split(' ')[0] : null)),
      conf: null, // Conferência ativa (inicialmente null)
      breakout: 0,
      evaluation: 0,
      review: 0,
      popup: 0,
      vote: 0,
      watcher: null,
      watcher_item: null,
      checkin: 0
    };

    res.set('Cache-Control', 'public, max-age=60');
    res.json(extraData);
  } catch (error) {
    console.error('Erro ao carregar dados extras:', error);
    res.status(500).json({
      error: 'Erro ao carregar dados extras',
      timestamp: new Date().toISOString()
    });
  }
}));

// Stream overlay para admin (live streaming)
router.get('/vr/:id/stream', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const roomId = req.params.id;

    // HTML do overlay de streaming para o painel admin
    const streamHtml = `

      <div style="height: 280px; max-width: 500px">
		      <div class="video-box">
			    <iframe id="liveiframe" src="" frameborder="0" title="" allow="autoplay; fullscreen; encrypted-media" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen="">
          </iframe>
		     </div>
	    </div>
    `;

    res.set('Cache-Control', 'no-cache');
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(streamHtml);

  } catch (error) {
    console.error('Erro ao carregar overlay de stream:', error);
    res.status(500).send('<div class="error">Erro ao carregar interface de streaming</div>');
  }
}));

// Dropbox da sala
router.get('/vr/:id/dropbox', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const roomId = req.params.id;

    // Primeiro tenta carregar o arquivo HTML específico da sala
    const dropboxHtmlPath = path.join(__dirname, '../public/vr', roomId, 'dropbox/dropbox.html');

    try {
      const dropboxHtml = await fs.readFile(dropboxHtmlPath, 'utf8');
      res.set('Cache-Control', 'public, max-age=60');
      res.send(dropboxHtml);
      return;
    } catch (htmlError) {
      // Se não encontrar o HTML, tenta carregar dados JSON e gerar HTML
      console.warn(`Arquivo HTML não encontrado: ${dropboxHtmlPath}, tentando JSON...`);
    }

    // Fallback: carrega dados JSON e gera HTML compatível
    const files = await loadRoomData(roomId, 'dropbox');
    const template = config.criticalEndpoints?.['/vr/:id/dropbox']?.template || 'dropbox_table';

    let dropboxHtml = `<table width="100%" border="0" cellspacing="0" cellpadding="0" class="${template}">`;

    if (files.length === 0) {
      dropboxHtml += '<tr><td colspan="3" class="dropbox_empty">Nenhum arquivo disponível</td></tr>';
    } else {
      const iconBasePath = config.files?.iconBasePath || '/img/dropbox/';

      files.forEach(file => {
        const iconClass = getFileIcon(file.extension || 'default');
        const fileSize = formatFileSize(file.size || 0);

        dropboxHtml += `
          <tr class="dropbox_row">
            <td width="1" class="nowrap dropbox_icon" style="padding: 1px 5px 1px 5px; text-align: right">
              <img src="${iconBasePath}${iconClass}.gif" style="width: 14px !important; height: 14px !important; max-width: 14px !important" alt=""/>
            </td>
            <td class="dropbox_file" style="padding: 1px 0px 1px 1px">
              <a href="${file.href || '#'}" download="${file.filename || file.name}" data-folders="${file.folders || ''}" class="tooltip">
                ${file.filename || file.name}
              </a>
            </td>
            <td width="1" class="nowrap dropbox_filesize" align="right" style="padding-left: 10px">${fileSize}</td>
          </tr>
        `;
      });
    }
    dropboxHtml += '</table>';

    res.set('Cache-Control', 'public, max-age=60');
    res.send(dropboxHtml);

  } catch (error) {
    console.error(`Erro ao carregar dropbox da sala ${req.params.id}:`, error);
    const fallbackHtml = '<table class="dropbox_table"><tr><td colspan="3" class="dropbox_empty">Erro ao carregar arquivos</td></tr></table>';
    res.set('Cache-Control', 'public, max-age=60');
    res.send(fallbackHtml);
  }
}));

// Chat da sala
router.get('/chat/:id', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const chatPath = path.join(__dirname, '../public/chat', `${roomId}.html`);

    // Verificar se arquivo existe
    await fs.access(chatPath);
    res.sendFile(chatPath);
  } catch (error) {
    errors.renderError(req, res, 'notFound', {
      statusCode: 404,
      message: `Chat da sala "${req.params.id}" não encontrado`
    });
  }
}));

// Fórum da sala
router.get('/vr/:roomId/forum/:item', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const item = req.params.item;
    const roomId = req.params.roomId;
    const { isAuthenticated, user } = req.biblos360Auth || {};

    console.log(`🔥 [FORUM] Acesso ao fórum - Room: ${roomId}, Item: ${item}, User:`, user?.data?.id || 'anônimo');

    // Verificar se o item do fórum existe (por enquanto apenas item 1111 é suportado)
    if (item !== '1111') {
      console.log(`❌ [FORUM] Item ${item} não encontrado`);
      return errors.renderError(req, res, 'notFound', {
        statusCode: 404,
        message: `Item do fórum "${item}" não encontrado`
      });
    }

    // Dados do usuário (compatível com sistema legado)
    let userData = {
      nick: 'Visitante',
      extra: {
        extid: null,
        uf: '',
        sexo: '',
        parceiro: 0,
        equipe: '',
        turma: '',
        grupo: '',
        rede: ''
      }
    };

    if (isAuthenticated && user && user.data) {
      const userInfo = user.data;
      userData.nick = userInfo.nome || userInfo.apelido || userInfo.email?.split('@')[0] || 'Usuário';
      userData.extra = {
        extid: userInfo.id,
        uf: userInfo.uf || 'SP',
        sexo: userInfo.sexo || '1',
        parceiro: userInfo.parceiro || 0,
        equipe: userInfo.equipe || '',
        turma: userInfo.turma || '',
        grupo: userInfo.grupo || '',
        rede: userInfo.rede || ''
      };
    }

    // Renderizar template do fórum
    const html = controllers.forumController.renderForumPage(roomId, item, userData);
    
    console.log(`✅ [FORUM] Página do fórum renderizada com sucesso - Item: ${item}`);
    res.send(html);

  } catch (error) {
    console.error(`❌ [FORUM] Erro ao carregar fórum:`, error);
    errors.renderError(req, res, 'internalError', {
      statusCode: 500,
      message: 'Erro interno do servidor ao carregar o fórum'
    });
  }
}));

// ========================================
// SEÇÁO 8: ROTAS DE ARQUIVOS ESTÁTICOS
// ========================================

// Servir arquivos estáticos
router.use('/public', express.static(path.join(__dirname, '../public')));

// ========================================
// SEÇÁO 8.5: ROTAS DE CRIAÇÁO DE SALAS VIRTUAIS
// ========================================

/**
 * API para criar nova sala virtual
 * Baseado no sistema virtual_adv.js identificado na pasta novos/
 */
router.post('/api/rooms/create', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const { isAuthenticated, user } = req.biblos360Auth || {};

    // Verificar autenticação
    if (!isAuthenticated || !user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    // Verificar permissões administrativas (nível 2+)
    const userLevel = user.data?.level || 0;
    if (userLevel < 2) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado: necessário nível de moderador ou superior para criar salas'
      });
    }

    const {
      id,
      title,
      subtitle,
      category,
      live_enabled = true,
      chat_enabled = true,
      jitsi_enabled = true,
      salas_unified = false,
      VIRTUAL_DELAY = 0,
      live_url,
      salas_enabled = ['sala'],
      advanced_features = [],
      admin_level = 2,
      professor_limit,
      cookie_check = true,
      time_sync = true,
      schedule_enabled = false,
      dropbox_enabled = false,
      multiday_support = false,
      custom_css,
      welcome_message
    } = req.body;

    // Validações básicas
    if (!id || !title || !category) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: id, title, category'
      });
    }

    // Validar ID da sala (apenas letras e números)
    if (!/^[a-zA-Z0-9]+$/.test(id) || id.length < 3 || id.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'ID da sala deve conter apenas letras e números (3-20 caracteres)'
      });
    }

    // Categorias válidas baseadas no virtual_adv.js
    const validCategories = ['ead', 'educational', 'forum', 'chat', 'continuous'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Categoria inválida. Valores aceitos: ${validCategories.join(', ')}`
      });
    }

    // Tipos de salas válidos baseados no virtual_adv.js (SALAS array)
    const validSalas = ['sala', 'turma', 'grupo', 'projeto', 'atendimento', 'oracao', 'rede', 'professor', 'equipe', 'reuniao', 'breakout'];
    const invalidSalas = salas_enabled.filter(sala => !validSalas.includes(sala));
    if (invalidSalas.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Tipos de sala inválidos: ${invalidSalas.join(', ')}. Valores aceitos: ${validSalas.join(', ')}`
      });
    }

    // Recursos avançados válidos
    const validFeatures = [
      'popup_interactions', 'evaluation_system', 'presence_control', 'poll_system',
      'notification_system', 'timer_system', 'dropbox_integration',
      'session_schedule', 'markdown_support'
    ];
    const invalidFeatures = advanced_features.filter(feature => !validFeatures.includes(feature));
    if (invalidFeatures.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Recursos inválidos: ${invalidFeatures.join(', ')}. Valores aceitos: ${validFeatures.join(', ')}`
      });
    }

    console.log(`ðŸ—ï¸ Criando nova sala virtual: ${id} (${title}) - Categoria: ${category}`);
    console.log(`ðŸŽ¯ Recursos ativados: ${advanced_features.join(', ')}`);
    console.log(`ðŸ›ï¸ Tipos de conferência: ${salas_enabled.join(', ')}`);

    // Verificar se sala já existe
    const roomDir = path.join(__dirname, '../public/vr', id);
    try {
      await fs.access(roomDir);
      return res.status(409).json({
        success: false,
        error: `Sala '${id}' já existe`
      });
    } catch (error) {
      // Sala não existe, podemos continuar
    }

    // Criar estrutura de diretórios baseada no virtual_adv.js
    await fs.mkdir(roomDir, { recursive: true });

    // Subdiretórios baseados na funcionalidade do virtual_adv.js
    const subDirs = ['api', 'data', 'data/cache', 'data/logs', 'data/uploads'];
    if (dropbox_enabled) {
      subDirs.push('data/dropbox');
    }
    if (schedule_enabled) {
      subDirs.push('data/sessions');
    }

    for (const subDir of subDirs) {
      await fs.mkdir(path.join(roomDir, subDir), { recursive: true });
    }

    // Diretórios adicionais baseados nas funcionalidades do virtual_adv.js
    await fs.mkdir(path.join(roomDir, 'dropbox'), { recursive: true });
    await fs.mkdir(path.join(roomDir, 'forum'), { recursive: true });
    await fs.mkdir(path.join(roomDir, 'forum/api'), { recursive: true });
    await fs.mkdir(path.join(roomDir, 'admin'), { recursive: true });
    await fs.mkdir(path.join(roomDir, 'monitor'), { recursive: true });
    await fs.mkdir(path.join(roomDir, 'chat'), { recursive: true });

    // Gerar configurações JSON da sala com todas as funcionalidades do virtual_adv.js
    const roomConfig = {
      id: id,
      title: title,
      subtitle: subtitle || '',
      category: category,
      created: new Date().toISOString(),
      created_by: {
        id: user.data.id,
        name: user.data.nome || user.data.apelido,
        level: userLevel
      },
      config: {
        // Configurações principais baseadas no virtual_adv.js
        [`VIRTUAL_${category.toUpperCase()}`]: true,
        VIRTUAL: true,
        VIRTUAL_FORUM: category === 'forum',
        VIRTUAL_EAD: category === 'ead',
        VIRTUAL_EDUCATIONAL: category === 'educational',
        VIRTUAL_CHAT: category === 'chat',
        VIRTUAL_CONTINUOUS: category === 'continuous',

        // Configurações de salas baseadas no virtual_adv.js
        SALAS_UNIFIED: salas_unified,
        SALAS_ACTIVE: false,
        VIRTUAL_DELAY: parseInt(VIRTUAL_DELAY) || 0,

        // Recursos básicos
        live_enabled: live_enabled,
        chat_enabled: chat_enabled,
        jitsi_enabled: jitsi_enabled,

        // URL fixa para transmissão
        FIXED_LIVE_URL: live_url ? live_url : false,

        // Configurações de segurança do virtual.js
        cookie_check: cookie_check,
        time_sync: time_sync,

        // Recursos de programação e integração
        schedule_enabled: schedule_enabled,
        dropbox_enabled: dropbox_enabled,
        multiday_support: multiday_support,

        // Personalização
        custom_css: custom_css || '',
        welcome_message: welcome_message || ''
      },

      // Array SALAS do virtual_adv.js
      salas_enabled: salas_enabled.length > 0 ? salas_enabled : ['sala'],

      // Recursos avançados do virtual_adv.js
      advanced_features: advanced_features,

      // Sistema de permissões baseado no virtual_adv.js
      permissions: {
        admin_level: parseInt(admin_level) || 2,
        professor_limit: professor_limit || '',
        public_access: true
      },

      // Configurações específicas do virtual_adv.js
      features: {
        // Sistemas de interação
        popup_interactions: advanced_features.includes('popup_interactions'),
        evaluation_system: advanced_features.includes('evaluation_system'),
        presence_control: advanced_features.includes('presence_control'),
        poll_system: advanced_features.includes('poll_system'),

        // Sistemas de comunicação
        notification_system: advanced_features.includes('notification_system'),
        timer_system: advanced_features.includes('timer_system'),
        markdown_support: advanced_features.includes('markdown_support'),

        // Integrações
        dropbox_integration: advanced_features.includes('dropbox_integration'),
        session_schedule: advanced_features.includes('session_schedule')
      },

      // Contadores de usuários do virtual_adv.js
      user_count: {
        total: 0,
        online: 0,
        offline: 0,
        insc: 0,
        staff: 0,
        sala: 0,
        professor: 0,
        turma: 0,
        grupo: 0,
        projeto: 0,
        atendimento: 0,
        oracao: 0,
        rede: 0,
        equipe: 0,
        reuniao: 0,
        breakout: 0
      }
    };

    // Salvar configuração principal
    await fs.writeFile(
      path.join(roomDir, 'config.json'),
      JSON.stringify(roomConfig, null, 2),
      'utf8'
    );

    // Gerar template HTML baseado no virtual_adv.js e categoria
    const htmlTemplate = generateAdvancedRoomHTML(roomConfig);
    await fs.writeFile(path.join(roomDir, `${id}.html`), htmlTemplate, 'utf8');

    // Gerar arquivos API baseados no virtual.js
    await generateVirtualJSApiFiles(roomDir, roomConfig);

    // Configurar sistema de sessões se habilitado
    if (schedule_enabled) {
      await generateSessionsSystem(roomDir, roomConfig);
    }

    // Configurar integração Dropbox se habilitada
    if (dropbox_enabled) {
      await generateDropboxIntegration(roomDir, roomConfig);
    }

    // Gerar CSS personalizado baseado na categoria
    await generateCategoryCSS(roomDir, roomConfig);

    // Log da criação
    console.log(`âœ… Sala virtual '${id}' criada com sucesso!`);
    console.log(`ðŸ“ Diretório: ${roomDir}`);
    console.log(`ðŸŽ¯ Categoria: ${category}`);
    console.log(`ðŸ›ï¸ Conferências: ${salas_enabled.join(', ')}`);
    console.log(`â­ Recursos: ${advanced_features.length} avançados`);

    res.status(201).json({
      success: true,
      message: 'Sala virtual criada com sucesso',
      room: roomConfig,
      access_url: `/vr/${id}`,
      admin_url: `/vr/${id}/admin`,
      monitor_url: `/vr/${id}/monitor`
    });

    // Gerar arquivos padrão baseados no sistema existente

    // 1. sessoes.json (cronograma vazio)
    const defaultSessions = [];
    await fs.writeFile(
      path.join(roomDir, 'sessoes.json'),
      JSON.stringify(defaultSessions, null, 2),
      'utf8'
    );

    // 2. participantes.json (lista vazia inicial)
    const defaultParticipants = [];
    await fs.writeFile(
      path.join(roomDir, 'participantes.json'),
      JSON.stringify(defaultParticipants, null, 2),
      'utf8'
    );

    // 3. dropbox/dropbox.html (estrutura básica)
    const dropboxTemplate = generateDropboxHTML();
    await fs.writeFile(
      path.join(roomDir, 'dropbox/dropbox.html'),
      dropboxTemplate,
      'utf8'
    );

    // 4. forum/api/messages.json (mensagens do fórum vazias)
    const defaultForumMessages = [];
    await fs.writeFile(
      path.join(roomDir, 'forum/api/messages.json'),
      JSON.stringify(defaultForumMessages, null, 2),
      'utf8'
    );

    // 5. extra.json (configurações extras baseadas no virtual.js)
    const extraConfig = {
      room_id: id,
      room_title: title,
      category: category,
      timestamp: new Date().toISOString()
    };
    await fs.writeFile(
      path.join(roomDir, 'extra.json'),
      JSON.stringify(extraConfig, null, 2),
      'utf8'
    );

    console.log(`âœ… Sala virtual '${id}' criada com sucesso por ${user.data.nome || user.data.apelido}`);

    // Resposta de sucesso
    res.status(201).json({
      success: true,
      message: `Sala '${title}' criada com sucesso`,
      room: {
        id: id,
        title: title,
        category: category,
        url: `/vr/${id}`,
        admin_url: `/vr/${id}/admin/admin-main.html`,
        monitor_url: `/vr/${id}/monitor/monitor-main.html`,
        created_by: user.data.nome || user.data.apelido,
        created_at: roomConfig.created,
        config: roomConfig.config,
        salas_enabled: roomConfig.salas_enabled
      }
    });

  } catch (error) {
    console.error('âŒ Erro ao criar sala virtual:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}));

// ========================================
// FUNÁ‡Á•ES AUXILIARES PARA CRIAÇÁO DE SALAS BASEADAS NO VIRTUAL.JS
// ========================================

/**
 * Gera template HTML avançado baseado no virtual_adv.js
 */
function generateAdvancedRoomHTML(roomConfig) {
  const { id, title, subtitle, category, config, features } = roomConfig;

  // Classes CSS baseadas no virtual.js
  const bodyClasses = [
    'virtual',
    `virtual-${category}`,
    config.VIRTUAL_FORUM ? 'virtual-forum' : '',
    config.VIRTUAL_EAD ? 'virtual-ead' : '',
    config.VIRTUAL_EDUCATIONAL ? 'virtual-educational' : '',
    config.VIRTUAL_CHAT ? 'virtual-chat' : '',
    config.VIRTUAL_CONTINUOUS ? 'virtual-continuous' : ''
  ].filter(Boolean).join(' ');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}${subtitle ? ' - ' + subtitle : ''}</title>

    <!-- CSS baseado no virtual_adv.js -->
    <link href="/bundle.css" rel="stylesheet" type="text/css">
    <link href="/virtual.css" rel="stylesheet" type="text/css">
    ${config.custom_css ? `<style>${config.custom_css}</style>` : ''}

    <!-- Font Awesome para ícones -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

    <!-- Meta tags baseadas no virtual.js -->
    <meta name="event-id" content="${id}">
    <meta name="event-category" content="${category}">
    <meta name="virtual-type" content="${category}">
</head>
<body class="${bodyClasses}">
    <!-- Input escondido para ID do evento (requerido pelo virtual.js) -->
    <input type="hidden" id="ev" value="${id}">

    <!-- Container principal baseado no virtual_adv.js -->
    <div id="virtual-container">

        <!-- Cabeçalho da sala -->
        <header id="virtual-header">
            <div class="virtual-header-content">
                <h1>${title}</h1>
                ${subtitle ? `<h2>${subtitle}</h2>` : ''}
                ${config.welcome_message ? `<div class="welcome-message">${config.welcome_message}</div>` : ''}
            </div>
        </header>

        <!-- Conteúdo principal -->
        <main id="virtual-main">

            <!-- Player de vídeo/transmissão (se habilitado) -->
            ${config.live_enabled ? `
            <div id="virtual-video-container">
                <div id="liveplayer" data-src="${config.FIXED_LIVE_URL || ''}" data-title="${title}">
                    <!-- Player será carregado dinamicamente pelo virtual.js -->
                </div>
            </div>
            ` : ''}

            <!-- Área de conferências (baseada no SALAS array) -->
            <div class="confs" style="display: none;">
                ${roomConfig.salas_enabled.map(sala => `
                    <div class="live-hidden-conf-${sala}">
                        <a href="#virtual-conf-${sala}" class="colorbox conf-${sala}">
                            <i class="fas fa-video"></i> ${getSalaDisplayName(sala)}
                        </a>
                    </div>
                `).join('')}
            </div>

            <!-- Programação de sessões (se habilitada) -->
            ${config.schedule_enabled ? `
            <div id="virtual-schedule">
                <div class="virtual-session-wrapper">
                    <!-- Sessões carregadas dinamicamente -->
                </div>
            </div>
            ` : ''}

        </main>

        <!-- Sidebars baseadas no virtual.js -->
        <aside id="virtual-sidebar">

            <!-- Chat lateral (se habilitado) -->
            ${config.chat_enabled ? `
            <div id="virtual-sidebar-chat">
                <div class="chat-main">
                    <div class="chat-messages">
                        <!-- Mensagens carregadas dinamicamente -->
                    </div>
                    <div class="chat-input">
                        <form class="chat-message-form">
                            <input type="text" class="chat-message-input" placeholder="Digite sua mensagem...">
                            <button type="submit"><i class="fas fa-paper-plane"></i></button>
                        </form>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Lista de usuários -->
            <div id="virtual-sidebar-users">
                <div class="users-list">
                    ${config.SALAS_UNIFIED ? `
                        <ul class="users-list-sala"></ul>
                    ` : roomConfig.salas_enabled.map(sala => `
                        <ul class="users-list-${sala} live-hidden-conf-${sala}"></ul>
                    `).join('')}
                    <ul class="users-list-offline live-hidden-offline"></ul>
                </div>
            </div>

            <!-- Ações administrativas -->
            <div id="virtual-sidebar-actions">
                ${features.presence_control ? `
                <div class="action-presence">
                    <button id="action-checkin">
                        <i class="fas fa-check-circle"></i> Check-in
                    </button>
                </div>
                ` : ''}

                ${features.evaluation_system ? `
                <div class="action-evaluation">
                    <button id="action-evaluate">
                        <i class="fas fa-star"></i> Avaliar
                    </button>
                </div>
                ` : ''}

                ${features.poll_system ? `
                <div class="action-poll">
                    <button id="action-poll">
                        <i class="fas fa-poll"></i> Enquete
                    </button>
                </div>
                ` : ''}
            </div>
        </aside>
    </div>

    <!-- Scripts baseados no virtual.js -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="/js/socket.io.js"></script>
    <script src="/js/virtual.js"></script>

    <!-- Configurações JavaScript baseadas no virtual.js -->
    <script>
        // Configurações globais baseadas no virtual.js
        var EV = '${id}';
        var EV_CATEGORY = '${category}';
        var VIRTUAL_DELAY = ${config.chat?.virtualDelay ?? 0}; // Otimizado para chat responsivo
        var SALAS_UNIFIED = ${config.SALAS_UNIFIED ? 'true' : 'false'};
        var FIXED_LIVE_URL = ${config.FIXED_LIVE_URL ? `'${config.FIXED_LIVE_URL}'` : 'false'};

        // Configurações otimizadas para o chat
        var CHAT_CONFIG = {
            scrollDelay: ${config.chat?.scrollDelay ?? 0},
            fastScrollToBottom: ${config.chat?.ui?.fastScrollToBottom ?? true},
            immediateButtonResponse: ${config.chat?.ui?.immediateButtonResponse ?? true},
            optimizedScrollBehavior: ${config.chat?.ui?.optimizedScrollBehavior ?? true}
        };

        // Recursos habilitados
        var FEATURES = ${JSON.stringify(features || {}, (key, value) => value === undefined ? null : value)};

        // Configuração das salas baseada no SALAS array
        var VIRTUAL_CONFS = {
            ${roomConfig.salas_enabled && roomConfig.salas_enabled.length > 0
      ? roomConfig.salas_enabled.map(sala => `'${sala}': true`).join(',\n            ')
      : "'default': true"}
        };
    </script>

    ${features.dropbox_integration ? '<script src="/js/dropbox-integration.js"></script>' : ''}
    ${features.session_schedule ? '<script src="/js/session-schedule.js"></script>' : ''}
    ${features.markdown_support ? '<script src="/js/markdown-support.js"></script>' : ''}
    ${features.notification_system ? '<script src="/js/notifications.js"></script>' : ''}

</body>
</html>`;
}

/**
 * Gera nome de exibição para tipos de sala baseado no virtual_adv.js
 */
function getSalaDisplayName(sala) {
  const displayNames = {
    'sala': 'Sala Principal',
    'turma': 'Salas por Turma',
    'grupo': 'Salas por Grupo',
    'projeto': 'Salas de Projeto',
    'atendimento': 'Atendimento Individual',
    'oracao': 'Salas de Oração',
    'rede': 'Salas por Rede',
    'professor': 'Sala dos Professores',
    'equipe': 'Sala da Equipe',
    'reuniao': 'Salas de Reunião',
    'breakout': 'Breakout Rooms'
  };
  return displayNames[sala] || sala;
}

/**
 * Gera arquivos API baseados no virtual.js
 */
async function generateVirtualJSApiFiles(roomDir, roomConfig) {
  const apiDir = path.join(roomDir, 'api');

  // Arquivos de API baseados no virtual.js
  const apiFiles = {
    'index.json': {
      event: roomConfig.id,
      title: roomConfig.title,
      category: roomConfig.category,
      live: roomConfig.config.live_enabled,
      chat: roomConfig.config.chat_enabled,
      jitsi: roomConfig.config.jitsi_enabled,
      features: roomConfig.features
    },
    'room.json': roomConfig,
    'participantes.json': [],
    'messages.json': [],
    'sessoes.json': {},
    'extra.json': {},
    'timestamp.txt': Math.floor(Date.now() / 1000).toString(),
    'logado_data.json': {},
    'page_info.json': {
      title: roomConfig.title,
      subtitle: roomConfig.subtitle,
      category: roomConfig.category
    },
    'video_positions.json': {}
  };

  for (const [filename, content] of Object.entries(apiFiles)) {
    const filePath = path.join(apiDir, filename);
    const fileContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    await fs.writeFile(filePath, fileContent, 'utf8');
  }
}

/**
 * Gera sistema de sessões baseado no virtual_adv.js
 */
async function generateSessionsSystem(roomDir, roomConfig) {
  const sessionsDir = path.join(roomDir, 'data/sessions');

  // Template de sessão baseado no virtual_adv.js
  const sessionTemplate = {
    item: 1,
    title: 'Sessão Inicial',
    subtitle: '',
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 3600000).toISOString(), // 1 hora
    starts_at_timestamp: Math.floor(Date.now() / 1000),
    ends_at_timestamp: Math.floor((Date.now() + 3600000) / 1000),
    live: roomConfig.config.live_enabled ? 1 : 0,
    live_url: roomConfig.config.FIXED_LIVE_URL || '',
    conf: 1,
    talk: 0,
    multiday: roomConfig.config.multiday_support ? 1 : 0
  };

  await fs.writeFile(
    path.join(sessionsDir, 'template.json'),
    JSON.stringify(sessionTemplate, null, 2),
    'utf8'
  );
}

/**
 * Gera integração Dropbox baseada no virtual.js
 */
async function generateDropboxIntegration(roomDir, roomConfig) {
  const dropboxDir = path.join(roomDir, 'data/dropbox');

  // Estrutura de Dropbox baseada no virtual.js
  const dropboxStructure = {
    files: [],
    folders: [],
    last_sync: new Date().toISOString()
  };

  await fs.writeFile(
    path.join(dropboxDir, 'structure.json'),
    JSON.stringify(dropboxStructure, null, 2),
    'utf8'
  );

  // Template HTML para listagem de arquivos (usado pelo virtual.js)
  const dropboxHtml = `<div class="dropbox_files">
    <!-- Arquivos serão carregados dinamicamente -->
  </div>`;

  await fs.writeFile(
    path.join(roomDir, 'dropbox.html'),
    dropboxHtml,
    'utf8'
  );
}

/**
 * Gera CSS personalizado baseado na categoria
 */
async function generateCategoryCSS(roomDir, roomConfig) {
  const { category, config } = roomConfig;

  // CSS específico por categoria baseado no virtual.css
  const categoryCSS = {
    ead: `
      .virtual-ead .chat-main { background: #f8f9fa; }
      .virtual-ead .chat-message { border-left: 3px solid #007bff; }
      .virtual-ead .users-list { background: #e9ecef; }
    `,
    educational: `
      .virtual-educational .chat-main { background: #fff3cd; }
      .virtual-educational .chat-message { border-left: 3px solid #ffc107; }
      .virtual-educational .users-list { background: #ffeaa7; }
    `,
    forum: `
      .virtual-forum .chat-messages { max-height: none; }
      .virtual-forum .chat-message { margin-bottom: 15px; padding: 15px; }
      .virtual-forum .chat-ts { display: block; margin-top: 10px; }
    `,
    chat: `
      .virtual-chat .chat-main { border-radius: 10px; }
      .virtual-chat .chat-message { background: rgba(255,255,255,0.9); }
      .virtual-chat .users-list { border-radius: 10px; }
    `,
    continuous: `
      .virtual-continuous .virtual-header { position: sticky; top: 0; z-index: 100; }
      .virtual-continuous .chat-main { height: calc(100vh - 200px); }
    `
  };

  let css = categoryCSS[category] || '';

  // Adicionar CSS personalizado se fornecido
  if (config.custom_css) {
    css += `\n\n/* CSS Personalizado */\n${config.custom_css}`;
  }

  if (css) {
    await fs.writeFile(
      path.join(roomDir, 'custom.css'),
      css,
      'utf8'
    );
  }
}

/**
 * API para listar salas virtuais existentes
 */
router.get('/api/rooms', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const { isAuthenticated, user } = req.biblos360Auth || {};

    // Verificar autenticação
    if (!isAuthenticated || !user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    // Verificar permissões (nível 1+ para listar)
    const userLevel = user.data?.level || 0;
    if (userLevel < 1) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado: necessário nível de voluntário ou superior'
      });
    }

    const virtualDir = path.join(__dirname, '../public/vr');

    try {
      const items = await fs.readdir(virtualDir);
      const rooms = [];

      for (const item of items) {
        const itemPath = path.join(virtualDir, item);
        const stats = await fs.stat(itemPath);

        if (stats.isDirectory() && item !== 'admin') {
          try {
            // Tentar carregar room.json
            const roomConfigPath = path.join(itemPath, 'room.json');
            let roomConfig = null;

            try {
              const configData = await fs.readFile(roomConfigPath, 'utf8');
              roomConfig = JSON.parse(configData);
            } catch (configError) {
              // Se não tem room.json, criar entrada básica
              roomConfig = {
                id: item,
                title: `Sala ${item}`,
                category: 'unknown',
                created: stats.birthtime.toISOString(),
                config: {}
              };
            }

            // Verificar se usuário tem acesso a esta sala
            const hasAccess = userLevel >= 2 ||
              roomConfig.permissions?.public_access !== false ||
              roomConfig.created_by?.id === user.data.id;

            if (hasAccess) {
              rooms.push({
                id: roomConfig.id,
                title: roomConfig.title,
                category: roomConfig.category,
                url: `/vr/${item}`,
                admin_url: userLevel >= 2 ? `/vr/${item}/admin/admin-main.html` : null,
                created: roomConfig.created,
                created_by: roomConfig.created_by || null,
                is_online: roomConfig.config?.live_enabled || false,
                salas_enabled: roomConfig.salas_enabled || [],
                permissions: roomConfig.permissions || {}
              });
            }

          } catch (error) {
            console.warn(`âš ï¸ Erro ao processar sala ${item}:`, error.message);
          }
        }
      }

      // Ordenar por data de criação (mais recente primeiro)
      rooms.sort((a, b) => new Date(b.created) - new Date(a.created));

      res.json({
        success: true,
        rooms: rooms,
        total: rooms.length,
        user_level: userLevel
      });

    } catch (error) {
      console.error('âŒ Erro ao listar salas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao acessar diretório de salas',
        rooms: []
      });
    }

  } catch (error) {
    console.error('âŒ Erro na API de listar salas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

/**
 * Função auxiliar para gerar template HTML da sala
 * Baseado no sistema virtual.js da pasta novos/
 */
function generateRoomHTML(roomId, title, category, config) {
  const cssClasses = ['virtual'];

  // Adicionar classes CSS baseadas na categoria (detecção automática do virtual.js)
  switch (category) {
    case 'ead':
      cssClasses.push('virtual-ead');
      break;
    case 'educational':
      cssClasses.push('virtual-educational');
      break;
    case 'forum':
      cssClasses.push('virtual-forum');
      break;
    case 'chat':
      cssClasses.push('virtual-chat');
      break;
    case 'continuous':
      cssClasses.push('virtual-continuous');
      break;
  }

  return `<!doctype html>
<html lang="pt" class="no-js ${cssClasses.join(' ')}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

    <title>${title} - Biblos360</title>
    <meta name="description" content="Sala virtual ${title} - Sistema Biblos360">

    <!-- CSS -->
    <link rel="stylesheet" type="text/css" href="/css/bundle.css">
    <link rel="stylesheet" type="text/css" href="/css/virtual.css">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/img/favicon.ico">

    <!-- Meta tags para redes sociais -->
    <meta property="og:title" content="${title} - Biblos360">
    <meta property="og:description" content="Sala virtual ${title}">
    <meta property="og:type" content="website">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="${cssClasses.join(' ')}">
    <!-- Input hidden para captura do ID da sala pelo virtual.js -->
    <input type="hidden" id="ev" value="${roomId}" />

    <!-- Container principal -->
    <div id="main-container" class="container">
        <header>
            <h1>${title}</h1>
            <div class="room-info">
                <span class="room-id">Sala: ${roomId}</span>
                <span class="room-category">${category}</span>
            </div>
        </header>

        <main>
            <!-- Área de transmissão ao vivo -->
            <section id="live-area" class="live-section">
                <div id="live-player" class="video-container">
                    <div class="video-placeholder">
                        <i class="fas fa-play-circle"></i>
                        <p>Transmissão será iniciada em breve</p>
                    </div>
                </div>
            </section>

            <!-- Área de chat -->
            <section id="chat-area" class="chat-section">
                <div id="chat-container">
                    <div id="chat-messages" class="chat-messages"></div>
                    <div id="chat-input-area" class="chat-input">
                        <input type="text" id="chat-input" placeholder="Digite sua mensagem...">
                        <button id="chat-send">Enviar</button>
                    </div>
                </div>
            </section>

            <!-- Área de participantes -->
            <section id="participants-area" class="participants-section">
                <h3>Participantes Online</h3>
                <div id="participants-list" class="participants-list"></div>
            </section>

            <!-- Área de conferências (detectada automaticamente pelo virtual.js) -->
            <section id="conferences-area" class="conferences-section">
                <div class="confs" style="display: none;">
                    <!-- As conferências serão geradas dinamicamente pelo virtual.js -->
                </div>
            </section>

            <!-- Área administrativa (visível apenas para administradores) -->
            <section id="admin-area" class="admin-section">
                <div id="actions_admin" style="display: none;">
                    <div class="more icon">
                        <a href="/vr/${roomId}/admin/admin-main.html">
                            <i class="fas fa-cog fa-fw"></i>
                            <span>Administrar</span>
                        </a>
                    </div>
                    <div class="more icon">
                        <a href="/vr/${roomId}/monitor/monitor-main.html">
                            <i class="fas fa-desktop fa-fw"></i>
                            <span>Monitor</span>
                        </a>
                    </div>
                </div>
            </section>
        </main>

        <footer>
            <div class="room-footer">
                <span>Criado em: ${new Date().toLocaleDateString('pt-BR')}</span>
                <span>Sistema Biblos360</span>
            </div>
        </footer>
    </div>

    <!-- Scripts essenciais -->
    <script src="/js/bundle.js"></script>
    <script src="/js/virtual.js"></script>
    <script src="/js/virtual_room.js"></script>

    <!-- Socket.IO -->
    <script src="/socket.io/socket.io.js"></script>

    <!-- Inicialização -->
    <script>
        // Configurações específicas da sala injetadas pelo servidor
        window.ROOM_CONFIG = {
            id: '${roomId}',
            title: '${title}',
            category: '${category}',
            config: ${JSON.stringify(config, (key, value) => value === undefined ? null : value)},
            timestamp: ${Date.now()}
        };

        // O virtual.js detectará automaticamente as configurações via classes CSS e input#ev
        console.log('ðŸš€ Sala ${roomId} (${title}) inicializada - Categoria: ${category}');
    </script>
</body>
</html>`;
}

/**
 * Função auxiliar para gerar template do dropbox
 */
function generateDropboxHTML() {
  return `<table width="100%" border="0" cellspacing="0" cellpadding="0" class="dropbox_table">
    <tr>
        <td colspan="3" class="dropbox_empty">
            <div style="text-align: center; padding: 20px; color: #666;">
                <i class="fas fa-folder-open" style="font-size: 48px; margin-bottom: 10px;"></i>
                <p>Nenhum arquivo disponível no momento</p>
                <small>Os arquivos compartilhados aparecerão aqui</small>
            </div>
        </td>
    </tr>
</table>`;
}

// ========================================
// SEÇÁO 9: ROTAS DE FALLBACK E ERRO
// ========================================

// Dropbox standalone
router.get('/dropbox.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dropbox.html'));
});

// ========================================
// SEÇÁO 9: ROTAS DE ADMINISTRAÇÁO
// ========================================

// Rota para servir admin-main.html com dados dinâmicos
router.get('/vr/:id/admin/admin-main.html', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const roomId = req.params.id;

    // Verificar se sala existe
    if (!roomId || !/^[a-zA-Z0-9]+$/.test(roomId)) {
      throw commonErrors.badRequest('ID da sala inválido');
    }

    const { isAuthenticated, user, inscricao } = req.biblos360Auth || {};
    console.log('ðŸ” Acesso ao admin da sala:', {
      roomId,
      isAuthenticated,
      hasUser: !!user,
      userId: user?.data?.id,
      userName: user?.data?.nome || user?.data?.apelido,
      isAdmin: user?.isAdmin || false
    });

    // Verificar permissões de administrador ANTES de qualquer processamento
    let userData = null;
    let userLevel = 0;
    let shouldSetAdminCookies = false;

    // Se há usuário autenticado, verificar seu nível
    if (isAuthenticated && user?.data) {
      userData = user.data;

      // Buscar dados do usuário em participantes.json para verificar nível
      try {
        const participantesPath = path.join(__dirname, '../../../api/participantes.json');
        const participantesData = JSON.parse(await fs.readFile(participantesPath, 'utf8'));
        const userRecord = participantesData.find(u => u.id == userData.id);

        if (userRecord) {
          userLevel = userRecord.level || userRecord.extra?.level || userData.level || 0;
          console.log(`ï¿½ Nível do usuário ${userData.apelido}: ${userLevel}`);
        }
      } catch (error) {
        console.error('âŒ Erro ao verificar nível do usuário:', error);
      }

      // Se não encontrou o nível ainda, usar o nível do cookie como fallback
      if (userLevel === 0 && userData.level) {
        userLevel = userData.level;
        console.log(`ðŸ“Š Usando nível do cookie para ${userData.apelido}: ${userLevel}`);
      }

      // Verificar se usuário tem permissão administrativa (nível 1, 2 ou 3)
      if (userLevel === 0) {
        console.log(`ðŸš« Acesso negado para usuário ${userData.apelido} (nível ${userLevel})`);

        // Retornar página de erro de acesso negado
        const errorHtml = `
          <!DOCTYPE html>
          <html lang="pt">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Acesso Negado - Biblos360</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background: #f5f5f5;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
              }
              .error-container {
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                padding: 40px;
                text-align: center;
                max-width: 500px;
              }
              .error-icon {
                font-size: 72px;
                color: #e74c3c;
                margin-bottom: 20px;
              }
              h1 {
                color: #2c3e50;
                margin-bottom: 10px;
              }
              p {
                color: #7f8c8d;
                margin-bottom: 30px;
                line-height: 1.6;
              }
              .user-info {
                background: #ecf0f1;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
              }
              .back-button {
                background: #3498db;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                transition: background 0.3s;
              }
              .back-button:hover {
                background: #2980b9;
              }
            </style>
          </head>
          <body>
            <div class="error-container">
              <div class="error-icon">ðŸš«</div>
              <h1>Acesso Negado</h1>
              <p>Você não possui permissões administrativas para acessar esta área.</p>

              <div class="user-info">
                <strong>Usuário:</strong> ${userData.apelido || userData.nome}<br>
                <strong>Nível de Permissão:</strong> ${userLevel} (Participante)<br>
                <strong>Necessário:</strong> Nível 1, 2 ou 3 (Moderador/Admin)
              </div>

              <p>Entre em contato com a administração se você deveria ter acesso administrativo.</p>

              <a href="/vr/${roomId}" class="back-button">
                Voltar para a Sala Virtual
              </a>
            </div>
          </body>
          </html>
        `;

        res.status(403).send(errorHtml);
        return;
      }

      console.log(`âœ… Acesso administrativo autorizado para ${userData.apelido} (nível ${userLevel})`);

    } else {
      // Se não há cookies de admin, mas está acessando a rota admin, configurar automaticamente
      console.log('ðŸ”§ Acesso Á  área admin detectado - configurando cookies de admin automaticamente');
      shouldSetAdminCookies = true;

      // Dados genéricos do administrador (configuráveis via env)
      userData = {
        id: process.env.ADMIN_USER_ID || '1',
        nome: process.env.ADMIN_USER_NAME || 'Administrador',
        apelido: process.env.ADMIN_USER_NICKNAME || 'Admin',
        email: process.env.ADMIN_USER_EMAIL || 'admin@exemplo.com',
        sexo: '1',
        uf: process.env.ADMIN_USER_STATE || 'SP',
        parceiro: '0',
        equipe: process.env.ADMIN_USER_TEAM || 'Sistema',
        turma: null,
        grupo: null,
        rede: null
      };
      userLevel = 3; // Admin automático
    }

    // Configurar cookies de admin se necessário
    if (shouldSetAdminCookies) {
      console.log('ðŸª Configurando cookies de admin para o usuário Admin');

      // Gerar cookies admin dinamicamente sem dados pessoais
      const sessionId = require('crypto').randomBytes(16).toString('hex');
      const currentTimestamp = Math.floor(Date.now() / 1000).toString();

      // Cookie genérico sem dados sensíveis
      const adminCookieData = `admin_session_${sessionId}_${currentTimestamp}`;

      res.cookie('biblos360_admin_usuario', adminCookieData, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });

      res.cookie('biblos360_admin_inscrito', adminCookieData, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });
    }

    // Configurar cookie de inscrição se necessário
    if (!inscricao?.isAdmin) {
      const inscritoCookieValue = `a:1:{s:2:"ev";s:${roomId.length}:"${roomId}";}`;
      res.cookie('biblos360_admin_inscrito', inscritoCookieValue, {
        httpOnly: false,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
      });
    }

    console.log(`âœ… Carregando admin da sala ${roomId} para usuário ${userData.nome || userData.apelido} (nível ${userLevel})`);

    // Carregar template admin
    const templatePath = path.join(__dirname, `../public/vr/admin/admin-main.html`);

    try {
      let html = await fs.readFile(templatePath, 'utf8');

      // Substituições dinâmicas básicas
      html = html.replace(/data-room-id="[^"]*"/g, `data-room-id="${roomId}"`);
      html = html.replace(/value="pub"/g, `value="${roomId}"`);
      html = html.replace(/#ev[\s]*=[\s]*pub/g, `#ev = ${roomId}`);

      // Substituições dos templates de usuário
      html = html.replace(/\{\{USER_NICK\}\}/g, userData.apelido || userData.nome || 'Admin');
      html = html.replace(/\{\{USER_ID\}\}/g, userData.id || process.env.ADMIN_USER_ID || '1');
      html = html.replace(/\{\{USER_UF\}\}/g, userData.uf || 'SP');
      html = html.replace(/\{\{USER_SEXO\}\}/g, userData.sexo || '2');
      html = html.replace(/\{\{USER_PARCEIRO\}\}/g, userData.parceiro || '0');
      html = html.replace(/\{\{USER_EQUIPE\}\}/g, userData.equipe || 'Biblos360');
      html = html.replace(/\{\{USER_TURMA\}\}/g, userData.turma || '');
      html = html.replace(/\{\{USER_GRUPO\}\}/g, userData.grupo || '');
      html = html.replace(/\{\{USER_REDE\}\}/g, userData.rede || '');
      html = html.replace(/\{\{USER_LEVEL\}\}/g, userLevel.toString());

      // CONTROLE MODO MONITOR: Comportamento por nível de usuário
      const isMonitorMode = req.query.mode === 'monitor';
      
      if (isMonitorMode && userLevel >= 1 && userLevel <= 2) {
        // NÍVEIS 1 e 2: Modo monitor com sidebar oculta (apenas monitoramento)
        console.log(`👁️ Modo MONITOR ativado para usuário nível ${userLevel} - ocultando sidebar de ações`);
        
        // Método 1: Ocultar por CSS (mais confiável e específico)
        html = html.replace(
          '</head>',
          `<style type="text/css">
            /* Ocultar APENAS a sidebar de ações administrativas para modo monitor */
            body.admin-monitor-mode #virtual-sidebar-actions {
              display: none !important;
              visibility: hidden !important;
              width: 0 !important;
              overflow: hidden !important;
            }
            
            /* Ocultar também o botão toggle da sidebar */
            body.admin-monitor-mode #virtual-sidebar-actions-toggle {
              display: none !important;
              visibility: hidden !important;
            }
            
            /* Ajustar layout para compensar a falta da sidebar */
            body.admin-monitor-mode .virtual.bg {
              margin-right: 0 !important;
              padding-right: 20px !important;
            }
            
            /* MANTER VISÍVEL: Chat e outras funcionalidades de monitoramento */
            body.admin-monitor-mode #chat-message-form,
            body.admin-monitor-mode .chat-message-form,
            body.admin-monitor-mode #virtual-chat,
            body.admin-monitor-mode .virtual-chat,
            body.admin-monitor-mode .chat-typing-list {
              display: block !important;
              visibility: visible !important;
            }
            
            /* Garantir que o chat ocupe o espaço disponível */
            body.admin-monitor-mode #virtual-chat {
              width: 100% !important;
              max-width: none !important;
            }
          </style>
          </head>`
        );
        
        // Método 2: Adicionar classe CSS no body para identificar modo monitor
        html = html.replace(
          /(<body[^>]*class="[^"]*)(")/,
          '$1 admin-monitor-mode$2'
        );
        
        // Se não tem classe no body, adicionar
        if (!html.includes('class=')) {
          html = html.replace(
            '<body',
            '<body class="admin-monitor-mode"'
          );
        }
        
        console.log(`✅ Sidebar de ações oculta para usuário ${userData.apelido} em modo monitor`);
      } else if (isMonitorMode && userLevel === 3) {
        // NÍVEL 3 (ADMIN): Modo monitor também oculta sidebar (igual aos outros níveis)
        console.log(`👁️ Modo MONITOR ativado para ADMIN nível ${userLevel} - ocultando sidebar`);
        
        // Usar o mesmo CSS de ocultação que níveis 1 e 2
        html = html.replace(
          '</head>',
          `<style type="text/css">
            /* Ocultar APENAS a sidebar de ações administrativas para modo monitor */
            body.admin-monitor-mode #virtual-sidebar-actions {
              display: none !important;
              visibility: hidden !important;
              width: 0 !important;
              overflow: hidden !important;
            }
            
            /* Ocultar também o botão toggle da sidebar */
            body.admin-monitor-mode #virtual-sidebar-actions-toggle {
              display: none !important;
              visibility: hidden !important;
            }
            
            /* Ajustar layout para compensar a falta da sidebar */
            body.admin-monitor-mode .virtual.bg {
              margin-right: 0 !important;
              padding-right: 20px !important;
            }
            
            /* MANTER VISÍVEL: Chat e outras funcionalidades de monitoramento */
            body.admin-monitor-mode #chat-message-form,
            body.admin-monitor-mode .chat-message-form,
            body.admin-monitor-mode #virtual-chat,
            body.admin-monitor-mode .virtual-chat,
            body.admin-monitor-mode .chat-typing-list {
              display: block !important;
              visibility: visible !important;
            }
            
            /* Garantir que o chat ocupe o espaço disponível */
            body.admin-monitor-mode #virtual-chat {
              width: 100% !important;
              max-width: none !important;
            }
          </style>
          </head>`
        );
        
        // Adicionar classe CSS no body para identificar modo monitor
        html = html.replace(
          /(<body[^>]*class="[^"]*)(")/,
          '$1 admin-monitor-mode$2'
        );
        
        // Se não tem classe no body, adicionar
        if (!html.includes('class=')) {
          html = html.replace(
            '<body',
            '<body class="admin-monitor-mode"'
          );
        }
        
        console.log(`✅ Sidebar de ações oculta para ADMIN ${userData.apelido} em modo monitor`);
      } else {
        console.log(`✅ Sidebar de ações visível para usuário nível ${userLevel}${isMonitorMode ? ' (admin completo)' : ''}`);
      }

      // Injetar mensagem atual do quadro de avisos do room.json
      let currentRoomInfo = '';
      try {
        const roomData = await services.loadRoomData(roomId, 'room');
        currentRoomInfo = roomData?.config?.info_message || '';
      } catch (error) {
        console.warn(`âš ï¸ Erro ao carregar mensagem do quadro de avisos para sala ${roomId}:`, error.message);
      }
      html = html.replace(/data-info="[^"]*"/g, `data-info="${currentRoomInfo.replace(/"/g, '&quot;')}"`);

      console.log(`ðŸ“¢ Mensagem do quadro de avisos injetada para sala ${roomId}: "${currentRoomInfo}"`);
      // Injetar script de detecção de logout (voluntário e forçado)
      const logoutScript = `<script>
(function() {
  console.log('🚀 ADMIN SCRIPT: Sistema de logout iniciado');
  let isLogoutTriggered = false;

  function notifyVoluntaryLogout() {
    if (isLogoutTriggered) return;
    isLogoutTriggered = true;
    console.log('🚪 Logout voluntário detectado');

    if (window.socket && window.socket.connected) {
      window.socket.emit('voluntary-logout');
    }

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/voluntary-logout', '{}');
    }
  }

  // REDIRECIONAMENTO AUTOMÁTICO GARANTIDO EM 20 MINUTOS
  setTimeout(function() {
    console.log("🔄 ADMIN TIMEOUT 20min: Redirecionando automaticamente");
    const path = window.location.pathname;
    const roomId = path.includes("/vr/") ? path.split("/vr/")[1].split("/")[0] : "pub";
    window.location.replace("/vr/logout?room=" + roomId + "&reason=auto_20min&t=" + Date.now());
  }, 1205000); // 20 minutos + 5 segundos de margem

  function setupForcedLogoutDetection() {
    if (window.socket) {
      window.socket.on('forced-logout', function(data) {
        console.log('🚨 Admin logout forçado:', data);
        isLogoutTriggered = true;

        const path = window.location.pathname;
        const roomId = path.includes('/vr/') ? path.split('/vr/')[1].split('/')[0] : 'pub';
        window.location.replace('/vr/logout?room=' + roomId + '&reason=' + (data.reason || 'timeout'));
      });

      window.socket.on('disconnect', function(reason) {
        if (isLogoutTriggered) return;
        console.log('⚠️ Admin desconexão:', reason);

        if (reason === 'io server disconnect' || reason === 'transport close') {
          setTimeout(function() {
            if (!window.socket.connected) {
              const path = window.location.pathname;
              const roomId = path.includes('/vr/') ? path.split('/vr/')[1].split('/')[0] : 'pub';
              window.location.replace('/vr/logout?room=' + roomId + '&reason=disconnect');
            }
          }, 3000); // 3 segundos para problemas de conectividade
        }
      });
    } else {
      setTimeout(setupForcedLogoutDetection, 1000);
    }
  }

  window.addEventListener('beforeunload', notifyVoluntaryLogout);
  window.addEventListener('pagehide', notifyVoluntaryLogout);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupForcedLogoutDetection);
  } else {
    setupForcedLogoutDetection();
  }
})();
</script>`;
      html = html.replace('</body>', logoutScript + '</body>');


      // Injetar script de extensão do painel administrativo antes do </body>
      // const adminExtensionScript = '<script src="/js/admin_extension.js" type="text/javascript" defer></script>';
      // html = html.replace('</body>', adminExtensionScript + '\n</body>');

      // Injetar variáveis JavaScript necessárias no <head>
      const jsVariables = `
    <script type="text/javascript">
        // Variáveis globais necessárias para o virtual_admin.js
        var EV = '${roomId}';
        var EV_CATEGORY = 'ead';
        var NICK = '${userData.apelido || userData.nome || 'Admin'}';
        var EXTRA = {
            extid: '${userData.id || process.env.ADMIN_USER_ID || '1'}',
            level: '${userLevel}',
            uf: '${userData.uf || 'SP'}',
            sexo: '${userData.sexo || '2'}',
            parceiro: '${userData.parceiro || '0'}',
            equipe: '${userData.equipe || 'Biblos360'}',
            turma: '${userData.turma || ''}',
            grupo: '${userData.grupo || ''}',
            rede: '${userData.rede || ''}',
            conf: null,
            breakout: 0
        };
        var SOCKET = null; // Será inicializado pelo virtual.js

        // Variáveis essenciais para o chat virtual.js
        var USERID = '${userData.id || process.env.ADMIN_USER_ID || '1'}';
        var SESSION_ITEM = 0;
        var SESSION_FIXED = false;

        var CONFERENCE = null;
        var PROJECT = null;
        var FORUM = null;
        var POPUP = null;

        console.log('ðŸ”§ Variáveis administrativas carregadas:', { EV, NICK, EXTRA });
    </script>`;

      html = html.replace('</head>', jsVariables + '\n</head>');

      console.log('ðŸ”§ Script de extensão administrativo injetado');
      console.log(`ðŸ”§ Variáveis JavaScript injetadas: EV="${roomId}", NICK="${userData.apelido || userData.nome || 'Admin'}"`);

      // Headers para funcionamento correto
      res.set({
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      res.send(html);

    } catch (templateError) {
      console.error('âŒ Erro ao carregar template admin:', templateError);
      throw commonErrors.notFound(`Template admin da sala ${roomId} não encontrado`);
    }

  } catch (error) {
    console.error('âŒ Erro na rota admin:', error);
    if (error.statusCode) {
      throw error;
    }
    throw commonErrors.internalError('Erro interno do servidor');
  }
}));

// API para dados administrativos da sala - participantes
router.get('/vr/:id/admin/participants', optionalAuth, asyncErrorHandler(controllers.getAdminParticipants));

// API para funcionalidades administrativas
router.get('/vr/:id/admin/functions', optionalAuth, asyncErrorHandler(controllers.getAdminFunctions));

// API para executar ações administrativas
router.post('/vr/:id/admin/action', optionalAuth, asyncErrorHandler(controllers.executeAdminAction));

// Rota para servir monitor-main.html com dados dinâmicos
router.get('/vr/:id/monitor/monitor-main.html', optionalAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const roomId = req.params.id;

    if (!roomId || !/^[a-zA-Z0-9]+$/.test(roomId)) {
      throw commonErrors.badRequest('ID da sala inválido');
    }

    const { isAuthenticated, user } = req.biblos360Auth || {};

    let userData = null;
    if (isAuthenticated && user) {
      userData = user.data;
    } else {
      // Retornar erro se não há usuário autenticado
      console.log('âŒ Usuário não autenticado - redirecionando para login');
      // return res.redirect('/admin/tim/login'); // FIXME: Removido para permitir acesso público

      // ALTERADO: Permitir acesso público como convidado
      console.log("👤 Usuário não autenticado - permitindo acesso como convidado");
      userData = {
        id: 0,
        nome: "Convidado",
        apelido: "Convidado",
        level: 0,
        isGuest: true
      };
    }

    // Configurar cookies
    const inscritoCookieValue = `a:1:{s:2:"ev";s:${roomId.length}:"${roomId}";}`;
    res.cookie('biblos360_site_inscrito', inscritoCookieValue, {
      httpOnly: false,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    });

    console.log(`âœ… Carregando monitor da sala ${roomId} para usuário ${userData.nome || userData.apelido}`);

    // Carregar template monitor
    const templatePath = path.join(__dirname, `../public/vr/${roomId}/monitor/monitor-main.html`);

    try {
      let html = await fs.readFile(templatePath, 'utf8');

      // Substituições dinâmicas
      html = html.replace(/data-room-id="[^"]*"/g, `data-room-id="${roomId}"`);
      html = html.replace(/value="pub"/g, `value="${roomId}"`);

      res.set({
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      res.send(html);

    } catch (templateError) {
      console.error('âŒ Erro ao carregar template monitor:', templateError);
      throw commonErrors.notFound(`Template monitor da sala ${roomId} não encontrado`);
    }

  } catch (error) {
    console.error('âŒ Erro na rota monitor:', error);
    if (error.statusCode) {
      throw error;
    }
    throw commonErrors.internalError('Erro interno do servidor');
  }
}));

// ========================================
// SEÇÁO 9.5: TIMOTINHO - SISTEMA DE GESTÁO DE USUÁRIOS
// ========================================

// Rota de cadastro administrativo de usuário monitor
router.post('/tim/register', asyncErrorHandler(controllers.timRegisterUser));

// Rota de teste para verificar Supabase
router.get('/tim/test-supabase', asyncErrorHandler(async (req, res, next) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    console.log('ðŸ”— Testando conexão com Supabase...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'não encontrada');

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Variáveis de ambiente não configuradas',
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: {
        schema: 'api'
      }
    });

    // Teste simples de conexão
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.error('âŒ Erro no teste:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
        details: error
      });
    }

    console.log('âœ… Conexão com Supabase funcionando');

    res.json({
      success: true,
      message: 'Conexão com Supabase funcionando',
      supabaseUrl,
      testResult: data
    });

  } catch (error) {
    console.error('âŒ Erro geral:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Rota principal do Timotinho - visualização de dados do usuário
router.get('/timotinho/user/:id', optionalAuth, asyncErrorHandler(controllers.getTimotinhoUser));

// ========================================
// SEÇÁO 11.5: ROTAS DE ERRO ESPECÍFICAS
// ========================================

// Rotas de erro específicas do Biblos360 (compatibilidade com legado)
router.get('/error/confirmar', (req, res) => {
  const { room } = req.query;
  errors.renderError(req, res, errors.ERROR_TYPES.CONFIRMAR, {
    statusCode: 403,
    roomId: room || 'pub'
  });
});

router.get('/error/desconectar', (req, res) => {
  const { room } = req.query;
  errors.renderError(req, res, errors.ERROR_TYPES.DESCONECTAR, {
    statusCode: 409,
    roomId: room || 'pub'
  });
});

router.get('/error/expirar', (req, res) => {
  const { room } = req.query;
  errors.renderError(req, res, errors.ERROR_TYPES.EXPIRAR, {
    statusCode: 408,
    roomId: room || 'pub'
  });
});

router.get('/error/sincronizar', (req, res) => {
  const { room } = req.query;
  errors.renderError(req, res, errors.ERROR_TYPES.SINCRONIZAR, {
    statusCode: 409,
    roomId: room || 'pub'
  });
});

router.get('/error/validar', (req, res) => {
  const { message } = req.query;
  errors.renderError(req, res, errors.ERROR_TYPES.VALIDAR, {
    statusCode: 422,
    message: message || 'Erro de validação'
  });
});

// Página 404 customizada (DEVE SER A ÚLTIMA ROTA)
router.use('*', notFoundHandler);

// ========================================
// ROTAS DE STATUS DA SALA
// ========================================

/**
 * Obter status atual da sala (online/offline)
 */
router.get('/api/room/:roomId/status', asyncErrorHandler(async (req, res, next) => {
  try {
    const { roomId } = req.params;

    // Validar roomId
    if (!roomId) {
      return res.status(400).json({
        success: false,
        error: 'ID da sala é obrigatório'
      });
    }

    // Ler dados da sala
    const roomPath = path.join(__dirname, '../../../api/room.json');
    let roomData = {};

    try {
      const roomFileContent = await fs.readFile(roomPath, 'utf8');
      roomData = JSON.parse(roomFileContent);
    } catch (error) {
      console.warn(`âš ï¸ Erro ao ler room.json:`, error.message);
      // Continuar com dados padrão
    }

    const isOnline = roomData.config?.live_enabled || false;
    const lastOnline = roomData.config?.last_online || null;
    const lastOffline = roomData.config?.last_offline || null;
    const lastDuration = roomData.config?.last_session_duration || null;

    res.json({
      success: true,
      data: {
        roomId,
        isOnline,
        lastOnline,
        lastOffline,
        lastDuration,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('âŒ Erro ao obter status da sala:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

/**
 * Ativar transmissão da sala (apenas para admins autenticados via API)
 */
router.post('/api/room/:roomId/online', requireAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { streamUrl } = req.body;

    // Validar se é admin (level 3 ou maior)
    if (!req.session?.user?.level || req.session.user.level < 3) {
      return res.status(403).json({
        success: false,
        error: 'Apenas administradores podem ativar a transmissão'
      });
    }

    // Ler e atualizar dados da sala
    const roomPath = path.join(__dirname, '../../../api/room.json');
    let roomData = {};

    try {
      const roomFileContent = await fs.readFile(roomPath, 'utf8');
      roomData = JSON.parse(roomFileContent);
    } catch (error) {
      // Criar dados padrão se arquivo não existir
      roomData = {
        id: roomId,
        config: {}
      };
    }

    // Verificar se já está online
    if (roomData.config?.live_enabled) {
      return res.status(400).json({
        success: false,
        error: 'A transmissão já está ativa'
      });
    }

    // Atualizar configurações
    roomData.config = roomData.config || {};
    roomData.config.live_enabled = true;
    roomData.config.last_online = new Date().toISOString();

    if (streamUrl) {
      roomData.config.stream_url = streamUrl;
    }

    // Salvar dados atualizados
    await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));

    // Log da ação
    const adminName = req.session.user.nome || req.session.user.apelido || 'Admin';
    console.log(`ðŸ”´ Transmissão ATIVADA via API na sala ${roomId} por ${adminName} (${req.session.user.id})`);

    res.json({
      success: true,
      message: 'Transmissão ativada com sucesso',
      data: {
        roomId,
        isOnline: true,
        activatedBy: adminName,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('âŒ Erro ao ativar transmissão via API:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

/**
 * Desativar transmissão da sala (apenas para admins autenticados via API)
 */
router.post('/api/room/:roomId/offline', requireAuth, asyncErrorHandler(async (req, res, next) => {
  try {
    const { roomId } = req.params;

    // Validar se é admin (level 3 ou maior)
    if (!req.session?.user?.level || req.session.user.level < 3) {
      return res.status(403).json({
        success: false,
        error: 'Apenas administradores podem desativar a transmissão'
      });
    }

    // Ler e atualizar dados da sala
    const roomPath = path.join(__dirname, '../../../api/room.json');
    let roomData = {};
    let sessionDuration = null;

    try {
      const roomFileContent = await fs.readFile(roomPath, 'utf8');
      roomData = JSON.parse(roomFileContent);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Dados da sala não encontrados'
      });
    }

    // Verificar se já está offline
    if (!roomData.config?.live_enabled) {
      return res.status(400).json({
        success: false,
        error: 'A transmissão já está inativa'
      });
    }

    // Calcular duração da sessão
    if (roomData.config?.last_online) {
      const startTime = new Date(roomData.config.last_online);
      const endTime = new Date();
      sessionDuration = endTime - startTime;
    }

    // Atualizar configurações
    roomData.config.live_enabled = false;
    roomData.config.last_offline = new Date().toISOString();

    if (sessionDuration) {
      roomData.config.last_session_duration = sessionDuration;
    }

    // Salvar dados atualizados
    await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));

    // Log da ação
    const adminName = req.session.user.nome || req.session.user.apelido || 'Admin';
    const durationText = sessionDuration ? ` (duração: ${Math.round(sessionDuration / 1000 / 60)} min)` : '';
    console.log(`âš« Transmissão DESATIVADA via API na sala ${roomId} por ${adminName} (${req.session.user.id})${durationText}`);

    res.json({
      success: true,
      message: 'Transmissão desativada com sucesso',
      data: {
        roomId,
        isOnline: false,
        deactivatedBy: adminName,
        sessionDuration,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('âŒ Erro ao desativar transmissão via API:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// ========================================
// ROTAS DE STREAMING E LIVE
// ========================================

/**
 * Definir URL de streaming para uma sala
 */
router.post('/api/room/:roomId/stream-url', requireAuth, asyncErrorHandler(async (req, res, next) => {
  const { roomId } = req.params;
  const { streamUrl } = req.body;

  // Verificar permissões (level 1+ ou admin)
  if (!req.session.user || (req.session.user.level < 1 && !req.session.user.isAdmin)) {
    return res.status(403).json({
      success: false,
      error: 'Apenas administradores podem definir URL de streaming'
    });
  }

  try {
    const roomPath = path.join(__dirname, '../../../api/room.json');
    const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));

    // Validar e sanitizar URL
    const cleanUrl = streamUrl ? String(streamUrl).trim() : '';

    // Atualizar configurações
    roomData.config = roomData.config || {};
    roomData.config.stream_url = cleanUrl;
    roomData.config.stream_updated_at = new Date().toISOString();
    roomData.config.stream_updated_by = {
      id: req.session.user.id,
      name: req.session.user.nome || req.session.user.apelido || 'Admin'
    };

    // Salvar dados atualizados
    await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));

    // Log da ação
    const adminName = req.session.user.nome || req.session.user.apelido || 'Admin';
    console.log(`🎥 URL de streaming ${cleanUrl ? 'definida' : 'removida'} via API na sala ${roomId} por ${adminName}: ${cleanUrl}`);

    res.json({
      success: true,
      message: `URL de streaming ${cleanUrl ? 'definida' : 'removida'} com sucesso`,
      data: {
        roomId,
        streamUrl: cleanUrl,
        updatedBy: adminName,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao definir URL de streaming via API:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

/**
 * Obter informações de streaming de uma sala
 */
router.get('/api/room/:roomId/stream-info', asyncErrorHandler(async (req, res, next) => {
  const { roomId } = req.params;

  try {
    const roomPath = path.join(__dirname, '../../../api/room.json');
    const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));

    const streamInfo = {
      roomId,
      isLiveEnabled: roomData.config?.live_enabled || false,
      streamUrl: roomData.config?.stream_url || '',
      lastOnline: roomData.config?.last_online || null,
      lastOffline: roomData.config?.last_offline || null,
      lastSessionDuration: roomData.config?.last_session_duration || null,
      streamUpdatedAt: roomData.config?.stream_updated_at || null,
      streamUpdatedBy: roomData.config?.stream_updated_by || null,
      activeSession: roomData.config?.active_session || null,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: streamInfo
    });

  } catch (error) {
    console.error('❌ Erro ao obter informações de streaming via API:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

/**
 * Ativar transmissão para uma sessão específica
 */
router.post('/api/room/:roomId/session/:sessionNumber/online', requireAuth, asyncErrorHandler(async (req, res, next) => {
  const { roomId, sessionNumber } = req.params;

  // Verificar permissões (level 1+ ou admin)
  if (!req.session.user || (req.session.user.level < 1 && !req.session.user.isAdmin)) {
    return res.status(403).json({
      success: false,
      error: 'Apenas administradores podem ativar sessões'
    });
  }

  try {
    // Buscar dados da sessão
    const sessoesPath = path.join(__dirname, '../../../api/sessoes.json');
    const sessoesData = JSON.parse(await fs.readFile(sessoesPath, 'utf8'));

    const sessionData = Object.values(sessoesData).find(s => s.session === parseInt(sessionNumber));

    if (!sessionData) {
      return res.status(404).json({
        success: false,
        error: `Sessão ${sessionNumber} não encontrada`
      });
    }

    // Ativar transmissão na sala
    const roomPath = path.join(__dirname, '../../../api/room.json');
    const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));

    roomData.config = roomData.config || {};
    roomData.config.live_enabled = true;
    roomData.config.last_online = new Date().toISOString();
    roomData.config.active_session = parseInt(sessionNumber);

    // Se a sessão tem URL específica, usar ela
    if (sessionData.live_url) {
      roomData.config.stream_url = sessionData.live_url;
    }

    // Salvar dados atualizados
    await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));

    // Log da ação
    const adminName = req.session.user.nome || req.session.user.apelido || 'Admin';
    console.log(`🎬 Sessão ${sessionNumber} ATIVADA via API na sala ${roomId} por ${adminName} - Título: ${sessionData.title}`);

    res.json({
      success: true,
      message: `Sessão ${sessionNumber} ativada com sucesso`,
      data: {
        roomId,
        sessionNumber: parseInt(sessionNumber),
        sessionTitle: sessionData.title,
        sessionSubtitle: sessionData.subtitle,
        streamUrl: sessionData.live_url || roomData.config.stream_url || '',
        activatedBy: adminName,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao ativar sessão via API:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

/**
 * Obter lista de sessões com informações de streaming
 */
router.get('/api/room/:roomId/sessions/stream', asyncErrorHandler(async (req, res, next) => {
  const { roomId } = req.params;

  try {
    // Carregar dados das sessões
    const sessoesPath = path.join(__dirname, '../../../api/sessoes.json');
    const sessoesData = JSON.parse(await fs.readFile(sessoesPath, 'utf8'));

    // Carregar dados da sala para verificar sessão ativa
    let activeSession = null;
    try {
      const roomPath = path.join(__dirname, '../../../api/room.json');
      const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));
      activeSession = roomData.config?.active_session || null;
    } catch (roomError) {
      console.warn('⚠️ Erro ao ler dados da sala:', roomError.message);
    }

    // Filtrar e formatar sessões que têm streaming
    const streamSessions = Object.values(sessoesData)
      .filter(sessao => sessao.live === 1 || sessao.live_url) // Sessões com live habilitado ou URL
      .map(sessao => ({
        session: sessao.session,
        title: sessao.title,
        subtitle: sessao.subtitle,
        description: sessao.description,
        startsAt: sessao.starts_at,
        endsAt: sessao.ends_at,
        liveUrl: sessao.live_url || null,
        videoUrl: sessao.video_url || null,
        duration: sessao.duration || 0,
        isActive: activeSession === sessao.session,
        hasLiveUrl: Boolean(sessao.live_url),
        icon: sessao.icon || 'fas fa-play'
      }))
      .sort((a, b) => a.session - b.session); // Ordenar por número da sessão

    res.json({
      success: true,
      data: {
        roomId,
        activeSession,
        sessions: streamSessions,
        total: streamSessions.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter sessões com streaming via API:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// ========================================
// ROTAS DE STATUS E MONITORAMENTO
// ========================================

/**
 * Status da estabilidade dos usuários
 */
router.get('/api/status/users', (req, res) => {
  try {
    const stats = userStabilityService.getStats();
    res.json({
      success: true,
      service: 'user-stability',
      ...stats
    });
  } catch (error) {
    console.error('Erro ao obter status de usuários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Status do heartbeat
 */
router.get('/api/status/heartbeat', (req, res) => {
  try {
    const stats = heartbeatService.getStats();
    res.json({
      success: true,
      service: 'heartbeat',
      ...stats
    });
  } catch (error) {
    console.error('Erro ao obter status de heartbeat:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ========================================
// SEÇÁO 10: STATUS E MONITORING
// ========================================

/**
 * Status geral do sistema
 */
router.get('/api/status/system', (req, res) => {
  try {
    const userStats = userStabilityService.getStats();
    const heartbeatStats = heartbeatService.getStats();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      services: {
        userStability: userStats,
        heartbeat: heartbeatStats
      }
    });
  } catch (error) {
    console.error('Erro ao obter status de heartbeat:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ========================================
// SEÇÁO 10.5: FUNCIONALIDADES DE ÁUDIO/NOTIFICAÇÃO
// ========================================

/**
 * Endpoint para ativar áudio no navegador
 * Necessário para permitir reprodução automática de sons de alerta
 */
router.post('/api/audio/enable', (req, res) => {
  try {
    console.log('🔊 [AUDIO API] Usuário solicitou ativação de áudio');

    res.json({
      success: true,
      message: 'Áudio habilitado para este usuário',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao habilitar áudio:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Endpoint para testar notificações
 */
router.post('/api/notifications/test', (req, res) => {
  try {
    const { message = 'Teste de notificação' } = req.body;

    console.log('📢 [NOTIFICATION API] Teste de notificação solicitado:', message);

    res.json({
      success: true,
      message: 'Teste de notificação executado',
      data: { message },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao testar notificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Endpoint com informações sobre compatibilidade de áudio/notificações
 */
router.get('/api/audio/info', (req, res) => {
  try {
    res.json({
      success: true,
      info: {
        audio: {
          problem: 'Navegadores modernos bloqueiam reprodução automática de áudio',
          solution: 'O usuário deve interagir com a página primeiro (clicar, tocar) para permitir áudio',
          legacy_behavior: 'No sistema legado, isso funcionava automaticamente em navegadores antigos'
        },
        notifications: {
          problem: 'Notificações desktop precisam de permissão explícita do usuário',
          solution: 'Solicitar permissão apenas em resposta a ação do usuário (clique em botão)',
          current_behavior: 'Sistema mostra mensagens no chat como fallback'
        },
        backend_status: {
          notifications: 'Backend funcionando - eventos chegam ao frontend corretamente',
          sound: 'Backend funcionando - eventos sound são enviados corretamente',
          issue: 'Limitações são do navegador, não do backend'
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao obter info de áudio:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ========================================
// SEÇÃO 10B: ROTAS API JITSI GOOGLE CLOUD
// ========================================

/**
 * Endpoint para verificar status da instância JITSI no Google Cloud
 */
router.get('/api/jitsi/instance/status', asyncErrorHandler(controllers.getJitsiInstanceStatus));

/**
 * Endpoint para sincronizar status entre local e instância Google Cloud
 */
router.post('/api/jitsi/instance/sync', asyncErrorHandler(controllers.syncJitsiStatus));

/**
 * Endpoint para teste de conectividade JITSI (debugging)
 */
router.get('/api/jitsi/test-connectivity', asyncErrorHandler(controllers.testJitsiConnectivity));

// ========================================
// SEÇÁO 11: EXPORTS
// ========================================

module.exports = router;
