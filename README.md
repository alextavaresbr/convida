# Sistema de Boletim Web - Igreja Metodista

## 📋 Descrição

Sistema completo para criação e visualização de boletins mensais da igreja, com interface administrativa, design responsivo e geração automática de HTML.

## 🚀 Funcionalidades

✅ **Página Inicial (home.html)**
- Visualização de todos os meses do ano
- Toggle para navegar entre anos
- Apenas boletins gerados ficam disponíveis para visualização

✅ **Painel Administrativo (admin.html)**
- Login com senha (padrão: `metodista2026`)
- 11 abas organizadas:
  - **Capa**: Mês/ano, título, imagens, logos, redes sociais
  - **Pastoral**: Versículo, texto com editor rico
  - **Escalas**: Culto matutino, diaconia, EBD, rede kids, estudo bíblico
  - **Aniversariantes**: Lista com datas e nomes
  - **Agenda**: Eventos com data, hora e descrição
  - **Avisos**: Editor de texto formatado
  - **Endereço**: Informações de contato
  - **Equipe Pastoral**: Membros com cargo e telefone
  - **Programação Semanal**: Atividades regulares
  - **Dízimos e Ofertas**: Dados bancários e PIX
  - **Anúncios**: Conteúdo adicional

✅ **Visualizador (viewer.html)**
- Design responsivo:
  - **Mobile**: Tamanho fixo (260.79px × 544.25px)
  - **Desktop**: Layout fluido até 800px
- Geração automática de todas as páginas do boletim
- Função de impressão/PDF

✅ **Funcionalidades Técnicas**
- Upload de imagens com drag-and-drop
- Editor de texto rico (Quill.js)
- Salvamento em JSON
- Confirmação de sobrescrita
- Preview antes de salvar

## 📁 Estrutura de Arquivos

```
boletim web/
├── home.html              # Página inicial
├── home.css
├── home.js
├── admin.html             # Painel administrativo
├── admin.css
├── admin.js
├── viewer.html            # Visualizador do boletim
├── viewer.css
├── viewer.js
├── data/                  # JSONs dos boletins salvos
│   ├── boletim-2026-01.json
│   ├── boletim-2026-02.json
│   └── boletins.json     # Índice de boletins disponíveis
├── icons/                 # Ícones de redes sociais
│   ├── youtube.svg
│   ├── facebook.svg
│   ├── instagram.svg
│   └── whatsapp.svg
├── font/                  # Fontes (OpenSans e SF Pro)
├── publication-web-resources/
│   ├── image/            # Imagens do boletim
│   └── css/
└── README.md
```

## 🔧 Como Usar

### 1. Acessar o Sistema

Abra `home.html` no navegador. Você verá:
- Grid com os 12 meses do ano
- Apenas meses com boletins ficam destacados e clicáveis
- Botão de "Acesso Administrativo" no canto superior direito

### 2. Criar um Novo Boletim

1. Clique em "Acesso Administrativo"
2. Digite a senha: `metodista2026`
3. Preencha as abas na ordem:
   - **Comece pela CAPA**: Selecione o mês e ano
   - Preencha os demais campos conforme necessário
   - Use o editor de texto para formatação rica
   - Faça upload de imagens arrastando ou clicando

4. **Salvar**:
   - Clique em "Salvar Boletim"
   - O sistema baixará um arquivo JSON
   - Coloque esse arquivo na pasta `data/`

5. **Visualizar**:
   - Clique em "Visualizar" para ver o preview
   - Ou volte à home e clique no mês correspondente

### 3. Editar um Boletim Existente

1. Acesse o painel admin
2. Selecione o mês e ano na aba CAPA
3. O sistema tentará carregar os dados existentes (se configurado no servidor)
4. Faça as alterações necessárias
5. Salve novamente (confirme a sobrescrita)

### 4. Imprimir/Gerar PDF

1. Abra o boletim no visualizador
2. Clique no botão "🖨️ Imprimir"
3. Na janela de impressão, escolha:
   - "Salvar como PDF" para gerar PDF
   - Ou imprimir direto

## ⚙️ Configuração para Produção (Railway/GitHub)

### Estrutura Recomendada:

