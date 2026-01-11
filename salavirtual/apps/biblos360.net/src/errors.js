/**
 * SISTEMA DE ERROS CENTRALIZADO - BIBLOS360 VIRTUAL ROOM
 * Gerencia todos os tipos de erro com templates HTML compatíveis com o legado
 */

// ========================================
// SEÇÁO 1: TEMPLATES HTML
// ========================================

/**
 * Template base para páginas de erro (baseado nos arquivos HTML legados)
 */
function getBaseTemplate({ title = 'Erro', content, hasAnalytics = true }) {
  const analyticsScript = hasAnalytics ? `
<!-- Analytics removido -->
<script defer type="text/javascript">
	window.dataLayer = window.dataLayer || [];

	function gtag(){
		var data = {
			'event': 'gtag',
			'eventMeta': {}
		}
		if ( typeof arguments[1] !== 'undefined' ) {
			data['eventAction'] = arguments[1];
		}

		if ( typeof arguments[2] !== 'undefined' && typeof arguments[2] === 'object' ) {
			for (const [key, value] of Object.entries(arguments[2])) {
				if ( key == 'event_category' ) {
					data['eventCategory'] = value;
				} else if ( key == 'event_label' ) {
					data['eventLabel'] = value;
				} else if ( key == 'value' ) {
					data['eventValue'] = value;
				} else if ( key == 'non_interaction' ) {
					data['non_interaction'] = value;
				} else if ( key == 'edu_pid' ) {
					data['edu_pid'] = value;
				} else if ( key == 'edu_pagetype' ) {
					data['edu_pagetype'] = value;
				} else {
					data['eventMeta'][key] = value;
				}
			}
		}

		if ( typeof window.dataLayerProxy !== 'undefined' ) {
			window.dataLayerProxy.push( data );
		} else {
			window.dataLayer.push( data );
		}
	}

	window.dataLayerEvents = [];

</script>

<script type="text/javascript">
	(function(document,navigator,standalone) {
		// prevents links from apps from oppening in mobile safari
		// this javascript must be the first script in your <head>
		if ((standalone in navigator) && navigator[standalone]) {
			var curnode, location=document.location, stop=/^(a|html)$/i;
			document.addEventListener('click', function(e) {
				curnode=e.target;
				while (!(stop).test(curnode.nodeName)) {
					curnode=curnode.parentNode;
				}
				// Condidions to do this only on links to your own app
				// if you want all links, use if('href' in curnode) instead.
				if(
					'href' in curnode && // is a link
					(chref=curnode.href).replace(location.href,'').indexOf('#') && // is not an anchor
					(	!(/^[a-z\\+\\.\\-]+:/i).test(chref) ||                       // either does not have a proper scheme (relative links)
					chref.indexOf(location.protocol+'//'+location.host)===0 ) // or is in the same protocol and domain
				) {
					e.preventDefault();
					location.href = curnode.href;
				}
			},false);
		}
	})(document,window.navigator,'standalone');
</script>` : '';

  return `<!doctype html>
<html lang="pt" itemscope itemtype="https://schema.org/WebPage" prefix="og: http://ogp.me/ns#">
<head>

	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, viewport-fit=cover">

	${analyticsScript}

	<title>${title} &ndash; Biblos360</title>

	<meta name="title" content="${title}" />
	<meta name="description" content="Acesso aos recursos, transmissão ao vivo e gravações." />
	<meta name="author" content="Instituto Biblos360 do Brasil" />
	<meta name="keywords" content="instituto Biblos360 seminários cursos treinamentos eventos liderança evangelismo internacional nacional local palestras semana igreja comunidade" />
	<meta name="medium" content="mult" />


	<meta itemprop="name" content="${title}" />
	<meta itemprop="description" content="Acesso aos recursos, transmissão ao vivo e gravações." />
	<meta itemprop="image" content="/img/biblos360-1400x1400.png" />

	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?00QEdL5rw9">
	<link rel="icon" href="/favicon-32x32.png?00QEdL5rw9" sizes="32x32">
	<link rel="icon" href="/favicon-16x16.png?00QEdL5rw9" sizes="16x16">

		<link rel="manifest" href="/manifest.json?00QEdL5rw9">

	<link rel="mask-icon" href="/safari-pinned-tab.svg?00QEdL5rw9" color="#5bbad5">
	<link rel="shortcut icon" href="/favicon.ico?00QEdL5rw9">

	<meta name="apple-mobile-web-app-title" content="Biblos360">
	<meta name="application-name" content="Biblos360">
	<meta name="theme-color" content="#ffffff">
	<meta name="msapplication-TileColor" content="#da532c">


	<link rel="image_src" href="/img/biblos360-1400x1400.png" />

	<meta property="og:site_name" content="Biblos360" />
	<meta property="og:title" content="${title}" />
	<meta property="og:url" content="/vr/" />
	<meta property="og:locale" content="pt_BR" />
	<meta property="og:type" content="website" />
	<meta property="og:description" content="Acesso aos recursos, transmissão ao vivo e gravações." />
	<meta property="og:image" content="/img/biblos360-1400x1400.png" />
	<meta property="og:image:alt" content="${title}">
		<meta property="og:image:width" content="1400" />
	<meta property="og:image:height" content="1400" />

	<meta property="fb:admins" content="1195552555"/>

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:site" content="@Biblos360Brasil" />
	<meta name="twitter:creator" content="@Biblos360Brasil" />








	<link href="/css/skeleton.css" rel="stylesheet" type="text/css" media="all" />
	<link href="/css/bundle.css" rel="stylesheet" type="text/css" media="all" />
	<link href="/css/virtual.css" rel="stylesheet" type="text/css" media="all" />

	<style>
		.mb10 { margin-bottom: 10px; }
		.mb15 { margin-bottom: 15px; }
		.mb30 { margin-bottom: 30px; }
		.actions a { margin-bottom: 10px; display: inline-block; }
	</style>

</head>
<body>

<div id="header" class="container">

	<div id="head" class="row">
		<div class="twelve columns">

			<div id="logo">
				<a href="/"><img src="/img/logo.png" alt="Biblos360" width="140" class="u-max-full-width" /></a>
			</div>

		</div>
	</div>

	<div id="title" class="row">
		<div class="twelve columns">
			<h4>Sala Virtual</h4>
		</div>
	</div>

</div>

<div class="container" style="max-width: 400px">

	<div id="content" class="row">
		<div class="twelve columns">
			${content}
		</div>
	</div>

</div>

</body>
</html>`;
}

