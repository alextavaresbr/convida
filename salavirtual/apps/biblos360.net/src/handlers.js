/**
 * HANDLERS SOCKET.IO CONSOLIDADOS - BIBLOS360 VIRTUAL ROOM
 * Todos os handlers de eventos Socket.IO centralizados em um arquivo
 */

// ========================================
// SEÇÁO 1: IMPORTS E DEPENDÊNCIAS
// ========================================

const fs = require('fs').promises;
const path = require('path');
const { userStabilityService, heartbeatService, createBiblos360Cookie } = require('./services');

// ========================================
// SEÇÁO 2: ARMAZENAMENTO EM MEMÓRIA
// ========================================

// Armazenamento em memória dos usuários online por sala
const onlineUsers = new Map(); // roomId -> Set<userId>
const userSessions = new Map(); // socketId -> { roomId, userId, userData }
const roomStats = new Map(); // roomId -> { connectedCount, lastActivity }

// Adicionar heartbeat para verificar conexões mortas
const connectionHeartbeat = new Map(); // socketId -> lastPing

// Controle de throttle para status inicial - evitar spam
const statusThrottle = new Map(); // roomId -> lastStatusSent
const globalStatusCache = new Map(); // roomId -> { status, timestamp }

// Controle mais agressivo para evitar múltiplas emissões em refreshes
const adminStatusSent = new Map(); // userId -> { roomId, timestamp }

// SISTEMA ANTI-DUPLICAÇÃO DE MENSAGENS
const messageCache = new Map(); // msgid -> { timestamp, emitted }
const MESSAGE_CACHE_TTL = 5000; // 5 segundos para considerar mensagem como duplicada

const recentMessageCache = new Map(); // userId:roomId -> { messageIds: [], timestamp }

// SISTEMA DE ENQUETES/VOTAÇÃO
const activePolls = new Map(); // roomId -> { question, answers, votes: Map(userId -> answerIndex), startTime }

// SISTEMA DE INTERAÇÕES ADMINISTRATIVAS
const checkinStates = new Map(); // roomId -> boolean (presença ativa/inativa)
const evaluationStates = new Map(); // roomId -> string (código do docente ou null)
const reviewStates = new Map(); // roomId -> string (ID do evento ou null)
const popupStates = new Map(); // roomId -> { link: string, text: string } ou null

// ========================================
// SEÇÃO: UTILITÁRIOS DE PERSISTÊNCIA
// ========================================

/**
 * Atualiza o room.json com estados administrativos
 */
async function updateRoomAdminStates(roomId, states) {
  try {
    const roomPath = path.join(__dirname, '../../../api/room.json');
    const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));

    // Garantir que existe a seção admin_states
    if (!roomData.config) roomData.config = {};
    if (!roomData.config.admin_states) roomData.config.admin_states = {};

    // Atualizar estados administrativos
    Object.assign(roomData.config.admin_states, states);
    roomData.config.admin_states.last_updated = new Date().toISOString();

    await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));
    console.log(`📝 Estados administrativos atualizados no room.json:`, states);

  } catch (error) {
    console.error('❌ Erro ao atualizar estados administrativos no room.json:', error);
  }
}

/**
 * Carrega estados administrativos do room.json na inicialização
 */
async function loadAdminStatesFromRoom() {
  try {
    const roomPath = path.join(__dirname, '../../../api/room.json');
    const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));

    const adminStates = roomData.config?.admin_states || {};
    const roomId = 'pub'; // Assumindo sala principal

    // Restaurar estados dos Maps
    if (adminStates.checkin_active !== undefined) {
      checkinStates.set(roomId, adminStates.checkin_active);
    }
    if (adminStates.evaluation_code !== undefined) {
      evaluationStates.set(roomId, adminStates.evaluation_code);
    }
    if (adminStates.review_event_id !== undefined) {
      reviewStates.set(roomId, adminStates.review_event_id);
    }
    if (adminStates.popup_active !== undefined) {
      popupStates.set(roomId, adminStates.popup_active);
    }
    if (adminStates.chat_enabled !== undefined) {
      // Este será usado no chat_enabled handler
    }

    console.log(`🔄 Estados administrativos carregados do room.json para sala ${roomId}:`, adminStates);
    return adminStates;

  } catch (error) {
    console.warn('⚠️ Erro ao carregar estados administrativos (usando padrões):', error.message);
    return {};
  }
}

// SISTEMA DE WELCOME TOOLTIPS - Rastrear usuários que já viram
const welcomeTooltipsSeen = new Map(); // userId -> Set<roomId> - rastreia em quais salas o usuário já viu os tooltips

// ========================================
// SEÇÃO 3: FUNÇÕES AUXILIARES DE CACHE
// ========================================

/**
 * BOOTSTRAP DOS ROBÔS - Carrega robôs existentes na lista online
 * Esta função é chamada na inicialização do servidor para garantir
 * que os robôs salvos no participantes.json apareçam como online
 */
async function bootstrapBots() {
  try {
    console.log('🤖 [BOOTSTRAP] Inicializando robôs existentes...');

    const participantesPath = path.join(__dirname, '../../../api/participantes.json');

    try {
      const participantsData = await fs.readFile(participantesPath, 'utf8');
      const participants = JSON.parse(participantsData);

      if (!Array.isArray(participants)) {
        console.log('🤖 [BOOTSTRAP] Nenhum participante encontrado');
        return;
      }

      // Filtrar apenas robôs (IDs que começam com "99")
      const bots = participants.filter(p => String(p.id).startsWith('99'));

      if (bots.length === 0) {
        console.log('🤖 [BOOTSTRAP] Nenhum robô encontrado para inicializar');
        return;
      }

      console.log(`🤖 [BOOTSTRAP] Encontrados ${bots.length} robôs para inicializar`);

      // Definir sala padrão (mesmo que no insertBots)
      const roomId = 'pub';

      // Adicionar cada robô à lista online
      for (const bot of bots) {
        await addUserToOnlineList(roomId, bot.id.toString(), false, null);
        console.log(`🤖 [BOOTSTRAP] Robô ${bot.nick} (${bot.id}) marcado como online na sala ${roomId}`);
      }

      console.log(`🤖 [BOOTSTRAP] ${bots.length} robôs inicializados com sucesso na sala ${roomId}`);

    } catch (fileError) {
      if (fileError.code === 'ENOENT') {
        console.log('🤖 [BOOTSTRAP] Arquivo participantes.json não encontrado - nenhum robô para inicializar');
      } else {
        console.warn('🤖 [BOOTSTRAP] Erro ao ler participantes.json:', fileError.message);
      }
    }

  } catch (error) {
    console.error('🤖 [BOOTSTRAP] Erro ao inicializar robôs:', error.message);
  }
}

/**
 * REVALIDAÇÃO DOS ROBÔS - Verifica periodicamente se robôs estão online
 * Esta função garante que robôs permaneçam sempre na lista online
 */
async function revalidateBots() {
  try {
    const participantesPath = path.join(__dirname, '../../../api/participantes.json');

    try {
      const participantsData = await fs.readFile(participantesPath, 'utf8');
      const participants = JSON.parse(participantsData);

      if (!Array.isArray(participants)) {
        return;
      }

      // Filtrar apenas robôs (IDs que começam com "99")
      const bots = participants.filter(p => String(p.id).startsWith('99'));

      if (bots.length === 0) {
        return;
      }

      const roomId = 'pub';
      const onlineUserIds = getOnlineUsersForRoom(roomId);
      let revalidatedCount = 0;

      // Verificar se cada robô está online, se não, adicioná-lo
      for (const bot of bots) {
        const botId = bot.id.toString();
        if (!onlineUserIds.includes(botId)) {
          await addUserToOnlineList(roomId, botId, false, null);
          console.log(`🤖 [REVALIDAÇÃO] Robô ${bot.nick} (${bot.id}) re-adicionado à lista online`);
          revalidatedCount++;
        }
      }

      if (revalidatedCount > 0) {
        console.log(`🤖 [REVALIDAÇÃO] ${revalidatedCount} robôs revalidados na sala ${roomId}`);
      }

    } catch (fileError) {
      // Silenciar erros de arquivo não encontrado para evitar spam nos logs
      if (fileError.code !== 'ENOENT') {
        console.warn('🤖 [REVALIDAÇÃO] Erro ao ler participantes.json:', fileError.message);
      }
    }

  } catch (error) {
    console.error('🤖 [REVALIDAÇÃO] Erro ao revalidar robôs:', error.message);
  }
}

/**
 * INICIALIZAR TIMER DE REVALIDAÇÃO DOS ROBÔS
 * Executa revalidação a cada 2 minutos para manter robôs sempre online
 */
function initializeBotRevalidationTimer() {
  const REVALIDATION_INTERVAL = 2 * 60 * 1000; // 2 minutos

  setInterval(() => {
    revalidateBots();
  }, REVALIDATION_INTERVAL);

  console.log('🤖 [TIMER] Timer de revalidação dos robôs iniciado (a cada 2 minutos)');
}

/**
 * Limpar cache de mensagens antigas
 */
function cleanMessageCache() {
  try {
    const now = Date.now();
    const keysToDelete = [];

    for (const [msgid, data] of messageCache.entries()) {
      if (!data || typeof data.timestamp !== 'number' || now - data.timestamp > MESSAGE_CACHE_TTL) {
        keysToDelete.push(msgid);
      }
    }

    // Batch delete to avoid iterator issues
    keysToDelete.forEach(key => messageCache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`🧹 Limpeza de cache: ${keysToDelete.length} mensagens removidas`);
    }
  } catch (error) {
    console.error('❌ Erro ao limpar cache de mensagens:', error);
  }
}

/**
 * Verificar se mensagem já foi emitida recentemente
 */
