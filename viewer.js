// Meses do ano
const meses = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Dados do boletim
let boletimData = null;

// Controle de tamanho de fonte
const fontSizes = ['font-normal', 'font-large', 'font-huge', 'font-extra-huge'];
let currentFontIndex = 0; // Começa no normal

function updateFontSize(delta) {
    const pastoralTextos = document.querySelectorAll('.pastoral-texto');
    if (pastoralTextos.length === 0) return;
    
    // Remover classe atual
    pastoralTextos.forEach(texto => {
        fontSizes.forEach(size => texto.classList.remove(size));
    });
    
    // Atualizar índice
    currentFontIndex = Math.max(0, Math.min(fontSizes.length - 1, currentFontIndex + delta));
    
    // Adicionar nova classe
    pastoralTextos.forEach(texto => {
        texto.classList.add(fontSizes[currentFontIndex]);
    });
    
    // Salvar preferência
    localStorage.setItem('viewer-font-size', currentFontIndex);
}

function loadFontPreference() {
    const saved = localStorage.getItem('viewer-font-size');
    if (saved !== null) {
        currentFontIndex = parseInt(saved);
        const pastoralTextos = document.querySelectorAll('.pastoral-texto');
        pastoralTextos.forEach(texto => {
            texto.classList.add(fontSizes[currentFontIndex]);
        });
    }
}

// Função para converter cor hex em filtro CSS para SVG
function getSVGColorFilter(hexColor) {
    // Mapeamento direto de cores para filtros CSS otimizados
    const colorFilters = {
        '#6169ab': 'invert(38%) sepia(26%) saturate(1458%) hue-rotate(202deg) brightness(92%) contrast(87%)',
        '#ffbd53': 'invert(78%) sepia(76%) saturate(676%) hue-rotate(336deg) brightness(102%) contrast(101%)',
        '#ba244a': 'invert(16%) sepia(85%) saturate(2543%) hue-rotate(334deg) brightness(86%) contrast(92%)',
        '#88b04b': 'invert(62%) sepia(21%) saturate(920%) hue-rotate(48deg) brightness(91%) contrast(83%)',
        '#000000': 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)'
    };
    
    return colorFilters[hexColor] || colorFilters['#6169ab']; // Default azul
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadBoletim();
    
    // Botão de imprimir
    document.getElementById('print-btn').addEventListener('click', function() {
        window.print();
    });
    
    // Botões de controle de fonte
    document.getElementById('font-increase-btn').addEventListener('click', function() {
        updateFontSize(1);
    });
    
    document.getElementById('font-decrease-btn').addEventListener('click', function() {
        updateFontSize(-1);
    });
});

async function loadBoletim() {
    // Pegar parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const year = urlParams.get('year');
    const month = urlParams.get('month');
    
    // Ou tentar carregar do preview
    const previewData = localStorage.getItem('preview-data');
    
    if (previewData) {
        // Modo preview
        boletimData = JSON.parse(previewData);
        localStorage.removeItem('preview-data');
        renderBoletim();
    } else if (year && month) {
        // Carregar do servidor primeiro, depois tentar arquivo local
        const filename = `boletim-${year}-${month}.json`;
        
        try {
            // Tentar servidor primeiro
            const serverResponse = await fetch(`http://localhost:3000/api/load-boletim/${filename}`);
            if (serverResponse.ok) {
                boletimData = await serverResponse.json();
                renderBoletim();
                return;
            }
        } catch (serverError) {
            console.log('Servidor não disponível, tentando arquivo local...');
        }
        
        // Fallback: tentar arquivo local
        try {
            const response = await fetch(`data/${filename}`);
            if (response.ok) {
                boletimData = await response.json();
                renderBoletim();
            } else {
                showError('Boletim não encontrado. Certifique-se de que o servidor está rodando (npm start)');
            }
        } catch (error) {
            showError('Erro ao carregar boletim. Inicie o servidor com "npm start" e tente novamente.');
        }
    } else {
        showError('Parâmetros inválidos');
    }
}

