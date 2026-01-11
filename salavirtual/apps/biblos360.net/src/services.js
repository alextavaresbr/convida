/**
 * SERVIÇOS CONSOLIDADOS - BIBLOS360 VIRTUAL ROOM
 * Todos os serviços e utilitários do sistema centralizados em um arquivo
 */

// ========================================
// SEÇÁO 1: IMPORTS E DEPENDÊNCIAS
// ========================================

const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// ========================================
// SEÇÁO 2: UTILITÁRIOS DE COMPATIBILIDADE PHP
// ========================================

/**
 * Gera hash MD5 compatível com PHP
 */
function generateMD5Hash(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * Gera hash de sessão compatível
 */
function generateSessionHash(data) {
  const str = `${data.roomId || ''}_${data.userId || ''}_${data.userAgent || ''}_${data.timestamp || Date.now()}`;
  return generateMD5Hash(str);
}

/**
 * Valida se é um hash MD5 válido
 */
function isValidMD5Hash(hash) {
  return /^[a-f0-9]{32}$/i.test(hash);
}

/**
 * Cria cookie compatível com sistema legado PHP
 */
function createBiblos360Cookie(data) {
  // Cria serialização PHP compatível ao invés de base64/JSON
  const keys = Object.keys(data);
  let serialized = `a:${keys.length}:{`;

  keys.forEach(key => {
    const value = data[key];
    serialized += `s:${key.length}:"${key}";`;
    if (typeof value === 'string') {
      serialized += `s:${value.length}:"${value}";`;
    } else if (typeof value === 'number') {
      const strValue = value.toString();
      serialized += `s:${strValue.length}:"${strValue}";`;
    } else {
      const strValue = String(value);
      serialized += `s:${strValue.length}:"${strValue}";`;
    }
  });

  serialized += '}';

  // Adiciona hash MD5 no final (como no sistema legado)
  const hash = generateMD5Hash(serialized);
  return serialized + hash;
}

/**
 * Decodifica cookie do sistema legado PHP
 */
function parseBiblos360Cookie(cookieValue) {
  if (!cookieValue) return null;

  try {
    // Primeiro tenta decodificar base64
    try {
      const decoded = Buffer.from(cookieValue, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (base64Error) {
      // Se falhar, tenta parse direto do formato PHP serializado
      return parsePhpSerializedCookie(cookieValue);
    }
  } catch (error) {
    console.error('Erro ao parsear cookie Biblos360:', error.message);
    return null;
  }
}

/**
 * Parse de cookie PHP serializado (formato a:N:{...})
 */
function parsePhpSerializedCookie(data) {
  try {
    if (!data || typeof data !== 'string') return null;

    // Limpar dados
    const cleanData = decodeURIComponent(data).trim();

    // Parse simples para formato PHP a:N:{...}
    if (!cleanData.startsWith('a:')) return null;

    const result = {};

    // Regex para extrair pares chave-valor do formato PHP serialized
    const stringPattern = /s:\d+:"([^"]+)";s:\d+:"([^"]*)"/g;
    let match;

    while ((match = stringPattern.exec(cleanData)) !== null) {
      const key = match[1];
      const value = match[2];
      result[key] = value;
    }

    // Também processa valores não-string (números, etc)
    const numPattern = /s:\d+:"([^"]+)";i:(\d+)/g;
    let numMatch;

    while ((numMatch = numPattern.exec(cleanData)) !== null) {
      const key = numMatch[1];
      const value = parseInt(numMatch[2]);
      result[key] = value;
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch (error) {
    console.warn('Erro ao processar cookie PHP serializado:', error.message);
    return null;
  }
}

/**
 * Middleware de processamento de cookies PHP
 */
function phpCookieMiddleware(req, res, next) {
  // Processa cookies específicos do Biblos360
  const usuarioCookie = req.cookies?.biblos360_site_usuario;
  const inscritoCookie = req.cookies?.biblos360_site_inscrito;

  let isAuthenticated = false;
  let hasInscricao = false;
  let user = null;
  let inscricao = null;

  // Processa cookie de usuário
  if (usuarioCookie) {
    const userData = parseBiblos360Cookie(usuarioCookie);
    if (userData && userData.id) {
      isAuthenticated = true;
      user = {
        valid: true,
        data: userData
      };
    }
  }

  // Processa cookie de inscrição
  if (inscritoCookie) {
    const inscricaoData = parseBiblos360Cookie(inscritoCookie);
    if (inscricaoData && inscricaoData.id) {
      hasInscricao = true;
      inscricao = {
        valid: true,
        data: inscricaoData
      };
    }
  }

  // Adiciona informações de autenticação ao request
  req.biblos360Auth = {
    isAuthenticated,
    hasInscricao,
    user,
    inscricao
  };

  next();
}

// ========================================
// SEÇÁO 3: SERVIÇOS DE VÍDEO
// ========================================

/**
 * Carrega arquivo de posições de vídeo
 */
async function loadVideoPositions() {
  const dataPath = path.join(__dirname, '../data');
  const videoPositionsPath = path.join(dataPath, 'video_positions.json');

  try {
    // Garante que o diretório existe
    await fs.mkdir(dataPath, { recursive: true });

    const data = await fs.readFile(videoPositionsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Se o arquivo não existir, cria um novo com estrutura vazia
      const emptyPositions = {};
      await saveVideoPositions(emptyPositions);
      return emptyPositions;
    }
    throw error;
  }
}

/**
 * Salva posições de vídeo no arquivo
 */
async function saveVideoPositions(positions) {
  const dataPath = path.join(__dirname, '../data');
  const videoPositionsPath = path.join(dataPath, 'video_positions.json');

  // Garante que o diretório existe
  await fs.mkdir(dataPath, { recursive: true });

  await fs.writeFile(videoPositionsPath, JSON.stringify(positions, null, 2), 'utf-8');
}

/**
 * Busca posições salvas de vídeos
 */
async function getVideoPositions(sessionHash, videoHashArray) {
  const positions = await loadVideoPositions();
  const result = [];

  // Para cada videoHash solicitado, busca a posição correspondente
  videoHashArray.forEach(videoHash => {
    const key = `${sessionHash}_${videoHash}`;
    const position = positions[key];

    if (position) {
      // Retorna formato compatível: [videoHash, posicaoAtual, duracaoTotal]
      result.push([videoHash, position.time || 0, position.duration || 0]);
    } else {
      // Se não tem posição salva, retorna zeros
      result.push([videoHash, 0, 0]);
    }
  });

  return result;
}

/**
 * Salva posição de um vídeo
 */
async function saveVideoPosition(sessionHash, videoHash, positionData) {
  const { time, duration, video_id, playlist_id } = positionData;

  const positions = await loadVideoPositions();
  const key = `${sessionHash}_${videoHash}`;

  // Salva a posição com metadados
  const savedData = {
    time: time,
    duration: duration,
    updated: new Date().toISOString(),
    video_id: video_id || null,
    playlist_id: playlist_id || null,
    session_hash: sessionHash,
    video_hash: videoHash
  };

  positions[key] = savedData;

  await saveVideoPositions(positions);

  return savedData;
}

/**
 * Remove posição de um vídeo específico
 */
async function deleteVideoPosition(sessionHash, videoHash) {
  const positions = await loadVideoPositions();
  const key = `${sessionHash}_${videoHash}`;

  if (positions[key]) {
    delete positions[key];
    await saveVideoPositions(positions);
    return true;
  }

  return false;
}

/**
 * Remove todas as posições de uma sessão
 */
async function deleteSessionPositions(sessionHash) {
  const positions = await loadVideoPositions();
  const keysToDelete = Object.keys(positions).filter(key => key.startsWith(`${sessionHash}_`));

  let deletedCount = 0;
  keysToDelete.forEach(key => {
    delete positions[key];
    deletedCount++;
  });

  if (deletedCount > 0) {
    await saveVideoPositions(positions);
  }

  return deletedCount;
}

/**
 * Obtém estatísticas de visualização de uma sessão
 */
async function getSessionStats(sessionHash) {
  const positions = await loadVideoPositions();
  const sessionKeys = Object.keys(positions).filter(key => key.startsWith(`${sessionHash}_`));

  const stats = {
    session_hash: sessionHash,
    total_videos: sessionKeys.length,
    videos: [],
    total_watch_time: 0,
    last_activity: null,
    created_at: null
  };

  sessionKeys.forEach(key => {
    const position = positions[key];
    const videoHash = key.replace(`${sessionHash}_`, '');

    stats.videos.push({
      video_hash: videoHash,
      video_id: position.video_id,
      playlist_id: position.playlist_id,
      current_time: position.time,
      duration: position.duration,
      progress_percentage: position.duration > 0 ? Math.round((position.time / position.duration) * 100) : 0,
      last_updated: position.updated
    });

    stats.total_watch_time += position.time || 0;

    // Atualiza última atividade
    if (!stats.last_activity || position.updated > stats.last_activity) {
      stats.last_activity = position.updated;
    }

    // Atualiza data de criação (primeira atividade)
    if (!stats.created_at || position.updated < stats.created_at) {
      stats.created_at = position.updated;
    }
  });

  // Ordena vídeos por última atualização
  stats.videos.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));

  return stats;
}

// ========================================
// SEÇÁO 4: SERVIÇOS DE DADOS
// ========================================

/**
 * Carrega dados de usuários do Supabase
 */
async function loadUsersData() {
  try {
    const supabaseService = require('./supabase');

    // Buscar todos os usuários do Supabase usando o cliente admin
    const { data: users, error } = await supabaseService.adminClient
      .from('users')
      .select('*');

    if (error) {
      console.error('Erro ao carregar usuários do Supabase:', error);
      return [];
    }

    return users || [];
  } catch (error) {
    console.error('Erro ao carregar dados de usuários:', error);
    return [];
  }
}

/**
 * Carrega dados de uma sala específica
 */
async function loadRoomData(roomId, dataType) {
  try {
    let filePath;

    // Arquivos que ficam na pasta data (globais)
    if (['index', 'logado_data', 'video_positions'].includes(dataType)) {
      filePath = path.join(__dirname, '../../../data', `${dataType}.json`);
    } else if (['participantes', 'messages', 'chat', 'room', 'sessoes', 'extra', 'page_info'].includes(dataType)) {
      // Arquivos da API centralizada
      filePath = path.join(__dirname, '../../../api', `${dataType}.json`);
    } else {
      // Outros arquivos específicos da sala (mantém estrutura original para compatibilidade)
      filePath = path.join(__dirname, '../public/vr', roomId, `${dataType}.json`);
    }

    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.warn(`Arquivo não encontrado: ${dataType}.json para sala ${roomId}`);
    return [];
  }
}

/**
 * Salva dados em arquivo JSON
 */
async function saveJSONData(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados JSON:', error);
    return false;
  }
}