function isMessageDuplicate(msgid) {
  try {
    if (!msgid || typeof msgid !== 'string') {
      return false;
    }

    const cached = messageCache.get(msgid);
    if (cached && cached.emitted) {
      console.log(`🚫 Mensagem ${msgid} já foi emitida recentemente - bloqueando duplicação`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Erro ao verificar duplicação de mensagem:', error);
    return false;
  }
}

/**
 * Marcar mensagem como emitida
 */
function markMessageAsEmitted(msgid) {
  try {
    if (!msgid || typeof msgid !== 'string') {
      return;
    }

    messageCache.set(msgid, {
      timestamp: Date.now(),
      emitted: true
    });

    // Limpar cache periodicamente (evita acúmulo de timeouts)
    if (messageCache.size > 100) { // Limite para acionar limpeza
      process.nextTick(() => cleanMessageCache());
    }
  } catch (error) {
    console.error('❌ Erro ao marcar mensagem como emitida:', error);
  }
}

/**
 * Calcular e enviar resultados da enquete
 */
function calculateAndSendPollResults(io, roomId) {
  try {
    const poll = activePolls.get(roomId);
    if (!poll) return;

    const results = new Array(poll.answers.length).fill(0);
    const totalVotes = poll.votes.size;

    // Contar votos por resposta
    for (const [userId, answerIndex] of poll.votes) {
      if (answerIndex >= 0 && answerIndex < poll.answers.length) {
        results[answerIndex]++;
      }
    }

    // Calcular percentuais
    const percentages = results.map(count =>
      totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
    );

    console.log(`📊 Resultados da enquete na sala ${roomId}:`, {
      totalVotes,
      results,
      percentages
    });

    // Enviar resultados para todos na sala (incluindo admin)
    io.to(roomId).emit('vote-results', results, percentages);

  } catch (error) {
    console.error('❌ Erro ao calcular resultados da enquete:', error);
  }
}

/**
 * Processar voto de usuário
 */
function processUserVote(io, userId, roomId, message) {
  try {
    const poll = activePolls.get(roomId);
    if (!poll) return false;

    // Verificar se a mensagem é um número válido
    const vote = parseInt(message.trim(), 10);
    if (isNaN(vote) || vote < 1 || vote > poll.answers.length) {
      return false;
    }

    // Registrar voto (answerIndex = vote - 1)
    const answerIndex = vote - 1;
    poll.votes.set(userId, answerIndex);

    console.log(`🗳️ Voto registrado: Usuário ${userId} votou na opção ${vote} (${poll.answers[answerIndex]})`);

    // Marcar usuário como tendo votado
    io.to(roomId).emit('user-voted', userId, null, vote);

    // Calcular e enviar resultados atualizados
    calculateAndSendPollResults(io, roomId);

    return true;
  } catch (error) {
    console.error('❌ Erro ao processar voto:', error);
    return false;
  }
}

// ========================================
// SEÇÁO 3: UTILITÁRIOS E FUNÇÕES AUXILIARES
// ========================================

/**
 * Normaliza ID de usuário para garantir consistência
 */
function normalizeUserId(userId) {
  try {
    if (!userId) return null;

    // Handle different types of userId
    if (typeof userId === 'number') return userId;
    if (typeof userId === 'string') {
      // Try to parse as integer for numeric strings
      const parsed = parseInt(userId, 10);
      return isNaN(parsed) ? userId : parsed; // Keep original if not numeric
    }

    return null;
  } catch (error) {
    console.error('❌ Erro ao normalizar userId:', error);
    return null;
  }
}

/**
 * Função auxiliar para obter usuários online de uma sala
 */
function getOnlineUsersForRoom(roomId) {
  try {
    if (!roomId) return [];
    return Array.from(onlineUsers.get(roomId) || []);
  } catch (error) {
    console.error('❌ Erro ao obter usuários online:', error);
    return [];
  }
}

/**
 * Função auxiliar para verificar se usuário está online
 */
function isUserOnline(userId, roomId) {
  try {
    const normalizedId = normalizeUserId(userId);
    const onlineUserIds = getOnlineUsersForRoom(roomId);
    return onlineUserIds.includes(normalizedId);
  } catch (error) {
    console.error('❌ Erro ao verificar se usuário está online:', error);
    return false;
  }
}

/**
 * Função auxiliar para emitir erros de forma padronizada
 */
function emitError(socket, message, code = null) {
  try {
    const errorData = { message };
    if (code) errorData.code = code;
    socket.emit('error', errorData);
  } catch (error) {
    console.error('❌ Erro ao emitir erro para socket:', error);
  }
}

/**
 * Função auxiliar para validar room ID
 */
function validateRoomId(roomId) {
  return roomId && typeof roomId === 'string' && roomId.trim().length > 0;
}

/**
 * Função auxiliar para obter sessão do usuário com validação
 */
function getUserSession(socketId) {
  try {
    if (!socketId) return null;
    return userSessions.get(socketId) || null;
  } catch (error) {
    console.error('❌ Erro ao obter sessão do usuário:', error);
    return null;
  }
}

/**
 * Função auxiliar para formatar lista de usuários com status online
 */
function formatUsersList(participants, roomId) {
  try {
    if (!Array.isArray(participants)) return [];

    const onlineUserIds = getOnlineUsersForRoom(roomId);
    return participants.map(participant => {
      const isOnline = onlineUserIds.includes(normalizeUserId(participant.id));
      return formatUserData(participant, isOnline);
    });
  } catch (error) {
    console.error('❌ Erro ao formatar lista de usuários:', error);
    return [];
  }
}

/**
 * Função auxiliar para logs condensados (reduzir verbosidade em produção)
 */
function logInfo(message, data = null) {
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_VERBOSE_LOGS === 'true') {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
}

/**
 * Função auxiliar para logs de debug (só aparece em desenvolvimento)
 */
function logDebug(message, data = null) {
  if (process.env.NODE_ENV === 'development' || process.env.ENABLE_DEBUG_LOGS === 'true') {
    if (data) {
      console.log(`🔍 DEBUG: ${message}`, data);
    } else {
      console.log(`🔍 DEBUG: ${message}`);
    }
  }
}

/**
 * Função auxiliar para logs de warning (sempre aparecem)
 */
function logWarning(message, data = null) {
  if (data) {
    console.warn(`⚠️ WARNING: ${message}`, data);
  } else {
    console.warn(`⚠️ WARNING: ${message}`);
  }
}

/**
 * Função auxiliar para logs de erro (sempre aparecem)
 */
function logError(message, error = null) {
  if (error) {
    console.error(`❌ ERROR: ${message}`, error);
  } else {
    console.error(`❌ ERROR: ${message}`);
  }
}

/**
 * Função auxiliar para adicionar usuário à lista online
 */
async function addUserToOnlineList(roomId, normalizedUserId, isAdmin, socketId) {
  try {
    // Adicionar à lista de usuários online
    if (!onlineUsers.has(roomId)) {
      onlineUsers.set(roomId, new Set());
    }

    // Usar apenas o userId normalizado para consistência
    const finalUserId = normalizeUserId(normalizedUserId);
    if (finalUserId) {
      onlineUsers.get(roomId).add(finalUserId);

      // Invalidar cache para atualização imediata
      invalidateParticipantsCache(roomId);

      // Marcar usuário admin como estável imediatamente
      if (isAdmin) {
        userStabilityService.markUserAsStable(finalUserId, socketId, true);
        logInfo(`🔐 Usuário ADMIN marcado como estável imediatamente: ${normalizedUserId}`);
      }

      logInfo(`➕ Usuário ${finalUserId} adicionado à lista online da sala ${roomId}`);
    }
  } catch (error) {
    console.error('❌ Erro ao adicionar usuário à lista online:', error);
  }
}

/**
 * Função auxiliar para remover usuário da lista online
 * PROTEÇÃO: Robôs (IDs que começam com "99") só são removidos se forçado
 */
async function removeUserFromOnlineList(roomId, normalizedUserId, forceRemove = false, io = null) {
  try {
    if (onlineUsers.has(roomId)) {
      const finalUserId = normalizeUserId(normalizedUserId);
      if (finalUserId) {
        // PROTEÇÃO: Verificar se é um robô
        const isBot = String(finalUserId).startsWith('99');
        if (isBot && !forceRemove) {
          console.log(`🤖 Robô ${finalUserId} protegido da remoção automática (use forceRemove=true se necessário)`);
          return false;
        }

        onlineUsers.get(roomId).delete(finalUserId);

        // Invalidar cache para atualização imediata
        invalidateParticipantsCache(roomId);

        // Se não há mais usuários online, limpar sala
        if (onlineUsers.get(roomId).size === 0) {
          onlineUsers.delete(roomId);
          roomStats.delete(roomId);
          console.log(`🧹 Sala ${roomId} limpa da memória - sem usuários online`);
        }

        // Se io está disponível, enviar atualização imediata via Socket.IO
        if (io) {
          process.nextTick(async () => {
            try {
              await sendUpdatedUserList(io, roomId, finalUserId);
            } catch (error) {
              console.error('❌ Erro ao enviar lista atualizada após remoção de usuário:', error);
            }
          });
        }

        console.log(`➖ Usuário ${finalUserId} removido da lista online da sala ${roomId}`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('❌ Erro ao remover usuário da lista online:', error);
    return false;
  }
}

/**
 * Função auxiliar para emitir eventos de usuário conectado
 */
async function emitUserJoinedEvents(socket, io, roomId, normalizedUserId, userData) {
  try {
    console.log(`🚀 [USER-EVENTS] Iniciando emissão de eventos para usuário ${userData.nome || normalizedUserId} na sala ${roomId}`);

    // Emitir evento "user-joined" para compatibilidade com virtual.js
    if (userData) {
      const formattedUser = formatUserData({ ...userData, roomId }, true);
      socket.to(roomId).emit('user-joined', formattedUser);
      console.log(`📡 [USER-EVENTS] Evento 'user-joined' emitido para sala ${roomId}:`, {
        nick: userData.nome || userData.apelido,
        userid: formattedUser.userid,
        uf: userData.uf,
        conf: formattedUser.extra?.conf || 'sala'
      });
      logDebug(`Evento 'user-joined' enviado para sala ${roomId}`, { user: userData.nome || normalizedUserId });
    }

    // Notificar outros usuários na sala (mantém para outras funcionalidades)
    socket.to(roomId).emit('user_joined', {
      userId: normalizedUserId,
      userData: formatUserData(userData || {}, true),
      timestamp: new Date().toISOString()
    });
    console.log(`📢 [USER-EVENTS] Evento 'user_joined' emitido para sala ${roomId}`);

    // Enviar evento welcome apenas se o usuário nunca viu os tooltips nesta sala
    // Aguardar um pequeno delay para garantir que o cliente esteja pronto
    setTimeout(() => {
      if (shouldShowWelcomeTooltips(normalizedUserId, roomId)) {
        socket.emit('welcome');
        markWelcomeTooltipsSeen(normalizedUserId, roomId);
        console.log(`👋 [USER-EVENTS] Evento 'welcome' enviado para usuário ${normalizedUserId} na sala ${roomId} (primeira vez)`);
        logDebug(`Evento 'welcome' enviado para usuário ${normalizedUserId} na sala ${roomId} (primeira vez)`);
      } else {
        console.log(`🚫 [USER-EVENTS] Welcome tooltips não enviados para ${normalizedUserId} na sala ${roomId} (já visto antes)`);
      }
    }, 2000);

    console.log(`✅ [USER-EVENTS] Todos os eventos de join emitidos para ${userData.nome || normalizedUserId}`);
  } catch (error) {
    console.error('❌ [USER-EVENTS] Erro ao emitir eventos de usuário conectado:', error);
  }
}

/**
 * Verifica se deve mostrar welcome tooltips para um usuário
 */
function shouldShowWelcomeTooltips(userId, roomId) {
  if (!welcomeTooltipsSeen.has(userId)) {
    return true; // Primeira vez que vê qualquer sala
  }

  const userSeenRooms = welcomeTooltipsSeen.get(userId);
  return !userSeenRooms.has(roomId); // Primeira vez nesta sala específica
}

/**
 * Marca que o usuário já viu os welcome tooltips nesta sala
 */
function markWelcomeTooltipsSeen(userId, roomId) {
  if (!welcomeTooltipsSeen.has(userId)) {
    welcomeTooltipsSeen.set(userId, new Set());
  }

  const userSeenRooms = welcomeTooltipsSeen.get(userId);
  userSeenRooms.add(roomId);

  console.log(`📝 [WELCOME] Usuário ${userId} marcado como tendo visto tooltips na sala ${roomId}`);
}/**
 * Função auxiliar para enviar lista atualizada de usuários
 */
async function sendUpdatedUserList(io, roomId, normalizedUserId) {
  try {
    console.log(`👥 [USER-LIST] Iniciando envio de lista atualizada para sala ${roomId} (trigger: ${normalizedUserId})`);

    // Invalidar cache antes de carregar para garantir dados atualizados
    invalidateParticipantsCache(roomId);

    // Usar Promise.all para operações paralelas
    const [participants, detailedCounts] = await Promise.all([
      loadParticipants(roomId),
      calculateDetailedUserCounts(roomId)
    ]);

    const formattedUsers = formatUsersList(participants, roomId);
    console.log(`📊 [USER-LIST] Lista formatada - ${formattedUsers.length} usuários, ${detailedCounts.online} online`);

    // Emitir para todos na sala (incluindo o que conectou)
    io.to(roomId).emit('user-list', formattedUsers);
    io.to(roomId).emit('user-count', detailedCounts);

    console.log(`� [USER-LIST] Eventos 'user-list' e 'user-count' emitidos para sala ${roomId}:`);
    console.log(`�🔢 [USER-LIST] DEBUG USER-COUNT: Enviado para sala ${roomId}:`, {
      total: detailedCounts.total,
      online: detailedCounts.online,
      offline: detailedCounts.offline,
      sala: detailedCounts.sala
    });

    const onlineCount = getOnlineUsersForRoom(roomId).length;
    logDebug(`📡 Lista de usuários atualizada enviada via Socket.IO para sala ${roomId}`, {
      online: onlineCount,
      total: participants.length,
      sala: detailedCounts.sala,
      professor: detailedCounts.professor,
      evento: 'user-list'
    });

    console.log(`✅ [USER-LIST] Lista atualizada enviada com sucesso para sala ${roomId}`);
  } catch (error) {
    console.error('❌ [USER-LIST] Erro ao enviar lista atualizada:', error);
  }
}

/**
 * Função auxiliar para enviar lista inicial de participantes para um usuário específico
 */
async function sendInitialParticipantsList(socket, roomId) {
  try {
    // Invalidar cache antes de carregar para garantir dados atualizados
    invalidateParticipantsCache(roomId);

    // Carregar participantes atualizados
    const [participants, detailedCounts] = await Promise.all([
      loadParticipants(roomId),
      calculateDetailedUserCounts(roomId)
    ]);

    const formattedUsers = formatUsersList(participants, roomId);

    // Enviar apenas para o socket específico
    socket.emit('user-list', formattedUsers);
    socket.emit('user-count', detailedCounts);

    console.log(`👥 Lista inicial de participantes enviada para usuário na sala ${roomId}:`, {
      total: detailedCounts.total,
      online: detailedCounts.online,
      offline: detailedCounts.offline,
      sala: detailedCounts.sala
    });

  } catch (error) {
    console.error('❌ Erro ao enviar lista inicial de participantes:', error);
  }
}

/**
 * Função auxiliar para extrair Room ID do referer de forma otimizada
 */
function extractRoomIdFromReferer(socket) {
  try {
    const referer = socket.handshake.headers.referer || '';
    const roomMatch = referer.match(/\/vr\/([a-zA-Z0-9]+)/);

    if (!roomMatch) {
      logWarning(`Room ID não encontrado no referer: ${referer}`);
      return null;
    }

    let roomId = roomMatch[1];

    // Forçar admins a entrarem na sala 'pub' para moderar mensagens
    if (roomId === 'admin' || roomId === 'chat' || roomId === 'monitor') {
      roomId = 'pub';
      logInfo(`Redirecionando ${roomMatch[1]} para sala 'pub' para moderação unificada`);
    }

    return roomId;
  } catch (error) {
    logError('Erro ao extrair roomId do referer', error);
    return null;
  }
}

/**
 * Função auxiliar para processar join de usuário guest
 */
async function processGuestJoin(authenticatedUser, nick, extra) {
  try {
    logDebug(`Usuário guest quer participar`, { nick, uf: extra.uf });

    // Validar UF de forma otimizada
    const validUFs = new Set(['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']);

    if (!validUFs.has(extra.uf.toUpperCase())) {
      logWarning(`UF inválida fornecida: ${extra.uf}`);
      return null;
    }

    // Validar nome (somente letras)
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nick)) {
      logWarning(`Nick inválido fornecido: ${nick}`);
      return null;
    }

    // Transformar guest em anônimo participante de forma otimizada
    const crypto = require('crypto');
    const sessionId = crypto.randomBytes(16).toString('hex');
    const formattedNick = nick.charAt(0).toUpperCase() + nick.slice(1).toLowerCase();
    const normalizedUF = extra.uf.toUpperCase();

    return {
      id: `anon_${sessionId}`,
      nome: formattedNick,
      apelido: formattedNick,
      uf: normalizedUF,
      isGuest: false,
      isAnonymous: true,
      isAnonymousParticipant: true,
      session_id: sessionId,
      allowJoinWithForm: false
    };
  } catch (error) {
    logError('Erro ao processar guest join', error);
    return null;
  }
}

/**
 * Função auxiliar para otimizar o processamento de join
 */
async function processUserJoin(socket, io, authenticatedUser, roomId, userid, sessionItem, sessionFixed, hasPlayer) {
  try {
    // Log específico para usuários anônimos
    if (authenticatedUser.isAnonymous) {
      logDebug(`Usuário anônimo conectando`, {
        apelido: authenticatedUser.apelido,
        uf: authenticatedUser.uf
      });
    }

    // Normalizar dados do usuário
    const normalizedUserId = normalizeUserId(authenticatedUser.id);
    const isAdmin = authenticatedUser.isAdmin || authenticatedUser.level === 3;

    // Usar Promise.all para operações paralelas quando possível
    const [participants] = await Promise.all([
      getCombinedParticipantsList(roomId)
    ]);

    // Verificar se o usuário já está na lista (evitar duplicação)
    const existingUser = participants.find(p => normalizeUserId(p.id) === normalizedUserId);

    // Preparar dados de resposta otimizados
    const responseData = {
      userid: normalizedUserId,
      sessionItem: sessionItem || 0,
      sessionFixed: sessionFixed || 0,
      hasPlayer: hasPlayer || false,
      isAdmin: isAdmin,
      userData: formatUserData(authenticatedUser, true),
      roomStats: {
        totalParticipants: participants.length,
        onlineCount: getOnlineUsersForRoom(roomId).length
      }
    };

    // Salvar sessão otimizada
    userSessions.set(socket.id, {
      roomId,
      userId: normalizedUserId,
      userData: authenticatedUser,
      joinedAt: new Date().toISOString(),
      isAdmin
    });

    // Adicionar à sala e lista online
    socket.join(roomId);
    await addUserToOnlineList(roomId, normalizedUserId, isAdmin, socket.id);

    // Atualizar estatísticas
    updateRoomStats(roomId);

    // Registrar heartbeat
    connectionHeartbeat.set(socket.id, Date.now());

    // EMITIR EVENTOS DE USER JOINED PARA NOTIFICAR OUTROS USUÁRIOS
    await emitUserJoinedEvents(socket, io, roomId, normalizedUserId, authenticatedUser);

    // ENVIAR LISTA ATUALIZADA PARA TODOS NA SALA (imediato)
    setTimeout(async () => {
      try {
        await sendUpdatedUserList(io, roomId, normalizedUserId);
      } catch (error) {
        console.error('❌ Erro ao enviar lista de usuários atualizada:', error);
      }
    }, 100); // 100ms delay para garantir que a adição foi processada

    return responseData;
  } catch (error) {
    logError('Erro ao processar join do usuário', error);
    return null;
  }
}





/**
 * Processar uma conexão morta individual
 */
async function processDeadConnection(socketId, io) {
  try {
    const sessionData = userSessions.get(socketId);
    const isAdmin = sessionData?.userData?.isAdmin || sessionData?.userData?.level === 3;
    const userType = isAdmin ? '(ADMIN)' : '(USUÁRIO)';

    console.log(`🧹 Limpando conexão morta: ${socketId} ${userType} (inativa por mais de 20 minutos)`);

    // Tentar notificar o cliente antes de desconectar (se io estiver disponível)
    if (io) {
      try {
        const socket = io.sockets.sockets.get(socketId);
        if (socket && socket.connected) {
          console.log(`📢 Notificando cliente sobre desconexão por timeout: ${socketId} ${userType}`);

          // SISTEMA PROFISSIONAL: Forçar logout com limpeza de cookies
          socket.emit('forced-logout', {
            reason: 'timeout',
            message: 'Você foi desconectado por inatividade (20 minutos)',
            timeoutType: '20 minutos',
            clearCookies: true // Sinalizar para limpar cookies no frontend
          });

          // Aguardar um pouco antes de forçar desconexão
          setTimeout(() => {
            if (socket.connected) {
              console.log(`🔌 Forçando desconexão do socket: ${socketId} ${userType}`);
              socket.disconnect(true);
            }
          }, 3000); // Aumentado para 3 segundos
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao notificar cliente ${socketId}:`, error.message);
      }
    }

    // Clean up tracking data
    connectionHeartbeat.delete(socketId);

    const session = userSessions.get(socketId);
    if (session && session.roomId && session.userId) {
      const { roomId, userId } = session;

      // Remover da lista de usuários online usando função centralizada
      if (onlineUsers.has(roomId)) {
        const normalizedUserId = normalizeUserId(userId);
        await removeUserFromOnlineList(roomId, normalizedUserId, false, io);
      }

      userSessions.delete(socketId);
      console.log(`🧹 Sessão limpa para usuário ${userId} na sala ${roomId}`);
    } else {
      userSessions.delete(socketId);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar conexão morta ${socketId}:`, error);
  }
}

// Executar limpeza a cada 15 minutos (muito menos agressivo)
// A função será inicializada com io através de initializeCleanupTimer
let cleanupTimer = null;
let cacheCleanupTimer = null;

function initializeCleanupTimer(io) {
  try {
    // Clear existing timers
    if (cleanupTimer) {
      clearInterval(cleanupTimer);
    }
    if (cacheCleanupTimer) {
      clearInterval(cacheCleanupTimer);
    }

    // Connection cleanup timer
    cleanupTimer = setInterval(async () => {
      try {
        await cleanDeadConnections(io);
      } catch (error) {
        console.error('❌ Erro no timer de limpeza de conexões:', error);
      }
    }, 3000); // SISTEMA PROFISSIONAL: Limpeza a cada 3 segundos

    // Cache cleanup timer (more frequent)
    cacheCleanupTimer = setInterval(() => {
      try {
        cleanMessageCache();
        cleanStatusCaches();
      } catch (error) {
        console.error('❌ Erro no timer de limpeza de cache:', error);
      }
    }, 300000); // 5 minutes

    console.log('🔧 Timers de limpeza inicializados com acesso ao io');
  } catch (error) {
    console.error('❌ Erro ao inicializar timers de limpeza:', error);
  }
}

/**
 * Limpar caches de status antigos
 */
function cleanStatusCaches() {
  try {
    const now = Date.now();
    const cacheTimeout = 600000; // 10 minutes

    // Clean status throttle cache
    for (const [roomId, timestamp] of statusThrottle.entries()) {
      if (now - timestamp > cacheTimeout) {
        statusThrottle.delete(roomId);
      }
    }

    // Clean global status cache
    for (const [roomId, data] of globalStatusCache.entries()) {
      if (data && data.timestamp && now - data.timestamp > cacheTimeout) {
        globalStatusCache.delete(roomId);
      }
    }

    // Clean admin status sent cache
    for (const [userId, data] of adminStatusSent.entries()) {
      if (data && data.timestamp && now - data.timestamp > cacheTimeout) {
        adminStatusSent.delete(userId);
      }
    }

    // Clean recent message cache
    for (const [key, data] of recentMessageCache.entries()) {
      if (data && data.timestamp && now - data.timestamp > cacheTimeout) {
        recentMessageCache.delete(key);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao limpar caches de status:', error);
  }
}

/**
 * Cleanup function for graceful shutdown
 */
function cleanup() {
  try {
    if (cleanupTimer) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
    if (cacheCleanupTimer) {
      clearInterval(cacheCleanupTimer);
      cacheCleanupTimer = null;
    }
    console.log('🧹 Timers de limpeza finalizados');
  } catch (error) {
    console.error('❌ Erro na limpeza final:', error);
  }
}

/**
 * Combina participantes do JSON com usuários anônimos participantes online
 * Usuários anônimos não são salvos no participantes.json, só existem em memória
 * Otimizado para melhor performance
 */
async function getCombinedParticipantsList(roomId) {
  try {
    if (!validateRoomId(roomId)) {
      console.warn('❌ RoomId inválido fornecido para getCombinedParticipantsList');
      return [];
    }

    // Usar Promise.all para operações paralelas quando possível
    const [registeredParticipants] = await Promise.all([
      loadParticipants(roomId)
    ]);

    // 2. Obter usuários anônimos participantes que estão online (operação síncrona otimizada)
    const anonymousParticipants = getAnonymousParticipants(roomId);

    // 3. Combinar as listas de forma eficiente
    const allParticipants = [...registeredParticipants, ...anonymousParticipants];

    logInfo(`📋 Lista combinada: ${registeredParticipants.length} registrados + ${anonymousParticipants.length} anônimos participantes = ${allParticipants.length} total`);

    return allParticipants;

  } catch (error) {
    console.error('❌ Erro ao combinar listas de participantes:', error);
    // Fallback mais robusto
    try {
      return await loadParticipants(roomId);
    } catch (fallbackError) {
      console.error('❌ Erro no fallback de participantes:', fallbackError);
      return [];
    }
  }
}

/**
 * Função auxiliar para obter participantes anônimos de forma otimizada
 */
function getAnonymousParticipants(roomId) {
  const anonymousParticipants = [];

  try {
    // Usar filter e map para melhor performance com arrays grandes
    const anonymousSessions = Array.from(userSessions.values()).filter(session =>
      session.roomId === roomId &&
      session.userData?.isAnonymous &&
      session.userData?.isAnonymousParticipant
    );

    for (const session of anonymousSessions) {
      const userData = session.userData;
      const nickName = userData.apelido || userData.nome || 'Visitante';

      logDebug(`Anônimo participante na lista: ${nickName}`, {
        apelido: userData.apelido,
        nome: userData.nome,
        uf: userData.uf
      });

      anonymousParticipants.push({
        id: userData.id, // anon_[session_id]
        nick: nickName,
        apelido: userData.apelido,
        nome: userData.nome,
        level: 0,
        uf: userData.uf || '',
        sexo: 0, // sexo 0 para texto preto na lista
        parceiro: "0",
        equipe: '',
        turma: '',
        grupo: '',
        rede: '',
        isAnonymous: true,
        isAnonymousParticipant: true,
        roomId: roomId
      });
    }

    return anonymousParticipants;
  } catch (error) {
    console.error('❌ Erro ao obter participantes anônimos:', error);
    return [];
  }
}

// Cache para participantes (evita leituras desnecessárias do arquivo)
const participantsCache = new Map(); // roomId -> { data, timestamp }
const PARTICIPANTS_CACHE_TTL = 5000; // 5 segundos para responsividade máxima

// FORÇAR LIMPEZA DE CACHE NA INICIALIZAÇÃO (para debug)
console.log('🧹 Limpando cache de participantes na inicialização...');
participantsCache.clear();

async function loadParticipants(roomId) {
  try {
    if (!roomId || typeof roomId !== 'string') {
      console.warn('❌ RoomId inválido fornecido para loadParticipants');
      return [];
    }

    // Check cache first
    const cached = participantsCache.get(roomId);
    const now = Date.now();

    if (cached && (now - cached.timestamp < PARTICIPANTS_CACHE_TTL)) {
      return cached.data;
    }

    const participantesPath = path.join(__dirname, '../../../api/participantes.json');
    const participantsData = await fs.readFile(participantesPath, 'utf8');
    const participants = JSON.parse(participantsData);

    // Validate participants data
    const validParticipants = Array.isArray(participants) ? participants : [];

    // Cache the result
    participantsCache.set(roomId, {
      data: validParticipants,
      timestamp: now
    });

    return validParticipants;
  } catch (error) {
    console.warn(`Participantes não encontrados para sala ${roomId}:`, error.message);

    // Return cached data if available, even if expired
    const cached = participantsCache.get(roomId);
    if (cached) {
      console.log(`📋 Usando dados em cache para sala ${roomId}`);
      return cached.data;
    }

    return [];
  }
}

/**
 * Invalidar cache de participantes para uma sala específica
 * Usado quando robôs são inseridos/removidos para forçar reload
 */
function invalidateParticipantsCache(roomId) {
  try {
    participantsCache.delete(roomId);
    console.log(`🗑️ Cache de participantes invalidado para sala ${roomId}`);
  } catch (error) {
    console.error('❌ Erro ao invalidar cache de participantes:', error);
  }
}

/**
 * Extrai dados do usuário autenticado dos headers/cookies
 */
function extractAuthenticatedUser(socket, roomId) {
  try {
    const cookies = socket.handshake.headers.cookie || '';

    // Procurar primeiro por cookies de usuário, depois admin, depois anônimo
    let cookieMatch = null;
    let cookieValue = null;
    let isAdmin = false;
    let isAnonymous = false;
    let isGuest = false;

    // Priorizar cookies normais (mesma lógica do middleware HTTP)
    if (cookies.includes('biblos360_site_usuario')) {
      cookieMatch = cookies.match(/biblos360_site_usuario=([^;]+)/);
      console.log('🔍 Encontrou cookie normal no Socket.IO');
    } else if (cookies.includes('biblos360_admin_usuario')) {
      cookieMatch = cookies.match(/biblos360_admin_usuario=([^;]+)/);
      isAdmin = true;
      console.log('🔍 Encontrou cookie de admin no Socket.IO');
    } else if (cookies.includes('biblos360_anonymous_participant')) {
      cookieMatch = cookies.match(/biblos360_anonymous_participant=([^;]+)/);
      isAnonymous = true;
      console.log('🔍 Encontrou cookie de usuário anônimo no Socket.IO');
    } else if (cookies.includes('biblos360_site_inscrito')) {
      // Fallback para usuários guest que só têm cookie de inscrição
      cookieMatch = cookies.match(/biblos360_site_inscrito=([^;]+)/);
      isGuest = true;
      console.log('🔍 Encontrou cookie de guest/visitante no Socket.IO');
    }

    if (!cookieMatch) {
      console.warn('🔍 Nenhum cookie de usuário encontrado no Socket.IO');
      return null;
    }

    cookieValue = decodeURIComponent(cookieMatch[1]);
    console.log(`🔍 Processando cookie de usuário ${isAdmin ? 'admin' : isAnonymous ? 'anônimo' : isGuest ? 'guest' : 'normal'}`);

    // Parse do formato PHP serializado
    const userData = parseBiblos360Cookie(cookieValue);

    // Para usuários guest que só têm biblos360_site_inscrito
    if (isGuest && userData && userData.guest_session === 'true') {
      // Usuário guest básico - pode fazer join com nick e UF
      const user = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nome: 'Convidado',
        apelido: 'Convidado',
        level: 0,
        email: '',
        uf: null,
        sexo: null,
        parceiro: "0",
        equipe: null,
        turma: null,
        grupo: null,
        rede: null,
        isAdmin: false,
        isAnonymous: false,
        isGuest: true,
        allowJoinWithForm: true // Flag para permitir join com formulário
      };

      console.log(`✅ Usuário guest extraído do Socket.IO: ${user.apelido} (permitindo join com formulário)`);
      return user;
    }

    if (userData && (userData.id || userData.session_id)) {

      if (isAnonymous) {
        // Verificar se é anônimo participante (tem cookie biblos360_anonymous_participant)
        const isAnonymousParticipant = cookies.includes('biblos360_anonymous_participant');

        // Formatação padrão para nome do cookie: primeira letra maiúscula, resto minúscula
        const rawNick = userData.nick || 'Visitante';
        const formattedNick = rawNick.charAt(0).toUpperCase() + rawNick.slice(1).toLowerCase();

        // Usuário anônimo (total ou participante)
        const user = {
          id: `anon_${userData.session_id}`, // ID único para anônimo
          nome: formattedNick,
          apelido: formattedNick,
          level: 0,
          email: '',
          uf: userData.uf || null,
          sexo: null,
          parceiro: "0",
          equipe: null,
          turma: null,
          grupo: null,
          rede: null,
          session_id: userData.session_id,
          isAdmin: false,
          isAnonymous: true,
          isAnonymousParticipant: isAnonymousParticipant,
          anonymous: true
        };

        const userType = isAnonymousParticipant ? 'participante' : 'total';
        console.log(`✅ Usuário anônimo ${userType} extraído do Socket.IO: ${user.apelido} (Session: ${userData.session_id})`);
        return user;
      } else {
        // Usuário registrado normal
        const user = {
          id: parseInt(userData.id),
          nome: userData.nome?.replace(/\+/g, ' ') || userData.nick || 'Usuário',
          apelido: userData.apelido || userData.nick || 'Usuário',
          level: parseInt(userData.level) || 0,
          email: userData.email || '',
          uf: userData.uf || null,
          sexo: userData.sexo || null,
          parceiro: userData.parceiro || "0",
          equipe: userData.equipe || null,
          turma: userData.turma || null,
          grupo: userData.grupo || null,
          rede: userData.rede || null,
          isAdmin: isAdmin,
          isAnonymous: false
        };

        console.log(`✅ Usuário autenticado extraído do Socket.IO: ${user.apelido} (ID: ${user.id}) - Admin: ${isAdmin}`);
        return user;
      }
    }

    return null;
  } catch (error) {
    console.warn('Erro ao extrair usuário autenticado:', error.message);
    return null;
  }
}

/**
 * Parse de cookie serializado PHP (formato a:N:{...})
 */
function parseBiblos360Cookie(data) {
  try {
    if (!data || typeof data !== 'string' || data.trim().length === 0) {
      return null;
    }

    // Primeiro tenta decodificar base64
    try {
      const decoded = Buffer.from(data, 'base64').toString('utf8');
      const parsed = JSON.parse(decoded);

      // Validate parsed data has expected structure
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (base64Error) {
      // Se falhar, tenta parse direto do formato PHP serializado
      return parsePhpSerializedCookie(data);
    }

    return null;
  } catch (error) {
    console.warn('Erro ao processar cookie PHP:', error.message);
    return null;
  }
}

/**
 * Parse de cookie PHP serializado (formato a:N:{...}) - Otimizado
 */
function parsePhpSerializedCookie(data) {
  try {
    if (!data || typeof data !== 'string' || data.trim().length === 0) {
      return null;
    }

    // Limpar dados
    const cleanData = decodeURIComponent(data).trim();

    // Parse simples para formato PHP a:N:{...}
    if (!cleanData.startsWith('a:')) {
      return null;
    }

    const result = {};
    let hasData = false;

    // Regex otimizada para extrair pares chave-valor do formato PHP serialized
    // Match string values: s:length:"key";s:length:"value"
    const stringPattern = /s:(\d+):"([^"]+)";s:(\d+):"([^"]*)"/g;
    let match;

    while ((match = stringPattern.exec(cleanData)) !== null) {
      const keyLength = parseInt(match[1], 10);
      const key = match[2];
      const valueLength = parseInt(match[3], 10);
      const value = match[4];

      // Validate lengths match
      if (key.length === keyLength && value.length === valueLength) {
        result[key] = value;
        hasData = true;
      }
    }

    // Também processa valores inteiros: s:length:"key";i:value
    const intPattern = /s:(\d+):"([^"]+)";i:(\d+)/g;
    let intMatch;

    while ((intMatch = intPattern.exec(cleanData)) !== null) {
      const keyLength = parseInt(intMatch[1], 10);
      const key = intMatch[2];
      const value = parseInt(intMatch[3], 10);

      // Validate key length
      if (key.length === keyLength && !isNaN(value)) {
        result[key] = value;
        hasData = true;
      }
    }

    return hasData ? result : null;
  } catch (error) {
    console.warn('Erro ao processar cookie PHP serializado:', error.message);
    return null;
  }
}

/**
 * Formata dados do usuário para o sistema legado virtual.js
 * Mantém compatibilidade total com o formato original
 */
function formatUserData(user, isOnline = false) {
  // Tratamento especial para usuários anônimos
  if (user.isAnonymous) {
    return {
      userid: isOnline ? user.id : null,
      nick: user.apelido || user.nome || 'Visitante',
      level: 0, // Usuários anônimos sempre têm level 0
      extra: {
        extid: user.id,
        uf: user.uf || '',
        sexo: 0, // CORREÇÃO: sexo 0 para evitar cores azul/rosa e manter texto preto
        parceiro: false,
        equipe: '',
        turma: '',
        grupo: '',
        rede: '',
        watcher: null,
        watcher_item: 0,
        conf: null,
        checkin: 0,
        breakout: 0,
        evaluation: 0,
        review: 0,
        popup: 0,
        vote: 0,
        anonymous: true // Marcador especial
      },
      online: isOnline,
      anonymous: true // Marcador adicional para identificação
    };
  }

  // Formato exato esperado pelo virtual.js na função loadUsers()
  // COMPATIBILIDADE CRÍTICA: Usuários em conferência devem manter userid válido
  return {
    userid: isOnline ? user.id : null, // Se offline, userid é null
    nick: normalizeNick(user),
    level: user.level || 0,
    extra: {
      extid: user.id,
      uf: user.uf || '',
      sexo: user.sexo || 1,
      parceiro: (user.parceiro === '1' || user.parceiro === 1) ? 1 : 0,
      equipe: user.equipe || '',
      turma: user.turma || '',
      grupo: user.grupo || '',
      rede: user.rede || '',
      watcher: null,
      watcher_item: 0,
      conf: null, // Será preenchido dinamicamente pela função handleMove
      checkin: 0,
      breakout: 0,
      evaluation: 0,
      review: 0,
      popup: 0,
      vote: 0
    },
    online: isOnline
  };
}

/**
 * Atualiza estatísticas da sala
 */
function updateRoomStats(roomId) {
  const onlineCount = onlineUsers.get(roomId)?.size || 0;
  roomStats.set(roomId, {
    connectedCount: onlineCount,
    lastActivity: new Date().toISOString()
  });
}

/**
 * Calcula contadores específicos por tipo de conferência
 * COMPATIBILIDADE: Sistema legado espera contadores detalhados no evento user-count
 */
async function calculateDetailedUserCounts(roomId) {
  try {
    if (!validateRoomId(roomId)) {
      console.warn('❌ RoomId inválido para calculateDetailedUserCounts');
      return getDefaultCounts();
    }

    // Usar Promise.all para operações paralelas
    const [participants] = await Promise.all([
      getCombinedParticipantsList(roomId)
    ]);

    const onlineUserIds = getOnlineUsersForRoom(roomId);

    // Inicializar contadores de forma mais organizada (compatível com virtual.js)
    const counts = {
      total: participants.length,
      online: onlineUserIds.length,
      offline: participants.length - onlineUserIds.length,
      insc: 0,
      staff: 0,
      sala: 0,        // usuários online sem conferência (na sala principal)
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
    };

    // Otimizar contagem usando Map para cache de sessões
    const userSessionsMap = createUserSessionsMap(roomId);

    // Contar participantes por categoria de forma mais eficiente
    for (const participant of participants) {
      const normalizedId = normalizeUserId(participant.id);
      const isOnline = onlineUserIds.includes(normalizedId);

      if (isOnline) {
        // Classificar por equipe/nível de forma otimizada
        counts.insc++;

        if (isStaffMember(participant)) {
          counts.staff++;
          counts.insc--; // Remove do contador de inscritos
        }

        // Obter informação de conferência de forma otimizada
        const userSession = userSessionsMap.get(normalizedId);
        const confType = getUserConferenceType(userSession);

        if (confType && counts.hasOwnProperty(confType)) {
          counts[confType]++;
        } else {
          // Usuário está na sala principal (ONLINE)
          counts.sala++;
        }
      }
    }

    // Log condensado (apenas em desenvolvimento)
    logDebug(`Contadores detalhados sala ${roomId}`, {
      total: counts.total,
      online: counts.online,
      offline: counts.offline,
      sala: counts.sala,
      professor: counts.professor,
      projeto: counts.projeto,
      reuniao: counts.reuniao,
      equipe: counts.equipe
    });

    return counts;
  } catch (error) {
    console.error('❌ Erro ao calcular contadores detalhados:', error);
    return await getFallbackCounts(roomId);
  }
}

/**
 * Função auxiliar para obter contadores padrão
 */
function getDefaultCounts() {
  return {
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
  };
}

/**
 * Função auxiliar para criar mapa de sessões de usuários
 */
function createUserSessionsMap(roomId) {
  const userSessionsMap = new Map();

  try {
    for (const session of userSessions.values()) {
      if (session.roomId === roomId && session.userId) {
        const normalizedId = normalizeUserId(session.userId);
        userSessionsMap.set(normalizedId, session);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao criar mapa de sessões:', error);
  }

  return userSessionsMap;
}

/**
 * Função auxiliar para verificar se é membro da equipe
 */
function isStaffMember(participant) {
  try {
    return participant.equipe &&
      typeof participant.equipe === 'string' &&
      participant.equipe.toLowerCase().includes('biblos');
  } catch (error) {
    return false;
  }
}

/**
 * Função auxiliar para obter tipo de conferência do usuário
 */
function getUserConferenceType(userSession) {
  try {
    return userSession?.userData?.currentConference?.type || null;
  } catch (error) {
    return null;
  }
}

/**
 * Função auxiliar para contadores de fallback
 */
async function getFallbackCounts(roomId) {
  try {
    const participants = await loadParticipants(roomId).catch(() => []);
    const onlineUserIds = getOnlineUsersForRoom(roomId);

    return {
      ...getDefaultCounts(),
      total: participants.length,
      online: onlineUserIds.length,
      offline: participants.length - onlineUserIds.length,
      insc: onlineUserIds.length,
      sala: onlineUserIds.length
    };
  } catch (error) {
    console.error('❌ Erro no fallback de contadores:', error);
    return getDefaultCounts();
  }
}

// ========================================
// SEÇÁO 4: HANDLERS DE USUÁRIO
// ========================================

/**
 * Handler principal de usuários
 */
function userHandler(socket, io, connectionFlags = {}) {

  /**
   * Evento: users
   * Frontend solicita lista de usuários (compatibilidade)
   */
  socket.on('users', async () => {
    try {
      // Marcar que o usuário foi conectado via handler para evitar carregamento automático duplicado
      if (connectionFlags.setUserConnectedViaHandler) {
        connectionFlags.setUserConnectedViaHandler(true);
      }

      const session = getUserSession(socket.id);
      if (!session) {
        emitError(socket, 'Usuário não conectado', 'USER_NOT_CONNECTED');
        return;
      }

      const { roomId } = session;
      if (!validateRoomId(roomId)) {
        emitError(socket, 'Room ID inválido', 'INVALID_ROOM_ID');
        return;
      }

      const participants = await getCombinedParticipantsList(roomId);

      if (participants && participants.length > 0) {
        const [formattedUsers, detailedCounts] = await Promise.all([
          formatUsersList(participants, roomId),
          calculateDetailedUserCounts(roomId)
        ]);

        socket.emit('user-list', formattedUsers);
        socket.emit('user-count', detailedCounts);

        console.log(`🔢 DEBUG USER-COUNT: Enviado via socket.users para sala ${roomId}:`, {
          total: detailedCounts.total,
          online: detailedCounts.online,
          offline: detailedCounts.offline,
          sala: detailedCounts.sala
        });

        logDebug(`Lista de usuários enviada para ${roomId}`, {
          count: formattedUsers.length,
          online: getOnlineUsersForRoom(roomId).length
        });
      } else {
        socket.emit('user-list', []);
        socket.emit('user-count', getDefaultCounts());
        logDebug(`Lista vazia enviada para ${roomId}`);
      }

    } catch (error) {
      console.error('❌ Erro no users:', error);
      emitError(socket, 'Erro ao buscar lista de usuários', 'USERS_FETCH_ERROR');
    }
  });

  /**
   * Evento: user_connect
   * Usuário se conecta a uma sala específica
   */
  socket.on('user_connect', async (data) => {
    try {
      const { roomId, userId, userData } = data || {};

      if (!validateRoomId(roomId)) {
        emitError(socket, 'Room ID é obrigatório', 'ROOM_ID_REQUIRED');
        return;
      }

      // Normalizar userId para garantir compatibilidade
      const normalizedUserId = normalizeUserId(userId) || 'anonymous';

      logInfo(`👤 Usuário conectando - Socket: ${socket.id}, Room: ${roomId}, User: ${normalizedUserId}`);

      // Verificar se é usuário administrativo
      const isAdmin = (userData?.level === 3) || (userData?.isAdmin === true);

      // Salvar sessão do usuário
      userSessions.set(socket.id, {
        roomId,
        userId: normalizedUserId,
        userData: userData || {},
        connectedAt: new Date().toISOString()
      });

      // Adicionar à sala do Socket.IO
      socket.join(roomId);

      // Adicionar à lista de usuários online de forma otimizada
      await addUserToOnlineList(roomId, normalizedUserId, isAdmin, socket.id);

      // Atualizar estatísticas
      updateRoomStats(roomId);

      // Emitir eventos de forma otimizada
      await emitUserJoinedEvents(socket, io, roomId, normalizedUserId, userData);

      // ENVIAR LISTA ATUALIZADA PARA TODOS NA SALA (async)
      process.nextTick(async () => {
        try {
          await sendUpdatedUserList(io, roomId, normalizedUserId);
        } catch (error) {
          console.error('❌ Erro ao enviar lista de usuários:', error);
        }
      });

      // Confirmar conexão para o usuário
      const onlineCount = getOnlineUsersForRoom(roomId).length;
      socket.emit('user_connected', {
        success: true,
        roomId,
        onlineCount,
        timestamp: new Date().toISOString()
      });

      // Registrar heartbeat
      connectionHeartbeat.set(socket.id, Date.now());

      // FORÇAR CARREGAMENTO INICIAL DOS PARTICIPANTES (async)
      process.nextTick(async () => {
        try {
          await sendInitialParticipantsList(socket, roomId);
        } catch (error) {
          console.warn(`⚠️ Erro ao carregar participantes para sala ${roomId}:`, error.message);
        }
      });

      logInfo(`✅ Usuário conectado - Room: ${roomId}, Online: ${onlineCount}`);

    } catch (error) {
      console.error('❌ Erro no user_connect:', error);
      emitError(socket, 'Erro ao conectar usuário', 'CONNECTION_ERROR');
    }
  });

  /**
   * Evento: get_online_users
   * Buscar lista de usuários online na sala
   */
  socket.on('get_online_users', async (data) => {
    try {
      const { roomId } = data || {};
      const session = getUserSession(socket.id);
      const targetRoom = roomId || session?.roomId;

      if (!validateRoomId(targetRoom)) {
        emitError(socket, 'Room ID não encontrado', 'ROOM_ID_NOT_FOUND');
        return;
      }

      const [participants] = await Promise.all([
        getCombinedParticipantsList(targetRoom)
      ]);

      const onlineUserIds = getOnlineUsersForRoom(targetRoom);

      // Filtrar e formatar apenas usuários online de forma otimizada
      const onlineParticipants = participants
        .filter(p => isUserOnline(p.id, targetRoom))
        .map(p => formatUserData(p, true));

      socket.emit('online_users', {
        roomId: targetRoom,
        users: onlineParticipants,
        total: onlineParticipants.length,
        timestamp: new Date().toISOString()
      });

      logDebug(`Lista de usuários online enviada para ${targetRoom}`, {
        count: onlineParticipants.length
      });

    } catch (error) {
      console.error('❌ Erro no get_online_users:', error);
      emitError(socket, 'Erro ao buscar usuários online', 'ONLINE_USERS_ERROR');
    }
  });

  /**
   * Evento: get_participants_list
   * Buscar lista completa de participantes (compatibilidade com sistema legado)
   */
  socket.on('get_participants_list', async (data) => {
    try {
      const { roomId } = data || {};
      const session = getUserSession(socket.id);
      const targetRoom = roomId || session?.roomId;

      if (!validateRoomId(targetRoom)) {
        emitError(socket, 'Room ID não encontrado', 'ROOM_ID_NOT_FOUND');
        return;
      }

      const participants = await getCombinedParticipantsList(targetRoom);
      if (participants && participants.length > 0) {
        console.log(`📋 Enviando lista completa de ${participants.length} participantes para sala ${targetRoom}`);

        // Transformar participantes para o formato esperado pelo frontend
        // Marcar usuários online com base na lista de usuários conectados
        const onlineUserIds = Array.from(onlineUsers.get(targetRoom) || []);
        const formattedUsers = participants.map(participant => {
          const isOnline = onlineUserIds.includes(normalizeUserId(participant.id));
          return formatUserData(participant, isOnline);
        });

        // Emitir evento "user-list" que o frontend espera
        socket.emit('user-list', formattedUsers);

        console.log(`✅ Lista completa enviada - Online: ${onlineUserIds.length}/${participants.length}`);
      } else {
        socket.emit('user-list', []);
      }

    } catch (error) {
      console.error('❌ Erro no get_participants_list:', error);
      socket.emit('error', { message: 'Erro ao buscar lista de participantes' });
    }
  });

  /**
   * Evento: user_activity
   * Atualizar atividade do usuário
   */
  socket.on('user_activity', (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (session) {
        const { roomId } = session;
        const normalizedUserId = normalizeUserId(session.userId);

        updateRoomStats(roomId);

        // Atualizar atividade no serviço de estabilidade
        if (normalizedUserId) {
          userStabilityService.updateUserActivity(normalizedUserId);
        }

        // Notificar outros usuários sobre atividade
        socket.to(roomId).emit('user_activity_update', {
          userId: normalizedUserId,
          activity: data?.activity || 'active',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Erro no user_activity:', error);
    }
  });
}

// ========================================
// SEÇÁO 5: HANDLERS DE CHAT
// ========================================

/**
 * Handler de chat
 */
function chatHandler(socket, io) {

  /**
   * Evento: join
   * Join do usuário na sala (compatível com sistema legado)
   * Parâmetros: nick, extra, userid, sessionItem, sessionFixed, hasPlayer, callback
   * Otimizado para melhor performance e validação
   */
  socket.on('join', async (nick, extra, userid, sessionItem, sessionFixed, hasPlayer, callback) => {
    logDebug('Handler join chamado', {
      nick,
      userid,
      hasCallback: typeof callback === 'function',
      extra: extra ? { uf: extra.uf } : null
    });

    try {
      // Validação inicial de parâmetros
      if (typeof callback !== 'function') {
        logWarning('Join chamado sem callback válido');
        return;
      }

      // Extrair roomId da URL do referrer de forma otimizada
      const roomId = extractRoomIdFromReferer(socket);
      if (!roomId) {
        callback(-1);
        return;
      }

      // Verificar se usuário já está autenticado ou é novo anônimo
      let authenticatedUser = extractAuthenticatedUser(socket, roomId);

      // Se não tem cookie mas forneceu nick e UF, criar usuário anônimo temporário
      if (!authenticatedUser && nick && extra?.uf) {
        console.log('🆕 Criando usuário anônimo temporário para join');

        // Formatação padrão: primeira letra maiúscula, resto minúscula
        const formattedNick = nick.charAt(0).toUpperCase() + nick.slice(1).toLowerCase();

        authenticatedUser = {
          id: `temp_anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          nome: formattedNick,
          apelido: formattedNick,
          level: 0,
          email: '',
          uf: extra.uf.toUpperCase(),
          sexo: null,
          parceiro: "0",
          equipe: null,
          turma: null,
          grupo: null,
          rede: null,
          session_id: `temp_${Date.now()}`,
          isAdmin: false,
          isAnonymous: true,
          isAnonymousParticipant: false,
          anonymous: true,
          isNewAnonymous: true // Flag para indicar que é um novo usuário anônimo
        };
      }

      if (!authenticatedUser) {
        logWarning('Usuário não autenticado tentando fazer join sem nick/UF');
        callback(-1);
        return;
      }

      // Processar usuário guest que quer participar
      if (authenticatedUser.isGuest && nick && extra?.uf) {
        const processedUser = await processGuestJoin(authenticatedUser, nick, extra);
        if (!processedUser) {
          callback(-1);
          return;
        }
        // Atualizar authenticatedUser com dados processados
        Object.assign(authenticatedUser, processedUser);
      }

      // Processar join do usuário
      const joinResult = await processUserJoin(socket, io, authenticatedUser, roomId, userid, sessionItem, sessionFixed, hasPlayer);
      if (!joinResult) {
        callback(-1);
        return;
      }

      // Para usuários anônimos novos, marcar como participante após join bem-sucedido
      if (authenticatedUser.isNewAnonymous) {
        authenticatedUser.isAnonymousParticipant = true;
        console.log(`✅ Usuário anônimo ${authenticatedUser.apelido} marcado como participante após join`);

        // Atualizar a sessão com os dados modificados
        const session = userSessions.get(socket.id);
        if (session) {
          session.userData = authenticatedUser;
          userSessions.set(socket.id, session);
          console.log(`🔄 Sessão atualizada para usuário anônimo ${authenticatedUser.apelido}`);
        }

        // Criar cookie de participante anônimo
        const participantCookieData = {
          session_id: authenticatedUser.session_id,
          ip_address: socket.handshake.address || '127.0.0.1',
          user_agent: socket.handshake.headers['user-agent'] || 'Unknown',
          last_activity: Math.floor(Date.now() / 1000).toString(),
          nick: authenticatedUser.apelido,
          uf: authenticatedUser.uf,
          anonymous: authenticatedUser.session_id
        };

        const participantCookieValue = createBiblos360Cookie(participantCookieData);

        // Enviar cookie para o frontend
        socket.emit('set-anonymous-cookie', {
          name: 'biblos360_anonymous_participant',
          value: participantCookieValue,
          options: {
            maxAge: 24 * 60 * 60 * 1000, // 24 horas
            sameSite: 'lax'
          }
        });
      }

      // Se é um novo usuário anônimo, criar cookie para persistir a sessão
      if (authenticatedUser.isNewAnonymous) {
        try {
          const cookieData = {
            session_id: authenticatedUser.session_id,
            ip_address: socket.handshake.address || socket.conn.remoteAddress || '127.0.0.1',
            user_agent: socket.handshake.headers['user-agent'] || 'Unknown',
            last_activity: Math.floor(Date.now() / 1000).toString(),
            anonymous: authenticatedUser.session_id
          };

          const anonymousCookie = createBiblos360Cookie(cookieData);

          // Enviar instrução para criar cookie no cliente
          socket.emit('set-anonymous-cookie', {
            name: 'biblos360_anonymous_usuario',
            value: encodeURIComponent(anonymousCookie),
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
          });

          console.log(`🍪 Cookie anônimo criado para ${authenticatedUser.apelido} (${authenticatedUser.session_id})`);
        } catch (error) {
          console.error('Erro ao criar cookie anônimo:', error);
        }
      }

      // NOVO: Para usuários anônimos, forçar refresh interno completo após join
      if (authenticatedUser.isNewAnonymous || authenticatedUser.isAnonymousParticipant) {
        console.log(`🔄 Forçando refresh interno completo para usuário anônimo ${authenticatedUser.apelido}`);

        // Aguardar um breve delay para garantir que o join foi processado completamente
        setTimeout(async () => {
          try {
            await forceAnonymousUserRefresh(socket, io, roomId, authenticatedUser);
          } catch (error) {
            console.error('❌ Erro no refresh interno para usuário anônimo:', error);
          }
        }, 100); // 100ms para garantir que tudo foi processado
      }

      // Resposta de sucesso - retornar objeto com userid e nick para o frontend
      callback({
        userid: joinResult.userid,
        nick: authenticatedUser.apelido || authenticatedUser.nome
      });

    } catch (error) {
      logError('Erro no handler join', error);
      if (typeof callback === 'function') {
        callback(-1);
      }
    }
  });

  /**
   * Evento: send_message
   * Enviar mensagem no chat (formato moderno - não usado pelo frontend atual)
   * DESABILITADO para evitar duplicação - usar apenas handler 'message'
   */
  socket.on('send_message', (data) => {
    console.log(`⚠️ Handler 'send_message' chamado mas está DESABILITADO para evitar duplicação`);
    console.log(`   Use o handler 'message' para compatibilidade com frontend legado`);

    return; // Bloquear handler para evitar duplicação
  });

  /**
   * Evento: message (compatível com sistema legado)
   * Enviar mensagem no chat - formato esperado pelo frontend legado
   * Parâmetros: message, replyid, source, item, fixed, callback
   */
  socket.on('message', async (message, replyid, source, item, fixed, callback) => {
    const requestId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    console.log(`🔥 [${requestId}] Handler 'message' chamado! Parâmetros:`, { message, replyid, source, item, fixed, hasCallback: typeof callback === 'function' });
    console.log(`🔍 [${requestId}] DEBUG - Socket ID: ${socket.id}`);

    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        console.warn(`⚠️ [${requestId}] Sessão não encontrada para socket ${socket.id}`);
        if (typeof callback === 'function') {
          callback(null, 'Usuário não conectado');
        }
        return;
      }

      const { roomId, userId, userData } = session;

      // CORREÇÃO: Forçar mensagens de admin sempre para sala 'pub' para unificar chat
      let targetRoomId = roomId;
      if (roomId === 'admin' || roomId === 'chat' || roomId === 'monitor') {
        targetRoomId = 'pub';
        console.log(`� Redirecionando mensagem de admin de sala '${roomId}' para 'pub'`);
      }

      console.log(`�🔍 DEBUG - Dados da sessão:`, {
        roomId: targetRoomId,
        originalRoomId: roomId,
        userId,
        isAnonymous: userData.isAnonymous,
        isAnonymousParticipant: userData.isAnonymousParticipant,
        apelido: userData.apelido,
        nome: userData.nome
      });

      // Bloquear apenas usuários anônimos totais (sem cookie de participante)
      if (userData.isAnonymous && !userData.isAnonymousParticipant) {
        console.log(`🚫 Usuário anônimo total ${userData.apelido} tentou enviar mensagem via handler legado - bloqueado`);
        if (typeof callback === 'function') {
          callback(null, 'Usuários visitantes devem entrar no chat para enviar mensagens');
        }
        return;
      }

      // Log para usuários anônimos participantes
      if (userData.isAnonymous && userData.isAnonymousParticipant) {
        console.log(`✅ Usuário anônimo participante ${userData.apelido} enviou mensagem via handler legado`);
      }

      // Validar mensagem
      if (!message || message.trim().length === 0) {
        console.warn(`⚠️ Mensagem vazia recebida`);
        if (typeof callback === 'function') {
          callback(null, 'Mensagem não pode estar vazia');
        }
        return;
      }

      if (message.length > 500) {
        console.warn(`⚠️ Mensagem muito longa: ${message.length} caracteres`);
        if (typeof callback === 'function') {
          callback(null, 'Mensagem muito longa (máximo 500 caracteres)');
        }
        return;
      }

      // Criar estrutura da mensagem no formato legado
      const now = Date.now();

      // Buscar dados do participante para obter level e outros dados corretos
      let participantData = null;
      try {
        const participantes = await getCombinedParticipantsList(targetRoomId); // CORREÇÃO: usar targetRoomId
        participantData = participantes.find(p => p.id.toString() === userId.toString());

        console.log(`🔍 DEBUG - Buscando participante ID ${userId} na lista combinada:`, {
          encontrado: !!participantData,
          totalParticipantes: participantes.length,
          isAnonymous: userData.isAnonymous
        });
      } catch (error) {
        console.warn(`⚠️ Erro ao buscar participantes: ${error.message}`);
      }

      // Corrigir problema do nick: usar dados específicos baseado no tipo de usuário
      let nickName;

      if (userData.isAnonymous && userData.isAnonymousParticipant) {
        // Para usuários anônimos participantes, usar o nome que foi definido no join
        nickName = userData.apelido || userData.nome || 'Visitante';
        console.log(`🔍 DEBUG - Nick do anônimo participante: ${nickName}`);
      } else {
        // Para usuários normais, usar lógica original
        nickName = userData.apelido || (userData.nome ? userData.nome.split(' ')[0] : 'Usuário');
        if (nickName.includes('+')) {
          // Converter nomes URL-encoded para formato limpo (ex: "Nome+Sobrenome" para "Nome")
          nickName = decodeURIComponent(nickName.replace(/\+/g, ' ')).split(' ')[0];
        }

        // Usar nick do participantes.json se disponível (prioridade máxima)
        if (participantData?.nick) {
          nickName = participantData.nick;
          console.log(`🔍 DEBUG MESSAGE - Usando nick do participantes.json: ${nickName}`);
        } else {
          console.log(`⚠️ DEBUG MESSAGE - participantData.nick não encontrado:`, {
            participantData: participantData ? 'existe' : 'não existe',
            nick: participantData?.nick,
            userId,
            nickName_atual: nickName
          });
        }
      }

      // Processar reply se fornecido
      let replyData = {};
      if (replyid && parseInt(replyid) > 0) {
        try {
          // Carregar mensagens para buscar a mensagem sendo respondida
          const messagesPath = path.join(__dirname, '../../../api/messages.json');
          const existingData = await fs.readFile(messagesPath, 'utf8');
          const existingMessages = JSON.parse(existingData);

          const replyMessage = existingMessages.find(msg => msg.msgid == parseInt(replyid));
          if (replyMessage) {
            replyData = {
              replyid: parseInt(replyid),
              reply_nick: replyMessage.nick,
              reply_message: replyMessage.message,
              reply_message_html: replyMessage.message_html || replyMessage.message,
              reply_hidden: replyMessage.hidden || 0
            };
            console.log(`💬 Reply detectado - MsgID: ${replyid}, Nick: ${replyMessage.nick}`);
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao processar reply: ${error.message}`);
        }
      }

      const messageData = {
        msgid: now, // ID único baseado em timestamp em ms
        userid: userId.toString(),
        groupid: null,
        room: `ev:${targetRoomId}`, // CORREÇÃO: usar targetRoomId para unificar
        nick: nickName,
        message: message.trim(),
        message_html: message.trim(), // Pode ser processado para HTML mais tarde
        source: source || '',
        item: parseInt(item) || 0,
        ts: Math.floor(now / 1000), // Timestamp Unix em segundos
        hidden: 0,
        level: participantData?.level || userData.level || 0,
        favorited: 0,
        marked: 0,
        // Adicionar dados de reply se existirem
        ...replyData,
        extra: {
          extid: userId.toString(),
          uf: participantData?.uf || userData.uf || 'BR',
          sexo: userData.isAnonymous && userData.isAnonymousParticipant ? 0 : (participantData?.sexo || userData.sexo || 1), // CORREÇÃO: sexo 0 para anônimos
          parceiro: (participantData?.parceiro === '1' || participantData?.parceiro === 1) ? 1 : ((userData.parceiro === '1' || userData.parceiro === 1) ? 1 : 0),
          equipe: participantData?.equipe || userData.equipe || null,
          turma: participantData?.turma || userData.turma || null,
          grupo: participantData?.grupo || userData.grupo || null,
          rede: participantData?.rede || userData.rede || null
        }
      };

      console.log(`💬 [${requestId}] Salvando mensagem - Room: ${targetRoomId}, User: ${userId}, Mensagem: "${message.substring(0, 50)}..."`);

      // SISTEMA ANTI-DUPLICAÇÃO: Verificar se mensagem já foi processada
      if (isMessageDuplicate(messageData.msgid)) {
        console.log(`🚫 [${requestId}] Bloqueando duplicação da mensagem ${messageData.msgid}`);
        if (typeof callback === 'function') {
          callback(null, null); // Retorna sucesso para não confundir o frontend
        }
        return;
      }

      // Marcar mensagem como processada ANTES de salvar para evitar race conditions
      markMessageAsEmitted(messageData.msgid);

      // Salvar mensagem no arquivo JSON
      try {
        // CORREÇÃO: Determinar o arquivo correto baseado no item
        let messagesPath;
        const isForumMessage = parseInt(item) === 1111;

        if (isForumMessage) {
          // Mensagens do fórum (item 1111) devem ser salvas no arquivo específico do fórum
          messagesPath = path.join(__dirname, `../public/vr/${targetRoomId}/forum/api/messages.json`);
          console.log(`📝 [${requestId}] Salvando mensagem do FÓRUM no arquivo: ${messagesPath}`);
        } else {
          // Mensagens normais do chat continuam no arquivo geral
          messagesPath = path.join(__dirname, '../../../api/messages.json');
          console.log(`📝 [${requestId}] Salvando mensagem do CHAT no arquivo: ${messagesPath}`);
        }

        let messages = [];

        // Carregar mensagens existentes
        try {
          const existingData = await fs.readFile(messagesPath, 'utf8');
          messages = JSON.parse(existingData);
        } catch (error) {
          console.log(`📝 Criando novo arquivo de mensagens para sala ${targetRoomId}`);

          // Se for mensagem do fórum, garantir que o diretório existe
          if (isForumMessage) {
            const forumApiDir = path.dirname(messagesPath);
            await fs.mkdir(forumApiDir, { recursive: true });
            console.log(`📁 Diretório do fórum criado: ${forumApiDir}`);
          }

          messages = [];
        }

        // Adicionar nova mensagem
        messages.push(messageData);

        // Verificação adicional: remover duplicatas que possam ter sido inseridas por race conditions
        const uniqueMessages = messages.filter((msg, index, self) =>
          index === self.findIndex(m => m.msgid === msg.msgid)
        );

        if (uniqueMessages.length < messages.length) {
          console.log(`🔧 Removidas ${messages.length - uniqueMessages.length} mensagens duplicadas durante salvamento`);
          messages = uniqueMessages;
        }

        // Manter apenas as últimas 1000 mensagens (para não sobrecarregar)
        if (messages.length > 1000) {
          messages = messages.slice(-1000);
        }

        // Salvar arquivo atualizado
        await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2), 'utf8');

        console.log(`✅ [${requestId}] Mensagem salva com sucesso - MsgID: ${messageData.msgid}`);

        // VERIFICAR SE É UM VOTO EM ENQUETE ATIVA
        const isVote = processUserVote(io, userId, targetRoomId, message);
        if (isVote) {
          console.log(`🗳️ [${requestId}] Mensagem processada como voto na enquete`);
        }

        // CORREÇÃO: Emitir mensagem apenas uma vez para todos na sala usando o evento correto
        // O frontend espera o evento 'message' com dados no formato legado
        console.log(`📢 [${requestId}] Emitindo mensagem para sala ${targetRoomId} - MsgID: ${messageData.msgid}`);
        io.to(targetRoomId).emit('message', messageData);

        // ADIÇÃO PARA ANTI-DUPLICAÇÃO: Marcar timestamp de envio de mensagem
        const cacheKey = `${userId}:${targetRoomId.replace('ev:', '')}`;
        const now = Date.now();

        recentMessageCache.set(cacheKey, {
          timestamp: now
        });

        console.log(`🔄 [ANTI-DUP] Marcado envio de mensagem para usuário ${userId} às ${now}`);

        // CORREÇÃO: Callback apenas confirma sucesso, não retorna a mensagem (evita duplicação)
        // Frontend espera: callback(message, error) - se message não for null, pode causar duplicação
        if (typeof callback === 'function') {
          callback(null, null); // Apenas confirmação de sucesso sem dados
        }

      } catch (error) {
        console.error(`❌ Erro ao salvar mensagem:`, error);
        if (typeof callback === 'function') {
          callback(null, 'Erro ao salvar mensagem');
        }
      }

    } catch (error) {
      console.error('❌ Erro no handler message:', error);
      if (typeof callback === 'function') {
        callback(null, 'Erro interno do servidor');
      }
    }
  });

  /**
   * Evento: message-remove
   * Soft delete de mensagem (compatível com sistema legado)
   */
  socket.on('message-remove', async (msgid) => {
    console.log(`🗑️ Handler 'message-remove' chamado! MsgID: ${msgid}`);

    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        console.warn(`⚠️ Sessão não encontrada para socket ${socket.id}`);
        return;
      }

      const { roomId, userId, userData } = session;

      // Verificar se o usuário tem permissão para remover mensagens
      // Level 1-3 podem remover qualquer mensagem, Level 0 apenas suas próprias
      const userLevel = userData.level || 0;

      console.log(`🔍 Tentativa de remoção - User: ${userId}, Level: ${userLevel}, MsgID: ${msgid}`);

      // Carregar mensagens para encontrar a mensagem específica
      const messagesPath = path.join(__dirname, '../../../api/messages.json');
      let messages = [];

      try {
        const messagesData = await fs.readFile(messagesPath, 'utf8');
        messages = JSON.parse(messagesData);
      } catch (error) {
        console.warn(`Mensagens não encontradas para sala ${roomId}:`, error.message);
        return;
      }

      // Encontrar a mensagem pelo ID
      const messageIndex = messages.findIndex(msg => msg.msgid == msgid);

      if (messageIndex === -1) {
        console.warn(`⚠️ Mensagem não encontrada: ${msgid}`);
        return;
      }

      const targetMessage = messages[messageIndex];

      // Verificar permissões
      const canRemove = userLevel >= 1 || targetMessage.userid === userId.toString();

      if (!canRemove) {
        console.warn(`⚠️ Usuário ${userId} (level ${userLevel}) não tem permissão para remover mensagem de ${targetMessage.userid}`);
        return;
      }

      // Fazer soft delete (marcar como hidden = 1)
      messages[messageIndex].hidden = 1;

      // Salvar arquivo atualizado
      await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2), 'utf8');

      console.log(`✅ Mensagem ${msgid} marcada como hidden por usuário ${userId} (level ${userLevel})`);

      // Notificar todos os usuários na sala sobre a remoção
      io.to(roomId).emit('message-hidden', msgid);

    } catch (error) {
      console.error('❌ Erro no handler message-remove:', error);
    }
  });

  /**
   * Evento: message-restore
   * Restaurar mensagem removida (compatível com sistema legado)
   */
  socket.on('message-restore', async (msgid) => {
    console.log(`🔄 Handler 'message-restore' chamado! MsgID: ${msgid}`);

    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        console.warn(`⚠️ Sessão não encontrada para socket ${socket.id}`);
        return;
      }

      const { roomId, userId, userData } = session;
      const userLevel = userData.level || 0;

      console.log(`🔍 Tentativa de restauração - User: ${userId}, Level: ${userLevel}, MsgID: ${msgid}`);

      // Carregar mensagens para encontrar a mensagem específica
      const messagesPath = path.join(__dirname, '../../../api/messages.json');
      let messages = [];

      try {
        const messagesData = await fs.readFile(messagesPath, 'utf8');
        messages = JSON.parse(messagesData);
      } catch (error) {
        console.warn(`Mensagens não encontradas para sala ${roomId}:`, error.message);
        return;
      }

      // Encontrar a mensagem pelo ID
      const messageIndex = messages.findIndex(msg => msg.msgid == msgid);

      if (messageIndex === -1) {
        console.warn(`⚠️ Mensagem não encontrada: ${msgid}`);
        return;
      }

      const targetMessage = messages[messageIndex];

      // Verificar permissões: próprio usuário OU níveis superiores (1,2,3)
      const canRestore = userLevel >= 1 || targetMessage.userid === userId.toString();

      if (!canRestore) {
        console.warn(`⚠️ Usuário ${userId} (level ${userLevel}) não tem permissão para restaurar mensagem de ${targetMessage.userid}`);
        return;
      }

      // Restaurar mensagem (marcar como hidden = 0)
      messages[messageIndex].hidden = 0;

      // Salvar arquivo atualizado
      await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2), 'utf8');

      console.log(`✅ Mensagem ${msgid} restaurada por usuário ${userId} (level ${userLevel})`);

      // Notificar todos os usuários na sala sobre a restauração
      io.to(roomId).emit('message-restored', msgid);

    } catch (error) {
      console.error('❌ Erro no handler message-restore:', error);
    }
  });

  /**
   * Evento: message-mark
   * Marcar mensagem como destacada (compatível com sistema legado)
   */
  socket.on('message-mark', async (msgid) => {
    console.log(`🏷️ Handler 'message-mark' chamado! MsgID: ${msgid}`);

    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        console.warn(`⚠️ Sessão não encontrada para socket ${socket.id}`);
        return;
      }

      const { roomId, userId, userData } = session;
      const userLevel = userData.level || 0;

      console.log(`🔍 Tentativa de marcação - User: ${userId}, Level: ${userLevel}, MsgID: ${msgid}`);

      // Verificar se o usuário tem permissão para marcar mensagens (apenas admins level 1+)
      if (userLevel < 1) {
        console.warn(`⚠️ Usuário ${userId} (level ${userLevel}) não tem permissão para marcar mensagens`);
        return;
      }

      // Carregar mensagens para encontrar a mensagem específica
      const messagesPath = path.join(__dirname, '../../../api/messages.json');
      let messages = [];

      try {
        const messagesData = await fs.readFile(messagesPath, 'utf8');
        messages = JSON.parse(messagesData);
      } catch (error) {
        console.warn(`Mensagens não encontradas para sala ${roomId}:`, error.message);
        return;
      }

      // Encontrar a mensagem pelo ID
      const messageIndex = messages.findIndex(msg => msg.msgid == msgid);

      if (messageIndex === -1) {
        console.warn(`⚠️ Mensagem não encontrada: ${msgid}`);
        return;
      }

      // Marcar mensagem (marked = 1)
      messages[messageIndex].marked = 1;

      // Salvar arquivo atualizado
      await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2), 'utf8');

      console.log(`✅ Mensagem ${msgid} marcada por usuário ${userId} (level ${userLevel})`);

      // Notificar todos os usuários na sala sobre a marcação
      io.to(roomId).emit('marked', msgid);

    } catch (error) {
      console.error('❌ Erro no handler message-mark:', error);
    }
  });

  /**
   * Evento: message-unmark
   * Desmarcar mensagem destacada (compatível com sistema legado)
   */
  socket.on('message-unmark', async (msgid) => {
    console.log(`🏷️ Handler 'message-unmark' chamado! MsgID: ${msgid}`);

    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        console.warn(`⚠️ Sessão não encontrada para socket ${socket.id}`);
        return;
      }

      const { roomId, userId, userData } = session;
      const userLevel = userData.level || 0;

      console.log(`🔍 Tentativa de desmarcação - User: ${userId}, Level: ${userLevel}, MsgID: ${msgid}`);

      // Verificar se o usuário tem permissão para desmarcar mensagens (apenas admins level 1+)
      if (userLevel < 1) {
        console.warn(`⚠️ Usuário ${userId} (level ${userLevel}) não tem permissão para desmarcar mensagens`);
        return;
      }

      // Carregar mensagens para encontrar a mensagem específica
      const messagesPath = path.join(__dirname, '../../../api/messages.json');
      let messages = [];

      try {
        const messagesData = await fs.readFile(messagesPath, 'utf8');
        messages = JSON.parse(messagesData);
      } catch (error) {
        console.warn(`Mensagens não encontradas para sala ${roomId}:`, error.message);
        return;
      }

      // Encontrar a mensagem pelo ID
      const messageIndex = messages.findIndex(msg => msg.msgid == msgid);

      if (messageIndex === -1) {
        console.warn(`⚠️ Mensagem não encontrada: ${msgid}`);
        return;
      }

      // Desmarcar mensagem (marked = 0)
      messages[messageIndex].marked = 0;

      // Salvar arquivo atualizado
      await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2), 'utf8');

      console.log(`✅ Mensagem ${msgid} desmarcada por usuário ${userId} (level ${userLevel})`);

      // Notificar todos os usuários na sala sobre a desmarcação
      io.to(roomId).emit('unmarked', msgid);

    } catch (error) {
      console.error('❌ Erro no handler message-unmark:', error);
    }
  });

  /**
   * Evento: message-favorite
   * Favoritar mensagem para exibição no overlay (compatível com sistema legado)
   */
  socket.on('message-favorite', async (msgid) => {
    console.log(`⭐ Handler 'message-favorite' chamado! MsgID: ${msgid}`);

    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        console.warn(`⚠️ Sessão não encontrada para socket ${socket.id}`);
        return;
      }

      const { roomId, userId, userData } = session;
      const userLevel = userData.level || 0;

      console.log(`🔍 Tentativa de favoritar - User: ${userId}, Level: ${userLevel}, MsgID: ${msgid}`);

      // Verificar se o usuário tem permissão para favoritar mensagens (apenas admins level 1+)
      if (userLevel < 1) {
        console.warn(`⚠️ Usuário ${userId} (level ${userLevel}) não tem permissão para favoritar mensagens`);
        return;
      }

      // Carregar mensagens
      const messagesPath = path.join(__dirname, '../../../api/messages.json');
      let messages = [];

      try {
        const messagesData = await fs.readFile(messagesPath, 'utf8');
        messages = JSON.parse(messagesData);
      } catch (error) {
        console.warn(`Mensagens não encontradas para sala ${roomId}:`, error.message);
        return;
      }

      // Se msgid = 0, limpar todos os favoritos
      if (msgid === 0 || msgid === '0') {
        console.log(`🧹 Limpando todos os favoritos por usuário ${userId}`);

        // Remover favorited de todas as mensagens
        let favoritosLimpos = 0;
        messages.forEach(msg => {
          if (msg.favorited === 1) {
            msg.favorited = 0;
            favoritosLimpos++;
          }
        });

        // Salvar arquivo atualizado
        await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2), 'utf8');

        console.log(`✅ ${favoritosLimpos} favoritos removidos por usuário ${userId} (level ${userLevel})`);

        // Notificar todos os usuários na sala que não há mais favoritos
        io.to(roomId).emit('favorited', null);

        return;
      }

      // Encontrar a mensagem pelo ID para favoritar
      const messageIndex = messages.findIndex(msg => msg.msgid == msgid);

      if (messageIndex === -1) {
        console.warn(`⚠️ Mensagem não encontrada: ${msgid}`);
        return;
      }

      const targetMessage = messages[messageIndex];

      // Primeiro, limpar todos os outros favoritos (só pode ter 1 favorito por vez)
      messages.forEach(msg => {
        if (msg.favorited === 1) {
          msg.favorited = 0;
        }
      });

      // Favoritar a mensagem atual
      messages[messageIndex].favorited = 1;

      // Salvar arquivo atualizado
      await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2), 'utf8');

      console.log(`✅ Mensagem ${msgid} favoritada por usuário ${userId} (level ${userLevel})`);

      // Notificar todos os usuários na sala sobre a nova mensagem favorita
      // Enviar dados completos da mensagem para exibição no overlay
      io.to(roomId).emit('favorited', {
        msgid: targetMessage.msgid,
        userid: targetMessage.userid,
        groupid: targetMessage.groupid,
        room: targetMessage.room,
        nick: targetMessage.nick,
        message: targetMessage.message,
        message_html: targetMessage.message_html || targetMessage.message,
        source: targetMessage.source || '',
        item: targetMessage.item || 0,
        ts: targetMessage.ts,
        hidden: targetMessage.hidden || 0,
        level: targetMessage.level || 0,
        favorited: 1, // Garantir que está marcado como favorited
        marked: targetMessage.marked || 0,
        extra: targetMessage.extra || {}
      });

    } catch (error) {
      console.error('❌ Erro no handler message-favorite:', error);
    }
  });

  /**
   * Evento: get_chat_history
   * Buscar histórico de mensagens
   */
  socket.on('get_chat_history', async (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      const { roomId } = session;
      const { limit = 50, forum = false } = data || {};

      // Carregar mensagens reais
      let messages = [];
      try {
        let messagesPath;
        if (forum) {
          messagesPath = path.join(__dirname, `../public/vr/${roomId}/forum/api/messages.json`);
        } else {
          messagesPath = path.join(__dirname, '../../../api/messages.json');
        }

        const messagesData = await fs.readFile(messagesPath, 'utf8');
        let allMessages = JSON.parse(messagesData);

        // CORREÇÁO: Aplicar filtro de mensagens hidden baseado no nível do usuário
        const userLevel = session.userData?.level || 0;

        // Filtrar mensagens hidden para usuários comuns (level 0)
        // Moderadores e admins (level 1-3) veem todas as mensagens
        messages = allMessages.filter(msg => {
          const isHidden = msg.hidden === 1;
          return !isHidden || userLevel >= 1;
        });

        // Ordenar por timestamp (mais recentes primeiro)
        messages.sort((a, b) => b.ts - a.ts);

        // Limitar quantidade
        if (limit > 0) {
          messages = messages.slice(0, limit);
        }

      } catch (error) {
        console.warn(`Mensagens não encontradas para sala ${roomId}:`, error.message);
        messages = [];
      }

      socket.emit('chat_history', {
        roomId: roomId,
        messages: messages,
        total: messages.length,
        limit: limit,
        forum: forum,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Erro no get_chat_history:', error);
      socket.emit('error', { message: 'Erro ao buscar histórico' });
    }
  });

  /**
   * Evento: messages
   * Carrega mensagens do chat (compatível com sistema legado)
   * Parâmetros: item, msgid, exact, latest, callback
   */
  socket.on('messages', async (item, msgid, exact, latest, callback) => {
    console.log(`🔥 Handler 'messages' chamado! Parâmetros:`, { item, msgid, exact, latest, hasCallback: typeof callback === 'function' });

    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        console.warn(`⚠️ Sessão não encontrada para socket ${socket.id}`);
        if (typeof callback === 'function') {
          callback([]);
        }
        return;
      }

      const { roomId } = session;

      console.log(`🔍 Carregando mensagens - Room: ${roomId}, Item: ${item}, MsgId: ${msgid}, Exact: ${exact}, Latest: ${latest}`);
      console.log(`🔍 DEBUG - Dados da sessão:`, {
        userId: session.userId,
        userLevel: session.userData?.level,
        isAnonymous: session.userData?.isAnonymous,
        isAnonymousParticipant: session.userData?.isAnonymousParticipant,
        nome: session.userData?.nome,
        apelido: session.userData?.apelido
      });

      // Carregar mensagens do arquivo JSON
      let messages = [];
      try {
        // CORREÇÃO: Determinar o arquivo correto baseado no item
        let messagesPath;
        const isForumMessage = parseInt(item) === 1111;

        if (isForumMessage) {
          // Mensagens do fórum (item 1111) devem ser carregadas do arquivo específico do fórum
          messagesPath = path.join(__dirname, `../public/vr/${roomId}/forum/api/messages.json`);
          console.log(`📝 [HANDLER MESSAGES] Carregando mensagens do FÓRUM: ${messagesPath}`);
        } else {
          // Mensagens normais do chat continuam no arquivo geral
          messagesPath = path.join(__dirname, '../../../api/messages.json');
          console.log(`📝 [HANDLER MESSAGES] Carregando mensagens do CHAT: ${messagesPath}`);
        }

        const messagesData = await fs.readFile(messagesPath, 'utf8');
        const allMessages = JSON.parse(messagesData);

        // CORREÇÃO PRINCIPAL: Filtrar mensagens da sala e item
        messages = allMessages.filter(msg => {
          const matchesRoom = !msg.room ||
            msg.room === `ev:${roomId}` ||
            msg.room_id === roomId ||
            msg.room === roomId;

          const matchesItem = item === 0 || msg.item === item;

          // CORREÇÃO: Permitir que usuários públicos vejam mensagens não-ocultas
          // Mensagens hidden devem aparecer apenas para moderadores (level 1-3)
          const isHidden = msg.hidden === 1;
          const userLevel = session.userData?.level || 0;

          // IMPORTANTE: Usuários públicos (level 0) devem ver mensagens com hidden: 0
          // Apenas mensagens com hidden: 1 devem ser filtradas para level 0
          const showMessage = !isHidden || userLevel >= 1;

          const shouldInclude = matchesRoom && matchesItem && showMessage;

          // Log detalhado apenas para mensagens filtradas para debug
          if (!shouldInclude && matchesRoom && matchesItem) {
            console.log(`🔍 Mensagem ${msg.msgid} filtrada por hidden: hidden=${isHidden}, level=${userLevel}, showMessage=${showMessage}`);
          }

          return shouldInclude;
        });

        console.log(`📊 Filtro de mensagens - Total: ${allMessages.length}, Room matches: ${allMessages.filter(msg => !msg.room || msg.room === 'ev:' + roomId || msg.room_id === roomId || msg.room === roomId).length}, Filtradas final: ${messages.length}, Room: ${roomId}, UserLevel: ${session.userData?.level || 0}`);

        // Log adicional para debug de usuários públicos
        if (session.userData?.isAnonymous || (session.userData?.level || 0) === 0) {
          const roomMessages = allMessages.filter(msg => !msg.room || msg.room === 'ev:' + roomId || msg.room_id === roomId || msg.room === roomId);
          const hiddenMessages = roomMessages.filter(msg => msg.hidden === 1);
          const visibleMessages = roomMessages.filter(msg => msg.hidden !== 1);
          console.log(`🔍 DEBUG USUÁRIO PÚBLICO - Room: ${roomId}, Total room: ${roomMessages.length}, Hidden: ${hiddenMessages.length}, Visible: ${visibleMessages.length}, Final: ${messages.length}`);
        }

        // Ordenar por timestamp
        messages.sort((a, b) => (a.ts || 0) - (b.ts || 0));

        // Se msgid específico foi solicitado
        if (msgid > 0) {
          if (exact) {
            // Retornar mensagem exata
            const targetMessage = messages.find(msg => msg.msgid === msgid);
            if (targetMessage) {
              messages = [targetMessage];
              console.log(`🎯 Mensagem exata encontrada: ${msgid}`);
            } else {
              // CORREÇÃO: Se mensagem específica não existe, retornar as últimas mensagens
              console.log(`⚠️ Mensagem específica ${msgid} não encontrada, retornando últimas mensagens`);
              if (messages.length > 40) {
                messages = messages.slice(-40);
              }
            }
          } else {
            // Retornar mensagens ao redor do msgid
            const targetIndex = messages.findIndex(msg => msg.msgid === msgid);
            if (targetIndex >= 0) {
              const start = Math.max(0, targetIndex - 20);
              const end = Math.min(messages.length, targetIndex + 21);
              messages = messages.slice(start, end);
            } else {
              // Se não encontrar, retornar as últimas mensagens
              console.log(`⚠️ Mensagem ${msgid} não encontrada para contexto, retornando últimas mensagens`);
              if (messages.length > 40) {
                messages = messages.slice(-40);
              }
            }
          }
        } else if (latest && messages.length > 40) {
          // Retornar últimas mensagens
          messages = messages.slice(-40);
        } else if (messages.length > 40) {
          // Retornar primeiras mensagens
          messages = messages.slice(0, 40);
        }

      } catch (error) {
        console.warn(`Mensagens não encontradas para sala ${roomId}:`, error.message);
        messages = [];
      }

      console.log(`📨 Retornando ${messages.length} mensagens para room ${roomId}`);

      // Chamar callback com as mensagens (formato esperado pelo frontend)
      if (typeof callback === 'function') {
        console.log(`📞 Executando callback para ${messages.length} mensagens`);
        callback(messages);
      } else {
        console.log(`📡 Emitindo mensagens para socket ${socket.id}`);
        socket.emit('messages_loaded', messages);
      }

    } catch (error) {
      console.error('❌ Erro no handler messages:', error);
      if (typeof callback === 'function') {
        callback([]);
      }
    }
  });

  /**
   * Handler: update-unread-count
   * Retorna contagem de mensagens para carregamento inicial
   * Essencial para o funcionamento do fórum
   */
  socket.on('update-unread-count', async (sessionItem, callback) => {
    console.log(`🔥 Handler 'update-unread-count' chamado! SessionItem: ${sessionItem}, HasCallback: ${typeof callback === 'function'}`);

    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        console.warn(`⚠️ Sessão não encontrada para socket ${socket.id}`);
        if (typeof callback === 'function') {
          callback({ count: 0, unread: 0, last: 0, item: 0 });
        }
        return;
      }

      const { roomId } = session;
      const isForumItem = parseInt(sessionItem) === 1111;
      console.log(`🔍 [UPDATE-UNREAD-COUNT] Room: ${roomId}, SessionItem: ${sessionItem}, IsForumItem: ${isForumItem}`);

      // Determinar arquivo correto baseado no item
      let messagesPath;
      if (isForumItem) {
        messagesPath = path.join(__dirname, `../public/vr/${roomId}/forum/api/messages.json`);
        console.log(`📝 [UPDATE-UNREAD-COUNT] Carregando mensagens do FÓRUM: ${messagesPath}`);
      } else {
        messagesPath = path.join(__dirname, '../../../api/messages.json');
        console.log(`📝 [UPDATE-UNREAD-COUNT] Carregando mensagens do CHAT: ${messagesPath}`);
      }

      let messages = [];
      let lastMessageTime = 0;

      try {
        const messagesData = await fs.readFile(messagesPath, 'utf8');
        const allMessages = JSON.parse(messagesData);

        // Filtrar mensagens específicas do item (para fórum)
        if (isForumItem) {
          messages = allMessages.filter(msg => {
            const msgItem = parseInt(msg.item);
            return msgItem === 1111; // Apenas mensagens do fórum
          });
        } else {
          messages = allMessages.filter(msg => {
            const msgRoom = msg.room || '';
            return msgRoom === roomId || msgRoom === `ev:${roomId}`;
          });
        }

        // Obter timestamp da última mensagem
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          lastMessageTime = lastMessage.msgid || lastMessage.ts || 0;
        }

      } catch (error) {
        console.log(`📝 [UPDATE-UNREAD-COUNT] Arquivo não encontrado ou vazio: ${messagesPath}`);
        messages = [];
      }

      console.log(`📊 [UPDATE-UNREAD-COUNT] Total mensagens filtradas: ${messages.length} para sessionItem: ${sessionItem}`);

      const response = {
        count: messages.length,
        unread: 0, // Por enquanto, sem controle de não lidas
        last: lastMessageTime,
        item: parseInt(sessionItem) || 0
      };

      console.log(`📤 [UPDATE-UNREAD-COUNT] Retornando dados:`, response);

      if (typeof callback === 'function') {
        callback(response);
      }

    } catch (error) {
      console.error('❌ Erro no handler update-unread-count:', error);
      if (typeof callback === 'function') {
        callback({ count: 0, unread: 0, last: 0, item: 0 });
      }
    }
  });

}/**
 * Força refresh interno completo para usuários anônimos após join
 * Garante que recebam todos os dados necessários sem precisar de reload de página
 */