function renderBoletim() {
    if (!boletimData) {
        showError('Dados do boletim não disponíveis');
        return;
    }
    
    // Atualizar título da página e meta tags
    const mesNome = meses[parseInt(boletimData.capa.mes)];
    const tituloCompleto = `Boletim IMVC - ${mesNome} de ${boletimData.capa.ano}`;
    const descricao = `${boletimData.capa.pastoralTitulo || 'Igreja Metodista em Vila Conde do Pinhal'}`;
    
    document.title = tituloCompleto;
    
    // Atualizar Open Graph
    document.getElementById('og-title').setAttribute('content', tituloCompleto);
    document.getElementById('og-description').setAttribute('content', descricao);
    document.getElementById('og-url').setAttribute('content', window.location.href);
    
    // Atualizar imagem do Open Graph com a imagem da capa da pastoral
    if (boletimData.capa.pastoralImg) {
        let imagemUrl;
        
        // Se a imagem for base64, usar o endpoint do servidor para convertê-la em URL pública
        if (boletimData.capa.pastoralImg.startsWith('data:')) {
            // Extrair mes e ano para formar o nome do arquivo
            const mes = String(boletimData.capa.mes).padStart(2, '0');
            const ano = boletimData.capa.ano;
            const filename = `boletim-${ano}-${mes}`;
            
            // Usar URL do servidor (assumindo que está rodando em localhost:3000)
            // Para produção, isso deve ser a URL pública do servidor
            const serverUrl = window.location.protocol === 'file:' 
                ? 'http://localhost:3000' 
                : window.location.origin;
            imagemUrl = `${serverUrl}/api/boletim-image/${filename}`;
        } else {
            // Se for URL relativa, converter para URL absoluta
            imagemUrl = new URL(boletimData.capa.pastoralImg, window.location.href).href;
        }
        
        document.getElementById('og-image').setAttribute('content', imagemUrl);
        
        // Adicionar meta tag para dimensões da imagem (opcional, mas recomendado)
        let ogImageWidth = document.getElementById('og-image-width');
        if (!ogImageWidth) {
            ogImageWidth = document.createElement('meta');
            ogImageWidth.id = 'og-image-width';
            ogImageWidth.setAttribute('property', 'og:image:width');
            document.head.appendChild(ogImageWidth);
        }
        ogImageWidth.setAttribute('content', '1200');
        
        let ogImageHeight = document.getElementById('og-image-height');
        if (!ogImageHeight) {
            ogImageHeight = document.createElement('meta');
            ogImageHeight.id = 'og-image-height';
            ogImageHeight.setAttribute('property', 'og:image:height');
            document.head.appendChild(ogImageHeight);
        }
        ogImageHeight.setAttribute('content', '630');
    }
    
    // Atualizar Twitter Card
    document.getElementById('twitter-title').setAttribute('content', tituloCompleto);
    document.getElementById('twitter-description').setAttribute('content', descricao);
    
    // Atualizar imagem do Twitter Card também
    if (boletimData.capa.pastoralImg) {
        let imagemUrl;
        
        // Se a imagem for base64, usar o endpoint do servidor
        if (boletimData.capa.pastoralImg.startsWith('data:')) {
            const mes = String(boletimData.capa.mes).padStart(2, '0');
            const ano = boletimData.capa.ano;
            const filename = `boletim-${ano}-${mes}`;
            
            const serverUrl = window.location.protocol === 'file:' 
                ? 'http://localhost:3000' 
                : window.location.origin;
            imagemUrl = `${serverUrl}/api/boletim-image/${filename}`;
        } else {
            imagemUrl = new URL(boletimData.capa.pastoralImg, window.location.href).href;
        }
        
        let twitterImage = document.getElementById('twitter-image');
        if (!twitterImage) {
            twitterImage = document.createElement('meta');
            twitterImage.id = 'twitter-image';
            twitterImage.setAttribute('name', 'twitter:image');
            document.head.appendChild(twitterImage);
        }
        twitterImage.setAttribute('content', imagemUrl);
    }
    
    console.log('Renderizando boletim com dados:', boletimData);
    console.log('Verificando imagens da capa:', {
        pastoralImg: boletimData.capa?.pastoralImg ? 'OK (' + boletimData.capa.pastoralImg.substring(0, 50) + '...)' : 'VAZIO',
        logo1: boletimData.capa?.logo1 ? 'OK (' + boletimData.capa.logo1.substring(0, 50) + '...)' : 'VAZIO',
        logo2: boletimData.capa?.logo2 ? 'OK (' + boletimData.capa.logo2.substring(0, 50) + '...)' : 'VAZIO'
    });
    
    const wrapper = document.getElementById('boletim-wrapper');
    wrapper.innerHTML = '';
    
    // Atualizar título (removido do header)
    // const mesNome = meses[parseInt(boletimData.capa.mes)];
    // document.getElementById('boletim-title').textContent = 
    //     `Boletim - ${mesNome} ${boletimData.capa.ano}`;
    
    // Gerar páginas
    wrapper.appendChild(renderCapa());
    wrapper.appendChild(renderPastoral());
    
    if (boletimData.equipe.length > 0) {
        wrapper.appendChild(renderEquipe());
    }
    
    wrapper.appendChild(renderEscalas());
    
    if (boletimData.aniversariantes.lista.length > 0) {
        wrapper.appendChild(renderAniversariantes());
    }
    
    if (boletimData.avisos.trim()) {
        wrapper.appendChild(renderAvisos());
    }
    
    if (boletimData.agenda.eventos.length > 0) {
        wrapper.appendChild(renderAgenda());
    }
    
    if (boletimData.programacao.length > 0) {
        wrapper.appendChild(renderProgramacao());
    }
    
    if (boletimData.dizimos.banco || boletimData.dizimos.pix) {
        wrapper.appendChild(renderDizimos());
    }
    
    if (boletimData.endereco.trim()) {
        wrapper.appendChild(renderEndereco());
    }
    
    if (boletimData.anuncios.trim()) {
        wrapper.appendChild(renderAnuncios());
    }
    
    // Inicializar todos os ícones Lucide após renderizar todas as páginas
    lucide.createIcons();
    
    // Carregar preferência de tamanho de fonte
    setTimeout(loadFontPreference, 100);
}