// ========================================
// SEÇÁO 4.5: CACHE QUADRO DE AVISOS
// ========================================

// Cache em memória para mensagens do quadro de avisos por sala
const roomInfoCache = new Map();

/**
 * Obtém a mensagem atual do quadro de avisos para uma sala
 */
function getRoomInfo(roomId) {
  return roomInfoCache.get(roomId) || '';
}

/**
 * Define a mensagem do quadro de avisos para uma sala
 */
function setRoomInfo(roomId, message) {
  if (message && message.trim() !== '') {
    roomInfoCache.set(roomId, message.trim());
  } else {
    roomInfoCache.delete(roomId);
  }
}

/**
 * Remove a mensagem do quadro de avisos para uma sala
 */
function clearRoomInfo(roomId) {
  roomInfoCache.delete(roomId);
}

// ========================================
// SEÇÁO 5: SERVIÇOS DE MOCK E FALLBACK
// ========================================

/**
 * Gera dados mock de participantes
 */
function generateMockParticipants(room, options = {}) {
  const { sortBy = 'turma', filter = 'all', onlineOnly = false } = options;

  // Por enquanto retorna estrutura vazia mas compatível
  return {
    participants: [],
    total: 0,
    online: 0,
    offline: 0,
    room_id: room,
    sort_by: sortBy,
    filter: filter,
    timestamp: new Date().toISOString(),
    message: 'Dados em desenvolvimento'
  };
}

/**
 * Gera dados mock de mensagens de chat
 */
function generateMockChatMessages(room, options = {}) {
  const { limit = 50, offset = 0, type = 'all', user = null } = options;

  // Por enquanto retorna estrutura vazia mas compatível
  return {
    messages: [],
    total: 0,
    limit: limit,
    offset: offset,
    type: type,
    user: user,
    room_id: room,
    timestamp: new Date().toISOString(),
    message: 'Dados em desenvolvimento'
  };
}

/**
 * Gera sessões mock para fallback
 */
function generateMockSessions(roomId) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    sessions: {
      [`${roomId}_session_1`]: {
        id: `${roomId}_session_1`,
        title: "Sessão de Exemplo",
        description: "Sessão gerada automaticamente",
        start_time: now.toISOString(),
        end_time: tomorrow.toISOString(),
        status: "active",
        room_id: roomId,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }
    },
    total: 1,
    _mock: true
  };
}

// ========================================
// SEÇÁO 6: EXPORTS
// ========================================

/**
 * Obtém o ícone apropriado para um tipo de arquivo
 */
function getFileIcon(extension) {
  const iconMap = {
    'pdf': 'page_white_acrobat',
    'doc': 'page_white_word',
    'docx': 'page_white_word',
    'xls': 'page_white_excel',
    'xlsx': 'page_white_excel',
    'ppt': 'page_white_powerpoint',
    'pptx': 'page_white_powerpoint',
    'txt': 'page_white_text',
    'jpg': 'page_white_picture',
    'jpeg': 'page_white_picture',
    'png': 'page_white_picture',
    'gif': 'page_white_picture',
    'zip': 'page_white_zip',
    'rar': 'page_white_zip',
    'mp3': 'page_white_sound',
    'mp4': 'page_white_film',
    'avi': 'page_white_film',
    'mov': 'page_white_film'
  };

  return iconMap[extension?.toLowerCase()] || 'page_white';
}