async function forceAnonymousUserRefresh(socket, io, roomId, userData) {
  try {
    console.log(`🔄 [REFRESH ANÔNIMO] Iniciando refresh completo para ${userData.apelido} na sala ${roomId}`);

    // 1. Forçar reset do cache de status inicial
    if (socket.initialStatusSent) {
      delete socket.initialStatusSent;
      console.log(`🔄 [REFRESH ANÔNIMO] Cache de status inicial resetado`);
    }

    // 2. Forçar verificação e envio do status da sala (online/offline + liveplayer)
    try {
      const { isOnline: fileIsOnline, streamUrl: fileStreamUrl } = await getRoomStatusFromFile(roomId);

      if (fileIsOnline) {
        socket.emit('online', fileStreamUrl);
        console.log(`🟢 [REFRESH ANÔNIMO] Status ONLINE enviado: ${fileStreamUrl}`);
      } else {
        socket.emit('offline');
        console.log(`⚫ [REFRESH ANÔNIMO] Status OFFLINE enviado`);
      }
    } catch (statusError) {
      console.warn(`⚠️ [REFRESH ANÔNIMO] Erro ao verificar status da sala:`, statusError.message);
    }

    // 3. Forçar verificação e envio do status do chat (enabled/disabled)
    try {
      const roomPath = path.join(__dirname, '../../../api/room.json');
      let roomData = {};
      let isChatEnabled = true; // Default: chat habilitado

      try {
        roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));
        if (roomData.config && typeof roomData.config.chat_enabled === 'boolean') {
          isChatEnabled = roomData.config.chat_enabled;
        }
      } catch (fileError) {
        console.log(`📁 [REFRESH ANÔNIMO] Arquivo room.json não encontrado, assumindo chat habilitado`);
      }

      if (isChatEnabled) {
        socket.emit('enabled');
        console.log(`💬 [REFRESH ANÔNIMO] Chat ATIVADO enviado`);
      } else {
        socket.emit('disabled');
        console.log(`💬 [REFRESH ANÔNIMO] Chat DESATIVADO enviado`);
      }
    } catch (chatError) {
      console.warn(`⚠️ [REFRESH ANÔNIMO] Erro ao verificar status do chat:`, chatError.message);
      socket.emit('enabled'); // Fallback: chat habilitado
    }

    // 4. Forçar carregamento das mensagens existentes do chat
    try {
      await loadMessagesForUser(socket, roomId, 0, 0, false, true, (messages) => {
        if (messages && messages.length > 0) {
          console.log(`📨 [REFRESH ANÔNIMO] ${messages.length} mensagens carregadas e enviadas`);

          // Emitir cada mensagem individualmente para garantir compatibilidade
          messages.forEach((msg, index) => {
            setTimeout(() => {
              socket.emit('message', msg);
            }, index * 10); // Pequeno delay entre mensagens para evitar spam
          });
        } else {
          console.log(`📭 [REFRESH ANÔNIMO] Nenhuma mensagem encontrada`);
        }
      });
    } catch (messagesError) {
      console.warn(`⚠️ [REFRESH ANÔNIMO] Erro ao carregar mensagens:`, messagesError.message);
    }

    // 5. Forçar atualização da lista de participantes
    try {
      await sendInitialParticipantsList(socket, roomId);
      console.log(`👥 [REFRESH ANÔNIMO] Lista de participantes atualizada`);
    } catch (participantsError) {
      console.warn(`⚠️ [REFRESH ANÔNIMO] Erro ao atualizar participantes:`, participantsError.message);
    }

    // 6. Verificar e enviar estados de interações ativas (enquetes, avaliações, etc.)
    try {
      // Verificar enquete ativa
      const activePoll = activePolls.get(roomId);
      if (activePoll) {
        socket.emit('poll-start', {
          question: activePoll.question,
          answers: activePoll.answers,
          startTime: activePoll.startTime
        });
        console.log(`📊 [REFRESH ANÔNIMO] Enquete ativa enviada`);
      }

      // Verificar checkin ativo
      const checkinActive = checkinStates.get(roomId);
      if (checkinActive) {
        socket.emit('checkin-start');
        console.log(`✅ [REFRESH ANÔNIMO] Checkin ativo enviado`);
      }

      // Verificar popup ativo
      const popupActive = popupStates.get(roomId);
      if (popupActive) {
        socket.emit('popup-show', popupActive);
        console.log(`🔔 [REFRESH ANÔNIMO] Popup ativo enviado`);
      }

    } catch (interactionsError) {
      console.warn(`⚠️ [REFRESH ANÔNIMO] Erro ao verificar interações:`, interactionsError.message);
    }

    // 7. Emitir evento especial para indicar que o refresh foi concluído
    socket.emit('anonymous-refresh-complete', {
      message: 'Dados carregados com sucesso',
      timestamp: new Date().toISOString(),
      user: userData.apelido
    });

    console.log(`✅ [REFRESH ANÔNIMO] Refresh completo finalizado para ${userData.apelido}`);

  } catch (error) {
    console.error(`❌ [REFRESH ANÔNIMO] Erro geral no refresh para ${userData.apelido}:`, error);

    // Enviar evento de erro para o usuário
    socket.emit('anonymous-refresh-error', {
      message: 'Erro ao carregar dados da sala',
      error: error.message
    });
  }
}

/**
 * Função auxiliar para carregar mensagens de um usuário
 */
async function loadMessagesForUser(socket, roomId, item, msgid, exact, latest, callback) {
  try {
    console.log(`🔍 loadMessagesForUser - Room: ${roomId}, Item: ${item}, MsgId: ${msgid}, Exact: ${exact}, Latest: ${latest}`);

    // Carregar mensagens do arquivo JSON
    let messages = [];
    try {
      const messagesPath = path.join(__dirname, '../../../api/messages.json');
      const messagesData = await fs.readFile(messagesPath, 'utf8');
      const allMessages = JSON.parse(messagesData);

      console.log(`📄 Arquivo encontrado com ${allMessages.length} mensagens totais`);

      // Filtrar mensagens da sala e item
      messages = allMessages.filter(msg => {
        const matchesRoom = !msg.room ||
          msg.room === `ev:${roomId}` ||
          msg.room_id === roomId ||
          msg.room === roomId;

        const matchesItem = item === 0 || msg.item === item;

        return matchesRoom && matchesItem;
      });

      console.log(`🎯 ${messages.length} mensagens filtradas para room ${roomId}, item ${item}`);

      // Ordenar por timestamp
      messages.sort((a, b) => (a.ts || 0) - (b.ts || 0));

      // Se msgid específico foi solicitado
      if (msgid > 0) {
        if (exact) {
          // Retornar mensagem exata
          const targetMessage = messages.find(msg => msg.msgid === msgid);
          messages = targetMessage ? [targetMessage] : [];
        } else {
          // Retornar mensagens ao redor do msgid
          const targetIndex = messages.findIndex(msg => msg.msgid === msgid);
          if (targetIndex >= 0) {
            const start = Math.max(0, targetIndex - 20);
            const end = Math.min(messages.length, targetIndex + 21);
            messages = messages.slice(start, end);
          }
        }
      } else if (latest && messages.length > 40) {
        // Retornar últimas mensagens
        messages = messages.slice(-40);
      } else if (messages.length > 40) {
        // Retornar primeiras mensagens
        messages = messages.slice(0, 40);
      }

    } catch (error) {
      console.warn(`Mensagens não encontradas para sala ${roomId}:`, error.message);
      messages = [];
    }

    console.log(`📨 Retornando ${messages.length} mensagens para room ${roomId}`);

    // Chamar callback com as mensagens (formato esperado pelo frontend)
    if (typeof callback === 'function') {
      callback(messages);
    }

  } catch (error) {
    console.error('❌ Erro em loadMessagesForUser:', error);
    if (typeof callback === 'function') {
      callback([]);
    }
  }
}

// ========================================
// SEÇÁO 6: HANDLERS DE VÍDEO
// ========================================

/**
 * Handler de eventos de vídeo
 */
