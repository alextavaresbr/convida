const http = require('http');
const fs = require('fs');
const path = require('path');

// Railway (e a maioria dos PaaS) injeta a porta via variável de ambiente.
// Precisa escutar nela, senão o deploy falha no health check.
const PORT = process.env.PORT || 3000;

// SEED_DIR = boletins versionados no repositório (baseline que vem no deploy).
// DATA_DIR = onde os boletins são lidos/gravados em runtime.
//   - Em produção, aponte DATA_DIR para um Volume persistente do Railway
//     (ex.: DATA_DIR=/data com um volume montado em /data) para NÃO perder
//     boletins a cada deploy, já que o filesystem do container é efêmero.
//   - Localmente, sem a variável, continua usando a pasta ./data de sempre.
const SEED_DIR = path.join(__dirname, 'data');
const DATA_DIR = process.env.DATA_DIR || SEED_DIR;

// Criar pasta de dados se não existir
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Seed inicial: copia os boletins do repositório para o volume persistente
// APENAS quando ainda não existem lá. Nunca sobrescreve um boletim já salvo,
// então deploys futuros não apagam nem substituem o que você criou.
if (DATA_DIR !== SEED_DIR && fs.existsSync(SEED_DIR)) {
    for (const file of fs.readdirSync(SEED_DIR)) {
        if (!file.endsWith('.json')) continue;
        const dest = path.join(DATA_DIR, file);
        if (file === 'boletins.json') continue; // índice é recriado a partir dos dados
        if (!fs.existsSync(dest)) {
            fs.copyFileSync(path.join(SEED_DIR, file), dest);
            console.log(`[SEED] Boletim copiado para o volume: ${file}`);
        } else {
            console.log(`[SEED] Mantido (já existe no volume): ${file}`);
        }
    }
}

const BOLETINS_INDEX = path.join(DATA_DIR, 'boletins.json');

// Função para atualizar o índice boletins.json
function updateBoletinsIndex(filename) {
    // Extrair ano e mês do nome do arquivo (ex: boletim-2026-02.json)
    const match = filename.match(/^boletim-(\d{4})-(\d{2})\.json$/);
    if (!match) return;
    
    const year = match[1];
    const month = match[2];
    const key = `${year}-${month}`;
    
    let boletins = [];
    if (fs.existsSync(BOLETINS_INDEX)) {
        try {
            boletins = JSON.parse(fs.readFileSync(BOLETINS_INDEX, 'utf8'));
        } catch (e) {
            boletins = [];
        }
    }
    
    // Verificar se já existe
    const exists = boletins.some(b => b.key === key);
    if (!exists) {
        boletins.push({ key, year, month });
        // Ordenar por key (ano-mês)
        boletins.sort((a, b) => a.key.localeCompare(b.key));
        fs.writeFileSync(BOLETINS_INDEX, JSON.stringify(boletins, null, 2));
        console.log(`[INDEX] Adicionado ${key} ao boletins.json`);
    }
}

// Função para remover do índice boletins.json
function removeFromBoletinsIndex(filename) {
    const match = filename.match(/^boletim-(\d{4})-(\d{2})\.json$/);
    if (!match) return;
    
    const key = `${match[1]}-${match[2]}`;
    
    if (!fs.existsSync(BOLETINS_INDEX)) return;
    
    try {
        let boletins = JSON.parse(fs.readFileSync(BOLETINS_INDEX, 'utf8'));
        boletins = boletins.filter(b => b.key !== key);
        fs.writeFileSync(BOLETINS_INDEX, JSON.stringify(boletins, null, 2));
        console.log(`[INDEX] Removido ${key} do boletins.json`);
    } catch (e) {
        console.error('[ERRO] Erro ao atualizar índice:', e);
    }
}

// Reconstrói boletins.json a partir dos arquivos boletim-AAAA-MM.json existentes
// no DATA_DIR. Garante que o índice reflita o que realmente está salvo.
function rebuildBoletinsIndex() {
    const boletins = fs.readdirSync(DATA_DIR)
        .map(file => file.match(/^boletim-(\d{4})-(\d{2})\.json$/))
        .filter(Boolean)
        .map(m => ({ key: `${m[1]}-${m[2]}`, year: m[1], month: m[2] }))
        .sort((a, b) => a.key.localeCompare(b.key));
    fs.writeFileSync(BOLETINS_INDEX, JSON.stringify(boletins, null, 2));
    console.log(`[INDEX] boletins.json reconstruído com ${boletins.length} boletim(ns)`);
}
rebuildBoletinsIndex();