/**
 * Formata o tamanho do arquivo para exibição
 */
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Obtém a lista real de usuários online de uma sala
 * Integra com o sistema Socket.IO para dados em tempo real
 */
function getRealOnlineUsers(roomId) {
  try {
    // Importar dados do handlers para acessar usuários online
    const { onlineUsers } = require('./handlers');

    if (!onlineUsers.has(roomId)) {
      return [];
    }

    const onlineUserIds = Array.from(onlineUsers.get(roomId));
    console.log(`📊 Usuários online na sala ${roomId}: ${onlineUserIds.length} usuários - [${onlineUserIds.join(', ')}]`);

    return onlineUserIds;
  } catch (error) {
    console.warn('Erro ao obter usuários online:', error.message);
    return [];
  }
}

// ========================================
// SEÇÁO 8: SERVIÇOS DE ESTABILIDADE
// ========================================

/**
 * Serviço de estabilização de usuários online
 * Garante que a lista de usuários seja consistente e estável
 */
class UserStabilityService {
  constructor() {
    this.stableConnections = new Map(); // userId -> { lastSeen, isStable, isAdmin }
    this.stabilityTimeout = 300000; // 5 minutos para considerar uma conexão estável
    this.adminStabilityTimeout = 600000; // 10 minutos para admins
    this.cleanupInterval = 900000; // Limpeza a cada 15 minutos

    // Iniciar limpeza automática
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  /**
   * Registra uma conexão de usuário como estável
   */
  markUserAsStable(userId, socketId, isAdmin = false) {
    const now = Date.now();
    const timeout = isAdmin ? this.adminStabilityTimeout : this.stabilityTimeout;

    this.stableConnections.set(userId, {
      lastSeen: now,
      isStable: true,
      socketId: socketId,
      isAdmin: isAdmin,
      stabilizedAt: now + timeout
    });

    console.log(`🔒 Usuário ${userId} marcado como estável (${isAdmin ? 'admin' : 'normal'} - timeout: ${timeout / 1000}s = ${isAdmin ? '10min' : '5min'})`);
  }

  /**
   * Verifica se um usuário tem conexão estável
   */
  isUserStable(userId) {
    const connection = this.stableConnections.get(userId);
    if (!connection) return false;

    const now = Date.now();
    const timeout = connection.isAdmin ? this.adminStabilityTimeout : this.stabilityTimeout;
    return connection.isStable && (now - connection.lastSeen) < timeout;
  }

  /**
   * Atualiza última atividade do usuário
   */
  updateUserActivity(userId) {
    const connection = this.stableConnections.get(userId);
    if (connection) {
      connection.lastSeen = Date.now();
    }
  }

  /**
   * Remove usuário da lista de conexões estáveis
   */
  removeUser(userId) {
    this.stableConnections.delete(userId);
  }

  /**
   * Limpeza de conexões inativas
   */
  cleanup() {
    const now = Date.now();
    const expiredUsers = [];

    for (const [userId, connection] of this.stableConnections.entries()) {
      // Usar timeout diferente para admins
      const timeout = connection.isAdmin ? this.adminStabilityTimeout : this.stabilityTimeout;
      const maxInactiveTime = timeout * 2; // 2x o timeout para remoção definitiva

      if (now - connection.lastSeen > maxInactiveTime) {
        expiredUsers.push(userId);
      }
    }

    expiredUsers.forEach(userId => {
      const connection = this.stableConnections.get(userId);
      const userType = connection?.isAdmin ? 'admin' : 'normal';
      const maxTime = '30 minutos'; // Agora igual para todos

      this.stableConnections.delete(userId);
      console.log(`🧹 Removendo usuário ${userType} expirado da lista estável: ${userId} (inativo por mais de ${maxTime})`);
    });
  }

  /**
   * Obtém estatísticas do serviço
   */
  getStats() {
    return {
      totalStableConnections: this.stableConnections.size,
      connections: Array.from(this.stableConnections.entries()).map(([userId, data]) => ({
        userId,
        lastSeen: data.lastSeen,
        isStable: data.isStable,
        stableFor: Date.now() - data.stabilizedAt
      }))
    };
  }
}

/**
 * Serviço de heartbeat para manter conexões vivas
 */
class HeartbeatService {
  constructor() {
    this.connections = new Map(); // socketId -> { lastPing, missedPings }

    // SISTEMA PROFISSIONAL: Heartbeat para 20 minutos de inatividade
    this.heartbeatInterval = 2000; // 2 segundos para heartbeat
    this.maxMissedPings = 600; // 600 pings perdidos = 1200 segundos = 20 minutos total

    this.isRunning = false;
  }

  /**
   * Inicia o serviço de heartbeat
   */
  start(io, getUserSessions = null) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.io = io;
    this.getUserSessions = getUserSessions; // Para acessar informações de usuário

    this.interval = setInterval(() => {
      this.sendHeartbeats();
    }, this.heartbeatInterval);

    console.log('💗 Serviço de heartbeat iniciado');
  }

  /**
   * Para o serviço de heartbeat
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('💗 Serviço de heartbeat parado');
  }

  /**
   * Registra uma nova conexão
   */
  addConnection(socketId) {
    this.connections.set(socketId, {
      lastPing: Date.now(),
      missedPings: 0
    });
  }

  /**
   * Remove uma conexão
   */
  removeConnection(socketId) {
    this.connections.delete(socketId);
  }

  /**
   * Atualiza timestamp de ping de uma conexão
   */
  updatePing(socketId) {
    const connection = this.connections.get(socketId);
    if (connection) {
      connection.lastPing = Date.now();
      connection.missedPings = 0;
    }
  }