function videoHandler(socket, io) {

  /**
   * Evento: video_sync
   * Sincronizar posição de vídeo
   */
  socket.on('video_sync', (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      const { roomId, userId } = session;
      const { videoId, currentTime, action = 'sync' } = data || {};

      console.log(`📹 Video sync - Room: ${roomId}, User: ${userId}, Video: ${videoId}, Time: ${currentTime}s`);

      // Reenviar evento para outros usuários na sala
      socket.to(roomId).emit('video_sync_update', {
        videoId: videoId,
        currentTime: currentTime,
        action: action,
        userId: userId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Erro no video_sync:', error);
      socket.emit('error', { message: 'Erro na sincronização de vídeo' });
    }
  });

  /**
   * Evento: video_control
   * Controles de vídeo (play, pause, seek)
   */
  socket.on('video_control', (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) return;

      const { roomId, userId } = session;
      const { videoId, action, currentTime } = data || {};

      console.log(`🎮 Video control - Room: ${roomId}, User: ${userId}, Action: ${action}`);

      // Reenviar comando para outros usuários na sala
      socket.to(roomId).emit('video_control_update', {
        videoId: videoId,
        action: action,
        currentTime: currentTime,
        userId: userId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Erro no video_control:', error);
    }
  });
}

// ========================================
// SEÇÁO 7: HANDLERS DE DESCONEXÁO
// ========================================

/**
 * Handler de logout voluntário
 */
function handleVoluntaryLogout(socket, io) {
  socket.on('voluntary-logout', () => {
    try {
      const session = userSessions.get(socket.id);
      if (session) {
        const { roomId, userId, userData } = session;

        console.log(`🚪 Logout voluntário iniciado - Socket: ${socket.id}, User: ${userId}`);

        // Marcar como logout voluntário para evitar processamento duplo
        socket.voluntaryLogout = true;

        // Processar saída imediata
        performImmediateCleanup(socket, io, session);

        // Forçar desconexão
        socket.disconnect(true);
      }
    } catch (error) {
      console.error('❌ Erro no handler de logout voluntário:', error);
    }
  });
}

/**
 * Handler de desconexão
 */
function handleDisconnect(socket, io) {
  socket.on('disconnect', (reason) => {
    try {
      const session = userSessions.get(socket.id);
      if (session) {
        const { roomId, userId, userData } = session;
        const isAdmin = userData?.isAdmin || userData?.level === 3;

        console.log(`🔌 Usuário desconectado - Socket: ${socket.id}, Room: ${roomId}, User: ${userId}, Motivo: ${reason}, Voluntário: ${!!socket.voluntaryLogout}`);

        // Se foi um logout voluntário, não fazer nada aqui pois já foi tratado
        if (socket.voluntaryLogout) {
          console.log(`✅ Logout voluntário já processado para socket ${socket.id}`);
          return;
        }

        // Para transport errors de admin, ser muito mais tolerante
        if (reason === 'transport error' && isAdmin) {
          console.log(`⚠️  Transport error detectado para ADMIN - mantendo sessão por mais tempo`);

          // Verificar se já existe um timeout para este socket
          if (socket.reconnectTimeout) {
            console.log(`⏰ Timeout de reconexão já existe para socket ${socket.id}`);
            return;
          }

          // Não remover imediatamente - dar muito mais tempo para reconexão de admin
          socket.reconnectTimeout = setTimeout(() => {
            // Verificar se o usuário reconectou
            const stillExists = userSessions.get(socket.id);
            if (stillExists) {
              console.log(`🧹 Limpando sessão admin após timeout de reconexão: ${userId}`);
              performCleanup();
            }
            // Limpar timeout
            delete socket.reconnectTimeout;
          }, 180000); // 3 minutos para reconexão de admin (muito mais tempo)
          return;
        } else if (reason === 'transport error') {
          console.log(`⚠️  Transport error detectado - possível problema de conectividade`);

          // Para usuários comuns com transport error, dar um tempo menor mas razoável
          if (socket.reconnectTimeout) {
            console.log(`⏰ Timeout de reconexão já existe para socket ${socket.id}`);
            return;
          }

          socket.reconnectTimeout = setTimeout(() => {
            const stillExists = userSessions.get(socket.id);
            if (stillExists) {
              console.log(`🧹 Limpando sessão usuário após timeout de reconexão: ${userId}`);
              performCleanup();
            }
            delete socket.reconnectTimeout;
          }, 60000); // 1 minuto para usuários comuns com transport error
          return;
        }

        // Para outros tipos de disconnect, verificar se pode ser logout voluntário
        // Disconnect 'client namespace disconnect' geralmente indica fechamento de aba
        // 'transport close' pode ser navegação normal - vamos ser menos agressivos
        if (reason === 'client namespace disconnect') {
          console.log(`🚪 Logout voluntário detectado (${reason}) - processando como saída imediata`);
          performImmediateCleanup(socket, io, session);
          return;
        }

        // Para 'transport close', aguardar um pouco para ver se é navegação temporária
        if (reason === 'transport close') {
          const isAdmin = session?.userData?.isAdmin || session?.userData?.level === 3;
          const waitTime = isAdmin ? 600000 : 300000; // Admin: 10 min, usuário comum: 5 min
          console.log(`⏳ Transport close detectado - aguardando reconexão (${waitTime / 60000}min) antes de processar logout`);
          setTimeout(() => {
            // Verificar se o usuário ainda não reconectou
            if (!session.isConnected) {
              console.log(`🚪 Confirmando logout após transport close para: ${session.nome}`);
              performImmediateCleanup(socket, io, session);
            } else {
              console.log(`✅ Usuário ${session.nome} reconectou - cancelando logout`);
            }
          }, waitTime);
          return;
        }

        // 'server namespace disconnect' processar imediatamente
        if (reason === 'server namespace disconnect') {
          console.log(`🚪 Server disconnect detectado (${reason}) - processando como saída imediata`);
          performImmediateCleanup(socket, io, session);
          return;
        }

        // Se chegou até aqui, fazer limpeza padrão imediata para outros casos
        console.log(`🧹 Limpeza imediata para tipo de desconexão: ${reason}`);
        performImmediateCleanup(socket, io, session);

        function performCleanup() {
          // Limpar timeouts pendentes
          if (socket.reconnectTimeout) {
            clearTimeout(socket.reconnectTimeout);
            delete socket.reconnectTimeout;
          }

          // Remover heartbeat
          connectionHeartbeat.delete(socket.id);

          // Limpar bandeiras de status inicial
          if (socket.initialStatusSent) {
            delete socket.initialStatusSent;
          }
          if (socket.initialJitsiSent) {
            delete socket.initialJitsiSent;
          }

          // Limpar cache de admin para permitir nova conexão depois de um tempo
          const userKey = `${userId}-${roomId}`;
          setTimeout(() => {
            adminStatusSent.delete(userKey);
            console.log(`🧹 Cache de admin limpo para ${userKey}`);
          }, isAdmin ? 600000 : 300000); // Admin: 10 minutos, usuário comum: 5 minutos

          // Remover do serviço de estabilidade
          const normalizedUserId = normalizeUserId(userId);
          if (normalizedUserId) {
            userStabilityService.removeUser(normalizedUserId);
          }

          // Remover da lista de usuários online usando função centralizada
          if (onlineUsers.has(roomId)) {
            const normalizedUserId = normalizeUserId(userId);
            if (normalizedUserId) {
              removeUserFromOnlineList(roomId, normalizedUserId, false, io);
            }
          }

          // Remover sessão
          userSessions.delete(socket.id);

          // Emitir evento "user-left" para compatibilidade com virtual.js
          // Quando um usuário sai, enviar o evento user-left que o virtual.js espera
          if (userData) {
            const formattedUser = formatUserData({ ...userData, roomId }, false);
            socket.to(roomId).emit('user-left', formattedUser);
            console.log(`📡 Evento 'user-left' enviado para sala ${roomId} - usuário desconectado: ${userData.nome || normalizeUserId(userId)}`);
          }

          // Notificar outros usuários na sala sobre a desconexão (mantém para outras funcionalidades)
          socket.to(roomId).emit('user_left', {
            userId: normalizeUserId(userId),
            userData: formatUserData(userData || {}, false),
            reason: reason,
            timestamp: new Date().toISOString()
          });

          // ENVIAR LISTA ATUALIZADA PARA TODOS NA SALA
          setTimeout(async () => {
            try {
              const participants = await getCombinedParticipantsList(roomId); // CORREÇÃO: usar lista combinada
              const onlineUserIds = Array.from(onlineUsers.get(roomId) || []);
              const formattedUsers = participants.map(participant => {
                const isOnline = onlineUserIds.includes(normalizeUserId(participant.id));
                return formatUserData(participant, isOnline);
              });

              // Emitir para todos na sala
              socket.to(roomId).emit('user-list', formattedUsers);

              // CORREÇÃO: Enviar contadores detalhados como o sistema legado espera
              const detailedCounts = await calculateDetailedUserCounts(roomId);
              socket.to(roomId).emit('user-count', detailedCounts);

              console.log(`📡 Lista de usuários atualizada após desconexão na sala ${roomId}: ${onlineUserIds.length}/${participants.length} online`);
              console.log(`📊 Contadores pós-desconexão: sala=${detailedCounts.sala}, professor=${detailedCounts.professor}, reuniao=${detailedCounts.reuniao}, equipe=${detailedCounts.equipe}, offline=${detailedCounts.offline}`);
            } catch (error) {
              console.error('❌ Erro ao enviar lista de usuários após desconexão:', error);
            }
          }, 100);
        }

        // Para disconnects normais, fazer limpeza baseada no tipo de usuário e motivo
        if (reason !== 'transport error') {
          // Disconnects normais (não transport error) são limpos imediatamente
          performCleanup();
        } else if (!isAdmin) {
          // Transport error de usuários comuns são tolerados mas não tanto quanto admins
          // O timeout já foi definido acima
        }
        // Para admins com transport error, apenas aguardar o timeout de 3 minutos

        const remainingCount = onlineUsers.get(roomId)?.size || 0;
        console.log(`📊 Usuários restantes na sala ${roomId}: ${remainingCount}`);
      } else {
        // Limpar heartbeat mesmo sem sessão
        connectionHeartbeat.delete(socket.id);
        heartbeatService.removeConnection(socket.id);
      }
    } catch (error) {
      console.error('❌ Erro na desconexão:', error);
    }
  });

  // Adicionar handler de ping para heartbeat
  socket.on('ping', () => {
    connectionHeartbeat.set(socket.id, Date.now());
    socket.emit('pong');
  });

  // Adicionar handler de heartbeat-pong
  socket.on('heartbeat-pong', () => {
    heartbeatService.updatePing(socket.id);
  });

  // ========================================
  // HANDLERS DE UPDATE ESPERADOS PELO FRONTEND
  // ========================================

  // Handler para update-online - manter usuário como online
  socket.on('update-online', () => {
    const session = userSessions.get(socket.id);
    if (session) {
      userStabilityService.updateUserActivity(session.userId);
      // Não emitir 'online' aqui - isso confunde com o status da sala
      socket.emit('heartbeat', { status: 'connected', timestamp: new Date().toISOString() });
    }
  });

  // Handler para update-disabled - verificar se chat está habilitado
  socket.on('update-disabled', () => {
    const session = userSessions.get(socket.id);
    if (session) {
      // Por padrão, chat sempre habilitado (pode ser customizado depois)
      socket.emit('enabled', { timestamp: new Date().toISOString() });
    }
  });

  // Handler para update-show - elementos que devem estar visíveis
  socket.on('update-show', () => {
    const session = userSessions.get(socket.id);
    if (session) {
      // Por padrão, não ocultar elementos (pode ser customizado depois)
      // socket.emit('show', 'selector_css');
    }
  });

  // Handler para update-info - informações do sistema
  socket.on('update-info', async () => {
    const session = userSessions.get(socket.id);
    if (session) {
      // Carregar dados da sala para verificar status da transmissão
      let currentMessage = '';
      let isLiveEnabled = false;

      try {
        const { loadRoomData } = require('./services');
        const roomData = await loadRoomData(session.roomId, 'room');
        currentMessage = roomData?.config?.info_message || '';
        isLiveEnabled = Boolean(roomData?.config?.live_enabled);
      } catch (error) {
        console.warn(`⚠️ Erro ao carregar dados da sala ${session.roomId}:`, error.message);
      }

      // CORREÇÁO CRÍTICA: Só enviar quadro de avisos se a transmissão estiver OFFLINE
      // Quadro de avisos só deve aparecer quando live_enabled = false
      if (!isLiveEnabled && currentMessage) {
        socket.emit('info', currentMessage);
        console.log(`📋 Quadro de avisos enviado para usuário (transmissão OFFLINE): "${currentMessage.substring(0, 50)}..."`);
      } else {
        socket.emit('info', '');
        console.log(`📺 Quadro de avisos oculto para usuário (transmissão ${isLiveEnabled ? 'ONLINE' : 'OFFLINE sem mensagem'})`);
      }
    }
  });

  // Handler para update-stream-status - verificar status atual da transmissão
  socket.on('update-stream-status', async () => {
    const session = userSessions.get(socket.id);
    if (session) {
      try {
        const fs = require('fs').promises;
        const path = require('path');
        const roomPath = path.join(__dirname, '../../../api/room.json');

        const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));
        const isOnline = Boolean(roomData.config?.live_enabled);
        const streamUrl = roomData.config?.stream_url || '';

        // Emitir status atual
        if (isOnline) {
          socket.emit('online', streamUrl);
          console.log(`🔄 Status de transmissão enviado para admin: ONLINE (${streamUrl})`);
        } else {
          socket.emit('offline');
          console.log(`🔄 Status de transmissão enviado para admin: OFFLINE`);
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao carregar status de transmissão:`, error.message);
        socket.emit('offline'); // Fallback para offline em caso de erro
      }
    }
  });

  // ========================================
  // HANDLER DE TYPING INDICATORS (NOVO)
  // ========================================

  /**
   * Evento: typing
   * Sistema de indicadores de "usuário digitando"
   * Frontend envia: SOCKET.emit('typing', SESSION_ITEM, SESSION_FIXED)
   * Backend reemite: SOCKET.on('user-typing', {userid, nick, item})
   */
  socket.on('typing', async (sessionItem, sessionFixed) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        console.warn(`⚠️ Sessão não encontrada para typing - socket ${socket.id}`);
        return;
      }

      const { roomId, userId, userData } = session;

      // Bloquear usuários anônimos totais (sem cookie de participante)
      if (userData.isAnonymous && !userData.isAnonymousParticipant) {
        console.log(`🚫 Usuário anônimo total ${userData.apelido} tentou enviar typing - bloqueado`);
        return;
      }

      // Buscar dados atualizados do participante para obter nick correto
      let participantData = null;
      try {
        const participantes = await getCombinedParticipantsList(roomId);
        participantData = participantes.find(p => p.id.toString() === userId.toString());
        console.log(`🔍 DEBUG TYPING - Participante encontrado:`, {
          userId,
          encontrado: !!participantData,
          nick: participantData?.nick,
          userData_apelido: userData.apelido,
          userData_nome: userData.nome
        });
      } catch (error) {
        console.warn(`⚠️ Erro ao buscar participante para typing:`, error.message);
      }

      // Determinar nick com prioridade para dados do participantes.json
      let nickName;
      if (userData.isAnonymous && userData.isAnonymousParticipant) {
        // Para usuários anônimos participantes, usar o nome definido no join
        nickName = userData.apelido || userData.nome || 'Visitante';
      } else {
        // Para usuários normais, priorizar dados do participantes.json
        if (participantData?.nick) {
          nickName = participantData.nick;
        } else {
          nickName = userData.apelido || userData.nome || userData.nick || 'Usuário';
        }
      }

      // Preparar dados para o evento user-typing que o frontend espera
      const typingData = {
        userid: userId,
        nick: nickName,
        item: parseInt(sessionItem) || 0
      };

      console.log(`⌨️ Typing de ${typingData.nick} (${userId}) na sala ${roomId} - item: ${typingData.item}`);

      // CORREÇÃO: Forçar mensagens de admin sempre para sala 'pub' para unificar chat
      let targetRoomId = roomId;
      if (roomId === 'admin' || roomId === 'chat' || roomId === 'monitor') {
        targetRoomId = 'pub';
        console.log(`🔄 Redirecionando typing de admin de sala '${roomId}' para 'pub'`);
      }

      // Reemitir para outros usuários na sala (não para quem enviou)
      socket.to(targetRoomId).emit('user-typing', typingData);

      console.log(`📡 Evento 'user-typing' enviado para sala ${targetRoomId} - ${typingData.nick} está digitando`);

    } catch (error) {
      console.error('❌ Erro no handler typing:', error);
    }
  });

  // Handler para timers - temporizadores ativos
  socket.on('timers', () => {
    const session = userSessions.get(socket.id);
    if (session) {
      // Por padrão, nenhum timer ativo (pode ser implementado depois)
      // socket.emit('timer', 'timer_name', seconds);
    }
  });

  // Handler para lowers - mensagens inferiores
  socket.on('lowers', () => {
    const session = userSessions.get(socket.id);
    if (session) {
      // Por padrão, nenhuma mensagem inferior (pode ser implementado depois)
      // socket.emit('lower', { main: 'Mensagem', sub: 'Submensagem' });
    }
  });

  // Handler para update-message-count - contadores de mensagens
  socket.on('update-message-count', () => {
    const session = userSessions.get(socket.id);
    if (session) {
      // Por padrão, sem contadores especiais (pode ser implementado depois)
      // socket.emit('unread-count', []);
    }
  });

  // ========================================
  // HANDLERS ESPECIAIS PARA ADMINISTRADORES
  // ========================================

  // Handler especial para manter admins sempre online
  socket.on('admin-keep-alive', () => {
    const session = userSessions.get(socket.id);
    if (session?.userData?.isAdmin || session?.userData?.level === 3) {
      const normalizedUserId = normalizeUserId(session.userId);
      if (normalizedUserId) {
        // Atualizar heartbeat e estabilidade
        connectionHeartbeat.set(socket.id, Date.now());
        userStabilityService.updateUserActivity(normalizedUserId);
        userStabilityService.markUserAsStable(normalizedUserId, socket.id, true);

        // Garantir que está na lista de usuários online
        if (!onlineUsers.has(session.roomId)) {
          onlineUsers.set(session.roomId, new Set());
        }
        onlineUsers.get(session.roomId).add(normalizedUserId);

        console.log(`🔐 Admin keep-alive processado: ${session.userData?.nome || normalizedUserId}`);
        socket.emit('admin-alive-confirmed', { timestamp: new Date().toISOString() });
      }
    }
  });

  // Handler para forçar recarregamento da lista de participantes (apenas admin)
  socket.on('admin-refresh-participants', async () => {
    const session = userSessions.get(socket.id);
    if (session?.userData?.isAdmin || session?.userData?.level === 3) {
      try {
        const participants = await loadParticipants(session.roomId);
        if (participants && participants.length > 0) {
          const onlineUserIds = Array.from(onlineUsers.get(session.roomId) || []);
          const formattedUsers = participants.map(participant => {
            const isOnline = onlineUserIds.includes(normalizeUserId(participant.id));
            return formatUserData(participant, isOnline);
          });

          socket.emit('user-list', formattedUsers);
          console.log(`🔐 Admin refresh participants: ${formattedUsers.length} usuários enviados`);
        }
      } catch (error) {
        console.error('❌ Erro no admin-refresh-participants:', error);
      }
    }
  });
}

// ========================================
// SEÇÁO 7.5: HANDLER ADMINISTRATIVO
// ========================================

/**
 * Handler para funcionalidades administrativas
 */
function adminHandler(socket, io) {

  /**
   * Evento: user-sort
   * Controla a ordenação da lista de participantes no painel administrativo
   */
  socket.on('user-sort', async (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa
      const isAdmin = session.userData?.level === 3 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Permissão insuficiente' });
        return;
      }

      const { roomId } = session;
      const { sortType, sortOrder = 'asc' } = data || {};

      if (!sortType) {
        socket.emit('error', { message: 'Tipo de ordenação não especificado' });
        return;
      }

      console.log(`🔄 Admin ${session.userData?.nome || 'Admin'} alterou ordenação para: ${sortType} (${sortOrder})`);

      // Carregar participantes
      const participants = await loadParticipants(roomId);
      if (!participants || participants.length === 0) {
        socket.emit('user-sort-result', { users: [], sortType, sortOrder });
        return;
      }

      // Aplicar ordenação baseada no tipo
      const sortedParticipants = sortParticipants(participants, sortType, sortOrder);

      // Marcar usuários online
      const onlineUserIds = Array.from(onlineUsers.get(roomId) || []);
      const formattedUsers = sortedParticipants.map(participant => {
        const isOnline = onlineUserIds.includes(normalizeUserId(participant.id));
        return formatUserData(participant, isOnline);
      });

      // Emitir resultado para toda a sala (sincronização global)
      io.to(roomId).emit('user-sort-result', {
        users: formattedUsers,
        sortType,
        sortOrder,
        timestamp: new Date().toISOString()
      });

      // Log da operação
      console.log(`✅ Lista ordenada enviada para sala ${roomId}: ${formattedUsers.length} participantes (${sortType})`);

    } catch (error) {
      console.error('❌ Erro no user-sort:', error);
      socket.emit('error', { message: 'Erro ao ordenar lista de usuários' });
    }
  });

  /**
   * Evento: user-filter
   * Controla os filtros da lista de participantes
   */
  socket.on('user-filter', async (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa
      const isAdmin = session.userData?.level === 3 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Permissão insuficiente' });
        return;
      }

      const { roomId } = session;
      const { filterType, showAll = false } = data || {};

      console.log(`🔍 Admin ${session.userData?.nome || 'Admin'} alterou filtro para: ${filterType || 'todos'}`);

      // Carregar participantes
      const participants = await loadParticipants(roomId);
      if (!participants || participants.length === 0) {
        socket.emit('user-filter-result', { users: [], filterType, showAll });
        return;
      }

      // Aplicar filtro baseado no tipo
      let filteredParticipants = participants;
      if (!showAll && filterType) {
        filteredParticipants = filterParticipants(participants, filterType);
      }

      // Marcar usuários online
      const onlineUserIds = Array.from(onlineUsers.get(roomId) || []);
      const formattedUsers = filteredParticipants.map(participant => {
        const isOnline = onlineUserIds.includes(normalizeUserId(participant.id));
        return formatUserData(participant, isOnline);
      });

      // Emitir resultado para toda a sala
      io.to(roomId).emit('user-filter-result', {
        users: formattedUsers,
        filterType,
        showAll,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Lista filtrada enviada para sala ${roomId}: ${formattedUsers.length} participantes`);

    } catch (error) {
      console.error('❌ Erro no user-filter:', error);
      socket.emit('error', { message: 'Erro ao filtrar lista de usuários' });
    }
  });

  /**
   * Evento: user-list
   * Solicita a lista completa de participantes (compatibilidade com frontend legado)
   */
  socket.on('user-list', async (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      const { roomId } = session;
      const { sortBy = 'turma', filter = 'all', order = 'asc' } = data || {};

      console.log(`📋 Solicitação de user-list para sala ${roomId} (sortBy: ${sortBy}, filter: ${filter})`);

      // Carregar participantes
      const participants = await loadParticipants(roomId);
      if (!participants || participants.length === 0) {
        socket.emit('user-list', []);
        return;
      }

      // Aplicar filtros
      let filteredParticipants = participants;
      if (filter !== 'all') {
        filteredParticipants = filterParticipants(participants, filter);
      }

      // Aplicar ordenação
      const sortedParticipants = sortParticipants(filteredParticipants, sortBy, order);

      // Marcar usuários online
      const onlineUserIds = Array.from(onlineUsers.get(roomId) || []);
      const formattedUsers = sortedParticipants.map(participant => {
        const isOnline = onlineUserIds.includes(normalizeUserId(participant.id));
        return formatUserData(participant, isOnline);
      });

      // Emitir lista para o solicitante
      socket.emit('user-list', formattedUsers);

      console.log(`✅ user-list enviada: ${formattedUsers.length} participantes`);

    } catch (error) {
      console.error('❌ Erro no user-list:', error);
      socket.emit('user-list', []);
    }
  });

  /**
   * Evento: room-online
   * Ativa a transmissão ao vivo da sala virtual
   */
  socket.on('room-online', async (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas usuários autorizados podem controlar a transmissão' });
        return;
      }

      const { roomId, userId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      console.log(`🔴 Admin ${adminName} está ativando transmissão para sala ${roomId}`);

      try {
        await updateRoomStatusInFile(roomId, true);

        // INVALIDAR CACHE para forçar releitura
        globalStatusCache.delete(roomId);
        console.log(`🔄 Cache invalidado para sala ${roomId} após ativação`);

      } catch (error) {
        logWarning(`⚠️ Erro ao atualizar room.json:`, error.message);
      }

      // Preparar dados do evento
      const eventData = {
        roomId,
        adminId: userId,
        adminName,
        timestamp: Date.now(),
        streamUrl: null // Pode ser definido futuramente
      };

      // Notificar todos os usuários da sala
      // COMPATIBILIDADE CRÍTICA: frontend espera streamUrl diretamente como string
      io.to(roomId).emit('online', '');

      // Garantir que o próprio admin também receba o evento (caso haja problema de sincronização)
      socket.emit('online', '');

      // FORÇA SYNC PARA GARANTIR QUE TODOS VEJAM AS MUDANÇAS (especialmente após refresh)
      setTimeout(async () => {
        await syncLivePlayerState(io, roomId);
        console.log(`🔄 Force sync executado após room-online`);
      }, 100);

      // Log da ação administrativa
      console.log(`🎬 Transmissão ATIVADA na sala ${roomId} por ${adminName} (${userId}) - Broadcast enviado para ${io.sockets.adapter.rooms.get(roomId)?.size || 0} clientes`);

      // Log detalhado para auditoria
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: 'room-online',
        room_id: roomId,
        admin_id: userId,
        admin_name: adminName,
        success: true
      };

      // Salvar log de auditoria (opcional)
      try {
        const logsDir = path.join(__dirname, '../../../data/logs');
        const logFile = path.join(logsDir, `admin-actions-${new Date().toISOString().split('T')[0]}.json`);

        // Criar diretório se não existir
        await fs.mkdir(logsDir, { recursive: true });

        // Tentar ler logs existentes
        let logs = [];
        try {
          const existingLogs = await fs.readFile(logFile, 'utf8');
          logs = JSON.parse(existingLogs);
        } catch (e) {
          // Arquivo não existe ainda, usar array vazio
        }

        logs.push(logEntry);
        await fs.writeFile(logFile, JSON.stringify(logs, null, 2));

      } catch (logError) {
        console.warn(`⚠️ Erro ao salvar log de auditoria:`, logError.message);
      }

    } catch (error) {
      console.error('❌ Erro no room-online:', error);
      socket.emit('error', { message: 'Erro ao ativar transmissão' });
    }
  });

  /**
   * Evento: stream-online
   * Ativa a transmissão ao vivo da sala virtual (compatibilidade com frontend legado)
   */
  socket.on('stream-online', async (streamUrl) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas usuários autorizados podem controlar a transmissão' });
        return;
      }

      const { roomId, userId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      console.log(`🔴 Admin ${adminName} está ativando transmissão para sala ${roomId} (stream-online)`);

      // Converter URLs do YouTube para formato embed se necessário
      let processedStreamUrl = streamUrl;
      if (streamUrl && streamUrl.trim()) {
        const services = require('./services');
        processedStreamUrl = services.convertYouTubeToEmbed(streamUrl.trim());

        if (processedStreamUrl !== streamUrl.trim()) {
          console.log(`🔄 URL do YouTube convertida automaticamente`);
          console.log(`  Original: ${streamUrl.trim()}`);
          console.log(`  Convertida: ${processedStreamUrl}`);
        }
      }

      try {
        await updateRoomStatusInFile(roomId, true, processedStreamUrl.trim());

        // INVALIDAR CACHE para forçar releitura
        globalStatusCache.delete(roomId);
        console.log(`🔄 Cache invalidado para sala ${roomId} após ativação (stream-online)`);

      } catch (error) {
        logWarning(`⚠️ Erro ao atualizar room.json:`, error.message);
      }

      // Preparar dados do evento (formato que o frontend espera)
      const eventData = processedStreamUrl && processedStreamUrl.trim() ? processedStreamUrl.trim() : '';

      // Notificar todos os usuários da sala
      io.to(roomId).emit('online', eventData);

      // Garantir que o próprio admin também receba o evento (caso haja problema de sincronização)
      socket.emit('online', eventData);

      // FORÇA SYNC MÚLTIPLO para garantir máxima compatibilidade
      setTimeout(async () => {
        await syncLivePlayerState(io, roomId);
        console.log(`🔄 Force sync executado após stream-online`);
      }, 100);

      // Sync adicional para casos edge
      setTimeout(async () => {
        await syncLivePlayerState(io, roomId);
      }, 500);

      // Log da ação administrativa
      console.log(`🎬 Transmissão ATIVADA na sala ${roomId} por ${adminName} (${userId}) - URL: ${processedStreamUrl || 'padrão'} - Broadcast enviado para ${io.sockets.adapter.rooms.get(roomId)?.size || 0} clientes`);

    } catch (error) {
      console.error('❌ Erro no stream-online:', error);
      socket.emit('error', { message: 'Erro ao ativar transmissão' });
    }
  });

  /**
   * Evento: room-offline
   * Desativa a transmissão ao vivo da sala virtual
   */
  socket.on('room-offline', async (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas usuários autorizados podem controlar a transmissão' });
        return;
      }

      const { roomId, userId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      console.log(`⚫ Admin ${adminName} está desativando transmissão para sala ${roomId}`);

      let sessionDuration = null;
      try {
        const roomPath = path.join(__dirname, '../../../api/room.json');
        const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));
        if (!roomData.config?.live_enabled) {
          socket.emit('error', { message: 'A transmissão já está inativa' });
          return;
        }
        if (roomData.config?.last_online) {
          const startTime = new Date(roomData.config.last_online);
          const endTime = new Date();
          sessionDuration = endTime - startTime;
        }
        await updateRoomStatusInFile(roomId, false, null, sessionDuration);

        // INVALIDAR CACHE para forçar releitura
        globalStatusCache.delete(roomId);
        console.log(`🔄 Cache invalidado para sala ${roomId} após desativação`);

      } catch (error) {
        console.warn(`⚠️ Erro ao atualizar room.json:`, error.message);
      }

      // Preparar dados do evento
      const eventData = {
        roomId,
        adminId: userId,
        adminName,
        timestamp: Date.now(),
        sessionDuration
      };

      // Notificar todos os usuários da sala
      io.to(roomId).emit('offline', eventData);

      // Garantir que o próprio admin também receba o evento (caso haja problema de sincronização)
      socket.emit('offline', eventData);

      // FORÇA SYNC PARA GARANTIR QUE TODOS VEJAM AS MUDANÇAS (especialmente após refresh)
      setTimeout(async () => {
        await syncLivePlayerState(io, roomId);
        console.log(`🔄 Force sync executado após room-offline`);
      }, 100);

      // Log da ação administrativa
      const durationText = sessionDuration ? ` (duração: ${Math.round(sessionDuration / 1000 / 60)} min)` : '';
      console.log(`🛑 Transmissão DESATIVADA na sala ${roomId} por ${adminName} (${userId})${durationText} - Broadcast enviado para ${io.sockets.adapter.rooms.get(roomId)?.size || 0} clientes`);

      // Log detalhado para auditoria
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: 'room-offline',
        room_id: roomId,
        admin_id: userId,
        admin_name: adminName,
        session_duration: sessionDuration,
        success: true
      };

      // Salvar log de auditoria (opcional)
      try {
        const logsDir = path.join(__dirname, '../../../data/logs');
        const logFile = path.join(logsDir, `admin-actions-${new Date().toISOString().split('T')[0]}.json`);

        // Criar diretório se não existir
        await fs.mkdir(logsDir, { recursive: true });

        // Tentar ler logs existentes
        let logs = [];
        try {
          const existingLogs = await fs.readFile(logFile, 'utf8');
          logs = JSON.parse(existingLogs);
        } catch (e) {
          // Arquivo não existe ainda, usar array vazio
        }

        logs.push(logEntry);
        await fs.writeFile(logFile, JSON.stringify(logs, null, 2));

      } catch (logError) {
        console.warn(`⚠️ Erro ao salvar log de auditoria:`, logError.message);
      }

    } catch (error) {
      console.error('❌ Erro no room-offline:', error);
      socket.emit('error', { message: 'Erro ao desativar transmissão' });
    }
  });

  /**
   * Evento: stream-offline
   * Desativa a transmissão ao vivo da sala virtual (compatibilidade com frontend legado)
   */
  socket.on('stream-offline', async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas usuários administrativos podem desativar a transmissão' });
        return;
      }

      const { roomId } = session;
      const { userId, userName } = session.userData || {};

      let sessionDuration = null;
      try {
        const roomPath = path.join(__dirname, '../../../api/room.json');
        const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));
        if (!roomData.config?.live_enabled) {
          socket.emit('error', { message: 'A transmissão já está inativa' });
          return;
        }
        if (roomData.config?.last_online) {
          const startTime = new Date(roomData.config.last_online);
          const endTime = new Date();
          sessionDuration = endTime - startTime;
        }
        await updateRoomStatusInFile(roomId, false, null, sessionDuration);

        // INVALIDAR CACHE para forçar releitura
        globalStatusCache.delete(roomId);
        console.log(`🔄 Cache invalidado para sala ${roomId} após desativação (stream-offline)`);

      } catch (error) {
        console.warn(`⚠️ Erro ao atualizar room.json:`, error.message);
      }

      // Emitir evento de desativação para todos os usuários da sala (formato que o frontend espera)
      io.to(roomId).emit('offline');

      // Forçar reload da página para parar completamente o áudio/vídeo (evento já suportado pelo frontend)
      io.to(roomId).emit('reload');

      // Garantir que o próprio admin também receba o evento (caso haja problema de sincronização)
      socket.emit('offline');
      socket.emit('reload');

      // FORÇA SYNC MÚLTIPLO para garantir desativação completa
      setTimeout(async () => {
        await syncLivePlayerState(io, roomId);
        console.log(`🔄 Force sync executado após stream-offline`);
      }, 100);

      // Sync adicional para casos edge
      setTimeout(async () => {
        await syncLivePlayerState(io, roomId);
      }, 500);

      // Log da ação administrativa
      const durationText = sessionDuration ? ` (duração: ${Math.round(sessionDuration / 1000 / 60)} min)` : '';
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';
      console.log(`🛑 Transmissão DESATIVADA na sala ${roomId} por ${adminName} (${userId})${durationText} - Broadcast enviado para ${io.sockets.adapter.rooms.get(roomId)?.size || 0} clientes`);

    } catch (error) {
      console.error('❌ Erro no stream-offline:', error);
      socket.emit('error', { message: 'Erro ao desativar transmissão' });
    }
  });

  /**
   * Evento: get-room-status
   * Verifica o status atual da transmissão da sala (APENAS SOB DEMANDA)
   */
  socket.on('get-room-status', async (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se é admin
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas admins podem consultar status da transmissão' });
        return;
      }

      const { roomId } = session;

      // Ler status atual da sala usando a função auxiliar
      const { isOnline, lastOnline, lastOffline, lastDuration, streamUrl } = await getRoomStatusFromFile(roomId);

      const statusData = {
        roomId,
        isOnline,
        lastOnline,
        lastOffline,
        lastDuration,
        streamUrl,
        timestamp: Date.now(),
        requested: true
      };

      // Usar evento específico para não confundir com eventos de mudança de estado
      socket.emit('room-status-response', statusData);

      console.log(`📊 Status da sala ${roomId} consultado por admin: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);

    } catch (error) {
      console.error('❌ Erro no get-room-status:', error);
      socket.emit('error', { message: 'Erro ao verificar status da sala' });
    }
  });

  /**
   * Verificar e emitir status inicial da sala quando qualquer usuário se conecta
   * VERSÁO ULTRA-OTIMIZADA: Previne múltiplas emissões em refreshes
   */
  const checkInitialRoomStatus = async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) return;

      // Todos os usuários devem receber o status inicial da sala
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      const { roomId, userId } = session;

      // 1. Verificar se já enviamos o status inicial para este socket
      if (socket.initialStatusSent) {
        console.log(`📊 Status inicial já enviado para socket ${socket.id} - ignorando`);
        return;
      }

      // 2. Controle de cooldown FLEXÍVEL - permitir refresh e mudanças de contexto
      const now = Date.now();
      const userKey = `${userId}-${roomId}`;
      const lastStatusSent = adminStatusSent.get(userKey);

      // Cooldown MUITO REDUZIDO para permitir refresh e mudanças de contexto
      const cooldown = 25; // Apenas 25ms para todos - permite refresh e transições

      if (lastStatusSent && (now - lastStatusSent.timestamp) < cooldown) {
        const remainingTime = cooldown - (now - lastStatusSent.timestamp);
        console.log(`⏰ Status inicial BLOQUEADO para ${isAdmin ? 'admin' : 'usuário'} ${session.userData?.nome} - cooldown mínimo ativo (${remainingTime}ms restantes)`);
        socket.initialStatusSent = true; // Marcar como enviado para evitar tentar novamente
        return;
      }

      // 3. Verificar cache global com tempo REDUZIDO para melhor responsividade
      const cachedStatus = globalStatusCache.get(roomId);
      const cacheValidTime = 100; // Cache válido por apenas 100ms - mais responsivo

      let isOnline;
      let streamUrl = "";

      if (cachedStatus && (now - cachedStatus.timestamp) < cacheValidTime) {
        // Usar cache
        isOnline = cachedStatus.status;
        streamUrl = cachedStatus.streamUrl || "";
        console.log(`💾 Usando cache para sala ${roomId}: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
      } else {
        // Ler do arquivo sempre que cache expirou (mais frequente = mais responsivo)
        const { isOnline: fileIsOnline, streamUrl: fileStreamUrl } = await getRoomStatusFromFile(roomId);
        isOnline = fileIsOnline;
        streamUrl = fileStreamUrl;

        // Atualizar cache
        globalStatusCache.set(roomId, {
          status: isOnline,
          streamUrl,
          timestamp: now
        });

        console.log(`📊 Status lido do arquivo para sala ${roomId}: isOnline=${isOnline}`);
      }

      // 4. Marcar como processado ANTES de emitir
      socket.initialStatusSent = true;
      adminStatusSent.set(userKey, { roomId, timestamp: now });
      statusThrottle.set(roomId, now);

      // 5. Emitir status
      if (isOnline) {
        // COMPATIBILIDADE CRÍTICA: frontend espera streamUrl diretamente como string
        socket.emit('online', streamUrl);
        console.log(`🟢 EVENTO 'online' ENVIADO para ${isAdmin ? 'admin' : 'usuário'} ${session.userData?.nome} | roomId: ${roomId} | streamUrl: ${streamUrl} | source: ${cachedStatus ? 'cache' : 'arquivo'}`);
      } else {
        socket.emit('offline');
        console.log(`⚫ EVENTO 'offline' ENVIADO para ${isAdmin ? 'admin' : 'usuário'} ${session.userData?.nome} | roomId: ${roomId} | source: ${cachedStatus ? 'cache' : 'arquivo'}`);
      }

      // 6. Verificar e emitir status inicial do chat
      try {
        const fs = require('fs').promises;
        const path = require('path');
        const roomPath = path.join(__dirname, '../../../api/room.json');

        let roomData = {};
        let isChatEnabled = true; // Default: chat habilitado

        try {
          roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));
          // Verificar se há configuração específica do chat
          if (roomData.config && typeof roomData.config.chat_enabled === 'boolean') {
            isChatEnabled = roomData.config.chat_enabled;
          }
        } catch (fileError) {
          // Arquivo não existe ou erro de leitura, usar padrão (chat habilitado)
          console.log(`📁 Arquivo room.json não encontrado, assumindo chat habilitado para sala ${roomId}`);
        }

        // Emitir status do chat
        if (isChatEnabled) {
          socket.emit('enabled');
          console.log(`💬 EVENTO 'enabled' ENVIADO para ${isAdmin ? 'admin' : 'usuário'} ${session.userData?.nome} | roomId: ${roomId} | chat: ATIVADO`);
        } else {
          socket.emit('disabled');
          console.log(`💬 EVENTO 'disabled' ENVIADO para ${isAdmin ? 'admin' : 'usuário'} ${session.userData?.nome} | roomId: ${roomId} | chat: DESATIVADO`);
        }

        // 7. ENVIAR QUADRO DE AVISOS (NOVO) - Garantir que seja enviado no timing correto
        try {
          const currentMessage = roomData?.config?.info_message || '';

          // CORREÇÃO CRÍTICA: Só enviar quadro de avisos se a transmissão estiver OFFLINE
          // Quadro de avisos só deve aparecer quando live_enabled = false
          if (!isOnline && currentMessage) {
            socket.emit('info', currentMessage);
            console.log(`📋 Quadro de avisos enviado para usuário (transmissão OFFLINE): "${currentMessage.substring(0, 50)}..."`);
          } else {
            socket.emit('info', '');
            console.log(`📺 Quadro de avisos oculto para usuário (transmissão ${isOnline ? 'ONLINE' : 'OFFLINE sem mensagem'})`);
          }
        } catch (infoError) {
          console.warn(`⚠️ Erro ao enviar quadro de avisos inicial:`, infoError.message);
          // Em caso de erro, enviar info vazio
          socket.emit('info', '');
        }

        // 8. ENVIAR STATUS JITSI (NOVO) - Garantir que seja enviado junto com outros dados
        try {
          const jitsiEnabled = Boolean(roomData?.config?.jitsi_enabled);

          if (jitsiEnabled) {
            socket.emit('jitsi-enabled');
            console.log(`🟢 EVENTO 'jitsi' ATIVO ENVIADO para ${session.userData?.nome || userId} | roomId: ${roomId}`);
          } else {
            socket.emit('jitsi-disabled');
            console.log(`🔴 EVENTO 'jitsi' INATIVO ENVIADO para ${session.userData?.nome || userId} | roomId: ${roomId}`);
          }
        } catch (jitsiError) {
          console.warn(`⚠️ Erro ao enviar status JITSI inicial:`, jitsiError.message);
          // Em caso de erro, assumir JITSI desabilitado
          socket.emit('jitsi-disabled');
        }

        // 9. CARREGAR E EMITIR ESTADOS ADMINISTRATIVOS PERSISTIDOS
        try {
          const adminStates = roomData?.config?.admin_states || {};

          // Carregar estados nos Maps (sincronização memória <-> arquivo)
          if (adminStates.checkin_active !== undefined) {
            checkinStates.set(roomId, adminStates.checkin_active);
            if (adminStates.checkin_active) {
              socket.emit('checkin-start');
              console.log(`✅ EVENTO 'checkin-start' ENVIADO para ${session.userData?.nome || userId} | roomId: ${roomId}`);
            }
          }

          if (adminStates.evaluation_code !== undefined && adminStates.evaluation_code !== null) {
            evaluationStates.set(roomId, adminStates.evaluation_code);
            socket.emit('evaluation', adminStates.evaluation_code);
            console.log(`📝 EVENTO 'evaluation' ENVIADO para ${session.userData?.nome || userId} | roomId: ${roomId} | código: ${adminStates.evaluation_code}`);
          }

          if (adminStates.review_event_id !== undefined && adminStates.review_event_id !== null) {
            reviewStates.set(roomId, adminStates.review_event_id);
            socket.emit('review', adminStates.review_event_id);
            console.log(`⭐ EVENTO 'review' ENVIADO para ${session.userData?.nome || userId} | roomId: ${roomId} | evento: ${adminStates.review_event_id}`);
          }

          if (adminStates.popup_active !== undefined && adminStates.popup_active !== null) {
            popupStates.set(roomId, adminStates.popup_active);
            socket.emit('popup', adminStates.popup_active);
            console.log(`🪟 EVENTO 'popup' ENVIADO para ${session.userData?.nome || userId} | roomId: ${roomId} | link: ${adminStates.popup_active?.link}`);
          }

          console.log(`🔄 Estados administrativos restaurados para usuário ${session.userData?.nome || userId} na sala ${roomId}`);

        } catch (adminError) {
          console.warn(`⚠️ Erro ao carregar estados administrativos iniciais:`, adminError.message);
        }

      } catch (chatError) {
        console.warn(`⚠️ Erro ao verificar status inicial do chat:`, chatError.message);
        // Em caso de erro, assumir chat habilitado (comportamento padrão)
        socket.emit('enabled');
        console.log(`💬 EVENTO 'enabled' ENVIADO (fallback) para ${isAdmin ? 'admin' : 'usuário'} ${session.userData?.nome} | roomId: ${roomId}`);

        // Mesmo em caso de erro no chat, tentar enviar quadro de avisos
        try {
          socket.emit('info', '');
          console.log(`📺 Quadro de avisos enviado vazio (fallback) para usuário ${session.userData?.nome}`);
        } catch (fallbackError) {
          console.warn(`⚠️ Erro até no fallback do quadro de avisos:`, fallbackError.message);
        }
      }

    } catch (error) {
      console.error('❌ Erro ao verificar status inicial:', error);
    }
  };

  /**
   * Função para verificar e enviar status inicial das conferências (botões)
   * NOVA: Garante que botões de conferência apareçam após refresh/reconexão
   */
  const checkInitialConferencesStatus = async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) return;

      const { roomId } = session;
      const fs = require('fs').promises;
      const path = require('path');

      // Verificar se já enviamos o status inicial das conferências para este socket
      if (socket.initialConferencesSent) {
        console.log(`📊 Status inicial das conferências já enviado para socket ${socket.id} - ignorando`);
        return;
      }

      try {
        const roomPath = path.join(__dirname, '../../../api/room.json');
        const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));

        const conferences = roomData.config?.conferences || {};

        console.log(`🔍 DEBUG: Lendo configurações de conferências do room.json:`, JSON.stringify(conferences, null, 2));

        // Enviar eventos 'show' para todas as conferências ativas
        const activeConferences = [];

        Object.keys(conferences).forEach(confType => {
          // Ignorar configurações de limite (ex: professor_limit)
          if (confType.includes('_limit')) return;

          console.log(`🔍 DEBUG: Verificando conferência '${confType}': ${conferences[confType]}`);

          if (conferences[confType] === true) {
            socket.emit('show', `conf-${confType}`);
            activeConferences.push(confType);
            console.log(`🟢 Botão 'conf-${confType}' MOSTRADO no status inicial`);
          } else {
            console.log(`⚫ Botão 'conf-${confType}' NÃO MOSTRADO (valor: ${conferences[confType]})`);
          }
        });

        // Marcar como enviado
        socket.initialConferencesSent = true;

        console.log(`✅ Status inicial das conferências enviado para sala ${roomId}: ${activeConferences.length} botões ativos [${activeConferences.join(', ')}]`);

      } catch (fileError) {
        console.log(`📄 Arquivo room.json não encontrado para conferências, usando configurações padrão`);
        socket.initialConferencesSent = true;
      }

    } catch (error) {
      console.error('❌ Erro ao verificar status inicial das conferências:', error);
    }
  };

  /**
   * Evento: jitsi-enabled
   * Liga o JITSI (simplesmente mostra os botões de conferência)
   */
  socket.on('jitsi-enabled', async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 3 ou isAdmin)
      const isAdmin = session.userData?.level === 3 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem controlar o JITSI' });
        return;
      }

      const { roomId, userId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      console.log(`🟢 Admin ${adminName} está HABILITANDO JITSI para sala ${roomId}`);

      try {
        await updateJitsiStatusInFile(roomId, true);

        // Notificar que JITSI está ativo (mostra botões de conferência)
        io.to(roomId).emit('jitsi-enabled');

        console.log(`✅ JITSI HABILITADO na sala ${roomId} por ${adminName}`);

        // FORCE SYNC para garantir que novos usuários vejam o Jitsi habilitado
        setTimeout(() => {
          const roomSockets = io.sockets.adapter.rooms.get(roomId);
          if (roomSockets) {
            roomSockets.forEach(socketId => {
              const targetSocket = io.sockets.sockets.get(socketId);
              if (targetSocket && userSessions.get(socketId)) {
                targetSocket.initialJitsiSent = false; // Reset flag para re-envio
              }
            });
          }
          console.log(`🔄 Force sync do Jitsi executado após habilitação`);
        }, 100);

      } catch (error) {
        console.error(`❌ Erro ao habilitar JITSI:`, error.message);
        socket.emit('error', { message: `Erro ao habilitar JITSI: ${error.message}` });
      }

    } catch (error) {
      console.error('❌ Erro no jitsi-enabled:', error);
      socket.emit('error', { message: 'Erro ao ativar JITSI' });
    }
  });

  /**
   * Evento: jitsi-disabled
   * Desliga o JITSI (simplesmente oculta os botões de conferência)
   */
  socket.on('jitsi-disabled', async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 3 ou isAdmin)
      const isAdmin = session.userData?.level === 3 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem controlar o servidor JITSI' });
        return;
      }

      const { roomId, userId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      console.log(`� Admin ${adminName} está DESABILITANDO JITSI para sala ${roomId}`);

      try {
        await updateJitsiStatusInFile(roomId, false);
        io.to(roomId).emit('jitsi-disabled');
        console.log(`✅ JITSI DESABILITADO na sala ${roomId} por ${adminName}`);

        // FORCE SYNC para garantir que novos usuários vejam o Jitsi desabilitado
        setTimeout(() => {
          const roomSockets = io.sockets.adapter.rooms.get(roomId);
          if (roomSockets) {
            roomSockets.forEach(socketId => {
              const targetSocket = io.sockets.sockets.get(socketId);
              if (targetSocket && userSessions.get(socketId)) {
                targetSocket.initialJitsiSent = false; // Reset flag para re-envio
              }
            });
          }
          console.log(`🔄 Force sync do Jitsi executado após desabilitação`);
        }, 100);

      } catch (error) {
        console.error(`❌ Erro ao desabilitar JITSI:`, error.message);
        socket.emit('error', { message: `Erro ao desabilitar JITSI: ${error.message}` });
      }

    } catch (error) {
      console.error('❌ Erro no jitsi-disabled:', error);
      socket.emit('error', { message: 'Erro ao desativar JITSI' });
    }
  });

  /**
   * Evento: update-jitsi
   * Verifica e atualiza o status do JITSI (simplesmente lê configuração local)
   */
  socket.on('update-jitsi', async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se é admin
      const isAdmin = session.userData?.level === 3 || session.userData?.isAdmin;
      if (!isAdmin) {
        console.warn(`⚠️ Usuário não-admin ${session.userData?.nome} tentou fazer update-jitsi`);
        return;
      }

      const { roomId } = session;
      console.log(`🔄 Admin ${session.userData?.nome} solicitou update-jitsi para sala ${roomId}`);

      // Ler status atual do JITSI usando a função auxiliar
      const { isJitsiEnabled } = await getJitsiStatusFromFile(roomId);

      // Emitir status atual baseado na configuração
      if (isJitsiEnabled) {
        socket.emit('jitsi', 'active');
        console.log(`📊 Status JITSI ATIVO enviado para sala ${roomId}`);
      } else {
        socket.emit('jitsi', 'off');
        console.log(`📊 Status JITSI INATIVO enviado para sala ${roomId}`);
      }

    } catch (error) {
      console.error('❌ Erro no update-jitsi:', error);
      socket.emit('error', { message: 'Erro ao verificar status do JITSI' });
    }
  });

  /**
   * Evento: get-jitsi-status
   * Verifica o status atual do JITSI (simplesmente lê configuração local)
   */
  socket.on('get-jitsi-status', async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      const { roomId } = session;

      // Ler status atual do JITSI usando a função auxiliar
      const { isJitsiEnabled } = await getJitsiStatusFromFile(roomId);

      // Emitir status atual baseado na configuração
      if (isJitsiEnabled) {
        socket.emit('jitsi', 'active');
        console.log(`📊 Status JITSI ATIVO enviado para sala ${roomId}`);
      } else {
        socket.emit('jitsi', 'off');
        console.log(`📊 Status JITSI INATIVO enviado para sala ${roomId}`);
      }

    } catch (error) {
      console.error('❌ Erro no get-jitsi-status:', error);
      socket.emit('error', { message: 'Erro ao verificar status do JITSI' });
    }
  });

  /**
   * Verificar e emitir status inicial do JITSI quando admin se conecta
   * VERSÁO SIMPLIFICADA - apenas lê configuração local
   */
  const checkInitialJitsiStatus = async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) return;

      // Verificar se é admin
      const isAdmin = session.userData?.level === 3 || session.userData?.isAdmin;
      if (!isAdmin) return;

      const { roomId, userData } = session;
      const userId = userData?.id;
      const userName = userData?.nome || userData?.nick || 'Admin';

      // CHAVE DE CACHE JITSI POR USUÁRIO
      const jitsiCacheKey = `${userId}-${roomId}-jitsi`;
      const now = Date.now();

      // VERIFICAR COOLDOWN DE 10 SEGUNDOS PARA JITSI
      if (adminStatusSent.has(jitsiCacheKey)) {
        const lastSent = adminStatusSent.get(jitsiCacheKey);
        const timeDiff = now - lastSent;
        if (timeDiff < 100) { // 0.5 segundos
          console.log(`⏰ Cooldown JITSI ativo para admin ${userName} (${Math.round((100 - timeDiff) / 1000)}s restantes)`);
          return;
        }
      }

      // Ler status atual do JITSI usando a função auxiliar
      const { isJitsiEnabled } = await getJitsiStatusFromFile(roomId);

      // REGISTRAR ENVIO COM COOLDOWN DE 10 SEGUNDOS
      adminStatusSent.set(jitsiCacheKey, now);

      // EMITIR STATUS BASEADO APENAS NA CONFIGURAÇÃO LOCAL
      if (isJitsiEnabled) {
        socket.emit("jitsi", "active");
        console.log(`🟢 EVENTO 'jitsi' ATIVO ENVIADO para ${userName} | roomId: ${roomId}`);
      } else {
        socket.emit("jitsi", "off");
        console.log(`🔴 EVENTO 'jitsi' INATIVO ENVIADO para ${userName} | roomId: ${roomId}`);
      }

    } catch (error) {
      console.error('❌ Erro ao verificar status inicial JITSI:', error);
    }
  };

  // Verificar status inicial da sala - OTIMIZADO para refresh e reconexões
  setTimeout(() => {
    const session = userSessions.get(socket.id);
    if (session && !socket.initialStatusSent) {
      // VERIFICAÇÃO UNIFICADA: Room + JITSI + CONFERÊNCIAS em sequência para todos os usuários
      checkInitialRoomStatus();

      // Verificar JITSI imediatamente após (apenas para admins)
      setTimeout(() => {
        if (userSessions.get(socket.id) && !socket.initialJitsiSent) {
          const sessionCheck = userSessions.get(socket.id);
          const isAdmin = sessionCheck?.userData?.level >= 1 || sessionCheck?.userData?.isAdmin;
          if (isAdmin) {
            checkInitialJitsiStatus();
          }
        }
      }, 50); // Apenas 50ms para permitir processamento

      // NOVO: Verificar conferências para TODOS os usuários (não só admins)
      setTimeout(() => {
        if (userSessions.get(socket.id) && !socket.initialConferencesSent) {
          checkInitialConferencesStatus();
        }
      }, 100); // 100ms após para permitir processamento do status básico
    }
  }, 30); // REDUZIDO para 30ms - mais responsivo para refresh

  // SEGUNDO SYNC para casos de refresh ou mudança de contexto
  setTimeout(() => {
    const session = userSessions.get(socket.id);
    if (session) {
      // Re-verificar status mesmo se já foi enviado (para casos de refresh)
      socket.initialStatusSent = false; // Reset flag para permitir nova verificação
      socket.initialConferencesSent = false; // Reset flag para conferências também

      checkInitialRoomStatus();

      // Re-sync das conferências também
      setTimeout(() => {
        if (userSessions.get(socket.id)) {
          checkInitialConferencesStatus();
        }
      }, 50);

      console.log(`♻️ Re-sync executado para garantir liveplayer E conferências após refresh/reconexão`);
    }
  }, 200); // 200ms depois para cobrir casos de refresh

  // ========================================
  // HANDLERS DE CONFERÊNCIA - FASE 1
  // ========================================

  /**
   * Handler para entrada em conferência JITSI
   * FASE 1: Logging avançado e notificação de outros usuários
   */
  socket.on('conference-join', (data) => {
    handleConferenceJoin(socket, data);
  });

  /**
   * Handler para saída de conferência JITSI
   * FASE 1: Logging avançado com duração da sessão
   */
  socket.on('conference-leave', (data) => {
    handleConferenceLeave(socket, data);
  });

  /**
   * Handler para movimento entre conferências (compatibilidade com sistema legado)
   * FASE 1: Mantém compatibilidade total com virtual_admin.js
   */
  socket.on('move', (confType, extra) => {
    console.log(`🔄 Evento 'move' recebido - ConfType: ${confType}, Extra: ${extra || 'null'}`);
    console.log(`� [MOVE DEBUG] Tipo do confType: ${typeof confType}`);
    console.log(`🔍 [MOVE DEBUG] Valor exato do confType: "${confType}"`);
    console.log(`🔍 [MOVE DEBUG] JSON.stringify do confType: ${JSON.stringify(confType)}`);
    console.log(`�👤 Usuário: ${socket.userData?.nome || 'Desconhecido'} (ID: ${socket.userData?.id || 'N/A'})`);
    console.log(`🏠 Sala: ${userSessions.get(socket.id)?.roomId || 'N/A'}`);
    handleMove(socket, confType, extra);
  });

  /**
   * FASE 1: Handler para quando usuário sai da conferência
   * Remove indicador de conferência do nick
   */
  socket.on('conference-exit', (confType) => {
    handleConferenceExit(socket, confType);
  });

  /**
   * Handler para solicitar estatísticas de conferência
   * FASE 1: API para admins visualizarem uso das salas
   */
  socket.on('get-conference-stats', async (data) => {
    await handleGetConferenceStats(socket, data);
  });

  /**
   * Evento: room-conf
   * Controlar visibilidade de botões de conferência específicos
   * Usado pelo painel admin para ativar/desativar conferências individuais
   */
  socket.on('room-conf', async (confType, limitData) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa
      const isAdmin = session.userData?.level >= 3 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem controlar conferências' });
        return;
      }

      const { roomId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';
      const adminId = session.userData?.id;

      console.log(`🎯 Admin ${adminName} controlando conferência '${confType}' para sala ${roomId}${limitData ? ` (limite: ${limitData})` : ''}`);

      // Ler configuração atual da sala
      const fs = require('fs').promises;
      const path = require('path');
      const roomPath = path.join(__dirname, '../../../api/room.json');
      let roomData = {};

      try {
        roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));
      } catch (error) {
        console.log(`📄 Criando novo room.json para sala ${roomId}`);
      }

      // Inicializar estrutura se necessário
      roomData.config = roomData.config || {};
      roomData.config.conferences = roomData.config.conferences || {};

      // Alternar estado da conferência
      const currentState = roomData.config.conferences[confType] || false;
      const newState = !currentState;

      console.log(`🔄 DEBUG: Conferência '${confType}' - Estado atual: ${currentState} → Novo estado: ${newState}`);

      roomData.config.conferences[confType] = newState;

      // Se tem dados de limite, armazenar
      if (limitData && newState) {
        roomData.config.conferences[`${confType}_limit`] = limitData;
        console.log(`📊 DEBUG: Limite adicionado para '${confType}':`, limitData);
      } else if (!newState) {
        // Se desativando, remover limite
        delete roomData.config.conferences[`${confType}_limit`];
        console.log(`🗑️ DEBUG: Limite removido para '${confType}'`);
      }

      // Salvar configuração
      console.log(`💾 DEBUG: Salvando configuração no room.json...`);
      console.log(`📄 DEBUG: Configurações de conferências antes de salvar:`, JSON.stringify(roomData.config.conferences, null, 2));

      await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));

      console.log(`✅ DEBUG: Configuração salva com sucesso no room.json`);

      // Preparar dados de resposta para todos os admins
      const confStatus = {
        [confType]: newState
      };

      if (limitData && newState) {
        confStatus[`${confType}_limit`] = limitData;
      }

      // Enviar confirmação para TODOS os admins conectados (não só o que enviou)
      const adminSockets = [];
      userSessions.forEach((userSession, socketId) => {
        if (userSession.roomId === roomId &&
          (userSession.userData?.level >= 3 || userSession.userData?.isAdmin)) {
          adminSockets.push(socketId);
        }
      });

      console.log(`📡 Enviando atualização de conferência para ${adminSockets.length} sessões de admin`);

      adminSockets.forEach(socketId => {
        const adminSocket = io.sockets.sockets.get(socketId);
        if (adminSocket) {
          adminSocket.emit('conf', confStatus, true);
        }
      });

      // Transmitir para todos os usuários da sala usando eventos que o frontend legado entende
      if (newState) {
        // Mostrar botão removendo classe live-hidden-conf-[tipo]
        io.to(roomId).emit('show', `conf-${confType}`);
        console.log(`👁️  Mostrando botão de conferência '${confType}' para sala ${roomId}`);
      } else {
        // Ocultar botão adicionando classe live-hidden-conf-[tipo]
        io.to(roomId).emit('hide', `conf-${confType}`);
        console.log(`🙈 Ocultando botão de conferência '${confType}' para sala ${roomId}`);
      }

      console.log(`✅ Conferência '${confType}' ${newState ? 'ATIVADA' : 'DESATIVADA'} para sala ${roomId} por ${adminName}`);

      // FORCE SYNC para garantir que usuários que entrarem/recarregarem vejam os botões
      setTimeout(async () => {
        // Re-aplicar todas as configurações de conferências para novos usuários
        try {
          const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));
          const conferences = roomData.config?.conferences || {};

          // Enviar para todos os sockets da sala
          const roomSockets = io.sockets.adapter.rooms.get(roomId);
          if (roomSockets) {
            roomSockets.forEach(socketId => {
              const targetSocket = io.sockets.sockets.get(socketId);
              if (targetSocket && userSessions.get(socketId)) {
                // Reset flag e re-enviar
                targetSocket.initialConferencesSent = false;

                // Re-enviar todas as conferências ativas
                Object.keys(conferences).forEach(cType => {
                  if (!cType.includes('_limit') && conferences[cType] === true) {
                    targetSocket.emit('show', `conf-${cType}`);
                  }
                });
              }
            });
          }
          console.log(`🔄 Force sync das conferências executado após mudança admin`);
        } catch (syncError) {
          console.warn(`⚠️ Erro no force sync das conferências:`, syncError.message);
        }
      }, 100);

    } catch (error) {
      console.error(`❌ Erro no room-conf:`, error);
      socket.emit('error', { message: 'Erro ao controlar conferência' });
    }
  });

  /**
   * Evento: room-info
   * Definir mensagem do quadro de avisos (visível apenas quando offline)
   */
  socket.on('room-info', async (message) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa
      const isAdmin = session.userData?.level >= 3 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem definir o quadro de avisos' });
        return;
      }

      const { roomId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // Validar e sanitizar mensagem
      const cleanMessage = message ? String(message).trim() : '';

      console.log(`📋 Admin ${adminName} ${cleanMessage ? 'definiu' : 'limpou'} quadro de avisos na sala ${roomId}`);

      // Salvar mensagem no room.json
      try {
        const roomPath = path.join(__dirname, '../../../api/room.json');
        const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));

        roomData.config = roomData.config || {};
        roomData.config.info_message = cleanMessage;
        roomData.config.info_updated_at = new Date().toISOString();
        roomData.config.info_updated_by = {
          id: session.userData?.id,
          name: adminName
        };

        await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));

        console.log(`✅ Mensagem do quadro de avisos salva no room.json`);

      } catch (fileError) {
        console.error('❌ Erro ao salvar mensagem no room.json:', fileError);
        socket.emit('error', { message: 'Erro ao salvar mensagem' });
        return;
      }

      // Broadcast da mensagem para todos os usuários da sala
      io.to(roomId).emit('info', cleanMessage);

      // Log da operação
      console.log(`📢 Mensagem do quadro de avisos enviada para sala ${roomId}: ${cleanMessage ? `"${cleanMessage.substring(0, 50)}${cleanMessage.length > 50 ? '...' : ''}"` : 'REMOVIDA'}`);

    } catch (error) {
      console.error('❌ Erro no room-info:', error);
      socket.emit('error', { message: 'Erro interno ao processar quadro de avisos' });
    }
  });

  /**
   * Evento: update-conf
   * Carregar configurações salvas das conferências do room.json
   * Este handler é chamado pelo frontend para recuperar o estado das conferências
   */
  socket.on('update-conf', async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      const { roomId } = session;

      console.log(`🔄 Carregando configurações de conferências para sala ${roomId}`);

      // Ler configurações do room.json
      const roomPath = path.join(__dirname, '../../../api/room.json');
      let roomData = {};

      try {
        const data = await fs.readFile(roomPath, 'utf8');
        roomData = JSON.parse(data);
      } catch (error) {
        console.log(`📄 Arquivo room.json não encontrado ou inválido para sala ${roomId}, usando configurações padrão`);
        roomData = {};
      }

      // Extrair configurações das conferências
      const conferences = roomData.config?.conferences || {};

      // Preparar dados no formato esperado pelo frontend
      const confData = {
        professor: conferences.professor || false,
        reuniao: conferences.reuniao || false,
        equipe: conferences.equipe || false,
        atendimento: conferences.atendimento || false,
        projeto: conferences.projeto || false,
        oracao: conferences.oracao || false,
        breakout: conferences.breakout || false,
        grupo: conferences.grupo || false,
        rede: conferences.rede || false,
        turma: conferences.turma || false
      };

      // Incluir limites se existirem
      if (conferences.professor_limit) {
        confData.professor_limit = conferences.professor_limit;
      }

      // Emitir configurações para o socket que solicitou
      socket.emit('conf', confData, false);

      console.log(`✅ Configurações de conferências enviadas para sala ${roomId}:`, confData);

    } catch (error) {
      console.error('❌ Erro no update-conf:', error);
      socket.emit('error', { message: 'Erro ao carregar configurações das conferências' });
    }
  });

  /**
   * Evento: update-delay
   * Carregar configuração do delay atual do room.json
   * Este handler é chamado pelo frontend para recuperar o delay configurado
   */
  socket.on('update-delay', async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      const { roomId } = session;

      console.log(`⏱️ Carregando configuração de delay para sala ${roomId}`);

      // Ler configurações do room.json
      const roomPath = path.join(__dirname, '../../../api/room.json');
      let delayValue = 0; // Valor padrão

      try {
        const data = await fs.readFile(roomPath, 'utf8');
        const roomData = JSON.parse(data);
        delayValue = roomData.config?.stream_delay || 0;
      } catch (error) {
        console.log(`📄 Usando delay padrão (0) para sala ${roomId}`);
      }

      // Emitir delay para o socket que solicitou
      socket.emit('delay', delayValue, false);

      console.log(`✅ Delay enviado para sala ${roomId}: ${delayValue}s`);

    } catch (error) {
      console.error('❌ Erro no update-delay:', error);
      socket.emit('error', { message: 'Erro ao carregar configuração de delay' });
    }
  });

  /**
   * Evento: room-breakout
   * Sistema de divisão automática de grupos (SALA DO GRUPO [RAND])
   * Distribui participantes online em grupos aleatórios
   */
  socket.on('room-breakout', async (config) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa
      const isAdmin = session.userData?.level >= 2 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem dividir grupos' });
        return;
      }

      const { roomId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // Se config é 0, desligar sistema de breakout
      if (config === 0 || config === '0') {
        console.log(`🔄 Admin ${adminName} desligou sistema de breakout na sala ${roomId}`);

        // Limpar grupos de todos os participantes
        await clearAllGroups(roomId);

        // Atualizar room.json para desativar breakout nas conferences
        try {
          const roomPath = path.join(__dirname, '../../../api/room.json');
          let roomData = {};

          try {
            roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));
          } catch (error) {
            console.log(`📄 Criando novo room.json para sala ${roomId}`);
          }

          roomData.config = roomData.config || {};
          roomData.config.conferences = roomData.config.conferences || {};
          roomData.config.conferences.breakout = false;

          await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));
          console.log(`✅ Breakout desativado no room.json`);
        } catch (error) {
          console.error('❌ Erro ao atualizar room.json:', error);
        }

        // Notificar todos os usuários
        io.to(roomId).emit('breakout', null);  // Para o painel admin
        io.to(roomId).emit('hide', 'conf-breakout');  // Para ocultar botão na sala virtual
        io.to(roomId).emit('participants-updated');

        console.log(`✅ Sistema de breakout desligado na sala ${roomId} - botão ocultado`);
        return;
      }

      // Validar e processar configuração
      const configStr = String(config).trim();
      if (!configStr || configStr.length === 0) {
        socket.emit('error', { message: 'Configuração de breakout inválida' });
        return;
      }

      const separateBySex = configStr.includes('*');
      const groupSizeStr = configStr.replace('*', '');
      const groupSize = parseInt(groupSizeStr);

      if (isNaN(groupSize) || groupSize < 1 || groupSize > 50) {
        socket.emit('error', { message: 'Tamanho de grupo deve ser entre 1 e 50' });
        return;
      }

      console.log(`🔄 Admin ${adminName} iniciou divisão de grupos na sala ${roomId}: ${groupSize} pessoas${separateBySex ? ' (separado por sexo)' : ''}`);

      // Buscar participantes online
      const onlineParticipants = await getOnlineParticipantsForBreakout(roomId);

      if (onlineParticipants.length === 0) {
        socket.emit('error', { message: 'Nenhum participante online para dividir em grupos' });
        return;
      }

      console.log(`👥 Encontrados ${onlineParticipants.length} participantes online para dividir`);

      // Dividir em grupos
      const groups = divideParticipantsIntoGroups(onlineParticipants, groupSize, separateBySex);

      if (groups.length === 0) {
        socket.emit('error', { message: 'Erro ao dividir participantes em grupos' });
        return;
      }

      // Atualizar room.json para ativar breakout nas conferences
      try {
        const roomPath = path.join(__dirname, '../../../api/room.json');
        let roomData = {};

        try {
          roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));
        } catch (error) {
          console.log(`📄 Criando novo room.json para sala ${roomId}`);
        }

        roomData.config = roomData.config || {};
        roomData.config.conferences = roomData.config.conferences || {};
        roomData.config.conferences.breakout = true;

        await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));
        console.log(`✅ Breakout ativado no room.json`);
      } catch (error) {
        console.error('❌ Erro ao atualizar room.json:', error);
      }

      // Atualizar arquivo participantes.json
      await updateParticipantsWithGroups(roomId, groups);

      // Notificar todos os usuários
      io.to(roomId).emit('breakout', configStr);  // Para o painel admin
      io.to(roomId).emit('show', 'conf-breakout');  // Para mostrar botão na sala virtual
      io.to(roomId).emit('participants-updated');

      console.log(`✅ Divisão de grupos concluída na sala ${roomId}: ${groups.length} grupos criados`);
      console.log(`📊 Distribuição: ${groups.map((g, i) => `G${i + 1}(${g.length})`).join(', ')}`);

    } catch (error) {
      console.error('❌ Erro no room-breakout:', error);
      socket.emit('error', { message: 'Erro interno ao processar divisão de grupos' });
    }
  });

  // ========================================
  // HANDLERS DE STREAMING E LIVE
  // ========================================

  /**
   * Evento: stream-url-set
   * Define URL de streaming personalizada para a sessão atual
   */
  socket.on('stream-url-set', async (streamUrl) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem definir URL de streaming' });
        return;
      }

      const { roomId, userId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // Validar URL
      const cleanUrl = streamUrl ? String(streamUrl).trim() : '';

      console.log(`🎥 Admin ${adminName} ${cleanUrl ? 'definiu' : 'removeu'} URL de streaming para sala ${roomId}: ${cleanUrl}`);

      // Salvar URL no room.json
      try {
        const roomPath = path.join(__dirname, '../../../api/room.json');
        const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));

        roomData.config = roomData.config || {};
        roomData.config.stream_url = cleanUrl;
        roomData.config.stream_updated_at = new Date().toISOString();
        roomData.config.stream_updated_by = {
          id: userId,
          name: adminName
        };

        await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));

        // INVALIDAR CACHE para forçar releitura
        globalStatusCache.delete(roomId);
        console.log(`✅ URL de streaming atualizada no room.json`);

      } catch (fileError) {
        console.error('❌ Erro ao salvar URL de streaming no room.json:', fileError);
        socket.emit('error', { message: 'Erro ao salvar URL de streaming' });
        return;
      }

      // Se a transmissão está ativa, notificar todos os usuários da nova URL
      try {
        const roomPath = path.join(__dirname, '../../../api/room.json');
        const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));

        if (roomData.config?.live_enabled && cleanUrl) {
          // Transmissão ativa + nova URL = recarregar player
          io.to(roomId).emit('stream-url-updated', {
            streamUrl: cleanUrl,
            adminName,
            timestamp: new Date().toISOString()
          });

          console.log(`🔄 Notificação de nova URL enviada para todos os usuários da sala ${roomId}`);
        }

      } catch (error) {
        console.warn(`⚠️ Erro ao verificar status da transmissão:`, error.message);
      }

      // Confirmar para o admin
      socket.emit('stream-url-set-success', {
        streamUrl: cleanUrl,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Erro no stream-url-set:', error);
      socket.emit('error', { message: 'Erro ao definir URL de streaming' });
    }
  });

  /**
   * Evento: load-live-player
   * Carrega player de streaming com URL específica (compatibilidade com virtual.js)
   */
  socket.on('load-live-player', async (data) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      const { roomId } = session;
      const { streamUrl, title = '', sessionNumber = 0 } = data || {};

      console.log(`📺 Carregando live player para sala ${roomId}: ${streamUrl || 'URL padrão'} (sessão: ${sessionNumber})`);

      // Buscar URL de streaming configurada se não fornecida
      let finalStreamUrl = streamUrl;
      let streamTitle = title;

      if (!finalStreamUrl) {
        try {
          const roomPath = path.join(__dirname, '../../../api/room.json');
          const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));

          finalStreamUrl = roomData.config?.stream_url || '';

          // Se sessionNumber fornecido, buscar URL específica da sessão
          if (sessionNumber > 0) {
            try {
              const sessoesPath = path.join(__dirname, '../../../api/sessoes.json');
              const sessoesData = JSON.parse(await fs.readFile(sessoesPath, 'utf8'));

              // Buscar sessão específica
              const sessao = Object.values(sessoesData).find(s => s.session === sessionNumber);
              if (sessao && sessao.live_url) {
                finalStreamUrl = sessao.live_url;
                streamTitle = sessao.title || streamTitle;
                console.log(`🎯 URL da sessão ${sessionNumber} encontrada: ${finalStreamUrl}`);
              }
            } catch (sessoesError) {
              console.warn(`⚠️ Erro ao buscar dados da sessão ${sessionNumber}:`, sessoesError.message);
            }
          }

        } catch (roomError) {
          console.warn(`⚠️ Erro ao buscar URL configurada:`, roomError.message);
        }
      }

      if (!finalStreamUrl) {
        socket.emit('live-player-error', { message: 'Nenhuma URL de streaming configurada' });
        return;
      }

      // Emitir comando para carregar player (formato esperado pelo virtual.js)
      socket.emit('live-player-load', {
        streamUrl: finalStreamUrl,
        title: streamTitle,
        sessionNumber,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Comando de carregamento do live player enviado para usuário na sala ${roomId}`);

    } catch (error) {
      console.error('❌ Erro no load-live-player:', error);
      socket.emit('error', { message: 'Erro ao carregar live player' });
    }
  });

  /**
   * Evento: remove-live-player
   * Remove player de streaming ativo (compatibilidade com virtual.js)
   */
  socket.on('remove-live-player', async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) return;

      const { roomId } = session;

      console.log(`🚫 Removendo live player para usuário na sala ${roomId}`);

      // Emitir comando para remover player (formato esperado pelo virtual.js)
      socket.emit('live-player-remove', {
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Comando de remoção do live player enviado para usuário na sala ${roomId}`);

    } catch (error) {
      console.error('❌ Erro no remove-live-player:', error);
      socket.emit('error', { message: 'Erro ao remover live player' });
    }
  });

  /**
   * Evento: get-stream-info
   * Obter informações atuais do streaming
   */
  socket.on('get-stream-info', async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      const { roomId } = session;

      // Ler informações do streaming da sala
      try {
        const roomPath = path.join(__dirname, '../../../api/room.json');
        const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));

        const streamInfo = {
          isActive: roomData.config?.live_enabled || false,
          startTime: roomData.config?.last_online || null,
          currentTime: new Date().toISOString()
        };

        socket.emit('stream-info', streamInfo);
      } catch (error) {
        console.warn(`⚠️ Erro ao ler room.json:`, error.message);
        socket.emit('stream-info', {
          isActive: false,
          startTime: null,
          currentTime: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('❌ Erro no get-stream-info:', error);
      socket.emit('error', { message: 'Erro ao obter informações de streaming' });
    }
  });

  /**
   * Evento: session-online
   * Ativa transmissão para uma sessão específica do cronograma
   */
  socket.on('session-online', async (sessionNumber) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem ativar sessões' });
        return;
      }

      const { roomId, userId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      console.log(`🎬 Admin ${adminName} ativando sessão ${sessionNumber} para sala ${roomId}`);

      // Buscar dados da sessão
      let sessionData = null;
      try {
        const sessoesPath = path.join(__dirname, '../../../api/sessoes.json');
        const sessoesData = JSON.parse(await fs.readFile(sessoesPath, 'utf8'));

        sessionData = Object.values(sessoesData).find(s => s.session === parseInt(sessionNumber));

        if (!sessionData) {
          socket.emit('error', { message: `Sessão ${sessionNumber} não encontrada` });
          return;
        }

      } catch (sessoesError) {
        console.error(`❌ Erro ao buscar dados da sessão ${sessionNumber}:`, sessoesError.message);
        socket.emit('error', { message: 'Erro ao buscar dados da sessão' });
        return;
      }

      // Ativar transmissão geral
      try {
        const roomPath = path.join(__dirname, '../../../api/room.json');
        const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));

        roomData.config = roomData.config || {};
        roomData.config.live_enabled = true;
        roomData.config.last_online = new Date().toISOString();
        roomData.config.active_session = sessionNumber;

        // Se a sessão tem URL específica, usar ela
        if (sessionData.live_url) {
          roomData.config.stream_url = sessionData.live_url;
        }

        await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));

        // INVALIDAR CACHE
        globalStatusCache.delete(roomId);

        console.log(`✅ Sessão ${sessionNumber} ativada com sucesso`);

      } catch (roomError) {
        console.error(`❌ Erro ao ativar sessão no room.json:`, roomError.message);
        socket.emit('error', { message: 'Erro ao ativar sessão' });
        return;
      }

      // Preparar dados do evento com informações da sessão
      const eventData = {
        sessionNumber: parseInt(sessionNumber),
        streamUrl: sessionData.live_url || '',
        title: sessionData.title || '',
        subtitle: sessionData.subtitle || '',
        description: sessionData.description || '',
        adminName,
        adminId: userId,
        timestamp: Date.now()
      };

      // Notificar todos os usuários da sala com evento 'online' que incluí número da sessão
      // COMPATIBILIDADE CRÍTICA: frontend espera streamUrl diretamente como string OU número da sessão
      io.to(roomId).emit('online', parseInt(sessionNumber));

      // Log da ação
      console.log(`🎬 Sessão ${sessionNumber} ATIVADA na sala ${roomId} por ${adminName} - Título: ${sessionData.title}`);

    } catch (error) {
      console.error('❌ Erro no session-online:', error);
      socket.emit('error', { message: 'Erro ao ativar sessão' });
    }
  });

  // ========================================
  // HANDLERS DE CHAT CONTROL
  // ========================================

  /**
   * Evento: chat-enabled
   * Ativa o chat para todos os usuários da sala
   */
  socket.on('chat-enabled', async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem controlar o chat' });
        return;
      }

      const { roomId, userId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      console.log(`💬 Admin ${adminName} está ATIVANDO chat para sala ${roomId}`);

      // PERSISTIR ESTADO NO ROOM.JSON
      await updateRoomAdminStates(roomId, {
        chat_enabled: true,
        chat_updated_at: new Date().toISOString(),
        chat_updated_by: {
          id: session.userData.id,
          name: adminName
        }
      });

      // Notificar todos os usuários da sala
      io.to(roomId).emit('enabled');

      console.log(`📡 Chat ATIVADO na sala ${roomId} por ${adminName} - Evento 'enabled' enviado para ${io.sockets.adapter.rooms.get(roomId)?.size || 0} clientes`);

    } catch (error) {
      console.error('❌ Erro no chat-enabled:', error);
      socket.emit('error', { message: 'Erro ao ativar chat' });
    }
  });

  /**
   * Evento: chat-disabled
   * Desativa o chat para todos os usuários da sala
   */
  socket.on('chat-disabled', async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem controlar o chat' });
        return;
      }

      const { roomId, userId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      console.log(`💬 Admin ${adminName} está DESATIVANDO chat para sala ${roomId}`);

      // PERSISTIR ESTADO NO ROOM.JSON
      await updateRoomAdminStates(roomId, {
        chat_enabled: false,
        chat_updated_at: new Date().toISOString(),
        chat_updated_by: {
          id: session.userData.id,
          name: adminName
        }
      });

      // Notificar todos os usuários da sala
      io.to(roomId).emit('disabled');

      console.log(`📡 Chat DESATIVADO na sala ${roomId} por ${adminName} - Evento 'disabled' enviado para ${io.sockets.adapter.rooms.get(roomId)?.size || 0} clientes`);

    } catch (error) {
      console.error('❌ Erro no chat-disabled:', error);
      socket.emit('error', { message: 'Erro ao desativar chat' });
    }
  });

  // ========================================
  // HANDLERS DE ATALHOS DO PAINEL ADMIN
  // ========================================

  /**
   * Evento: stream-timer
   * Controla o timer com texto na tela (usado pelos atalhos INTERVALO, EXERCÍCIO, COMPARTILHAR)
   */
  socket.on('stream-timer', async (timerData) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem controlar o timer' });
        return;
      }

      const { roomId, userId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // CORREÇÃO: Admin deve sempre enviar eventos para a sala principal "pub"
      // independente de onde esteja conectado
      const targetRoomId = roomId === 'admin' ? 'pub' : roomId;

      if (!timerData || timerData.trim() === '') {
        // Sem dados = desativar timer
        console.log(`⏹️ Admin ${adminName} está desativando timer na sala ${targetRoomId}`);

        // Notificar todos os usuários para desativar timer
        io.to(targetRoomId).emit('timer', null, 0);

        console.log(`✅ Timer desativado na sala ${targetRoomId} - Evento 'timer' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);
        return;
      }

      // Processar dados do timer
      const cleanTimerData = String(timerData).trim();
      let timerText = '';
      let targetTime = null;
      let seconds = 0;

      // Verificar se contém separador " | " (formato: "HH:MM | TEXTO" ou "MINUTOS | TEXTO")
      if (cleanTimerData.includes(' | ')) {
        const [timePart, textPart] = cleanTimerData.split(' | ', 2);
        timerText = textPart.trim();

        // Verificar se é horário (HH:MM) ou minutos
        if (timePart.includes(':')) {
          // Formato horário HH:MM
          const [hours, minutes] = timePart.split(':').map(num => parseInt(num.trim(), 10));
          if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            const now = new Date();
            targetTime = new Date();
            targetTime.setHours(hours, minutes, 0, 0);

            // Se o horário já passou hoje, assumir que é para amanhã
            if (targetTime <= now) {
              targetTime.setDate(targetTime.getDate() + 1);
            }

            seconds = Math.floor((targetTime - now) / 1000);
          }
        } else {
          // Formato minutos
          const minutesToAdd = parseInt(timePart.trim(), 10);
          if (!isNaN(minutesToAdd) && minutesToAdd > 0) {
            const now = new Date();
            targetTime = new Date(now.getTime() + (minutesToAdd * 60 * 1000));
            seconds = minutesToAdd * 60;
          }
        }
      } else {
        // Formato simples: apenas timer sem texto específico
        if (cleanTimerData.includes(':')) {
          // Formato horário HH:MM
          const [hours, minutes] = cleanTimerData.split(':').map(num => parseInt(num.trim(), 10));
          if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            const now = new Date();
            targetTime = new Date();
            targetTime.setHours(hours, minutes, 0, 0);

            // Se o horário já passou hoje, assumir que é para amanhã
            if (targetTime <= now) {
              targetTime.setDate(targetTime.getDate() + 1);
            }

            seconds = Math.floor((targetTime - now) / 1000);
            timerText = 'TIMER';
          }
        } else {
          // Formato minutos
          const minutesToAdd = parseInt(cleanTimerData.trim(), 10);
          if (!isNaN(minutesToAdd) && minutesToAdd > 0) {
            const now = new Date();
            targetTime = new Date(now.getTime() + (minutesToAdd * 60 * 1000));
            seconds = minutesToAdd * 60;
            timerText = 'TIMER';
          }
        }
      }

      if (!targetTime || seconds <= 0) {
        socket.emit('error', { message: 'Formato de timer inválido. Use HH:MM ou minutos' });
        return;
      }

      console.log(`⏰ Admin ${adminName} está ativando timer na sala ${targetRoomId}: ${targetTime.toLocaleTimeString('pt-BR')} (${Math.round(seconds / 60)} min) - Texto: "${timerText}"`);

      // Notificar todos os usuários para ativar timer
      io.to(targetRoomId).emit('timer', targetTime.toISOString(), seconds);

      // Se tem texto associado, também enviar lower
      if (timerText && timerText !== 'TIMER') {
        io.to(targetRoomId).emit('lower', {
          main: timerText,
          sub: ''
        });
      }

      console.log(`✅ Timer ativado na sala ${targetRoomId} - Eventos enviados para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);

    } catch (error) {
      console.error('❌ Erro no stream-timer:', error);
      socket.emit('error', { message: 'Erro ao controlar timer' });
    }
  });

  /**
   * Evento: stream-lower
   * Controla texto na parte inferior da tela (usado pelos atalhos quando não há timer)
   */
  socket.on('stream-lower', async (lowerText) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem controlar mensagens na tela' });
        return;
      }

      const { roomId, userId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // CORREÇÃO: Admin deve sempre enviar eventos para a sala principal "pub"
      // independente de onde esteja conectado
      const targetRoomId = roomId === 'admin' ? 'pub' : roomId;

      if (!lowerText || lowerText.trim() === '') {
        // Sem texto = remover mensagem da tela
        console.log(`📺 Admin ${adminName} está removendo mensagem da tela na sala ${targetRoomId}`);

        // Notificar todos os usuários para remover lower
        io.to(targetRoomId).emit('lower', null);

        console.log(`✅ Mensagem removida da tela na sala ${targetRoomId} - Evento 'lower' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);
        return;
      }

      const cleanText = String(lowerText).trim();

      console.log(`📺 Admin ${adminName} está exibindo mensagem na tela da sala ${targetRoomId}: "${cleanText}"`);

      // Notificar todos os usuários para exibir lower
      io.to(targetRoomId).emit('lower', {
        main: cleanText,
        sub: ''
      });

      console.log(`✅ Mensagem exibida na tela da sala ${targetRoomId} - Evento 'lower' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);

    } catch (error) {
      console.error('❌ Erro no stream-lower:', error);
      socket.emit('error', { message: 'Erro ao controlar mensagem na tela' });
    }
  });

  /**
   * Evento: stream-fastest
   * Ativa o modo "Mais Rápido" para destacar participante mais rápido
   */
  socket.on('stream-fastest', async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem ativar modo mais rápido' });
        return;
      }

      const { roomId, userId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // CORREÇÃO: Admin deve sempre enviar eventos para a sala principal "pub"
      // independente de onde esteja conectado
      const targetRoomId = roomId === 'admin' ? 'pub' : roomId;

      console.log(`🏆 Admin ${adminName} está ativando modo "Mais Rápido" na sala ${targetRoomId}`);

      // Notificar todos os usuários para exibir "MAIS RÁPIDO"
      io.to(targetRoomId).emit('lower', {
        main: '',
        sub: 'MAIS RÁPIDO'
      });

      console.log(`✅ Modo "Mais Rápido" ativado na sala ${targetRoomId} - Evento 'lower' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);

    } catch (error) {
      console.error('❌ Erro no stream-fastest:', error);
      socket.emit('error', { message: 'Erro ao ativar modo mais rápido' });
    }
  });

  // HANDLERS DE PROGRAMA
  // ========================================

  /**
   * Evento: stream-vote
   * Controla sistema de enquetes/votação em tempo real
   */
  socket.on('stream-vote', async (voteData) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem controlar enquetes' });
        return;
      }

      const { roomId, userId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // CORREÇÃO: Admin deve sempre enviar eventos para a sala principal "pub"
      const targetRoomId = roomId === 'admin' ? 'pub' : roomId;

      if (!voteData || voteData.trim() === '') {
        // Sem dados = finalizar enquete
        console.log(`🗳️ Admin ${adminName} está finalizando enquete na sala ${targetRoomId}`);

        // Remover enquete ativa
        activePolls.delete(targetRoomId);

        // Notificar todos os usuários para finalizar enquete
        io.to(targetRoomId).emit('vote', null);

        console.log(`✅ Enquete finalizada na sala ${targetRoomId} - Evento 'vote' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);
        return;
      }

      // Processar dados da enquete (formato: "Pergunta | resposta1 | resposta2 | ...")
      const cleanVoteData = String(voteData).trim();
      const parts = cleanVoteData.split('|').map(part => part.trim());

      if (parts.length < 1) {
        socket.emit('error', { message: 'Formato inválido. Use: Pergunta | resposta1 | resposta2 | ...' });
        return;
      }

      const question = parts[0];
      const answers = parts.slice(1).filter(answer => answer.length > 0);

      console.log(`🗳️ Admin ${adminName} está iniciando enquete na sala ${targetRoomId}: "${question}" com ${answers.length} opções`);

      // Registrar enquete ativa
      activePolls.set(targetRoomId, {
        question: question,
        answers: answers,
        votes: new Map(),
        startTime: Date.now()
      });

      // Notificar todos os usuários para iniciar enquete
      io.to(targetRoomId).emit('vote', {
        question: question,
        answers: answers
      });

      console.log(`✅ Enquete iniciada na sala ${targetRoomId} - Evento 'vote' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);

    } catch (error) {
      console.error('❌ Erro no stream-vote:', error);
      socket.emit('error', { message: 'Erro ao controlar enquete' });
    }
  });

  /**
   * Evento: stream-notify
   * Envia notificações desktop silenciosas para participantes
   */
  socket.on('stream-notify', async (notifyData) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem enviar notificações' });
        return;
      }

      const { roomId, userId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // CORREÇÃO: Admin deve sempre enviar eventos para a sala principal "pub"
      const targetRoomId = roomId === 'admin' ? 'pub' : roomId;

      console.log(`🏠 Admin na sala: ${roomId}, enviando para: ${targetRoomId}`);
      console.log(`👥 Usuários conectados na sala ${targetRoomId}:`, io.sockets.adapter.rooms.get(targetRoomId)?.size || 0);

      if (!notifyData || notifyData.trim() === '') {
        socket.emit('error', { message: 'Mensagem de notificação não pode estar vazia' });
        return;
      }

      // Processar dados da notificação (formato: "Texto | extra (opcional)")
      const cleanNotifyData = String(notifyData).trim();
      const parts = cleanNotifyData.split('|').map(part => part.trim());

      const message = parts[0];
      const extra = parts.length > 1 ? parts[1] : '';

      console.log(`🔔 Admin ${adminName} está enviando notificação na sala ${targetRoomId}: "${message}"${extra ? ` | ${extra}` : ''}`);

      // Notificar todos os usuários
      io.to(targetRoomId).emit('notification', message, extra || null);

      console.log(`✅ Notificação enviada na sala ${targetRoomId} - Evento 'notification' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);

    } catch (error) {
      console.error('❌ Erro no stream-notify:', error);
      socket.emit('error', { message: 'Erro ao enviar notificação' });
    }
  });

  /**
   * Evento: stream-sound
   * Envia alerta sonoro para participantes (complementa stream-notify)
   */
  socket.on('stream-sound', async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem enviar alertas sonoros' });
        return;
      }

      const { roomId, userId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // CORREÇÃO: Admin deve sempre enviar eventos para a sala principal "pub"
      const targetRoomId = roomId === 'admin' ? 'pub' : roomId;

      console.log(`🚨 Admin ${adminName} está enviando alerta sonoro na sala ${targetRoomId}`);

      // Notificar todos os usuários para reproduzir som de alerta
      io.to(targetRoomId).emit('sound');

      console.log(`✅ Alerta sonoro enviado na sala ${targetRoomId} - Evento 'sound' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);

    } catch (error) {
      console.error('❌ Erro no stream-sound:', error);
      socket.emit('error', { message: 'Erro ao enviar alerta sonoro' });
    }
  });

  /**
   * Evento: stream-checkin
   * Inicia/finaliza verificação de presença para participantes
   */
  socket.on('stream-checkin', async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem controlar verificação de presença' });
        return;
      }

      const { roomId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // CORREÇÃO: Admin deve sempre enviar eventos para a sala principal "pub"
      const targetRoomId = roomId === 'admin' ? 'pub' : roomId;

      // Toggle: Se já existe um checkin ativo, finalizar; senão, iniciar
      const currentCheckinState = checkinStates.get(targetRoomId) || false;
      const newCheckinState = !currentCheckinState;

      checkinStates.set(targetRoomId, newCheckinState);

      // PERSISTIR ESTADO NO ROOM.JSON
      await updateRoomAdminStates(targetRoomId, {
        checkin_active: newCheckinState,
        checkin_updated_at: new Date().toISOString(),
        checkin_updated_by: {
          id: session.userData.id,
          name: adminName
        }
      });

      console.log(`🔍 Admin ${adminName} ${newCheckinState ? 'iniciou' : 'finalizou'} verificação de presença na sala ${targetRoomId}`);

      // Se finalizando checkin, limpar estado de presença de todos os usuários
      if (!newCheckinState) {
        userSessions.forEach((userSession, socketId) => {
          if (userSession.roomId === targetRoomId && userSession.userData?.extra) {
            userSession.userData.extra.checkin = 0;
          }
        });
      }

      // Notificar todos os usuários sobre o estado da verificação de presença
      io.to(targetRoomId).emit('checkin', newCheckinState);

      console.log(`✅ Verificação de presença ${newCheckinState ? 'iniciada' : 'finalizada'} na sala ${targetRoomId} - Evento 'checkin' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);

    } catch (error) {
      console.error('❌ Erro no stream-checkin:', error);
      socket.emit('error', { message: 'Erro ao controlar verificação de presença' });
    }
  });

  /**
   * Evento: checked
   * Usuário confirma sua presença durante verificação ativa
   */
  socket.on('checked', async (sessionItem) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      const { roomId, userId } = session;
      const userName = session.userData?.nome || session.userData?.nick || 'Usuário';

      // Verificar se há verificação de presença ativa na sala
      const targetRoomId = roomId === 'admin' ? 'pub' : roomId;
      const checkinActive = checkinStates.get(targetRoomId);

      if (!checkinActive) {
        socket.emit('error', { message: 'Não há verificação de presença ativa no momento' });
        return;
      }

      // Marcar presença confirmada para este usuário
      if (session.userData?.extra) {
        session.userData.extra.checkin = 1;
      }

      console.log(`✅ ${userName} (ID: ${userId}) confirmou presença na sala ${targetRoomId} (item: ${sessionItem || 'N/A'})`);

      // Notificar o próprio usuário que sua presença foi confirmada
      socket.emit('user-checked', userId, session.userData?.extra?.extid);

      // Notificar todos os outros usuários da sala sobre a confirmação (para atualizar lista visual)
      socket.to(targetRoomId).emit('user-checked', userId, session.userData?.extra?.extid);

      // Emitir atualização da lista de participantes
      io.to(targetRoomId).emit('participants-updated');

    } catch (error) {
      console.error('❌ Erro no checked:', error);
      socket.emit('error', { message: 'Erro ao confirmar presença' });
    }
  });

  /**
   * Evento: checkins
   * Solicitar estado atual de checkins (sincronização para admin)
   */
  socket.on('checkins', async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) return;

      const { roomId } = session;
      const targetRoomId = roomId === 'admin' ? 'pub' : roomId;

      // Enviar estado atual do checkin para o solicitante
      const checkinActive = checkinStates.get(targetRoomId) || false;
      socket.emit('checkin', checkinActive);

      console.log(`🔄 Estado de checkin sincronizado para sala ${targetRoomId}: ${checkinActive ? 'ATIVO' : 'INATIVO'}`);

    } catch (error) {
      console.error('❌ Erro no checkins:', error);
    }
  });

  /**
   * Evento: stream-evaluation
   * Inicia/finaliza avaliação de docente específico
   */
  socket.on('stream-evaluation', async (docenteCode) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem controlar avaliação de docente' });
        return;
      }

      const { roomId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // CORREÇÃO: Admin deve sempre enviar eventos para a sala principal "pub"
      const targetRoomId = roomId === 'admin' ? 'pub' : roomId;

      if (docenteCode && docenteCode.trim() !== '') {
        // Iniciar avaliação com código do docente
        const cleanCode = String(docenteCode).trim();
        evaluationStates.set(targetRoomId, cleanCode);

        // PERSISTIR ESTADO NO ROOM.JSON
        await updateRoomAdminStates(targetRoomId, {
          evaluation_code: cleanCode,
          evaluation_updated_at: new Date().toISOString(),
          evaluation_updated_by: {
            id: session.userData.id,
            name: adminName
          }
        });

        console.log(`👍 Admin ${adminName} iniciou avaliação do docente "${cleanCode}" na sala ${targetRoomId}`);

        // Notificar todos os usuários sobre a avaliação do docente
        io.to(targetRoomId).emit('evaluation', cleanCode);

        console.log(`✅ Avaliação de docente iniciada na sala ${targetRoomId} - Código: ${cleanCode} - Evento 'evaluation' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);

      } else {
        // Finalizar avaliação (parâmetro vazio ou não fornecido)
        evaluationStates.delete(targetRoomId);

        // PERSISTIR ESTADO NO ROOM.JSON
        await updateRoomAdminStates(targetRoomId, {
          evaluation_code: null,
          evaluation_updated_at: new Date().toISOString(),
          evaluation_updated_by: {
            id: session.userData.id,
            name: adminName
          }
        });

        console.log(`👍 Admin ${adminName} finalizou avaliação de docente na sala ${targetRoomId}`);

        // Notificar todos os usuários que a avaliação foi finalizada
        io.to(targetRoomId).emit('evaluation', null);

        console.log(`✅ Avaliação de docente finalizada na sala ${targetRoomId} - Evento 'evaluation' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);
      }

    } catch (error) {
      console.error('❌ Erro no stream-evaluation:', error);
      socket.emit('error', { message: 'Erro ao controlar avaliação de docente' });
    }
  });

  /**
   * Evento: stream-review
   * Inicia/finaliza avaliação do evento completo
   */
  socket.on('stream-review', async (eventId) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem controlar avaliação de evento' });
        return;
      }

      const { roomId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // CORREÇÃO: Admin deve sempre enviar eventos para a sala principal "pub"
      const targetRoomId = roomId === 'admin' ? 'pub' : roomId;

      if (eventId && eventId.trim() !== '' && eventId !== 'pub') {
        // Iniciar avaliação do evento
        const cleanEventId = String(eventId).trim();
        reviewStates.set(targetRoomId, cleanEventId);

        // PERSISTIR ESTADO NO ROOM.JSON
        await updateRoomAdminStates(targetRoomId, {
          review_event_id: cleanEventId,
          review_updated_at: new Date().toISOString(),
          review_updated_by: {
            id: session.userData.id,
            name: adminName
          }
        });

        console.log(`⭐ Admin ${adminName} iniciou avaliação do evento "${cleanEventId}" na sala ${targetRoomId}`);

        // Notificar todos os usuários sobre a avaliação do evento
        io.to(targetRoomId).emit('review', cleanEventId);

        console.log(`✅ Avaliação de evento iniciada na sala ${targetRoomId} - ID Evento: ${cleanEventId} - Evento 'review' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);

      } else {
        // Finalizar avaliação (parâmetro vazio ou não fornecido)
        reviewStates.delete(targetRoomId);

        // PERSISTIR ESTADO NO ROOM.JSON
        await updateRoomAdminStates(targetRoomId, {
          review_event_id: null,
          review_updated_at: new Date().toISOString(),
          review_updated_by: {
            id: session.userData.id,
            name: adminName
          }
        });

        console.log(`⭐ Admin ${adminName} finalizou avaliação de evento na sala ${targetRoomId}`);

        // Notificar todos os usuários que a avaliação foi finalizada
        io.to(targetRoomId).emit('review', null);

        console.log(`✅ Avaliação de evento finalizada na sala ${targetRoomId} - Evento 'review' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);
      }

    } catch (error) {
      console.error('❌ Erro no stream-review:', error);
      socket.emit('error', { message: 'Erro ao controlar avaliação de evento' });
    }
  });

  /**
   * Evento: stream-prayer
   * Inicia/finaliza formulário de pedido de oração
   */
  socket.on('stream-prayer', async (eventId) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem controlar pedido de oração' });
        return;
      }

      const { roomId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // CORREÇÃO: Admin deve sempre enviar eventos para a sala principal "pub"
      const targetRoomId = roomId === 'admin' ? 'pub' : roomId;

      if (eventId && eventId.trim() !== '' && eventId !== 'pub') {
        // Iniciar pedido de oração
        const cleanEventId = String(eventId).trim();

        console.log(`🙏 Admin ${adminName} iniciou pedido de oração na sala ${targetRoomId}`);

        // Notificar todos os usuários sobre o pedido de oração
        io.to(targetRoomId).emit('prayer', cleanEventId);

        console.log(`✅ Pedido de oração iniciado na sala ${targetRoomId} - Evento 'prayer' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);

      } else {
        // Finalizar pedido de oração (parâmetro vazio ou não fornecido)

        console.log(`🙏 Admin ${adminName} finalizou pedido de oração na sala ${targetRoomId}`);

        // Notificar todos os usuários que o pedido foi finalizado
        io.to(targetRoomId).emit('prayer', null);

        console.log(`✅ Pedido de oração finalizado na sala ${targetRoomId} - Evento 'prayer' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);
      }

    } catch (error) {
      console.error('❌ Erro no stream-prayer:', error);
      socket.emit('error', { message: 'Erro ao controlar pedido de oração' });
    }
  });

  /**
   * Evento: stream-popup
   * Inicia/remove pop-up com link personalizado
   */
  socket.on('stream-popup', async (popupData) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem controlar pop-ups' });
        return;
      }

      const { roomId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // CORREÇÃO: Admin deve sempre enviar eventos para a sala principal "pub"
      const targetRoomId = roomId === 'admin' ? 'pub' : roomId;

      if (popupData && popupData.trim() !== '') {
        // Processar dados do pop-up (formato: "URL | Texto do botão (opcional)")
        const cleanPopupData = String(popupData).trim();
        const parts = cleanPopupData.split('|').map(part => part.trim());

        const link = parts[0];
        const text = parts.length > 1 && parts[1] !== '' ? parts[1] : 'ABRIR LINK';

        const popupObject = {
          link: link,
          text: text
        };

        popupStates.set(targetRoomId, popupObject);

        // PERSISTIR ESTADO NO ROOM.JSON
        await updateRoomAdminStates(targetRoomId, {
          popup_active: popupObject,
          popup_updated_at: new Date().toISOString(),
          popup_updated_by: {
            id: session.userData.id,
            name: adminName
          }
        });

        console.log(`🪟 Admin ${adminName} criou pop-up na sala ${targetRoomId}: "${link}" - Texto: "${text}"`);

        // Notificar todos os usuários sobre o pop-up
        io.to(targetRoomId).emit('popup', popupObject);

        console.log(`✅ Pop-up criado na sala ${targetRoomId} - Link: ${link} - Evento 'popup' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);

      } else {
        // Remover pop-up (parâmetro vazio ou não fornecido)
        popupStates.delete(targetRoomId);

        // PERSISTIR ESTADO NO ROOM.JSON
        await updateRoomAdminStates(targetRoomId, {
          popup_active: null,
          popup_updated_at: new Date().toISOString(),
          popup_updated_by: {
            id: session.userData.id,
            name: adminName
          }
        });

        console.log(`🪟 Admin ${adminName} removeu pop-up na sala ${targetRoomId}`);

        // Notificar todos os usuários que o pop-up foi removido
        io.to(targetRoomId).emit('popup', null);

        console.log(`✅ Pop-up removido na sala ${targetRoomId} - Evento 'popup' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);
      }

    } catch (error) {
      console.error('❌ Erro no stream-popup:', error);
      socket.emit('error', { message: 'Erro ao controlar pop-up' });
    }
  });

  /**
   * Evento: stream-raffle
   * Inicia/finaliza sorteio entre participantes
   */
  socket.on('stream-raffle', async (active) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem controlar sorteios' });
        return;
      }

      const { roomId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // CORREÇÃO: Admin deve sempre enviar eventos para a sala principal "pub"
      const targetRoomId = roomId === 'admin' ? 'pub' : roomId;

      if (active === 1 || active === true) {
        // Iniciar sorteio
        console.log(`🎲 Admin ${adminName} iniciou sorteio na sala ${targetRoomId}`);

        // Obter lista de participantes online na sala (dados dos cookies)
        const onlineUsers = [];
        const room = io.sockets.adapter.rooms.get(targetRoomId);

        console.log(`🔍 DEBUG: Verificando sala ${targetRoomId} - existe: ${!!room}, tamanho: ${room?.size || 0}`);

        if (room) {
          for (const socketId of room) {
            const userSession = userSessions.get(socketId);
            console.log(`🔍 DEBUG: Socket ${socketId.slice(-6)} - sessão: ${!!userSession}, userData: ${!!userSession?.userData}`);

            if (userSession && userSession.userData) {
              const userData = userSession.userData;

              // Filtrar participantes elegíveis para sorteio
              // Excluir: equipe, usuários nível 2 e 3, admins
              const level = parseInt(userData.level) || 0;
              const hasTeam = userData.equipe && userData.equipe.trim() !== '';
              const isAdmin = userData.isAdmin || level >= 2;

              if (!isAdmin && !hasTeam && level < 2) {
                const userForRaffle = {
                  id: userData.id || userSession.userId || Math.random().toString(36).substr(2, 9),
                  nick: userData.apelido || userData.nick || (userData.nome ? userData.nome.split(' ')[0] : 'Participante'),
                  nome: userData.nome || '', // Nome completo do cookie
                  uf: userData.uf || userData.estado || ''
                };

                // Validação: só adicionar se o nick não estiver vazio
                if (userForRaffle.nick && userForRaffle.nick.trim() !== '' && userForRaffle.nick !== 'Usuário') {
                  onlineUsers.push(userForRaffle);
                  console.log(`✅ Adicionado ao sorteio: ${JSON.stringify(userForRaffle)}`);
                } else {
                  console.log(`⚠️ Usuário ignorado (nick inválido): ${JSON.stringify(userForRaffle)}`);
                }
              }
            }
          }
        }

        if (onlineUsers.length === 0) {
          console.log(`❌ Nenhum participante online elegível na sala ${targetRoomId}`);
          socket.emit('error', { message: 'Nenhum participante online elegível para sorteio' });
          return;
        }

        console.log(`✅ Encontrados ${onlineUsers.length} participantes online elegíveis para sorteio`);

        // Embaralhar participantes usando algoritmo Fisher-Yates
        const shuffled = [...onlineUsers];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Selecionar ganhador aleatório
        const winner = shuffled[Math.floor(Math.random() * shuffled.length)];

        // Resolver conflitos de nomes iguais adicionando sobrenome do cookie quando necessário
        const resolvedNames = resolveNameConflicts(shuffled);

        // Formatar dados para o frontend (compatível com o sistema legado)
        const formattedShuffled = resolvedNames.map(p => ({
          nick: p.displayName,
          uf: p.uf || ''
        }));

        // Encontrar o vencedor na lista resolvida para manter a consistência
        const resolvedWinner = resolvedNames.find(p => p.id === winner.id);
        const formattedWinner = {
          nick: resolvedWinner.displayName,
          uf: resolvedWinner.uf || ''
        };

        console.log(`🏆 Ganhador do sorteio: ${formattedWinner.nick} (${formattedWinner.uf})`);
        console.log(`📋 ${formattedShuffled.length} participantes no sorteio`);

        // Notificar todos os usuários sobre o resultado do sorteio
        io.to(targetRoomId).emit('raffle', formattedWinner, formattedShuffled);

        console.log(`✅ Sorteio realizado na sala ${targetRoomId} - Ganhador: ${formattedWinner.nick} - Evento 'raffle' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);

      } else {
        // Finalizar/fechar sorteio
        console.log(`🎲 Admin ${adminName} finalizou sorteio na sala ${targetRoomId}`);

        // Notificar todos os usuários que o sorteio foi finalizado
        io.to(targetRoomId).emit('raffle', null, null);

        console.log(`✅ Sorteio finalizado na sala ${targetRoomId} - Evento 'raffle' enviado para ${io.sockets.adapter.rooms.get(targetRoomId)?.size || 0} clientes`);
      }

    } catch (error) {
      console.error('❌ Erro no stream-raffle:', error);
      socket.emit('error', { message: 'Erro ao realizar sorteio' });
    }
  });

  /**
   * Evento: user-reload
   * Força reload de página para usuário específico (funcionalidade do painel admin)
   */
  socket.on('user-reload', (targetUserId) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem recarregar página de usuários' });
        return;
      }

      const { roomId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // Busca robusta: tentar múltiplas formas de encontrar o usuário
      let targetSocket = null;
      let foundSocketId = null;
      let searchMethod = 'none';

      // Método 1: Busca exata por userId
      for (const [socketId, userSession] of userSessions.entries()) {
        if (userSession.userId === targetUserId && userSession.roomId === roomId) {
          const socket = io.sockets.sockets.get(socketId);
          if (socket && socket.connected) {
            targetSocket = socket;
            foundSocketId = socketId;
            searchMethod = 'userId_exact';
            break;
          }
        }
      }

      // Método 2: Se não encontrou, tentar busca por userId convertido para string
      if (!targetSocket) {
        const targetUserIdStr = targetUserId.toString();
        for (const [socketId, userSession] of userSessions.entries()) {
          if (userSession.userId?.toString() === targetUserIdStr && userSession.roomId === roomId) {
            const socket = io.sockets.sockets.get(socketId);
            if (socket && socket.connected) {
              targetSocket = socket;
              foundSocketId = socketId;
              searchMethod = 'userId_string';
              break;
            }
          }
        }
      }

      // Método 3: Se ainda não encontrou, tentar busca por dados do usuário (nome, id alternativo)
      if (!targetSocket) {
        for (const [socketId, userSession] of userSessions.entries()) {
          if (userSession.roomId === roomId && userSession.userData) {
            const userData = userSession.userData;
            // Verificar múltiplos campos que podem conter o ID do usuário
            if (userData.id === targetUserId ||
              userData.id?.toString() === targetUserId.toString() ||
              userData.user_id === targetUserId ||
              userData.user_id?.toString() === targetUserId.toString()) {
              const socket = io.sockets.sockets.get(socketId);
              if (socket && socket.connected) {
                targetSocket = socket;
                foundSocketId = socketId;
                searchMethod = 'userData_match';
                break;
              }
            }
          }
        }
      }

      if (targetSocket) {
        // Usuário encontrado - enviar reload direto
        targetSocket.emit('reload');
        console.log(`🔄 Admin ${adminName} forçou reload da página do usuário ${targetUserId} (socket: ${foundSocketId}, método: ${searchMethod}) na sala ${roomId}`);

        // Feedback para o admin
        socket.emit('reload-success', {
          targetUserId,
          method: searchMethod,
          message: `Página recarregada para usuário ${targetUserId}`
        });
      } else {
        // Usuário não encontrado - não fazer broadcast para evitar problemas
        console.log(`⚠️ Admin ${adminName} tentou recarregar página do usuário ${targetUserId}, mas usuário não foi encontrado na sala ${roomId}`);
        socket.emit('error', {
          message: `Usuário ${targetUserId} não encontrado ou não está conectado. Tente novamente em alguns segundos.`
        });
      }

    } catch (error) {
      console.error('❌ Erro no user-reload:', error);
      socket.emit('error', { message: 'Erro ao recarregar página do usuário' });
    }
  });

  /**
   * Evento: user-refresh
   * Força refresh de dados para usuário específico (funcionalidade do painel admin)
   */
  socket.on('user-refresh', (targetUserId) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem atualizar dados de usuários' });
        return;
      }

      const { roomId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // Encontrar socket do usuário alvo
      let targetSocket = null;
      for (const [socketId, userSession] of userSessions.entries()) {
        if (userSession.userId === targetUserId && userSession.roomId === roomId) {
          targetSocket = io.sockets.sockets.get(socketId);
          break;
        }
      }

      if (!targetSocket) {
        socket.emit('error', { message: 'Usuário não encontrado ou não conectado' });
        return;
      }

      // Enviar comando de refresh para o usuário específico
      targetSocket.emit('refresh');

      console.log(`🔄 Admin ${adminName} forçou refresh de dados do usuário ${targetUserId} na sala ${roomId}`);

    } catch (error) {
      console.error('❌ Erro no user-refresh:', error);
      socket.emit('error', { message: 'Erro ao atualizar dados do usuário' });
    }
  });

  /**
   * Evento: user-logout (admin action)
   * Força desconexão de usuário específico com tela de erro (funcionalidade do painel admin)
   */
  socket.on('user-logout', (targetUserId) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem desconectar usuários' });
        return;
      }

      const { roomId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // Busca robusta: tentar múltiplas formas de encontrar o usuário
      let targetSocket = null;
      let foundSocketId = null;
      let searchMethod = 'none';

      // Método 1: Busca exata por userId
      for (const [socketId, userSession] of userSessions.entries()) {
        if (userSession.userId === targetUserId && userSession.roomId === roomId) {
          const socket = io.sockets.sockets.get(socketId);
          if (socket && socket.connected) {
            targetSocket = socket;
            foundSocketId = socketId;
            searchMethod = 'userId_exact';
            break;
          }
        }
      }

      // Método 2: Se não encontrou, tentar busca por userId convertido para string
      if (!targetSocket) {
        const targetUserIdStr = targetUserId.toString();
        for (const [socketId, userSession] of userSessions.entries()) {
          if (userSession.userId?.toString() === targetUserIdStr && userSession.roomId === roomId) {
            const socket = io.sockets.sockets.get(socketId);
            if (socket && socket.connected) {
              targetSocket = socket;
              foundSocketId = socketId;
              searchMethod = 'userId_string';
              break;
            }
          }
        }
      }

      // Método 3: Se ainda não encontrou, tentar busca por dados do usuário
      if (!targetSocket) {
        for (const [socketId, userSession] of userSessions.entries()) {
          if (userSession.roomId === roomId && userSession.userData) {
            const userData = userSession.userData;
            if (userData.id === targetUserId ||
              userData.id?.toString() === targetUserId.toString() ||
              userData.user_id === targetUserId ||
              userData.user_id?.toString() === targetUserId.toString()) {
              const socket = io.sockets.sockets.get(socketId);
              if (socket && socket.connected) {
                targetSocket = socket;
                foundSocketId = socketId;
                searchMethod = 'userData_match';
                break;
              }
            }
          }
        }
      }

      if (targetSocket) {
        // Usuário encontrado - enviar leave para redirecionar para página de erro
        targetSocket.emit('leave');

        console.log(`🚪 Admin ${adminName} enviou 'leave' (admin action) para usuário ${targetUserId} (socket: ${foundSocketId}, método: ${searchMethod}) na sala ${roomId}`);

        // Aguardar um pouco para garantir que o redirecionamento aconteça, então desconectar
        setTimeout(() => {
          targetSocket.adminForced = true;
          targetSocket.disconnect(true);
          console.log(`� Socket do usuário ${targetUserId} desconectado após logout`);
        }, 2000);

        // Feedback para o admin
        socket.emit('logout-success', {
          targetUserId,
          method: searchMethod,
          message: `Comando de leave (admin action) enviado para ${targetUserId}`
        });
      } else {
        // Usuário não encontrado
        console.log(`⚠️ Admin ${adminName} tentou desconectar usuário ${targetUserId}, mas usuário não foi encontrado na sala ${roomId}`);
        socket.emit('error', {
          message: `Usuário ${targetUserId} não encontrado ou já desconectado.`
        });
      }

    } catch (error) {
      console.error('❌ Erro no user-logout (admin action):', error);
      socket.emit('error', { message: 'Erro ao desconectar usuário' });
    }
  });

  /**
   * Evento: room-refresh
   * Força refresh de dados para todos os usuários da sala (funcionalidade do painel admin)
   */
  socket.on('room-refresh', () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem atualizar dados da sala' });
        return;
      }

      const { roomId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      // Enviar comando de refresh para todos os usuários da sala
      io.to(roomId).emit('refresh');

      // Confirmar para o admin (conforme implementação do frontend)
      socket.emit('refresh');

      console.log(`🔄 Admin ${adminName} forçou refresh de dados da sala ${roomId} para ${io.sockets.adapter.rooms.get(roomId)?.size || 0} usuários`);

    } catch (error) {
      console.error('❌ Erro no room-refresh:', error);
      socket.emit('error', { message: 'Erro ao atualizar dados da sala' });
    }
  });
}

/**
 * Ordena a lista de participantes baseada no tipo especificado
 */
function sortParticipants(participants, sortType, sortOrder = 'asc') {
  const collator = new Intl.Collator('pt-BR', { numeric: true });

  const sorted = [...participants].sort((a, b) => {
    let valueA, valueB;

    switch (sortType) {
      case 'turma':
        valueA = a.turma || '';
        valueB = b.turma || '';
        break;
      case 'grupo':
        valueA = a.grupo || '';
        valueB = b.grupo || '';
        break;
      case 'rede':
        valueA = a.rede || '';
        valueB = b.rede || '';
        break;
      case 'nick':
      case 'nome':
        valueA = a.nick || a.nome || '';
        valueB = b.nick || b.nome || '';
        break;
      case 'uf':
        valueA = a.uf || '';
        valueB = b.uf || '';
        break;
      case 'level':
        valueA = a.level || 0;
        valueB = b.level || 0;
        break;
      case 'id':
        valueA = a.id || 0;
        valueB = b.id || 0;
        break;
      case 'watcher':
      case 'status':
        // Para status/watcher, ordenar por level (admins primeiro) e depois por nome
        valueA = (a.level || 0) * 1000 + (a.nick || a.nome || '').charCodeAt(0);
        valueB = (b.level || 0) * 1000 + (b.nick || b.nome || '').charCodeAt(0);
        break;
      default:
        // Ordenação padrão por nome
        valueA = a.nick || a.nome || '';
        valueB = b.nick || b.nome || '';
    }

    // Usar collator para strings, comparação numérica para números
    const result = (typeof valueA === 'number' && typeof valueB === 'number')
      ? valueA - valueB
      : collator.compare(String(valueA), String(valueB));

    return sortOrder === 'desc' ? -result : result;
  });

  return sorted;
}

/**
 * Filtra a lista de participantes baseada no tipo especificado
 */
function filterParticipants(participants, filterType) {
  switch (filterType) {
    case 'staff':
    case 'equipe':
      return participants.filter(p => p.level >= 3 || p.equipe);
    case 'insc':
    case 'inscritos':
      return participants.filter(p => p.level < 3 && !p.equipe);
    case 'online':
      // Este filtro será aplicado pelo frontend baseado no status online
      return participants;
    case 'offline':
      // Este filtro será aplicado pelo frontend baseado no status online
      return participants;
    default:
      return participants;
  }
}

// ========================================
// HANDLER PARA LOGOUT VOLUNTÁRIO
// ========================================

/**
 * Handler para logout voluntário (quando usuário fecha aba, navega para outro site, etc.)
 */
function handleVoluntaryLogout(socket, io) {
  socket.on('voluntary-logout', () => {
    console.log(`🚪 Logout voluntário detectado para socket: ${socket.id}`);

    const session = userSessions.get(socket.id);
    if (session) {
      const { roomId, userId, userData } = session;

      // Marcar como logout voluntário para tratamento imediato
      socket.voluntaryLogout = true;

      // Executar limpeza imediata
      performImmediateCleanup(socket, io, session);

      console.log(`✅ Limpeza imediata executada para logout voluntário - Usuário: ${userId}, Sala: ${roomId}`);
    }
  });
}

/**
 * Função para executar limpeza imediata em caso de logout voluntário
 */
function performImmediateCleanup(socket, io, session) {
  const { roomId, userId, userData } = session;
  const normalizedUserId = normalizeUserId(userId);

  // Limpar timeouts pendentes
  if (socket.reconnectTimeout) {
    clearTimeout(socket.reconnectTimeout);
    delete socket.reconnectTimeout;
  }

  // Remover heartbeat
  connectionHeartbeat.delete(socket.id);

  // Limpar bandeiras de status inicial
  if (socket.initialStatusSent) {
    delete socket.initialStatusSent;
  }
  if (socket.initialJitsiSent) {
    delete socket.initialJitsiSent;
  }

  // Limpar cache de admin imediatamente para logout voluntário
  const userKey = `${userId}-${roomId}`;
  adminStatusSent.delete(userKey);

  // Remover do serviço de estabilidade
  if (normalizedUserId) {
    userStabilityService.removeUser(normalizedUserId);
  }

  // Remover da lista de usuários online usando função centralizada
  if (onlineUsers.has(roomId)) {
    if (normalizedUserId) {
      removeUserFromOnlineList(roomId, normalizedUserId, false, io);
    }
  }

  // Remover sessão
  userSessions.delete(socket.id);

  // Emitir evento "user-left" para compatibilidade com virtual.js
  if (userData) {
    const formattedUser = formatUserData({ ...userData, roomId }, false);
    socket.to(roomId).emit('user-left', formattedUser);
    console.log(`📡 Evento 'user-left' enviado para sala ${roomId} - logout voluntário: ${userData.nome || normalizedUserId}`);
  }

  // Notificar outros usuários na sala sobre a saída
  socket.to(roomId).emit('user_left', {
    userId: normalizedUserId,
    userData: formatUserData(userData || {}, false),
    reason: 'voluntary_logout',
    timestamp: new Date().toISOString()
  });

  // Enviar lista atualizada imediatamente
  setTimeout(async () => {
    try {
      const participants = await loadParticipants(roomId);
      const onlineUserIds = Array.from(onlineUsers.get(roomId) || []);
      const formattedUsers = participants.map(participant => {
        const isOnline = onlineUserIds.includes(normalizeUserId(participant.id));
        return formatUserData(participant, isOnline);
      });

      // Emitir para todos na sala
      socket.to(roomId).emit('user-list', formattedUsers);

      // CORREÇÃO: Enviar contadores detalhados como o sistema legado espera
      const detailedCounts = await calculateDetailedUserCounts(roomId);
      socket.to(roomId).emit('user-count', detailedCounts);

      console.log(`📡 Lista de usuários atualizada após logout voluntário na sala ${roomId}: ${onlineUserIds.length}/${participants.length} online`);
      console.log(`📊 Contadores pós-logout: sala=${detailedCounts.sala}, professor=${detailedCounts.professor}, reuniao=${detailedCounts.reuniao}, equipe=${detailedCounts.equipe}, offline=${detailedCounts.offline}`);
    } catch (error) {
      console.error('❌ Erro ao enviar lista de usuários após logout voluntário:', error);
    }
  }, 50); // Reduzido para 50ms para logout voluntário
}

// ========================================
// SEÇÃO 8B: HANDLERS JITSI GOOGLE CLOUD
// ========================================

/**
 * Handler para eventos JITSI Google Cloud
 */
function jitsiHandler(socket, io) {
  console.log(`🎬 Configurando handlers JITSI para socket: ${socket.id}`);

  // Handler para ligar JITSI
  socket.on('jitsi-enabled', async (data) => {
    try {
      console.log(`🚀 [${socket.id}] Solicitação para LIGAR JITSI:`, data);

      // Verificar permissões administrativas
      const session = userSessions.get(socket.id);
      if (!session || !session.userData || parseInt(session.userData.level) < 3) {
        console.log(`❌ [${socket.id}] Acesso negado - nível insuficiente`);
        socket.emit('error', { message: 'Acesso negado. Apenas administradores podem controlar o JITSI.' });
        return;
      }

      const roomId = session.roomId;
      const { googleCloudJitsiService } = require('./services');

      // Verificar se operação já está em andamento
      if (googleCloudJitsiService.isOperationInProgress) {
        console.log(`⚠️ Operação JITSI já em andamento - rejeitando nova tentativa`);
        socket.emit('error', { message: 'Operação já em andamento. Aguarde...' });
        return;
      }

      // Marcar operação como em andamento
      googleCloudJitsiService.isOperationInProgress = true;

      try {
        console.log(`🔍 Verificando status atual da instância...`);

        // Verificar status atual
        const currentStatus = await googleCloudJitsiService.getInstanceStatus();
        console.log(`📊 Status atual da instância:`, currentStatus);

        if (currentStatus.isRunning) {
          console.log(`✅ Instância já está rodando - apenas atualizando configuração local`);

          // Atualizar room.json mesmo se já estiver rodando
          const fs = require('fs').promises;
          const path = require('path');
          const roomPath = path.join(__dirname, '../../../api/room.json');

          try {
            const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));
            roomData.config = roomData.config || {};
            roomData.config.jitsi_enabled = true;
            roomData.config.jitsi_domain = currentStatus.domain;
            roomData.config.jitsi_google_cloud = {
              instance_name: googleCloudJitsiService.config.instanceName,
              status: currentStatus.status,
              ip: currentStatus.ip,
              last_updated: new Date().toISOString()
            };

            await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));
            console.log(`📝 Configuração local atualizada`);

          } catch (configError) {
            console.error(`❌ Erro ao atualizar configuração local:`, configError);
          }

        } else {
          console.log(`🚀 Iniciando instância JITSI no Google Cloud...`);

          // Ligar instância
          await googleCloudJitsiService.startInstance();
          console.log(`✅ Instância JITSI iniciada com sucesso`);

          // Atualizar room.json
          const fs = require('fs').promises;
          const path = require('path');
          const roomPath = path.join(__dirname, '../../../api/room.json');

          try {
            const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));
            roomData.config = roomData.config || {};
            roomData.config.jitsi_enabled = true;
            roomData.config.jitsi_domain = googleCloudJitsiService.config.serverDomain;
            roomData.config.jitsi_google_cloud = {
              instance_name: googleCloudJitsiService.config.instanceName,
              status: 'RUNNING',
              ip: googleCloudJitsiService.config.serverIP,
              last_updated: new Date().toISOString()
            };

            await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));
            console.log(`📝 Room.json atualizado com configurações JITSI`);

          } catch (configError) {
            console.error(`❌ Erro ao atualizar room.json:`, configError);
          }
        }

        // Notificar IMEDIATAMENTE que JITSI está ativo (após sucesso completo)
        socket.emit('jitsi', 'active');
        socket.broadcast.to(roomId).emit('jitsi', 'active');
        console.log(`📡 Eventos 'jitsi: active' enviados para socket ${socket.id} e room ${roomId}`);

        // Log de auditoria
        console.log(`🎬 Servidor JITSI ATIVADO na sala ${roomId} por ${session.userData.nome} (${session.userData.id})`);

      } catch (error) {
        console.error(`❌ Erro ao ligar JITSI:`, error);
        socket.emit('error', { message: `Erro ao ligar JITSI: ${error.message}` });

      } finally {
        // Garantir que a operação seja marcada como concluída
        googleCloudJitsiService.isOperationInProgress = false;
      }

    } catch (error) {
      console.error(`❌ Erro geral no handler jitsi-enabled:`, error);
      socket.emit('error', { message: 'Erro interno do servidor' });
    }
  });

  // Handler para desligar JITSI
  socket.on('jitsi-disabled', async (data) => {
    try {
      console.log(`🛑 [${socket.id}] Solicitação para DESLIGAR JITSI:`, data);

      // Verificar permissões administrativas
      const session = userSessions.get(socket.id);
      if (!session || !session.userData || parseInt(session.userData.level) < 3) {
        console.log(`❌ [${socket.id}] Acesso negado - nível insuficiente`);
        socket.emit('error', { message: 'Acesso negado. Apenas administradores podem controlar o JITSI.' });
        return;
      }

      const roomId = session.roomId;
      const { googleCloudJitsiService } = require('./services');

      // Verificar se operação já está em andamento
      if (googleCloudJitsiService.isOperationInProgress) {
        console.log(`⚠️ Operação JITSI já em andamento - rejeitando nova tentativa`);
        socket.emit('error', { message: 'Operação já em andamento. Aguarde...' });
        return;
      }

      // Marcar operação como em andamento
      googleCloudJitsiService.isOperationInProgress = true;

      try {
        console.log(`🔍 Verificando status atual da instância...`);

        // Verificar status atual
        const currentStatus = await googleCloudJitsiService.getInstanceStatus();
        console.log(`📊 Status atual da instância:`, currentStatus);

        if (!currentStatus.isRunning) {
          console.log(`✅ Instância já está parada - apenas atualizando configuração local`);

        } else {
          console.log(`🛑 Parando instância JITSI no Google Cloud...`);

          // Desligar instância
          await googleCloudJitsiService.stopInstance();
          console.log(`✅ Instância JITSI parada com sucesso`);
        }

        // Atualizar room.json removendo configurações JITSI
        const fs = require('fs').promises;
        const path = require('path');
        const roomPath = path.join(__dirname, '../../../api/room.json');

        try {
          const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));
          roomData.config = roomData.config || {};
          roomData.config.jitsi_enabled = false;
          roomData.config.jitsi_domain = null;
          roomData.config.jitsi_google_cloud = {
            instance_name: googleCloudJitsiService.config.instanceName,
            status: 'TERMINATED',
            ip: null,
            last_updated: new Date().toISOString()
          };

          await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));
          console.log(`📝 Room.json atualizado - JITSI desativado`);

        } catch (configError) {
          console.error(`❌ Erro ao atualizar room.json:`, configError);
        }

        // Notificar IMEDIATAMENTE que JITSI está desativo (após sucesso completo)
        socket.emit('jitsi', 'off');
        socket.broadcast.to(roomId).emit('jitsi', 'off');
        console.log(`📡 Eventos 'jitsi: off' enviados para socket ${socket.id} e room ${roomId}`);

        // Log de auditoria
        console.log(`🎬 Servidor JITSI DESATIVADO na sala ${roomId} por ${session.userData.nome} (${session.userData.id})`);

      } catch (error) {
        console.error(`❌ Erro ao desligar JITSI:`, error);
        socket.emit('error', { message: `Erro ao desligar JITSI: ${error.message}` });

      } finally {
        // Garantir que a operação seja marcada como concluída
        googleCloudJitsiService.isOperationInProgress = false;
      }

    } catch (error) {
      console.error(`❌ Erro geral no handler jitsi-disabled:`, error);
      socket.emit('error', { message: 'Erro interno do servidor' });
    }
  });

  // Handler para verificar status JITSI
  socket.on('get-jitsi-status', async (data) => {
    try {
      console.log(`🔍 [${socket.id}] Solicitação de status JITSI:`, data);

      const { googleCloudJitsiService } = require('./services');

      // Verificar status da instância
      const instanceStatus = await googleCloudJitsiService.getInstanceStatus();

      // Verificar configuração local
      let localStatus = false;
      try {
        const fs = require('fs').promises;
        const path = require('path');
        const roomPath = path.join(__dirname, '../../../api/room.json');
        const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));
        localStatus = roomData.config?.jitsi_enabled || false;
      } catch (error) {
        console.warn('⚠️ Erro ao ler configuração local:', error.message);
      }

      const status = {
        jitsi_enabled: localStatus,
        instance_running: instanceStatus.isRunning,
        instance_status: instanceStatus.status,
        operation_in_progress: googleCloudJitsiService.isOperationInProgress,
        domain: instanceStatus.domain,
        ip: instanceStatus.ip,
        last_checked: instanceStatus.lastChecked
      };

      socket.emit('jitsi-status', status);
      console.log(`📊 Status JITSI enviado:`, status);

    } catch (error) {
      console.error(`❌ Erro ao verificar status JITSI:`, error);
      socket.emit('error', { message: 'Erro ao verificar status JITSI' });
    }
  });
}

// ========================================
// SEÇÁO 8: CONFIGURAÇÁO PRINCIPAL
// ========================================

/**
 * Configurar todos os handlers de eventos para um socket
 */
function configureSocketHandlers(socket, io) {
  console.log(`🔌 Configurando handlers para socket: ${socket.id}`);

  // Configurar handlers de usuário
  const connectionFlags = {
    userConnectedViaHandler: false,
    setUserConnectedViaHandler: (value) => { connectionFlags.userConnectedViaHandler = value; }
  };

  userHandler(socket, io, connectionFlags);

  // Configurar handlers de chat
  chatHandler(socket, io);

  // Configurar handlers de vídeo
  videoHandler(socket, io);

  // Configurar handlers administrativos
  adminHandler(socket, io);

  // Configurar handler de sincronização do liveplayer
  addLivePlayerSyncHandler(socket, io);

  // Configurar handler de logout voluntário
  handleVoluntaryLogout(socket, io);

  // Configurar handler de desconexão
  handleDisconnect(socket, io);

  // Configurar handlers JITSI
  jitsiHandler(socket, io);

  // Registrar heartbeat inicial
  connectionHeartbeat.set(socket.id, Date.now());
  heartbeatService.addConnection(socket.id);

  // CARREGAMENTO INTELIGENTE DOS PARTICIPANTES
  // Usar Promise para evitar múltiplas chamadas e race conditions
  let participantsLoaded = false;

  const loadParticipantsOnce = async () => {
    if (participantsLoaded || connectionFlags.userConnectedViaHandler) return;
    participantsLoaded = true;

    try {
      // Determinar sala baseada no referer
      const referer = socket.handshake.headers.referer || '';
      const roomMatch = referer.match(/\/vr\/([a-zA-Z0-9]+)/);

      if (!roomMatch) {
        console.warn(`⚠️ Room ID não encontrado no referer: ${referer}`);
        return;
      }

      const roomId = roomMatch[1];
      const participants = await loadParticipants(roomId);

      if (!participants || participants.length === 0) {
        console.warn(`⚠️ Nenhum participante encontrado para sala ${roomId}`);
        return;
      }

      console.log(`🚀 Carregando ${participants.length} participantes para sala ${roomId}`);

      // AUTO-CONECTAR USUÁRIO AUTENTICADO se não estiver já conectado
      const authenticatedUser = extractAuthenticatedUser(socket, roomId);

      if (authenticatedUser) {
        const normalizedUserId = normalizeUserId(authenticatedUser.id);

        // Verificar se já existe sessão para este usuário
        let userAlreadyConnected = false;
        for (const [existingSocketId, session] of userSessions.entries()) {
          if (normalizeUserId(session.userId) === normalizedUserId && session.roomId === roomId) {
            userAlreadyConnected = true;
            break;
          }
        }

        if (!userAlreadyConnected) {
          if (!onlineUsers.has(roomId)) {
            onlineUsers.set(roomId, new Set());
          }
          onlineUsers.get(roomId).add(normalizedUserId);

          // Registrar sessão do socket
          userSessions.set(socket.id, {
            roomId: roomId,
            userId: normalizedUserId,
            userData: authenticatedUser
          });

          console.log(`✅ Usuário ${authenticatedUser.nome} (${normalizedUserId}) conectado automaticamente na sala ${roomId}`);
          updateRoomStats(roomId);
        }
      }

      // Determinar usuários online
      const onlineUserIds = Array.from(onlineUsers.get(roomId) || []);

      // Transformar participantes para o formato esperado pelo frontend
      const formattedUsers = participants.map(participant =>
        formatUserData(participant, onlineUserIds.includes(normalizeUserId(participant.id)))
      );

      // Calcular contadores detalhados
      const detailedCounts = await calculateDetailedUserCounts(roomId);

      // Emitir eventos que o frontend espera
      socket.emit('user-list', formattedUsers);
      socket.emit('user-count', detailedCounts);

      console.log(`🔢 DEBUG USER-COUNT: Enviado no carregamento inicial para sala ${roomId}:`, {
        total: detailedCounts.total,
        online: detailedCounts.online,
        offline: detailedCounts.offline,
        sala: detailedCounts.sala
      });

      console.log(`✅ Lista de participantes enviada - Online: ${onlineUserIds.length}/${participants.length}`);

    } catch (error) {
      console.warn(`⚠️ Erro no carregamento de participantes:`, error.message);
    }
  };

  // Carregar participantes após um breve delay para garantir que tudo está inicializado
  setTimeout(loadParticipantsOnce, 100);
}

/**
 * Obtém estatísticas globais do sistema
 */
function getGlobalStats() {
  const totalRooms = onlineUsers.size;
  let totalUsers = 0;

  onlineUsers.forEach(userSet => {
    totalUsers += userSet.size;
  });

  return {
    total_rooms: totalRooms,
    total_users: totalUsers,
    room_stats: Object.fromEntries(roomStats),
    timestamp: new Date().toISOString()
  };
}

// ========================================
// SEÇÁO 9: EXPORTS
// ========================================

module.exports = {
  configureSocketHandlers,
  getGlobalStats,

  // Handlers individuais para uso específico
  userHandler,
  chatHandler,
  videoHandler,
  adminHandler,
  handleDisconnect,
  handleVoluntaryLogout,
  initializeCleanupTimer,

  // Utilitários
  formatUserData,
  loadParticipants,
  invalidateParticipantsCache,
  sortParticipants,
  filterParticipants,
  getUserSessions: () => userSessions, // Função para acessar sessões
  addUserToOnlineList,
  removeUserFromOnlineList,

  // Sistema de robôs
  bootstrapBots,
  revalidateBots,
  initializeBotRevalidationTimer,

  // Sistema de persistência
  loadAdminStatesFromRoom,

  // Acesso aos dados em memória (para debug/admin)
  onlineUsers,
  userSessions,
  roomStats
};

// ========================================
// INICIALIZAÇÁO: Reset do estado JITSI
// ========================================

// Resetar estado do JITSI ao iniciar o servidor
try {
  console.log(`🔧 INICIALIZAÇÁO: JITSI simplificado - removida dependência do Google Cloud`);
  console.log(`✅ JITSI funcionará independente do servidor Google Cloud`);
} catch (error) {
  console.warn(`⚠️ Erro na inicialização JITSI:`, error.message);
}

// ========================================
// SEÇÁO 15: HANDLERS DE CONFERÊNCIA - FASE 1
// ========================================

/**
 * Handler para entrada em conferência JITSI
 * FASE 1: Logging avançado com ConferenceLogger
 */
function handleConferenceJoin(socket, data) {
  console.log(`🎥 [Conference Join] ${socket.userData?.nome} entrando em conferência:`, data);

  // Validar dados obrigatórios
  if (!data || !data.confType || !data.roomName) {
    console.warn(`⚠️ [Conference Join] Dados incompletos:`, data);
    return;
  }

  // Log da entrada usando ConferenceLogger
  if (socket.userData) {
    const services = require('./services');
    const conferenceLogger = new services.ConferenceLogger();

    conferenceLogger.logConferenceEvent('join', {
      roomId: socket.userData.eventId || socket.roomId,
      confType: data.confType,
      roomName: data.roomName,
      participantId: socket.userData.id,
      participantName: socket.userData.nome,
      participantLevel: socket.userData.level,
      participantEquipe: socket.userData.equipe,
      participantGrupo: socket.userData.grupo,
      participantRede: socket.userData.rede,
      participantTurma: socket.userData.turma,
      accessGranted: true,
      userAgent: socket.handshake.headers['user-agent'],
      ipAddress: socket.handshake.address
    }).catch(error => {
      console.warn('⚠️ Erro ao log de entrada em conferência:', error.message);
    });
  }

  // Notificar outros usuários da sala
  if (socket.roomId) {
    socket.to(`room-${socket.roomId}`).emit('participant-joined-conference', {
      confType: data.confType,
      participantName: socket.userData?.nome || 'Participante',
      roomName: data.roomName,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Handler para saída de conferência JITSI
 * FASE 1: Logging avançado com duração da sessão
 */
function handleConferenceLeave(socket, data) {
  console.log(`🚪 [Conference Leave] ${socket.userData?.nome} saindo de conferência:`, data);

  // Validar dados obrigatórios
  if (!data || !data.confType) {
    console.warn(`⚠️ [Conference Leave] Dados incompletos:`, data);
    return;
  }

  // Log da saída usando ConferenceLogger
  if (socket.userData) {
    const services = require('./services');
    const conferenceLogger = new services.ConferenceLogger();

    conferenceLogger.logConferenceEvent('leave', {
      roomId: socket.userData.eventId || socket.roomId,
      confType: data.confType,
      roomName: data.roomName,
      participantId: socket.userData.id,
      participantName: socket.userData.nome,
      participantLevel: socket.userData.level,
      participantEquipe: socket.userData.equipe,
      participantGrupo: socket.userData.grupo,
      participantRede: socket.userData.rede,
      participantTurma: socket.userData.turma,
      duration: data.duration || null,
      userAgent: socket.handshake.headers['user-agent'],
      ipAddress: socket.handshake.address
    }).catch(error => {
      console.warn('⚠️ Erro ao log de saída de conferência:', error.message);
    });
  }

  // Notificar outros usuários da sala
  if (socket.roomId) {
    socket.to(`room-${socket.roomId}`).emit('participant-left-conference', {
      confType: data.confType,
      participantName: socket.userData?.nome || 'Participante',
      roomName: data.roomName || 'Unknown',
      duration: data.duration || null,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Atualiza dados do participante no arquivo participantes.json com informações de conferência
 */
async function updateParticipantInConference(participantId, conferenceData) {
  try {
    const participantesPath = path.join(__dirname, '../../../api/participantes.json');
    let participants = [];

    try {
      const data = await fs.readFile(participantesPath, 'utf8');
      participants = JSON.parse(data);
    } catch (e) {
      console.warn('⚠️ Arquivo participantes.json não encontrado, criando novo');
      participants = [];
    }

    // Encontrar e atualizar participante
    const participantIndex = participants.findIndex(p => p.id == participantId); // Usar == para compatibilidade string/number
    if (participantIndex !== -1) {
      // Atualizar dados existentes - PRESERVAR NICK EXISTENTE SE JÁ FOR APENAS O PRIMEIRO NOME
      const currentNick = participants[participantIndex].nick;
      const proposedNick = conferenceData.nick;

      // Só atualizar o nick se o atual for um nome completo e o proposto for apenas o primeiro nome
      if (currentNick.includes(' ') && !proposedNick.includes(' ')) {
        participants[participantIndex].nick = proposedNick;
        console.log(`📝 Nick atualizado: "${currentNick}" → "${proposedNick}"`);
      } else {
        console.log(`📝 Nick preservado: "${currentNick}"`);
      }

      participants[participantIndex].currentConference = conferenceData.conference;
      participants[participantIndex].lastActivity = new Date().toISOString();

      // Salvar arquivo atualizado
      await fs.writeFile(participantesPath, JSON.stringify(participants, null, 2));
      console.log(`📝 Participante ${participantId} atualizado com conferência ${conferenceData.conference.type || 'null'}`);
    } else {
      console.warn(`⚠️ Participante ${participantId} não encontrado na lista - Tentando adicionar...`);

      // Se não encontrou, tentar adicionar novo participante (caso não esteja na lista)
      const newParticipant = {
        id: parseInt(participantId),
        nick: conferenceData.nick,
        level: 0, // Level padrão
        equipe: null,
        sexo: 1,
        uf: '',
        parceiro: '0',
        turma: null,
        grupo: null,
        rede: null,
        currentConference: conferenceData.conference,
        lastActivity: new Date().toISOString()
      };

      participants.push(newParticipant);
      await fs.writeFile(participantesPath, JSON.stringify(participants, null, 2));
      console.log(`✅ Novo participante ${participantId} adicionado com conferência ${conferenceData.conference.type || 'null'}`);
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar participante em conferência:', error);
    // Não quebrar a aplicação - apenas logar o erro
  }
}

/**
 * Handler para movimento entre conferências (compatibilidade com sistema legado)
 * FASE 1: Compatibilidade total com frontend existente + atualização do nick em tempo real
 */
function handleMove(socket, confType, extra) {
  // Obter dados da sessão
  const session = userSessions.get(socket.id);
  if (!session) {
    console.warn(`⚠️ [Move] Sessão não encontrada para socket ${socket.id}`);
    return;
  }

  console.log(`🔄 [Move] ${session.userData?.nome} movendo para conferência ${confType}${extra ? ` (${extra})` : ''}`);

  // FASE 1: Atualizar nick do usuário na lista de participantes com indicador de conferência
  if (session && session.roomId) {
    const originalNick = normalizeNick(session.userData);
    let conferenceNick = originalNick;

    // Mapear nomes amigáveis das conferências
    const conferenceNames = {
      professor: '👨‍🏫 Professor',
      reuniao: '🤝 Reunião',
      equipe: '👥 Equipe',
      atendimento: '🎧 Atendimento',
      projeto: '📋 Projeto',
      oracao: '🙏 Oração',
      breakout: '🔄 Grupo',
      grupo: '👨‍👩‍👧‍👦 Grupo',
      rede: '🌐 Rede',
      turma: '🎓 Turma'
    };

    // Se confType é null, usuário está voltando para ONLINE
    if (confType === null || confType === 'null') {
      conferenceNick = originalNick;
      session.userData.currentConference = null;
      session.userData.displayNick = originalNick;

      // COMPATIBILIDADE CRÍTICA: Emitir evento user-moved para voltar ao estado ONLINE
      const userMovedData = formatUserData(session.userData, true);
      userMovedData.nick = originalNick; // Sempre usar nick original
      userMovedData.extra.conf = null; // Remover conferência
      userMovedData.extra.breakout = 0; // Remover breakout
      userMovedData.extra.conferenceDisplay = null; // Remover display de conferência

      // Emitir para toda a sala o evento user-moved que atualiza as toggles de volta para ONLINE
      socket.to(session.roomId).emit('user-moved', userMovedData);
      socket.emit('user-moved', userMovedData); // Para o próprio usuário também

      console.log(`📝 [Conference Exit] ${originalNick} voltou para ONLINE`);
      console.log(`📡 [user-moved] Emitido para sala ${session.roomId}: usuário voltou para ONLINE`);

    } else {
      // Usuário entrando em conferência
      const conferenceName = conferenceNames[confType] || '🎥 Conferência';
      conferenceNick = `${originalNick} (${conferenceName}${extra ? ` ${extra}` : ''})`;

      // Atualizar dados da sessão com indicador de conferência
      session.userData.currentConference = {
        type: confType,
        extra: extra,
        displayName: conferenceName,
        startedAt: new Date().toISOString()
      };

      session.userData.displayNick = conferenceNick;

      // COMPATIBILIDADE CRÍTICA: Emitir evento user-moved que o virtual.js espera
      const userMovedData = formatUserData(session.userData, true);
      userMovedData.nick = originalNick; // Sempre usar nick original
      userMovedData.extra.conf = confType;
      userMovedData.extra.conferenceDisplay = conferenceName; // Adicionar info de exibição separada
      if (extra && confType === 'breakout') {
        userMovedData.extra.breakout = parseInt(extra) || 0;
      }

      // IMPORTANTE: Garantir que o userid permaneça válido durante conferência
      userMovedData.userid = session.userData.id;
      userMovedData.online = true;

      // Emitir para toda a sala o evento user-moved que atualiza as toggles
      socket.to(session.roomId).emit('user-moved', userMovedData);
      socket.emit('user-moved', userMovedData); // Para o próprio usuário também

      console.log(`📝 [Conference Join] ${originalNick} → ${conferenceNick}`);
      console.log(`📡 [user-moved] Emitido para sala ${session.roomId}: conf=${confType}, userid=${userMovedData.userid}, breakout=${userMovedData.extra.breakout}`);
    }

    // Atualizar participantes.json em tempo real (sem modificar o nick - apenas conferência)
    updateParticipantInConference(session.userData.id, {
      nick: originalNick, // Sempre manter o nick original
      conference: {
        type: confType,
        extra: extra,
        active: confType !== null && confType !== 'null',
        startedAt: confType !== null && confType !== 'null' ? new Date().toISOString() : null,
        endedAt: confType === null || confType === 'null' ? new Date().toISOString() : null
      }
    });

    // Emitir para todos na sala que o participante mudou de conferência
    socket.to(session.roomId).emit('participant-conference-update', {
      participantId: session.userData.id,
      participantName: originalNick,
      displayNick: conferenceNick,
      conferenceType: confType,
      conferenceDisplay: confType ? (conferenceNames[confType] || '🎥 Conferência') : null,
      extra: extra,
      action: confType ? 'joined' : 'left',
      timestamp: new Date().toISOString()
    });

    // Emitir para o próprio cliente confirmação da mudança
    socket.emit('participant-conference-update', {
      participantId: session.userData.id,
      participantName: originalNick,
      displayNick: conferenceNick,
      conferenceType: confType,
      conferenceDisplay: confType ? (conferenceNames[confType] || '🎥 Conferência') : null,
      extra: extra,
      action: confType ? 'joined' : 'left',
      timestamp: new Date().toISOString(),
      self: true
    });

    // Emitir lista atualizada de participantes para todos
    socket.to(session.roomId).emit('participants-updated');

    // CORREÇÃO: Emitir contadores atualizados após mudança de conferência
    setTimeout(async () => {
      try {
        const detailedCounts = await calculateDetailedUserCounts(session.roomId);
        socket.to(session.roomId).emit('user-count', detailedCounts);
        socket.emit('user-count', detailedCounts); // Para o próprio usuário também
        console.log(`📊 Contadores atualizados após move: sala=${detailedCounts.sala}, professor=${detailedCounts.professor}, reuniao=${detailedCounts.reuniao}, equipe=${detailedCounts.equipe}`);
      } catch (error) {
        console.error('❌ Erro ao atualizar contadores após move:', error);
      }
    }, 100);
  }

  // Compatibilidade com sistema legado - este evento é usado pelo virtual_admin.js
  if (session?.roomId) {
    socket.to(session.roomId).emit('participant-moved', {
      participantName: session.userData?.nome || 'Participante',
      participantId: session.userData?.id,
      conferenceType: confType,
      extra: extra,
      timestamp: new Date().toISOString()
    });
  }

  // Log do movimento
  console.log(`📝 [Move Log] Usuário ${session.userData?.nome} (ID: ${session.userData?.id}) moveu para ${confType || 'ONLINE'}`);
}

/**
 * FASE 1: Handler para saída de conferência
 * Remove indicador de conferência do nick do usuário
 */
function handleConferenceExit(socket, confType) {
  console.log(`🚪 [Conference Exit] ${socket.userData?.nome} saindo da conferência ${confType}`);

  const session = userSessions.get(socket.id);
  if (session && socket.roomId) {
    const originalNick = normalizeNick(session.userData);

    // Remover indicador de conferência
    session.userData.currentConference = null;
    session.userData.displayNick = originalNick;

    // Atualizar participantes.json removendo dados de conferência
    updateParticipantInConference(session.userData.id, {
      nick: originalNick,
      conference: {
        type: null,
        extra: null,
        active: false,
        endedAt: new Date().toISOString()
      }
    });

    // Emitir para todos na sala que o participante saiu da conferência
    socket.to(`room-${socket.roomId}`).emit('participant-conference-update', {
      participantId: session.userData.id,
      participantName: originalNick,
      displayNick: originalNick,
      conferenceType: confType,
      action: 'left',
      timestamp: new Date().toISOString()
    });

    // Emitir lista atualizada de participantes para todos
    socket.to(`room-${socket.roomId}`).emit('participants-updated');

    // COMPATIBILIDADE CRÍTICA: Emitir evento user-moved para voltar ao estado ONLINE
    const userMovedData = formatUserData(session.userData, true);
    userMovedData.extra.conf = null; // Remover conferência
    userMovedData.extra.breakout = 0; // Remover breakout

    // Emitir para toda a sala o evento user-moved que atualiza as toggles de volta para ONLINE
    socket.to(`room-${socket.roomId}`).emit('user-moved', userMovedData);
    socket.emit('user-moved', userMovedData); // Para o próprio usuário também

    console.log(`📝 [Conference Exit] ${originalNick} saiu da conferência`);
    console.log(`📡 [user-moved] Emitido para sala ${socket.roomId}: usuário voltou para ONLINE`);
  }
}

/**
 * Handler para solicitar estatísticas de conferência
 * FASE 1: API para admins visualizarem uso das salas
 */
async function handleGetConferenceStats(socket, data) {
  try {
    // Verificar permissões (apenas facilitadores e admins)
    if (!socket.userData || !socket.userData.level || parseInt(socket.userData.level) < 2) {
      socket.emit('conference-stats-error', {
        error: 'Acesso negado: necessário nível de facilitador ou superior'
      });
      return;
    }

    const roomId = data?.roomId || socket.roomId;
    if (!roomId) {
      socket.emit('conference-stats-error', { error: 'ID da sala não informado' });
      return;
    }

    const services = require('./services');
    const conferenceLogger = new services.ConferenceLogger();

    // Período padrão: últimos 7 dias
    const endDate = data?.endDate ? new Date(data.endDate) : new Date();
    const startDate = data?.startDate ? new Date(data.startDate) :
      new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = await conferenceLogger.getConferenceStats(roomId, {
      start: startDate,
      end: endDate
    });

    if (stats) {
      socket.emit('conference-stats', {
        success: true,
        roomId: roomId,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        stats: stats,
        generated_at: new Date().toISOString(),
        generated_by: socket.userData.nome
      });
    } else {
      socket.emit('conference-stats-error', { error: 'Erro ao gerar estatísticas' });
    }

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas de conferência:', error);
    socket.emit('conference-stats-error', { error: 'Erro interno do servidor' });
  }
}

/**
 * Função utilitária para normalizar nicks (sempre primeiro nome apenas)
 */
/**
 * Resolve conflitos de nomes iguais no sorteio
 * Quando dois ou mais usuários têm o mesmo nick/apelido,
 * adiciona um sobrenome do nome completo (cookie) para diferenciá-los
 */
function resolveNameConflicts(participants) {
  // Criar mapa para agrupar participantes por nick
  const nameGroups = new Map();

  // Primeiro, processar cada participante e obter seu display name inicial
  const processedParticipants = participants.map(participant => {
    const displayName = participant.nick || 'Participante';

    return {
      ...participant,
      displayName: displayName,
      originalDisplayName: displayName
    };
  });

  // Agrupar por nome de exibição (case-insensitive)
  processedParticipants.forEach(participant => {
    const key = participant.originalDisplayName.toLowerCase().trim();
    if (!nameGroups.has(key)) {
      nameGroups.set(key, []);
    }
    nameGroups.get(key).push(participant);
  });

  // Resolver conflitos para grupos com mais de um participante
  nameGroups.forEach((group, displayName) => {
    if (group.length > 1) {
      console.log(`🔍 Resolvendo conflito de nome: ${group.length} usuários com nome "${displayName}"`);

      group.forEach((participant, index) => {
        // Para o primeiro usuário, manter o nome original
        if (index === 0) {
          console.log(`   ✅ Usuário ${participant.id}: mantendo "${participant.originalDisplayName}" (primeiro)`);
          return;
        }

        // Para os demais, tentar adicionar sobrenome do nome completo do cookie
        if (participant.nome && participant.nome.includes(' ')) {
          const nameParts = participant.nome.trim().split(/\s+/); // Split por qualquer espaço
          if (nameParts.length >= 2) {
            // Pegar o primeiro nome e o primeiro sobrenome
            const firstName = nameParts[0];
            const lastName = nameParts[1];
            participant.displayName = `${firstName} ${lastName}`;
            console.log(`   ✅ Usuário ${participant.id}: "${participant.originalDisplayName}" → "${participant.displayName}" (nome completo: "${participant.nome}")`);
          } else {
            // Se não há sobrenome, usar nick + ID parcial
            const shortId = String(participant.id).slice(-2);
            participant.displayName = `${participant.originalDisplayName} ${shortId}`;
            console.log(`   ⚠️ Usuário ${participant.id}: sem sobrenome, usando "${participant.displayName}"`);
          }
        } else {
          // Se não há nome completo, usar nick + ID parcial
          const shortId = String(participant.id).slice(-2);
          participant.displayName = `${participant.originalDisplayName} ${shortId}`;
          console.log(`   ⚠️ Usuário ${participant.id}: sem nome completo no cookie, usando "${participant.displayName}"`);
        }
      });
    }
  });

  return processedParticipants;
}

function normalizeNick(userData) {
  // Log de debug para identificar problemas com nomes undefined
  console.log(`🔍 DEBUG normalizeNick - userData:`, {
    id: userData.id,
    apelido: userData.apelido,
    nome: userData.nome,
    nick: userData.nick,
    isAnonymous: userData.isAnonymous
  });

  // Tratamento especial para usuários anônimos
  if (userData.isAnonymous) {
    const nick = userData.apelido || userData.nome || userData.nick || 'Visitante';
    console.log(`🔍 DEBUG normalizeNick - usuário anônimo resultado: ${nick}`);
    return nick;
  }

  // Prioridade 1: Usar apelido se existir (permite nomes compostos)
  if (userData.apelido && userData.apelido !== 'undefined') {
    console.log(`🔍 DEBUG normalizeNick - usando apelido: ${userData.apelido}`);
    return userData.apelido;
  }

  // Prioridade 2: Usar nick se existir (permite nomes compostos)
  if (userData.nick && userData.nick !== 'undefined') {
    console.log(`🔍 DEBUG normalizeNick - usando nick: ${userData.nick}`);
    return userData.nick;
  }

  // Prioridade 3: Usar primeiro nome se existe nome completo
  if (userData.nome && userData.nome !== 'undefined') {
    const primeiroNome = userData.nome.split(' ')[0];
    console.log(`🔍 DEBUG normalizeNick - usando primeiro nome: ${primeiroNome}`);
    return primeiroNome;
  }

  console.log(`⚠️ DEBUG normalizeNick - usando fallback: Usuário`);
  return 'Usuário';
}

/**
 * Função para sincronizar o estado do liveplayer para todos os usuários
 * Útil para garantir que todos vejam as mudanças em tempo real
 */
async function syncLivePlayerState(io, roomId) {
  try {
    const path = require('path');
    const fs = require('fs').promises;
    const roomPath = path.join(__dirname, '../../../api/room.json');

    const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));
    const isOnline = Boolean(roomData.config?.live_enabled);
    const streamUrl = roomData.config?.stream_url || '';

    if (isOnline) {
      // Broadcast online para todos na sala
      io.to(roomId).emit('online', streamUrl);
      console.log(`🟢 Estado ONLINE sincronizado para sala ${roomId}: ${streamUrl} - Enviado para ${io.sockets.adapter.rooms.get(roomId)?.size || 0} clientes`);
    } else {
      // Broadcast offline para todos na sala
      io.to(roomId).emit('offline');
      console.log(`🔴 Estado OFFLINE sincronizado para sala ${roomId} - Enviado para ${io.sockets.adapter.rooms.get(roomId)?.size || 0} clientes`);
    }
  } catch (error) {
    console.warn(`⚠️ Erro ao sincronizar estado do liveplayer para sala ${roomId}:`, error.message);
  }
}

// Adicionar handler para sincronização manual do estado do liveplayer
function addLivePlayerSyncHandler(socket, io) {
  /**
   * Evento: sync-live-player-state
   * Força sincronização do estado atual do liveplayer para todos
   */
  socket.on('sync-live-player-state', async () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Usuário não conectado' });
        return;
      }

      // Verificar se o usuário tem permissão administrativa (level 1+ ou isAdmin)
      const isAdmin = session.userData?.level >= 1 || session.userData?.isAdmin;
      if (!isAdmin) {
        socket.emit('error', { message: 'Apenas administradores podem sincronizar o estado' });
        return;
      }

      const { roomId } = session;
      const adminName = session.userData?.nome || session.userData?.nick || 'Admin';

      console.log(`🔄 Admin ${adminName} solicitou sincronização do estado do liveplayer para sala ${roomId}`);

      // Executar sincronização
      await syncLivePlayerState(io, roomId);

      // Confirmar para o admin
      socket.emit('sync-complete', { message: 'Estado do liveplayer sincronizado com sucesso' });

    } catch (error) {
      console.error('❌ Erro na sincronização manual do liveplayer:', error);
      socket.emit('error', { message: 'Erro ao sincronizar estado do liveplayer' });
    }
  });
}

// ========================================
// EXPORTS E FUNÇÕES PÚBLICAS
// ========================================

// Exportar nova função
module.exports.syncLivePlayerState = syncLivePlayerState;
module.exports.addLivePlayerSyncHandler = addLivePlayerSyncHandler;

// Exportar novos handlers
module.exports.handleConferenceJoin = handleConferenceJoin;
module.exports.handleConferenceLeave = handleConferenceLeave;
module.exports.handleMove = handleMove;
module.exports.handleConferenceExit = handleConferenceExit;

// Exportar cache de mensagens para uso em routes.js
module.exports.recentMessageCache = recentMessageCache;
module.exports.updateParticipantInConference = updateParticipantInConference;
module.exports.handleGetConferenceStats = handleGetConferenceStats;

// Exportar funções utilitárias otimizadas
module.exports.initializeCleanupTimer = initializeCleanupTimer;
module.exports.cleanup = cleanup;
module.exports.cleanDeadConnections = cleanDeadConnections;
module.exports.getCombinedParticipantsList = getCombinedParticipantsList;
module.exports.calculateDetailedUserCounts = calculateDetailedUserCounts;
module.exports.normalizeUserId = normalizeUserId;
module.exports.validateRoomId = validateRoomId;
module.exports.getOnlineUsersForRoom = getOnlineUsersForRoom;
module.exports.isUserOnline = isUserOnline;
module.exports.loadAdminStatesFromRoom = loadAdminStatesFromRoom;
module.exports.formatUsersList = formatUsersList;

// Exportar sistemas de logging otimizados
module.exports.logInfo = logInfo;
module.exports.logDebug = logDebug;
module.exports.logWarning = logWarning;
module.exports.logError = logError;

// Exportar funções do sistema de breakout
module.exports.getOnlineParticipantsForBreakout = getOnlineParticipantsForBreakout;
module.exports.divideParticipantsIntoGroups = divideParticipantsIntoGroups;
module.exports.shuffleAndDivideIntoGroups = shuffleAndDivideIntoGroups;
module.exports.updateParticipantsWithGroups = updateParticipantsWithGroups;
module.exports.clearAllGroups = clearAllGroups;


/**
 * Verificar e limpar conexões mortas
 */
async function cleanDeadConnections(io = null) {
  try {
    const now = Date.now();

    // SISTEMA PROFISSIONAL DE DESCONEXÃO PARA PRODUÇÃO
    // Timeout de 20 minutos para TODOS os usuários (incluindo admins)
    const timeout = 1200000; // 20 minutos para todos

    const deadSockets = [];

    for (const [socketId, lastPing] of connectionHeartbeat.entries()) {
      if (!socketId || typeof lastPing !== "number") {
        deadSockets.push(socketId);
        continue;
      }

      // Verificar se é um usuário administrativo (apenas para logs)
      const session = userSessions.get(socketId);
      const isAdmin = session?.userData?.isAdmin || session?.userData?.level === 3;

      // TODOS os usuários têm o mesmo timeout de 20 minutos
      if (now - lastPing > timeout) {
        deadSockets.push(socketId);
      }
    }

    // Remover sockets mortos
    for (const socketId of deadSockets) {
      const session = userSessions.get(socketId);
      if (session) {
        const { roomId, userId } = session;

        // PROTEÇÃO: Não remover robôs (IDs que começam com "99") do sistema de limpeza
        const isBot = String(userId).startsWith('99');
        if (isBot) {
          logInfo(`🤖 Robô ${userId} protegido da limpeza automática (permanente)`);
          continue; // Pular remoção de robôs
        }

        logInfo(`🗑️ Removendo conexão morta para usuário ${userId} na sala ${roomId} (socket: ${socketId})`);

        // SISTEMA PROFISSIONAL: Notificar cliente ANTES de remover sessões
        await processDeadConnection(socketId, io);

        // Aguardar um pouco para garantir que o evento chegue no cliente
        await new Promise(resolve => setTimeout(resolve, 1500)); // Aumentado para 1.5 segundos

        userSessions.delete(socketId);
        connectionHeartbeat.delete(socketId);

        // Remover da lista de onlineUsers se não houver outras sessões ativas para este usuário na sala
        const hasOtherSessions = Array.from(userSessions.values()).some(s => s.roomId === roomId && s.userId === userId);
        if (!hasOtherSessions) {
          removeUserFromOnlineList(roomId, userId, false, null); // Sem io aqui pois já é feito abaixo
          logInfo(`🗑️ Usuário ${userId} removido da lista online da sala ${roomId}`);
        }

        // Emitir atualização de lista de usuários se houver io
        if (io) {
          sendUpdatedUserList(io, roomId, userId);
        }
      }
    }
  } catch (error) {
    logError("❌ Erro ao limpar conexões mortas:", error);
  }
}




/**
 * Função auxiliar para ler o arquivo room.json.
 */
async function readRoomFile() {
  const roomPath = path.join(__dirname, "../../../api/room.json");
  try {
    const data = await fs.readFile(roomPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logWarning(`⚠️ Erro ao ler room.json:`, error.message);
    }
    return {}; // Retorna objeto vazio se não existir ou houver erro
  }
}

/**
 * Função auxiliar para escrever no arquivo room.json.
 */
async function writeRoomFile(data) {
  const roomPath = path.join(__dirname, "../../../api/room.json");
  try {
    await fs.writeFile(roomPath, JSON.stringify(data, null, 2));
  } catch (error) {
    logError('❌ Erro ao escrever no arquivo room.json', error);
  }
}

/**
 * Atualiza o status da sala no arquivo room.json
 */
async function updateRoomStatusInFile(roomId, isOnline, streamUrl = null, sessionDuration = null) {
  try {
    const roomPath = path.join(__dirname, "../../../api/room.json");
    let roomData = {};

    // Tentar ler dados existentes
    try {
      const existingData = await fs.readFile(roomPath, 'utf8');
      roomData = JSON.parse(existingData);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        logWarning(`⚠️ Erro ao ler room.json existente:`, error.message);
      }
      // Se arquivo não existe, começar com objeto vazio
      roomData = {};
    }

    // Garantir que a estrutura config existe
    if (!roomData.config) {
      roomData.config = {};
    }

    // Atualizar status
    roomData.config.live_enabled = isOnline;
    roomData.config.last_updated = new Date().toISOString();

    if (isOnline) {
      roomData.config.last_online = new Date().toISOString();
      if (streamUrl) {
        roomData.config.stream_url = streamUrl;
      }
    } else {
      roomData.config.last_offline = new Date().toISOString();
      if (sessionDuration) {
        roomData.config.last_session_duration = sessionDuration;
      }
    }

    // Salvar dados atualizados
    await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));

    console.log(`✅ Status da sala ${roomId} atualizado no room.json: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);

  } catch (error) {
    logError('❌ Erro ao atualizar status da sala no room.json', error);
    throw error;
  }
}

