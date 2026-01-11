# Boletim Web - Progresso do Projeto

## 📋 Visão Geral
Sistema completo de gerenciamento e visualização de boletins da Igreja Metodista em Vila Conde do Pinhal, otimizado para mobile.

## 🎯 Status Atual: ✅ FUNCIONAL

### Stack Tecnológica
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Editor**: Quill.js para textos ricos
- **Ícones**: Lucide Icons
- **Backend**: Node.js (HTTP server)
- **Servidor**: `localhost:3000`
- **Armazenamento**: JSON em `data/boletim-YYYY-MM.json`

---

## 🗂️ Estrutura de Arquivos

```
boletim web/
├── index.html              # Página inicial com login
├── admin.html              # Painel administrativo (11 abas)
├── viewer.html             # Visualizador de boletins
├── admin.js                # Lógica do admin (1304 linhas)
├── viewer.js               # Renderização do boletim (677 linhas)
├── viewer.css              # Estilos do viewer (671 linhas)
├── server.js               # API Node.js (144 linhas)
├── package.json            # Dependências Node
├── data/                   # Boletins salvos (.json)
├── img/                    # SVGs e assets
│   ├── nome-boletim.svg    # Logo principal (convida)
│   ├── pastoral.svg
│   ├── bradesco.svg
│   ├── qr.png             # QR Code PIX
│   ├── aba.svg
│   ├── logo1.svg
│   └── logo2.svg
└── publication-web-resources/  # Assets originais InDesign
```

---

## 🔐 Autenticação
**Senha**: `metodista2026`
- Armazenada em `sessionStorage`
- Validação em `index.html`

---

## 📝 Painel Administrativo (11 Abas)

### Abas Implementadas:
1. **CAPA** - Mês, ano, imagem pastoral, logos, redes sociais
2. **PASTORAL** - Título, versículo, texto com Quill.js
3. **ESCALAS** - 6 seções (Culto, Diaconia, EBD, Kids, Oração, Estudo)
4. **ANIVERSARIANTES** - Lista com data/nome
5. **AGENDA** - Eventos (data, hora, título, descrição)
6. **AVISOS** - Texto rico (Quill.js)
7. **ENDEREÇO** - Texto rico (Quill.js)
8. **EQUIPE PASTORAL** - Tabela (cargo, nome, telefone)
9. **PROGRAMAÇÃO SEMANAL** - Tabela (atividade, horário)
10. **DÍZIMOS E OFERTAS** - Dados bancários + QR Code
11. **ANÚNCIOS** - Texto rico (Quill.js)

### Funcionalidades Admin:
- ✅ **AUTO PREENCHER** - Dados de exemplo completos
- ✅ **SALVAR** - Grava JSON no servidor
- ✅ **VISUALIZAR** - Preview do boletim
- ✅ **Dark Mode** - Alternância light/dark
- ✅ Edição de boletins existentes
- ✅ Exclusão de boletins
- ✅ Upload de imagens (Base64 data URI)
- ✅ Validação de campos obrigatórios

---

## 📖 Visualizador (viewer.html)

### Estrutura do Boletim:
Cada seção renderiza como página separada (`boletim-page`):

1. **CAPA**
   - Logo convida com data sobreposta (bottom: 35px desktop / centered mobile)
   - Faixa preta: "Boletim Igreja Metodista | Nº 38 | janeiro de 2026"
   - Imagem pastoral (sem título/faixa, apenas imagem)
   - Footer: logos + redes sociais

2. **PASTORAL** (página própria)
   - H1 "PASTORAL" (25px)
   - Ícone pastoral.svg
   - Versículo
   - Texto rico

3. **ESCALAS** (página própria)
   - H1 "ESCALAS" (25px)
   - 6 sub-seções com tabelas
   - Títulos h3: 16px bold
   - Subtítulos h3: 13px normal

4. **ANIVERSARIANTES** (página própria)
   - H1 (25px)
   - Lista em 2 colunas
   - SEM imagem lateral

5. **AGENDA** (página própria)
   - H1 (25px)
   - SEM ícone SVG
   - Lista de eventos
   - SEM imagem lateral

6. **AVISOS** (página própria)
   - H1 (25px)
   - Texto rico

7-10. **ENDEREÇO, EQUIPE, PROGRAMAÇÃO, DÍZIMOS** (páginas próprias)
   - Cada um com H1 próprio (25px)
   - Conteúdo específico
   - DÍZIMOS: QR Code PNG (110px)

11. **ANÚNCIOS** (página própria)

### Design:
- **Cores**:
  - Primária: `#5B4B8A` (roxo)
  - Escura: `#3B2F5C`
  - Faixas: `#000` (preto)
