# 🚀 Azure AD - Quick Setup Guide

**Configuração Rápida para Começar**

---

## 📋 **Passo 1: Adicionar ao ficheiro `.env`**

Abrir o ficheiro `.env` na raiz do projeto e **adicionar** as seguintes linhas:

```env
# ============================================
# AZURE AD AUTHENTICATION CONFIGURATION
# ============================================

# Azure AD App Registration IDs
AZURE_AD_CLIENT_ID=seu-application-client-id-aqui
AZURE_AD_CLIENT_SECRET=seu-client-secret-aqui
AZURE_AD_TENANT_ID=seu-directory-tenant-id-aqui

# Authority URL (substituir {TENANT_ID} pelo seu tenant ID)
AZURE_AD_AUTHORITY=https://login.microsoftonline.com/seu-tenant-id-aqui

# Redirect URIs (localhost para desenvolvimento)
AZURE_AD_REDIRECT_URI=http://localhost:3000/auth/callback
AZURE_AD_POST_LOGOUT_REDIRECT_URI=http://localhost:3000/login

# Session Configuration
SESSION_SECRET=gerar-um-secret-forte-aqui-minimo-32-caracteres
SESSION_MAX_AGE=3600000

# Application URL
APP_URL=http://localhost:3000
```

---

## 🔑 **Passo 2: Gerar SESSION_SECRET**

### Opção A: PowerShell (Windows)
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### Opção B: Node.js (qualquer OS)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copiar o resultado e colar no `SESSION_SECRET` do `.env`.

---

## 🌐 **Passo 3: Criar App Registration no Azure Portal**

### 3.1 - Aceder ao Azure Portal
1. Ir para https://portal.azure.com
2. Navegar para **Azure Active Directory**
3. Ir para **App registrations** → **New registration**

### 3.2 - Configurar App Registration
- **Nome**: `ConfiguradorTekever`
- **Supported account types**: `Single tenant` (apenas a sua organização)
- **Redirect URI**: 
  - Platform: `Web`
  - URI: `http://localhost:3000/auth/callback`
- Clicar **Register**

### 3.3 - Copiar IDs
Na página **Overview**, copiar:
- **Application (client) ID** → Colar em `AZURE_AD_CLIENT_ID`
- **Directory (tenant) ID** → Colar em `AZURE_AD_TENANT_ID` e `AZURE_AD_AUTHORITY`

### 3.4 - Criar Client Secret
1. Ir para **Certificates & secrets**
2. **New client secret**
3. Description: `ConfiguradorTekever Secret`
4. Expires: `24 months`
5. Clicar **Add**
6. **⚠️ COPIAR O SECRET IMEDIATAMENTE** → Colar em `AZURE_AD_CLIENT_SECRET`

### 3.5 - Configurar Authentication
1. Ir para **Authentication**
2. Em **Redirect URIs**, verificar que existe: `http://localhost:3000/auth/callback`
3. Em **Front-channel logout URL**, adicionar: `http://localhost:3000/login`
4. Em **Implicit grant and hybrid flows**, marcar: `☑️ ID tokens`
5. Clicar **Save**

### 3.6 - Adicionar API Permissions
1. Ir para **API permissions**
2. **Add a permission** → **Microsoft Graph** → **Delegated permissions**
3. Adicionar:
   - `User.Read`
   - `email`
   - `openid`
   - `profile`
4. Clicar **Add permissions**
5. Clicar **Grant admin consent for [Your Organization]** ✅

---

## ✅ **Passo 4: Verificar Configuração**

### Exemplo de `.env` Completo:
```env
# Business Central (já existente)
BC_TENANT_ID=c87b2897-7933-41bc-9704-9a56e906d373
BC_ENVIRONMENT_NAME=TEK_TEST
BC_COMPANY_NAME=UAS_MASTER
BC_CLIENT_ID=...
BC_CLIENT_SECRET=...

# Azure AD Authentication (NOVO)
AZURE_AD_CLIENT_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
AZURE_AD_CLIENT_SECRET=Xhy8Q~abc123def456ghi789jkl012mno345pqr678stu901
AZURE_AD_TENANT_ID=12345678-1234-1234-1234-123456789012
AZURE_AD_AUTHORITY=https://login.microsoftonline.com/12345678-1234-1234-1234-123456789012
AZURE_AD_REDIRECT_URI=http://localhost:3000/auth/callback
AZURE_AD_POST_LOGOUT_REDIRECT_URI=http://localhost:3000/login
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
SESSION_MAX_AGE=3600000
APP_URL=http://localhost:3000

# Server
PORT=3000
NODE_ENV=development
```

---

## 🚀 **Passo 5: Iniciar Servidor**

```bash
npm start
```

---

## 🧪 **Passo 6: Testar Autenticação**

1. Abrir browser: http://localhost:3000
2. Deve redirecionar para página de login
3. Clicar **"Sign in with Microsoft"**
4. Fazer login com conta Microsoft da organização
5. Se o email estiver autorizado no Business Central → ✅ Acesso concedido
6. Se não estiver autorizado → ❌ Mensagem de erro

---

## 🔒 **Validação no Business Central**

O sistema chama a função `_ValidateExternalUserEmail` com o email do utilizador.

**Para autorizar um utilizador:**
1. Ir ao Business Central
2. Registar o email na tabela de utilizadores externos
3. Garantir que o utilizador está ativo
4. O utilizador poderá então fazer login

---

## 🐛 **Troubleshooting Rápido**

### Erro: "SESSION_SECRET is not set"
- Gerar um secret e adicionar ao `.env`

### Erro: "AADSTS50011: The reply URL specified in the request does not match"
- Verificar que `http://localhost:3000/auth/callback` está na lista de Redirect URIs no Azure Portal

### Erro: "Application not found in the directory"
- Verificar `AZURE_AD_CLIENT_ID` e `AZURE_AD_TENANT_ID` no `.env`

### Erro: "Email not found or not active"
- O email do utilizador não está registado/ativo no Business Central
- Adicionar o utilizador à lista de autorizados

---

## 📚 **Documentação Completa**

Para mais detalhes, consultar:
- `AZURE_AUTH_SETUP.md` - Guia completo com troubleshooting

---

## ✅ **Checklist Final**

- [ ] `.env` atualizado com todas as variáveis Azure AD
- [ ] `SESSION_SECRET` gerado e configurado
- [ ] App Registration criada no Azure Portal
- [ ] Client Secret copiado
- [ ] Redirect URIs configuradas
- [ ] API Permissions concedidas
- [ ] Servidor reiniciado
- [ ] Login testado com sucesso

---

**Após completar, aceder a:** http://localhost:3000

**Status:** 🔐 Autenticação Azure AD + Validação Business Central ✅