/**
 * Lê o status da sala do arquivo room.json
 */
async function getRoomStatusFromFile(roomId) {
  try {
    const roomPath = path.join(__dirname, "../../../api/room.json");
    const roomData = await readRoomFile();

    const isOnline = Boolean(roomData.config?.live_enabled);
    const streamUrl = roomData.config?.stream_url || '';
    const lastOnline = roomData.config?.last_online || null;
    const lastOffline = roomData.config?.last_offline || null;
    const lastDuration = roomData.config?.last_session_duration || null;

    return {
      isOnline,
      streamUrl,
      lastOnline,
      lastOffline,
      lastDuration
    };

  } catch (error) {
    logWarning(`⚠️ Erro ao ler status da sala ${roomId} do room.json:`, error.message);
    return {
      isOnline: false,
      streamUrl: '',
      lastOnline: null,
      lastOffline: null,
      lastDuration: null
    };
  }
}

/**
 * Atualiza o status do JITSI no arquivo room.json
 */
async function updateJitsiStatusInFile(roomId, isJitsiEnabled) {
  try {
    const roomPath = path.join(__dirname, "../../../api/room.json");
    let roomData = {};

    // Tentar ler dados existentes
    try {
      const existingData = await fs.readFile(roomPath, 'utf8');
      roomData = JSON.parse(existingData);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        logWarning(`⚠️ Erro ao ler room.json existente:`, error.message);
      }
      // Se arquivo não existe, começar com objeto vazio
      roomData = {};
    }

    // Garantir que a estrutura config existe
    if (!roomData.config) {
      roomData.config = {};
    }

    // Atualizar status do JITSI
    roomData.config.jitsi_enabled = isJitsiEnabled;
    roomData.config.jitsi_last_updated = new Date().toISOString();

    if (isJitsiEnabled) {
      roomData.config.jitsi_last_enabled = new Date().toISOString();
      // Definir domínio do servidor JITSI Google Cloud
      roomData.config.jitsi_domain = '35.196.37.195';
      roomData.config.jitsi_server_ip = '35.196.37.195';
      roomData.config.jitsi_server_domain = '35.196.37.195';
      roomData.config.jitsi_server_updated_at = new Date().toISOString();
    } else {
      roomData.config.jitsi_last_disabled = new Date().toISOString();
      // Limpar configurações do servidor quando desabilitado
      delete roomData.config.jitsi_domain;
      delete roomData.config.jitsi_server_ip;
      delete roomData.config.jitsi_server_domain;
      delete roomData.config.jitsi_server_updated_at;
    }

    // Salvar dados atualizados
    await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));

    console.log(`✅ Status JITSI da sala ${roomId} atualizado no room.json: ${isJitsiEnabled ? 'HABILITADO' : 'DESABILITADO'}`);

  } catch (error) {
    logError('❌ Erro ao atualizar status JITSI no room.json', error);
    throw error;
  }
}

