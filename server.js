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

    // Página inicial
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Servidor Boletim Web</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 50px auto;
                        padding: 20px;
                        background: #f5f5f5;
                    }
                    .container {
                        background: white;
                        padding: 30px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    h1 { color: #4F46E5; }
                    .status { color: #10B981; font-weight: bold; }
                    .endpoint { background: #f9fafb; padding: 10px; margin: 5px 0; border-radius: 4px; }
                    .method { color: #4F46E5; font-weight: bold; }
                    a { color: #4F46E5; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>✓ Servidor Boletim Web</h1>
                    <p class="status">Servidor rodando na porta 3000</p>
                    
                    <h2>Endpoints da API:</h2>
                    <div class="endpoint"><span class="method">POST</span> /api/save-boletim</div>
                    <div class="endpoint"><span class="method">GET</span> /api/check-boletim/:filename</div>
                    <div class="endpoint"><span class="method">GET</span> /api/load-boletim/:filename</div>
                    <div class="endpoint"><span class="method">GET</span> /api/list-boletins</div>
                    <div class="endpoint"><span class="method">DELETE</span> /api/delete-boletim/:filename</div>
                    
                    <h2>Como usar:</h2>
                    <p>Para acessar o painel administrativo, abra o arquivo <strong>admin.html</strong> diretamente no seu navegador.</p>
                    <p><strong>Opção 1:</strong> Vá até a pasta do projeto e clique duas vezes no arquivo <code>admin.html</code></p>
                    <p><strong>Opção 2:</strong> Copie e cole este caminho na barra de endereços do navegador:</p>
                    <div style="background: #f0f0f0; padding: 15px; border-radius: 4px; margin: 10px 0; font-family: monospace; word-break: break-all;">
                        file:///${__dirname.replace(/\\/g, '/')}/admin.html
                    </div>
                    <p><strong>Opção 3:</strong> Use o PowerShell para abrir automaticamente:</p>
                    <div style="background: #1e293b; color: #10B981; padding: 15px; border-radius: 4px; margin: 10px 0; font-family: monospace;">
                        Start-Process "${__dirname}\\admin.html"
                    </div>
                </div>
            </body>
            </html>
        `);
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
    console.log(`\n[INFO] Para usar o admin, abra: file:///${__dirname.replace(/\\/g, '/')}/admin.html\n`);
});
