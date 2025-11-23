# 🚀 Quick Start - Configurador TEKEVER

## Alterações Realizadas

### ✅ O que foi feito

1. **Design completamente redesenhado** com tema escuro TEKEVER
2. **Eliminado todo o código 3D** (Vectary)
3. **Vídeo substituiu o visualizador 3D** (`assets/WebConf.mp4`)
4. **Layout 50/50** (Questionário | Vídeo)
5. **Responsividade completa** para todos os dispositivos
6. **Animações modernas** e transições suaves

### ❌ O que foi removido

- Ficheiro `vectary3DManager.js`
- Ficheiro `vectaryApi.js`
- Script externo da Vectary API
- Todas as referências a 3D no código

---

## 🎨 Design TEKEVER

### Cores Principais
```css
Background: #000000 (preto)
Painel: #1a1a1a (cinza escuro)
Texto: #ffffff (branco)
Bordas: rgba(255, 255, 255, 0.1-0.3)
```

### Fontes
- **Titillium Web** (Regular, SemiBold)

---

## 📂 Estrutura Simplificada

```
public/
├── index.html          → Nova estrutura HTML
├── css/style.css       → CSS redesenhado (tema escuro)
├── js/
│   └── main.js         → JS limpo (sem 3D)
└── assets/
    ├── logo.png        → Logo TEKEVER
    └── WebConf.mp4     → Vídeo do produto ⭐
```

---

## 🎬 Como Funciona o Vídeo

1. **Página carrega** → Vídeo aparece com overlay
2. **Utilizador clica** → Vídeo começa a tocar
3. **Vídeo termina** → Overlay reaparece

### Personalizar o Vídeo

Substitua `public/assets/WebConf.mp4` por outro vídeo:
- **Formato**: MP4
- **Codec**: H.264
- **Comportamento**: Muted, playsinline

---

## 💻 Executar o Projeto

```bash
# Instalar dependências (se necessário)
npm install

# Iniciar servidor
npm start

# Aceder
http://localhost:3000
```

---

## 📱 Responsividade

| Dispositivo | Layout |
|-------------|--------|
| Desktop (1200px+) | Lado a lado 50/50 |
| Tablet (1024px) | Empilhado vertical |
| Mobile (768px) | Compacto otimizado |

---

## 🎯 Funcionalidades Mantidas

- ✅ Questionário dinâmico
- ✅ Multi-idioma
- ✅ Cálculo de preço
- ✅ Validação de respostas
- ✅ Painel redimensionável
- ✅ Autocomplete
- ✅ Fórmulas e constantes

---

## 🔧 Configurações Importantes

### Alterar Questionário
```javascript
// Em main.js, linha ~30
const QUESTIONNAIRE_CODE_TO_LOAD = "PA_COLCHAO";
```

### Alterar Vídeo
```html
<!-- Em index.html -->
<source src="assets/SEU_VIDEO.mp4" type="video/mp4">
```

### Alterar Logo
Substitua `public/assets/logo.png`

---

## 🐛 Problemas Comuns

### Vídeo não aparece
- Verifique se `WebConf.mp4` existe em `public/assets/`
- Verifique formato (deve ser MP4)

### Layout quebrado
- Limpe o cache: `Ctrl + Shift + R`
- Verifique se `style.css` carregou

### Questionário não carrega
- Verifique servidor está a correr
- Verifique código do questionário está correto
- Verifique API Business Central

---

## 📊 Comparação Antes/Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Design | Azul/Branco | Preto/Branco (TEKEVER) |
| Visualização | 3D (Vectary) | Vídeo MP4 |
| Layout | 20/80 | 50/50 |
| Responsivo | Básico | Completo |
| Animações | Nenhuma | Modernas |
| Performance | Média (3D) | Excelente (vídeo) |

---

## ✨ Destaques do Novo Design

1. **Tema Escuro Profissional** - Inspirado no site TEKEVER
2. **Vídeo Integrado** - Play manual, elegante
3. **Animações Subtis** - Fade in, shine effects
4. **Responsivo Total** - Desktop, tablet, mobile
5. **Performance** - Código limpo e otimizado
6. **UX Melhorado** - Foco, scroll automático, feedback

---

## 📞 Suporte

Para questões ou problemas:
1. Consulte `CONFIGURADOR_TEKEVER.md` para documentação completa
2. Verifique console do navegador para erros
3. Teste em modo incógnito

---

**🎉 Configurador TEKEVER pronto a usar!**

*Design moderno • Performance otimizada • Totalmente responsivo*

