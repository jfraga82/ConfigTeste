// main.js - Configurador TEKEVER (sem 3D)

let questions = [];
let answers = {};
let context = {
  allAnswers: [],
  constants: [],
  attributeConstants: []
};

let currentLanguage = 'en'; // Default language
const defaultLanguage = 'en';

/**
 * Sanitize HTML to prevent XSS attacks
 * Converts text to safe HTML by escaping special characters
 */
function sanitizeHTML(text) {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Highlight search term safely without XSS risk
 */
function highlightSearchTerm(text, searchTerm) {
  if (!searchTerm || typeof text !== 'string') return sanitizeHTML(text);
  
  // Escape regex special characters in search term
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedTerm})`, 'gi');
  const sanitized = sanitizeHTML(text);
  
  // Only highlight after sanitization
  return sanitized.replace(regex, '<mark>$1</mark>');
}

/**
 * Retrieves translated text from a multi-language object.
 */
function getTranslatedText(textObject, lang, defaultLang = 'en') {
  if (typeof textObject === 'string') {
    return textObject;
  }
  if (textObject && typeof textObject === 'object') {
    if (textObject.enu) {
      return textObject.enu;
    }
    if (textObject[lang]) {
      return textObject[lang];
    }
    if (textObject[defaultLang]) {
      return textObject[defaultLang];
    }
    const firstKey = Object.keys(textObject)[0];
    return firstKey ? textObject[firstKey] : "";
  }
  return "";
}

let questionnaireData = null;
let selectedQuestionnaireCode = null;
let availableQuestionnaires = [];

// Video Control Functions
function initializeVideo() {
  const video = document.getElementById('product-video');
  
  if (video) {
    // Preload video
    video.preload = 'auto';
    
    // Autoplay with error handling
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('✅ Video autoplay started');
        })
        .catch(err => {
          console.warn('⚠️ Video autoplay prevented by browser:', err);
          // Browser prevented autoplay, but video will play on user interaction
        });
    }
    
    // Logging
    video.addEventListener('loadstart', function() {
      console.log('📹 Video loading...');
    });
    
    video.addEventListener('canplay', function() {
      console.log('✅ Video ready to play');
    });
    
    video.addEventListener('ended', function() {
      console.log('🏁 Video finished playing');
    });
    
    // Error handling
    video.addEventListener('error', function(e) {
      console.error('❌ Video error:', e);
    });
  }
}

// Dropdown Autocomplete Component
function renderDropdownAutocomplete(q, initialValue) {
  const wrapper = document.createElement("div");
  wrapper.className = "dropdown-autocomplete";

  const inputBox = document.createElement("input");
  inputBox.type = "text";
  inputBox.placeholder = getTranslatedText({
    pt: "Filter options...", 
    en: "Filter options...", 
    es: "Filter options...", 
    zh: "Filter options..."
  }, currentLanguage);
  inputBox.className = "dropdown-input";
  inputBox.autocomplete = "off";
  
  const initialOption = q.Options.find(o => o.ID === initialValue);
  inputBox.value = initialOption ? getTranslatedText(initialOption.Name, currentLanguage) : "";

  const list = document.createElement("ul");
  list.className = "dropdown-list";

  function renderList(filter = "") {
    list.innerHTML = "";
    q.Options
      .filter(o => getTranslatedText(o.Name, currentLanguage).toLowerCase().includes(filter.toLowerCase()))
      .forEach(opt => {
        const item = document.createElement("li");
        item.className = "dropdown-item";
        item.textContent = getTranslatedText(opt.Name, currentLanguage);
        item.onmousedown = () => {
          inputBox.value = getTranslatedText(opt.Name, currentLanguage);
          handleAnswer(q, opt.ID);
          list.innerHTML = "";
        };
        list.appendChild(item);
      });
  }

  inputBox.oninput = () => renderList(inputBox.value);
  inputBox.onfocus = () => renderList("");
  inputBox.onblur = () => setTimeout(() => { 
    if (list.parentElement === wrapper) list.innerHTML = ""; 
  }, 300);

  wrapper.appendChild(inputBox);
  wrapper.appendChild(list);
  return wrapper;
}

function loadQuestions(qList) {
  questions = qList;
  answers = {};
  context.allAnswers = [];
  renderQuestions();
}

function renderQuestions() {
  const container = document.getElementById("question-container");
  if (!container) {
    console.error("Container de perguntas não encontrado!");
    return;
  }
  
  updateAttributeConstants();
  
  container.innerHTML = "";
  let firstUnansweredQuestionElement = null;
  let hasDefaultValueChanges = false;
  let allQuestionsAnswered = true;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    context.allAnswers = Object.entries(answers).map(([k, v]) => ({ [k]: v }));

    const visible = !q.ActivationFormula || window.evaluateFormula(q.ActivationFormula, q, context);
    if (!visible) {
      if (answers.hasOwnProperty(q.AttributeID)) {
        delete answers[q.AttributeID];
      }
      continue;
    }

    let currentValue = answers[q.AttributeID];
    const evaluatedDefaultValue = window.evaluateValueFormula(q.DefaultValue || "", q, context);
    const temResposta = currentValue !== undefined && currentValue !== "";
    const hasOriginalDefaultSetting = q.DefaultValue !== undefined && q.DefaultValue !== null && q.DefaultValue !== "";
    const hasResolvedDefaultValue = evaluatedDefaultValue !== undefined && evaluatedDefaultValue !== null && evaluatedDefaultValue !== "";
    const temDefaultEfetivo = hasOriginalDefaultSetting && hasResolvedDefaultValue;

    if (!temResposta && temDefaultEfetivo) {
      currentValue = evaluatedDefaultValue;
      answers[q.AttributeID] = currentValue;
      context.allAnswers = Object.entries(answers).map(([k, v]) => ({ [k]: v }));
      hasDefaultValueChanges = true;
      console.log(`💡 Default value applied for ${q.AttributeID}: ${currentValue}`);
    }

    const div = document.createElement("div");
    div.className = "question-block";
    div.setAttribute("data-attr", q.AttributeID);

    const label = document.createElement("label");
    label.setAttribute("for", `q-${q.AttributeID}`);
    label.innerHTML = `<strong>${getTranslatedText(q.Description, currentLanguage)}</strong>`;
    div.appendChild(label);

    let input;
    if ((q.DataType === "Option" || q.DataType === "Opção") && Array.isArray(q.Options)) {
      if (q.Options.length <= 5) {
        input = document.createElement("div");
        input.className = "option-group";
        q.Options.forEach(opt => {
          const optWrapper = document.createElement("div");
          const optLabel = document.createElement("label");
          optLabel.className = "option-item items-center";
          optLabel.setAttribute("for", `q-${q.AttributeID}-${opt.ID}`);

          const radio = document.createElement("input");
          radio.type = "radio";
          radio.id = `q-${q.AttributeID}-${opt.ID}`;
          radio.name = q.AttributeID;
          radio.value = opt.ID;
          if (currentValue == opt.ID) {
            radio.checked = true;
            optLabel.classList.add("selected");
          }
          radio.onchange = () => handleAnswer(q, radio.value);

          optLabel.appendChild(radio);
          const txt = document.createElement("span");
          txt.textContent = getTranslatedText(opt.Name, currentLanguage);
          optLabel.appendChild(txt);

          optWrapper.appendChild(optLabel)
          input.appendChild(optWrapper);
        });
      } else {
        input = renderDropdownAutocomplete(q, currentValue);
      }
    } else {
      input = document.createElement("input");
      input.id = `q-${q.AttributeID}`;
      input.type = q.DataType === "Number" ? "number" : "text";
      input.name = q.AttributeID;
      input.value = currentValue ?? "";
      input.onchange = () => handleAnswer(q, input.value);
    }
    input.setAttribute("aria-label", getTranslatedText(q.Description, currentLanguage));

    div.appendChild(input);
    const errorMsg = document.createElement("div");
    errorMsg.className = "error-msg";
    div.appendChild(errorMsg);
    container.appendChild(div);

    if (!temResposta && !temDefaultEfetivo) {
      firstUnansweredQuestionElement = div;
      allQuestionsAnswered = false;
      break;
    }
  }
  
  // Check if all questions are answered
  if (allQuestionsAnswered && questions.length > 0) {
    console.log("✅ All questions answered!");
    setTimeout(() => {
      showCreateProductDialog();
    }, 300);
  }

  // Scroll to first unanswered question
  if (firstUnansweredQuestionElement) {
    setTimeout(() => {
      const inputElement = firstUnansweredQuestionElement.querySelector(
        'input[type="text"], input[type="number"], .dropdown-input, input[type="radio"]'
      );

      if (inputElement) {
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        inputElement.focus({ preventScroll: true }); 
      } else {
        firstUnansweredQuestionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  }

  setTimeout(() => {
    document.querySelectorAll("input[type='radio']:checked").forEach(r => {
      const parentLabel = r.closest("label.option-item");
      if (parentLabel) parentLabel.classList.add("selected");
    });
  }, 0);
}

function handleAnswer(question, value) {
  if (value === "" && (question.DataType === "Option" || question.DataType === "Opção")) {
    delete answers[question.AttributeID];
  } else {
    answers[question.AttributeID] = value;
  }

  updateAttributeConstants();

  const questionIndex = questions.findIndex(q => q.AttributeID === question.AttributeID);
  const toRemove = questions.slice(questionIndex + 1).map(q => q.AttributeID);
  toRemove.forEach(key => delete answers[key]);

  renderQuestions();
  
  console.log(`💡 Answer changed for ${question.AttributeID}: ${value}`);
}

// Show Create Product Dialog
function showCreateProductDialog() {
  // Check if dialog already exists
  if (document.getElementById('create-product-dialog')) {
    return;
  }
  
  const dialog = document.createElement('div');
  dialog.id = 'create-product-dialog';
  dialog.className = 'dialog-overlay';
  dialog.innerHTML = `
    <div class="dialog-box">
      <div class="dialog-header">
        <h3 class="dialog-title">Configuration Complete</h3>
      </div>
      <div class="dialog-content">
        <p class="dialog-message">All parameters have been successfully defined!</p>
        <p class="dialog-question">Would you like to create a new product with this configuration?</p>
      </div>
      <div class="dialog-actions">
        <button class="dialog-btn dialog-btn-secondary" onclick="closeCreateProductDialog()">
          Not now
        </button>
        <button class="dialog-btn dialog-btn-primary" onclick="createProductFromConfiguration()">
          Create Product
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  // Fade in animation
  setTimeout(() => {
    dialog.classList.add('active');
  }, 10);
}

