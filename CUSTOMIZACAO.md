# 🎨 Guia de Customização - Configurador TEKEVER

## 🖼️ Alterar o Logo

### Substituir o Logo
1. Coloque o novo logo em: `public/assets/logo.png`
2. Formatos recomendados: PNG (com transparência) ou SVG
3. Tamanho recomendado: 200x50px @ 2x (400x100px)

### Ajustar Tamanho do Logo
No ficheiro `public/index.html`:
```html
<!-- Linha ~20 -->
<img src="assets/logo.png" alt="TEKEVER Logo" class="h-12">
<!-- Altere h-12 para: h-8, h-10, h-14, h-16 -->
```

---

## 🎬 Alterar o Vídeo

### Substituir o Vídeo
1. Coloque o novo vídeo em: `public/assets/`
2. Formato recomendado: **MP4** (H.264 codec)
3. Resolução recomendada: 1920x1080 ou 1280x720

### Atualizar Referência
No ficheiro `public/index.html`:
```html
<!-- Linha ~54 -->
<source src="assets/WebConf.mp4" type="video/mp4">
<!-- Altere para: -->
<source src="assets/SEU_VIDEO.mp4" type="video/mp4">
```

### Comportamento do Vídeo

#### Loop (repetir infinitamente)
```html
<video id="product-video" 
       class="w-full h-full object-cover"
       muted
       loop
       playsinline>
```

#### Autoplay (tocar automaticamente)
```html
<video id="product-video" 
       class="w-full h-full object-cover"
       muted
       autoplay
       playsinline>
```

#### Com Som
```html
<video id="product-video" 
       class="w-full h-full object-cover"
       playsinline>
<!-- Remova 'muted' -->
```

---

## 🎨 Alterar Cores

### Paleta Atual
```css
Fundo Principal: #000000 (preto)
Painel Escuro: #1a1a1a
Texto: #ffffff (branco)
Bordas: rgba(255, 255, 255, 0.1-0.3)
```

### Customizar Cores

No ficheiro `public/css/style.css`:

#### Mudar Cor de Fundo
```css
/* Linha ~32 */
body {
  background-color: #000000; /* Altere aqui */
}
```

#### Mudar Cor do Painel Esquerdo
```css
/* Linha ~63 */
#left-panel {
  background: linear-gradient(135deg, #1a1a1a 0%, #000000 50%, #1a1a1a 100%);
  /* Altere as cores do gradiente */
}
```

#### Mudar Cor do Texto
```css
/* Linha ~32 */
body {
  color: #ffffff; /* Cor principal do texto */
}
```

#### Mudar Cor dos Inputs
```css
/* Linha ~103 */
input[type="text"],
input[type="number"],
select {
  background-color: rgba(0, 0, 0, 0.6); /* Fundo dos inputs */
  color: #ffffff; /* Texto dos inputs */
  border: 1px solid rgba(255, 255, 255, 0.2); /* Borda */
}
```

### Exemplo: Tema Azul TEKEVER
```css
/* Substituir em style.css */

/* Fundo azul escuro */
body {
  background-color: #0a1929;
  color: #ffffff;
}

/* Painel com gradiente azul */
#left-panel {
  background: linear-gradient(135deg, #0d2744 0%, #0a1929 50%, #0d2744 100%);
}

/* Bordas azuis */
.question-block {
  border: 1px solid rgba(33, 150, 243, 0.3);
}

/* Hover azul */
.question-block:hover {
  border-color: rgba(33, 150, 243, 0.5);
}
```

---

## 🔤 Alterar Fontes

### Fonte Atual
**Titillium Web** (Regular, SemiBold)

### Usar Outra Fonte

#### Opção 1: Google Fonts
No ficheiro `public/index.html`:
```html
<head>
  <!-- Adicionar depois do título -->
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;600&display=swap" rel="stylesheet">
</head>
```

No ficheiro `public/css/style.css`:
```css
body {
  font-family: 'Roboto', sans-serif;
}
```

#### Opção 2: Fonte Local
1. Coloque os ficheiros de fonte em `public/assets/`
2. Atualize `@font-face` no `style.css`:
```css
@font-face {
  font-family: 'MinhaFonte';
  src: url('../assets/MinhaFonte-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}

body {
  font-family: 'MinhaFonte', sans-serif;
}
```

---

## 📐 Alterar Layout

### Proporção Questionário/Vídeo

#### Atual: 50/50
No ficheiro `public/index.html`:
```html
<!-- Linha ~18 -->
<div id="left-panel" ... style="flex-basis: 50%; min-width: 400px;">
```

#### 40/60 (mais espaço para vídeo)
```html
<div id="left-panel" ... style="flex-basis: 40%; min-width: 400px;">
```

#### 60/40 (mais espaço para questionário)
```html
<div id="left-panel" ... style="flex-basis: 60%; min-width: 400px;">
```

#### 33/67 (1/3 para questionário)
```html
<div id="left-panel" ... style="flex-basis: 33.33%; min-width: 400px;">
```

### Desabilitar Redimensionamento

No ficheiro `public/css/style.css`:
```css
/* Adicionar */
#resizer {
  display: none; /* Esconde a divisória */
}
```

---

## 🎭 Alterar Animações

### Desabilitar Animações

No ficheiro `public/css/style.css`:
```css
/* Adicionar no início do ficheiro */
* {
  animation: none !important;
  transition: none !important;
}
```

### Tornar Animações Mais Rápidas
```css
/* Procurar por 'transition' e alterar durações */
transition: all 0.2s ease; /* Era 0.3s, agora 0.2s */
```

