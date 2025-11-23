# 📋 Seleção de Questionário - Nova Funcionalidade

## ✨ Implementação Completa

Foi adicionada uma nova etapa **inicial** ao configurador: **Seleção de Questionário**.

---

## 🎯 Fluxo do Utilizador

### Antes
```
1. Página carrega → Mostra configurador diretamente
```

### Depois
```
1. Página carrega → Mostra lista de questionários disponíveis
2. Utilizador seleciona questionário → Loading...
3. Carrega configurador selecionado → Perguntas aparecem
```

---

## 🎨 Interface de Seleção

### Design
- **Estilo**: Tema escuro TEKEVER (consistente com o resto)
- **Fonte**: Pilcrow (mesma do site)
- **Cards**: Interativos com hover effects
- **Animações**: Shine effect, slide, loading spinner

### Estrutura Visual
```
╔═══════════════════════════════════════════════╗
║  [Logo TEKEVER]                    [Language] ║
╠═══════════════════════════════════════════════╣
║                                               ║
║     Selecione o Configurador                  ║
║     Escolha o tipo de produto...              ║
║                                               ║
║  ┌──────────────────────────────────────┐    ║
║  │ 01  Configurador de Tampo Cónico  → │    ║
║  │     Code: TAMPO_CONICO               │    ║
║  └──────────────────────────────────────┘    ║
║                                               ║
║  ┌──────────────────────────────────────┐    ║
║  │ 02  Configurador de Silo Tetrapak → │    ║
║  │     Code: SILO_TETRAPAK              │    ║
║  └──────────────────────────────────────┘    ║
║                                               ║
║  ┌──────────────────────────────────────┐    ║
║  │ 03  Configurador de Depósito Inox → │    ║
║  │     Code: DEPOSITO_INOX              │    ║
║  └──────────────────────────────────────┘    ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

---

## 🔧 Implementação Técnica

### Frontend (`public/js/main.js`)

#### Novas Funções

1. **`fetchAvailableQuestionnaires()`**
   ```javascript
   async function fetchAvailableQuestionnaires()
   ```
   - Chama o endpoint `/api/questionnaire/_GetAvailableQuestionnaires`
   - Retorna array de questionários disponíveis

2. **`displayQuestionnaireSelection(questionnaires)`**
   ```javascript
   function displayQuestionnaireSelection(questionnaires)
   ```
   - Renderiza cards de seleção
   - Usa traduções (Translations)
   - Adiciona event listeners

3. **`selectQuestionnaire(code)`**
   ```javascript
   async function selectQuestionnaire(code)
   ```
   - Mostra loading spinner
   - Carrega questionário selecionado
   - Inicia configurador

4. **`loadSelectedQuestionnaire(code)`**
   ```javascript
   async function loadSelectedQuestionnaire(code)
   ```
   - Busca dados do questionário
   - Valida resposta
   - Chama `initializeQuestionnaireUI()`

5. **`initializeQuestionnaireUI()`**
   ```javascript
   function initializeQuestionnaireUI()
   ```
   - Inicializa interface do questionário
   - Setup de idiomas
   - Carrega perguntas

---

### Backend

#### Novo Endpoint
```
GET /api/questionnaire/_GetAvailableQuestionnaires
```

**Response Example:**
```json
[
  {
    "Code": "TAMPO_CONICO",
    "Description": "Configurador de Tampo Cónico",
    "Translations": {
      "enu": "Conical Head Configurator",
      "ptg": "Configurador de Tampo Cónico",
      "esp": "Configurador de Cabeza Cónica"
    }
  },
  {
    "Code": "SILO_TETRAPAK",
    "Description": "Configurador de Silo Tetrapak",
    "Translations": {
      "enu": "Tetrapak Silo Configurator",
      "ptg": "Configurador de Silo Tetrapak"
    }
  }
]
```

#### Ficheiros Modificados

**1. `server/api/index.js`**
```javascript
// Nova rota
router.get('/questionnaire/_GetAvailableQuestionnaires', getAvailableQuestionnairesList);
```

**2. `server/controllers/questionnaireController.js`**
```javascript
// Novo controller
const getAvailableQuestionnairesList = async (req, res) => {
  const questionnaires = await getAvailableQuestionnaires();
  res.json(questionnaires);
};
```

**3. `server/services/bcApiService.js`**
```javascript
// Novo serviço
const getAvailableQuestionnaires = async () => {
  // Chama Business Central ODataV4
  // ICRCFGConfInt_GetAvailableQuestionnaires
};
```

---

### CSS (`public/css/style.css`)

#### Novos Estilos

**Cards de Questionário:**
```css
.questionnaire-card {
  background: gradient;
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: all 0.3s;
}

