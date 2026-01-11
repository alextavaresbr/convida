# Como Iniciar o Servidor

## Requisitos
- Node.js instalado (https://nodejs.org/)

## Passos

### 1. Instalar Node.js (se não tiver)
Baixe e instale de: https://nodejs.org/

### 2. Iniciar o Servidor

**Windows (PowerShell ou CMD):**
```bash
cd "c:\Users\alexa\Área de Trabalho\boletim web"
node server.js
```

**Ou simplesmente clique duplo em `INICIAR-SERVIDOR.bat`**

### 3. Abrir o Admin
Após iniciar o servidor, abra:
```
file:///c:/Users/alexa/Área%20de%20Trabalho/boletim%20web/admin.html
```

## O que o servidor faz?

- ✅ Salva automaticamente os boletins na pasta `data/` do projeto
- ✅ Verifica se já existe um boletim para o mês antes de salvar
- ✅ Carrega boletins salvos anteriormente
- ✅ Lista todos os boletins disponíveis

## Endpoints da API

- `POST /api/save-boletim` - Salva um novo boletim
- `GET /api/check-boletim/:filename` - Verifica se um boletim existe
- `GET /api/load-boletim/:filename` - Carrega um boletim
- `GET /api/list-boletins` - Lista todos os boletins

## Sem Servidor?

Se o servidor não estiver rodando, o sistema automaticamente fará o download do JSON (comportamento anterior). Você pode então fazer upload manual para a pasta `data/`.

Para desativar completamente a tentativa de usar o servidor, edite `admin.js` e mude:
```javascript
const USE_SERVER = false;
```

## Porta

O servidor roda na porta **3000**. Se precisar mudar, edite `server.js`:
```javascript
const PORT = 3000;
```
