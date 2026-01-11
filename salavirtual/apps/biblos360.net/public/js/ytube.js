/**
 * YouTube Player - Sistema de Controle de Volume e Interface Oculta
 * Integração com a sala virtual existente
 */

// Variáveis globais do player
var youtubePlayer;
var isYoutubeMuted = true;
var currentYoutubeVolume = 70;
var currentVideoId = null; // Rastreia o vídeo atual para evitar recarregamentos
var youtubeAPILoaded = false;
var lastPlayerUpdateTime = 0; // Evita atualizações muito frequentes
var playbackForceInterval = null; // Interval para forçar play nos primeiros segundos
var userHasInteracted = false; // Rastreia se o usuário já interagiu com a página

/**
 * Carrega o estado do áudio salvo no localStorage
 */
function loadYouTubeAudioState() {
    try {
        var savedState = localStorage.getItem('youtubeAudioState');
        if (savedState) {
            var state = JSON.parse(savedState);
            isYoutubeMuted = state.muted !== false; // Default para true se não estiver definido
            currentYoutubeVolume = state.volume || 70; // Default para 70 se não estiver definido
        }
    } catch (e) {
        console.warn('Erro ao carregar estado do áudio do YouTube:', e);
    }
}

/**
 * Salva o estado do áudio no localStorage
 */
function saveYouTubeAudioState() {
    try {
        var state = {
            muted: isYoutubeMuted,
            volume: currentYoutubeVolume
        };
        localStorage.setItem('youtubeAudioState', JSON.stringify(state));
    } catch (e) {
        console.warn('Erro ao salvar estado do áudio do YouTube:', e);
    }
}

/**
 * Salva o estado de reprodução do vídeo
 */
function saveYouTubePlaybackState() {
    try {
        if (youtubePlayer && youtubePlayer.getCurrentTime && youtubePlayer.getPlayerState) {
            var state = {
                currentTime: youtubePlayer.getCurrentTime(),
                isPlaying: youtubePlayer.getPlayerState() === 1, // 1 = playing
                videoId: currentVideoId
            };
            localStorage.setItem('youtubePlaybackState', JSON.stringify(state));
        }
    } catch (e) {
        console.warn('Erro ao salvar estado de reprodução:', e);
    }
}

/**
 * Restaura o estado de reprodução do vídeo
 */
function restoreYouTubePlaybackState() {
    try {
        var savedState = localStorage.getItem('youtubePlaybackState');
        console.log('🔄 Tentando restaurar estado:', savedState);
        
        if (savedState && youtubePlayer) {
            var state = JSON.parse(savedState);
            console.log('📊 Estado salvo:', state);
            
            // Sempre força o play primeiro
            console.log('▶️ Forçando play antes de restaurar posição...');
            youtubePlayer.playVideo();
            
            // Se tem posição salva, restaura
            if (state.currentTime > 0) {
                setTimeout(function() {
                    console.log('⏰ Restaurando posição:', state.currentTime);
                    youtubePlayer.seekTo(state.currentTime, true);
                    youtubePlayer.playVideo();
                }, 1000);
            }
            
            // Remove o estado salvo após usar
            localStorage.removeItem('youtubePlaybackState');
        } else {
            // Mesmo sem estado salvo, força play
            console.log('▶️ Sem estado salvo, forçando play simples...');
            if (youtubePlayer) {
                youtubePlayer.playVideo();
                setTimeout(function() { youtubePlayer.playVideo(); }, 500);
            }
        }
    } catch (e) {
        console.warn('Erro ao restaurar estado de reprodução:', e);
        // Em caso de erro, ainda tenta forçar o play
        if (youtubePlayer) {
            setTimeout(function() { 
                console.log('🆘 Fallback: forçando play após erro');
                youtubePlayer.playVideo(); 
            }, 500);
        }
    }
}

/**
 * Carrega a API do YouTube se ainda não foi carregada
 */
function loadYouTubeAPI() {
    if (!youtubeAPILoaded && !window.YT) {
        console.log('📥 Carregando API do YouTube...');
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        youtubeAPILoaded = true;
    } else {
        console.log('📚 API do YouTube já carregada');
    }
}

/**
 * Detecta se uma URL é do YouTube
 */
function isYouTubeURL(url) {
    var isYT = url && (url.includes('youtube.com/watch') || url.includes('youtu.be/') || url.includes('youtube.com/embed/'));
    console.log('🔍 Verificando se é YouTube URL:', url, '→', isYT);
    return isYT;
}

