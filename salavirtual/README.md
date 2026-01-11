# 🎯 Sala Virtual - Sistema Modular

> Sistema de sala virtual com arquitetura modular, Socket.IO em tempo real e interface responsiva

## 📋 Sobre o Projeto

Sistema completo de sala virtual desenvolvido com Node.js, Express e Socket.IO, oferecindo:

- 🎥 **Live Streaming** - Suporte para YouTube, Vimeo e Jitsi Meet
- 💬 **Chat em Tempo Real** - Mensagens instantâneas com Socket.IO  
- 👥 **Gestão de Participantes** - Lista dinâmica de usuários online
- 🎮 **Painel Administrativo** - Controle completo da sala
- 📱 **Design Responsivo** - Otimizado para desktop e mobile
- 🔐 **Sistema de Autenticação** - Login seguro e sessões
- 🎯 **Sistema de Fórum** - Discussões organizadas por tópicos

## 🚀 Deploy Rápido

### Railway (Recomendado)

1. **Fork este repositório** para sua conta GitHub
2. **Conecte ao Railway**: https://railway.app/new
3. **Configure as variáveis de ambiente**:
   ```bash
   NODE_ENV=production
   SESSION_SECRET=sua_chave_secreta_aqui
   JWT_SECRET=sua_chave_jwt_aqui
   SUPABASE_URL=sua_url_supabase
   SUPABASE_KEY=sua_chave_supabase
   ```
4. **Deploy automático** - Railway fará o deploy automaticamente

### URL de Produção
Após o deploy, sua aplicação estará disponível em:
`https://salavirtual-production.up.railway.app`

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/alextavaresbr/salavirtual.git
cd salavirtual

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
npm start        # Produção
npm run dev      # Desenvolvimento com nodemon
npm test         # Executar testes
npm run lint     # Verificar código
npm run lint:fix # Corrigir problemas de lint
```

## 📁 Estrutura do Projeto

```
sala-virtual/
├── apps/
│   └── biblos360.net/          # Aplicação principal
│       ├── src/                # Código do servidor
│       │   ├── server.js       # Entry point
│       │   ├── routes.js       # Rotas consolidadas
│       │   ├── controllers.js  # Controllers
│       │   ├── middleware.js   # Middlewares
│       │   ├── services.js     # Serviços
│       │   └── handlers.js     # Socket.IO handlers
│       └── public/             # Assets estáticos
├── api/                        # APIs e dados JSON
├── docs/                       # Documentação técnica
└── package.json                # Configurações do projeto
```

## 🎮 Funcionalidades

### 🎥 Live Player
- Suporte para múltiplas plataformas de vídeo
- Player responsivo com controles completos
- Sincronização automática entre usuários
- Correções específicas para mobile

### 💬 Chat em Tempo Real
- Mensagens instantâneas via Socket.IO
- Sistema de moderação
- Mensagens privadas para administradores
- Emojis e formatação de texto

### 👥 Gestão de Usuários
- Lista de participantes em tempo real
- Níveis de acesso diferenciados
- Sistema de presença automático
- Relatórios de participação

### 🔧 Painel Administrativo
- Controle total da sala virtual
- Configuração de vídeos e conteúdo
- Moderação de chat
- Relatórios detalhados

## 🛡️ Segurança

- Autenticação JWT
- Validação de dados com Joi
- Helmet.js para headers de segurança
- Rate limiting implementado
- Sessões seguras com cookies httpOnly

## 📱 Mobile First

- Design responsivo 100% mobile
- PWA (Progressive Web App) ready
- Touch gestures otimizados
- Performance otimizada para dispositivos móveis

## 🔧 Tecnologias

- **Backend**: Node.js, Express.js
- **Tempo Real**: Socket.IO
- **Database**: Supabase (PostgreSQL)
- **Frontend**: JavaScript vanilla, CSS3
- **Deploy**: Railway.app
- **Cache**: Node-cache
- **Segurança**: Helmet, CORS, JWT

## 📊 Monitoramento

Sistema completo de logs e monitoramento:
- Logs estruturados
- Health check endpoint (`/health`)
- Métricas de performance
- Sistema de heartbeat

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- 📧 Email: suporte@salavirtual.com
- 📚 Documentação: `/docs`
- 🐛 Issues: [GitHub Issues](https://github.com/alextavaresbr/salavirtual/issues)

---

⭐ **Se este projeto foi útil, considere dar uma estrela!**