  /**
   * Envia heartbeats para todas as conexões
   */
  sendHeartbeats() {
    if (!this.io) return;

    const now = Date.now();
    const deadConnections = [];

    for (const [socketId, connection] of this.connections.entries()) {
      const socket = this.io.sockets.sockets.get(socketId);

      if (!socket) {
        deadConnections.push(socketId);
        continue;
      }

      // Verificar se é usuário admin através da função de sessões
      let isAdmin = false;
      if (this.getUserSessions) {
        const userSessions = this.getUserSessions();
        const session = userSessions.get(socketId);
        isAdmin = session?.userData?.isAdmin || session?.userData?.level === 3;
      }

      // Verificar se a conexão perdeu muitos pings
      if (now - connection.lastPing > this.heartbeatInterval) {
        connection.missedPings++;

        // SISTEMA PROFISSIONAL: TODOS os usuários têm o mesmo limite (20 minutos)
        const maxPings = this.maxMissedPings; // 2 pings perdidos para todos (4 segundos + buffer)

        // Só desconecta se perdeu muitos pings E o socket não está realmente conectado
        if (connection.missedPings >= maxPings && !socket.connected) {
          const userType = isAdmin ? '(ADMIN)' : '(USUÁRIO)';
          console.log(`💔 Conexão morta detectada: ${socketId} ${userType} (${connection.missedPings} pings perdidos, socket desconectado)`);
          deadConnections.push(socketId);
          socket.disconnect(true);
          continue;
        }

        // Se o socket ainda está conectado, só avisa mas não desconecta
        if (connection.missedPings >= maxPings && socket.connected) {
          const userType = isAdmin ? '(ADMIN)' : '(USUÁRIO)';
          console.log(`⚠️ Socket com ping lento mas ainda conectado: ${socketId} ${userType} (${connection.missedPings} pings perdidos)`);
          // Reset para dar mais uma chance, especialmente para admins
          connection.missedPings = Math.floor(maxPings / 2);
        }
      }

      // Enviar ping apenas se o socket ainda está conectado
      if (socket.connected) {
        socket.emit('heartbeat-ping', { timestamp: now });
      }
    }

    // Limpar conexões mortas
    deadConnections.forEach(socketId => {
      this.connections.delete(socketId);
    });
  }

  /**
   * Obtém estatísticas do heartbeat
   */
  getStats() {
    const now = Date.now();
    return {
      totalConnections: this.connections.size,
      isRunning: this.isRunning,
      connections: Array.from(this.connections.entries()).map(([socketId, data]) => ({
        socketId,
        lastPing: data.lastPing,
        missedPings: data.missedPings,
        timeSinceLastPing: now - data.lastPing
      }))
    };
  }
}

// Instâncias globais dos novos serviços
const userStabilityService = new UserStabilityService();
const heartbeatService = new HeartbeatService();

// ========================================
// SEÇÁO 13: SERVIÇOS GOOGLE CLOUD JITSI
// ========================================

/**
 * Classe para controlar a instância JITSI no Google Cloud
 */
class GoogleCloudJitsiService {
  constructor() {
    this.config = require('../config/config').get('jitsi.googleCloud');
    this.isOperationInProgress = false;
    this.lastOperationTime = 0;
  }

  /**
   * Liga a instância JITSI no Google Cloud
   */
  async startInstance() {
    console.log(`🔍 DEBUG: startInstance chamado - isOperationInProgress: ${this.isOperationInProgress}, lastOperationTime: ${this.lastOperationTime}`);

    try {
      console.log(`🚀 Iniciando instância JITSI: ${this.config.instanceName}`);

      // Comando gcloud para ligar a instância
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      const os = require('os');

      // Configurar PATH para incluir Google Cloud SDK
      let gcloudPath = '';
      if (os.platform() === 'win32') {
        gcloudPath = `${process.env.LOCALAPPDATA}\\Google\\Cloud SDK\\google-cloud-sdk\\bin`;
      } else {
        gcloudPath = `${process.env.HOME}/google-cloud-sdk/bin`;
      }

      const env = {
        ...process.env,
        PATH: `${process.env.PATH};${gcloudPath}`
      };

      const command = `gcloud compute instances start ${this.config.instanceName} --zone=${this.config.zone} --project=${this.config.projectId}`;

      const { stdout, stderr } = await execAsync(command, { env });

      // O gcloud pode retornar informações tanto no stdout quanto no stderr
      const output = (stdout + stderr).toLowerCase();

      // Verificar se houve sucesso procurando por indicadores de sucesso
      if (!output.includes('done') && !output.includes('updated')) {
        throw new Error(`Erro ao ligar instância: ${stderr || stdout}`);
      }

      console.log(`✅ Instância JITSI ligada com sucesso`);
      console.log(`📋 Resposta do gcloud:`, (stdout + stderr).trim());

      // Aguardar a instância ficar operacional (máximo 60 segundos)
      await this.waitForInstanceReady();

      return {
        success: true,
        message: 'Instância JITSI ligada com sucesso',
        ip: this.config.serverIP,
        domain: this.config.serverDomain
      };

    } catch (error) {
      console.error(`❌ Erro ao ligar instância JITSI:`, error.message);
      throw error;
    }
  }

  /**
   * Desliga a instância JITSI no Google Cloud
   */
  async stopInstance() {
    console.log(`🔍 DEBUG: stopInstance chamado - isOperationInProgress: ${this.isOperationInProgress}, lastOperationTime: ${this.lastOperationTime}`);

    try {
      console.log(`🛑 Desligando instância JITSI: ${this.config.instanceName}`);

      // Comando gcloud para desligar a instância
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      const os = require('os');

      // Configurar PATH para incluir Google Cloud SDK
      let gcloudPath = '';
      if (os.platform() === 'win32') {
        gcloudPath = `${process.env.LOCALAPPDATA}\\Google\\Cloud SDK\\google-cloud-sdk\\bin`;
      } else {
        gcloudPath = `${process.env.HOME}/google-cloud-sdk/bin`;
      }

      const env = {
        ...process.env,
        PATH: `${process.env.PATH};${gcloudPath}`
      };

      const command = `gcloud compute instances stop ${this.config.instanceName} --zone=${this.config.zone} --project=${this.config.projectId}`;

      const { stdout, stderr } = await execAsync(command, { env });

      // O gcloud pode retornar informações tanto no stdout quanto no stderr
      const output = (stdout + stderr).toLowerCase();

      // Verificar se houve sucesso procurando por indicadores de sucesso
      if (!output.includes('done') && !output.includes('updated')) {
        throw new Error(`Erro ao desligar instância: ${stderr || stdout}`);
      }

      console.log(`✅ Instância JITSI desligada com sucesso`);
      console.log(`📋 Resposta do gcloud:`, (stdout + stderr).trim());

      return {
        success: true,
        message: 'Instância JITSI desligada com sucesso'
      };

    } catch (error) {
      console.error(`❌ Erro ao desligar instância JITSI:`, error.message);
      throw error;
    }
  }

