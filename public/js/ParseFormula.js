// ParseFormula.js (compatível com fórmula global via window.formulajs)

function EXIST(valor, array) {
  return array.includes(valor);
}

function sanitizeFormula(formula, att, cst) {
  if (!formula || formula.trim() === "") return "true"; // Default to true if formula is empty

  // Make a copy for modification
  let processedFormula = String(formula);

  processedFormula = processedFormula
    .replace(/<>/g, '!=')
    .replace(/([^=!><])=([^=])/g, '$1==$2') // transforma '=' em '==' (cuidado para não pegar >=, <=, !=, ==)
    .replace(/(?<!\|)\|(?!\|)/g, '||') // só troca se for um único '|'
    .replace(/(?<!\&)\&(?!\&)/g, '&&'); // só troca se for um único '&'

  // Basic security checks
  if (processedFormula.includes("===")) throw new Error("A fórmula não pode conter o operador ===");
  if (/\b(var|let|const|function|window|document|alert|eval|new Function|setTimeout|setInterval|clearTimeout|clearInterval|constructor|prototype|__proto__|this)\b/i.test(processedFormula)) {
    throw new Error("Uso de palavras reservadas ou APIs perigosas proibido na fórmula.");
  }
  // Check for property access that might lead to prototype chain climbing
  if (/[\w\s]*(?:\.__proto__|\.constructor|\.prototype)\[?[\w\s]*\]?/i.test(processedFormula)) {
    throw new Error("Acesso a propriedades perigosas como __proto__, constructor, ou prototype não é permitido.");
  }


  const checkProps = (matches, source, type) => {
    if (!matches) return;
    matches.forEach(match => {
      const prop = match.split('.')[1];
      if (!source.hasOwnProperty(prop)) {
        throw new Error(`${type} \"${prop}\" não existe no contexto.`);
      }
    });
  };

  // Check for existence of att.X and cst.Y properties
  // Ensure att and cst are objects before trying to match properties
  if (typeof att === 'object' && att !== null) {
    checkProps(processedFormula.match(/\batt\.\w+\b/g), att, "Atributo");
  }
  if (typeof cst === 'object' && cst !== null) {
    checkProps(processedFormula.match(/\bcst\.\w+\b/g), cst, "Constante");
  }

  return processedFormula;
}

function extractAttributesAndConstants(attributesArray, attributeConstantsArray) {
  const att = {};
  const cstatt = {};

  if (!attributesArray || !Array.isArray(attributesArray)) return { att, cstatt };

  attributesArray.forEach(element => {
    if (typeof element !== 'object' || element === null) return;
    const attName = Object.keys(element)[0];
    const attValue = Object.values(element)[0];
    att[attName] = attValue;

    if (attributeConstantsArray && Array.isArray(attributeConstantsArray)) {
      attributeConstantsArray.forEach(def => {
        if (typeof def !== 'object' || def === null) return;
        const attrKey = Object.keys(def)[0];
        if (attrKey === attName) {
          cstatt[attName] = {};
          const subDefs = Object.values(def)[0];
          if(Array.isArray(subDefs)){
            subDefs.forEach(sub => {
              if (typeof sub !== 'object' || sub === null) return;
              const subKey = Object.keys(sub)[0];
              const subVal = Object.values(sub)[0];
              cstatt[attName][subKey] = subVal;
            });
          }
        }
      });
    }
  });

  return { att, cstatt };
}

function extractConstants(constantsArray) {
  const cst = {};
  if (!constantsArray || !Array.isArray(constantsArray)) return cst;
  constantsArray.forEach(element => {
    if (typeof element !== 'object' || element === null) return;
    const key = Object.keys(element)[0];
    const val = Object.values(element)[0];
    cst[key] = val;
  });
  return cst;
}

function _baseEvaluate(formula, qobj, context, isValueFormula) {
  try {
    const { allAnswers, constants, attributeConstants } = context || {};
    const { att, cstatt } = extractAttributesAndConstants(allAnswers, attributeConstants);
    const cst = extractConstants(constants);

    const formulajsFunctions = window.formulajs || {};
    let functionDeclarations = "";
    const argsForNewFunction = { __att__: att, __cst__: cst, __cstatt__: cstatt, __qobj__: qobj, __EXIST__: EXIST };
    const argNamesForNewFunction = ["__att__", "__cst__", "__cstatt__", "__qobj__", "__EXIST__"];

    for (const key in formulajsFunctions) {
      if (Object.hasOwnProperty.call(formulajsFunctions, key) && typeof formulajsFunctions[key] === 'function') {
        // Ensure the key is a valid variable name and doesn't conflict with existing args or keywords
        if (!argNamesForNewFunction.includes(key) && !(/^\d/.test(key)) && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(key)) {
          const dynamicArgName = `__formulajs_${key}__`;
          functionDeclarations += `var ${key} = ${dynamicArgName};\n`;
          argsForNewFunction[dynamicArgName] = formulajsFunctions[key];
          argNamesForNewFunction.push(dynamicArgName);
        }
      }
    }

    const sanitizedFormula = sanitizeFormula(formula, att, cst);

    const finalArgNames = Object.keys(argsForNewFunction);
    const finalArgValues = Object.values(argsForNewFunction);
    
    const functionBody = `
      var att = __att__;
      var cst = __cst__;
      var cstatt = __cstatt__;
      var qobj = __qobj__;
      var EXIST = __EXIST__;
      ${functionDeclarations}
      return (${sanitizedFormula});
    `;

    const f = new Function(...finalArgNames, functionBody);
    return f(...finalArgValues);

  } catch (e) {
    console.warn(isValueFormula ? "Erro ao avaliar fórmula de valor:" : "Erro ao avaliar fórmula:", formula, e.message, e.stack);
    return isValueFormula ? null : false;
  }
}

window.evaluateFormula = function(formula, qobj, context) {
    return _baseEvaluate(formula, qobj, context, false);
};

window.evaluateValueFormula = function(formula, qobj, context) {
    return _baseEvaluate(formula, qobj, context, true);
};

window.evaluateValidationFormula = function (formula, qobj, context) {
  try {
    const result = _baseEvaluate(formula, qobj, context, false);
    if (!result) return "Resposta inválida para a lógica definida.";
    return null;
  } catch (e) {
    return `Erro na validação: ${e.message}`;
  }
};