const server = http.createServer((req, res) => {
    // Log de requisições
    console.log(`[${req.method}] ${req.url}`);
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Página inicial - redirecionar para home.html
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(301, { 'Location': '/home.html' });
        res.end();
        return;
    }

    // Salvar boletim
    if (req.method === 'POST' && req.url === '/api/save-boletim') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const filename = data.filename;
                const content = data.content;
                
                if (!filename || !content) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Filename e content são obrigatórios' }));
                    return;
                }
                
                const filepath = path.join(DATA_DIR, filename);
                
                // LOG: Verificar dados de dízimos antes de salvar
                console.log('[DEBUG] Dados de dízimos recebidos:', JSON.stringify(content.dizimos, null, 2));
                
                fs.writeFileSync(filepath, JSON.stringify(content, null, 2));
                
                // Atualizar boletins.json automaticamente
                updateBoletinsIndex(filename);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Boletim salvo com sucesso!',
                    filepath: filepath
                }));
                
                console.log(`[SALVO] Boletim salvo: ${filepath}`);
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
                console.error('[ERRO] Erro ao salvar:', error);
            }
        });
        return;
    }

    // Verificar se boletim existe
    if (req.method === 'GET' && req.url.startsWith('/api/check-boletim/')) {
        const filename = req.url.replace('/api/check-boletim/', '');
        const filepath = path.join(DATA_DIR, filename);
        
        const exists = fs.existsSync(filepath);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ exists }));
        return;
    }

    // Carregar boletim
    if (req.method === 'GET' && req.url.startsWith('/api/load-boletim/')) {
        const filename = req.url.replace('/api/load-boletim/', '');
        const filepath = path.join(DATA_DIR, filename);
        
        if (fs.existsSync(filepath)) {
            const content = fs.readFileSync(filepath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(content);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Boletim não encontrado' }));
        }
        return;
    }

    // Listar boletins
    if (req.method === 'GET' && req.url === '/api/list-boletins') {
        const files = fs.readdirSync(DATA_DIR)
            .filter(file => file.endsWith('.json') && file.startsWith('boletim-'))
            .map(file => ({
                filename: file,
                path: path.join(DATA_DIR, file),
                modified: fs.statSync(path.join(DATA_DIR, file)).mtime
            }))
            .sort((a, b) => b.modified - a.modified);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(files));
        return;
    }

    // Deletar boletim
    if (req.method === 'DELETE' && req.url.startsWith('/api/delete-boletim/')) {
        const filename = req.url.replace('/api/delete-boletim/', '');
        const filepath = path.join(DATA_DIR, filename);
        
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            removeFromBoletinsIndex(filename);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: 'Boletim excluído com sucesso!' 
            }));
            console.log(`[EXCLUÍDO] Boletim excluído: ${filepath}`);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Boletim não encontrado' }));
        }
        return;
    }

    // Servir imagem da pastoral do boletim (converte base64 para imagem)
    if (req.method === 'GET' && req.url.startsWith('/api/boletim-image/')) {
        const filename = req.url.replace('/api/boletim-image/', '').split('?')[0];
        const filepath = path.join(DATA_DIR, filename + '.json');
        
        if (fs.existsSync(filepath)) {
            try {
                const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                const pastoralImg = content.capa?.pastoralImg;
                
                if (!pastoralImg) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Imagem da pastoral não encontrada' }));
                    return;
                }
                
                // Se for data URI base64, extrair e servir
                if (pastoralImg.startsWith('data:')) {
                    const matches = pastoralImg.match(/^data:([^;]+);base64,(.+)$/);
                    if (matches) {
                        const mimeType = matches[1];
                        const base64Data = matches[2];
                        const imageBuffer = Buffer.from(base64Data, 'base64');
                        
                        res.writeHead(200, { 
                            'Content-Type': mimeType,
                            'Content-Length': imageBuffer.length,
                            'Cache-Control': 'public, max-age=31536000'
                        });
                        res.end(imageBuffer);
                        console.log(`[IMAGEM] Servindo imagem da pastoral: ${filename}`);
                    } else {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Formato de imagem inválido' }));
                    }
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Imagem não está em formato base64' }));
                }
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
                console.error('[ERRO] Erro ao servir imagem:', error);
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Boletim não encontrado' }));
        }
        return;
    }

    // Servir arquivos estáticos (HTML, CSS, JS, imagens)
    // Remover query string da URL
    const urlPath = req.url.split('?')[0];
    const filePath = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Verificar se arquivo existe
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Erro ao ler arquivo');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    } else {
        // Rota não encontrada
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Rota não encontrada' }));
    }
});

// Encerramento limpo quando o Railway reinicia/para o container (SIGTERM).
// Sai com código 0 para não ser interpretado como crash (evita loop de restart).
function shutdown(signal) {
    console.log(`\n[SHUTDOWN] Recebido ${signal}, encerrando servidor...`);
    server.close(() => {
        console.log('[SHUTDOWN] Servidor encerrado com sucesso.');
        process.exit(0);
    });
    // Garante saída mesmo se alguma conexão travar
    setTimeout(() => process.exit(0), 5000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n[SERVIDOR] Rodando na porta ${PORT}`);
    console.log(`[DADOS] Salvando boletins em: ${DATA_DIR}`);
    console.log(`\n[ENDPOINTS] Disponíveis:`);
    console.log(`   POST   /api/save-boletim      - Salvar boletim`);
    console.log(`   GET    /api/check-boletim/:filename - Verificar se existe`);
    console.log(`   GET    /api/load-boletim/:filename  - Carregar boletim`);
    console.log(`   GET    /api/list-boletins     - Listar todos`);
    console.log(`   DELETE /api/delete-boletim/:filename - Excluir boletim`);
    console.log(`   GET    /api/boletim-image/:filename  - Servir imagem da pastoral`);
    console.log(`\n[INFO] Para usar o admin, abra: file:///${__dirname.replace(/\\/g, '/')}/admin.html\n`);
});