  /**
   * Verifica o status da instância JITSI e descobre IP atual
   */
  async getInstanceStatus() {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      const os = require('os');

      // Configurar PATH para incluir Google Cloud SDK
      let gcloudPath = '';
      if (os.platform() === 'win32') {
        gcloudPath = `${process.env.LOCALAPPDATA}\\Google\\Cloud SDK\\google-cloud-sdk\\bin`;
      } else {
        gcloudPath = `${process.env.HOME}/google-cloud-sdk/bin`;
      }

      const env = {
        ...process.env,
        PATH: `${process.env.PATH};${gcloudPath}`
      };

      // Comando para obter status E IP externo
      const command = `gcloud compute instances describe ${this.config.instanceName} --zone=${this.config.zone} --project=${this.config.projectId} --format="value(status,networkInterfaces[0].accessConfigs[0].natIP)"`;

      console.log(`🔍 [GCLOUD DEBUG] Executando comando: ${command}`);
      console.log(`🔍 [GCLOUD DEBUG] PATH inclui: ${gcloudPath}`);

      const { stdout, stderr } = await execAsync(command, { env });

      if (stderr) {
        console.warn(`⚠️ Warning ao verificar status:`, stderr);
      }

      // O comando gcloud pode retornar dados separados por \t ou \n
      const output = stdout.trim();
      console.log(`🔍 [GCLOUD DEBUG] Output bruto: "${output}"`);

      let status, currentIP;

      if (output.includes('\t')) {
        // Dados separados por tab na mesma linha
        const parts = output.split('\t');
        status = parts[0] || 'UNKNOWN';
        currentIP = parts[1] || null;
      } else {
        // Dados separados por linhas
        const lines = output.split('\n');
        status = lines[0] || 'UNKNOWN';
        currentIP = lines[1] || null;
      }

      const isRunning = status === 'RUNNING';

      console.log(`📊 Status da instância JITSI: ${status}`);
      if (currentIP) {
        console.log(`🌐 IP externo atual: ${currentIP}`);

        // Atualizar configuração com IP descoberto (SISTEMA LEGADO)
        if (currentIP !== this.config.serverIP) {
          console.log(`🔄 Atualizando IP de ${this.config.serverIP} para ${currentIP}`);
          this.config.serverIP = currentIP;
          this.config.serverDomain = currentIP;

          // Atualizar room.json com IP estático configurado
          await this.updateRoomConfigWithIP();
        }
      }

      return {
        status: status,
        isRunning: isRunning,
        ip: isRunning ? currentIP : null,
        domain: isRunning ? currentIP : null,
        previousIP: this.config.serverIP
      };

    } catch (error) {
      console.error(`❌ Erro ao verificar status da instância:`, error.message);
      // Retornar como desligada em caso de erro
      return {
        status: 'UNKNOWN',
        isRunning: false,
        ip: null,
        domain: null,
        error: error.message
      };
    }
  }

  /**
   * Atualiza room.json com IP estático configurado
   */
  async updateRoomConfigWithIP() {
    try {
      const roomPath = path.join(__dirname, '../../../api/room.json');
      const roomData = JSON.parse(await fs.readFile(roomPath, 'utf8'));

      // Usar dom�nio configurado (meet.biblos360.net) em vez de IP
      const jitsiDomain = this.config.serverDomain; // meet.biblos360.net

      // Atualizar configuração JITSI com domínio correto
      if (!roomData.config) roomData.config = {};
      roomData.config.jitsi_server_ip = this.config.serverIP;
      roomData.config.jitsi_server_domain = jitsiDomain;
      roomData.config.jitsi_domain = jitsiDomain;
      roomData.config.jitsi_server_updated_at = new Date().toISOString();

      await fs.writeFile(roomPath, JSON.stringify(roomData, null, 2));
      console.log(`✅ room.json atualizado com domínio: ${jitsiDomain}`);

    } catch (error) {
      console.warn(`⚠️ Erro ao atualizar room.json com IP:`, error.message);
    }
  }

  /**
   * Aguarda a instância ficar pronta para receber conexões
   */
  async waitForInstanceReady(maxRetries = 6, delay = 3000) {
    console.log(`⏳ Aguardando instância JITSI ficar operacional...`);

    for (let i = 0; i < maxRetries; i++) {
      try {
        // Primeiro verificar se a instância está rodando via gcloud
        const status = await this.getInstanceStatus();
        if (!status.isRunning) {
          console.log(`⏳ Instância ainda não está RUNNING (${status.status}), aguardando...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // Se está RUNNING, tentar conexão HTTP para verificar se JITSI está respondendo
        const https = require('https');
        const response = await new Promise((resolve, reject) => {
          const req = https.get(`https://${this.config.serverIP}`,
            { rejectUnauthorized: false, timeout: 8000 },
            resolve
          );
          req.on('error', reject);
          req.on('timeout', () => reject(new Error('Timeout')));
        });

        if (response.statusCode === 200 || response.statusCode === 302) {
          console.log(`✅ Instância JITSI operacional após ${(i + 1) * delay / 1000}s`);
          return true;
        }
      } catch (error) {
        console.log(`⏳ Tentativa ${i + 1}/${maxRetries} - aguardando ${delay / 1000}s... (${error.message})`);
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.warn(`⚠️ Instância pode não estar totalmente operacional após ${maxRetries * delay / 1000}s, mas continuando...`);
    return false;
  }

  /**
   * Força a parada de operação em andamento (emergência)
   */
  cancelOperation() {
    this.isOperationInProgress = false;
  }
}

// Instância global do serviço Google Cloud
const googleCloudJitsiService = new GoogleCloudJitsiService();

// ========================================
// SEÇÁO 14: SERVIÇOS DE LIVE STREAMING
// ========================================

/**
 * Obtém configuração de live streaming de uma sala
 */
async function getLiveStreamConfig(roomId) {
  try {
    const roomData = await loadRoomData(roomId, 'room');

    return {
      live_enabled: roomData.live_enabled || false,
      stream_url: roomData.stream_url || '',
      stream_type: roomData.stream_type || 'iframe',
      auto_play: roomData.auto_play || false,
      updated_at: roomData.live_updated_at || null
    };
  } catch (error) {
    console.error('Erro ao carregar configuração de live:', error);
    return {
      live_enabled: false,
      stream_url: '',
      stream_type: 'iframe',
      auto_play: false,
      updated_at: null
    };
  }
}

/**
 * Atualiza configuração de live streaming
 */