### Tornar Animações Mais Lentas
```css
transition: all 0.5s ease; /* Era 0.3s, agora 0.5s */
```

---

## 🎨 Estilos dos Blocos de Perguntas

### Cor de Fundo
```css
/* Linha ~79 */
.question-block {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  /* Altere a transparência: 0.05 e 0.02 */
}
```

### Espaçamento Interno
```css
.question-block {
  padding: 1.25rem; /* Altere: 1rem, 1.5rem, 2rem */
}
```

### Borda Arredondada
```css
.question-block {
  border-radius: 8px; /* Altere: 4px, 12px, 16px */
}
```

### Sombra
```css
.question-block {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  /* Mais forte: 0 8px 16px rgba(0, 0, 0, 0.5) */
  /* Mais suave: 0 2px 4px rgba(0, 0, 0, 0.2) */
}
```

---

## 📱 Ajustar Responsividade

### Alterar Breakpoints

No ficheiro `public/css/style.css`:
```css
/* Desktop grande - linha ~370 */
@media (max-width: 1200px) { /* Altere: 1400px, 1600px */ }

/* Tablet - linha ~376 */
@media (max-width: 1024px) { /* Altere: 900px, 1100px */ }

/* Mobile - linha ~399 */
@media (max-width: 768px) { /* Altere: 600px, 800px */ }

/* Small Mobile - linha ~425 */
@media (max-width: 480px) { /* Altere: 400px, 500px */ }
```

### Desabilitar Layout Vertical em Tablets
```css
@media (max-width: 1024px) {
  /* Comentar ou remover estas linhas */
  /* body { flex-direction: column; } */
}
```

---

## 🎯 Alterar Overlay do Vídeo

### Mudar Ícone de Play

No ficheiro `public/index.html`:
```html
<!-- Linha ~60 - substituir SVG -->
<svg class="w-20 h-20 mx-auto mb-4 text-white" fill="currentColor" viewBox="0 0 20 20">
  <!-- Cole aqui um novo SVG -->
</svg>
```

### Mudar Texto
```html
<!-- Linha ~63 -->
<p class="text-white text-lg font-semibold">Click to play</p>
<!-- Altere para: -->
<p class="text-white text-lg font-semibold">Ver Vídeo</p>
```

### Mudar Cor do Overlay
No ficheiro `public/css/style.css`:
```css
#video-overlay {
  background-color: rgba(0, 0, 0, 0.5); /* Altere: 0.3, 0.7, 0.9 */
}
```

### Remover Overlay Completamente
No ficheiro `public/index.html`:
```html
<!-- Comentar ou remover linhas 58-67 -->
<!-- <div id="video-overlay">...</div> -->
```

No ficheiro `public/js/main.js`:
```javascript
// Desativar função (comentar linhas 47-89)
function initializeVideo() {
  const video = document.getElementById('product-video');
  if (video) {
    video.play(); // Autoplay
  }
}
```

---

## 🔧 Configurações Avançadas

### Alterar Código do Questionário

No ficheiro `public/js/main.js`:
```javascript
// Linha ~30
const QUESTIONNAIRE_CODE_TO_LOAD = "PA_COLCHAO";
// Altere para o seu código
```

### Desabilitar Multi-Idioma
```javascript
// Comentar secção de idiomas (linhas ~335-370 em main.js)
```

### Adicionar Botão "Submit"
No ficheiro `public/index.html`:
```html
<!-- Adicionar antes do footer -->
<button id="submit-btn" class="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors">
  Submeter Configuração
</button>
```

No ficheiro `public/js/main.js`:
```javascript
// Adicionar função de submit
document.getElementById('submit-btn').addEventListener('click', function() {
  console.log('Configuração:', answers);
  // Adicione aqui a lógica de submissão
});
```

---

## 💾 Salvar Preferências

### LocalStorage para Cores Personalizadas
```javascript
// Guardar cor escolhida pelo utilizador
localStorage.setItem('themeColor', '#0a1929');

// Carregar e aplicar
const savedColor = localStorage.getItem('themeColor');
if (savedColor) {
  document.body.style.backgroundColor = savedColor;
}
```

---

## 🎨 Temas Pré-Definidos

### Tema Claro
```css
body {
  background-color: #ffffff;
  color: #000000;
}

#left-panel {
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 50%, #f5f5f5 100%);
}

.question-block {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.1);
}
```

### Tema Azul Escuro
```css
body {
  background-color: #0d1b2a;
  color: #e0e1dd;
}

#left-panel {
  background: linear-gradient(135deg, #1b263b 0%, #0d1b2a 50%, #1b263b 100%);
}

.question-block {
  border: 1px solid rgba(33, 150, 243, 0.3);
}
```

### Tema Verde Escuro
```css
body {
  background-color: #0a1f1f;
  color: #e8f5e9;
}

#left-panel {
  background: linear-gradient(135deg, #1a3030 0%, #0a1f1f 50%, #1a3030 100%);
}

.question-block {
  border: 1px solid rgba(76, 175, 80, 0.3);
}
```

---

## 🚀 Dicas Finais

### Performance
- ✅ Use vídeos comprimidos (< 10MB)
- ✅ Otimize imagens (PNG → WebP)
- ✅ Minimize CSS/JS em produção

### Acessibilidade
- ✅ Mantenha contraste mínimo 4.5:1
- ✅ Teste com screen readers
- ✅ Adicione alt text em imagens

### Browser Testing
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

---

**Configurador TEKEVER** - Totalmente Customizável 🎨