/**
 * Lê o status do JITSI do arquivo room.json
 */
async function getJitsiStatusFromFile(roomId) {
  try {
    const roomPath = path.join(__dirname, "../../../api/room.json");
    const roomData = await readRoomFile();

    const isJitsiEnabled = Boolean(roomData.config?.jitsi_enabled);
    const lastEnabled = roomData.config?.jitsi_last_enabled || null;
    const lastDisabled = roomData.config?.jitsi_last_disabled || null;
    const lastUpdated = roomData.config?.jitsi_last_updated || null;

    return {
      isJitsiEnabled,
      lastEnabled,
      lastDisabled,
      lastUpdated
    };

  } catch (error) {
    logWarning(`⚠️ Erro ao ler status JITSI da sala ${roomId} do room.json:`, error.message);
    return {
      isJitsiEnabled: false,
      lastEnabled: null,
      lastDisabled: null,
      lastUpdated: null
    };
  }
}

// ========================================
// FUNÇÕES AUXILIARES - SISTEMA DE BREAKOUT
// ========================================

/**
 * Buscar participantes online para divisão de grupos
 */
async function getOnlineParticipantsForBreakout(roomId) {
  try {
    // Buscar participantes do arquivo JSON
    const participantsPath = path.join(__dirname, '../../../api/participantes.json');
    const participantsData = JSON.parse(await fs.readFile(participantsPath, 'utf8'));

    // Filtrar apenas os que estão online
    const onlineUserIds = getOnlineUsersForRoom(roomId);
    const onlineUserIdsSet = new Set(onlineUserIds.map(id => parseInt(id)));

    // Filtrar apenas usuários que estão online
    const onlineParticipants = participantsData.filter(p =>
      onlineUserIdsSet.has(parseInt(p.id))
    );

    console.log(`🔍 Encontrados ${onlineParticipants.length} participantes online de ${participantsData.length} total`);

    return onlineParticipants;

  } catch (error) {
    console.error('❌ Erro ao buscar participantes online para breakout:', error);
    return [];
  }
}