async function updateLiveStreamConfig(roomId, config) {
  try {
    const roomPath = path.join(__dirname, '../../../api/room.json');
    const roomData = await loadRoomData(roomId, 'room');

    // Atualizar configurações de live
    roomData.live_enabled = config.live_enabled || false;
    roomData.stream_url = config.stream_url || '';
    roomData.stream_type = config.stream_type || 'iframe';
    roomData.auto_play = config.auto_play || false;
    roomData.live_updated_at = new Date().toISOString();

    // Salvar no arquivo
    const success = await saveJSONData(roomPath, roomData);

    if (success) {
      console.log(`✅ Configuração de live atualizada para sala ${roomId}`);
      return {
        success: true,
        config: {
          live_enabled: roomData.live_enabled,
          stream_url: roomData.stream_url,
          stream_type: roomData.stream_type,
          auto_play: roomData.auto_play,
          updated_at: roomData.live_updated_at
        }
      };
    } else {
      throw new Error('Falha ao salvar configuração');
    }
  } catch (error) {
    console.error('Erro ao atualizar configuração de live:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtém configuração de sessão específica para live
 */
async function getSessionLiveConfig(roomId, sessionNumber) {
  try {
    const sessoesData = await loadRoomData(roomId, 'sessoes');

    // Procurar sessão específica
    const sessionKey = Object.keys(sessoesData.sessions || {}).find(key =>
      key.includes(`session_${sessionNumber}`) ||
      sessoesData.sessions[key].number === sessionNumber
    );

    if (sessionKey && sessoesData.sessions[sessionKey]) {
      const session = sessoesData.sessions[sessionKey];
      return {
        session_id: sessionKey,
        session_number: sessionNumber,
        is_online: session.is_online || false,
        stream_url: session.stream_url || '',
        title: session.title || `Sessão ${sessionNumber}`,
        status: session.status || 'inactive',
        online_since: session.online_since || null
      };
    }

    return {
      session_id: null,
      session_number: sessionNumber,
      is_online: false,
      stream_url: '',
      title: `Sessão ${sessionNumber}`,
      status: 'not_found',
      online_since: null
    };
  } catch (error) {
    console.error('Erro ao carregar configuração de sessão:', error);
    return {
      session_id: null,
      session_number: sessionNumber,
      is_online: false,
      stream_url: '',
      title: `Sessão ${sessionNumber}`,
      status: 'error',
      online_since: null,
      error: error.message
    };
  }
}

/**
 * Atualiza status de uma sessão (online/offline)
 */
async function updateSessionOnlineStatus(roomId, sessionNumber, isOnline, streamUrl = null) {
  try {
    const sessoesPath = path.join(__dirname, '../../../api/sessoes.json');
    const sessoesData = await loadRoomData(roomId, 'sessoes');

    // Procurar ou criar sessão
    let sessionKey = Object.keys(sessoesData.sessions || {}).find(key =>
      key.includes(`session_${sessionNumber}`) ||
      sessoesData.sessions[key].number === sessionNumber
    );

    if (!sessionKey) {
      // Criar nova sessão se não existir
      sessionKey = `${roomId}_session_${sessionNumber}`;
      if (!sessoesData.sessions) sessoesData.sessions = {};
      sessoesData.sessions[sessionKey] = {
        id: sessionKey,
        number: sessionNumber,
        title: `Sessão ${sessionNumber}`,
        room_id: roomId,
        created_at: new Date().toISOString()
      };
    }

    const session = sessoesData.sessions[sessionKey];

    // Atualizar status
    session.is_online = isOnline;
    session.status = isOnline ? 'online' : 'offline';
    session.updated_at = new Date().toISOString();

    if (isOnline) {
      session.online_since = new Date().toISOString();
      if (streamUrl) {
        session.stream_url = streamUrl;
      }
    } else {
      session.online_since = null;
    }

    // Salvar no arquivo
    const success = await saveJSONData(sessoesPath, sessoesData);

    if (success) {
      console.log(`✅ Status da sessão ${sessionNumber} atualizado: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
      return {
        success: true,
        session: {
          session_id: sessionKey,
          session_number: sessionNumber,
          is_online: session.is_online,
          status: session.status,
          stream_url: session.stream_url || '',
          online_since: session.online_since,
          updated_at: session.updated_at
        }
      };
    } else {
      throw new Error('Falha ao salvar status da sessão');
    }
  } catch (error) {
    console.error('Erro ao atualizar status da sessão:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Lista todas as sessões com informações de streaming
 */
async function getAllSessionsWithStreamInfo(roomId) {
  try {
    const sessoesData = await loadRoomData(roomId, 'sessoes');
    const sessions = [];

    if (sessoesData.sessions) {
      Object.keys(sessoesData.sessions).forEach(sessionKey => {
        const session = sessoesData.sessions[sessionKey];
        sessions.push({
          session_id: sessionKey,
          session_number: session.number || 1,
          title: session.title || 'Sessão',
          is_online: session.is_online || false,
          status: session.status || 'inactive',
          stream_url: session.stream_url || '',
          online_since: session.online_since || null,
          created_at: session.created_at || null,
          updated_at: session.updated_at || null
        });
      });
    }

    // Ordenar por número da sessão
    sessions.sort((a, b) => a.session_number - b.session_number);

    return {
      room_id: roomId,
      total_sessions: sessions.length,
      online_sessions: sessions.filter(s => s.is_online).length,
      sessions: sessions
    };
  } catch (error) {
    console.error('Erro ao listar sessões:', error);
    return {
      room_id: roomId,
      total_sessions: 0,
      online_sessions: 0,
      sessions: [],
      error: error.message
    };
  }
}

/**
 * Valida URL de streaming
 */
function validateStreamUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL é obrigatória' };
  }

  const trimmedUrl = url.trim();

  // Verificar se é uma URL válida
  try {
    new URL(trimmedUrl);
  } catch (error) {
    return { valid: false, error: 'URL inválida' };
  }

  // Verificar protocolos permitidos
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return { valid: false, error: 'URL deve começar com http:// ou https://' };
  }

  // Verificar domínios suspeitos (básico)
  const suspiciousDomains = ['localhost', '127.0.0.1', '0.0.0.0'];
  const urlObj = new URL(trimmedUrl);

  if (suspiciousDomains.some(domain => urlObj.hostname.includes(domain))) {
    return { valid: false, error: 'Domínio não permitido para streaming público' };
  }

  return { valid: true, url: trimmedUrl };
}

/**
 * Converte URLs do YouTube para formato embed
 */
function convertYouTubeToEmbed(url) {
  if (!url || typeof url !== 'string') {
    return url;
  }

  const trimmedUrl = url.trim();

  // Padrões de URL do YouTube que precisam ser convertidos
  const patterns = [
    // URL de vídeo normal: https://www.youtube.com/watch?v=ID
    {
      regex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)(?:&.*)?/,
      replacement: 'https://www.youtube.com/embed/$1'
    },
    // URL de live: https://youtube.com/live/ID ou https://www.youtube.com/live/ID
    {
      regex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]+)(?:\?.*)?/,
      replacement: 'https://www.youtube.com/embed/$1'
    },
    // URL curta: https://youtu.be/ID
    {
      regex: /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)(?:\?.*)?/,
      replacement: 'https://www.youtube.com/embed/$1'
    }
  ];

  for (const pattern of patterns) {
    const match = trimmedUrl.match(pattern.regex);
    if (match) {
      const baseEmbedUrl = trimmedUrl.replace(pattern.regex, pattern.replacement);

      // Adicionar parâmetros para controle total do player
      const params = [
        'autoplay=1',           // Reprodução automática
        'controls=0',           // Ocultar controles
        'modestbranding=1',     // Reduzir branding do YouTube
        'rel=0',                // Não mostrar vídeos relacionados
        'showinfo=0',           // Não mostrar informações do vídeo
        'fs=0',                 // Desabilitar fullscreen
        'loop=1',               // Loop infinito
        'disablekb=1',          // Desabilitar controles do teclado
        'iv_load_policy=3',     // Não mostrar anotações
        'mute=0',               // Manter som ativo
        'playsinline=1',        // Reproduzir inline no mobile
        'enablejsapi=1'         // Habilitar API JavaScript para controle
      ].join('&');

      const embedUrl = `${baseEmbedUrl}?${params}`;
      console.log(`🔄 URL do YouTube convertida com controles ocultos: ${trimmedUrl} -> ${embedUrl}`);
      return embedUrl;
    }
  }

  // Se já for uma URL embed ou não for YouTube, retorna como está
  return trimmedUrl;
}

module.exports = {
  // Serviços de posicionamento de vídeo
  getVideoPositions,
  saveVideoPosition,
  deleteVideoPosition,
  deleteSessionPositions,
  getSessionStats,

  // Serviços de dados
  loadUsersData,
  loadRoomData,
  saveJSONData,

  // Cache Quadro de Avisos
  getRoomInfo,
  setRoomInfo,
  clearRoomInfo,

  // Serviços mock
  generateMockParticipants,
  generateMockChatMessages,
  generateMockSessions,

  // Serviços de conexão
  getRealOnlineUsers,

  // Utilitários de arquivo
  getFileIcon,
  formatFileSize,

  // Utilitários de compatibilidade PHP
  generateMD5Hash,
  generateSessionHash,
  isValidMD5Hash,
  createBiblos360Cookie,
  parseBiblos360Cookie,
  parsePhpSerializedCookie,
  phpCookieMiddleware,

  // Novos serviços de estabilidade
  userStabilityService,
  heartbeatService,
  UserStabilityService,
  HeartbeatService,

  // Serviços Google Cloud JITSI
  googleCloudJitsiService,
  GoogleCloudJitsiService,

  // Serviços de Live Streaming
  getLiveStreamConfig,
  updateLiveStreamConfig,
  getSessionLiveConfig,
  updateSessionOnlineStatus,
  getAllSessionsWithStreamInfo,
  validateStreamUrl,
  convertYouTubeToEmbed
};

// ========================================
// SEÇÁO 13: SERVIÇOS DE CONFERÊNCIA JITSI - FASE 1
// ========================================

/**
 * Valida se o usuário tem permissão para acessar um tipo de conferência
 * Baseado no plano JITSI_PLANO-10-SALAS.md
 */
function validateConferenceAccess(confType, userData) {
  console.log(`🔐 [CONFERENCE ACCESS DEBUG] ===== VALIDANDO ACESSO =====`);
  console.log(`🔐 [CONFERENCE ACCESS DEBUG] confType: "${confType}"`);
  console.log(`🔐 [CONFERENCE ACCESS DEBUG] userData:`, JSON.stringify(userData, null, 2));

  if (!userData || !confType) {
    console.log(`🔐 [CONFERENCE ACCESS DEBUG] NEGADO: userData ou confType ausente`);
    return false;
  }

  const { level, equipe, grupo, rede, turma } = userData;
  const userLevel = parseInt(level) || 1;

  console.log(`🔐 [CONFERENCE ACCESS DEBUG] level extraído: "${level}", userLevel parseado: ${userLevel}`);
  console.log(`🔐 [CONFERENCE ACCESS DEBUG] equipe: "${equipe}", grupo: "${grupo}", rede: "${rede}", turma: "${turma}"`);
  console.log(`🔐 [CONFERENCE ACCESS DEBUG] ===============================`);

  switch (confType) {
    case 'professor':
      // Docentes e administradores (level 2+)
      return userLevel >= 2;

    case 'reuniao':
      // Facilitadores e administradores (level 2+)
      console.log(`🔐 [CONFERENCE ACCESS DEBUG] Validando reunião: userLevel=${userLevel} >= 2 = ${userLevel >= 2}`);
      return userLevel >= 2;

    case 'equipe':
      // Apenas equipe Biblos360 com level 2+
      return userLevel >= 2 && equipe === 'Biblos360';

    case 'atendimento':
      // Todos os usuários autenticados (level 1+)
      return userLevel >= 1;

    case 'projeto':
      // Todos os usuários autenticados (level 1+)
      return userLevel >= 1;

    case 'oracao':
      // Usuários com rede definida (level 1+)
      return userLevel >= 1 && rede;

    case 'breakout':
      // Todos os usuários autenticados (level 1+)
      return userLevel >= 1;

    case 'grupo':
      // Usuários com grupo definido (level 1+)
      return userLevel >= 1 && grupo;

    case 'rede':
      // Usuários com rede definida (level 1+)
      return userLevel >= 1 && rede;

    case 'turma':
      // Usuários com turma definida (level 1+)
      return userLevel >= 1 && turma;

    default:
      return false;
  }
}

/**
 * Retorna configurações JITSI personalizadas por tipo de conferência
 * Baseado no plano JITSI_PLANO-10-SALAS.md
 */
function getJitsiConfigByType(confType) {
  const baseConfig = {
    startWithAudioMuted: false,
    startWithVideoMuted: false,
    enableWelcomePage: false,
    enableInsecureRoomNameWarning: false,
    disableDeepLinking: true,
    prejoinPageEnabled: false
  };

  const baseInterfaceConfig = {
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    TOOLBAR_BUTTONS: [
      'microphone', 'camera', 'closedcaptions', 'desktop',
      'fullscreen', 'hangup', 'profile',
      'chat', 'recording', 'livestreaming', 'etherpad',
      'sharedvideo', 'settings', 'raisehand', 'videoquality',
      'filmstrip', 'feedback', 'stats', 'shortcuts'
    ]
  };

  const typeConfigs = {
    professor: {
      config: {
        ...baseConfig,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        moderatorRights: true
      },
      interfaceConfig: {
        ...baseInterfaceConfig,
        DEFAULT_BACKGROUND: '#1f1f1f'
      },
      subject: 'Sala do Professor',
      maxParticipants: 10
    },

    reuniao: {
      config: {
        ...baseConfig,
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        enableWelcomePage: true
      },
      interfaceConfig: baseInterfaceConfig,
      subject: 'Sala de Reunião',
      maxParticipants: 25
    },

    equipe: {
      config: {
        ...baseConfig,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        requireDisplayName: true
      },
      interfaceConfig: baseInterfaceConfig,
      subject: 'Sala da Equipe',
      maxParticipants: 20
    },

    atendimento: {
      config: {
        ...baseConfig,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        enableNoAudioDetection: true
      },
      interfaceConfig: baseInterfaceConfig,
      subject: 'Sala de Atendimento',
      maxParticipants: 8
    },

    projeto: {
      config: {
        ...baseConfig,
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        enableWelcomePage: true
      },
      interfaceConfig: {
        ...baseInterfaceConfig,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'fullscreen',
          'hangup', 'profile', 'chat',
          'recording', 'livestreaming', 'etherpad', 'sharedvideo',
          'settings', 'raisehand', 'videoquality', 'filmstrip'
        ]
      },
      subject: 'Sala de Projetos',
      maxParticipants: 15
    },

    oracao: {
      config: {
        ...baseConfig,
        startWithAudioMuted: false,
        startWithVideoMuted: true,
        enableWelcomePage: true
      },
      interfaceConfig: baseInterfaceConfig,
      subject: 'Sala de Oração',
      maxParticipants: 30
    },

    breakout: {
      config: {
        ...baseConfig,
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false
      },
      interfaceConfig: baseInterfaceConfig,
      subject: 'Grupo Pequeno',
      maxParticipants: 8
    },

    grupo: {
      config: {
        ...baseConfig,
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        enableWelcomePage: true
      },
      interfaceConfig: baseInterfaceConfig,
      subject: 'Sala do Grupo',
      maxParticipants: 15
    },

    rede: {
      config: {
        ...baseConfig,
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        enableWelcomePage: true
      },
      interfaceConfig: baseInterfaceConfig,
      subject: 'Sala da Rede',
      maxParticipants: 35
    },

    turma: {
      config: {
        ...baseConfig,
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        enableWelcomePage: true
      },
      interfaceConfig: baseInterfaceConfig,
      subject: 'Sala da Turma',
      maxParticipants: 25
    }
  };

  return typeConfigs[confType] || {
    config: baseConfig,
    interfaceConfig: baseInterfaceConfig,
    subject: 'Conferência',
    maxParticipants: 20
  };
}

/**
 * Classe para logging avançado de conferências
 * Implementa sistema de monitoramento baseado no plano JITSI_PLANO-10-SALAS.md
 */
class ConferenceLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../../../data/logs');
    this.ensureLogDir();
  }

  async ensureLogDir() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.warn('⚠️ Erro ao criar diretório de logs:', error.message);
    }
  }

  async logConferenceEvent(eventType, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event_type: eventType, // 'join', 'leave', 'create', 'access_denied'
      room_id: data.roomId,
      conference_type: data.confType,
      room_name: data.roomName,
      participant_id: data.participantId,
      participant_name: data.participantName,
      participant_level: data.participantLevel,
      participant_equipe: data.participantEquipe,
      participant_grupo: data.participantGrupo,
      participant_rede: data.participantRede,
      participant_turma: data.participantTurma,
      duration_seconds: data.duration || null,
      user_agent: data.userAgent || null,
      ip_address: data.ipAddress || null,
      access_granted: data.accessGranted || null,
      denial_reason: data.denialReason || null
    };

    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logDir, `conferences-${dateStr}.json`);

      let logs = [];
      try {
        const existingLogs = await fs.readFile(logFile, 'utf8');
        logs = JSON.parse(existingLogs);
      } catch (e) {
        // Arquivo não existe ainda
      }

      logs.push(logEntry);

      // Manter apenas logs dos últimos 30 dias por arquivo
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      logs = logs.filter(log => new Date(log.timestamp) > thirtyDaysAgo);

      await fs.writeFile(logFile, JSON.stringify(logs, null, 2));

      // Log de console para debugging
      console.log(`📊 Conference Log [${eventType}]: ${data.confType} - ${data.participantName} (Room: ${data.roomId})`);

    } catch (error) {
      console.error('❌ Erro ao salvar log de conferência:', error);
    }
  }

  async getConferenceStats(roomId, dateRange) {
    try {
      const stats = {
        totalSessions: 0,
        uniqueParticipants: new Set(),
        conferenceTypes: {},
        peakHours: {},
        averageDuration: 0,
        accessDenials: 0,
        denialReasons: {}
      };

      // Ler logs dos últimos dias
      const endDate = dateRange?.end || new Date();
      const startDate = dateRange?.start || new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const logFile = path.join(this.logDir, `conferences-${dateStr}.json`);

        try {
          const logs = JSON.parse(await fs.readFile(logFile, 'utf8'));

          const filteredLogs = logs.filter(log => {
            const logDate = new Date(log.timestamp);
            return log.room_id === roomId &&
              logDate >= startDate &&
              logDate <= endDate;
          });

          // Processar logs
          filteredLogs.forEach(log => {
            if (log.event_type === 'join') {
              stats.totalSessions++;
              stats.uniqueParticipants.add(log.participant_id);

              // Contabilizar tipos de conferência
              stats.conferenceTypes[log.conference_type] =
                (stats.conferenceTypes[log.conference_type] || 0) + 1;

              // Contabilizar horários de pico
              const hour = new Date(log.timestamp).getHours();
              stats.peakHours[hour] = (stats.peakHours[hour] || 0) + 1;
            }

            if (log.event_type === 'access_denied') {
              stats.accessDenials++;
              if (log.denial_reason) {
                stats.denialReasons[log.denial_reason] =
                  (stats.denialReasons[log.denial_reason] || 0) + 1;
              }
            }
          });

        } catch (e) {
          // Arquivo do dia não existe
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Converter Set para número
      stats.uniqueParticipants = stats.uniqueParticipants.size;

      return stats;

    } catch (error) {
      console.error('❌ Erro ao gerar estatísticas de conferência:', error);
      return null;
    }
  }
}

// ========================================
// SEÇÁO 15: SERVIÇO DE EMAIL
// ========================================

const nodemailer = require('nodemailer');

/**
 * Configuração do transporter de email
 */
let emailTransporter = null;

function createEmailTransporter() {
  try {
    emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'biblos360net@gmail.com',
        pass: process.env.EMAIL_PASS || '' // Será configurado via variável de ambiente
      }
    });

    console.log('📧 Transporter de email configurado com sucesso');
    return emailTransporter;
  } catch (error) {
    console.error('❌ Erro ao configurar transporter de email:', error);
    return null;
  }
}

/**
 * Envia email usando nodemailer
 */
async function enviarEmail(destinatario, assunto, conteudo, html = null) {
  try {
    if (!emailTransporter) {
      emailTransporter = createEmailTransporter();
    }

    if (!emailTransporter) {
      throw new Error('Transporter de email não configurado');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'biblos360net@gmail.com',
      to: destinatario,
      subject: assunto,
      text: conteudo
    };

    if (html) {
      mailOptions.html = html;
    }

    console.log('📧 Enviando email para:', destinatario);
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email enviado com sucesso:', info.messageId);

    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Valida configuração de email
 */
async function verificarConfiguracaoEmail() {
  try {
    if (!emailTransporter) {
      emailTransporter = createEmailTransporter();
    }

    if (!emailTransporter) {
      return { valid: false, error: 'Transporter não configurado' };
    }

    await emailTransporter.verify();
    console.log('✅ Configuração de email validada com sucesso');

    return { valid: true };

  } catch (error) {
    console.error('❌ Erro na validação da configuração de email:', error);
    return { valid: false, error: error.message };
  }
}

// ========================================
// SEÇÁO 17: EXPORTS FASE 1 - SERVIÇOS DE CONFERÊNCIA
// ========================================

// Exportar novos serviços de conferência
module.exports.validateConferenceAccess = validateConferenceAccess;
module.exports.getJitsiConfigByType = getJitsiConfigByType;
module.exports.ConferenceLogger = ConferenceLogger;

// Exportar serviços de email
module.exports.enviarEmail = enviarEmail;
module.exports.verificarConfiguracaoEmail = verificarConfiguracaoEmail;

// Exportar Google Cloud JITSI Service
module.exports.GoogleCloudJitsiService = GoogleCloudJitsiService;
module.exports.googleCloudJitsiService = googleCloudJitsiService;