function renderCapa() {
    // Criar um container wrapper para o logo e a página
    const wrapper = document.createElement('div');
    wrapper.className = 'capa-wrapper';
    
    // Container do logo FORA da page-capa
    const logoContainer = document.createElement('div');
    logoContainer.className = 'capa-logo-container';
    
    // Logo "convida"
    const logoConvida = document.createElement('img');
    logoConvida.src = 'img/nome-boletim.svg';
    logoConvida.className = 'logo-convida';
    
    // Aplicar cor do logo se especificada
    if (boletimData.capa.logoColor) {
        logoConvida.style.filter = getSVGColorFilter(boletimData.capa.logoColor);
    }
    
    logoContainer.appendChild(logoConvida);
    
    // Data sobreposta no logo
    const dataOverlay = document.createElement('div');
    dataOverlay.className = 'capa-data-overlay';
    const mesNomeLower = meses[parseInt(boletimData.capa.mes)].toLowerCase();
    dataOverlay.textContent = `${mesNomeLower} de ${boletimData.capa.ano}`;
    logoContainer.appendChild(dataOverlay);
    
    wrapper.appendChild(logoContainer);
    
    // Agora a página normal
    const page = document.createElement('div');
    page.className = 'boletim-page page-capa';
    
    const mesNome = meses[parseInt(boletimData.capa.mes)].toUpperCase();
    
    // === HEADER com faixa ===
    const header = document.createElement('div');
    header.className = 'capa-header';
    
    // Faixa preta com informações (sem data)
    const faixaMes = document.createElement('div');
    faixaMes.className = 'capa-faixa-mes';
    faixaMes.textContent = `Boletim ${boletimData.capa.igreja} | Nº ${boletimData.capa.numero}`;
    header.appendChild(faixaMes);
    
    page.appendChild(header);
    
    // === IMAGEM PASTORAL ===
    if (boletimData.capa.pastoralImg) {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'capa-pastoral-img-container';
        
        const imgPastoral = document.createElement('img');
        imgPastoral.className = 'capa-pastoral-img';
        imgPastoral.alt = 'Ilustração Pastoral';
        imgPastoral.setAttribute('src', boletimData.capa.pastoralImg);
        
        imgContainer.appendChild(imgPastoral);
        page.appendChild(imgContainer);
    }
    
    // === FOOTER ===
    const footer = document.createElement('div');
    footer.className = 'capa-footer';
    
    // Logos institucionais
    const logos = document.createElement('div');
    logos.className = 'capa-logos';
    
    if (boletimData.capa.logo1) {
        const logo1 = document.createElement('img');
        logo1.className = 'capa-logo';
        logo1.setAttribute('src', boletimData.capa.logo1);
        logos.appendChild(logo1);
    }
    
    if (boletimData.capa.logo2) {
        const logo2 = document.createElement('img');
        logo2.className = 'capa-logo';
        logo2.setAttribute('src', boletimData.capa.logo2);
        logos.appendChild(logo2);
    }
    
    footer.appendChild(logos);
    
    // Social (ícones Lucide)
    const social = document.createElement('div');
    social.className = 'capa-social';
    
    console.log('URLs das redes sociais:', boletimData.capa.social);
    
    // Criar links dinamicamente para evitar problemas com caracteres especiais
    if (boletimData.capa.social.youtube) {
        const a = document.createElement('a');
        a.href = boletimData.capa.social.youtube;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.title = 'YouTube';
        a.innerHTML = '<i data-lucide="youtube" style="width: 28px; height: 28px;"></i>';
        social.appendChild(a);
    }
    if (boletimData.capa.social.facebook) {
        const a = document.createElement('a');
        a.href = boletimData.capa.social.facebook;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.title = 'Facebook';
        a.innerHTML = '<i data-lucide="facebook" style="width: 28px; height: 28px;"></i>';
        social.appendChild(a);
    }
    if (boletimData.capa.social.instagram) {
        const a = document.createElement('a');
        a.href = boletimData.capa.social.instagram;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.title = 'Instagram';
        a.innerHTML = '<i data-lucide="instagram" style="width: 28px; height: 28px;"></i>';
        social.appendChild(a);
    }
    if (boletimData.capa.social.whatsapp) {
        const a = document.createElement('a');
        a.href = boletimData.capa.social.whatsapp;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.title = 'WhatsApp';
        a.innerHTML = '<i data-lucide="message-circle" style="width: 28px; height: 28px;"></i>';
        social.appendChild(a);
    }
    
    footer.appendChild(social);
    page.appendChild(footer);
    
    // Adicionar page ao wrapper
    wrapper.appendChild(page);
    
    // Inicializar ícones Lucide após criar o conteúdo
    setTimeout(() => lucide.createIcons(), 0);
    
    return wrapper;
}

