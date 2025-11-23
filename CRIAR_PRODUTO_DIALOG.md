# 🎯 Dialog de Criação de Produto - Documentação Completa

## ✨ Funcionalidade Implementada

Quando o utilizador responde todas as perguntas do questionário, aparece automaticamente uma **dialog box** elegante perguntando se deseja criar um novo produto com a configuração.

---

## 🎬 Fluxo Completo

```
1. Utilizador responde todas as perguntas
   ↓
2. Sistema detecta fim do questionário
   ↓
3. Dialog aparece: "Deseja criar um novo produto?"
   ↓
4a. Utilizador clica "Não, obrigado"
    → Dialog fecha
   
4b. Utilizador clica "Sim, criar produto"
    ↓
5. Loading spinner: "Criando produto..."
   ↓
6. Chamada ao Business Central API
   ↓
7a. Sucesso:
    → Mostra Nº Produto e Descrição
    → Botões de copy to clipboard
    
7b. Erro:
    → Mostra mensagem de erro
    → Botão "Fechar"
```

---

## 🎨 Dialogs Implementadas

### 1. **Dialog de Confirmação**

```
╔═══════════════════════════════════════════════╗
║  Configuração Completa                        ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  Todas as perguntas foram respondidas         ║
║  com sucesso!                                 ║
║                                               ║
║  Deseja criar um novo produto com esta        ║
║  configuração?                                ║
║                                               ║
╠═══════════════════════════════════════════════╣
║           [Não, obrigado]  [Sim, criar]      ║
╚═══════════════════════════════════════════════╝
```

### 2. **Dialog de Loading**

