// ARQUIVO BLOQUEADO PARA EDIÇÃO

$.alertable.defaults.cancelButton = '<button class="alertable-cancel" type="button">Cancelar</button>';
$.alertable.defaults.html = true;
var CONFERENCE = null;
var PROJECT = null;
var FORUM = null;
var POPUP = null;
var DROPBOX = new Map();

function checkPopups() {
    if (closedPopup(PROJECT)) {
        PROJECT = null;
    }
    if (closedPopup(FORUM)) {
        FORUM = null;
    }
    if (closedPopup(POPUP)) {
        POPUP = null;
    }
    if (closedPopup(CONFERENCE)) {
        CONFERENCE = null;
        EXTRA.conf = null;
        EXTRA.breakout = 0;
        if (SOCKET) {
            SOCKET.emit('move', null);
        }
    }
}

function removePopups() {
    if (CONFERENCE != null && !CONFERENCE.closed) {
        CONFERENCE.close();
    }
    if (PROJECT != null && !PROJECT.closed) {
        PROJECT.close();
    }
    if (FORUM != null && !FORUM.closed) {
        FORUM.close();
    }
    if (POPUP != null && !POPUP.closed) {
        POPUP.close();
    }
}

function closeConference(conf) {
    if (!conf || conf == EXTRA.conf) {
        soundAlert();
        notify("Fechando em 10 segundos...");
        setTimeout(removeConference, 10000);
    }
}

function removeConference() {
    if (CONFERENCE != null && !CONFERENCE.closed) {
        CONFERENCE.close();
    }
}

function soundAlert() {}

function loadStream() {
    if (EV) {
        $('.chat-overlay-container').fadeIn(300);
        $('#action_stream').addClass('active');
        $.ajaxSetup({
            cache: false
        });
        $.get("/vr/" + EV + "/stream", function(data) {
            if (data) {
                $(".chat-overlay").html(data);
                if (FIXED_LIVE_URL) {
                    $("#liveiframe").attr('src', FIXED_LIVE_URL);
                }
                scrollMessages(true);
            }
        }, 'html');
    }
}

function closeOverlayAdmin() {
    $('#action_download').removeClass('active');
    $('#action_schedule').removeClass('active');
    $('#action_stream').removeClass('active');
    scrollMessages(true);
}

function chatMessageOperations(data) {
    var msg = '<span class="chat-operations">';
    msg += '<a href="#" class="chat-reply" data-pt-title="Responder a ' + h(escapeString(data.nick)) + '" data-pt-position="left"><i class="fas fa-reply"></i></a>';
    msg += '<a href="#" class="chat-mark" data-pt-title="' + (data.marked ? 'Desmarcar mensagem' : 'Marcar mensagem') + '"><i class="fas fa-highlighter"></i></a>';
    msg += '<a href="#" class="chat-remove" data-pt-title="Remover mensagem" data-pt-scheme="pro" data-pt-classes="chat-remove-tooltip" data-pt-icon="fas fa-exclamation-circle"><i class="fas fa-trash-alt"></i></a>';
    msg += '<a href="#" class="chat-restore" data-pt-title="Restaurar mensagem"><i class="fas fa-undo-alt"></i></a>';
    msg += '</span>';
    return msg;
}

function loadDropboxAdmin() {
    if (EV) {
        $('.chat-overlay-container').fadeIn(300);
        $('#action_download').addClass('active');
        loadDropbox();
    }
}

function dropboxDataUpdatedAdmin(data) {
    if (!data) {
        data = 'Nenhum arquivo disponível';
    }
    if ($('#action_download').hasClass('active')) {
        $(".chat-overlay").html(data);
        scrollMessages(true);
    }
}

function loadScheduleAdmin() {
    $('.chat-overlay-container').fadeIn(300);
    $('#action_schedule').addClass('active');
    loadSchedule();
}

