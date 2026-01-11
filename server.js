const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Criar pasta data se não existir
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

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

server.listen(PORT, () => {
    console.log(`\n[SERVIDOR] Rodando em http://localhost:${PORT}`);
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