function renderPastoral() {
    const page = document.createElement('div');
    page.className = 'boletim-page page-pastoral';
    
    // Ícone pastoral
    const icone = document.createElement('img');
    icone.src = 'img/pastoral.svg';
    icone.className = 'section-icon';
    page.appendChild(icone);
    
    page.innerHTML += `
        <div class="pastoral-header">
            <h1>PASTORAL</h1>
            <div class="pastoral-titulo">${boletimData.capa.pastoralTitulo}</div>
        </div>
        
        <div class="pastoral-versiculo">
            <div class="leia">Leia: ${boletimData.pastoral.referencia || ''}</div>
        </div>
        
        <div class="pastoral-texto">
            ${boletimData.pastoral.texto}
        </div>
    `;
    
    return page;
}

function renderEscalas() {
    const page = document.createElement('div');
    page.className = 'boletim-page page-escalas';
    
    let html = '<h1><i data-lucide="calendar-check"></i>ESCALAS</h1>';
    
    // Culto Matutino
    if (boletimData.escalas.matutino.linhas.length > 0) {
        html += `
            <div class="escalas-section">
                <h3>CULTO MATUTINO ${boletimData.escalas.matutino.horario ? '- ' + boletimData.escalas.matutino.horario : ''}</h3>
                <table class="escalas-table">
        `;
        
        boletimData.escalas.matutino.linhas.forEach(linha => {
            if (linha.dia) {
                html += `
                    <tr>
                        <td>${linha.dia}</td>
                        <td>${linha.pl || ''}</td>
                        <td>${linha.desc || ''}</td>
                    </tr>
                `;
            }
        });
        
        html += `
                </table>
                <div class="escalas-legenda">* P: Palavra | L: Liturgia | P/L: Palavra e Liturgia</div>
            </div>
        `;
    }
    
    // Diaconia e EBD Adultos lado a lado
    if (boletimData.escalas.diaconia.length > 0 || boletimData.escalas.ebdAdultos.length > 0) {
        html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">';
        
        if (boletimData.escalas.diaconia.length > 0) {
            html += `
                <div class="escalas-section">
                    <h3>DIACONIA</h3>
                    <h3>Culto Matutino</h3>
                    <table class="escalas-table">
            `;
            
            boletimData.escalas.diaconia.forEach(linha => {
                if (linha.data) {
                    html += `
                        <tr>
                            <td>${linha.data}</td>
                            <td>${linha.resp || ''}</td>
                        </tr>
                    `;
                }
            });
            
            html += '</table></div>';
        }
        
        if (boletimData.escalas.ebdAdultos.length > 0) {
            html += `
                <div class="escalas-section">
                    <h3>ESCOLA DOMINICAL</h3>
                    <h3>Adultos</h3>
                    <table class="escalas-table">
            `;
            
            boletimData.escalas.ebdAdultos.forEach(linha => {
                if (linha.data) {
                    html += `
                        <tr>
                            <td>${linha.data}</td>
                            <td>${linha.resp || ''}</td>
                        </tr>
                    `;
                }
            });
            
            html += '</table></div>';
        }
        
        html += '</div>';
    }
    
    // Rede Kids
    if (boletimData.escalas.kids.length > 0) {
        html += `
            <div class="escalas-section">
                <h3>REDE KIDS</h3>
                <table class="escalas-table">
                    <thead>
                        <tr>
                            <td><strong>Data</strong></td>
                            <td><strong>EBD</strong></td>
                            <td><strong>Culto</strong></td>
                            <td><strong>Apoio</strong></td>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        boletimData.escalas.kids.forEach(linha => {
            if (linha.data) {
                html += `
                    <tr>
                        <td>${linha.data}</td>
                        <td>${linha.ebd || ''}</td>
                        <td>${linha.culto || ''}</td>
                        <td>${linha.apoio || ''}</td>
                    </tr>
                `;
            }
        });
        
        html += '</tbody></table></div>';
    }
    
    // EBD Quartas e Estudo Bíblico
    if (boletimData.escalas.ebdQuartas.linhas.length > 0 || boletimData.escalas.estudo.length > 0) {
        html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">';
        
        if (boletimData.escalas.ebdQuartas.linhas.length > 0) {
            html += `
                <div class="escalas-section">
                    <h3>REUNIÃO DE ORAÇÃO</h3>
                    <h3>${boletimData.escalas.ebdQuartas.horario || 'Quartas, 20h'}</h3>
                    <table class="escalas-table">
            `;
            
            boletimData.escalas.ebdQuartas.linhas.forEach(linha => {
                if (linha.data) {
                    html += `
                        <tr>
                            <td>${linha.data}</td>
                            <td>${linha.resp || ''}</td>
                        </tr>
                    `;
                }
            });
            
            html += '</table></div>';
        }
        
        if (boletimData.escalas.estudo.length > 0) {
            html += `
                <div class="escalas-section">
                    <h3>ESTUDO BÍBLICO</h3>
                    <h3>Quintas, 20h</h3>
                    <table class="escalas-table">
            `;
            
            boletimData.escalas.estudo.forEach(linha => {
                if (linha.data) {
                    html += `
                        <tr>
                            <td>${linha.data}</td>
                            <td>${linha.resp || ''}</td>
                        </tr>
                    `;
                }
            });
            
            html += '</table></div>';
        }
        
        html += '</div>';
    }
    
    page.innerHTML = html;
    return page;
}

function renderAniversariantes() {
    const page = document.createElement('div');
    page.className = 'boletim-page page-aniversariantes';
    
    // Header
    const header = document.createElement('div');
    header.className = 'aniv-header';
    
    const h1 = document.createElement('h1');
    h1.innerHTML = '<i data-lucide="cake"></i>ANIVERSARIANTES!';
    header.appendChild(h1);
    
    if (boletimData.aniversariantes.versiculo) {
        const versiculo = document.createElement('div');
        versiculo.className = 'aniv-versiculo';
        versiculo.innerHTML = `"${boletimData.aniversariantes.versiculo}"`;
        header.appendChild(versiculo);
    }
    
    page.appendChild(header);
    
    // Lista em duas colunas
    const lista = document.createElement('div');
    lista.className = 'aniv-lista';
    
    boletimData.aniversariantes.lista.forEach(aniv => {
        if (aniv.data && aniv.nome) {
            const item = document.createElement('div');
            item.className = 'aniv-item';
            item.innerHTML = `<strong>${aniv.data}</strong> ${aniv.nome}`;
            lista.appendChild(item);
        }
    });
    
    page.appendChild(lista);
    
    return page;
}

function renderAgenda() {
    const page = document.createElement('div');
    page.className = 'boletim-page page-agenda';
    
    // Header
    const header = document.createElement('div');
    header.className = 'agenda-header';
    const h1 = document.createElement('h1');
    h1.innerHTML = '<i data-lucide="calendar-days"></i>AGENDA DO MÊS';
    header.appendChild(h1);
    page.appendChild(header);
    
    // Inicializar ícones Lucide
    lucide.createIcons();
    
    // Lista de eventos
    const lista = document.createElement('div');
    lista.className = 'agenda-lista';
    
    boletimData.agenda.eventos.forEach(evento => {
        if (evento.data && evento.titulo) {
            const item = document.createElement('div');
            item.className = 'agenda-item';
            if (evento.destaque) {
                item.classList.add('item-destaque');
            }
            
            // Container flex para todo conteúdo à esquerda e hora à direita
            const topRow = document.createElement('div');
            topRow.className = 'agenda-top-row';
            
            const leftContent = document.createElement('div');
            leftContent.className = 'agenda-left-content';
            
            const data = document.createElement('div');
            data.className = 'agenda-data';
            const alertIcon = evento.destaque ? '<i data-lucide="alert-triangle" class="alert-icon"></i>' : '';
            data.innerHTML = `${alertIcon}${evento.data}`;
            leftContent.appendChild(data);
            
            const titulo = document.createElement('div');
            titulo.className = 'agenda-titulo';
            titulo.textContent = evento.titulo;
            leftContent.appendChild(titulo);
            
            if (evento.desc) {
                // Espaço vazio para alinhar com a data
                const emptyCell = document.createElement('div');
                leftContent.appendChild(emptyCell);
                
                const desc = document.createElement('div');
                desc.className = 'agenda-descricao';
                desc.textContent = evento.desc;
                leftContent.appendChild(desc);
            }
            
            topRow.appendChild(leftContent);
            
            if (evento.hora) {
                const hora = document.createElement('div');
                hora.className = 'agenda-hora';
                hora.textContent = evento.hora;
                topRow.appendChild(hora);
            }
            
            item.appendChild(topRow);
            
            lista.appendChild(item);
        }
    });
    
    page.appendChild(lista);
    
    return page;
}

function renderAvisos() {
    const page = document.createElement('div');
    page.className = 'boletim-page generic-page';
    
    page.innerHTML = `
        <h1><i data-lucide="bell"></i>AVISOS</h1>
        <div class="generic-content">
            ${boletimData.avisos}
        </div>
    `;
    
    return page;
}

function renderEndereco() {
    const page = document.createElement('div');
    page.className = 'boletim-page generic-page';
    
    page.innerHTML = `
        <h1><i data-lucide="map-pin"></i>ENDEREÇO</h1>
        <div class="generic-content">
            ${boletimData.endereco}
        </div>
    `;
    
    return page;
}

function renderEquipe() {
    const page = document.createElement('div');
    page.className = 'boletim-page generic-page';
    
    let html = `
        <h1><i data-lucide="users"></i>EQUIPE PASTORAL</h1>
        <div class="generic-content">
            <table class="escalas-table equipe-table">
    `;
    
    boletimData.equipe.forEach(membro => {
        if (membro.nome) {
            html += `
                <tr>
                    <td class="equipe-cargo"><strong>${membro.cargo || ''}</strong></td>
                    <td class="equipe-nome">${membro.nome}</td>
                </tr>
            `;
        }
    });
    
    html += '</table></div>';
    page.innerHTML = html;
    
    return page;
}

function renderProgramacao() {
    const page = document.createElement('div');
    page.className = 'boletim-page generic-page';
    
    let html = `
        <h1><i data-lucide="clock"></i>PROGRAMAÇÃO SEMANAL</h1>
        <div class="generic-content">
            <table class="escalas-table programacao-table">
    `;
    
    boletimData.programacao.forEach(ativ => {
        if (ativ.atividade) {
            const destaqueClass = ativ.destaque ? ' class="item-destaque"' : '';
            const alertIcon = ativ.destaque ? '<i data-lucide="alert-triangle" class="alert-icon"></i>' : '';
            html += `
                <tr${destaqueClass}>
                    <td>${alertIcon}${ativ.atividade}</td>
                    <td>${ativ.horario || ''}</td>
                </tr>
            `;
        }
    });
    
    html += '</table></div>';
    page.innerHTML = html;
    
    return page;
}

function renderDizimos() {
    const page = document.createElement('div');
    page.className = 'boletim-page generic-page';
    
    const header = document.createElement('h1');
    header.innerHTML = '<i data-lucide="heart-handshake"></i>DÍZIMOS E OFERTAS';
    page.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'generic-content dizimos-section';
    
    // Container principal com cards
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'dizimos-cards-container';
    
    // Card de Dados Bancários
    const hasBankData = boletimData.dizimos.banco || boletimData.dizimos.agencia || boletimData.dizimos.conta;
    if (hasBankData) {
        const bankCard = document.createElement('div');
        bankCard.className = 'dizimos-card';
        
        const bankTitle = document.createElement('div');
        bankTitle.className = 'dizimos-card-title';
        bankTitle.innerHTML = '<i data-lucide="building-2"></i> Transferência Bancária';
        bankCard.appendChild(bankTitle);
        
        const bankInfo = document.createElement('div');
        bankInfo.className = 'dizimos-card-content';
        
        if (boletimData.dizimos.banco) {
            const bancoDiv = document.createElement('div');
            bancoDiv.className = 'dizimos-info-row';
            bancoDiv.innerHTML = `<span class="dizimos-label">Banco</span><span class="dizimos-value">${boletimData.dizimos.banco}</span>`;
            bankInfo.appendChild(bancoDiv);
        }
        
        if (boletimData.dizimos.agencia) {
            const agenciaDiv = document.createElement('div');
            agenciaDiv.className = 'dizimos-info-row';
            agenciaDiv.innerHTML = `<span class="dizimos-label">Agência</span><span class="dizimos-value">${boletimData.dizimos.agencia}</span>`;
            bankInfo.appendChild(agenciaDiv);
        }
        
        if (boletimData.dizimos.conta) {
            const contaDiv = document.createElement('div');
            contaDiv.className = 'dizimos-info-row';
            contaDiv.innerHTML = `<span class="dizimos-label">Conta Corrente</span><span class="dizimos-value">${boletimData.dizimos.conta}</span>`;
            bankInfo.appendChild(contaDiv);
        }
        
        bankCard.appendChild(bankInfo);
        cardsContainer.appendChild(bankCard);
    }
    
    // Card de PIX
    if (boletimData.dizimos.pix) {
        const pixCard = document.createElement('div');
        pixCard.className = 'dizimos-card dizimos-card-pix';
        
        const pixTitle = document.createElement('div');
        pixTitle.className = 'dizimos-card-title';
        pixTitle.innerHTML = '<i data-lucide="smartphone"></i> PIX';
        pixCard.appendChild(pixTitle);
        
        const pixInfo = document.createElement('div');
        pixInfo.className = 'dizimos-card-content';
        
        const pixValue = document.createElement('div');
        pixValue.className = 'dizimos-pix-value';
        pixValue.textContent = boletimData.dizimos.pix;
        pixInfo.appendChild(pixValue);
        
        // QR Code PIX
        const qrImg = document.createElement('img');
        qrImg.setAttribute('src', 'img/qr.png');
        qrImg.className = 'dizimos-qr-code';
        qrImg.alt = 'QR Code PIX';
        pixInfo.appendChild(qrImg);
        
        pixCard.appendChild(pixInfo);
        cardsContainer.appendChild(pixCard);
    }
    
    content.appendChild(cardsContainer);
    page.appendChild(content);
    return page;
}

function renderAnuncios() {
    const page = document.createElement('div');
    page.className = 'boletim-page generic-page';
    
    page.innerHTML = `
        <h1><i data-lucide="file-text"></i>EXPEDIENTE</h1>
        <div class="generic-content">
            ${boletimData.anuncios}
        </div>
    `;
    
    return page;
}

function showError(message) {
    const wrapper = document.getElementById('boletim-wrapper');
    wrapper.innerHTML = `
        <div style="padding: 60px 20px; text-align: center; color: #dc2626;">
            <h2>Erro</h2>
            <p>${message}</p>
            <a href="home.html" style="color: #2563eb; margin-top: 20px; display: inline-block;">Voltar para Home</a>
        </div>
    `;
}

// Botão de compartilhar
const shareBtn = document.getElementById('share-btn');
if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
        const url = window.location.href;
        const title = 'Boletim da Igreja Metodista em Vila Conde';
        
        // Verificar se o navegador suporta Web Share API
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    url: url
                });
            } catch (err) {
                console.log('Compartilhamento cancelado');
            }
        } else {
            // Fallback: copiar link para clipboard
            try {
                await navigator.clipboard.writeText(url);
                alert('Link copiado para a área de transferência!');
            } catch (err) {
                console.error('Erro ao copiar link:', err);
            }
        }
    });
}
