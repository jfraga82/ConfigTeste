# 🔧 INSTRUÇÕES: CONFIGURAR VARIÁVEIS NO AZURE APP SERVICE

## 📋 **PASSO A PASSO:**

### **1. Abrir Configuração Avançada no Azure**

```
1. Azure Portal → App Service "TesteAppJF"
2. Menu lateral → Configuration (Configuração)
3. Clicar em "Advanced edit" (Edição avançada) no topo
4. Vai abrir um editor JSON
```

---

### **2. Preparar o JSON**

**Abrir o ficheiro:** `AZURE_CONFIG_JSON.json` (na raiz do projeto)

**Substituir estes valores:**

#### **Do seu .env local, copiar:**

```
BC_CLIENT_ID=????????????
BC_CLIENT_SECRET=????????????
BC_TENANT_ID=c87b2897-7933-41bc-9704-9a56e906d373
AZURE_AD_CLIENT_ID=????????????
AZURE_AD_CLIENT_SECRET=????????????
AZURE_AD_TENANT_ID=c87b2897-7933-41bc-9704-9a56e906d373
```

#### **Gerar novo SESSION_SECRET:**

No PowerShell:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Ou usar qualquer gerador de passwords aleatório (mínimo 32 caracteres).

---

### **3. Editar AZURE_CONFIG_JSON.json**

**Substituir no ficheiro JSON:**

1. `"SUBSTITUIR_PELO_SEU_BC_CLIENT_ID"` → Seu BC_CLIENT_ID do .env
2. `"SUBSTITUIR_PELO_SEU_BC_CLIENT_SECRET"` → Seu BC_CLIENT_SECRET do .env
3. `"SUBSTITUIR_PELO_SEU_TENANT_ID"` → `c87b2897-7933-41bc-9704-9a56e906d373` (aparece 3 vezes)
4. `"SUBSTITUIR_PELO_SEU_AZURE_AD_CLIENT_ID"` → Seu AZURE_AD_CLIENT_ID do .env
5. `"SUBSTITUIR_PELO_SEU_AZURE_AD_CLIENT_SECRET"` → Seu AZURE_AD_CLIENT_SECRET do .env
6. `"GERAR_UM_SECRET_ALEATORIO_32_CARACTERES"` → Secret gerado no passo 2

**No AZURE_AD_AUTHORITY:**
```json
"value": "https://login.microsoftonline.com/c87b2897-7933-41bc-9704-9a56e906d373"
```

---

### **4. Colar no Azure**

1. Copiar **TODO** o conteúdo do `AZURE_CONFIG_JSON.json` (após editar)
2. No Azure Portal → Advanced edit
3. **APAGAR** tudo o que está lá
4. **COLAR** o JSON editado
5. Clicar **"OK"**
6. Clicar **"Save"** no topo ⚠️ IMPORTANTE!

---

### **5. Reiniciar App Service**

```
1. Menu lateral → Overview
2. Clicar "Restart" no topo
3. Aguardar 30 segundos
```

---

## 🔄 **SUBSTITUIÇÕES DE LOCALHOST EXPLICADAS:**

### **Porquê substituir localhost?**

| Variável | Valor Local | Valor Azure | Explicação |
|----------|-------------|-------------|------------|
| `AZURE_AD_REDIRECT_URI` | `http://localhost:3000/auth/callback` | `https://testeappjf.azurewebsites.net/auth/callback` | URL para onde o Azure AD redireciona após login |
| `AZURE_AD_POST_LOGOUT_REDIRECT_URI` | `http://localhost:3000` | `https://testeappjf.azurewebsites.net` | URL para onde redireciona após logout |
| `APP_URL` | `http://localhost:3000` | `https://testeappjf.azurewebsites.net` | URL público da aplicação |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | `https://testeappjf.azurewebsites.net` | CORS - origens permitidas |

**Razão:**
- **Localhost** só funciona no seu computador
- **Azure** precisa do URL público da aplicação
- **Azure AD** valida que o redirect URI corresponde ao registado

---

## ⚠️ **IMPORTANTE: ATUALIZAR AZURE AD**

Depois de configurar as variáveis, **DEVE** atualizar o Azure AD App Registration:

```
1. Azure Portal → Azure Active Directory
2. App registrations → [Sua App de autenticação]
3. Authentication → Platform configurations → Web
4. Redirect URIs → Adicionar (se ainda não existe):
   
   https://testeappjf.azurewebsites.net/auth/callback
   
5. Front-channel logout URL:
   
   https://testeappjf.azurewebsites.net
   
6. Save
```

**Se não fizer isto:** Azure AD vai rejeitar o login com erro "invalid redirect_uri"

---

## 🎯 **TESTAR A APLICAÇÃO:**

```
1. Abrir: https://testeappjf.azurewebsites.net
2. Deve redirecionar para login Microsoft
3. Fazer login com joaquim.fraga@incentea-core.com
4. Sistema valida com Business Central
5. Mostra lista de questionários
```

---

## 🚨 **SE DER ERRO:**

### **Ver logs:**

```
Azure Portal → App Service → Monitoring → Log stream
```

### **Erros comuns:**

| Erro | Causa | Solução |
|------|-------|---------|
| `Application Error` | Falta variável ambiente | Ver Log stream para identificar qual |
| `Cannot connect to BC` | BC_CLIENT_ID/SECRET errado | Verificar valores do .env local |
| `Invalid redirect URI` | Azure AD não atualizado | Seguir passo "Atualizar Azure AD" acima |
| `Session error` | SESSION_SECRET em falta | Gerar e adicionar SESSION_SECRET |

---

## ✅ **CHECKLIST FINAL:**

```
☐ 1. Editar AZURE_CONFIG_JSON.json com valores reais
☐ 2. Copiar JSON para Azure Advanced edit
☐ 3. Save configuration
☐ 4. Atualizar Azure AD Redirect URIs
☐ 5. Restart App Service
☐ 6. Aguardar 30 segundos
☐ 7. Testar: https://testeappjf.azurewebsites.net
☐ 8. Ver logs se houver erro
```

---

## 📝 **RESUMO DAS MUDANÇAS LOCALHOST → AZURE:**

```
localhost:3000 → testeappjf.azurewebsites.net

Porquê?
├─ localhost só funciona no seu PC
├─ Azure precisa do URL público (*.azurewebsites.net)
├─ Azure AD valida o redirect URI
└─ CORS valida a origem das requests
```

---

## 🎯 **PRÓXIMO PASSO:**

Editar o ficheiro `AZURE_CONFIG_JSON.json` com os valores reais do seu `.env` local, depois copiar para o Azure Portal.

