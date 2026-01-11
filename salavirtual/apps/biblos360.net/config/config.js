/**
 * CONFIGURAÇÕES UNIFICADAS - BIBLOS360 VIRTUAL ROOM
 * Todas as configurações do sistema centralizadas em um arquivo
 */

// ========================================
// SEÇÃO 1: IMPORTS E DEPENDÊNCIAS
// ========================================

const path = require('path');
const { Server } = require('socket.io');

// ========================================
// SEÇÃO 2: CONFIGURAÇÕES PRINCIPAIS
// ========================================

const config = {
  // Configurações do servidor
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development'
  },

  // Configurações de sessão
  session: {
    secret: process.env.SESSION_SECRET || 'biblos360_cadastro_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 60 * 1000 // 30 minutos
    }
  },

  // Configurações de CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
  },

  // Configurações do Socket.IO
  socket: {
    cors: {
      origin: '*',
      credentials: true
    },
    transports: ['polling', 'websocket'], // Permitir ambos os transportes
    allowEIO3: true,
    pingTimeout: 300000, // 5 minutos para usuários normais
    pingInterval: 25000, // 25 segundos
    connectTimeout: 60000, // 1 minuto para conexão
    upgradeTimeout: 30000, // 30 segundos para upgrade
    allowUpgrades: true, // Permitir upgrades mas com timeout adequado
    compression: false, // Desabilitar compressão para evitar problemas
    maxHttpBufferSize: 1e6,
    serveClient: true,
    rememberUpgrade: false,
    closeOnBeforeunload: false, // Não fechar imediatamente ao navegar
    forceNew: false, // Permitir reutilizar conexões
    reconnectionAttempts: 10, // Mais tentativas de reconexão
    reconnectionDelay: 1000, // 1 segundo entre tentativas
    reconnectionDelayMax: 5000, // Máximo 5 segundos entre tentativas
    timeout: 300000 // 5 minutos para timeouts gerais (usuários normais)
  },

  // Configurações de arquivos
  files: {
    uploadsFolder: process.env.UPLOADS_FOLDER || 'uploads/',
    maxFileSize: process.env.MAX_FILE_SIZE || 50 * 1024 * 1024, // 50MB
    maxFilesPerRoom: process.env.MAX_FILES_PER_ROOM || 100,
    supportedExtensions: [
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
      'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar', 'txt',
      'mp4', 'avi', 'mp3'
    ],
    iconMapping: {
      'pdf': 'page_white_acrobat',
      'doc': 'page_white_word',
      'docx': 'page_white_word',
      'xls': 'page_white_excel',
      'xlsx': 'page_white_excel',
      'ppt': 'page_white_powerpoint',
      'pptx': 'page_white_powerpoint',
      'jpg': 'page_white_picture',
      'jpeg': 'page_white_picture',
      'png': 'page_white_picture',
      'gif': 'page_white_picture',
      'zip': 'page_white_compressed',
      'rar': 'page_white_compressed',
      'txt': 'page_white_text',
      'mp4': 'page_white_film',
      'avi': 'page_white_film',
      'mp3': 'page_white_sound',
      'default': 'page_white'
    },
    iconBasePath: '/img/dropbox/',
    downloadBasePath: '/uploads/'
  },

  // Configurações de cache
  cache: {
    defaultTTL: process.env.CACHE_TTL || 300, // 5 minutos
    maxKeys: process.env.CACHE_MAX_KEYS || 1000,
    checkPeriod: process.env.CACHE_CHECK_PERIOD || 120 // 2 minutos
  },

  // Configurações de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    file: process.env.LOG_FILE || null
  },

  // Configurações de segurança
  security: {
    bcryptRounds: process.env.BCRYPT_ROUNDS || 12,
    jwtSecret: process.env.JWT_SECRET || 'biblos360_jwt_secret_key',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    rateLimitWindow: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutos
    rateLimitMax: process.env.RATE_LIMIT_MAX || 100
  },

  // Configurações do JITSI Meet
  jitsi: {
    domain: process.env.JITSI_DOMAIN || 'meet.biblos360.net',
    appId: process.env.JITSI_APP_ID || null,
    privateKey: process.env.JITSI_PRIVATE_KEY || null,
    // Configurações Google Cloud para controle da instância
    googleCloud: {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'gen-lang-client-0714720383',
      instanceName: process.env.JITSI_INSTANCE_NAME || 'biblos360-jitsi-server',
      zone: process.env.JITSI_INSTANCE_ZONE || 'us-east1-c',
      serverIP: process.env.JITSI_SERVER_IP || '35.196.37.195',
      serverDomain: process.env.JITSI_SERVER_DOMAIN || 'meet.biblos360.net'
    },
    defaultConfig: {
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      enableWelcomePage: false,
      enableInsecureRoomNameWarning: false,
      disableDeepLinking: true,
      prejoinPageEnabled: false,
      enableNoisyMicDetection: true,
      resolution: 720
    },
    interfaceConfig: {
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      SHOW_BRAND_WATERMARK: false,
      BRAND_WATERMARK_LINK: '',
      SHOW_POWERED_BY: false,
      TOOLBAR_BUTTONS: [
        'microphone', 'camera', 'closedcaptions', 'desktop',
        'fullscreen', 'fodeviceselection', 'hangup', 'profile',
        'info', 'chat', 'recording', 'livestreaming',
        'settings', 'raisehand', 'videoquality', 'filmstrip',
        'feedback', 'stats', 'shortcuts'
      ],
      SETTINGS_SECTIONS: [
        'devices', 'language', 'moderator', 'profile', 'calendar'
      ],
      DEFAULT_BACKGROUND: '#474747',
      HIDE_INVITE_MORE_HEADER: true,
      DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
      DISABLE_FOCUS_INDICATOR: false,
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
      DISABLE_PRESENCE_STATUS: false,
      DISABLE_RINGING: false
    },
    permissions: {
      camera: true,
      microphone: true,
      displayCapture: true,
      fullscreen: true
    },
    conferenceTypes: {
      professor: {
        maxParticipants: 100,
        moderatorRequired: false,
        recordingEnabled: true
      },
      reuniao: {
        maxParticipants: 50,
        moderatorRequired: false,
        recordingEnabled: true
      },
      equipe: {
        maxParticipants: 20,
        moderatorRequired: true,
        recordingEnabled: true,
        requireDisplayName: true
      },
      atendimento: {
        maxParticipants: 10,
        moderatorRequired: false,
        recordingEnabled: false
      },
      projeto: {
        maxParticipants: 15,
        moderatorRequired: false,
        recordingEnabled: true
      },
      oracao: {
        maxParticipants: 30,
        moderatorRequired: false,
        recordingEnabled: false
      },
      breakout: {
        maxParticipants: 8,
        moderatorRequired: false,
        recordingEnabled: false,
        dynamicRooms: 5
      },
      grupo: {
        maxParticipants: 15,
        moderatorRequired: false,
        recordingEnabled: true
      },
      rede: {
        maxParticipants: 25,
        moderatorRequired: false,
        recordingEnabled: true
      },
      turma: {
        maxParticipants: 20,
        moderatorRequired: false,
        recordingEnabled: true
      }
    }
  },

  // Configurações de Live Streaming
  liveStreaming: {
    // Configurações gerais
    enabled: true,
    defaultType: 'iframe',
    autoPlay: false,

    // Configurações de validação de URL
    validation: {
      requireHTTPS: false,
      allowedDomains: [], // Array vazio = todos permitidos
      blockedDomains: ['localhost', '127.0.0.1', '0.0.0.0'],
      maxUrlLength: 2048
    },

    // Configurações de sessão
    session: {
      autoOfflineTimeout: 300000, // 5 minutos em ms
      maxConcurrentStreams: 10,
      allowMultipleSessions: true
    },

    // Configurações de interface
    interface: {
      showControls: true,
      showStreamInfo: true,
      defaultWidth: '100%',
      defaultHeight: '400px',
      allowFullscreen: true
    },

    // Configurações de eventos Socket.IO
    socketEvents: {
      streamUrlSet: 'stream-url-set',
      loadLivePlayer: 'load-live-player',
      removeLivePlayer: 'remove-live-player',
      getStreamInfo: 'get-stream-info',
      sessionOnline: 'session-online',
      online: 'online',
      offline: 'offline'
    },

    // Configurações de logs
    logging: {
      enabled: true,
      logStreamChanges: true,
      logSessionStatus: true,
      logValidation: false
    }
  },

  // Configurações de compatibilidade com sistema legado
  legacy: {
    phpCookieCompatibility: true,
    biblos360Endpoints: true,
    mockDataFallback: true,
    videoPositionSystem: true
  },

  // Configurações de endpoints críticos
  endpoints: {
    '/vr/:id/sessoes': {
      enabled: true,
      authLevel: 1,
      cacheTTL: 300,
      fallbackEnabled: true,
      dataSource: 'public/vr/:id/sessoes.json'
    },
    '/vr/:id/dropbox': {
      enabled: true,
      authLevel: 1,
      cacheTTL: 60,
      template: 'dropbox_table'
    },
    '/vr/timestamp': {
      enabled: true,
      authLevel: 0,
      cacheTTL: 30
    },
    '/videos/pos': {
      enabled: true,
      authLevel: 0,
      cacheTTL: 0 // Sem cache para posições de vídeo
    }
  },

  // Configurações de dados
  data: {
    persistence: {
      type: process.env.DATA_PERSISTENCE || 'file', // 'file' ou 'database'
      basePath: process.env.DATA_PATH || path.join(__dirname, '../data'),
      autoBackup: process.env.DATA_AUTO_BACKUP || true,
      backupInterval: process.env.DATA_BACKUP_INTERVAL || 24 * 60 * 60 * 1000 // 24 horas
    }
  }
};