/**
 * Template simples para erro genérico (baseado em error.html)
 */
function getSimpleErrorTemplate({ title = 'Erro', message, buttonText = 'Sair', buttonUrl = '/' }) {
  return `<!doctype html>
<!--[if lt IE 7 ]> <html lang="pt" class="no-js ie6"> <![endif]-->
<!--[if IE 7 ]>    <html lang="pt" class="no-js ie7"> <![endif]-->
<!--[if IE 8 ]>    <html lang="pt" class="no-js ie8"> <![endif]-->
<!--[if IE 9 ]>    <html lang="pt" class="no-js ie9"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="pt" class="no-js"> <!--<![endif]-->
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

	<title>${title}</title>
	<link href="/css/skeleton.css" rel="stylesheet" type="text/css" media="all" />
	<link href="/css/bundle.css" rel="stylesheet" type="text/css" media="all" />
	<link href="/css/virtual.css" rel="stylesheet" type="text/css" media="all" />

</head>
<body>

<div id="header" class="container">

	<div id="head" class="row">
		<div class="twelve columns">

			<div id="logo">
				<a href="/"><img src="/img/logo.png" alt="Biblos360" width="140" class="u-max-full-width" /></a>
			</div>

		</div>
	</div>

	<div id="title" class="row">
		<div class="twelve columns">
			<h4>${title}</h4>
		</div>
	</div>

</div>

<div class="container">

	<div id="content" class="row">
		<div class="twelve columns">
			<p>
				${message}
			</p>
			<a href="${buttonUrl}" class="button button-primary">${buttonText}</a>
			<p>&nbsp;</p>
		</div>
	</div>
</div>

</body>
</html>`;
}

