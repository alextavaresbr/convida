# 🚀 GUIA RÁPIDO DE INÍCIO

## Passo 1: Abrir o Sistema

1. Abra o arquivo `index.html` ou `home.html` no seu navegador
2. Você verá a tela inicial com os 12 meses do ano

## Passo 2: Criar seu Primeiro Boletim

### 2.1 Acessar o Admin
1. Clique em **"Acesso Administrativo"** (canto superior direito)
2. Digite a senha: **`metodista2026`**
3. Você verá o painel com 11 abas

### 2.2 Preencher a CAPA (Primeira aba)
**IMPORTANTE**: Sempre comece pela aba CAPA!

```
✓ Selecione o MÊS: Janeiro
✓ Digite o ANO: 2026
✓ Nome da Igreja: Igreja Metodista em Vila Conde do Pinhal
✓ Número do Boletim: 38
✓ Título da Pastoral: O Verbo se fez carne e habitou entre nós
✓ Arraste uma imagem para "Imagem da Pastoral"
✓ Adicione até 2 logos institucionais
✓ Preencha as redes sociais que desejar (opcional)
```

**NOVO**: Ao terminar, clique em **"Salvar e Avançar →"**
- Seus dados serão salvos automaticamente
- A aba CAPA receberá um ✓ verde
- Você avançará automaticamente para PASTORAL

### 2.3 Sistema de Progresso com "Salvar e Avançar"

Cada aba agora tem botões de navegação:
- **← Voltar**: Retorna para a aba anterior
**Depois clique em "Salvar e Avançar →"** para ir para ESCALAS

### 2.5var e Avançar →**: Salva a seção atual e vai para a próxima

**Como funciona:**
1. Preencha os campos da aba atual
2. Clique em "Salvar e Avançar →"
3. Um ✓ verde aparecerá ao lado da aba concluída
4. Você será levado automaticamente para a próxima seção
5. Uma notificação verde confirmará o salvamento

**Rascunho Automático:**
- Seus dados são salvos automaticamente a cada "Salvar e Avançar"
- Se fechar o navegador, poderá continuar de onde parou
- Ao reabrir, o sistema perguntará se deseja carregar o rascunho

### 2.4 Preencher PASTORAL (Segunda aba)
```
✓ Versículo: "E o Verbo se fez carne..."
✓ Referência: João 1:14
✓ Use o editor para escrever o texto da pastoral
   - Botões de formatação: negrito, itálico, títulos, listas
   - Cores e alinhamento disponíveis
```

### 2.4 Preencher ESCALAS (Terceira aba)
```
Culto Matutino:
✓ Horário: 10h
✓ Clique em "+ Adicionar Linha"
✓ Preencha: Dia | P/L | Descrição
   Exemplo: 07 | Pr. Alexandre | 2º Domingo do Advento

Repita para:
- Diaconia
- EBD Adultos
- Rede Kids
- EBD Quartas
- Estudo Bíblico
**Continue clicando em "Salvar e Avançar →"** em cada aba

### 2.6

### 2.5 Demais Abas
Continue preenchendo conforme necessário:
- **Aniversariantes**: Lista de aniversariantes do mês
- **Agenda**: Eventos programados
- **Avisos**: Comunicados gerais
- **Endereço**: Dados da igreja
- **Equipe Pastoral**: Membros da equipe
**Navegue com os botões:**
- Use **← Voltar** se precisar revisar algo
- Use **Salvar e Avançar →** para progredir
- Na última aba (Anúncios), o botão será **✓ Finalizar e Salvar**

### 2.7 Finalizar e Salvar

Na última aba (ANÚNCIOS):
1. Preencha o conteúdo
2. Clique em **"✓ Finalizar e Salvar"**
3. O sistema perguntará se deseja salvar o boletim completo
4. Confirme e o arquivo JSON será baixado

## Passo 3: Salvar o Boletim

**Opção A: Salvar ao Finalizar (Recomendado)**
1. Complete todas as 11 abas clicando em "Salvar e Avançar"
2. Na última aba, clique em "✓ Finalizar e Salvar"
3. Confirme quando perguntado

**Opção B: Salvar Manualmente**s semanais
- **Dízimos**: Dados bancários
- **Anúncios**: Informações adicionais

## Passo 3: Salvar o Boletim

1. Clique em **"Salvar Boletim"** (canto superior direito)
2. O navegador baixará um arquivo: `boletim-2026-01.json`
3. **Mova este arquivo** para a pasta `data/` do projeto

## Passo 4: Visualizar

### Opção A: Preview Direto
1. No admin, clique em **"Visualizar"**
2. Uma nova aba abrirá com o boletim formatado

### Opção B: Pela Home
1. Volte para `home.html`
2. O mês de Janeiro estará destacado em roxo
3. Clique no mês para abrir o boletim

## Passo 5: Imprimir/Gerar PDF

1. No visualizador, clique em **"🖨️ Imprimir"**
2. Na janela de impressão:
   - **Destino**: Selecione "Salvar como PDF"
   - **Layout**: Retrato
   - **Margens**: Nenhuma (ou mínimas)
3. Clique em "Salvar"

---

## 📱 Como Testar no Celular

1. **Durante Desenvolvimento**:
   - Use as Ferramentas de Desenvolvedor (F12)
   - Clique no ícone de dispositivo móvel
   - Selecione um celular (ex: iPhone 12)
   - Redimensione para ver o layout fixo

2. **Em Produção**:
   - Acesse pelo navegador do celular
   - O boletim terá tamanho fixo (260x544px)
   - Em desktop, será fluido até 800px

---

## 🔧 Problemas Comuns

### ❌ Boletim não aparece na home
**Solução**: Verifique se o arquivo JSON está na pasta `data/` com o nome correto

### ❌ Imagens não aparecem
**Solução**: As imagens ficam em Base64 no JSON. Para imagens grandes, reduza o tamanho antes de fazer upload

### ❌ Editor de texto não carrega
**Solução**: Verifique sua conexão com a internet (Quill.js é carregado via CDN)

### ❌ Erro ao salvar
**Solução**: Verifique se preencheu MÊS e ANO na aba CAPA

---

## 🎯 Dicas Importantes

✅ **Sempre comece pela aba CAPA** - ela define mês/ano  
✅ **Use o botão "Preview"** antes de salvar definitivamente  
✅ **Salve com frequência** - o navegador pode perder dados  
✅ **Imagens até 2MB** funcionam melhor  
✅ **Teste no celular** antes de publicar  

---

## 📞 Próximos Passos

### Para Uso Local
✅ Sistema pronto! Continue criando boletins

### Para Publicar Online (Railway/GitHub)
1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos
3. Configure o Railway para servir os arquivos
4. Implemente backend para salvar JSONs automaticamente
5. (Veja seção "Configuração para Produção" no README.md)

---

## 🎨 Personalizações Rápidas

### Alterar Cores
Edite em `viewer.css`:
```css
:root {
    --primary-color: #2563eb;  /* Mude para sua cor */
}
```

### Alterar Senha
Edite em `admin.js`, linha 2:
```javascript
const ADMIN_PASSWORD = 'suasenha123';
```

### Adicionar Fonte SF Pro
1. Coloque arquivos `.ttf` na pasta `font/`
2. Adicione no `viewer.css`:
```css
@font-face {
    font-family: 'SF Pro';
    src: url('font/SFPro-Regular.ttf');
}
```

---

**Pronto! Seu sistema está funcionando! 🎉**

Qualquer dúvida, consulte o `README.md` completo.