// Close Create Product Dialog
window.closeCreateProductDialog = function() {
  const dialog = document.getElementById('create-product-dialog');
  if (dialog) {
    dialog.classList.remove('active');
    setTimeout(() => {
      dialog.remove();
    }, 300);
  }
}

// Return to Questionnaire Selection (reset everything)
window.returnToQuestionnaireSelection = function() {
  // Close dialog
  closeCreateProductDialog();
  
  // Reset state
  questions = [];
  answers = {};
  context.allAnswers = [];
  context.attributeConstants = [];
  selectedQuestionnaireCode = null;
  questionnaireData = null;
  
  // Show questionnaire selection
  setTimeout(() => {
    if (availableQuestionnaires && availableQuestionnaires.length > 0) {
      displayQuestionnaireSelection(availableQuestionnaires);
    } else {
      // Reload available questionnaires
      fetchAvailableQuestionnaires()
        .then(questionnaires => {
          availableQuestionnaires = questionnaires;
          displayQuestionnaireSelection(questionnaires);
    })
    .catch(error => {
          console.error('Error reloading questionnaires:', error);
          const container = document.getElementById("question-container");
          if (container) {
            container.innerHTML = `<p style="color: #ff4444;">Error: ${error.message}</p>`;
          }
        });
    }
  }, 300);
}

