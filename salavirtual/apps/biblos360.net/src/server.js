/**
 * SERVIDOR CONSOLIDADO - BIBLOS360 VIRTUAL ROOM
 * Entry point simplificado com estrutura unificada
 */

const path = require('path');

// Carregar variáveis de ambiente apenas em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
}

// ========================================
// SEÇÁO 1: IMPORTS E DEPENDÊNCIAS
// ========================================

const express = require('express');
const http = require('http');

// Importar configurações consolidadas
const { config, validateConfig, configureSocket } = require('../config/config');

// Importar middlewares consolidados
const {
  corsMiddleware,
  sessionMiddleware,
  cookiesMiddleware,
  loggingMiddleware,
  errorMiddleware,
  sessionDebugMiddleware
} = require('./middleware');

// Importar rotas consolidadas
const routes = require('./routes');

// Importar handlers Socket.IO consolidados
const { configureSocketHandlers, initializeCleanupTimer, bootstrapBots, initializeBotRevalidationTimer, startChatJsonUpdater, loadAdminStatesFromRoom } = require('./handlers');

// Importar serviços
const { heartbeatService } = require('./services');

// ========================================
// SEÇÁO 2: VALIDAÇÁO E CONFIGURAÇÁO INICIAL
// ========================================

// Validar configurações antes de iniciar
try {
  validateConfig();
  console.log('✅ Configurações validadas com sucesso');
} catch (error) {
  console.error('❌ Erro na validação de configurações:', error.message);
  process.exit(1);
}

// ========================================
// SEÇÁO 3: CONFIGURAÇÁO DO EXPRESS
// ========================================

const app = express();

// Middleware global
app.use(loggingMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(cookiesMiddleware);
app.use(sessionDebugMiddleware); // Adiciona debug de sessão

// Arquivos estáticos (antes das rotas para servir assets)
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para injetar sistema de notificação em páginas HTML
app.use((req, res, next) => {
  // Log todas as requisições para debug
  console.log('🔍 [MIDDLEWARE DEBUG] Requisição:', req.path, 'Method:', req.method);
  
  // Interceptar apenas respostas HTML das salas virtuais (todas as rotas /vr/)
  if (req.path.includes('/vr/')) {
    console.log('🔍 [NOTIFICATION] Interceptando rota VR:', req.path);
    
    // Sobrescrever res.send para injetar o script
    const originalSend = res.send;
    res.send = function(html) {
      console.log('📝 [NOTIFICATION] res.send chamado, tipo:', typeof html, 'tamanho:', html?.length);
      if (typeof html === 'string' && html.includes('<body>') && html.includes('</body>')) {
        console.log('📝 [NOTIFICATION] Injetando script no HTML');
        
        const notificationScript = `
<script>
console.log('BIBLOS360 NOTIFICATION SYSTEM LOADED');

// Função para solicitar permissão de notificação
function requestNotificationPermission() {
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(function(permission) {
        console.log('NOTIFICATION PERMISSION:', permission);
        if (permission === 'granted') {
          console.log('✅ Notificações desktop autorizadas');
        } else {
          console.log('❌ Notificações desktop negadas');
        }
      });
    }
  }
}

// Função para exibir notificação desktop
function showDesktopNotification(title, body) {
  console.log('🔔 Tentando exibir notificação:', title, body);
  
  if ('Notification' in window && Notification.permission === 'granted') {
    console.log('✅ SHOWING DESKTOP NOTIFICATION:', title);
    var notification = new Notification('Sala Virtual - ' + title, {
      body: body || 'Nova notificação da sala virtual',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'sala-virtual-notification',
      requireInteraction: false
    });
    
    // Auto-fechar após 5 segundos
    setTimeout(function() {
      notification.close();
    }, 5000);
    
    // Fechar ao clicar
    notification.onclick = function() {
      window.focus();
      notification.close();
    };
  } else {
    console.log('❌ DESKTOP NOTIFICATIONS NOT AVAILABLE - Showing alert fallback');
    // Fallback: mostrar alert se não conseguir usar desktop notification
    alert('NOTIFICAÇÃO: ' + title + (body ? '\\n' + body : ''));
  }
}

// Solicitar permissão ao carregar a página
requestNotificationPermission();

if (typeof SOCKET !== 'undefined' && SOCKET && SOCKET.on) {
  console.log('SOCKET OK - Adding notification listener');
  SOCKET.on('notification', function(msg, body) {
    console.log('NOTIFICATION RECEIVED:', msg);
    showDesktopNotification(msg, body);
  });
} else {
  console.log('SOCKET NOT READY - Will retry');
  setTimeout(function() {
    if (typeof SOCKET !== 'undefined' && SOCKET && SOCKET.on) {
      console.log('SOCKET NOW READY - Adding listener');
      SOCKET.on('notification', function(msg, body) {
        console.log('NOTIFICATION RECEIVED (delayed):', msg);
        showDesktopNotification(msg, body);
      });
    }
  }, 3000);
}
</script>`;
        
        html = html.replace('</body>', notificationScript + '</body>');
      }
      
      originalSend.call(this, html);
    };
  }
  next();
});

// Rotas principais
app.use('/', routes);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorMiddleware);