// ========================================
// SEÇÁO 2: TIPOS DE ERRO ESPECÍFICOS
// ========================================

/**
 * Templates específicos para cada tipo de erro
 */
const errorTypes = {
  /**
   * Erro genérico do sistema
   */
  generic: ({ message = 'Infelizmente um erro ocorreu em nosso sistema.<br>Por favor, tente mais tarde.' } = {}) => {
    return getSimpleErrorTemplate({
      title: 'Erro no Sistema',
      message,
      buttonText: 'Sair',
      buttonUrl: '/'
    });
  },

  /**
   * Erro de confirmação de inscrição
   */
  confirmar: ({ roomId = '' } = {}) => {
    const content = `
			<p class="mb15">Este acesso está disponível somente para <strong>inscrições confirmadas</strong> no evento.</p>

			<p class="mb15">Se você efetuou um pagamento recentemente, pode ser que ele ainda não tenha sido processado.</p>

			<p class="mb15">Se você acredita que sua inscrição está confirmada, <a href="/contato" class="chat-click">entre em contato conosco</a> para verificarmos sua situação.</p>

			<div class="actions">
				<a href="" class="button button-primary">Sair</a>
			</div>
    `;

    return getBaseTemplate({
      title: 'Confirmação Necessária',
      content
    });
  },

  /**
   * Erro de desconexão por múltiplo acesso
   */
  desconectar: ({ roomId = 'pub' } = {}) => {
    const content = `
			<div class="mb30">Você foi desconectado da Sala Virtual porque você se conectou de outro lugar.</div>

			<div class="actions">
				<a href="/vr/${roomId}" class="button button-primary">RECONECTAR</a><br>
				<a href="/vr/chat/${roomId}" class="button button-primary">SOMENTE CHAT</a><br>
				<a href="" class="button">FECHAR</a>
			</div>
    `;

    return getBaseTemplate({
      title: 'Desconectado',
      content
    });
  },

  /**
   * Erro de expiração de sessão
   */
  expirar: ({ roomId = 'pub' } = {}) => {
    const content = `
			<div class="mb30">Sua conexão expirou.</div>

			<div class="actions">
				<a href="/vr/${roomId}" class="button button-primary">RECONECTAR</a><br>
				<a href="/vr/chat/${roomId}" class="button button-primary">SOMENTE CHAT</a><br>
				<a href="" class="button">FECHAR</a>
			</div>
    `;

    return getBaseTemplate({
      title: 'Sessão Expirada',
      content
    });
  },

  /**
   * Erro de desconexão administrativa
   */
  adminLogout: ({ roomId = 'pub' } = {}) => {
    const content = `
			<div class="mb30">Sua conexão foi encerrada por um administrador.</div>

			<div class="actions">
				<a href="/vr/${roomId}" class="button button-primary">RECONECTAR</a><br>
				<a href="/vr/chat/${roomId}" class="button button-primary">SOMENTE CHAT</a><br>
				<a href="" class="button">FECHAR</a>
			</div>
    `;

    return getBaseTemplate({
      title: 'Conexão Encerrada',
      content
    });
  },

  /**
   * Erro de sincronização de relógio
   */
  sincronizar: ({ roomId = 'pub', currentTime = null } = {}) => {
    const timeString = currentTime || new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const content = `
			<div class="mb10" style="color: #d00">O relógio do seu dispositivo não está correto.</div>
			<div class="mb10">${timeString} (Horário de Brasília)</div>
			<div class="mb30">Por favor, atualize antes de reconectar.</div>

			<div class="actions">
				<a href="/vr/${roomId}" class="button button-primary">RECONECTAR</a><br>
				<a href="" class="button">FECHAR</a>
			</div>
    `;

    return getBaseTemplate({
      title: 'Sincronização Necessária',
      content
    });
  },

  /**
   * Erro de validação genérica
   */
  validar: ({ message = 'Erro de validação' } = {}) => {
    const content = `
			<div class="mb30">${message}</div>

			<div class="actions">
				<a class="button button-primary" href="">Sair</a>
			</div>
    `;

    return getBaseTemplate({
      title: 'Erro de Validação',
      content
    });
  },

  /**
   * Página não encontrada (404)
   */
  notFound: ({ path = '' } = {}) => {
    const content = `
			<div class="mb15">A página solicitada não foi encontrada.</div>
			${path ? `<div class="mb15"><code>${path}</code></div>` : ''}

			<div class="actions">
				<a href="/vr" class="button button-primary">SALA VIRTUAL</a><br>
				<a href="" class="button">PÁGINA INICIAL</a>
			</div>
    `;

    return getBaseTemplate({
      title: 'Página Não Encontrada',
      content
    });
  },

  /**
   * Acesso não autorizado (401/403)
   */
  unauthorized: ({ message = 'Você não tem permissão para acessar este recurso.' } = {}) => {
    const content = `
			<div class="mb30">${message}</div>

			<div class="actions">
				<a href="/login.html" class="button button-primary">FAZER LOGIN</a><br>
				<a href="" class="button">PÁGINA INICIAL</a>
			</div>
    `;

    return getBaseTemplate({
      title: 'Acesso Não Autorizado',
      content
    });
  },

  /**
   * Limite de requisições excedido (429)
   */
  rateLimit: ({ retryAfter = 60 } = {}) => {
    const content = `
			<div class="mb15">Muitas tentativas de acesso.</div>
			<div class="mb30">Tente novamente em ${retryAfter} segundos.</div>

			<div class="actions">
				<a href="javascript:history.back()" class="button button-primary">VOLTAR</a><br>
				<a href="" class="button">PÁGINA INICIAL</a>
			</div>
    `;

    return getBaseTemplate({
      title: 'Limite Excedido',
      content
    });
  },

  /**
   * Serviço indisponível (503)
   */
  serviceUnavailable: ({ message = 'O serviço está temporariamente indisponível.' } = {}) => {
    const content = `
			<div class="mb30">${message}</div>

			<div class="actions">
				<a href="javascript:location.reload()" class="button button-primary">TENTAR NOVAMENTE</a><br>
				<a href="" class="button">PÁGINA INICIAL</a>
			</div>
    `;

    return getBaseTemplate({
      title: 'Serviço Indisponível',
      content
    });
  },

  /**
   * Página de saída/logout
   */
  sair: ({ roomId = 'pub', reconnectToken = null, reason = 'unknown' } = {}) => {
    // SISTEMA PROFISSIONAL: Diferentes mensagens baseadas no motivo
    let message = 'Você foi desconectado da Sala Virtual.';
    let showReconnect = true;

    if (reason === 'timeout') {
      message = 'Sua sessão expirou por inatividade (20 minutos). Faça login novamente para acessar a sala.';
      showReconnect = false; // Não permitir reconexão para timeouts
    } else if (reason === 'forced') {
      message = 'Você foi desconectado da Sala Virtual por um administrador.';
      showReconnect = false; // Não permitir reconexão para desconexões forçadas
    } else if (reason === 'duplicate') {
      message = 'Você foi desconectado da Sala Virtual porque você se conectou de outro lugar.';
    } else if (reason === 'disconnect') {
      message = 'Você foi desconectado da Sala Virtual por problemas de conectividade.';
    }

    return `<!doctype html>
<html lang="pt" itemscope itemtype="https://schema.org/WebPage" prefix="og: http://ogp.me/ns#">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, viewport-fit=cover">

	<title>Sala Virtual &ndash; Biblos360</title>

	<meta name="title" content="Sala Virtual" />
	<meta name="description" content="Acesso aos recursos, transmiss&atilde;o ao vivo e grava&ccedil;&otilde;es." />
	<meta name="author" content="Instituto Biblos360 do Brasil" />
	<meta name="keywords" content="instituto Biblos360 semin&aacute;rios cursos treinamentos eventos lideran&ccedil;a evangelismo internacional nacional local palestras semana igreja comunidade" />
	<meta name="medium" content="mult" />

	<meta itemprop="name" content="Sala Virtual" />
	<meta itemprop="description" content="Acesso aos recursos, transmiss&atilde;o ao vivo e grava&ccedil;&otilde;es." />
	<meta itemprop="image" content="/img/biblos360-1400x1400.png" />

	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?00QEdL5rw9">
	<link rel="icon" href="/favicon-32x32.png?00QEdL5rw9" sizes="32x32">
	<link rel="icon" href="/favicon-16x16.png?00QEdL5rw9" sizes="16x16">

		<link rel="manifest" href="/manifest.json?00QEdL5rw9">

	<link rel="mask-icon" href="/safari-pinned-tab.svg?00QEdL5rw9" color="#5bbad5">
	<link rel="shortcut icon" href="/favicon.ico?00QEdL5rw9">

	<meta name="apple-mobile-web-app-title" content="Biblos360">
	<meta name="application-name" content="Biblos360">
	<meta name="theme-color" content="#ffffff">
	<meta name="msapplication-TileColor" content="#da532c">

	<link rel="image_src" href="/img/biblos360-1400x1400.png" />

	<meta property="og:site_name" content="Biblos360" />
	<meta property="og:title" content="Sala Virtual" />
	<meta property="og:url" content="/vr/desconectar" />
	<meta property="og:locale" content="pt_BR" />
	<meta property="og:type" content="website" />
	<meta property="og:description" content="Acesso aos recursos, transmiss&atilde;o ao vivo e grava&ccedil;&otilde;es." />
	<meta property="og:image" content="/img/biblos360-1400x1400.png" />
	<meta property="og:image:alt" content="Sala Virtual">
		<meta property="og:image:width" content="1400" />
	<meta property="og:image:height" content="1400" />

	<meta property="fb:admins" content="1195552555"/>

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:site" content="@Biblos360Brasil" />
	<meta name="twitter:creator" content="@Biblos360Brasil" />

	<script type="text/javascript">
		(function(document,navigator,standalone) {
			// prevents links from apps from oppening in mobile safari
			// this javascript must be the first script in your <head>
			if ((standalone in navigator) && navigator[standalone]) {
				var curnode, location=document.location, stop=/^(a|html)$/i;
				document.addEventListener('click', function(e) {
					curnode=e.target;
					while (!(stop).test(curnode.nodeName)) {
						curnode=curnode.parentNode;
					}
					// Condidions to do this only on links to your own app
					// if you want all links, use if('href' in curnode) instead.
					if(
						'href' in curnode && // is a link
						(chref=curnode.href).replace(location.href,'').indexOf('#') && // is not an anchor
						(	!(/^[a-z\+\.\-]+:/i).test(chref) ||                       // either does not have a proper scheme (relative links)
						chref.indexOf(location.protocol+'//'+location.host)===0 ) // or is in the same protocol and domain
					) {
						e.preventDefault();
						location.href = curnode.href;
					}
				},false);
			}
		})(document,window.navigator,'standalone');
	</script>

	<script type="text/javascript">
		var ___base_url___ = '';
	</script>

	<script src="/min-ea10e5ebe833b7e80767d56856a32b58/g=js_skeleton.js" type="text/javascript" defer></script>

	<link href="/css/skeleton.css" rel="stylesheet" type="text/css" media="all" />

</head>
<body class="">

<div id="header" class="container" style="max-width: 400px">

	<div id="head" class="row">
		<div class="twelve columns">

			<div id="logo">
				<a href="/"><img src="/img/logo.png" alt="Biblos360" width="140" class="u-max-full-width" /></a>
			</div>

		</div>
	</div>

		<div id="title" class="row">
		<div class="twelve columns">
							<h4>Sala Virtual</h4>
		</div>
	</div>

</div>

<div class="container" style="max-width: 400px">

	<div id="content" class="row">
		<div class="twelve columns">

			<div class="mb30">${message}</div>

			<div class="actions">
				${showReconnect && reconnectToken ?
        `<a href="/reconectar/${reconnectToken}/${roomId}" class="button button-primary">RECONECTAR</a><br>` :
        showReconnect ?
          `<a href="/vr/${roomId}" class="button button-primary">RECONECTAR</a><br>` :
          `<a href="/login?room=${roomId}" class="button button-primary">FAZER LOGIN</a><br>`
      }
				<a href="/vr/chat/${roomId}" class="button button-primary">SOMENTE CHAT</a><br>
				<a href="/" class="button">FECHAR</a>
			</div>

		</div>
	</div>

</div>

</body>
</html>`;
  }
};

