/**
 * MIDDLEWARES UNIFICADOS - BIBLOS360 VIRTUAL ROOM
 * Todos os middlewares do sistema centralizados em um arquivo
 */

// ========================================
// SEÇÃO 1: IMPORTS E DEPENDÊNCIAS
// ========================================

const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const crypto = require('crypto'); // Movido para o topo
const errors = require('./errors');

// ========================================
// SEÇÃO 2: MIDDLEWARE DE CORS
// ========================================

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requisições sem origin (aplicações mobile, Postman, etc.)
    if (!origin) return callback(null, true);

    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
      'https://meet.biblos360.net',
      'https://biblos360.net',
      'https://www.biblos360.net',
      // URLs temporárias do Railway para testes
      'https://salavirtual-production.up.railway.app'
    ];

    // Verificar se a origem está na lista ou usar wildcard do .env
    if (process.env.CORS_ORIGIN === '*' || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🔒 CORS: Origem bloqueada: ${origin}`);
      callback(null, true); // Permitir por enquanto para debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie']
};

const corsMiddleware = cors(corsOptions);

// ========================================
// SEÇÃO 3: MIDDLEWARE DE SESSÃO
// ========================================

const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'biblos360_cadastro_secret_key',
  resave: false,
  saveUninitialized: true, // Volta para true para garantir que a sessão seja criada
  cookie: {
    secure: false, // Temporariamente false mesmo em produção para testar
    httpOnly: false, // Temporariamente false para facilitar debug
    maxAge: 2 * 60 * 60 * 1000, // Aumenta para 2 horas
    sameSite: 'lax' // Adiciona proteção CSRF
  },
  name: 'biblos360.sid'
};

const sessionMiddleware = session(sessionOptions);

// ========================================
// SEÇÃO 4: MIDDLEWARE DE COOKIES E COMPATIBILIDADE PHP
// ========================================

// Regex pré-compiladas para melhor performance
const PHP_STRING_PATTERN = /s:\d+:"([^"]+)";s:\d+:"([^"]*)"/g;
const PHP_NUM_PATTERN = /s:\d+:"([^"]+)";i:(\d+)/g;
const PHP_HASH_PATTERN = /[a-f0-9]{32}$/;

// Cache de cookies parseados (LRU simples)
const COOKIE_CACHE = new Map();
const CACHE_MAX_SIZE = 100;

/**
 * Função utilitária para decodificar cookie PHP serializado
 */
function parseBiblos360Cookie(cookieValue) {
  if (!cookieValue) return null;

  // Verificar cache primeiro
  if (COOKIE_CACHE.has(cookieValue)) {
    return COOKIE_CACHE.get(cookieValue);
  }

  try {
    // Decodifica URL encoding primeiro
    const decoded = decodeURIComponent(cookieValue);

    // Parse PHP serialized data
    const parsed = parsePhpSerialized(decoded);

    // Adicionar ao cache com limite de tamanho
    if (COOKIE_CACHE.size >= CACHE_MAX_SIZE) {
      const firstKey = COOKIE_CACHE.keys().next().value;
      COOKIE_CACHE.delete(firstKey);
    }
    COOKIE_CACHE.set(cookieValue, parsed);

    return parsed;
  } catch (error) {
    console.error('❌ Erro ao parsear cookie Biblos360:', error.message);
    return null;
  }
}

/**
 * Parser básico para dados serializados do PHP
 */
function parsePhpSerialized(data) {
  if (!data || typeof data !== 'string') return null;

  // Remove hash MD5 do final se existir
  const cleanData = data.replace(PHP_HASH_PATTERN, '');

  // Parse simples para formato PHP a:N:{...}
  if (!cleanData.startsWith('a:')) return null;

  const result = {};

  // Resetar lastIndex das regex antes de usar
  PHP_STRING_PATTERN.lastIndex = 0;
  PHP_NUM_PATTERN.lastIndex = 0;

  let match;

  // Processar valores string
  while ((match = PHP_STRING_PATTERN.exec(cleanData)) !== null) {
    result[match[1]] = match[2];
  }

  // Processar valores numéricos
  while ((match = PHP_NUM_PATTERN.exec(cleanData)) !== null) {
    result[match[1]] = parseInt(match[2], 10);
  }

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Cria cookie anônimo para usuários não logados
 */
function createAnonymousCookie(sessionId, ipAddress, userAgent) {
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Formato similar ao cookie legado
  const cookieData = {
    session_id: sessionId,
    ip_address: ipAddress,
    user_agent: userAgent.substring(0, 50), // Limitar user agent
    last_activity: timestamp,
    anonymous: sessionId
  };

  return createBiblos360Cookie(cookieData);
}

/**
 * Cria cookie de participante anônimo para o chat
 */
function createAnonymousParticipantCookie(sessionId, ipAddress, userAgent, nick, uf) {
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Formato expandido para participantes do chat
  const cookieData = {
    session_id: sessionId,
    ip_address: ipAddress,
    user_agent: userAgent.substring(0, 50),
    last_activity: timestamp,
    ev: 'pub', // Sala pub
    acesso: '',
    rel: '',
    turma: '',
    grupo: '',
    rede: '',
    situacao: '',
    hospedagem: '',
    quarto: '',
    equipe: '',
    nick: nick,
    uf: uf,
    anonymous: '1' // Marcador de usuário anônimo
  };

  return createBiblos360Cookie(cookieData);
}

/**
 * Formata nome para primeira letra maiúscula
 */
function formatNickname(nick) {
  if (!nick || typeof nick !== 'string') return '';
  return nick.charAt(0).toUpperCase() + nick.slice(1).toLowerCase();
}

/**
 * Valida UF brasileira
 */
function validateUF(uf) {
  if (!uf || typeof uf !== 'string') return false;
  const validUFs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  return validUFs.includes(uf.toUpperCase());
}

/**
 * Cria cookie no formato PHP serializado
 */
function createBiblos360Cookie(data) {
  const entries = [];

  for (const [key, value] of Object.entries(data)) {
    // Validação de entrada
    if (typeof key !== 'string' || key.length === 0) continue;

    const keyStr = `s:${key.length}:"${key}"`;

    if (typeof value === 'number') {
      entries.push(`${keyStr};i:${value}`);
    } else {
      const valueStr = String(value || '');
      entries.push(`${keyStr};s:${valueStr.length}:"${valueStr}"`);
    }
  }

  const serialized = `a:${entries.length}:{${entries.join(';')};}`;

  // Adicionar hash MD5 como no sistema legado
  const hash = crypto.createHash('md5').update(serialized).digest('hex');

  return serialized + hash;
}

/**
 * Middleware de processamento de cookies com compatibilidade PHP
 */
const cookieParserInstance = cookieParser(); // Instanciar uma vez

function cookiesMiddleware(req, res, next) {
  // Aplica cookie-parser padrão
  cookieParserInstance(req, res, (err) => {
    if (err) return next(err);

    // Processa cookies específicos do Biblos360
    const {
      biblos360_site_usuario: usuarioCookie,
      biblos360_site_inscrito: inscritoCookie,
      biblos360_admin_usuario: adminUsuarioCookie,
      biblos360_admin_inscrito: adminInscritoCookie,
      biblos360_anonymous_user: anonymousCookie
    } = req.cookies || {};

    let isAuthenticated = false;
    let hasInscricao = false;
    let isAnonymous = false;
    let user = null;
    let inscricao = null;

    // Processa cookie de usuário
    if (usuarioCookie) {
      const userData = parseBiblos360Cookie(usuarioCookie);
      if (userData?.id) {
        isAuthenticated = true;
        user = {
          valid: true,
          data: userData,
          isAdmin: false
        };
      }
    } else if (adminUsuarioCookie) {
      const userData = parseBiblos360Cookie(adminUsuarioCookie);
      if (userData?.id) {
        isAuthenticated = true;
        user = {
          valid: true,
          data: userData,
          isAdmin: true
        };
      }
    } else if (anonymousCookie) {
      // Processar usuário anônimo
      const anonymousData = parseBiblos360Cookie(anonymousCookie);
      if (anonymousData?.session_id) {
        isAnonymous = true;

        // Formatação padrão para nome: primeira letra maiúscula, resto minúscula
        const rawNick = anonymousData.nick || 'Visitante';
        const formattedNick = formatNickname(rawNick);

        user = {
          valid: true,
          data: {
            id: 0, // ID especial para anônimos
            nome: formattedNick,
            apelido: formattedNick,
            level: 0,
            email: '',
            uf: anonymousData.uf || '',
            session_id: anonymousData.session_id,
            anonymous: true
          },
          isAdmin: false,
          isAnonymous: true
        };
      }
    }

    // Processa cookie de inscrição
    if (inscritoCookie) {
      const inscricaoData = parseBiblos360Cookie(inscritoCookie);
      if (inscricaoData && (inscricaoData.ev || inscricaoData.session_id || inscricaoData.id)) {
        hasInscricao = true;
        inscricao = {
          valid: true,
          data: inscricaoData,
          isAdmin: false
        };
      }
    } else if (adminInscritoCookie) {
      const inscricaoData = parseBiblos360Cookie(adminInscritoCookie);
      if (inscricaoData && (inscricaoData.ev || inscricaoData.session_id || inscricaoData.id)) {
        hasInscricao = true;
        inscricao = {
          valid: true,
          data: inscricaoData,
          isAdmin: true
        };
      }
    }

    // Adiciona informações de autenticação ao request
    req.biblos360Auth = {
      isAuthenticated,
      hasInscricao,
      isAnonymous,
      user,
      inscricao
    };

    next();
  });
}

// ========================================
// SEÇÃO 5: MIDDLEWARE DE LOGGING
// ========================================

// Tokens customizados para logging
morgan.token('user-id', (req) => {
  return req.biblos360Auth?.user?.data?.id || 'anonymous';
});

morgan.token('room-id', (req) => {
  return req.params?.id || req.query?.room || '-';
});

// Formato customizado que inclui informações do Biblos360
const customFormat = ':method :url :status :res[content-length] - :response-time ms - User: :user-id - Room: :room-id';

// Escolher formato baseado no ambiente
let format;
if (process.env.NODE_ENV === 'development') {
  format = customFormat;
} else {
  format = 'combined';
}

const loggingMiddleware = morgan(format);

// ========================================
// SEÇÃO 6: MIDDLEWARE DE TRATAMENTO DE ERROS
// ========================================

/**
 * Classe para erros customizados da aplicação
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erros pré-definidos comuns
 */
const commonErrors = {
  notFound: (resource = 'Recurso') => new AppError(`${resource} não encontrado`, 404),
  unauthorized: (message = 'Não autorizado') => new AppError(message, 401),
  forbidden: (message = 'Acesso negado') => new AppError(message, 403),
  badRequest: (message = 'Requisição inválida') => new AppError(message, 400),
  conflict: (message = 'Conflito de dados') => new AppError(message, 409),
  validationError: (message = 'Dados inválidos') => new AppError(message, 422),
  tooManyRequests: (message = 'Muitas requisições') => new AppError(message, 429),
  serviceUnavailable: (message = 'Serviço indisponível') => new AppError(message, 503)
};

/**
 * Middleware de tratamento de erros
 */
function errorMiddleware(err, req, res, next) {
  // Usar o error handler centralizado
  return errors.errorHandler(err, req, res, next);
}

/**
 * Middleware para capturar erros assíncronos
 */
function asyncErrorHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ========================================
// SEÇÃO 7: MIDDLEWARES DE AUTENTICAÇÁO
// ========================================

/**
 * Middleware de autenticação básica
 */
function requireAuth(req, res, next) {
  const { isAuthenticated, user } = req.biblos360Auth || {};

  if (!isAuthenticated || !user) {
    return next(commonErrors.unauthorized('Autenticação necessária'));
  }

  req.user = user.data;
  next();
}

/**
 * Middleware de autenticação opcional
 */
function optionalAuth(req, res, next) {
  const { isAuthenticated, user } = req.biblos360Auth || {};

  if (isAuthenticated && user) {
    req.user = user.data;
  }

  next();
}

/**
 * Middleware de verificação de nível de autorização
 */
function requireAuthLevel(requiredLevel) {
  return (req, res, next) => {
    const { isAuthenticated, user } = req.biblos360Auth || {};

    if (!isAuthenticated || !user) {
      return next(commonErrors.unauthorized('Autenticação necessária'));
    }

    const userLevel = user.data.nivel || user.data.level || 0;

    if (userLevel < requiredLevel) {
      return next(commonErrors.forbidden(`Nível de acesso insuficiente. Necessário: ${requiredLevel}, Atual: ${userLevel}`));
    }

    req.user = user.data;
    next();
  };
}

/**
 * Middleware para verificar se usuário está em uma sala específica
 */
function requireRoomAccess(requiredRoomId) {
  return function (req, res, next) {
    const { isAuthenticated, user, inscricao } = req.biblos360Auth || {};
    const roomId = requiredRoomId || req.params.id;

    if (!isAuthenticated || !user) {
      return next(commonErrors.unauthorized('Autenticação necessária para acessar a sala'));
    }

    // Administradores (level >= 2) têm acesso a qualquer sala
    const userLevel = user.data.nivel || user.data.level || 0;
    if (userLevel >= 2) {
      console.log(`👤 Usuário administrador ${user.data.nome || user.data.apelido} (level ${userLevel}) acessando sala ${roomId}`);
      req.user = user.data;
      req.roomId = roomId;
      return next();
    }

    // Se não tem inscrição, mas está autenticado, permitir acesso básico
    if (!inscricao || !inscricao.valid) {
      console.log(`⚠️ Usuário ${user.data.nome || user.data.apelido} sem inscrição específica - permitindo acesso básico à sala ${roomId}`);
      req.user = user.data;
      req.roomId = roomId;
      return next();
    }

    // Verificação da sala para usuários com inscrição específica
    const inscricaoRoomId = inscricao.data.ev || inscricao.data.room_id;

    if (inscricaoRoomId && inscricaoRoomId !== roomId) {
      console.warn(`⚠️ Usuário ${user.data.nome || user.data.apelido} tentando acessar sala ${roomId} mas inscrito na sala ${inscricaoRoomId}`);
      return next(commonErrors.forbidden(`Acesso negado: inscrição válida para sala ${inscricaoRoomId}, não para sala ${roomId}`));
    }

    req.user = user.data;
    req.roomId = roomId;
    next();
  };
}

// ========================================
// SEÇÃO 7.5: MIDDLEWARE DE SEGURANÇA TIM
// ========================================

// Rate limiter storage - usando Map em vez de global
const rateLimitStore = new Map();
const RATE_LIMIT_CLEANUP_INTERVAL = 60000; // Limpar a cada minuto

// Limpeza periódica do rate limiter
setInterval(() => {
  const now = Date.now();
  const windowMs = 60000;

  for (const [key, requests] of rateLimitStore.entries()) {
    const validRequests = requests.filter(timestamp => timestamp > now - windowMs);
    if (validRequests.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, validRequests);
    }
  }
}, RATE_LIMIT_CLEANUP_INTERVAL).unref(); // unref() permite que o processo termine se este for o único timer

/**
 * Middleware de auditoria para ações TIM
 */
function timAuditLogger(req, res, next) {
  const auditData = {
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    method: req.method,
    url: req.url,
    userId: req.user?.id || null,
    userName: req.user?.nome || null,
    body: req.method === 'POST' ? req.body : null,
    params: req.params,
    query: req.query
  };

  console.log('🔒 [TIM AUDIT]', JSON.stringify(auditData, null, 2));

  // Log para arquivo em produção
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implementar log para arquivo usando winston ou similar
  }

  next();
}

/**
 * Middleware de rate limiting específico para TIM
 */
function timRateLimiter(req, res, next) {
  const userId = req.user?.id || 'anonymous';
  const key = `tim_rate_${req.ip}_${userId}`;
  const now = Date.now();
  const windowMs = 60000; // 1 minuto
  const maxRequests = 30; // 30 requests por minuto

  const requests = rateLimitStore.get(key) || [];
  const validRequests = requests.filter(timestamp => timestamp > now - windowMs);

  if (validRequests.length >= maxRequests) {
    return res.status(429).json({
      error: 'Rate limit exceeded for TIM operations',
      message: 'Muitas tentativas. Tente novamente em 1 minuto.',
      retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
    });
  }

  validRequests.push(now);
  rateLimitStore.set(key, validRequests);

  next();
}

/**
 * Middleware de timeout de sessão reduzido para TIM
 */
function timSessionTimeout(req, res, next) {
  const timSessionMaxAge = 5 * 60 * 1000; // 5 minutos

  if (req.session?.timLastActivity) {
    const timeSinceLastActivity = Date.now() - req.session.timLastActivity;

    if (timeSinceLastActivity > timSessionMaxAge) {
      req.session.destroy((err) => {
        if (err) console.error('Erro ao destruir sessão TIM:', err);
      });
      return res.status(401).json({
        error: 'TIM session timeout',
        message: 'Sessão TIM expirada. Faça login novamente.',
        redirectTo: '/admin/login'
      });
    }
  }

  // Atualizar timestamp da última atividade TIM
  if (req.session) {
    req.session.timLastActivity = Date.now();
  }

  next();
}

/**
 * Middleware combinado de segurança para TIM
 */
function timSecurityMiddleware(req, res, next) {
  // Verificar se é HTTPS em produção
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.status(403).json({
      error: 'HTTPS required for TIM',
      message: 'Acesso TIM requer conexão segura (HTTPS)'
    });
  }

  // Headers de segurança específicos para TIM
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  next();
}

/**
 * Stack de middleware completo para TIM
 */
const timSecurityStack = [
  requireAuthLevel(1),           // Moderadores e admins (nível 1+) - Para teste
  timSecurityMiddleware,         // Headers e verificações de segurança
  timSessionTimeout,             // Timeout de sessão reduzido
  timRateLimiter,               // Rate limiting mais rígido
  timAuditLogger                // Log de auditoria
];

// ========================================
// SEÇÃO 8: EXPORTS
// ========================================

// ========================================
// SEÇÃO 9: MIDDLEWARE DE DEBUG (TEMPORÁRIO PARA RAILWAY)
// ========================================

/**
 * Middleware de debug para sessões (temporário para Railway)
 */
const sessionDebugMiddleware = (req, res, next) => {
  if (req.method === 'POST' && req.url.includes('/cadastro/')) {
    console.log(`[SESSION DEBUG] ${req.method} ${req.url}`);
    console.log('[SESSION DEBUG] Session ID:', req.sessionID);
    console.log('[SESSION DEBUG] Session exists:', !!req.session);
    console.log('[SESSION DEBUG] Session data:', JSON.stringify(req.session, null, 2));
    console.log('[SESSION DEBUG] Cookies:', Object.keys(req.cookies || {}));
    console.log('[SESSION DEBUG] cadastro_temp cookie exists:', !!req.cookies.cadastro_temp);
  }
  next();
};

// ========================================
// SEÇÃO FINAL: EXPORTS
// ========================================

module.exports = {
  // Middlewares principais
  corsMiddleware,
  sessionMiddleware,
  cookiesMiddleware,
  loggingMiddleware,
  errorMiddleware,
  sessionDebugMiddleware, // Adiciona o novo middleware

  // Utilitários de erro
  asyncErrorHandler,
  AppError,
  commonErrors,

  // Sistema de erros centralizado
  errors,

  // Handlers de erro específicos
  createBiblos360Error: errors.createBiblos360Error,
  ERROR_TYPES: errors.ERROR_TYPES,
  notFoundHandler: errors.notFoundHandler,
  errorHandler: errors.errorHandler,

  // Middlewares de autenticação
  requireAuth,
  optionalAuth,
  requireAuthLevel,
  requireRoomAccess,

  // Middlewares de segurança TIM
  timSecurityStack,
  timAuditLogger,
  timRateLimiter,
  timSessionTimeout,
  timSecurityMiddleware,

  // Função utilitária
  parseBiblos360Cookie,

  // Funções para usuários anônimos
  createAnonymousCookie,
  createAnonymousParticipantCookie,
  createBiblos360Cookie,
  formatNickname,
  validateUF
};