/**
 * Dividir participantes em grupos aleatórios
 */
function divideParticipantsIntoGroups(participants, groupSize, separateBySex) {
  try {
    let groups = [];

    if (separateBySex) {
      // Separar por sexo (1 = masculino, 2 = feminino)
      const males = participants.filter(p => parseInt(p.sexo) === 1);
      const females = participants.filter(p => parseInt(p.sexo) === 2);
      const others = participants.filter(p => ![1, 2].includes(parseInt(p.sexo)));

      console.log(`👨 ${males.length} participantes masculinos`);
      console.log(`👩 ${females.length} participantes femininos`);
      if (others.length > 0) {
        console.log(`👤 ${others.length} participantes sem sexo definido`);
      }

      // Dividir cada grupo separadamente
      const maleGroups = shuffleAndDivideIntoGroups(males, groupSize);
      const femaleGroups = shuffleAndDivideIntoGroups(females, groupSize);
      const otherGroups = shuffleAndDivideIntoGroups(others, groupSize);

      groups = [...maleGroups, ...femaleGroups, ...otherGroups];

    } else {
      // Misturar todos juntos
      groups = shuffleAndDivideIntoGroups(participants, groupSize);
    }

    // Filtrar grupos vazios
    groups = groups.filter(group => group.length > 0);

    console.log(`✅ Criados ${groups.length} grupos: ${groups.map(g => g.length).join(', ')} participantes`);

    return groups;

  } catch (error) {
    console.error('❌ Erro ao dividir participantes em grupos:', error);
    return [];
  }
}