/**
 * Extrai o ID do vídeo de uma URL do YouTube
 */
function extractYouTubeVideoId(url) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Converte URL do YouTube para embed com parâmetros customizados
 */
function convertToYouTubeEmbed(url) {
    var videoId = extractYouTubeVideoId(url);
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&color=white&controls=0&modestbranding=1&playsinline=1&rel=0&enablejsapi=1&playlist=${videoId}&start=0&disablekb=1&fs=0&iv_load_policy=3`;
    }
    return url;
}

/**
 * Cria a estrutura HTML do YouTube player com controles customizados
 */
function createYouTubePlayerStructure(embedUrl) {
    return `
        <div class="yt-wrapper">
            <div class="yt-frame-container">
                <iframe 
                    src="${embedUrl}" 
                    title="YouTube video player" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerpolicy="strict-origin-when-cross-origin" 
                    allowfullscreen>
                </iframe>
            </div>
            <div class="yt-click-area" id="ytClickArea"></div>
        </div>
        
        <div class="control-buttons">
            <button class="control-button" id="volumeButton" title="Volume">
                <i class="fas fa-volume-mute"></i>
                <div class="volume-control" id="volumeControl">
                    <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="0" orient="vertical">
                    <div class="volume-label" id="volumeLabel">0%</div>
                </div>
            </button>
        </div>
    `;
}

/**
 * Emergency fallback - tenta inicializar YouTube por qualquer meio possível
 */
function emergencyYouTubeInit() {
    console.log('🆘 EMERGENCY: Verificando se há necessidade de inicialização...');
    
    // Verifica se há algum elemento que pareça ser do YouTube
    var liveplayer = document.getElementById('liveplayer');
    if (!liveplayer) {
        console.log('❌ Liveplayer não encontrado');
        return;
    }
    
    console.log('✅ Liveplayer encontrado, conteúdo:', liveplayer.innerHTML.substring(0, 200));
    
    // Se já tem a estrutura do YouTube, tenta inicializar
    if (liveplayer.classList.contains('yt-active')) {
        console.log('🎯 Estrutura YouTube já existe, verificando player...');
        if (!youtubePlayer) {
            console.log('🔧 Player não existe, tentando inicializar...');
            initializeYouTubePlayer();
        } else {
            console.log('✅ Player já existe e ativo');
        }
        return;
    }
    
    // Só continua se realmente detectar YouTube no conteúdo
    var htmlContent = liveplayer.innerHTML;
    var hasYouTubeContent = htmlContent.includes('youtube.com') || htmlContent.includes('youtu.be');
    
    if (!hasYouTubeContent) {
        console.log('ℹ️ Nenhum conteúdo YouTube detectado, mantendo estado original');
        return;
    }
    
    // Procura por qualquer URL do YouTube no innerHTML
    var youtubeMatch = htmlContent.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    
    if (youtubeMatch) {
        var videoId = youtubeMatch[1];
        console.log('🎬 YouTube ID encontrado no HTML:', videoId);
        
        // Procura pelo iframe real primeiro
        var existingIframe = liveplayer.querySelector('iframe');
        if (existingIframe && isYouTubeURL(existingIframe.src)) {
            console.log('🎯 Iframe real encontrado, processando...');
            processYouTubeIframe(existingIframe, liveplayer);
        }
    } else {
        console.log('ℹ️ YouTube detectado mas sem ID válido encontrado');
    }
}

// Executa emergency fallback após 10 segundos se nada foi detectado
setTimeout(function() {
    if (!window.YOUTUBE_PLAYER_ACTIVE) {
        emergencyYouTubeInit();
    }
}, 10000);

/**
 * Verifica se há vídeos do YouTube já presentes na página
 */
function checkForExistingYouTubeVideos() {
    console.log('🔍 Verificando vídeos YouTube existentes...');
    
    var liveplayer = document.getElementById('liveplayer');
    if (!liveplayer) {
        console.log('❌ Liveplayer não encontrado');
        return;
    }
    
    // Só continua se não há player ativo e há conteúdo
    if (window.YOUTUBE_PLAYER_ACTIVE) {
        console.log('✅ Player já ativo, ignorando verificação');
        return;
    }
    
    // Busca por iframes do YouTube especificamente no liveplayer
    var iframe = liveplayer.querySelector('iframe');
    if (iframe) {
        console.log('Iframe encontrado no liveplayer:', iframe.src);
        
        if (isYouTubeURL(iframe.src)) {
            console.log('🎬 YouTube encontrado! Processando...');
            processYouTubeIframe(iframe, liveplayer);
            return;
        }
    }
    
    console.log('ℹ️ Nenhum iframe YouTube válido encontrado no liveplayer');
}

/**
 * Processa um iframe do YouTube detectado
 */
function processYouTubeIframe(iframe, liveplayer) {
    var src = iframe.src;
    
    // Extrai o ID do vídeo da URL
    var videoId = extractYouTubeVideoId(src);
    console.log('🎬 YouTube detectado! Video ID:', videoId);
    
    // Verifica se é o mesmo vídeo que já está carregado
    if (currentVideoId === videoId && youtubePlayer && liveplayer.classList.contains('yt-active')) {
        // Mesmo vídeo já carregado, apenas remove o iframe duplicado
        console.log('🔄 Mesmo vídeo já carregado, removendo duplicata');
        iframe.remove();
        return;
    }
    
    // Throttling: evita atualizações muito frequentes (menos de 2 segundos)
    var now = Date.now();
    if (now - lastPlayerUpdateTime < 2000) {
        iframe.remove();
        return;
    }
    lastPlayerUpdateTime = now;
    
    // Atualiza o vídeo atual
    currentVideoId = videoId;
    console.log('📝 Atualizando currentVideoId para:', currentVideoId);
    
    // Remove o iframe original
    iframe.remove();
    console.log('🗑️ Iframe original removido');
    
    // Adiciona classe para remover padding duplo
    liveplayer.classList.add('yt-active');
    console.log('🎯 Classe yt-active adicionada');
    
    // Carrega API do YouTube
    loadYouTubeAPI();
    console.log('📚 API do YouTube carregada');
    
    // Converte para embed customizado
    var embedUrl = convertToYouTubeEmbed(src);
    console.log('🔗 URL do embed:', embedUrl);
    
    // Adiciona estrutura customizada
    liveplayer.innerHTML = createYouTubePlayerStructure(embedUrl);
    console.log('🏗️ Estrutura HTML criada');
    
    // Aplicar correções específicas para mobile após criar a estrutura
    applyMobileYouTubeCorrections(liveplayer);
    
    // Inicializa controles após a API carregar
    if (window.YT && window.YT.Player) {
        console.log('✅ YT API já disponível, inicializando...');
        initializeYouTubePlayer();
    } else {
        console.log('⏳ YT API não disponível, aguardando...');
        window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
    }
}

/**
 * Intercepta o carregamento do liveplayer para URLs do YouTube
 */
function interceptYouTubeLivePlayer() {
    console.log('🔍 Iniciando interceptação do liveplayer...');
    // Monitora mudanças no elemento liveplayer
    var liveplayer = document.getElementById('liveplayer');
    if (!liveplayer) {
        console.warn('❌ Elemento #liveplayer não encontrado!');
        return;
    }
    
    console.log('✅ Elemento #liveplayer encontrado:', liveplayer);
    
    var isUpdatingYouTube = false; // Flag para evitar loops
    
    // Observer para detectar quando um iframe é adicionado
    var observer = new MutationObserver(function(mutations) {
        console.log('👀 MutationObserver detectou mudanças:', mutations.length);
        // Ignora mudanças se estamos atualizando o YouTube
        if (isUpdatingYouTube) {
            console.log('⏸️ Ignorando mudanças (isUpdatingYouTube = true)');
            return;
        }
        
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                console.log('➕ Nó adicionado:', node.nodeName, node);
                if (node.nodeType === 1 && node.tagName === 'IFRAME') {
                    var src = node.src;
                    console.log('🎬 IFRAME detectado com src:', src);
                    if (isYouTubeURL(src)) {
                        isUpdatingYouTube = true;
                        processYouTubeIframe(node, liveplayer);
                        setTimeout(function() {
                            isUpdatingYouTube = false;
                        }, 1000);
                    } else {
                        // Se não for YouTube, remove a classe yt-active se existir
                        liveplayer.classList.remove('yt-active');
                    }
                }
            });
        });
    });
    
    // Inicia observação
    console.log('👁️ Iniciando observação do liveplayer...');
    observer.observe(liveplayer, { childList: true, subtree: true });
    console.log('✅ Observer configurado com sucesso');
    
    // Verifica se já existe um iframe no liveplayer ao inicializar
    var existingIframe = liveplayer.querySelector('iframe');
    if (existingIframe) {
        console.log('🎬 IFRAME já existente detectado:', existingIframe.src);
        if (isYouTubeURL(existingIframe.src)) {
            console.log('🚀 Processando iframe existente...');
            // Processa o iframe existente diretamente
            processYouTubeIframe(existingIframe, liveplayer);
        }
    } else {
        console.log('ℹ️ Nenhum iframe existente encontrado');
    }
}

/**
 * Inicializa o player do YouTube quando a API está pronta
 */
function initializeYouTubePlayer() {
    console.log('Tentando inicializar YouTube Player...');
    var iframe = document.querySelector('#liveplayer .yt-frame-container iframe');
    
    if (!iframe) {
        console.warn('Iframe do YouTube não encontrado!');
        return;
    }
    
    if (iframe.youtubePlayerInitialized) {
        console.log('Player já inicializado, ignorando...');
        return;
    }
    
    console.log('Iframe encontrado, inicializando player...');
    
    // Marca o iframe como inicializado para evitar múltiplas inicializações
    iframe.youtubePlayerInitialized = true;
    
    // Marca que há um player YouTube ativo para outros sistemas
    window.YOUTUBE_PLAYER_ACTIVE = true;
    
    youtubePlayer = new YT.Player(iframe, {
        events: {
            'onReady': onYouTubePlayerReady,
            'onStateChange': onYouTubePlayerStateChange
        }
    });
    
    console.log('YouTube Player criado:', youtubePlayer);
}

/**
 * Função chamada quando o estado do player muda
 */
function onYouTubePlayerStateChange(event) {
    // Estados do YouTube:
    // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    
    if (event.data === 0) { // Video ended
        // Se o vídeo terminou, reinicia (pois temos loop=1 na URL)
        setTimeout(function() {
            if (youtubePlayer && youtubePlayer.playVideo) {
                youtubePlayer.playVideo();
            }
        }, 500);
    } else if (event.data === 2) { // Video paused
        // Se pausou inesperadamente, tenta tocar novamente após um delay
        setTimeout(function() {
            if (youtubePlayer && youtubePlayer.getPlayerState && youtubePlayer.getPlayerState() === 2) {
                console.log('Vídeo pausado detectado, tentando retomar...');
                forceYouTubePlay();
            }
        }, 2000);
    }
    
    // Salva o estado atual
    if (event.data === 1 || event.data === 2) { // playing ou paused
        setTimeout(saveYouTubePlaybackState, 1000);
    }
}

/**
 * Função chamada quando o player está pronto
 */
function onYouTubePlayerReady(event) {
    console.log('🎥 YouTube Player pronto para o vídeo:', currentVideoId);
    console.log('Player object:', youtubePlayer);
    
    // Carrega o estado salvo antes de configurar os controles
    loadYouTubeAudioState();
    
    setupYouTubeControls();
    setupYouTubeVideoClick();
    
    // Estratégia agressiva para garantir autoplay
    if (youtubePlayer) {
        console.log('🚀 Iniciando autoplay...');
        // 1. Força o play imediatamente
        youtubePlayer.mute();
        youtubePlayer.playVideo();
        console.log('▶️ Play #1 executado');
        
        // 2. Tenta novamente após 100ms
        setTimeout(function() {
            youtubePlayer.playVideo();
            console.log('▶️ Play #2 executado');
        }, 100);
        
        // 3. E mais uma vez após 500ms
        setTimeout(function() {
            youtubePlayer.playVideo();
            console.log('▶️ Play #3 executado');
        }, 500);
    } else {
        console.error('❌ youtubePlayer não está disponível!');
    }
    
    // Depois restaura o estado do áudio 
    setTimeout(function() {
        if (!isYoutubeMuted && youtubePlayer) {
            youtubePlayer.unMute();
            youtubePlayer.setVolume(currentYoutubeVolume);
            // Garante que continue tocando após unmute
            setTimeout(function() {
                youtubePlayer.playVideo();
            }, 100);
            updateYouTubeVolumeIcon();
            updateYouTubeVolumeSlider();
        } else {
            // Aplica o volume mesmo se estiver mudo (para quando o usuário ativar)
            if (youtubePlayer && youtubePlayer.setVolume) {
                youtubePlayer.setVolume(currentYoutubeVolume);
            }
            updateYouTubeVolumeIcon();
            updateYouTubeVolumeSlider();
        }
    }, 800);
    
    // Restaura o estado de reprodução após um delay maior
    setTimeout(function() {
        restoreYouTubePlaybackState();
    }, 2000);
    
    // Inicia o sistema de heartbeat para garantir que o vídeo continue tocando
    setTimeout(function() {
        startPlaybackHeartbeat();
    }, 3000);
}

/**
 * Configura os controles customizados do YouTube
 */
function setupYouTubeControls() {
    var volumeButton = document.getElementById('volumeButton');
    var volumeControl = document.getElementById('volumeControl');
    var volumeSlider = document.getElementById('volumeSlider');
    var volumeLabel = document.getElementById('volumeLabel');
    
    if (!volumeButton || !volumeControl || !volumeSlider || !volumeLabel) {
        return;
    }
    
    // Controle de volume
    volumeButton.addEventListener('click', function(e) {
        e.stopPropagation();
        volumeControl.classList.toggle('show');
    });
    
    volumeSlider.addEventListener('input', function() {
        var volume = parseInt(this.value);
        currentYoutubeVolume = volume;
        
        if (youtubePlayer && youtubePlayer.setVolume) {
            youtubePlayer.setVolume(volume);
            
            if (volume === 0) {
                youtubePlayer.mute();
                isYoutubeMuted = true;
                updateYouTubeVolumeIcon();
            } else {
                if (isYoutubeMuted) {
                    youtubePlayer.unMute();
                    isYoutubeMuted = false;
                }
                updateYouTubeVolumeIcon();
            }
        }
        
        // Salva o estado sempre que o volume é alterado
        saveYouTubeAudioState();
        
        volumeLabel.textContent = volume + '%';
    });
    
    // Fecha menu ao clicar fora
    document.addEventListener('click', function() {
        volumeControl.classList.remove('show');
    });
}

/**
 * Inicia o sistema de heartbeat para forçar play nos primeiros segundos
 */
function startPlaybackHeartbeat() {
    // Limpa qualquer interval anterior
    if (playbackForceInterval) {
        clearInterval(playbackForceInterval);
    }
    
    var attempts = 0;
    var maxAttempts = 15; // 15 tentativas = 30 segundos (a cada 2 segundos)
    
    playbackForceInterval = setInterval(function() {
        attempts++;
        
        if (youtubePlayer && youtubePlayer.playVideo && youtubePlayer.getPlayerState) {
            try {
                var state = youtubePlayer.getPlayerState();
                // Se não está tocando (state !== 1), força o play
                if (state !== 1) {
                    console.log(`Heartbeat ${attempts}: forçando play (estado atual: ${state})`);
                    youtubePlayer.playVideo();
                }
            } catch (e) {
                console.warn('Erro no heartbeat:', e);
                // Mesmo com erro, tenta forçar o play
                try {
                    youtubePlayer.playVideo();
                } catch (e2) {
                    console.warn('Erro ao forçar play no heartbeat:', e2);
                }
            }
        }
        
        // Para o heartbeat após 30 segundos ou máximo de tentativas
        if (attempts >= maxAttempts) {
            clearInterval(playbackForceInterval);
            playbackForceInterval = null;
            console.log('Heartbeat finalizado após', attempts, 'tentativas');
        }
    }, 2000); // A cada 2 segundos
}

/**
 * Força o vídeo a tocar (útil para contornar restrições de autoplay)
 */
function forceYouTubePlay() {
    if (youtubePlayer && youtubePlayer.playVideo) {
        try {
            youtubePlayer.playVideo();
            console.log('Forçando YouTube a tocar (interação:', userHasInteracted, ')');
            
            // Se o usuário já interagiu, tenta múltiplas vezes para garantir
            if (userHasInteracted) {
                setTimeout(function() {
                    youtubePlayer.playVideo();
                }, 200);
                setTimeout(function() {
                    youtubePlayer.playVideo();
                }, 600);
            }
        } catch (e) {
            console.warn('Erro ao forçar play do YouTube:', e);
        }
    }
}

/**
 * Configura o clique no vídeo para ativar áudio
 */
function setupYouTubeVideoClick() {
    var clickArea = document.getElementById('ytClickArea');
    
    if (clickArea) {
        // Remove qualquer listener anterior
        clickArea.removeEventListener('click', handleVideoClick);
        
        // Adiciona o novo listener
        clickArea.addEventListener('click', handleVideoClick);
    }
}

/**
 * Função para tratar o clique no vídeo
 */
function handleVideoClick() {
    // Sempre força o play quando o usuário clica
    forceYouTubePlay();
    
    if (isYoutubeMuted && youtubePlayer && youtubePlayer.unMute) {
        youtubePlayer.unMute();
        youtubePlayer.setVolume(currentYoutubeVolume);
        isYoutubeMuted = false;
        updateYouTubeVolumeIcon();
        updateYouTubeVolumeSlider();
        
        // Salva o estado quando o usuário ativa o áudio
        saveYouTubeAudioState();
    }
}

/**
 * Atualiza o ícone do volume
 */
function updateYouTubeVolumeIcon() {
    var icon = document.querySelector('#volumeButton i');
    var button = document.getElementById('volumeButton');
    
    if (icon && button) {
        if (isYoutubeMuted || currentYoutubeVolume === 0) {
            icon.className = 'fas fa-volume-mute';
            button.classList.add('muted');
        } else if (currentYoutubeVolume < 50) {
            icon.className = 'fas fa-volume-down';
            button.classList.remove('muted');
        } else {
            icon.className = 'fas fa-volume-up';
            button.classList.remove('muted');
        }
    }
}

/**
 * Atualiza o slider de volume
 */
function updateYouTubeVolumeSlider() {
    var volumeSlider = document.getElementById('volumeSlider');
    var volumeLabel = document.getElementById('volumeLabel');
    
    if (volumeSlider && volumeLabel) {
        volumeSlider.value = currentYoutubeVolume;
        volumeLabel.textContent = currentYoutubeVolume + '%';
    }
}

/**
 * Função global chamada pela API do YouTube quando está pronta
 */
function onYouTubeIframeAPIReady() {
    console.log('YouTube API carregada e pronta');
    initializeYouTubePlayer();
}

/**
 * Função global chamada pela API do YouTube quando está pronta
 */
function onYouTubeIframeAPIReady() {
    console.log('🎯 YouTube API carregada e pronta!');
    initializeYouTubePlayer();
}

// Garante que a função global esteja disponível
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM carregado, inicializando ytube.js...');
    loadYouTubeAudioState();
    interceptYouTubeLivePlayer();
});

// Também inicializa se o DOM já estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 DOM loading, inicializando ytube.js...');
        loadYouTubeAudioState();
        interceptYouTubeLivePlayer();
    });
} else {
    console.log('🚀 DOM já pronto, inicializando ytube.js...');
    loadYouTubeAudioState();
    interceptYouTubeLivePlayer();
}

// Salva o estado antes da página descarregar
window.addEventListener('beforeunload', function() {
    if (window.YOUTUBE_PLAYER_ACTIVE && youtubePlayer) {
        saveYouTubePlaybackState();
        saveYouTubeAudioState();
    }
});

// Força o play quando a página ganha foco (usuário volta para a aba)
window.addEventListener('focus', function() {
    if (window.YOUTUBE_PLAYER_ACTIVE && youtubePlayer) {
        setTimeout(function() {
            forceYouTubePlay();
        }, 500);
    }
});

// Também tenta quando a página fica visível novamente
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && window.YOUTUBE_PLAYER_ACTIVE && youtubePlayer) {
        setTimeout(function() {
            forceYouTubePlay();
        }, 1000);
    }
});

// Detecta primeira interação do usuário para permitir autoplay mais agressivo
['click', 'touchstart', 'keydown', 'mousemove'].forEach(function(event) {
    document.addEventListener(event, function() {
        if (!userHasInteracted) {
            userHasInteracted = true;
            console.log('Primeira interação detectada, autoplay disponível');
            // Se já há um player ativo, tenta forçar o play
            if (window.YOUTUBE_PLAYER_ACTIVE && youtubePlayer) {
                setTimeout(function() {
                    forceYouTubePlay();
                }, 100);
            }
        }
    }, { once: true });
});

// Verificação periódica para detectar novos vídeos do YouTube (menos agressiva)
var youtubeCheckInterval = setInterval(function() {
    if (!window.YOUTUBE_PLAYER_ACTIVE) {
        var liveplayer = document.getElementById('liveplayer');
        if (liveplayer && liveplayer.innerHTML && liveplayer.innerHTML.includes('youtube')) {
            console.log('🔍 YouTube detectado durante verificação periódica');
            checkForExistingYouTubeVideos();
        }
    } else {
        // Se já tem player ativo, para a verificação
        clearInterval(youtubeCheckInterval);
        console.log('✅ Player ativo detectado, parando verificação periódica');
    }
}, 5000); // Verifica a cada 5 segundos (menos frequente)

// Para a verificação após 30 segundos para não ficar rodando para sempre
setTimeout(function() {
    if (youtubeCheckInterval) {
        clearInterval(youtubeCheckInterval);
        console.log('🛑 Parando verificação periódica de YouTube');
    }
}, 30000);

// Também salva periodicamente o estado (a cada 10 segundos)
setInterval(function() {
    if (window.YOUTUBE_PLAYER_ACTIVE && youtubePlayer) {
        saveYouTubePlaybackState();
    }
}, 10000);

// Sistema de verificação para garantir que o vídeo continue tocando
var autoplayCheckInterval = setInterval(function() {
    if (window.YOUTUBE_PLAYER_ACTIVE && youtubePlayer && youtubePlayer.getPlayerState) {
        try {
            var state = youtubePlayer.getPlayerState();
            // Se o vídeo está pausado, tenta reativar
            if (state === 2) { // paused
                console.log('Detectado vídeo pausado, tentando retomar...');
                forceYouTubePlay();
            } else if (state === 0) { // ended
                console.log('Vídeo terminou, reiniciando...');
                youtubePlayer.playVideo();
            } else if (state === -1 || state === 5) { // unstarted or cued
                console.log('Vídeo não iniciado, forçando play...');
                youtubePlayer.playVideo();
            }
        } catch (e) {
            console.warn('Erro ao verificar estado do player:', e);
        }
    }
}, 5000); // Verifica a cada 5 segundos (mais frequente)

/**
 * Aplicar correções específicas para mobile YouTube
 */
function applyMobileYouTubeCorrections(liveplayer) {
    var isMobile = window.innerWidth <= 767 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) return;
    
    console.log('🎥 YOUTUBE: Aplicando correções específicas para mobile');
    
    var ytWrapper = liveplayer.querySelector('.yt-wrapper');
    if (ytWrapper) {
        // Calcular altura baseada na orientação
        if (window.innerHeight > window.innerWidth) {
            // Portrait: altura baseada na largura da tela
            var calculatedHeight = Math.floor(window.innerWidth * 9 / 16);
            var finalHeight = Math.max(calculatedHeight, 300); // Mínimo 300px
            finalHeight = Math.min(finalHeight, 400); // Máximo 400px
            
            ytWrapper.style.height = finalHeight + 'px';
            ytWrapper.style.minHeight = finalHeight + 'px';
            ytWrapper.style.paddingBottom = '0';
            
            console.log('🎥 YOUTUBE PORTRAIT: Altura definida para', finalHeight + 'px');
        } else {
            // Landscape: aproveitar altura da tela
            var landscapeHeight = window.innerHeight - 120;
            ytWrapper.style.height = landscapeHeight + 'px';
            ytWrapper.style.minHeight = landscapeHeight + 'px';
            ytWrapper.style.paddingBottom = '0';
            
            console.log('🎥 YOUTUBE LANDSCAPE: Altura definida para', landscapeHeight + 'px');
        }
        
        // Garantir posicionamento do container
        ytWrapper.style.position = 'relative';
        ytWrapper.style.width = '100%';
        ytWrapper.style.overflow = 'hidden';
    }
    
    // Listener para mudanças de orientação específico para YouTube
    function handleYouTubeOrientationChange() {
        setTimeout(function() {
            applyMobileYouTubeCorrections(liveplayer);
        }, 300);
    }
    
    // Remove listeners anteriores para evitar duplicação
    window.removeEventListener('orientationchange', handleYouTubeOrientationChange);
    window.removeEventListener('resize', handleYouTubeOrientationChange);
    
    // Adiciona novos listeners
    window.addEventListener('orientationchange', handleYouTubeOrientationChange);
    window.addEventListener('resize', handleYouTubeOrientationChange);
}