// Create Product from Configuration
window.createProductFromConfiguration = async function() {
  // Show loading
  const dialog = document.getElementById('create-product-dialog');
  if (dialog) {
    dialog.querySelector('.dialog-content').innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="text-white mt-4">Engineering your product...</p>
      </div>
    `;
    dialog.querySelector('.dialog-actions').style.display = 'none';
  }
  
  try {
    // Prepare attributes array with AttributeName
    const attributes = Object.entries(answers).map(([attributeID, value]) => ({
      AttributeName: attributeID,
      Value: String(value)
    }));
    
    const payload = {
      QuestionnaireCode: selectedQuestionnaireCode,
      Attributes: attributes
    };
    
    console.log('Creating product with payload:', payload);
    
    const response = await fetch('/api/product/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server validation error:', errorData);
      const errorMsg = errorData.details 
        ? JSON.stringify(errorData.details) 
        : errorData.error || 'Failed to create product';
      throw new Error(errorMsg);
    }
    
    const result = await response.json();
    console.log('Product creation response:', result);
    
    // Check if Business Central returned an error
    if (result.Success === false || result.Error) {
      throw new Error(result.Error || 'Failed to create product');
    }
    
    // Show success dialog
    showProductCreatedDialog(result);
    
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Show error dialog
    if (dialog) {
      dialog.querySelector('.dialog-content').innerHTML = `
        <div class="error-container">
          <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="error-title">Product Creation Error</p>
          <p class="error-message">${error.message}</p>
        </div>
      `;
      dialog.querySelector('.dialog-actions').innerHTML = `
        <button class="dialog-btn dialog-btn-primary" onclick="closeCreateProductDialog()">
          Close
        </button>
      `;
      dialog.querySelector('.dialog-actions').style.display = 'flex';
    }
  }
}

// Show Product Created Dialog
function showProductCreatedDialog(result) {
  const dialog = document.getElementById('create-product-dialog');
  if (!dialog) return;
  
  // Extract product info from result - try multiple field names
  const productNo = result.ItemNo || result.ProductNo || result.No || 'N/A';
  const description = result.ItemDescription || result.Description || result.ProductDescription || 'N/A';
  
  dialog.querySelector('.dialog-header').innerHTML = `
    <h3 class="dialog-title">✅ Product Successfully Created</h3>
  `;
  
  dialog.querySelector('.dialog-content').innerHTML = `
    <div class="product-result">
      <div class="product-field">
        <label class="product-label">Product Number:</label>
        <div class="product-value-row">
          <span class="product-value" id="product-no">${productNo}</span>
          <button class="copy-btn" onclick="copyToClipboard('product-no', this)" title="Copy to clipboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="product-field">
        <label class="product-label">Description:</label>
        <div class="product-value-row">
          <span class="product-value" id="product-desc">${description}</span>
          <button class="copy-btn" onclick="copyToClipboard('product-desc', this)" title="Copy to clipboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
  
  dialog.querySelector('.dialog-actions').innerHTML = `
    <button class="dialog-btn dialog-btn-primary" onclick="returnToQuestionnaireSelection()">
      New Configuration
    </button>
  `;
  dialog.querySelector('.dialog-actions').style.display = 'flex';
}

// Copy to Clipboard
window.copyToClipboard = function(elementId, button) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const text = element.textContent;
  
  // Use modern clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showCopyFeedback(button);
    }).catch(err => {
      console.error('Failed to copy:', err);
      fallbackCopyTextToClipboard(text, button);
    });
  } else {
    fallbackCopyTextToClipboard(text, button);
  }
}