.questionnaire-card:hover {
  transform: translateX(8px);
  border-color: rgba(255, 255, 255, 0.3);
}
```

**Loading Spinner:**
```css
.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #ffffff;
  animation: spin 0.8s linear infinite;
}
```

---

## 🌍 Suporte Multi-Idioma

### Como Funciona

1. **Backend retorna traduções:**
```json
"Translations": {
  "enu": "English text",
  "ptg": "Texto português",
  "esp": "Texto español",
  "fra": "Texte français"
}
```

2. **Frontend usa `getTranslatedText()`:**
```javascript
const description = getTranslatedText(
  q.Translations || q.Description, 
  currentLanguage, 
  defaultLanguage
);
```

3. **Fallback:**
   - Tenta idioma atual (ex: `ptg`)
   - Se não existir, tenta `Description`
   - Se não existir, tenta primeiro disponível

---

## 📊 Fluxo de Dados

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. GET /api/questionnaire/_GetAvailableQuestionnaires
       ↓
┌─────────────┐
│   Express   │
│   Server    │
└──────┬──────┘
       │ 2. getAvailableQuestionnairesList()
       ↓
┌─────────────┐
│ Controller  │
└──────┬──────┘
       │ 3. getAvailableQuestionnaires()
       ↓
┌─────────────┐
│ BC Service  │
└──────┬──────┘
       │ 4. POST ODataV4/ICRCFGConfInt_GetAvailableQuestionnaires
       ↓
┌─────────────┐
│  Business   │
│  Central    │
└──────┬──────┘
       │ 5. Returns questionnaire list
       ↓
┌─────────────┐
│   Browser   │ → Displays selection cards
└─────────────┘
```

---

## ✅ Funcionalidades

### Seleção de Questionário
- ✅ Busca lista do Business Central
- ✅ Mostra cards interativos
- ✅ Hover effects elegantes
- ✅ Numeração automática (01, 02, 03...)
- ✅ Click para selecionar

### Loading State
- ✅ Spinner animado
- ✅ Mensagem "Carregando configurador..."
- ✅ Transição suave

### Multi-Idioma
- ✅ Suporta múltiplas traduções
- ✅ Fallback inteligente
- ✅ Selector de idioma funcional

### Error Handling
- ✅ Tratamento de erros de API
- ✅ Mensagens de erro amigáveis
- ✅ Logging detalhado

---

## 🎨 Animações

### Shine Effect
```css
.questionnaire-card::before {
  /* Gradiente que passa da esquerda para direita */
  background: linear-gradient(90deg, transparent, white, transparent);
  transition: left 0.6s ease;
}
```

### Slide Effect
```css
.questionnaire-card:hover {
  transform: translateX(8px);
}
```

### Arrow Animation
```css
.questionnaire-arrow {
  transition: all 0.3s ease;
}

.questionnaire-card:hover .questionnaire-arrow {
  transform: translateX(5px);
}
```

---

## 🐛 Error Handling

### Frontend
```javascript
try {
  availableQuestionnaires = await fetchAvailableQuestionnaires();
} catch (error) {
  console.error("Error:", error);
  container.innerHTML = `<p style="color: #ff4444;">Error: ${error.message}</p>`;
}
```

### Backend
```javascript
try {
  const questionnaires = await getAvailableQuestionnaires();
  res.json(questionnaires);
} catch (error) {
  console.error('Error:', error.message);
  res.status(500).json({ 
    error: 'Failed to retrieve questionnaires', 
    details: error.message 
  });
}
```

---

## 📱 Responsividade

Os cards de seleção são totalmente responsivos:

**Desktop:**
- Cards largos
- Hover effects completos
- Transições suaves

**Tablet:**
- Cards adaptados
- Touch-friendly

**Mobile:**
- Cards empilhados
- Tap para selecionar
- Texto ajustado

---

## 🚀 Como Testar

1. **Iniciar servidor:**
```bash
npm start
```

2. **Aceder:**
```
http://localhost:3000
```

3. **Observar:**
   - ✅ Lista de questionários aparece
   - ✅ Cards são clicáveis
   - ✅ Loading aparece ao selecionar
   - ✅ Configurador carrega após seleção

---

## 📝 Variáveis Importantes

### JavaScript
```javascript
// Variáveis globais
let selectedQuestionnaireCode = null;
let availableQuestionnaires = [];
let questionnaireData = null;
```

### API Endpoint
```javascript
// URL do endpoint
'/api/questionnaire/_GetAvailableQuestionnaires'
```

### Business Central
```javascript
// Web Service
'ICRCFGConfInt_GetAvailableQuestionnaires'
```

---

## ✨ Melhorias Futuras (Opcional)

1. **Pesquisa:** Campo para filtrar questionários
2. **Categorias:** Agrupar questionários por tipo
3. **Favoritos:** Salvar questionários frequentes
4. **Thumbnails:** Adicionar imagens aos cards
5. **Histórico:** Mostrar últimos questionários usados
6. **Descrição Expandida:** Mais detalhes ao hover

---

## 🎉 Resultado Final

**Etapa 1: Seleção**
- Interface elegante com design TEKEVER
- Cards interativos e responsivos
- Animações suaves
- Multi-idioma

**Etapa 2: Loading**
- Spinner animado
- Feedback visual claro

**Etapa 3: Configurador**
- Carrega o questionário selecionado
- Funcionamento normal do configurador

---

**Status: ✅ Implementado e Funcional**

*Toda a funcionalidade de seleção de questionário está operacional e integrada com o Business Central!*

---

Data: Novembro 2025