// ========================================
// SEÇÁO 3: FUNÇÕES DE RENDERIZAÇÁO
// ========================================

/**
 * Detecta se a requisição espera JSON ou HTML
 */
function isJsonRequest(req) {
  const acceptHeader = req.headers.accept || '';
  const contentTypeHeader = req.headers['content-type'] || '';

  // Verifica se é uma requisição de API
  if (req.originalUrl.includes('/api/')) {
    return true;
  }

  // Verifica headers
  if (acceptHeader.includes('application/json') || contentTypeHeader.includes('application/json')) {
    return true;
  }

  // Se aceita HTML explicitamente
  if (acceptHeader.includes('text/html')) {
    return false;
  }

  // Por padrão, assume HTML para navegadores
  return false;
}

/**
 * Renderiza erro em formato apropriado (JSON ou HTML)
 */
function renderError(req, res, errorType, options = {}) {
  const isJson = isJsonRequest(req);

  if (isJson) {
    // Resposta JSON para APIs
    const jsonResponse = {
      error: true,
      type: errorType,
      message: options.message || getErrorMessage(errorType),
      statusCode: options.statusCode || 500,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    };

    // Em desenvolvimento, inclui detalhes adicionais
    if (process.env.NODE_ENV === 'development') {
      jsonResponse.options = options;
    }

    return res.status(options.statusCode || 500).json(jsonResponse);
  } else {
    // Resposta HTML para navegadores
    const htmlContent = generateErrorHtml(errorType, options);
    const statusCode = options.statusCode || 500;

    res.status(statusCode);
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    return res.send(htmlContent);
  }
}

