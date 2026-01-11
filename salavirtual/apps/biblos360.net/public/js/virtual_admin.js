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
function soundAlert() { }
function loadStream() {
  if (EV) {
    $('.chat-overlay-container').fadeIn(300);
    $('#action_stream').addClass('active');
    $.ajaxSetup({
      cache: false
    });
    $.get("/vr/" + EV + "/stream", function (data) {
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
window.addEventListener("beforeunload", function (e) {
  removePopups();
}, false);
$(document).ready(function () {
  $('body').on('click', '.virtual-session-forum a', function (e) {
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
  $('body').on('click', '.custom-popup a, .chat-msg a', function (e) {
    e.preventDefault();
    if (POPUP === null || POPUP.closed) {
      POPUP = window.open($(this).attr('href'), 'POPUP', 'menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=no,left=20,top=50,width=990,height=700');
      openedPopup(POPUP);
    } else {
      POPUP.focus();
    }
    return false;
  });
  $('a[data-conf]').on('click', function (e) {
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
      $.alertable.prompt('<strong>ENTRAR EM QUAL GRUPO?</strong>').then(function (data) {
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
  $('.users-list').on("click", 'a.users-action-conf', function (e) {
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
  $('body').on('click', 'a.actions-overlay', function (e) {
    e.preventDefault();
    $('body').toggleClass('virtual-overlay');
    return false;
  });
  $('.users-list').on("click", 'a.users-action-reload', function (e) {
    e.preventDefault();
    if (SOCKET) {
      SOCKET.emit('user-reload', $(this).data('userid'));
    }
    return false;
  });
  $('.users-list').on("click", 'a.users-action-logout', function (e) {
    e.preventDefault();
    if (SOCKET) {
      SOCKET.emit('user-logout', $(this).data('userid'));
    }
    return false;
  });
  $('.users-list').on("click", 'a.users-action-refresh', function (e) {
    e.preventDefault();
    if (SOCKET) {
      SOCKET.emit('user-refresh', $(this).data('userid'));
    }
    return false;
  });
  $('.users-list').on("click", 'a.users-action-block', function (e) {
    e.preventDefault();
    if (SOCKET) {
      SOCKET.emit('user-block', $(this).data('userid'));
    }
    return false;
  });
  $('.chat-scroll-overlay').on("mouseenter", function (e) {
    HOVERING = true;
  });
  $('.chat-scroll-overlay').on("mouseleave", function (e) {
    HOVERING = false;
  });
  $('.chat-messages').on("mouseenter", 'li.chat-message', function (e) {
    HOVERING = true;
    if (!SCROLLING) {
      checkPaused();
    }
    clearInterval(PAUSED_CHECK);
    PAUSED_CHECK = setInterval(checkPaused, 600);
  });
  $('.chat-messages').on("mouseleave", 'li.chat-message', function (e) {
    HOVERING = false;
  });
  $('.chat-messages').on("mouseenter", "a.chat-mark", function (e) {
    $(this).protipShow();
  });
  $('.chat-messages').on("mouseleave", "a.chat-mark", function (e) {
    $(this).protipHide();
  });
  $('.chat-messages').on("click", 'a.chat-mark', function (e) {
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
  $('.chat-messages').on('click', '.chat-msg a', function (e) {
    e.stopPropagation();
  });
  $('.chat-messages').on("click", 'li.chat-message', function (e) {
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
  $('#action_fav').on('click', function (e) {
    e.preventDefault();
    if ($(this).hasClass('active')) {
      if (SOCKET) {
        SOCKET.emit('message-favorite', 0);
      }
    }
    return false;
  });
  $('#action_sort').on("click", 'a', function (e) {
    e.preventDefault();
    if ($(this).hasClass('active'))
      return;
    var sort = $(this).data('sort');
    $('#action_sort a').removeClass('active');
    $(this).addClass('active');
    if (sort != 'unify' && SALAS_UNIFIED) {
      SALAS_UNIFIED = false;
      $(".users-list").addClass('users-list-divide').removeClass('users-list-unify');
      $('.users-list ul.users-list-sala').children().each(function () {
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
  $('#action_hide').on("click", 'a', function (e) {
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
  $('#action_projects').on('click', function (e) {
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
  $('#action_reset').on('click', function (e) {
    e.preventDefault();
    $.alertable.confirm('Você tem certeza que deseja LIMPAR O CHAT na sua tela?<br>Nenhuma mensagem será excluída').then(function () {
      $('.chat-messages > li').remove();
    });
    return false;
  });
  $('.users-list').on("mouseenter", '.chat-watcher', function (e) {
    $(this).protipShow({
      position: 'bottom',
      icon: getSessionIcon($(this).data('watcher-item'), $(this).data('watcher')),
      title: getSessionTitle($(this).data('watcher-item'), $(this).data('watcher'))
    });
  });
  $('.users-list').on("mouseleave", '.chat-watcher', function (e) {
    $(this).protipHide();
  });
  if (SOCKET) {
    SOCKET.on("user-started", function (uid, eid, item, category) {
      $(eid ? '.extid-' + eid : '.userid-' + uid).removeClass('user-live').removeClass('user-video').removeClass('user-conf').addClass('user-' + category);
      $((eid ? '.extid-' + eid : '.userid-' + uid) + ' .chat-watcher').data('watcher', category).data('watcher-item', item);
      $((eid ? '.extid-' + eid : '.userid-' + uid) + ' .chat-extra-watcher').html(item && item > 0 ? item : '');
    });
    SOCKET.on("user-stopped", function (uid, eid, item, category) {
      $(eid ? '.extid-' + eid : '.userid-' + uid).removeClass('user-live').removeClass('user-video').removeClass('user-conf');
      $((eid ? '.extid-' + eid : '.userid-' + uid) + ' .chat-watcher').data('watcher', '').data('watcher-item', '');
      $((eid ? '.extid-' + eid : '.userid-' + uid) + ' .chat-extra-watcher').html('');
    });
    SOCKET.on("favorited", function (data) {
      $('.chat-favorited').removeClass('chat-favorited');
      if (data) {
        console.log("favorited: " + data.nick + ": " + data.message);
        $(".chat-message[data-msgid='" + data.msgid.toString() + "']").removeClass('chat-marked').addClass('chat-favorited');
        $('#action_fav').addClass('active');
        data = chatData(data);
        var msg = '';
        msg += '<div class="chat-message-overlay">';
        msg += '<span class="chat-sender ' + data.userclass.replace('chat-own', '') + '">';
        msg += h(escapeString(data.nick.replace(/\d/i, '')));
        msg += (data.extra.parceiro ? '<span class="chat-extra-parceiro"><i class="fas fa-star"></i></span>' : '');
        msg += (data.sub ? '<span class="chat-extra ' + (data.source ? 'chat-' + data.source : '') + '">' + escapeString(data.sub) + '</span> ' : '');
        msg += '</span>'
        msg += '<span class="chat-msg ' + data.msgclass + '">' + (data.message_html ? data.message_html : nl2br(h(replaceUrl(escapeString(data.message))))) + '</span>';
        msg += '</div>';
        $('#overlay-favorite').fadeOut(200, function () {
          $('#overlay-lower').css({
            opacity: 0
          });
          $('#overlay-voting').css({
            opacity: 0
          });
          $('#overlay-timer').css({
            opacity: 0
          });
          $('#overlay-favorite').html(msg).fadeIn(200);
        });
      } else {
        $('#action_fav').removeClass('active');
        $('#overlay-favorite').fadeOut(200, function () {
          $(this).html('');
          $('#overlay-timer').css({
            opacity: 1
          });
          $('#overlay-lower').css({
            opacity: 1
          });
          $('#overlay-voting').css({
            opacity: 1
          });
        });
      }
    });
    SOCKET.on("marked", function (msgid) {
      if (msgid) {
        console.log("marked: " + msgid.toString());
        $(".chat-message[data-msgid='" + msgid.toString() + "']").addClass('chat-marked');
      }
    });
    SOCKET.on("unmarked", function (msgid) {
      if (msgid) {
        console.log("unmarked: " + msgid.toString());
        $(".chat-message[data-msgid='" + msgid.toString() + "']").removeClass('chat-marked');
      }
    });
    $('#action_refresh').on('click', function (e) {
      e.preventDefault();
      $(this).addClass('active');
      SOCKET.emit('room-refresh');
      return false;
    });
    SOCKET.on("refresh", function () {
      console.log('refresh');
      systemMessage('DADOS DO TIMOTINHO recarregados');
      $('#action_refresh').removeClass('active');
    });
    $('#action_dropbox').on('click', function (e) {
      e.preventDefault();
      $(this).addClass('active');
      $.ajaxSetup({
        cache: false
      });
      $.get("/vr/" + EV + "/dropbox", {
        reset: 1
      }, function (data) {
        if (data) {
          SOCKET.emit('room-dropbox');
        }
      });
      return false;
    });
    SOCKET.on("dropbox", function () {
      console.log('dropbox');
      systemMessage('DROPBOX recarregado');
      $('#action_dropbox').removeClass('active');
    });
    $('#action_download').on('click', function (e) {
      e.preventDefault();
      var active = $(this).hasClass('active');
      closeOverlay();
      if (!active) {
        loadDropboxAdmin();
      }
      return false;
    });
    $('#action_reschedule').on('click', function (e) {
      e.preventDefault();
      $(this).addClass('active');
      SOCKET.emit('room-schedule');
      return false;
    });
    SOCKET.on("schedule", function () {
      console.log('schedule');
      systemMessage('PROGRAMA recarregado');
      $('#action_reschedule').removeClass('active');
    });
    $('#action_schedule').on('click', function (e) {
      e.preventDefault();
      var active = $(this).hasClass('active');
      closeOverlay();
      if (!active) {
        loadScheduleAdmin();
      }
      return false;
    });
    $('#action_jitsi').on('click', function (e) {
      e.preventDefault();
      if ($(this).hasClass('active')) {
        $.alertable.confirm('Você tem certeza que deseja DESLIGAR o servidor JITSI?').then(function () {
          $('#action_jitsi').addClass('ongoing');
          $('#action_jitsi .action-title').html('JITSI DESLIGANDO...');
          SOCKET.emit('jitsi-disabled');
        });
      } else {
        $.alertable.confirm('Você tem certeza que deseja LIGAR o servidor JITSI?').then(function () {
          $('#action_jitsi').addClass('ongoing');
          $('#action_jitsi .action-title').html('JITSI LIGANDO...');
          SOCKET.emit('jitsi-enabled');
        });
      }
      return false;
    });
    SOCKET.on("jitsi", function (data) {
      console.log('jitsi ' + data);
      if (data == 'off') {
        $('#action_jitsi').removeClass('active').removeClass('ongoing');
        $('#action_jitsi .action-title').html('JITSI DESLIGADO');
        $('#action_jitsi').protipSet({
          title: 'Ligar o servidor do JITSI'
        });
        $("#sidebar-videoconf-on").hide();
        $("#sidebar-videoconf-off").show();
      } else if (data == 'active') {
        $('#action_jitsi').addClass('active').removeClass('ongoing');
        $('#action_jitsi .action-title').html('JITSI LIGADO');
        $('#action_jitsi').protipSet({
          title: 'Desligar o servidor do JITSI'
        });
        $("#sidebar-videoconf-off").hide();
        $("#sidebar-videoconf-on").show();
      } else if (!data) {
        $('#action_jitsi').addClass('ongoing');
      }
    });
    $('#action_stream').on('click', function (e) {
      e.preventDefault();
      var active = $(this).hasClass('active');
      closeOverlay();
      if (!active) {
        loadStream();
      }
      return false;
    });
    $('#action_online').on("click", function (e) {
      e.preventDefault();
      if ($(this).hasClass('active')) {
        $.alertable.confirm('Você tem certeza que deseja FINALIZAR a transmissão?').then(function () {
          SOCKET.emit('stream-offline');
          SOCKET.emit('stream-delay', 0);
        });
      } else {
        $.alertable.prompt('<strong>Você tem certeza que deseja INICIAR a transmissão?</strong><br>Link do YouTube/Vimeo, número da sessão ou em branco para próxima sessão.<br><span style="color: #999">(1) https://vimeo.com/event/382005<br>(2) https://vimeo.com/event/2038600</span>').then(function (data) {
          if (intval(data.value) != 0) {
            SOCKET.emit('stream-session', data.value);
          } else {
            SOCKET.emit('stream-online', data.value);
          }
          SOCKET.emit('stream-delay', 15);
        });
      }
      return false;
    });
    SOCKET.on("online", function (data) {
      console.log('online');
      $('#action_online').addClass('active');
      $('#action_online i').removeClass('far').addClass('fas');
      $('#action_online div').html('ONLINE');
      $('#action_online').protipSet({
        title: 'Terminar transmissão ao vivo'
      });
      if (data && data.length > 0 && intval(data) === 0) {
        FIXED_LIVE_URL = data;
      }
      if ($('body').hasClass('virtual-chat-remove')) {
        $('body').removeClass('virtual-chat-remove').addClass('virtual-chat-removed');
      }
      if ($('body').hasClass('virtual-users-remove')) {
        $('body').removeClass('virtual-users-remove').addClass('virtual-users-removed');
      }
    });
    SOCKET.on("offline", function () {
      console.log('offline');
      $('#action_online').removeClass('active');
      $('#action_online i').removeClass('fas').addClass('far');
      $('#action_online div').html('OFFLINE');
      $('#action_online').protipSet({
        title: 'Iniciar transmissão ao vivo'
      });
      FIXED_LIVE_URL = false;
      if ($('body').hasClass('virtual-chat-removed')) {
        $('body').removeClass('virtual-chat-removed').addClass('virtual-chat-remove');
      }
      if ($('body').hasClass('virtual-users-removed')) {
        $('body').removeClass('virtual-users-removed').addClass('virtual-users-remove');
      }
    });
    $('#action_delay').on("click", function (e) {
      e.preventDefault();
      $.alertable.prompt('<strong>Qual é o delay da transmissão ao vivo?</strong><br>Padrão: 15 segundos').then(function (data) {
        SOCKET.emit('stream-delay', intval(data.value));
      });
      return false;
    });
    SOCKET.on("delay", function (data, update) {
      $('#action_delay .actions-extra').html('[' + intval(data) + ']');
    });
    $('#action_disabled').on("click", function (e) {
      e.preventDefault();
      if ($(this).hasClass('active')) {
        SOCKET.emit('chat-enabled');
      } else {
        SOCKET.emit('chat-disabled');
      }
      return false;
    });
    SOCKET.on("disabled", function () {
      console.log('chat disabled');
      $('#action_disabled').removeClass('.fa-comment').addClass('.fa-comment-slash').addClass('active');
      $('#action_disabled .action-title').html('CHAT DESATIVADO');
      $('#action_disabled').protipSet({
        title: 'Ativar o chat ao vivo'
      });
    });
    SOCKET.on("enabled", function () {
      console.log('chat enabled');
      $('#action_disabled').removeClass('.fa-comment-slash').addClass('.fa-comment').removeClass('active');
      if ($('body').hasClass('virtual-chat-remove')) {
        $('#action_disabled .action-title').html('CHAT OFFLINE');
        $('#action_disabled').protipSet({
          title: 'Desativar o chat quando entrar ao vivo'
        });
      } else {
        $('#action_disabled .action-title').html('CHAT ATIVADO');
        $('#action_disabled').protipSet({
          title: 'Desativar o chat ao vivo'
        });
      }
    });
    $('#action_raffle').on("click", function (e) {
      e.preventDefault();
      if ($(this).hasClass('active')) {
        SOCKET.emit('stream-raffle', 0);
      } else {
        SOCKET.emit('stream-raffle', 1);
      }
      return false;
    });
    SOCKET.on("raffle", function (winner, shuffled) {
      if (winner) {
        console.log('raffle: ' + winner.nick);
        $('#action_raffle').addClass('active');
        var delay = 7 / shuffled.length;
        $('#overlay-lower').hide().html('<div class="main"><div class="raffle"></div></div>');
        $('.chat-overlay-container').fadeIn(300);
        $(".chat-overlay").html('<div class="chat-raffle"></div>');
        for (var i = shuffled.length - 1; i >= 0; i--) {
          $('.chat-raffle').append('<div class="chat-raffle-item" style="animation-delay: ' + (i * delay) + 's; animation-duration: ' + (delay + 0.2) + 's">' + shuffled[i].nick + (shuffled[i].uf ? ' <span class="sep" style="font-size: 0.7em">' + shuffled[i].uf + '</span>' : '') + '</div>');
        }
        $('.chat-raffle').append('<div class="chat-raffle-item chat-raffle-winner" style="animation-delay: ' + (shuffled.length * delay) + 's">' + winner.nick + (winner.uf ? ' <span class="sep" style="font-size: 0.7em">' + winner.uf + '</span>' : '') + '</div>');
        $('.chat-raffle').addClass('animated');
        $('#overlay-lower').fadeIn(300);
      } else {
        $('#action_raffle').removeClass('active');
        closeOverlay();
        $('#overlay-lower').fadeOut(600, function () {
          $('#lower').html('');
        });
      }
    });
    $('#action_notify').on("click", function (e) {
      e.preventDefault();
      $.alertable.prompt('<strong>NOTIFICAÇÃO</strong><br>Texto | extra (opcional)').then(function (data) {
        if (data.value !== '') {
          SOCKET.emit('stream-notify', data.value);
        }
      });
      return false;
    });
    SOCKET.on("notification", function (msg, body) {
      console.log('notification: ' + msg + (body ? ' | ' + body : ''));
    });
    SOCKET.on("sound", function () {
      console.log('sound alert');
    });
    $('#action_sound').on("click", function (e) {
      e.preventDefault();
      $.alertable.prompt('<strong>ALERTA SONORO + NOTIFICAÇÃO</strong><br>Texto | extra (opcional)').then(function (data) {
        if (data.value !== '') {
          SOCKET.emit('stream-notify', data.value);
          SOCKET.emit('stream-sound');
        }
      });
      return false;
    });
    $('#action_info').on("click", function (e) {
      e.preventDefault();
      $.alertable.prompt('<strong>QUADRO DE AVISOS</strong><br>Somente visível OFFLINE', {
        prompt: '<textarea class="alertable-input" name="value" rows="7">' + ($('#action_info').data('info') || "") + '</textarea>'
      }).then(function (data) {
        SOCKET.emit('room-info', data.value);
      });
      return false;
    });
    SOCKET.on("info", function (message) {
      if (message) {
        console.log("info: " + message);
        $('#action_info').addClass('active');
      } else {
        console.log("info cleared");
        $('#action_info').removeClass('active');
      }
      $('#action_info').data('info', message);
    });
    SOCKET.on("message-external", function (message) {
      console.log("external: " + message);
      systemMessage(message);
    });
    $('.users-list').on("click", 'a.users-action', function (e) {
      e.preventDefault();
      var actions = '';
      var li = $(this).parents('li');
      var userid = li.data('userid');
      var extid = li.data('extid');
      if (userid) {
        if (extid && li.data('conf')) {
          actions += '<a href="#" class="users-action-conf" data-extid="' + extid + '" data-conf="' + li.data('conf') + '" data-breakout="' + li.data('breakout') + '">Entrar na Sala</a>';
        }
        actions += '<a href="#" class="users-action-reload" data-userid="' + userid + '">Recarregar Página</a>';
        actions += '<a href="#" class="users-action-logout" data-userid="' + userid + '">Expirar Conexão</a>';
        if (extid) {
          actions += '<a href="#" class="users-action-refresh" data-userid="' + userid + '">Recarregar Dados</a>';
        }
      }
      if (extid) {
        actions += '<a href="http://tim.biblos360.com.br/secure/registro/info.php?id=' + extid + '" class="users-action-view" target="_blank">Ver no Timotinho</a>';
      }
      actions += '<div style="font-size: 0.8em; opacity: 0.5; padding-top: 5px">';
      if (userid) {
        actions += 'userid: ' + userid + ' &nbsp; ';
      }
      if (extid) {
        actions += 'extid: ' + extid;
      }
      actions += '</div>';
      $(this).parents('.users-list').protipHideInside();
      $(this).protipShow({
        target: 'body',
        trigger: 'click',
        position: 'bottom-left',
        scheme: 'dark',
        classes: 'users-tooltip',
        interactive: true,
        title: actions
      });
      return false;
    });
    $('#action_lower').on("click", function (e) {
      e.preventDefault();
      if ($(this).hasClass('active')) {
        SOCKET.emit('stream-lower');
      } else {
        $.alertable.prompt('<strong>TEXTO NA TELA</strong><br>Título | subtítulo (opcional)').then(function (data) {
          SOCKET.emit('stream-lower', data.value);
        });
      }
      return false;
    });
    SOCKET.on("lower", function (data) {
      if (data) {
        console.log("lower: " + data.main + (data.sub ? ' | ' + data.sub : ''));
        $('#action_lower').addClass('active');
        if (data.main == 'INTERVALO') {
          $('#action_break').addClass('active');
        }
        if (data.main == 'EXERCÍCIO EM GRUPO') {
          $('#action_exercicio').addClass('active');
        }
        if (data.main == 'COMPARTILHAR NOS GRUPOS') {
          $('#action_compartilhar').addClass('active');
        }
        if (data.main == 'BOM DIA!' || data.main == 'BOA TARDE!' || data.main == 'BOA NOITE!') {
          $('#action_greeting').addClass('active');
        }
        if (data.sub == 'MAIS RÁPIDO') {
          $('#action_fastest').addClass('active');
        }
        systemMessage('TEXTO: ' + data.main + (data.sub ? ' | ' + data.sub : ''));
        $("#overlay-lower").fadeOut(200, function () {
          $(this).html('<div class="main">' + escapeString(data.main) + '</div>' + (data.sub ? '<div class="sub">' + escapeString(data.sub) + '</div>' : '')).fadeIn(200);
        });
      } else {
        if ($('#action_lower').hasClass('active')) {
          systemMessage('TEXTO REMOVIDO');
        }
        console.log("lower cleared");
        $('#action_lower').removeClass('active');
        $('#action_break').removeClass('active');
        $('#action_exercicio').removeClass('active');
        $('#action_greeting').removeClass('active');
        $('#action_compartilhar').removeClass('active');
        $('#action_fastest').removeClass('active');
        $('#overlay-lower').fadeOut(200, function () {
          $(this).html('');
        });
      }
    });
    $('#action_timer').on("click", function (e) {
      e.preventDefault();
      if ($(this).hasClass('active')) {
        SOCKET.emit('stream-timer');
      } else {
        $.alertable.prompt('<strong>TIMER</strong><br>horário ou minutos | Texto (opcional)').then(function (data) {
          SOCKET.emit('stream-timer', data.value);
        });
      }
      return false;
    });
    SOCKET.on("timer", function (timer, seconds) {
      if (!timer) {
        console.log("timer cleared");
        $('#action_timer').removeClass('active');
        // Remover classe active de botões de atalho que usam timer
        $('#action_break').removeClass('active');
        $('#action_exercicio').removeClass('active');
        $('#action_greeting').removeClass('active');
        $('#action_compartilhar').removeClass('active');
        systemMessage('TIMER FINALIZADO');
        $('#overlay-timer').fadeOut(200, function () {
          $('#overlay-lower').css({
            opacity: 1
          });
          $('#overlay-voting').css({
            opacity: 1
          });
        });
      } else {
        $('#action_timer').addClass('active');
        var d = new Date(timer);
        console.log("timer: " + d.toTimeString());
        $("#overlay-timer").fadeOut(200, function () {
          $('#overlay-lower').css({
            opacity: 0
          });
          $('#overlay-voting').css({
            opacity: 0
          });
          $(this).fadeIn(200);
        });
      }
    });
    $('#action_break').on("click", function (e) {
      e.preventDefault();
      if ($(this).hasClass('active')) {
        SOCKET.emit('stream-timer');
      } else {
        var d = new Date();
        var m = d.getMinutes();
        var h = d.getHours();
        var c = (m < 10 ? 15 : (m < 25 ? 30 : (m < 40 ? 45 : 0)));
        if (c == 0) {
          h = d.getHours() == 23 ? 0 : d.getHours() + 1;
        }
        if (c - m < 10) {
          c = c + 5;
        }
        var timer = h.toString().padStart(2, "0") + ':' + c.toString().padStart(2, "0");
        $.alertable.prompt('<strong>INTERVALO</strong><br>horário ou minutos', {
          prompt: '<input class="alertable-input" type="text" name="value" value="' + timer + '">'
        }).then(function (data) {
          if (data.value) {
            SOCKET.emit('stream-timer', data.value + ' | INTERVALO');
          } else {
            SOCKET.emit('stream-lower', 'INTERVALO');
          }
        });
      }
      return false;
    });
    $('#action_exercicio').on("click", function (e) {
      e.preventDefault();
      if ($(this).hasClass('active')) {
        SOCKET.emit('stream-timer');
      } else {
        $.alertable.prompt('<strong>EXERCÍCIO EM GRUPO</strong><br>horário ou minutos').then(function (data) {
          if (data.value) {
            SOCKET.emit('stream-timer', data.value + ' | EXERCÍCIO EM GRUPO');
          } else {
            SOCKET.emit('stream-lower', 'EXERCÍCIO EM GRUPO');
          }
        });
      }
      return false;
    });
    $('#action_greeting').on("click", function (e) {
      e.preventDefault();
      if ($(this).hasClass('active')) {
        SOCKET.emit('stream-timer');
      } else {
        var d = new Date();
        var m = '';
        var h = '';
        if (d.getMinutes() < 30) {
          h = d.getHours().toString().padStart(2, "0") + ':30';
        } else {
          h = (d.getHours() == 23 ? 0 : d.getHours() + 1).toString().padStart(2, "0") + ':00';
        }
        if (d.getHours() >= 18 || d.getHours() <= 4) {
          m = 'BOA NOITE!';
        } else if (d.getHours() >= 12) {
          m = 'BOA TARDE!';
        } else {
          m = 'BOM DIA!';
        }
        $.alertable.prompt('<strong>RECEPÇÃO</strong><br>horário ou minutos', {
          prompt: '<input class="alertable-input" type="text" name="value" value="' + h + '">'
        }).then(function (data) {
          if (data.value) {
            SOCKET.emit('stream-timer', data.value + ' | ' + m);
          } else {
            SOCKET.emit('stream-lower', m);
          }
        });
      }
      return false;
    });
    $('#action_fastest').on("click", function (e) {
      e.preventDefault();
      if ($(this).hasClass('active')) {
        SOCKET.emit('stream-lower');
      } else {
        SOCKET.emit('stream-fastest');
      }
      return false;
    });
    $('#action_compartilhar').on("click", function (e) {
      e.preventDefault();
      if ($(this).hasClass('active')) {
        SOCKET.emit('stream-timer');
      } else {
        $.alertable.prompt('<strong>COMPARTILHAR NOS GRUPOS</strong><br>horário ou minutos').then(function (data) {
          if (data.value) {
            SOCKET.emit('stream-timer', data.value + ' | COMPARTILHAR NOS GRUPOS');
          } else {
            SOCKET.emit('stream-lower', 'COMPARTILHAR NOS GRUPOS');
          }
        });
      }
      return false;
    });
    $('#action_breakout').on("click", function (e) {
      e.preventDefault();
      if ($(this).hasClass('active')) {
        SOCKET.emit('room-breakout', 0);
      } else {
        $.alertable.prompt('<strong>DIVISÃO DE GRUPOS</strong><br>números de pessoas por grupo (coloque * para separar por sexo)').then(function (data) {
          if (data.value.length > 0) {
            SOCKET.emit('room-breakout', data.value);
          }
        });
      }
      return false;
    });
    $('#action_reuniao').on("click", function (e) {
      e.preventDefault();
      SOCKET.emit('room-conf', 'reuniao');
      return false;
    });
    $('#action_turma').on("click", function (e) {
      e.preventDefault();
      SOCKET.emit('room-conf', 'turma');
      return false;
    });
    $('#action_grupo').on("click", function (e) {
      e.preventDefault();
      SOCKET.emit('room-conf', 'grupo');
      return false;
    });
    $('#action_projeto').on("click", function (e) {
      e.preventDefault();
      SOCKET.emit('room-conf', 'projeto');
      return false;
    });
    $('#action_oracao').on("click", function (e) {
      e.preventDefault();
      SOCKET.emit('room-conf', 'oracao');
      return false;
    });
    $('#action_atendimento').on("click", function (e) {
      e.preventDefault();
      SOCKET.emit('room-conf', 'atendimento');
      return false;
    });
    $('#action_rede').on("click", function (e) {
      e.preventDefault();
      SOCKET.emit('room-conf', 'rede');
      return false;
    });
    $('#action_professor').on("click", function (e) {
      e.preventDefault();
      if ($(this).hasClass('active')) {
        SOCKET.emit('room-conf', 'professor');
      } else {
        $.alertable.prompt('<strong>MOSTRAR PARA PESSOAS ESPECÍFICAS?</strong><br>Deixe em branco para todos ou separe por vírgulas:<br><span style="color: #999">IDs = 93432,23424,69534<br>TURMAS = A, B, C<br>EQUIPE = Consultor, Docente, Biblos360, Monitor</span>').then(function (data) {
          SOCKET.emit('room-conf', 'professor', data.value);
        });
      }
      return false;
    });
    $('#action_equipe').on("click", function (e) {
      e.preventDefault();
      SOCKET.emit('room-conf', 'equipe');
      return false;
    });
    SOCKET.on("conf", function (data, update) {
      for (const [conf, val] of Object.entries(data)) {
        if (!SALAS.includes(conf)) {
          continue;
        }
        if (val) {
          $('#action_' + conf).addClass('active');
          if (SALAS_LIMIT.includes(conf)) {
            $('#action_' + conf + ' .actions-extra').html(data[conf + '_limit'] ? '<i class="fas fa-at"></i>' : '');
            $('#action_' + conf).protipSet({
              title: $('#action_' + conf).attr('data-pt-title') + (data[conf + '_limit'] ? '<br>' + data[conf + '_limit'].replace(',', ', ') : '')
            });
          }
        } else {
          $('#action_' + conf).removeClass('active');
          if (SALAS_LIMIT.includes(conf)) {
            $('#action_' + conf + ' .actions-extra').html('');
            $('#action_' + conf).protipSet({
              title: $('#action_' + conf).attr('data-pt-title')
            });
          }
        }
      }
    });
    SOCKET.on("breakout", function (data) {
      if (data) {
        $('#action_breakout .actions-extra').html('[' + data + ']');
        $('#action_breakout').addClass('active');
      } else {
        $('#action_breakout .actions-extra').html('[X]');
        $('#action_breakout').removeClass('active');
      }
    });
    $('#action_checkin').on("click", function (e) {
      e.preventDefault();
      SOCKET.emit('stream-checkin');
      return false;
    });
    SOCKET.on("checkin", function (data) {
      if (data) {
        $('#action_checkin').addClass('active');
        systemMessage('CONFIRMAÇÃO DE PRESENÇA INICIADA');
      } else {
        if ($('#action_checkin').hasClass('active')) {
          systemMessage('CONFIRMAÇÃO DE PRESENÇA FINALIZADA');
        }
        $('#action_checkin').removeClass('active');
      }
    });
    $('#action_evaluation').on("click", function (e) {
      e.preventDefault();
      if ($(this).hasClass('active')) {
        SOCKET.emit('stream-evaluation');
      } else {
        $.alertable.prompt('<strong>AVALIAÇÃO DO DOCENTE</strong><br>Código do docente').then(function (data) {
          if (data.value !== '') {
            SOCKET.emit('stream-evaluation', data.value);
          }
        });
      }
      return false;
    });
    SOCKET.on("evaluation", function (data) {
      if (data) {
        $('#action_evaluation').addClass('active');
        systemMessage('AVALIAÇÃO DO DOCENTE INICIADA: ' + data.toString());
      } else {
        if ($('#action_evaluation').hasClass('active')) {
          systemMessage('AVALIAÇÃO DO DOCENTE FINALIZADA');
        }
        $('#action_evaluation').removeClass('active');
      }
    });
    $('#action_popup').on("click", function (e) {
      e.preventDefault();
      if ($(this).hasClass('active')) {
        SOCKET.emit('stream-popup');
      } else {
        $.alertable.prompt('<strong>POP-UP</strong><br>Link | Texto do botão (padrão: ABRIR LINK)').then(function (data) {
          if (data.value !== '') {
            SOCKET.emit('stream-popup', data.value);
          }
        });
      }
      return false;
    });
    SOCKET.on("popup", function (data) {
      if (data) {
        $('#action_popup').addClass('active');
        systemMessage('POP-UP: ' + data.link);
      } else {
        if ($('#action_popup').hasClass('active')) {
          systemMessage('POP-UP REMOVIDO');
        }
        $('#action_popup').removeClass('active');
      }
    });
    $('#action_review').on("click", function (e) {
      e.preventDefault();
      if ($(this).hasClass('active')) {
        SOCKET.emit('stream-review');
      } else {
        if (EV && EV != 'pub') {
          SOCKET.emit('stream-review', EV);
        }
      }
      return false;
    });
    SOCKET.on("review", function (data) {
      if (data) {
        $('#action_review').addClass('active');
        systemMessage('AVALIAÇÃO DO EVENTO INICIADA');
      } else {
        if ($('#action_review').hasClass('active')) {
          systemMessage('AVALIAÇÃO DO EVENTO FINALIZADA');
        }
        $('#action_review').removeClass('active');
      }
    });
    $('#action_vote').on("click", function (e) {
      e.preventDefault();
      if ($(this).hasClass('active')) {
        SOCKET.emit('stream-vote');
      } else {
        $.alertable.prompt('<strong>ENQUETE</strong><br>Pergunta | resposta | resposta | ...').then(function (data) {
          if (data.value !== '') {
            SOCKET.emit('stream-vote', data.value);
          }
        });
      }
      return false;
    });
    SOCKET.on("vote", function (data) {
      if (data) {
        $('#action_vote').addClass('active');
        systemMessage('ENQUETE INICIADA: ' + data.question);
        $('#overlay-question').html(data.question + '<span class="user-count-voted"></span>');
        data.answers.forEach(function (ans, index) {
          $('#overlay-answers table').append('<tr class="answer answer-' + (index + 1).toString() + '"><th class="num"><span>' + (index + 1).toString() + '</span></th><th>' + ans + '</th><td class="perc"></td><td class="bar"><div class=""></div></td></tr>');
        });
        $('#overlay-voting').fadeIn(600, function () { });
        $('.chat-overlay').html('<span class="user-count-voted"></span><div id="question"></div><div id="answers"><table></table></div>');
        $('.chat-overlay #question').html(data.question);
        data.answers.forEach(function (ans, index) {
          $('.chat-overlay #answers table').append('<tr class="answer answer-' + (index + 1).toString() + '"><th class="num"><span>' + (index + 1).toString() + '</span></th><th>' + ans + '</th><td class="result"></td><td class="perc"></td><td class="bar"><div class=""></div></td></tr>');
        });
        $('.chat-overlay-container').fadeIn(300);
        scrollMessages(true);
      } else {
        if ($('#action_vote').hasClass('active')) {
          systemMessage('ENQUETE FINALIZADA');
        }
        $('#action_vote').removeClass('active');
        closeOverlay();
        $('#overlay-voting').fadeOut(600, function () {
          $('#question').html('');
          $('.answer').remove();
        });
      }
    });
    SOCKET.on("vote-results", function (results, perc) {
      console.log('vote-results', results);
      var total = 0;
      var max = 0;
      var min = 100;
      var loser = 0;
      var winner = 0;
      var unique = true;
      Object.values(results).forEach(function (val, key) {
        total = total + val;
        if (val === max) {
          unique = false;
        }
        if (val <= min) {
          min = val;
          loser = key;
        }
        if (val > max) {
          winner = key;
          max = val;
          unique = true;
        }
      });
      if (total > 0) {
        $('.user-count-voted').html(total + ' voto' + (total > 1 ? 's' : ''));
        $('.winner').removeClass('winner');
        if (unique) {
          $('.answer-' + (winner + 1).toString() + ' .bar div').addClass('winner');
        }
        var extra = Math.round((100 - perc[winner]) / (100 / (perc[winner] == perc[loser] ? 1 : perc[winner] - perc[loser])));
        Object.values(results).forEach(function (val, key) {
          var p = perc[key] < 0 ? 0 : perc[key];
          $('.answer-' + (key + 1).toString() + ' .result').text(val);
          $('.answer-' + (key + 1).toString() + ' .perc').text(p.toString() + '%');
          $('.answer-' + (key + 1).toString() + ' .bar div').animate({
            width: (p > 0 ? p + extra : 0).toString() + '%'
          }, 600);
        });
      } else {
        $('.user-count-voted').text('');
      }
    });
    SOCKET.on("user-blocked", function (data) {
      console.log("user blocked: " + data.nick);
      systemMessage(escapeString(data.nick) + " foi bloqueado");
    });
    SOCKET.on("timer-1min", function () {
      notify("Falta 1 minuto");
    });
    SOCKET.on("external", function (data) {
      insertMessage(data);
    });
    SOCKET.on("connect", function () {
      SOCKET.emit('checkins');
      SOCKET.emit('evaluations');
      SOCKET.emit('reviews');
      SOCKET.emit('votes');
      SOCKET.emit('popups');
      SOCKET.emit('favs');
      SOCKET.emit('breakouts');
      SOCKET.emit('update-jitsi');

      // Solicitar sincronização do estado do liveplayer após reconexão
      setTimeout(function () {
        if (SOCKET && SOCKET.connected) {
          SOCKET.emit('sync-live-player-state');
        }
      }, 1000);
    });

    // Handler para confirmação de sincronização
    SOCKET.on("sync-complete", function (data) {
      console.log('✅ Sincronização do liveplayer concluída:', data.message);
    });

    // Adicionar sincronização manual para o botão online/offline
    // para garantir que a mudança seja vista imediatamente
    $('#action_online').on("click", function (e) {
      var wasActive = $(this).hasClass('active');
      // Após enviar o comando, aguardar um pouco e forçar sincronização
      setTimeout(function () {
        if (SOCKET && SOCKET.connected) {
          SOCKET.emit('sync-live-player-state');
        }
      }, 1000);
    });
  }
});