```javascript
// No servidor (Node.js/Express exemplo):

// Endpoint para listar boletins disponíveis
app.get('/api/boletins', (req, res) => {
    // Ler pasta data/ e retornar lista
    const files = fs.readdirSync('./data');
    const boletins = files
        .filter(f => f.startsWith('boletim-'))
        .map(f => {
            const match = f.match(/boletim-(\d{4})-(\d{2})\.json/);
            return {
                key: `${match[1]}-${match[2]}`,
                year: match[1],
                month: match[2]
            };
        });
    res.json(boletins);
});

// Endpoint para salvar boletim
app.post('/api/boletim', (req, res) => {
    const { year, month, data } = req.body;
    const filename = `boletim-${year}-${month}.json`;
    fs.writeFileSync(`./data/${filename}`, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

// Endpoint para carregar boletim
app.get('/api/boletim/:year/:month', (req, res) => {
    const { year, month } = req.params;
    const filename = `./data/boletim-${year}-${month}.json`;
    if (fs.existsSync(filename)) {
        const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
        res.json(data);
    } else {
        res.status(404).json({ error: 'Boletim não encontrado' });
    }
});
```

### Ajustes no Código:

1. **admin.js** - Modificar função `saveBoletim()`:
```javascript
async function saveBoletim() {
    const data = collectFormData();
    const response = await fetch('/api/boletim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            year: currentYear,
            month: currentMonth,
            data: data
        })
    });
    
    if (response.ok) {
        alert('Boletim salvo com sucesso!');
    }
}
```

2. **home.js** - Modificar `loadAvailableBoletins()`:
```javascript
async function loadAvailableBoletins() {
    const response = await fetch('/api/boletins');
    const data = await response.json();
    data.forEach(b => availableBoletins.add(b.key));
    renderMonths();
}
```

## 🎨 Fontes

O sistema usa:
- **Open Sans**: Para textos corridos (já carregada via Google Fonts)
- **SF Pro**: Para títulos (colocar arquivos na pasta `font/`)

Para adicionar SF Pro:
1. Coloque os arquivos `.ttf` ou `.woff2` na pasta `font/`
2. No `viewer.css`, adicione:

```css
@font-face {
    font-family: 'SF Pro';
    src: url('font/SFPro-Regular.woff2') format('woff2');
    font-weight: normal;
}
/* Adicione variações: Bold, Medium, etc. */
```

## 🔒 Segurança

⚠️ **IMPORTANTE**: 
- A senha está hardcoded para desenvolvimento
- Em produção, implemente autenticação real:
  - JWT tokens
  - Sessões server-side
  - OAuth/Firebase Auth
  - Variáveis de ambiente

## 📱 Responsividade

- **Mobile (≤ 768px)**: Layout fixo (260.79px × 544.25px)
- **Tablet/Desktop (> 768px)**: Layout fluido até 800px
- **Impressão**: Otimizado para A4

## 🛠️ Tecnologias Utilizadas

- HTML5, CSS3, JavaScript (Vanilla)
- [Quill.js](https://quilljs.com/) - Editor de texto rico
- Google Fonts (Open Sans)
- LocalStorage para preview

## 📝 Customização

### Alterar Senha do Admin

Em `admin.js`, linha 2:
```javascript
const ADMIN_PASSWORD = 'metodista2026'; // Altere aqui
```

### Alterar Cores

Em `viewer.css` e outros arquivos CSS:
```css
:root {
    --primary-color: #2563eb;  /* Azul principal */
    --primary-hover: #1d4ed8;  /* Azul hover */
    /* ... outras cores */
}
```

### Adicionar Novos Campos

1. Adicione o campo HTML em `admin.html`
2. Colete o valor em `collectFormData()` no `admin.js`
3. Exiba o valor na função de render correspondente em `viewer.js`

## 🐛 Solução de Problemas

**Boletim não carrega:**
- Verifique se o arquivo JSON está na pasta `data/`
- Verifique o formato do nome: `boletim-YYYY-MM.json`
- Abra o console do navegador (F12) para ver erros

**Imagens não aparecem:**
- Verifique se as imagens foram convertidas para Base64
- Confirme que o campo não está vazio no JSON
- Teste com imagens menores (< 2MB)

**Editor de texto não funciona:**
- Verifique se o Quill.js carregou (console do navegador)
- Limpe o cache do navegador
- Teste em outro navegador

## 📞 Suporte

Para dúvidas ou problemas, contate o desenvolvedor do sistema.

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2026