/**
 * Gera HTML para o tipo de erro especificado
 */
function generateErrorHtml(errorType, options = {}) {
  if (errorTypes[errorType]) {
    return errorTypes[errorType](options);
  }

  // Fallback para erro genérico
  return errorTypes.generic({
    message: options.message || 'Erro interno do servidor.'
  });
}

/**
 * Obtém mensagem padrão para tipo de erro
 */
function getErrorMessage(errorType) {
  const messages = {
    generic: 'Erro interno do servidor',
    confirmar: 'Inscrição não confirmada',
    desconectar: 'Desconectado por múltiplo acesso',
    expirar: 'Sessão expirada',
    sincronizar: 'Relógio não sincronizado',
    validar: 'Erro de validação',
    notFound: 'Página não encontrada',
    unauthorized: 'Acesso não autorizado',
    rateLimit: 'Limite de requisições excedido',
    serviceUnavailable: 'Serviço indisponível'
  };

  return messages[errorType] || messages.generic;
}

// ========================================
// SEÇÁO 4: MIDDLEWARES E HANDLERS
// ========================================

/**
 * Middleware para capturar erros específicos do Biblos360
 */
function errorHandler(err, req, res, next) {
  // Log do erro
  console.error('❌ Erro capturado pelo error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userAgent: req.get('User-Agent'),
    userId: req.biblos360Auth?.user?.data?.id,
    timestamp: new Date().toISOString()
  });

  // Se response já foi enviado, delega para o handler padrão do Express
  if (res.headersSent) {
    return next(err);
  }

  // Determinar tipo de erro baseado no erro ou status code
  let errorType = 'generic';
  let statusCode = err.statusCode || err.status || 500;
  let options = {
    statusCode,
    message: err.message
  };

  // Mapear tipos específicos de erro
  if (statusCode === 404) {
    errorType = 'notFound';
    options.path = req.originalUrl;
  } else if (statusCode === 401) {
    errorType = 'unauthorized';
  } else if (statusCode === 403) {
    errorType = 'unauthorized';
    options.message = 'Acesso negado';
  } else if (statusCode === 429) {
    errorType = 'rateLimit';
    options.retryAfter = err.retryAfter || 60;
  } else if (statusCode === 503) {
    errorType = 'serviceUnavailable';
  }

  // Verificar se é erro específico do Biblos360
  if (err.biblos360Type) {
    errorType = err.biblos360Type;
    options = { ...options, ...err.biblos360Options };
  }

  // Renderizar erro
  renderError(req, res, errorType, options);
}