/**
 * Embaralhar array e dividir em grupos de tamanho específico
 */
function shuffleAndDivideIntoGroups(array, groupSize) {
  if (!array || array.length === 0) return [];

  // Embaralhar array usando algoritmo Fisher-Yates
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Dividir em grupos
  const groups = [];
  for (let i = 0; i < shuffled.length; i += groupSize) {
    const group = shuffled.slice(i, i + groupSize);
    if (group.length > 0) {
      groups.push(group);
    }
  }

  return groups;
}

/**
 * Atualizar arquivo participantes.json com os novos grupos
 */
async function updateParticipantsWithGroups(roomId, groups) {
  try {
    const participantsPath = path.join(__dirname, '../../../api/participantes.json');
    const participantsData = JSON.parse(await fs.readFile(participantsPath, 'utf8'));

    // Primeiro, limpar todos os grupos existentes
    participantsData.forEach(p => {
      p.grupo = null;
    });

    // Atribuir novos grupos
    groups.forEach((group, groupIndex) => {
      const groupName = `G${groupIndex + 1}`;

      group.forEach(member => {
        const participant = participantsData.find(p => parseInt(p.id) === parseInt(member.id));
        if (participant) {
          participant.grupo = groupName;
          console.log(`👤 ${participant.nick} → ${groupName}`);
        }
      });
    });

    // Salvar arquivo atualizado
    await fs.writeFile(participantsPath, JSON.stringify(participantsData, null, 2));

    console.log(`✅ Arquivo participantes.json atualizado com ${groups.length} grupos`);

  } catch (error) {
    console.error('❌ Erro ao atualizar participantes.json com grupos:', error);
    throw error;
  }
}

/**
 * Limpar todos os grupos dos participantes
 */
async function clearAllGroups(roomId) {
  try {
    const participantsPath = path.join(__dirname, '../../../api/participantes.json');
    const participantsData = JSON.parse(await fs.readFile(participantsPath, 'utf8'));

    // Limpar campo grupo de todos os participantes
    let clearedCount = 0;
    participantsData.forEach(p => {
      if (p.grupo !== null) {
        p.grupo = null;
        clearedCount++;
      }
    });

    // Salvar arquivo atualizado
    await fs.writeFile(participantsPath, JSON.stringify(participantsData, null, 2));

    console.log(`✅ Grupos limpos de ${clearedCount} participantes`);

  } catch (error) {
    console.error('❌ Erro ao limpar grupos dos participantes:', error);
    throw error;
  }
}

// ========================================
// SEÇÃO: ATUALIZADOR PERIÓDICO DO CHAT.JSON
// ========================================

/**
 * Atualiza o arquivo chat.json estático periodicamente
 * Melhor performance: dados em tempo real via Socket.IO + backup estático
 */
async function updateStaticChatJson() {
  try {
    const chatPath = path.join(__dirname, '../../../api/chat.json');

    // Ler template atual
    let chatData = [];
    try {
      const data = await fs.readFile(chatPath, 'utf8');
      chatData = JSON.parse(data);
    } catch (error) {
      console.warn('⚠️ Arquivo chat.json não encontrado para atualização, usando template padrão');
      chatData = [{}, { "sid": "STATIC_UPDATE", "upgrades": ["websocket"], "pingInterval": 25000, "pingTimeout": 20000 }, {}];
    }

    // Calcular contadores agregados de todas as salas principais
    const mainRooms = ['pub', 'admin']; // Salas principais para agregar
    let aggregatedCounts = {
      online: 0, insc: 0, staff: 0, breakout: 0, breakout_insc: 0, breakout_staff: 0,
      reuniao: 0, reuniao_insc: 0, reuniao_staff: 0,
      equipe: 0, equipe_insc: 0, equipe_staff: 0,
      rede: 0, rede_insc: 0, rede_staff: 0,
      oracao: 0, oracao_insc: 0, oracao_staff: 0,
      atendimento: 0, atendimento_insc: 0, atendimento_staff: 0,
      projeto: 0, projeto_insc: 0, projeto_staff: 0,
      grupo: 0, grupo_insc: 0, grupo_staff: 0,
      turma: 0, turma_insc: 0, turma_staff: 0,
      professor: 0, professor_insc: 0, professor_staff: 0,
      sala: 0, sala_insc: 0, sala_staff: 0
    };

    // Agregar contadores de todas as salas principais
    for (const roomId of mainRooms) {
      try {
        const counts = await calculateDetailedUserCounts(roomId);

        // Agregar contadores simples
        aggregatedCounts.online += counts.online || 0;
        aggregatedCounts.insc += counts.insc || 0;
        aggregatedCounts.staff += counts.staff || 0;

        // Agregar por categoria (formato detalhado)
        Object.keys(counts).forEach(key => {
          if (key !== 'total' && key !== 'online' && key !== 'offline' && counts[key] > 0) {
            if (aggregatedCounts[key] !== undefined) {
              aggregatedCounts[key] += counts[key];
              aggregatedCounts[`${key}_insc`] += counts[key]; // Assumir como inscritos por padrão
            }
          }
        });

      } catch (error) {
        console.warn(`⚠️ Erro ao calcular contadores para sala ${roomId}:`, error.message);
      }
    }

    // Atualizar elemento [2] com contadores agregados
    if (chatData.length >= 3) {
      chatData[2] = aggregatedCounts;
    } else {
      chatData.push(aggregatedCounts);
    }

    // Escrever arquivo atualizado
    await fs.writeFile(chatPath, JSON.stringify(chatData, null, 2), 'utf8');
    console.log(`📁 Chat.json estático atualizado:`, {
      online: aggregatedCounts.online,
      sala: aggregatedCounts.sala,
      reuniao: aggregatedCounts.reuniao,
      equipe: aggregatedCounts.equipe,
      projeto: aggregatedCounts.projeto
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar chat.json estático:', error);
  }
}

/**
 * Inicializar timer de atualização periódica do chat.json
 */
function startChatJsonUpdater() {
  // Atualizar imediatamente
  updateStaticChatJson();

  // Depois a cada 30 segundos
  setInterval(updateStaticChatJson, 30000);
  console.log('⏰ Timer de atualização do chat.json iniciado (30s)');
}

// Adicionar aos exports existentes
module.exports.startChatJsonUpdater = startChatJsonUpdater;
module.exports.updateStaticChatJson = updateStaticChatJson;