// Fallback copy method
function fallbackCopyTextToClipboard(text, button) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showCopyFeedback(button);
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }
  
  document.body.removeChild(textArea);
}

// Show copy feedback
function showCopyFeedback(button) {
  const originalHTML = button.innerHTML;
  button.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;
  button.classList.add('copied');
  
  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.classList.remove('copied');
  }, 2000);
}

/**
 * Updates the attributeConstants in context based on currently selected answers
 */
function updateAttributeConstants() {
  context.attributeConstants = [];
  
  Object.keys(answers).forEach(attributeID => {
    const answer = answers[attributeID];
    if (!answer) return;
    
    const question = questions.find(q => q.AttributeID === attributeID);
    if (!question || !question.Options) return;
    
    const selectedOption = question.Options.find(opt => opt.ID === answer);
    if (!selectedOption || !selectedOption.AttributeConstants) return;
    
    const attributeConstantsEntry = {
      [attributeID]: selectedOption.AttributeConstants
    };
    
    context.attributeConstants.push(attributeConstantsEntry);
  });
  
  console.log("Updated AttributeConstants:", context.attributeConstants);
}

// Resizer removido - layout fixo 50/50 com transição suave

// Fetch Available Questionnaires
async function fetchAvailableQuestionnaires() {
  try {
    const response = await fetch('/api/questionnaire/_GetAvailableQuestionnaires');
    if (!response.ok) {
      throw new Error(`Failed to fetch questionnaires: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching available questionnaires:", error);
    throw error;
  }
}

// Display Questionnaire Selection Screen
function displayQuestionnaireSelection(questionnaires) {
  const container = document.getElementById("question-container");
  container.innerHTML = "";
  
  // Scroll to top
  container.scrollTop = 0;
  
  // Hide back button when showing selection
  const backBtn = document.getElementById('back-to-list-btn');
  if (backBtn) backBtn.style.display = 'none';
  
  // Title
  const title = document.createElement("div");
  title.className = "mb-6 text-center";
  title.innerHTML = `
    <h2 class="text-2xl font-bold text-white mb-2">Select Your Configurator</h2>
    <p class="text-sm text-gray-400">Discover the perfect solution engineered for your needs</p>
  `;
  container.appendChild(title);
  
  // Search box
  const searchWrapper = document.createElement("div");
  searchWrapper.className = "search-wrapper";
  searchWrapper.innerHTML = `
    <div class="search-box">
      <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
      <input 
        type="text" 
        id="questionnaire-search" 
        class="search-input" 
        placeholder="Search configurator..."
        autocomplete="off"
      >
      <button id="clear-search" class="clear-search-btn" style="display: none;">×</button>
    </div>
    <div id="search-results-count" class="search-results-count"></div>
  `;
  container.appendChild(searchWrapper);
  
  // Cards container
  const cardsContainer = document.createElement("div");
  cardsContainer.id = "questionnaires-cards-container";
  container.appendChild(cardsContainer);
  
  // Render all cards initially
  renderQuestionnaireCards(questionnaires, cardsContainer);
  
  // Search functionality
  const searchInput = document.getElementById("questionnaire-search");
  const clearBtn = document.getElementById("clear-search");
  const resultsCount = document.getElementById("search-results-count");
  
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    // Show/hide clear button
    clearBtn.style.display = searchTerm ? "flex" : "none";
    
    // Filter questionnaires
    const filtered = questionnaires.filter(q => {
      const description = getTranslatedText(q.Translations || q.Description, currentLanguage, defaultLanguage).toLowerCase();
      const code = q.Code.toLowerCase();
      return description.includes(searchTerm) || code.includes(searchTerm);
    });
    
    // Update results count
    if (searchTerm) {
      resultsCount.textContent = `${filtered.length} ${filtered.length !== 1 ? 'solutions' : 'solution'} found`;
      resultsCount.style.display = "block";
    } else {
      resultsCount.style.display = "none";
    }
    
    // Render filtered cards
    renderQuestionnaireCards(filtered, cardsContainer, searchTerm);
  });
  
  // Clear search
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchInput.focus();
    clearBtn.style.display = "none";
    resultsCount.style.display = "none";
    renderQuestionnaireCards(questionnaires, cardsContainer);
  });
}

// Render questionnaire cards
function renderQuestionnaireCards(questionnaires, container, searchTerm = "") {
  container.innerHTML = "";
  
  if (questionnaires.length === 0) {
    const noResults = document.createElement("div");
    noResults.className = "no-results";
    noResults.innerHTML = `
      <svg class="no-results-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="no-results-text">No configurator found</p>
      <p class="no-results-hint">Try a different search term</p>
    `;
    container.appendChild(noResults);
    return;
  }
  
  questionnaires.forEach((q, index) => {
    const card = document.createElement("div");
    card.className = "questionnaire-card";
    card.setAttribute("data-code", q.Code);
    
    let description = getTranslatedText(q.Translations || q.Description, currentLanguage, defaultLanguage);
    let code = q.Code;
    
    // Sanitize and highlight search term safely
    if (searchTerm) {
      description = highlightSearchTerm(description, searchTerm);
      code = highlightSearchTerm(code, searchTerm);
    } else {
      description = sanitizeHTML(description);
      code = sanitizeHTML(code);
    }
    
    card.innerHTML = `
      <div class="questionnaire-card-content">
        <div class="questionnaire-number">${(index + 1).toString().padStart(2, '0')}</div>
        <div class="questionnaire-info">
          <h3 class="questionnaire-title">${description}</h3>
          <p class="questionnaire-code">Code: ${code}</p>
        </div>
        <div class="questionnaire-arrow">→</div>
      </div>
    `;
    
    card.addEventListener("click", () => selectQuestionnaire(q.Code));
    container.appendChild(card);
  });
}

// Select Questionnaire and Load Configuration
async function selectQuestionnaire(code) {
  selectedQuestionnaireCode = code;
  console.log(`📋 Questionnaire selected: ${code}`);
  
  // Show loading
  const container = document.getElementById("question-container");
  container.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p class="text-white mt-4">Loading your configurator...</p>
    </div>
  `;
  
  // Load questionnaire
  await loadSelectedQuestionnaire(code);
}

// Load Selected Questionnaire
async function loadSelectedQuestionnaire(code) {
  try {
    const response = await fetch(`/api/questionnaire/${code}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch questionnaire: ${response.status} ${response.statusText} - ${errorData.details || errorData.error}`);
    }
    const rawData = await response.json();
    console.log("Raw response from server:", rawData);
    
    if (rawData.value && typeof rawData.value === 'string') {
      questionnaireData = JSON.parse(rawData.value);
    } else if (rawData.Code && rawData.Questions) {
      questionnaireData = rawData;
    } else {
      throw new Error("Invalid response format from server");
    }
    
    console.log("Parsed questionnaire data:", questionnaireData);
    
    if (!questionnaireData || !questionnaireData.Questions || !Array.isArray(questionnaireData.Questions)) {
      throw new Error("Invalid questionnaire data: missing or invalid Questions array");
    }
    
    // Initialize questionnaire UI
    initializeQuestionnaireUI();
    
  } catch (fetchError) {
    console.error("Error fetching questionnaire data:", fetchError);
    const container = document.getElementById("question-container");
    if (container) container.innerHTML = `<p style="color: #ff4444;">Configuration loading error: ${fetchError.message}. Please try again.</p>`;
    return;
  }
  }

// Initialize Questionnaire UI (after loading)
function initializeQuestionnaireUI() {
  if (!questionnaireData || !questionnaireData.Description || !questionnaireData.Questions) {
    console.error("Fetched questionnaire data is invalid or incomplete.");
    const container = document.getElementById("question-container");
    if (container) container.innerHTML = `<p style="color: #ff4444;">Invalid configuration data. Please contact support.</p>`;
    return;
  }

  // Show back button when in questionnaire
  const backBtn = document.getElementById('back-to-list-btn');
  if (backBtn) {
    backBtn.style.display = 'flex';
    backBtn.onclick = () => {
      if (confirm('Return to configurator selection? Current answers will be lost.')) {
        returnToQuestionnaireSelection();
      }
    };
  }

  // Initialize language dropdown
  const langSelectElement = document.getElementById('lang-select');
  let availableLanguages = [];
  
  if (questionnaireData.Description && typeof questionnaireData.Description === 'object') {
    availableLanguages = Object.keys(questionnaireData.Description);
  } else if (questionnaireData.Questions && questionnaireData.Questions.length > 0) {
    const firstQuestion = questionnaireData.Questions[0];
    if (firstQuestion.Description && typeof firstQuestion.Description === 'object') {
      availableLanguages = Object.keys(firstQuestion.Description);
    }
  }
  
  if (availableLanguages.includes('enu') && !availableLanguages.includes('en')) {
    currentLanguage = 'enu';
  }

  if (langSelectElement) {
    langSelectElement.innerHTML = ''; 
    if (availableLanguages.length > 0) {
      availableLanguages.forEach(langCode => {
        const option = document.createElement('option');
        option.value = langCode;
        const displayName = langCode === 'enu' ? 'EN' : langCode.toUpperCase();
        option.textContent = displayName; 
        langSelectElement.appendChild(option);
      });
      
      const preferredLanguage = localStorage.getItem('preferredLanguage');
      if (preferredLanguage && availableLanguages.includes(preferredLanguage)) {
        currentLanguage = preferredLanguage;
      } else if (availableLanguages.includes(defaultLanguage)) {
        currentLanguage = defaultLanguage;
      } else if (availableLanguages.includes('enu')) {
        currentLanguage = 'enu';
      } else {
        currentLanguage = availableLanguages[0]; 
      }
    langSelectElement.value = currentLanguage;
    langSelectElement.addEventListener('change', (event) => {
        setLanguage(event.target.value);
    });
    } else {
      langSelectElement.style.display = 'none';
    }
  } else {
    console.warn("Language select element ('lang-select') not found.");
  }
  
  setLanguage(currentLanguage);
  document.title = getTranslatedText(questionnaireData.Description, currentLanguage, defaultLanguage) || 'Product Configurator - TEKEVER';

  context.constants = questionnaireData.Constants || [];

  loadQuestions(questionnaireData.Questions);
  updateAttributeConstants();

  console.log("✅ Questionnaire loaded successfully.");
}

// Main Initialization
window.addEventListener("DOMContentLoaded", async () => {
  console.log("DOMContentLoaded event fired.");
  
  // Initialize video controls
  initializeVideo();
  
  // Fetch available questionnaires first
  try {
    availableQuestionnaires = await fetchAvailableQuestionnaires();
    console.log("Available questionnaires:", availableQuestionnaires);
    
    if (!availableQuestionnaires || availableQuestionnaires.length === 0) {
      throw new Error("No questionnaires available");
    }
    
    // Display questionnaire selection
    displayQuestionnaireSelection(availableQuestionnaires);
    
  } catch (error) {
    console.error("Error initializing configurator:", error);
      const container = document.getElementById("question-container");
      if (container) {
        container.innerHTML = `<p style="color: #ff4444;">Configurator initialization error: ${error.message}. Please try again.</p>`;
      }
    return;
  }

  console.log("✅ TEKEVER Configurator initialized successfully.");
});

/**
 * Sets the current language and re-renders questions.
 */
function setLanguage(langCode) {
  let availableLanguages = [];
  
  if (questionnaireData && questionnaireData.Description && typeof questionnaireData.Description === 'object') {
    availableLanguages = Object.keys(questionnaireData.Description);
  } else if (questionnaireData && questionnaireData.Questions && questionnaireData.Questions.length > 0) {
    const firstQuestion = questionnaireData.Questions[0];
    if (firstQuestion.Description && typeof firstQuestion.Description === 'object') {
      availableLanguages = Object.keys(firstQuestion.Description);
    }
  }
  
  if (availableLanguages.includes(langCode)) {
    currentLanguage = langCode;
    localStorage.setItem('preferredLanguage', langCode);
    console.log(`Language set to: ${currentLanguage}`);
    
    if (questionnaireData && questionnaireData.Description) {
        document.title = getTranslatedText(questionnaireData.Description, currentLanguage, defaultLanguage) || 'Product Configurator - TEKEVER';
    } else {
        document.title = 'Product Configurator - TEKEVER';
    }
    
    if (questions && questions.length > 0) {
        renderQuestions(); 
    }
  } else {
    console.warn(`Language code "${langCode}" is not supported. Available: ${availableLanguages.join(', ')}`);
  }
}

/**
 * Initialize Application
 * Checks authentication before loading configurator
 */
async function initializeApplication() {
  console.log('[App] Initializing application...');

  // Check authentication first
  if (typeof initializeAuth === 'function') {
    await initializeAuth();
    console.log('[App] ✅ Authentication verified');
  } else {
    console.warn('[App] ⚠️ Auth module not loaded');
  }

  // Load questionnaire selection screen
  console.log('[App] Loading questionnaire selection...');
  
  // The rest of the initialization happens in the questionnaire selection
  // which is already implemented in the fetchAvailableQuestionnaires function
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
  initializeApplication();
}