/**
 * Handler para página 404
 */
function notFoundHandler(req, res) {
  renderError(req, res, 'notFound', {
    statusCode: 404,
    path: req.originalUrl
  });
}

/**
 * Cria erro específico do Biblos360
 */
function createBiblos360Error(type, options = {}) {
  const error = new Error(options.message || getErrorMessage(type));
  error.statusCode = options.statusCode || 500;
  error.biblos360Type = type;
  error.biblos360Options = options;
  return error;
}

// ========================================
// SEÇÁO 5: PÁGINAS DE SUCESSO
// ========================================

/**
 * Página de sucesso para pedido de oração
 */
function renderPedidoOracaoSucesso({ nome = '' } = {}) {
  const content = `
		<div class="mb30">
			<h2 style="color: #4CAF50; margin-bottom: 20px;">
				<i class="fas fa-check-circle" style="margin-right: 10px;"></i>
				Pedido de Oração Enviado com Sucesso!
			</h2>
		</div>

		<div class="mb20">
			<p>Olá${nome ? ` <strong>${nome}</strong>` : ''},</p>
			<p>Seu pedido de oração foi recebido com sucesso e será encaminhado para nossa equipe de intercessão.</p>
		</div>

		<div class="mb20">
			<p><strong>O que acontece agora?</strong></p>
			<ul style="text-align: left; margin-left: 20px;">
				<li>Seu pedido será tratado com total confidencialidade</li>
				<li>Nossa equipe de intercessão orará por você</li>
				<li>Se necessário, entraremos em contato pelo e-mail informado</li>
			</ul>
		</div>

		<div class="mb30">
			<p style="font-style: italic; color: #666;">
				"Confiem ao Senhor os seus caminhos; confiem nele, e ele agirá." - Salmos 37:5
			</p>
		</div>

		<div class="actions">
			<a href="/oracao/pedido.html" class="button button-primary">NOVO PEDIDO</a>
			<a href="javascript:window.close()" class="button">FECHAR</a>
		</div>
  `;

  return getBaseTemplate({
    title: 'Pedido de Oração Enviado',
    content
  });
}

// ========================================
// SEÇÁO 6: EXPORTS
// ========================================

module.exports = {
  // Funções principais
  renderError,
  generateErrorHtml,
  getErrorMessage,

  // Páginas de sucesso
  renderPedidoOracaoSucesso,

  // Middlewares
  errorHandler,
  notFoundHandler,

  // Utilitários
  createBiblos360Error,
  isJsonRequest,

  // Templates (para uso direto se necessário)
  errorTypes,
  getBaseTemplate,
  getSimpleErrorTemplate,

  // Tipos de erro disponíveis
  ERROR_TYPES: {
    GENERIC: 'generic',
    CONFIRMAR: 'confirmar',
    DESCONECTAR: 'desconectar',
    EXPIRAR: 'expirar',
    SINCRONIZAR: 'sincronizar',
    VALIDAR: 'validar',
    SAIR: 'sair',
    NOT_FOUND: 'notFound',
    UNAUTHORIZED: 'unauthorized',
    RATE_LIMIT: 'rateLimit',
    SERVICE_UNAVAILABLE: 'serviceUnavailable'
  }
};