// ========================================
// SEÇÃO 3: FUNÇÕES DE CONFIGURAÇÃO
// ========================================

/**
 * Validação de configurações críticas
 */
function validateConfig() {
  const required = [
    'server.port',
    'session.secret',
    'security.jwtSecret'
  ];

  for (const key of required) {
    const value = key.split('.').reduce((obj, prop) => obj?.[prop], config);
    if (!value) {
      throw new Error(`Configuração obrigatória não encontrada: ${key}`);
    }
  }
}

/**
 * Função para obter configuração específica
 */
function get(path, defaultValue = null) {
  return path.split('.').reduce((obj, prop) => obj?.[prop], config) || defaultValue;
}

/**
 * Função para verificar se endpoint está habilitado
 */
function isEndpointEnabled(endpoint) {
  return get(`endpoints.${endpoint}.enabled`, false);
}

/**
 * Função para obter nível de autenticação necessário
 */
function getAuthLevel(endpoint) {
  return get(`endpoints.${endpoint}.authLevel`, 0);
}

/**
 * Função para obter TTL de cache
 */
function getCacheTTL(endpoint) {
  return get(`endpoints.${endpoint}.cacheTTL`, get('cache.defaultTTL'));
}

// ========================================
// SEÇÃO 4: CONFIGURAÇÃO SOCKET.IO
// ========================================