```
╔═══════════════════════════════════════════════╗
║  Configuração Completa                        ║
╠═══════════════════════════════════════════════╣
║                                               ║
║              ⚪ (spinner)                     ║
║          Criando produto...                   ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

### 3. **Dialog de Sucesso**

```
╔═══════════════════════════════════════════════╗
║  ✅ Produto Criado com Sucesso               ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  NÚMERO DO PRODUTO:                           ║
║  ┌─────────────────────────────────────┐     ║
║  │ TC-4000-R35-316L              📋   │     ║
║  └─────────────────────────────────────┘     ║
║                                               ║
║  DESCRIÇÃO:                                   ║
║  ┌─────────────────────────────────────┐     ║
║  │ Tampo Cónico 4000mm...        📋   │     ║
║  └─────────────────────────────────────┘     ║
║                                               ║
╠═══════════════════════════════════════════════╣
║                     [Fechar]                  ║
╚═══════════════════════════════════════════════╝
```

### 4. **Dialog de Erro**

```
╔═══════════════════════════════════════════════╗
║  Configuração Completa                        ║
╠═══════════════════════════════════════════════╣
║                                               ║
║              ⚠️ (icon)                       ║
║        Erro ao criar produto                  ║
║                                               ║
║  [Mensagem de erro detalhada]                 ║
║                                               ║
╠═══════════════════════════════════════════════╣
║                     [Fechar]                  ║
╚═══════════════════════════════════════════════╝
```

---

## 💻 Implementação Frontend

### Detecção de Fim de Questionário

```javascript
function renderQuestions() {
  let allQuestionsAnswered = true;
  
  for (let i = 0; i < questions.length; i++) {
    // ... lógica de renderização ...
    
    if (!temResposta && !temDefaultEfetivo) {
      allQuestionsAnswered = false;
      break;
    }
  }
  
  // Todas respondidas?
  if (allQuestionsAnswered && questions.length > 0) {
    setTimeout(() => {
      showCreateProductDialog();
    }, 300);
  }
}
```

### Mostrar Dialog de Confirmação

```javascript
function showCreateProductDialog() {
  const dialog = document.createElement('div');
  dialog.id = 'create-product-dialog';
  dialog.className = 'dialog-overlay';
  dialog.innerHTML = `
    <div class="dialog-box">
      <div class="dialog-header">
        <h3>Configuração Completa</h3>
      </div>
      <div class="dialog-content">
        <p>Todas as perguntas foram respondidas!</p>
        <p>Deseja criar um novo produto?</p>
      </div>
      <div class="dialog-actions">
        <button onclick="closeCreateProductDialog()">
          Não, obrigado
        </button>
        <button onclick="createProductFromConfiguration()">
          Sim, criar produto
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);
  setTimeout(() => dialog.classList.add('active'), 10);
}
```

### Criar Produto

```javascript
async function createProductFromConfiguration() {
  // Preparar atributos com AttributeName
  const attributes = Object.entries(answers).map(([attributeID, value]) => ({
    AttributeName: attributeID,
    Value: String(value)
  }));
  
  const payload = {
    QuestionnaireCode: selectedQuestionnaireCode,
    Attributes: attributes
  };
  
  // Chamar API
  const response = await fetch('/api/product/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const result = await response.json();
  
  // Mostrar resultado
  showProductCreatedDialog(result);
}
```

### Copy to Clipboard

```javascript
function copyToClipboard(elementId, button) {
  const element = document.getElementById(elementId);
  const text = element.textContent;
  
  // API moderna
  navigator.clipboard.writeText(text).then(() => {
    showCopyFeedback(button);
  });
}

function showCopyFeedback(button) {
  button.innerHTML = `<svg><!-- checkmark --></svg>`;
  button.classList.add('copied');
  
  setTimeout(() => {
    // Restaurar ícone original
    button.classList.remove('copied');
  }, 2000);
}
```

---

## 🔧 Implementação Backend

### Rota Nova

**Ficheiro:** `server/api/index.js`

```javascript
const { createProductFromConfiguration } = require('../controllers/productController');

router.post('/product/create', createProductFromConfiguration);
```

### Controller

**Ficheiro:** `server/controllers/productController.js`

```javascript
const createProductFromConfiguration = async (req, res) => {
  const { QuestionnaireCode, Attributes } = req.body;
  
  if (!QuestionnaireCode || !Attributes) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const productData = await createProduct(QuestionnaireCode, Attributes);
    res.json(productData);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to create product', 
      details: error.message 
    });
  }
};
```

### Serviço Business Central

**Ficheiro:** `server/services/bcApiService.js`

```javascript
const createProduct = async (questionnaireCode, attributes) => {
  const accessToken = await getAccessToken();
  
  const apiUrl = `${baseUrl}/ODataV4/ICRCFGConfInt_CreateProductFromConfiguration?Company='${company}'`;
  
  const inputParams = {
    QuestionnaireCode: questionnaireCode,
    Attributes: attributes
  };
  
  const inputJsonBody = {
    inputJson: JSON.stringify(inputParams)
  };
  
  const response = await axios.post(apiUrl, JSON.stringify(inputJsonBody), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data;
};
```

---

## 📦 Formato de Dados

### Request para Business Central

```json
{
  "inputJson": "{
    \"QuestionnaireCode\": \"TAMPO_CONICO\",
    \"Attributes\": [
      {
        \"AttributeName\": \"1001\",
        \"Value\": \"4000\"
      },
      {
        \"AttributeName\": \"1002\",
        \"Value\": \"19\"
      },
      {
        \"AttributeName\": \"1003\",
        \"Value\": \"5\"
      }
    ]
  }"
}
```

### Response do Business Central

```json
{
  "ProductNo": "TC-4000-R35-316L",
  "Description": "Tampo Cónico 4000mm, Raio 35mm, Aço 316L"
}
```

ou

```json
{
  "value": {
    "No": "TC-4000-R35-316L",
    "Description": "Tampo Cónico 4000mm..."
  }
}
```

---

## 🎨 CSS dos Dialogs

### Overlay

```css
.dialog-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 9999;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.dialog-overlay.active {
  opacity: 1;
}
```

### Dialog Box

```css
.dialog-box {
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  transform: scale(0.9);
  transition: transform 0.3s ease;
}

.dialog-overlay.active .dialog-box {
  transform: scale(1);
}
```

### Botão Copy

```css
.copy-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.copy-btn.copied {
  background: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.5);
}
```

---

## 🎯 Funcionalidades

### ✅ Detecção Automática
- Detecta quando todas as perguntas foram respondidas
- Dialog aparece automaticamente após 300ms

### ✅ Dialog de Confirmação
- Design elegante (dark theme)
- 2 opções: "Não, obrigado" e "Sim, criar produto"
- Animação de fade in/out
- Backdrop blur

### ✅ Loading State
- Spinner animado
- Mensagem "Criando produto..."
- Esconde botões durante loading

### ✅ Resultado com Copy
- Mostra Nº do Produto
- Mostra Descrição
- Botão de copy em cada campo
- Feedback visual (checkmark verde por 2s)
- Fallback para browsers antigos

### ✅ Error Handling
- Mensagem de erro clara
- Ícone de alerta
- Botão para fechar

### ✅ Responsividade
- Desktop: dialog centralizada
- Mobile: ocupa 95% da largura
- Botões empilham verticalmente em mobile

---

## 🔍 Copy to Clipboard

### API Moderna

```javascript
navigator.clipboard.writeText(text)
  .then(() => console.log('Copiado!'))
  .catch(err => console.error('Erro:', err));
```

### Fallback (Browsers Antigos)

```javascript
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  
  try {
    document.execCommand('copy');
    console.log('Copiado com fallback!');
  } catch (err) {
    console.error('Erro no fallback:', err);
  }
  
  document.body.removeChild(textArea);
}
```

### Feedback Visual

1. **Before:** Ícone de copy (📋)
2. **Click:** Ícone muda para checkmark (✓)
3. **Background:** Verde (2 segundos)
4. **After:** Volta ao ícone original

---

## 📱 Responsividade

### Desktop (> 768px)
- Dialog: 500px largura
- Botões: lado a lado
- Hover effects completos

### Mobile (< 768px)
- Dialog: 95% largura
- Botões: empilhados verticalmente
- Touch-friendly (botões maiores)

---

## 🐛 Error Handling

### Validação Frontend
```javascript
if (!QuestionnaireCode || !Attributes) {
  throw new Error('Invalid data');
}
```

### Validação Backend
```javascript
if (!QuestionnaireCode || !Array.isArray(Attributes)) {
  return res.status(400).json({ error: 'Invalid request' });
}
```

### Tratamento de Erros API
```javascript
try {
  const result = await createProduct(...);
  showSuccess(result);
} catch (error) {
  showError(error.message);
}
```

---

## ✨ Animações

### Dialog Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Dialog Scale
```css
.dialog-box {
  transform: scale(0.9);
  transition: transform 0.3s ease;
}

.dialog-overlay.active .dialog-box {
  transform: scale(1);
}
```

### Copy Button Feedback
```css
.copy-btn {
  transition: all 0.2s ease;
}

.copy-btn:hover {
  transform: scale(1.05);
}

.copy-btn.copied {
  background: green;
  animation: pulse 0.3s;
}
```

---

## 🎉 Resultado Final

### Experiência do Utilizador

1. **Completa questionário** → Gratificante
2. **Dialog aparece** → Clara e elegante
3. **Clica "Sim"** → Rápido (loading)
4. **Vê resultado** → Satisfatório
5. **Copia dados** → Fácil (1 click)
6. **Feedback visual** → Confirmatório

### Características Técnicas

- ✅ Detecção automática de fim
- ✅ Dialog box elegante
- ✅ API integration completa
- ✅ Copy to clipboard moderno
- ✅ Error handling robusto
- ✅ Totalmente responsivo
- ✅ Animações suaves
- ✅ Design consistente (TEKEVER/Pilcrow)

---

## 🚀 Como Testar

1. **Responder todas as perguntas**
2. Dialog aparece automaticamente
3. Clicar "Sim, criar produto"
4. Ver loading
5. Ver resultado com Nº e Descrição
6. Clicar nos botões de copy
7. Ver checkmark verde

---

**Status: ✅ 100% Implementado e Funcional**

*Sistema completo de criação de produto com dialogs elegantes e copy to clipboard!*

---

Data: Novembro 2025