// ========================================
// SEÇÁO 4: CONFIGURAÇÁO DO SERVIDOR HTTP
// ========================================

const server = http.createServer(app);

// ========================================
// SEÇÁO 5: CONFIGURAÇÁO DO SOCKET.IO
// ========================================

const io = configureSocket(server);

// Configurar handlers de eventos
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);
  
  // Configurar todos os handlers para este socket
  configureSocketHandlers(socket, io);
});

// Tornar io disponível globalmente para outros módulos
app.set('io', io);

// Inicializar timer de limpeza de conexões com acesso ao io
initializeCleanupTimer(io);

// Inicializar serviço de heartbeat com acesso às sessões de usuário
const { getUserSessions } = require('./handlers');
heartbeatService.start(io, getUserSessions);

// Inicializar atualizador periódico do chat.json estático
startChatJsonUpdater();

// ========================================
// SEÇÁO 6: INICIALIZAÇÁO DOS ROBÔS
// ========================================

// Inicializar timer de revalidação dos robôs
initializeBotRevalidationTimer();

// Inicializar robôs existentes (bootstrap)
// Garantir que robôs salvos no participantes.json apareçam como online
setTimeout(async () => {
  try {
    await bootstrapBots();
    console.log('✅ Bootstrap dos robôs concluído');
    
    await loadAdminStatesFromRoom();
    console.log('✅ Estados administrativos carregados do room.json');
    
  } catch (error) {
    console.warn('⚠️ Erro na inicialização:', error.message);
  }
}, 1000); // Delay de 1 segundo para garantir que tudo está inicializado

// ========================================
// SEÇÁO 7: INICIALIZAÇÁO DO SERVIDOR
// ========================================

const port = config.server.port;
const host = config.server.host;

server.listen(port, host, () => {
  console.log('');
  console.log('🚀 ================================');
  console.log('   BIBLOS360 VIRTUAL ROOM');
  console.log('   Arquitetura Simplificada v1.0');
  console.log('🚀 ================================');
  console.log('');
  console.log(`📍 Servidor: http://${host}:${port}`);
  console.log(`🌍 Ambiente: ${config.server.env}`);
  console.log(`🔧 Arquitetura: 7 arquivos consolidados`);
  console.log(`📊 Socket.IO: Ativo (cors: ${config.socket.cors.origin})`);
  console.log(`🔐 Sessão: ${config.session.cookie.maxAge / 1000 / 60} minutos`);
  console.log(`🎯 Status: Sistema funcionional e pronto`);
  console.log('');
  console.log('📝 Endpoints principais:');
  console.log('   GET  /                     - Página inicial');
  console.log('   GET  /health               - Health check');
  console.log('   GET  /vr/:id          - Sala virtual');
  console.log('   GET  /api/status           - Status do sistema');
  console.log('   POST /auth/login           - Login');
  console.log('   GET/POST/DELETE /videos/pos/* - Sistema de posições');
  console.log('');
  console.log('🎮 Socket.IO Events:');
  console.log('   user_connect               - Conectar usuário');
  console.log('   send_message               - Enviar mensagem');
  console.log('   video_sync                 - Sincronizar vídeo');
  console.log('   get_online_users           - Usuários online');
  console.log('');
  console.log('✨ Sistema inicializado com sucesso!');
  console.log('');
});

// ========================================
// SEÇÁO 7: TRATAMENTO DE ERROS E SINAIS
// ========================================

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  // Removido process.exit(1) para manter servidor estável
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  // Removido process.exit(1) para manter servidor estável
});

// Tratamento de sinais do sistema
function gracefulShutdown(signal) {
  console.log(`📴 Recebido ${signal}. Encerrando servidor graciosamente...`);
  
  // Parar heartbeat service primeiro
  heartbeatService.stop();
  
  // Fechar servidor HTTP
  server.close(() => {
    console.log('✅ Servidor encerrado.');
    process.exit(0);
  });
  
  // Force exit after 5 seconds if graceful shutdown fails
  setTimeout(() => {
    console.log('⏰ Timeout de encerramento. Forçando saída...');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ========================================
// SEÇÁO 8: EXPORTS (PARA TESTES)
// ========================================

// Função para obter instância do Socket.IO
function getIO() {
  return io;
}

module.exports = { app, server, io, getIO };