- **Tipografia**: Open Sans
  - H1: 25px bold
  - H3 principal: 16px bold
  - H3 secundário: 13px normal
- **Layout**: 100% fluido, sem largura fixa
- **Border-radius**: 4px (sutil)
- **Dark Mode**: Suportado

---

## 🔧 API Server (Node.js)

### Endpoints:
```
GET  /                              # Documentação da API
POST /api/save-boletim              # Salvar boletim
GET  /api/check-boletim/:filename   # Verificar se existe
GET  /api/load-boletim/:filename    # Carregar boletim
GET  /api/list-boletins             # Listar todos
DELETE /api/delete-boletim/:filename # Excluir boletim
```

### Iniciar Servidor:
```bash
npm start
```
Porta: `3000`

---

## 📊 Dados Bancários (AUTO PREENCHER)

```
Banco: Bradesco
Agência: 2720
Conta Corrente: C/C 13.959-9
PIX (CNPJ): 04.083.369/0042-34
```

---

## 🐛 Correções Importantes Realizadas

### Problema: Imagens não renderizavam
**Solução**: Usar `createElement() + setAttribute()` ao invés de template strings para data URIs

### Problema: Loop infinito no carregamento
**Solução**: Flag `isLoadingBoletim` para prevenir re-carregamentos

### Problema: "Parâmetros inválidos" após salvar
**Solução**: `previewBoletim()` agora detecta se boletim foi salvo e usa URL params corretos

### Problema: Data não centralizada no mobile
**Solução**: CSS com `top: 50%` + `transform: translateY(-50%)`

---

## 📱 Responsividade

### Mobile (< 768px):
- Largura 100% fluida
- Padding reduzido
- Data overlay centralizada no logo
- Font-size ajustado (10px)
- Colunas aniversariantes: 2

### Desktop (> 769px):
- Max-width: 800px
- Padding: 40px
- Data overlay: bottom 35px
- Colunas aniversariantes: 3

---

## ✅ Funcionalidades Completas

- [x] Sistema de login
- [x] 11 abas administrativas
- [x] Auto-preenchimento
- [x] Upload de imagens
- [x] Editor de texto rico (Quill.js)
- [x] Salvar no servidor (Node.js)
- [x] Visualização responsiva
- [x] Dark mode
- [x] Editar boletins existentes
- [x] Excluir boletins
- [x] Preview antes de salvar
- [x] Ícones modernos (Lucide)
- [x] Design fiel ao PDF original
- [x] Estrutura consistente (todas seções = páginas próprias)
- [x] QR Code PIX
- [x] Impressão otimizada

---

## 🎨 Correções de Design Finalizadas

1. ✅ Cores roxas (#5B4B8A) e pretas
2. ✅ Remoção de gradientes
3. ✅ Títulos padronizados (25px)
4. ✅ Border-radius sutil (4px)
5. ✅ Remoção de largura fixa
6. ✅ Data sobreposta no logo
7. ✅ Seções separadas (cada uma = página própria)
8. ✅ Remoção de imagens laterais (aniv/agenda)
9. ✅ Labels corretos ("Reunião de Oração", "Estudo Bíblico")
10. ✅ QR Code com tamanho correto (110px)

---

## 🚀 Como Usar

### 1. Iniciar Servidor
```bash
cd "boletim web"
npm start
```

### 2. Acessar Admin
1. Abrir `index.html`
2. Senha: `metodista2026`
3. Clicar em "AUTO PREENCHER"
4. Ajustar dados conforme necessário
5. Clicar em "SALVAR E AVANÇAR" em cada aba
6. Botão "VISUALIZAR" para preview

### 3. Visualizar Boletim Salvo
- Acessar `viewer.html?year=2026&month=01`
- Ou usar lista de boletins no admin

---

## 📝 Próximos Passos (Opcional)

- [ ] Otimizar estilos de impressão
- [ ] Adicionar busca/filtro de boletins
- [ ] Exportar para PDF
- [ ] Sistema de usuários múltiplos
- [ ] Backup automático
- [ ] Histórico de versões

---

## 📌 Notas Técnicas

### Imagens:
- Formato: Base64 data URIs
- Armazenamento: Dentro do JSON
- Renderização: `setAttribute()` obrigatório

### Servidor:
- CORS habilitado
- Logging completo
- Validação de dados
- Error handling robusto

### Estado:
- `sessionStorage`: autenticação
- `localStorage`: preview temporário + rascunhos
- JSON files: dados persistentes

---

**Última Atualização**: 10/01/2026
**Status**: Sistema 100% funcional e pronto para uso
