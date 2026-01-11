var WATCHER = null;
var WATCHER_ITEM = 0;
var WATCHER_CHECK = null;
var WATCHER_LAST = null;
var WATCHER_EMIT = null;
var WATCHER_RATE = 1.0;
var INTERACTIONS = new Map();
var WELCOME = new Array();
var USER_EVALUATED = false;
var USER_CHECKED = false;
var USER_REVIEWED = false;
var EVALUATION = null;
var EVALUATED = false;
var REVIEW = null;
var REVIEWED = false;
var CONFERENCE = null;
var PROJECT = null;
var POPUP = null;
var CHAT = null;
var FORUM = null;
function checkPopups() {
    var cb = false;
    if (closedPopup(EVALUATION)) {
        EVALUATION = null;
        if (SOCKET && EVALUATED) {
            SOCKET.emit('evaluated', SESSION_ITEM);
            EVALUATED = false;
        }
    }
    if (closedPopup(REVIEW)) {
        REVIEW = null;
        if (SOCKET && REVIEWED) {
            SOCKET.emit('reviewed', SESSION_ITEM);
            REVIEWED = false;
        }
    }
    if (closedPopup(POPUP)) {
        POPUP = null;
        if (SOCKET) {
            SOCKET.emit('popupped', SESSION_ITEM);
        }
    }
    if (closedPopup(CHAT)) {
        CHAT = null;
        $('.chat-toggle-on a.sidebar-expand').click();
    }
    if (closedPopup(FORUM)) {
        FORUM = null;
    }
    if (closedPopup(PROJECT)) {
        PROJECT = null;
        cb = true;
    }
    if (closedPopup(CONFERENCE)) {
        CONFERENCE = null;
        cb = true;
    }
    if (POPUPS <= 0 && cb) {
        closeColorbox();
    }
}
function removePopups() {
    removeConference();
    removeEvaluation();
    removeReview();
    removePopup();
    removeProject();
    removeForum();
    removeChat();
}
function removeForum() {
    if (FORUM != null && !FORUM.closed) {
        FORUM.close();
    }
}
function loadForum(item) {
    if (!item)
        return false;
    var opened = (FORUM != null && !FORUM.closed) ? true : false;
    FORUM = window.open('/vr/' + EV + '/forum/' + item, 'FORUM', 'menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=no,left=20,top=50,width=600,height=700');
    if (!opened) {
        openedPopup(FORUM);
    }
}
function removeConference() {
    if (CONFERENCE != null && !CONFERENCE.closed) {
        CONFERENCE.close();
    }
}
function loadConference() {
    if (EXTRA.conf) {
        var w = window.screen.width;
        var h = window.screen.height;
        var wleft = parseInt(typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft, 10);
        var left = (w - (w * 0.8)) / 2;
        var width = (w * 0.8) - 40;
        var height = (h * 0.9) - 50;
        if (EXTRA.conf == 'projeto') {
            left = 20;
            width = (w * 0.5);
        }
        left += wleft;
        if (CONFERENCE === null || CONFERENCE.closed) {
            CONFERENCE = window.open('/vr/' + EV + '/conferencia/' + EXTRA.conf, 'CONFERENCE', 'menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=no,top=50,left=' + left + ',width=' + width + ',height=' + height);
            openedPopup(CONFERENCE);
        } else {
            CONFERENCE.focus();
        }
    }
}
function resetConference() {
    EXTRA.conf = null;
    EXTRA.breakout = 0;
    if (SOCKET) {
        SOCKET.emit('move', null);
        SOCKET.emit('update-online');
        SOCKET.emit('update-disabled');
        SOCKET.emit('update-conf');
    } else {
        if (ONLINE && $('#liveplayer').data('src')) {
            loadLivePlayer($('#liveplayer').data('src'), $('#liveplayer').data('title'));
        }
    }
}
function openConference(conf) {
    EXTRA.conf = conf;
    removeLivePlayer();
    removeVideoPlayer();
    if (SOCKET) {
        SOCKET.emit('move', EXTRA.conf);
    }
    if (EXTRA.conf == 'projeto' && EXTRA.extid) {
        var href = '/projeto';
        if (EV && EV != 'pub') {
            if (EXTRA.level) {
                href += '/evento/' + EV;
                if (EXTRA.grupo) {
                    href += '?g=' + encodeURIComponent(EXTRA.grupo);
                }
            } else if (EXTRA.extid) {
                href += '/usuario/' + EXTRA.extid;
            }
        }
        $.colorbox({
            html: '<div id="liveconf"><iframe id="liveconf_main" frameborder="0" src="' + ___base_url___ + '/vr/' + EV + '/conferencia/' + EXTRA.conf + '" class="cboxIframe" allow="camera; microphone; display-capture; fullscreen"></iframe><iframe id="liveconf_side" class="cboxIframe" frameborder="0" src="' + href + '" allow="fullscreen"></iframe></div>',
            title: function() {
                return '<div class="chat-timer live-hidden" style="position: absolute; top: 20px; left: 0; font-size: 1.5em; font-weight: bold; color: #FFF; background: #000; padding: 4px 10px; margin: 0"></div>';
            },
            photo: false,
            fixed: false,
            reposition: true,
            initialWidth: '90%',
            initialHeight: '90%',
            maxWidth: '90%',
            maxHeight: '90%',
            width: '90%',
            height: '90%',
            overlayClose: true,
            escKey: true,
            opacity: 0.85,
            scrolling: false,
            closeButton: true,
            onClosed: function() {
                resetConference();
                unloadWatcher(SESSION_ITEM, '#liveconf', updateActivity);
            },
            onComplete: function() {
                loadWatcher(SESSION_ITEM, '#liveconf', updateActivity);
            }
        });
    } else {
        $.colorbox({
            html: '<iframe id="liveconf" frameborder="0" src="' + ___base_url___ + '/vr/' + EV + '/conferencia/' + EXTRA.conf + '" class="cboxIframe" allow="camera; microphone; display-capture; fullscreen"></iframe>',
            title: function() {
                return '<div class="chat-timer live-hidden" style="position: absolute; top: 20px; left: 0; font-size: 1.5em; font-weight: bold; color: #FFF; background: #000; padding: 4px 10px; margin: 0"></div>';
            },
            photo: false,
            fixed: false,
            reposition: true,
            initialWidth: '90%',
            initialHeight: '90%',
            maxWidth: '90%',
            maxHeight: '90%',
            width: '90%',
            height: '90%',
            overlayClose: true,
            escKey: true,
            opacity: 0.85,
            scrolling: false,
            closeButton: true,
            onClosed: function() {
                resetConference();
                unloadWatcher(SESSION_ITEM, '#liveconf', updateActivity);
            },
            onComplete: function() {
                loadWatcher(SESSION_ITEM, '#liveconf', updateActivity);
            }
        });
    }
}
function removeEvaluation() {
    EVALUATED = false;
    if (EVALUATION != null && !EVALUATION.closed) {
        EVALUATION.close();
    }
}
function loadEvaluation(href, cod, un_str) {
    if (EV && EV != 'pub' && (EVALUATION === null || EVALUATION.closed)) {
        EVALUATION = window.open(href + (cod ? '/' + cod : ''), 'EVALUATION', 'menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=no,left=20,top=50,width=400,height=600');
        EVALUATED = false;
        if (SOCKET) {
            SOCKET.emit('evaluating');
        }
        openedPopup(EVALUATION);
    } else {
        EVALUATION.focus();
    }
}
function removeReview() {
    REVIEWED = false;
    if (REVIEW != null && !REVIEW.closed) {
        REVIEW.close();
    }
}
function loadReview(href) {
    if (EV && EV != 'pub' && (REVIEW === null || REVIEW.closed)) {
        REVIEW = window.open(href, 'REVIEW', 'menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=no,left=20,top=50,width=400,height=600');
        REVIEWED = false;
        if (SOCKET) {
            SOCKET.emit('reviewing');
        }
        openedPopup(REVIEW);
    } else {
        REVIEW.focus();
    }
}
function removePopup() {
    if (POPUP != null && !POPUP.closed) {
        POPUP.close();
    }
}
function loadPopup(href, custom) {
    if (EXTRA.extid) {
        href = href.replace('{ID}', EXTRA.extid.toString().replace(/[^0-9]/g, ''));
    }
    POPUP = window.open(href, 'POPUP', 'menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=no,left=20,top=50,width=990,height=700');
    if (!custom && SOCKET) {
        SOCKET.emit('popuping');
    }
    openedPopup(POPUP);
}
function removeChat() {
    if (CHAT != null && !CHAT.closed) {
        CHAT.close();
    }
}
function loadChat() {
    CHAT = window.open('/vr/chat/' + EV, 'CHAT', 'menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=no,left=20,top=50,width=400,height=600');
    openedPopup(CHAT);
}
function removeProject() {
    if (PROJECT != null && !PROJECT.closed) {
        PROJECT.close();
    }
}
function loadProject() {
    if (EXTRA.extid) {
        var w = window.screen.width;
        var h = window.screen.height;
        var wleft = parseInt(typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft, 10);
        var left = 20;
        var width = (w * 0.5) - 40;
        var height = (h * 0.9) - 50;
        left += wleft;
        var href = '/projeto';
        if (EV && EV != 'pub') {
            if (EXTRA.level) {
                href += '/evento/' + EV;
                if (EXTRA.grupo) {
                    href += '?g=' + encodeURIComponent(EXTRA.grupo);
                }
            } else if (EXTRA.extid) {
                href += '/usuario/' + EXTRA.extid;
            }
        }
        if (PROJECT === null || PROJECT.closed) {
            PROJECT = window.open(href, 'PROJECT', 'menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=no,top=50,left=' + left + ',width=' + width + ',height=' + height);
            openedPopup(PROJECT);
        } else {
            PROJECT.focus();
        }
    }
}
function showInteraction(name, callback, update) {
    if (INTERACTIONS.has(name)) {
        clearTimeout(INTERACTIONS.get(name));
        INTERACTIONS.delete(name);
    }
    INTERACTIONS.set(name, setTimeout(function() {
        callback();
        displayInteractions();
    }, (!update ? VIRTUAL_DELAY * 1000 : 0)));
}
function clearInteraction(name) {
    if (INTERACTIONS.has(name)) {
        clearTimeout(INTERACTIONS.get(name));
        INTERACTIONS.delete(name);
    }
    displayInteractions();
}
function displayInteractions() {
    if (INTERACTIONS.size > 0) {
        $('.live-hidden-interactions').show();
    } else {
        $('.live-hidden-interactions').hide();
    }
}
function welcomeFirstTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-info-circle',
        animate: 'bounceIn',
        title: '<div class="mb5"><strong>SEJA BEM-VINDO!</strong></div><div>Veja algumas dicas sobre a <span class="nowrap">Sala Virtual do Biblos360</span></div>' + prox,
        classes: 'welcome-tooltip',
        position: 'bottom',
        size: 'normal',
        scheme: 'dark',
        target: true,
        mixin: '',
        arrow: false
    }).on('protiphide', welcomeTooltips);
}
function welcomeMainChatTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-comments',
        animate: 'bounceIn',
        title: 'Pelo chat você participa das aulas ao vivo' + prox,
        classes: 'welcome-tooltip',
        position: 'bottom-left',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: true
    }).on('protiphide', welcomeTooltips);
}
function welcomeSideChatTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-comments',
        animate: 'bounceIn',
        title: 'Pelo chat você participa das aulas ao vivo' + prox,
        classes: 'welcome-tooltip',
        position: 'left-bottom',
        mixin: '',
        size: 'normal',
        scheme: 'dark'
    }).on('protiphide', welcomeTooltips);
}
function welcomeDownloadTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-download',
        animate: 'bounceIn',
        title: 'Material para download estará disponível neste quadro azul' + prox,
        classes: 'welcome-tooltip',
        position: 'top-left',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: true
    }).on('protiphide', welcomeTooltips);
}
function welcomeProgressTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-check-square',
        animate: 'bounceIn',
        title: 'O seu progresso' + (VIRTUAL_EDUCATIONAL ? ' no curso' : '') + ' está mostrado aqui' + prox,
        classes: 'welcome-tooltip',
        position: 'top-left',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: true
    }).on('protiphide', welcomeTooltips);
}
function welcomeScheduleTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-clock',
        animate: 'bounceIn',
        title: (VIRTUAL_EAD ? 'A programação do curso está agrupada em blocos que podem ser mostrados ou escondidos' : 'Todas as sessões ' + (VIRTUAL_EDUCATIONAL ? 'do curso' : '') + ' estão agrupadas por dia') + prox,
        classes: 'welcome-tooltip',
        position: 'top-left',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: true
    }).on('protiphide', welcomeTooltips);
}
function welcomeScheduleSingleTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-clock',
        animate: 'bounceIn',
        title: 'A programação ' + (VIRTUAL_EDUCATIONAL ? 'do curso' : '') + ' está listada aqui' + prox,
        classes: 'welcome-tooltip',
        position: 'top-left',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: true
    }).on('protiphide', welcomeTooltips);
}
function welcomePinnedTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-thumbtack',
        animate: 'bounceIn',
        title: 'Alguns itens importantes estão fixados aqui no topo' + prox,
        classes: 'welcome-tooltip',
        position: 'top-left',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: true
    }).on('protiphide', welcomeTooltips);
}
function welcomeDurationTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-clock',
        animate: 'bounceIn',
        title: (VIRTUAL_EAD ? 'Os dias e horários das sessões ao vivo são mostrados aqui' : 'O horário de cada sessão está mostrado aqui') + prox,
        classes: 'welcome-tooltip',
        position: 'top-left',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: true
    }).on('protiphide', welcomeTooltips);
}
function welcomeFilesTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-folder-open',
        animate: 'bounceIn',
        title: 'As pastas tem arquivos disponíveis para download' + prox,
        classes: 'welcome-tooltip',
        position: 'top-left',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: true
    }).on('protiphide', welcomeTooltips);
}
function welcomeItemFilesTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-paperclip',
        animate: 'bounceIn',
        title: 'Alguns itens podem ter anexos específicos' + prox,
        classes: 'welcome-tooltip',
        position: 'top-left',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: true
    }).on('protiphide', welcomeTooltips);
}
function welcomeForumTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-comment-alt',
        animate: 'bounceIn',
        title: 'Nos fóruns você pode interagir com sua turma' + prox,
        classes: 'welcome-tooltip',
        position: 'top-left',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: true
    }).on('protiphide', welcomeTooltips);
}
function welcomePopupTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-external-link-square-alt',
        animate: 'bounceIn',
        title: 'Outras páginas estão disponíveis para acesso por aqui' + prox,
        classes: 'welcome-tooltip',
        position: 'top-left',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: true
    }).on('protiphide', welcomeTooltips);
}
function welcomeLockedTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-lock',
        animate: 'bounceIn',
        title: 'Alguns vídeos só estão disponíveis em certas datas' + prox,
        classes: 'welcome-tooltip',
        position: 'top-left',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: true
    }).on('protiphide', welcomeTooltips);
}
function welcomeVideoTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-play',
        animate: 'bounceIn',
        title: 'Vídeos estão disponíveis para assistir aqui' + prox,
        classes: 'welcome-tooltip',
        position: 'top-left',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: true
    }).on('protiphide', welcomeTooltips);
}
function welcomeVideoForumTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-play',
        animate: 'bounceIn',
        title: 'Assista aos vídeos e participe do fórum de discussão de cada ' + (VIRTUAL_EDUCATIONAL ? 'aula' : 'sessão') + prox,
        classes: 'welcome-tooltip',
        position: 'top-left',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: true
    }).on('protiphide', welcomeTooltips);
}
function welcomeLiveTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-video',
        animate: 'bounceIn',
        title: 'Quando tivermos transmissões <span class="nowrap">ao vivo</span>, elas acontecerão aqui' + prox,
        classes: 'welcome-tooltip',
        position: 'top',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: true
    }).on('protiphide', welcomeTooltips);
}
function welcomeUsersTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-users',
        animate: 'bounceIn',
        title: 'Você e os outros participantes aparecerão nesta lista' + prox,
        classes: 'welcome-tooltip',
        position: 'right-top',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: 'body'
    }).on('protiphide', welcomeTooltips);
}
function welcomeSupportTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-question-circle',
        animate: 'bounceIn',
        title: 'Qualquer problema técnico, fale com a Equipe Biblos360 ou teste suas configurações' + prox,
        classes: 'welcome-tooltip',
        position: 'top-left',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: true
    }).on('protiphide', welcomeTooltips);
}
function welcomeWhatsAppTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">PRÓXIMA</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-question-circle',
        animate: 'bounceIn',
        title: 'Qualquer dúvida ou problema técnico, fale com a Equipe Biblos360' + prox,
        classes: 'welcome-tooltip',
        position: 'bottom',
        size: 'normal',
        scheme: 'dark',
        mixin: '',
        target: true
    }).on('protiphide', welcomeTooltips);
}
function welcomeLastTooltip(node, container, selector) {
    var prox = '<span class="actions"><a href="#" class="tooltip-close" data-target="' + container + ' ' + selector + '">FECHAR</a></span>';
    $(node).protipShow({
        trigger: 'sticky',
        icon: 'fas fa-lg fa-smile-beam',
        animate: 'bounceIn',
        title: 'Esperamos que você tenha um ótimo ' + (VIRTUAL_EDUCATIONAL ? 'curso!' : 'evento!') + prox,
        classes: 'welcome-tooltip',
        position: 'bottom',
        size: 'normal',
        scheme: 'dark',
        target: true,
        mixin: '',
        arrow: false
    }).on('protiphide', welcomeTooltips);
}
function welcomeTooltips(ItemInstance, ItemClass, curr) {
    curr = curr || (ItemInstance != null ? (ItemInstance.target.id || ItemInstance.target.className).replace(' tooltip', '') : null);
    if (!curr) {
        if (!WELCOME.includes('first')) {
            if (WELCOME.length > 0 || !scrollToSelector('.welcome-tooltip-first', '.main-box', welcomeFirstTooltip, 150, 1, 0)) {
                return false;
            }
        }
    } else if (curr.match(/welcome\-tooltip\-first/i) && !WELCOME.includes('live')) {
        WELCOME.push('first');
        if (!ONLINE) {
            if (!scrollToSelector('.welcome-tooltip-live', '.main-box', welcomeLiveTooltip, 150, 2)) {
                welcomeTooltips(null, null, '.welcome-tooltip-live');
            }
        } else {
            welcomeTooltips(null, null, '.welcome-tooltip-live');
        }
    } else if (curr.match(/welcome\-tooltip\-live/i) && !WELCOME.includes('chat')) {
        WELCOME.push('live');
        $('.welcome-tooltip-live').removeClass('welcome-tooltip-live').removeClass('tooltip');
        if (!ONLINE) {}
        if (!scrollToSelector('.welcome-tooltip-chat:visible', '.main-box', welcomeMainChatTooltip, 220, 3)) {
            if (!scrollToSelector('.welcome-tooltip-chat:visible', '#virtual-sidebar-chat', welcomeSideChatTooltip, 0, 1, 0)) {
                welcomeTooltips(null, null, '.welcome-tooltip-chat');
            }
        }
    } else if (curr.match(/welcome\-tooltip\-chat/i) && !WELCOME.includes('users')) {
        WELCOME.push('chat');
        $('.welcome-tooltip-chat').removeClass('welcome-tooltip-chat').removeClass('tooltip');
        if (!scrollToSelector('.welcome-tooltip-users:visible', '#virtual-sidebar-users', welcomeUsersTooltip, 0, 1, 0)) {
            welcomeTooltips(null, null, '.welcome-tooltip-users');
        }
    } else if (curr.match(/welcome\-tooltip\-users/i) && !WELCOME.includes('progress')) {
        WELCOME.push('users');
        $('.welcome-tooltip-users').removeClass('welcome-tooltip-users').removeClass('tooltip');
        if (!scrollToSelector('.welcome-tooltip-progress:visible', '.main-box', welcomeProgressTooltip, 150, 0)) {
            welcomeTooltips(null, null, '.welcome-tooltip-progress');
        }
    } else if (curr.match(/welcome\-tooltip\-progress/i) && !WELCOME.includes('schedule')) {
        WELCOME.push('progress');
        $('.welcome-tooltip-progress').removeClass('welcome-tooltip-progress').removeClass('tooltip');
        $('.virtual-session-expanded').removeClass('virtual-session-expanded').addClass('virtual-session-collapsed').addClass('virtual-session-expanded-welcome');
        if (!scrollToSelector('.welcome-tooltip-schedule:visible', '.main-box', welcomeScheduleTooltip, 150, 0)) {
            if (!scrollToSelector('.welcome-tooltip-schedule-single:visible', '.main-box', welcomeScheduleSingleTooltip, 150, 0)) {
                welcomeTooltips(null, null, '.welcome-tooltip-schedule');
            }
        }
    } else if (curr.match(/welcome\-tooltip\-schedule/i) && !WELCOME.includes('pinned')) {
        WELCOME.push('schedule');
        $('.welcome-tooltip-schedule').removeClass('welcome-tooltip-schedule').removeClass('tooltip');
        $('.welcome-tooltip-schedule-single').removeClass('welcome-tooltip-schedule-single').removeClass('tooltip');
        $('.virtual-session-expanded-welcome').addClass('virtual-session-expanded').removeClass('virtual-session-collapsed').removeClass('virtual-session-expanded-welcome');
        if (!scrollToSelector('.welcome-tooltip-pinned:visible', '.main-box', welcomePinnedTooltip, 150, 0)) {
            welcomeTooltips(null, null, '.welcome-tooltip-pinned');
        }
    } else if (curr.match(/welcome\-tooltip\-pinned/i) && !WELCOME.includes('duration')) {
        WELCOME.push('pinned');
        $('.welcome-tooltip-pinned').removeClass('welcome-tooltip-pinned').removeClass('tooltip');
        $('.virtual-session-collapsed').removeClass('virtual-session-collapsed').addClass('virtual-session-expanded').addClass('virtual-session-collapsed-welcome');
        if (!scrollToSelector('.welcome-tooltip-duration:visible', '.main-box', welcomeDurationTooltip, 150, 0)) {
            welcomeTooltips(null, null, '.welcome-tooltip-duration');
        }
    } else if (curr.match(/welcome\-tooltip\-duration/i) && !WELCOME.includes('files')) {
        WELCOME.push('duration');
        $('.welcome-tooltip-duration').removeClass('welcome-tooltip-duration').removeClass('tooltip');
        $('.virtual-session-collapsed-welcome').addClass('virtual-session-collapsed').removeClass('virtual-session-expanded').removeClass('virtual-session-collapsed-welcome');
        if (!scrollToSelector('.welcome-tooltip-files:visible', '.main-box', welcomeFilesTooltip, 150, 0)) {
            welcomeTooltips(null, null, '.welcome-tooltip-files');
        }
    } else if (curr.match(/welcome\-tooltip\-files/i) && !WELCOME.includes('item-files')) {
        WELCOME.push('files');
        $('.welcome-tooltip-files').removeClass('welcome-tooltip-files').removeClass('tooltip');
        $('.virtual-session-collapsed').removeClass('virtual-session-collapsed').addClass('virtual-session-expanded').addClass('virtual-session-collapsed-welcome');
        if (!scrollToSelector('.virtual-session-unpinned .welcome-tooltip-item-files:visible', '.main-box', welcomeItemFilesTooltip, 150, 0)) {
            welcomeTooltips(null, null, '.welcome-tooltip-item-files');
        }
    } else if (curr.match(/welcome\-tooltip\-item\-files/i) && !WELCOME.includes('forum')) {
        WELCOME.push('item-files');
        $('.welcome-tooltip-item-files').removeClass('welcome-tooltip-item-files').removeClass('tooltip');
        $('.virtual-session-collapsed-welcome').addClass('virtual-session-collapsed').removeClass('virtual-session-expanded').removeClass('virtual-session-collapsed-welcome');
        if (!scrollToSelector('.welcome-tooltip-video-forum:visible', '.main-box', welcomeVideoForumTooltip, 150, 0)) {
            if (!scrollToSelector('.welcome-tooltip-forum:visible', '.main-box', welcomeForumTooltip, 150, 0)) {
                welcomeTooltips(null, null, '.welcome-tooltip-forum');
            }
        }
    } else if (curr.match(/welcome\-tooltip\-forum/i) && !WELCOME.includes('video')) {
        WELCOME.push('forum');
        $('.welcome-tooltip-forum').removeClass('welcome-tooltip-forum').removeClass('tooltip');
        if (!scrollToSelector('.welcome-tooltip-video:visible', '.main-box', welcomeVideoTooltip, 150, 0)) {
            welcomeTooltips(null, null, '.welcome-tooltip-video');
        }
    } else if (curr.match(/welcome\-tooltip\-video/i) && !WELCOME.includes('locked')) {
        WELCOME.push('video');
        $('.welcome-tooltip-video-forum').removeClass('welcome-tooltip-video-forum').removeClass('tooltip');
        $('.welcome-tooltip-video').removeClass('welcome-tooltip-video').removeClass('tooltip');
        if (!scrollToSelector('.welcome-tooltip-locked:visible', '.main-box', welcomeLockedTooltip, 150, 0)) {
            welcomeTooltips(null, null, '.welcome-tooltip-locked');
        }
    } else if (curr.match(/welcome\-tooltip\-locked/i) && !WELCOME.includes('popup')) {
        WELCOME.push('locked');
        $('.welcome-tooltip-locked').removeClass('welcome-tooltip-locked').removeClass('tooltip');
        if (!scrollToSelector('.welcome-tooltip-popup:visible', '.main-box', welcomePopupTooltip, 150, 0)) {
            welcomeTooltips(null, null, '.welcome-tooltip-popup');
        }
    } else if (curr.match(/welcome\-tooltip\-popup/i) && !WELCOME.includes('support')) {
        WELCOME.push('popup');
        $('.welcome-tooltip-popup').removeClass('welcome-tooltip-popup').removeClass('tooltip');
        if (!scrollToSelector('.welcome-tooltip-support:visible', '.main-box', welcomeSupportTooltip, 200, 0)) {
            if (!scrollToSelector('.welcome-tooltip-whatsapp:visible', '.main-box', welcomeWhatsAppTooltip, 100, 0)) {
                welcomeTooltips(null, null, '.welcome-tooltip-support');
            }
        }
    } else if (curr.match(/welcome\-tooltip\-support/i) || curr.match(/welcome\-tooltip\-whatsapp/i) && !WELCOME.includes('last')) {
        WELCOME.push('support');
        $('.welcome-tooltip-support').removeClass('welcome-tooltip-support').removeClass('tooltip');
        $('.welcome-tooltip-whatsapp').removeClass('welcome-tooltip-whatsapp').removeClass('tooltip');
        if (!scrollToSelector('.welcome-tooltip-last:visible', '.main-box', welcomeLastTooltip, 150, 1, 0)) {
            welcomeTooltips(null, null, '.welcome-tooltip-last');
        }
    } else if (!WELCOME.includes('scroll')) {
        WELCOME.push('last');
        WELCOME.push('scroll');
        $('.welcome-tooltip-last').removeClass('welcome-tooltip-last').removeClass('tooltip');
        scrollToTop('.main-box');
    }
}
function removeVideoPlayer() {
    var node = $('#videoplayer');
    if (node.length > 0) {
        var item = node.prev('.virtual-session-item');
        unloadWatcher(item.data('item'), '#videoiframe', updateActivity);
        item.find('.virtual-session-video a').removeClass('session-playing');
        node.remove();
    }
}
function loadVideoPlayer(item) {
    removeLivePlayer();
    removeVideoPlayer();
    var node = $('#virtual-session-item-' + item);
    if (node.length == 0)
        return;
    var pos = node.find('.video-position');
    if (pos.length == 0)
        return;
    var link = node.find('.virtual-session-video a');
    if (link.length == 0)
        return;
    var href = link.attr('href');
    if (href == '#' || href.length == 0)
        return;
    link.addClass('session-playing');
    var iframe = $('<iframe frameborder="0" src="' + link.attr('href') + '" id="videoiframe" data-position-key="' + (pos.data('position-key') ? pos.data('position-key') : '') + '" data-position-video-id="' + (pos.data('position-video-id') ? pos.data('position-video-id') : '') + '" data-position-playlist-id="' + (pos.data('position-playlist-id') ? pos.data('position-playlist-id') : '') + '" allow="autoplay; fullscreen; encrypted-media" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
    var embed = $('<div class="video-embed"></div>').append(iframe);
    var box = $('<div class="video video-box video-640"></div>').append(embed);
    var div = $('<div id="videoplayer"></div>').append(box);
    div.insertAfter(node);
    scrollToSelector('#virtual-session-item-' + item, '.main-box', function() {
        loadWatcher(node.data('item'), '#videoiframe', updateActivity);
    }, 10);
}
function loadWatcher(item, selector, callback) {
    if ($(selector + ':visible').length == 0) {
        return;
    }
    var category = 'video';
    if (selector == '#liveconf') {
        category = 'conf';
    } else if (selector == '#liveiframe') {
        category = 'live';
    }
    clearInterval(WATCHER_CHECK);
    WATCHER_CHECK = null;
    WATCHER_LAST = null;
    var node = $(selector).first();
    if (node.is('#liveconf')) {
        loadConferenceWatcher(node, item, category, callback);
    } else if (node.is('iframe') && node.attr('src').match(/vimeo/)) {
        $.loadVimeoIframeApi(function() {
            loadVimeoWatcher(node, item, category, callback);
        });
    } else if (node.is('iframe') && node.attr('src').match(/youtu\.?be/)) {
        $.loadYouTubeIframeApi(function() {
            loadYouTubeWatcher(node, item, category, callback);
        });
    } else {}
}
function startActiveWatcher(node, item, category, callback) {
    emitWatcher('start', item, category, callback);
    node.data('watcher-item', item);
    node.data('watcher-category', category);
    WATCHER = node.data('watcher-category');
    WATCHER_ITEM = node.data('watcher-item');
    WATCHER_LAST = Date.now();
    WATCHER_CHECK = setInterval(updateActiveWatcher, 5 * 1000, node, item, category, callback);
}
function updateActiveWatcher(node, item, category, callback) {
    if (!WATCHER_LAST) {
        WATCHER_LAST = Date.now();
    }
    if (Date.now() >= WATCHER_LAST + (60 * 1000)) {
        if (SOCKET && USERID && isActiveWatcher(node, node.data('watcher-item'), node.data('watcher-category'))) {
            SOCKET.emit('active', node.data('watcher-item'), node.data('watcher-category'), callback);
            WATCHER = node.data('watcher-category');
            WATCHER_ITEM = node.data('watcher-item');
        }
        WATCHER_LAST = Date.now();
    }
}
function loadConferenceWatcher(node, item, category, callback) {
    startActiveWatcher(node, item, category, callback);
}
function isActiveWatcher(node, item, category) {
    var active = true;
    if (category == 'live') {
        if (!SESSIONS)
            return false;
        if (!SALAS_ACTIVE && COUNTDOWN)
            return false;
        if (item == 0)
            return true;
        var sess = SESSIONS[item];
        if (!sess)
            return false;
        if (sess['multiday'] > 0)
            return false;
        if (sess['live'] == 0)
            return false;
        var now = Date.now();
        var starts_at = (intval(sess['starts_at_timestamp']) - 60 * 60) * 1000;
        var ends_at = (intval(sess['ends_at_timestamp']) + 30 * 60) * 1000;
        if (now < starts_at || now > ends_at) {
            return false;
        }
    } else if (category == 'video') {} else if (category == 'conf') {
        if (EXTRA.conf == 'breakout' && !EXTRA.breakout) {
            return false;
        }
        if (EXTRA.conf == 'equipe' && !EXTRA.equipe) {
            return false;
        }
        if (EXTRA.conf == 'turma' && !EXTRA.turma) {
            return false;
        }
        if ((EXTRA.conf == 'grupo' || EXTRA.conf == 'projeto' || EXTRA.conf == 'atendimento') && !EXTRA.grupo) {
            return false;
        }
        if ((EXTRA.conf == 'rede' || EXTRA.conf == 'oracao') && !EXTRA.rede) {
            return false;
        }
    } else {
        return false;
    }
    return active;
}
function joinedChat(data) {
    if ((VIRTUAL_CHAT || VIRTUAL_FORUM) && !VIRTUAL_CHAT_ADMIN) {
        $(".chat-message-input").focus();
    }
    if (!VIRTUAL_FORUM) {
        SOCKET.emit('users');
    }
    if (SOCKET && USERID) {
        if (WATCHER) {
            SOCKET.emit('start', WATCHER_ITEM, WATCHER, updateActivity);
        } else if (data.extra.watcher) {
            SOCKET.emit('stop', data.extra.watcher_item, data.extra.watcher, updateActivity);
        }
    }
}
function emitWatcher(action, item, category, callback) {
    if (!SOCKET || !USERID)
        return false;
    if (WATCHER_EMIT && action == WATCHER_EMIT["action"] && item == WATCHER_EMIT["item"] && category == WATCHER_EMIT["category"])
        return (typeof callback == 'function' ? callback(false) : false);
    if (!WATCHER_EMIT || action != WATCHER_EMIT["action"] || WATCHER_EMIT["ts"] < Date.now() - 5 * 1000) {
        SOCKET.emit(action, item, category, callback);
    }
    WATCHER_EMIT = {
        "ts": Date.now(),
        "action": action,
        "item": item,
        "category": category
    };
}
function loadVimeoWatcher(node, item, category, callback) {
    if (typeof Vimeo == 'undefined') {
        startActiveWatcher(node, item, category, callback);
    } else {
        node.data('watcher-item', item);
        node.data('watcher-category', category);
        if (category == 'video') {
            loadVimeoPlayerPositions(node);
        } else {
            VIMEOPLAYER = new Vimeo.Player(node);
        }
        VIMEOPLAYER.ready().then(function() {
            VIMEOPLAYER.getPlaybackRate().then(function(playbackRate) {
                WATCHER_RATE = playbackRate;
            });
        });
        VIMEOPLAYER.on('play', function() {
            emitWatcher('start', node.data('watcher-item'), node.data('watcher-category'), callback);
            WATCHER = node.data('watcher-category');
            WATCHER_ITEM = node.data('watcher-item');
        });
        VIMEOPLAYER.on('pause', function() {
            emitWatcher('stop', node.data('watcher-item'), node.data('watcher-category'), callback);
            WATCHER = null;
            WATCHER_ITEM = 0;
            WATCHER_LAST = null;
        });
        VIMEOPLAYER.on('playbackratechange', function(data) {
            WATCHER_RATE = data.playbackRate;
        });
        WATCHER_LAST = Date.now();
        VIMEOPLAYER.on('timeupdate', function(data) {
            if (!WATCHER_LAST) {
                WATCHER_LAST = Date.now();
            }
            if (Date.now() >= WATCHER_LAST + (60 * 1000)) {
                if (SOCKET && USERID && isActiveWatcher(node, node.data('watcher-item'), node.data('watcher-category'))) {
                    SOCKET.emit('active', node.data('watcher-item'), node.data('watcher-category'), callback, {
                        playbackRate: WATCHER_RATE
                    });
                    WATCHER = node.data('watcher-category');
                    WATCHER_ITEM = node.data('watcher-item');
                }
                WATCHER_LAST = Date.now();
            }
        });
    }
}
function loadYouTubeWatcher(node, item, category, callback) {
    if (typeof YT == 'undefined') {
        startActiveWatcher(node, item, category, callback);
    } else {
        node.data('watcher-item', item);
        node.data('watcher-category', category);
        if (category == 'video') {
            loadYouTubePlayerPositions(node);
        } else {
            YOUTUBEPLAYER = new YT.Player(node.attr('id'));
            YOUTUBEPLAYER.addEventListener('onStateChange', function(event) {
                clearInterval(node.data('youtube_interval'));
                node.data('youtube_interval', null);
                if (event.data == YT.PlayerState.PLAYING) {
                    node.data('youtube_interval', setInterval(function() {
                        if (node.is(':visible')) {
                            var duration = YOUTUBEPLAYER.getDuration();
                            var seconds = YOUTUBEPLAYER.getCurrentTime();
                            var percent = (duration > 0 ? seconds / duration : null);
                            node.trigger('onYouTubeTimeUpdate', {
                                duration: duration,
                                seconds: seconds,
                                percent: percent
                            });
                        } else {
                            clearInterval(node.data('youtube_interval'));
                            node.data('youtube_interval', null);
                        }
                    }, 1000));
                }
            });
        }
        YOUTUBEPLAYER.addEventListener('onReady', function(event) {
            WATCHER_RATE = YOUTUBEPLAYER.getPlaybackRate();
        });
        YOUTUBEPLAYER.addEventListener('onStateChange', function(event) {
            if (event.data == YT.PlayerState.PLAYING) {
                emitWatcher('start', node.data('watcher-item'), node.data('watcher-category'), callback);
                WATCHER = node.data('watcher-category');
                WATCHER_ITEM = node.data('watcher-item');
            } else if (WATCHER) {
                emitWatcher('stop', node.data('watcher-item'), node.data('watcher-category'), callback);
                WATCHER = null;
                WATCHER_ITEM = 0;
                WATCHER_LAST = null;
            }
        });
        YOUTUBEPLAYER.addEventListener('onPlaybackRateChange', function(playbackRate) {
            WATCHER_RATE = playbackRate.data;
        });
        WATCHER_LAST = Date.now();
        node.on('onYouTubeTimeUpdate', function(event, data) {
            if (!WATCHER_LAST) {
                WATCHER_LAST = Date.now();
            }
            if (Date.now() >= WATCHER_LAST + (60 * 1000)) {
                if (SOCKET && USERID && isActiveWatcher(node, node.data('watcher-item'), node.data('watcher-category'))) {
                    SOCKET.emit('active', node.data('watcher-item'), node.data('watcher-category'), callback, {
                        playbackRate: WATCHER_RATE
                    });
                    WATCHER = node.data('watcher-category');
                    WATCHER_ITEM = node.data('watcher-item');
                }
                WATCHER_LAST = Date.now();
            }
        });
    }
}
function unloadLiveWatcher(selector, callback, item) {
    if (typeof item == 'undefined') {
        item = SESSION_ITEM;
    }
    unloadWatcher(item, selector, callback);
}
function loadLiveWatcher(selector, callback, item) {
    if (typeof item == 'undefined') {
        item = SESSION_ITEM;
    }
    loadWatcher(item, selector, callback);
}
function unloadWatcher(item, selector, callback) {
    emitWatcher('stop', item, (selector == '#liveconf' ? 'conf' : (selector == '#liveiframe' ? 'live' : 'video')), callback);
    WATCHER = null;
    WATCHER_ITEM = 0;
    clearInterval(WATCHER_CHECK);
    WATCHER_CHECK = null;
    WATCHER_LAST = null;
}
function calculateItemProgress(progress_duration, completed_duration, progress_checkins, completed_checkins) {
    if (!progress_duration && !progress_checkins)
        return 0;
    if (!completed_duration && !completed_checkins)
        return 0;
    var total_size = 0;
    var total_perc = 0;
    var perc_duration = 0;
    var perc_checkins = 0;
    if (progress_duration > 0) {
        perc_duration = (completed_duration > progress_duration ? progress_duration : completed_duration) / progress_duration;
        total_size += progress_duration;
        total_perc += progress_duration * perc_duration;
    }
    if (progress_checkins > 0) {
        perc_checkins = (completed_checkins > progress_checkins ? progress_checkins : completed_checkins) / progress_checkins;
        total_size += (progress_duration > 0 ? progress_duration : progress_checkins);
        total_perc += (progress_duration > 0 ? progress_duration : progress_checkins) * perc_checkins;
    }
    return (total_size > 0 ? (total_perc / total_size) : 0);
}
function updateProgressItem(item, progress_duration, completed_duration, progress_checkins, completed_checkins) {
    var perc = calculateItemProgress(progress_duration, completed_duration, progress_checkins, completed_checkins);
    if (perc == 0)
        return;
    var node = $(".virtual-session-item-progress[data-item='" + item + "']");
    if (perc >= 1) {
        node.removeClass('progress-ongoing').removeClass('progress-none').addClass('progress-done');
    } else if (perc > 0) {
        node.removeClass('progress-done').removeClass('progress-none').addClass('progress-ongoing');
    } else if (SESSIONS && SESSIONS[item] && intval(SESSIONS[item]['access_starts_on_timestamp'] * 1000) < Date.now()) {
        node.removeClass('progress-ongoing').removeClass('progress-done').addClass('progress-none');
    }
    if (perc > 0) {
        node.find('.progress-bar').width((perc * 100).toString() + '%');
        node.find('.progress-bar-label').text(Math.round(perc * 100).toString() + '%');
    }
}
function activityUpdated(activity) {
    if (activity.item == 0)
        return;
    var node = $(".virtual-session-item-progress[data-item='" + activity.item + "']").first();
    if (node.length == 0)
        return;
    var completed_duration = intval(activity.live_duration + activity.video_duration + activity.conf_duration + activity.extra_duration);
    var completed_checkins = intval(activity.checkins);
    var progress_duration = intval(node.data('progress-duration'));
    var progress_checkins = intval(node.data('progress-checkins'));
    node.data('completed-duration', completed_duration);
    node.data('completed-checkins', completed_checkins);
    updateProgressItem(activity.item, progress_duration, completed_duration, progress_checkins, completed_checkins);
    updateProgressTotal();
}
function updateProgressTotal() {
    var node = $('#virtual-progress');
    if (node.length == 0)
        return;
    var total_size = 0;
    var total_perc = 0;
    node.find('.virtual-session-item-progress').each(function() {
        var progress_duration = intval($(this).data('progress-duration'));
        var progress_checkins = intval($(this).data('progress-checkins'));
        if (!progress_duration && !progress_checkins)
            return;
        var completed_duration = intval($(this).data('completed-duration'));
        var completed_checkins = intval($(this).data('completed-checkins'));
        total_perc += calculateItemProgress(progress_duration, completed_duration, progress_checkins, completed_checkins);
        total_size += 1;
        var item = intval($(this).data('item'));
        if (completed_duration == 0 && completed_checkins == 0 && !$(this).hasClass('progress-none')) {
            if (SESSIONS && SESSIONS[item] && intval(SESSIONS[item]['access_starts_on_timestamp'] * 1000) < Date.now()) {
                $(".virtual-session-item-progress[data-item='" + item + "']").addClass('progress-none');
            }
        }
    });
    var avg_perc = (total_size > 0) ? (total_perc / total_size) : 0;
    if (total_size > 0) {
        $('body').addClass('progress-started');
    }
    if (avg_perc >= 1) {
        $('body').addClass('progress-finished');
    }
    if (avg_perc > 0) {
        $('.progress-total').html(Math.round(avg_perc * 100).toString() + '<span style="font-size: 0.7em">%</span>').show();
    }
}
function scheduleUpdated(item, before_item) {
    if (before_item != item) {
        var node = $('#liveiframe').first();
        node.data('watcher-item', item);
        node.data('watcher-category', 'live');
        loadLiveWatcher('#liveiframe', null, item);
    }
    updateProgressTotal();
    var now = Date.now();
    $('.virtual-session-item').each(function() {
        var sess = SESSIONS[$(this).data('item')];
        if (!sess)
            return;
        if (sess['multiday'] > 0)
            return;
        if (sess['live'] == 0 && sess['conf'] == 0 && sess['talk'] == 0)
            return;
        if (sess['video_url'] && sess['video_url'].length > 0)
            return;
        var starts_at = intval(sess['starts_at_timestamp'] * 1000);
        var ends_at = intval(sess['ends_at_timestamp'] * 1000);
        if (!today(new Date(ends_at)))
            return;
        if (now >= ends_at) {
            $(this).addClass('past').removeClass('current').removeClass('future');
        } else if (now >= starts_at) {
            $(this).addClass('current').removeClass('past').removeClass('future');
        } else if (now < starts_at) {
            $(this).addClass('future').removeClass('past').removeClass('current');
        }
    });
}
function dropboxDataUpdatedRoom(data) {
    if (data) {
        $("#virtual-download").fadeOut(200, function() {
            $(this).html(data);
        }).fadeIn(600);
    }
}
function scheduleDataUpdatedRoom(data) {
    if (data) {
        $("#virtual-schedule").fadeOut(200, function() {
            $(this).html(data);
            updateMarkdown();
            loadDropbox();
            loadCurrentVideoPositions($('#virtual-schedule'));
        }).fadeIn(600);
    }
}
ACTIVITY_CALLBACKS.push(activityUpdated);
SCHEDULE_CALLBACKS.push(scheduleUpdated);
DROPBOX_DATA_CALLBACKS.push(dropboxDataUpdatedRoom);
SCHEDULE_DATA_CALLBACKS.push(scheduleDataUpdatedRoom);
window.addEventListener("beforeunload", function(e) {
    removePopups();
}, false);
$(document).ready(function() {
    loadCurrentVideoPositions();
    loadDropbox();
    $('.users-list').on("click", 'a.users-action', function(e) {
        e.preventDefault();
        return false;
    });
    $('.users-list').on("mouseenter", 'a.users-action', function(e) {
        e.preventDefault();
        return false;
    });
    $('body').on('click', '.virtual-session-forum a', function(e) {
        e.preventDefault();
        var node = $(this).parents('.virtual-session-item');
        loadForum(intval(node.data('item')));
        return false;
    });
    $('#virtual-progress').on('click', '.virtual-session-item-progress', function(e) {
        e.preventDefault();
        var href = $(this).attr('href');
        if ($(href).length == 0)
            return false;
        var wrapper = $(href).parents('.virtual-session-wrapper');
        if (wrapper.hasClass('virtual-session-collapsed')) {
            wrapper.toggleClass('virtual-session-collapsed').toggleClass('virtual-session-expanded');
        }
        scrollToSelector(href, '.main-box', null, 10);
        return false;
    });
    $('body').on('click', '.chat-toggle-on a.sidebar-expand', function(e) {
        e.preventDefault();
        removeChat();
        return false;
    });
    $('body').on('click', '.chat-toggle-off a.chat-hide', function(e) {
        e.preventDefault();
        removeChat();
        return false;
    });
    $('body').on('click', '.chat-toggle-off a.chat-popup', function(e) {
        e.preventDefault();
        loadChat();
        return false;
    });
    $('body').on('click', '.tooltip-close', function(e) {
        e.preventDefault();
        $($(this).data('target')).protipHide();
        return false;
    });
    $('body').on('click', '.evaluation a', function(e) {
        e.preventDefault();
        loadEvaluation($(this).attr('href'), $(this).data('cod'), $(this).data('un_str'));
        return false;
    });
    $('body').on('click', '.review a, .review-progress a', function(e) {
        e.preventDefault();
        loadReview($(this).attr('href'));
        return false;
    });
    $('body').on('click', '.popup a', function(e) {
        e.preventDefault();
        loadPopup($(this).attr('href'));
        return false;
    });
    $('body').on('click', '.custom-popup a, a.custom-popup, .chat-msg a', function(e) {
        e.preventDefault();
        loadPopup($(this).attr('href'), true);
        return false;
    });
    $('body').on('click', '.close_conf', function(e) {
        e.preventDefault();
        closeColorbox();
        return false;
    });
    $('a[data-conf]').on('click', function(e) {
        e.preventDefault();
        openConference($(this).data('conf'));
        return false;
    });
    if ("Notification"in window && Notification.permission && Notification.permission !== "granted" && Notification.permission !== "denied") {
        $('.notifications-toggle').css('display', 'inline-block');
    }
    $('body').on('click', '.notifications-toggle a', function(e) {
        e.preventDefault();
        if (!("Notification"in window)) {
            return false;
        } else if (Notification.permission === "granted") {
            $('.notifications-toggle').hide();
            return notify('Notificações ativadas');
        } else {
            try {
                Notification.requestPermission().then(function(permission) {
                    if (!('permission'in Notification)) {
                        Notification.permission = permission;
                    }
                    if (permission === 'granted') {
                        $('.notifications-toggle').hide();
                        return notify('Notificações ativadas');
                    }
                });
            } catch (e) {
                Notification.requestPermission(function(permission) {
                    if (!('permission'in Notification)) {
                        Notification.permission = permission;
                    }
                    if (permission === 'granted') {
                        $('.notifications-toggle').hide();
                        return notify('Notificações ativadas');
                    }
                });
            }
        }
        return false;
    });
    $('.virtual-session-video a').on('click', function(e) {
        e.preventDefault();
        if ($(this).hasClass('session-playing')) {
            removeVideoPlayer();
            if (SOCKET) {
                SOCKET.emit('update-online');
                SOCKET.emit('update-disabled');
                SOCKET.emit('update-conf');
            }
        } else {
            loadVideoPlayer($(this).parents('.virtual-session-item').data('item'));
        }
        return false;
    });
    $('.virtual-session-image a').on('click', function(e) {
        e.preventDefault();
        $(this).closest('.virtual-session-item').find('.virtual-session-video a').first().click();
        return false;
    });
    $('body').on('click', '.checkin a', function(e) {
        e.preventDefault();
        if (SOCKET) {
            SOCKET.emit('checked', SESSION_ITEM);
        }
        return false;
    });
    if (SOCKET) {
        SOCKET.on("notification", function(msg, body) {
            notify(msg, body);
        });
        SOCKET.on("sound", function() {
            soundAlert();
        });
        SOCKET.on("online", function(data) {
            if (!data || data.length === 0 || intval(data) > 0) {
                FIXED_LIVE_URL = false;
                var num = intval(data);
                if (num > 0) {
                    $.each(SESSIONS, function(item, sess) {
                        if (sess.session == num && sess.live_url && sess.live_url.length > 0) {
                            loadLivePlayer(sess.live_url, sess.title);
                            return false;
                        }
                    });
                    $('.virtual-session-item').each(function() {
                        if ($(this).data('session') < num) {
                            $(this).removeClass('current').removeClass('future').addClass('past');
                        }
                    });
                    $('.virtual-session-group-' + num).removeClass('future').removeClass('past').addClass('current');
                } else {
                    loadLivePlayer($('#liveplayer').data('src'), $('#liveplayer').data('title'));
                }
            } else {
                FIXED_LIVE_URL = data;
                loadLivePlayer(FIXED_LIVE_URL, '');
            }
        });
        SOCKET.on("offline", function() {
            if (FIXED_LIVE_URL) {
                FIXED_LIVE_URL = false;
                $('#liveplayer').data('src', '');
                $('#liveplayer').data('title', '');
            }
        });
        SOCKET.on("welcome", function() {
            if ($('.welcome-tooltip:visible').length == 0 && WELCOME.length == 0) {
                welcomeTooltips();
            }
        });
        SOCKET.on("user-checked", function(uid, eid) {
            if (uid == USERID || (EXTRA.extid && eid && eid == EXTRA.extid)) {
                USER_CHECKED = true;
                $('.checkin').fadeOut(200, function() {
                    $('.checked').fadeIn(200);
                });
            }
        });
        SOCKET.on("user-evaluated", function(uid, eid) {
            if (uid == USERID || (EXTRA.extid && eid && eid == EXTRA.extid)) {
                USER_EVALUATED = true;
                $('.evaluation').fadeOut(200, function() {
                    $('.evaluated').fadeIn(200);
                });
            }
        });
        SOCKET.on("user-reviewed", function(uid, eid) {
            if (uid == USERID || (EXTRA.extid && eid && eid == EXTRA.extid)) {
                USER_REVIEWED = true;
                $('.review').fadeOut(200, function() {
                    $('.reviewed').fadeIn(200);
                });
            }
        });
        SOCKET.on("checkin", function(data, update) {
            if (data) {
                showInteraction('checkin', function() {
                    if (USER_CHECKED) {
                        $('.checkin').fadeOut(200, function() {
                            $('.checked').fadeIn(200);
                        });
                    } else {
                        $('.checked').hide();
                        $('.checkin').show();
                    }
                }, update);
            } else {
                $('.checkin').hide();
                $('.checked').hide();
                clearInteraction('checkin');
                USER_CHECKED = false;
            }
        });
        SOCKET.on("evaluation", function(data, update) {
            if (data) {
                showInteraction('evaluation', function() {
                    if (USER_EVALUATED) {
                        $('.evaluation').fadeOut(200, function() {
                            $('.evaluated').fadeIn(200);
                        });
                    } else {
                        $('.evaluated').hide();
                        $('.evaluation > a').data('cod', data);
                        $('.evaluation').show();
                    }
                }, update);
            } else {
                $('.evaluation').hide();
                $('.evaluated').hide();
                $('.evaluation > a').data('cod', '');
                clearInteraction('evaluation');
                USER_EVALUATED = false;
            }
        });
        SOCKET.on("review", function(data, update) {
            if (data) {
                showInteraction('review', function() {
                    if (USER_REVIEWED) {
                        $('.review').fadeOut(200, function() {
                            $('.reviewed').fadeIn(200);
                        });
                    } else {
                        $('.reviewed').hide();
                        $('.review').show();
                    }
                }, update);
            } else {
                $('.review').hide();
                $('.reviewed').hide();
                clearInteraction('review');
                USER_REVIEWED = false;
            }
        });
        SOCKET.on("popup", function(data, update) {
            if (data) {
                showInteraction('popup', function() {
                    $('.popup > a').attr('href', data.link.replace('{UN_STR}', $('.popup > a').data('un_str')));
                    $('.popup > a').html('<i class="fas fa-external-link-alt fa-fw"></i> ' + (data.title ? data.title : 'ABRIR LINK'));
                    $('.popup').show();
                }, update);
            } else {
                $('.popup').hide();
                $('.popup > a').attr('href', '');
                clearInteraction('popup');
            }
        });
        SOCKET.on("timer-1min", function() {
            soundAlert();
            notify("Falta 1 minuto");
        });
        SOCKET.on("timer-10s", function() {
            if (EXTRA.conf && SALAS_TIMER.includes(EXTRA.conf)) {
                closeConference();
            }
        });
        SOCKET.on("dropbox", function() {
            loadDropbox();
        });
        SOCKET.on("schedule", function() {
            loadSchedule();
        });
        SOCKET.on("connect", function() {
            SOCKET.emit('update-checkin');
            SOCKET.emit('update-evaluation');
            SOCKET.emit('update-review');
            SOCKET.emit('update-popup');
        });
    } else {
        if (!$('body').hasClass('virtual-ead') && $('#liveplayer').data('src')) {
            if (EV_CATEGORY == 'nacionais') {
                showConference({
                    professor: 0,
                    turma: 1,
                    grupo: 0,
                    projeto: 1,
                    atendimento: 0,
                    oracao: 1,
                    rede: 0,
                    equipe: 1,
                    reuniao: 0,
                    breakout: 0
                }, true, true);
            } else {
                showConference({
                    professor: 0,
                    turma: 0,
                    grupo: 1,
                    projeto: 0,
                    atendimento: 0,
                    oracao: 0,
                    rede: 0,
                    equipe: 1,
                    reuniao: 0,
                    breakout: 0
                }, true, true);
            }
        }
    }
});
