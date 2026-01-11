/**
 * BIBLOS360 - PEDIDO DE ORAÇÃO
 * Sistema completo de pedido de oração com controles admin e interface de participantes
 * Arquivo centralizado para manter os arquivos legados limpos
 */

(function() {
    'use strict';
    
    // Aguardar carregamento completo do DOM
    $(document).ready(function() {
        console.log('[PEDIDO ORAÇÃO] Sistema inicializado');
        
        // Aguardar socket estar disponível
        let retryCount = 0;
        const maxRetries = 50; // 5 segundos máximo
        
        function initPrayerSystem() {
            if (typeof SOCKET === 'undefined' || !SOCKET) {
                retryCount++;
                if (retryCount < maxRetries) {
                    setTimeout(initPrayerSystem, 100);
                    return;
                }
                console.error('[PEDIDO ORAÇÃO] Socket não disponível após ' + (maxRetries * 100) + 'ms');
                return;
            }
            
            console.log('[PEDIDO ORAÇÃO] Socket encontrado, configurando sistema...');
            setupPrayerHandlers();
        }
        
        function setupPrayerHandlers() {
            // CONTROLES DO ADMIN (virtual_admin.js)
            if ($('#action_prayer').length > 0) {
                console.log('[PEDIDO ORAÇÃO] Controles de admin detectados');
                
                // Event listener para o botão admin
                $('#action_prayer').on("click", function(e) {
                    e.preventDefault();
                    if ($(this).hasClass('active')) {
                        SOCKET.emit('stream-prayer');
                    } else {
                        // Enviar diretamente o link fixo sem prompt
                        SOCKET.emit('stream-prayer', '/oracao/pedido.html | PEDIDO DE ORAÇÃO');
                    }
                    return false;
                });

                // Handler para feedback do admin
                SOCKET.on("prayer", function(data) {
                    if (data) {
                        $('#action_prayer').addClass('active');
                        if (typeof systemMessage === 'function') {
                            systemMessage('PEDIDO DE ORAÇÃO INICIADO');
                        }
                    } else {
                        if ($('#action_prayer').hasClass('active')) {
                            if (typeof systemMessage === 'function') {
                                systemMessage('PEDIDO DE ORAÇÃO FINALIZADO');
                            }
                        }
                        $('#action_prayer').removeClass('active');
                    }
                });
            }
            
            // INTERFACE DOS PARTICIPANTES (virtual_room.js)
            if ($('.prayer').length > 0) {
                console.log('[PEDIDO ORAÇÃO] Interface de participantes detectada');
                
                // Handler para mostrar/esconder botão de pedido de oração
                SOCKET.on("prayer", function(data, update) {
                    if (data) {
                        if (typeof showInteraction === 'function') {
                            showInteraction('prayer', function() {
                                $('.prayer > a').attr('href', '#');
                                $('.prayer > a').html('<i class="fas fa-praying-hands fa-fw"></i> PEDIDO DE ORAÇÃO');
                                $('.prayer > a').off('click').on('click', function(e) {
                                    e.preventDefault();
                                    // Abrir popup com tamanho adequado para mobile
                                    const popupWidth = Math.min(500, window.screen.width * 0.9);
                                    const popupHeight = Math.min(600, window.screen.height * 0.8);
                                    const left = (window.screen.width - popupWidth) / 2;
                                    const top = (window.screen.height - popupHeight) / 2;
                                    
                                    window.open(
                                        '/oracao/pedido.html',
                                        'pedidoOracao',
                                        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`
                                    );
                                });
                                $('.prayer').show();
                            }, update);
                        } else {
                            // Fallback caso showInteraction não esteja disponível
                            $('.prayer > a').attr('href', '#');
                            $('.prayer > a').html('<i class="fas fa-praying-hands fa-fw"></i> PEDIDO DE ORAÇÃO');
                            $('.prayer > a').off('click').on('click', function(e) {
                                e.preventDefault();
                                const popupWidth = Math.min(500, window.screen.width * 0.9);
                                const popupHeight = Math.min(600, window.screen.height * 0.8);
                                const left = (window.screen.width - popupWidth) / 2;
                                const top = (window.screen.height - popupHeight) / 2;
                                
                                window.open(
                                    '/oracao/pedido.html',
                                    'pedidoOracao',
                                    `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`
                                );
                            });
                            $('.prayer').fadeIn(600);
                        }
                    } else {
                        $('.prayer').hide();
                        $('.prayer > a').attr('href', '');
                        $('.prayer > a').off('click');
                        if (typeof clearInteraction === 'function') {
                            clearInteraction('prayer');
                        } else {
                            $('.prayer').fadeOut(600);
                        }
                    }
                });
            }
            
            console.log('[PEDIDO ORAÇÃO] Sistema configurado com sucesso');
        }
        
        // Iniciar sistema
        initPrayerSystem();
    });
})();