/**
 * Configura e inicializa o Socket.IO
 * @param {http.Server} server - Servidor HTTP
 * @returns {Server} Instância do Socket.IO configurada
 */
function configureSocket(server) {
  const socketConfig = get('socket');

  const io = new Server(server, socketConfig);

  // Eventos de conexão básicos
  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id} - Transport: ${socket.conn.transport.name}`);

    // Log quando transport é alterado
    socket.conn.on('upgrade', () => {
      console.log(`🚀 Transport atualizado para: ${socket.conn.transport.name} - Socket: ${socket.id}`);
    });

    // Evento de teste básico
    socket.on('test', (data) => {
      console.log('🧪 Evento de teste recebido:', data);
      socket.emit('test_response', { message: 'Socket.IO funcionando!' });
    });

    // Log de desconexão com mais detalhes
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Cliente desconectado: ${socket.id} - Motivo: ${reason}`);
      if (reason === 'transport error') {
        console.log('⚠️  Transport error detectado - possível problema de conectividade');
      }
    });

    // Log de erros
    socket.on('error', (error) => {
      console.error(`❌ Erro no socket ${socket.id}:`, error);
    });

    // Log de reconexão
    socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Cliente reconectado: ${socket.id} - Tentativa: ${attemptNumber}`);
    });
  });

  console.log('✅ Socket.IO configurado e funcionando');
  return io;
}

// ========================================
// SEÇÃO 5: EXPORTS
// ========================================

module.exports = {
  config,
  validateConfig,
  get,
  isEndpointEnabled,
  getAuthLevel,
  getCacheTTL,
  configureSocket
};