function scheduleDataUpdatedAdmin(data) {
    if (!data) {
        data = 'Nenhuma sessão agendada';
    }
    if ($('#action_schedule').hasClass('active')) {
        $(".chat-overlay").html(data);
        updateMarkdown();
        scrollMessages(true);
        loadDropbox();
    }
}
DROPBOX_DATA_CALLBACKS.push(dropboxDataUpdatedAdmin);
SCHEDULE_DATA_CALLBACKS.push(scheduleDataUpdatedAdmin);
window.addEventListener("beforeunload", function(e) {
    removePopups();
}, false);
$(document).ready(function() {
    $('body').on('click', '.virtual-session-forum a', function(e) {
        e.preventDefault();
        var node = $(this).parents('.virtual-session-item');
        if (FORUM === null || FORUM.closed) {
            FORUM = window.open('/vr/' + EV + '/forum/' + intval(node.data('item')), 'FORUM', 'menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=no,left=20,top=50,width=600,height=700');
            openedPopup(FORUM);
        } else {
            FORUM.focus();
        }
        return false;
    });
    $('body').on('click', '.custom-popup a, .chat-msg a', function(e) {
        e.preventDefault();
        if (POPUP === null || POPUP.closed) {
            POPUP = window.open($(this).attr('href'), 'POPUP', 'menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=no,left=20,top=50,width=990,height=700');
            openedPopup(POPUP);
        } else {
            POPUP.focus();
        }
        return false;
    });
    $('a[data-conf]').on('click', function(e) {
        e.preventDefault();
        var w = window.screen.width;
        var h = window.screen.height;
        var wleft = parseInt(typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft, 10);
        var left = (w - (w * 0.8)) / 2;
        var width = (w * 0.8) - 40;
        var height = (h * 0.9) - 50;
        left += wleft;
        var conf = $(this).data('conf');
        var info = $(this).data('info');
        var extra = $(this).data('extra');
        if (!conf || typeof conf == 'undefined') {
            return false;
        }
        if (CONFERENCE !== null && !CONFERENCE.closed) {
            return CONFERENCE.focus();
        }
        if (extra == '?') {
            $.alertable.prompt('<strong>ENTRAR EM QUAL GRUPO?</strong>').then(function(data) {
                data.value = data.value.trim();
                if (data.value === '') {
                    return false;
                }
                EXTRA.conf = conf;
                EXTRA.breakout = (conf == 'breakout' ? data.value : null);
                if (SOCKET) {
                    SOCKET.emit('move', EXTRA.conf, EXTRA.breakout);
                }
                CONFERENCE = window.open('/vr/' + EV + '/conferencia/' + conf + '?info=' + info + '&extra=' + encodeURIComponent(data.value) + '&nick=' + encodeURIComponent((EXTRA.level ? 'BIBLOS360: ' : '') + NICK), 'CONFERENCE', 'menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=no,top=50,left=' + left + ',width=' + width + ',height=' + height);
                openedPopup(CONFERENCE);
            });
        } else {
            EXTRA.conf = conf;
            if (SOCKET) {
                SOCKET.emit('move', conf);
            }
            CONFERENCE = window.open('/vr/' + EV + '/conferencia/' + conf + '?info=' + info + '&nick=' + encodeURIComponent((EXTRA.level ? 'BIBLOS360: ' : '') + NICK), 'CONFERENCE', 'menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=no,top=50,left=' + left + ',width=' + width + ',height=' + height);
            openedPopup(CONFERENCE);
        }
        return false;
    });
    $('.users-list').on("click", 'a.users-action-conf', function(e) {
        e.preventDefault();
        var w = window.screen.width;
        var h = window.screen.height;
        var wleft = parseInt(typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft, 10);
        var left = (w - (w * 0.8)) / 2;
        var width = (w * 0.8) - 40;
        var height = (h * 0.9) - 50;
        left += wleft;
        if (CONFERENCE !== null && !CONFERENCE.closed) {
            CONFERENCE.focus();
        }
        var conf = $(this).data('conf');
        var extid = $(this).data('extid');
        var info = $(this).data('info') || "";
        var breakout = $(this).data('breakout');
        if (!conf || typeof conf == 'undefined') {
            return false;
        }
        if (!extid || typeof extid == 'undefined') {
            return false;
        }
        EXTRA.conf = conf;
        EXTRA.breakout = breakout;
        if (SOCKET) {
            SOCKET.emit('move', conf, breakout);
        }
        CONFERENCE = window.open('/vr/' + EV + '/conferencia/' + conf + '?info=' + info + '&id=' + extid + '&nick=' + encodeURIComponent((EXTRA.level ? 'BIBLOS360: ' : '') + NICK), 'CONFERENCE', 'menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=no,top=50,left=' + left + ',width=' + width + ',height=' + height);
        openedPopup(CONFERENCE);
        return false;
    });
    $('body').on('click', 'a.actions-overlay', function(e) {
        e.preventDefault();
        $('body').toggleClass('virtual-overlay');
        return false;
    });
    $('.users-list').on("click", 'a.users-action-reload', function(e) {
        e.preventDefault();
        if (SOCKET) {
            SOCKET.emit('user-reload', $(this).data('userid'));
        }
        return false;
    });
    $('.users-list').on("click", 'a.users-action-logout', function(e) {
        e.preventDefault();
        if (SOCKET) {
            SOCKET.emit('user-logout', $(this).data('userid'));
        }
        return false;
    });
    $('.users-list').on("click", 'a.users-action-refresh', function(e) {
        e.preventDefault();
        if (SOCKET) {
            SOCKET.emit('user-refresh', $(this).data('userid'));
        }
        return false;
    });
    $('.users-list').on("click", 'a.users-action-block', function(e) {
        e.preventDefault();
        if (SOCKET) {
            SOCKET.emit('user-block', $(this).data('userid'));
        }
        return false;
    });
    $('.chat-scroll-overlay').on("mouseenter", function(e) {
        HOVERING = true;
    });
    $('.chat-scroll-overlay').on("mouseleave", function(e) {
        HOVERING = false;
    });
    $('.chat-messages').on("mouseenter", 'li.chat-message', function(e) {
        HOVERING = true;
        if (!SCROLLING) {
            checkPaused();
        }
        clearInterval(PAUSED_CHECK);
        PAUSED_CHECK = setInterval(checkPaused, 600);
    });
    $('.chat-messages').on("mouseleave", 'li.chat-message', function(e) {
        HOVERING = false;
    });
    $('.chat-messages').on("mouseenter", "a.chat-mark", function(e) {
        $(this).protipShow();
    });
    $('.chat-messages').on("mouseleave", "a.chat-mark", function(e) {
        $(this).protipHide();
    });
    $('.chat-messages').on("click", 'a.chat-mark', function(e) {
        e.preventDefault();
        if ($(this).parents('.chat-message').hasClass('chat-marked')) {
            if (SOCKET) {
                SOCKET.emit('message-unmark', $(this).parents(".chat-message").data('msgid'));
            }
            $(this).protipShow({
                title: 'Marcar mensagem'
            });
        } else {
            if (SOCKET) {
                SOCKET.emit('message-mark', $(this).parents(".chat-message").data('msgid'));
            }
            $(this).protipShow({
                title: 'Desmarcar mensagem'
            });
        }
        return false;
    });
    $('.chat-messages').on('click', '.chat-msg a', function(e) {
        e.stopPropagation();
    });
    $('.chat-messages').on("click", 'li.chat-message', function(e) {
        e.preventDefault();
        if (window.getSelection || document.getSelection) {
            var selection = (window.getSelection || document.getSelection)();
            if (selection.text) {
                return false;
            } else if (selection.toString()) {
                return false;
            }
        }
        $(this).removeClass('chat-marked');
        var fav = 0;
        if ($(this).hasClass('chat-favorited')) {
            $(this).removeClass('chat-favorited');
        } else {
            $(this).addClass('chat-favorited');
            fav = $(this).data('msgid');
        }
        if (SOCKET) {
            SOCKET.emit('message-favorite', fav);
        }
        return false;
    });
    $('#action_fav').on('click', function(e) {
        e.preventDefault();
        if ($(this).hasClass('active')) {
            if (SOCKET) {
                SOCKET.emit('message-favorite', 0);
            }
        }
        return false;
    });
    $('#action_sort').on("click", 'a', function(e) {
        e.preventDefault();
        if ($(this).hasClass('active')) return;
        var sort = $(this).data('sort');
        $('#action_sort a').removeClass('active');
        $(this).addClass('active');
        if (sort != 'unify' && SALAS_UNIFIED) {
            SALAS_UNIFIED = false;
            $(".users-list").addClass('users-list-divide').removeClass('users-list-unify');
            $('.users-list ul.users-list-sala').children().each(function() {
                if ($(this).hasClass('chat-offline')) {
                    $(this).appendTo($('.users-list-offline'));
                } else if ($(this).data('conf')) {
                    $(this).appendTo($('.users-list-' + $(this).data('conf')));
                }
            });
        }
        if (sort == 'unify') {
            SALAS_UNIFIED = true;
            $(".users-list").addClass('users-list-unify').removeClass('users-list-divide');
            $('.users-list ul:not(.users-list-sala)').children().appendTo($('.users-list-sala'));
            sortUsers('sala');
        } else {
            $('.users-list').removeClass('users-label-turma').removeClass('users-label-grupo').removeClass('users-label-rede').removeClass('users-label-watcher');
            $('.users-list').addClass('users-label-' + sort);
            sortUsers();
            sortUsers('offline');
        }
        return false;
    });
    $('#action_hide').on("click", 'a', function(e) {
        e.preventDefault();
        $('#action_hide a').removeClass('active');
        $(this).addClass('active');
        $('.users-list').removeClass('users-hide-staff').removeClass('users-hide-insc');
        var hiding = $(this).data('hide').split(',');
        for (var i = hiding.length - 1; i >= 0; i--) {
            $('.users-list').addClass('users-hide-' + hiding[i]);
        }
        return false;
    });
    $('#action_projects').on('click', function(e) {
        e.preventDefault();
        var w = window.screen.width;
        var h = window.screen.height;
        var wleft = parseInt(typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft, 10);
        var left = (w - (w * 0.7)) / 2;
        var width = (w * 0.7);
        var height = (h * 0.9) - 50;
        left += wleft;
        if (PROJECT === null || PROJECT.closed) {
            PROJECT = window.open('/projeto/evento/' + EV, 'PROJECT', 'menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=no,top=50,left=' + left + ',width=' + width + ',height=' + height);
            openedPopup(PROJECT);
        } else {
            PROJECT.focus();
        }
        return false;
    });
    $('#action_reset').on('click', function(e) {
        e.preventDefault();
        $.alertable.confirm('Você tem certeza que deseja LIMPAR O CHAT na sua tela?<br>Nenhuma mensagem será excluída').then(function() {
            $('.chat-messages > li').remove();
        });
        return false;
    });
    $('.users-list').on("mouseenter", '.chat-watcher', function(e) {
        $(this).protipShow({
            position: 'bottom',
            icon: getSessionIcon($(this).data('watcher-item'), $(this).data('watcher')),
            title: getSessionTitle($(this).data('watcher-item'), $(this).data('watcher'))
        });
    });
    $('.users-list').on("mouseleave", '.chat-watcher', function(e) {
        $(this).protipHide();
    });
    if (SOCKET) {
        SOCKET.on("user-started", function(uid, eid, item, category) {
            $(eid ? '.extid-' + eid : '.userid-' + uid).removeClass('user-live').removeClass('user-video').removeClass('user-conf').addClass('user-' + category);
            $((eid ? '.extid-' + eid : '.userid-' + uid) + ' .chat-watcher').data('watcher', category).data('watcher-item', item);
            $((eid ? '.extid-' + eid : '.userid-' + uid) + ' .chat-extra-watcher').html(item && item > 0 ? item : '');
        });
        SOCKET.on("user-stopped", function(uid, eid, item, category) {
            $(eid ? '.extid-' + eid : '.userid-' + uid).removeClass('user-live').removeClass('user-video').removeClass('user-conf');
            $((eid ? '.extid-' + eid : '.userid-' + uid) + ' .chat-watcher').dat
(Content truncated due to size limit. Use page ranges or line ranges to read remaining content)