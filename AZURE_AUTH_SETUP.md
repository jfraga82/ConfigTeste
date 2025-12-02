# 🔐 Configuração de Autenticação Azure AD

**Data:** 25 de Novembro de 2025  
**Status:** 📋 Guia de Implementação Completa

---

## 📋 **Índice**

1. [Registar Aplicação no Azure AD](#1-registar-aplicação-no-azure-ad)
2. [Configurar Variáveis de Ambiente](#2-configurar-variáveis-de-ambiente)
3. [Segurança e Boas Práticas](#3-segurança-e-boas-práticas)
4. [Testar Autenticação](#4-testar-autenticação)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Registar Aplicação no Azure AD

### Passo 1.1: Aceder ao Azure Portal

1. Ir para [Azure Portal](https://portal.azure.com)
2. Navegar para **Azure Active Directory** (ou **Microsoft Entra ID**)
3. Selecionar **App registrations** → **New registration**

### Passo 1.2: Configurar App Registration

**Nome da Aplicação:**
```
ConfiguradorTekever
```

**Supported account types:**
```
☑️ Accounts in this organizational directory only (Single tenant)
```
*Recomendado para uso interno*

**Redirect URI:**
```
Platform: Web
URI: http://localhost:3000/auth/callback
```

### Passo 1.3: Configurar Authentication

Após criar, ir para **Authentication**:

1. **Redirect URIs** - Adicionar:
   ```
   http://localhost:3000/auth/callback
   ```

2. **Front-channel logout URL:**
   ```
   http://localhost:3000/login
   ```

3. **Implicit grant and hybrid flows:**
   ```
   ☑️ ID tokens (used for implicit and hybrid flows)
   ```

4. **Advanced settings:**
   ```
   ☑️ Allow public client flows: No
   ```

5. Clicar **Save**

### Passo 1.4: Criar Client Secret

1. Ir para **Certificates & secrets**
2. Clicar **New client secret**
3. **Description:** `ConfiguradorTekever Secret`
4. **Expires:** `24 months` (ou conforme política da empresa)
5. Clicar **Add**
6. **⚠️ COPIAR O SECRET IMEDIATAMENTE** (só aparece uma vez!)

### Passo 1.5: Configurar API Permissions

1. Ir para **API permissions**
2. Clicar **Add a permission**
3. Selecionar **Microsoft Graph**
4. Selecionar **Delegated permissions**
5. Adicionar as seguintes permissões:
   ```
   ☑️ User.Read (Read user profile)
   ☑️ email (View users' email address)
   ☑️ openid (Sign users in)
   ☑️ profile (View users' basic profile)
   ```
6. Clicar **Add permissions**
7. Clicar **Grant admin consent for [Your Organization]**

### Passo 1.6: Copiar IDs Necessários

Na página **Overview**, copiar:

1. **Application (client) ID**
   ```
   Exemplo: a1b2c3d4-e5f6-7890-abcd-ef1234567890
   ```

2. **Directory (tenant) ID**
   ```
   Exemplo: 12345678-1234-1234-1234-123456789012
   ```

---

## 2. Configurar Variáveis de Ambiente

### Passo 2.1: Adicionar ao ficheiro `.env`

Adicionar as seguintes linhas ao ficheiro `.env` **existente**:

```env
# ============================================
# AZURE AD AUTHENTICATION CONFIGURATION
# ============================================
# Azure AD App Registration
AZURE_AD_CLIENT_ID=cole-o-application-client-id-aqui
AZURE_AD_CLIENT_SECRET=cole-o-client-secret-aqui
AZURE_AD_TENANT_ID=cole-o-directory-tenant-id-aqui

# Authority URL
AZURE_AD_AUTHORITY=https://login.microsoftonline.com/seu-tenant-id

# Redirect URIs
AZURE_AD_REDIRECT_URI=http://localhost:3000/auth/callback
AZURE_AD_POST_LOGOUT_REDIRECT_URI=http://localhost:3000/login

# Session Configuration
SESSION_SECRET=gerar-um-secret-forte-minimo-32-caracteres-aleatorios
SESSION_MAX_AGE=3600000

# Application URL
APP_URL=http://localhost:3000
```

### Passo 2.2: Gerar SESSION_SECRET Forte

**Opção 1: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Opção 2: PowerShell**
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Opção 3: Online** (usar apenas em desenvolvimento!)
```
https://www.random.org/strings/
Length: 32
Character set: Alphanumeric
```

### Passo 2.3: Exemplo Completo `.env`

```env
# ============================================
# BUSINESS CENTRAL CONFIGURATION (já existente)
# ============================================
BC_TENANT_ID=c87b2897-7933-41bc-9704-9a56e906d373
BC_ENVIRONMENT_NAME=TEK_TEST
BC_COMPANY_NAME=UAS_MASTER
BC_CLIENT_ID=seu-bc-client-id
BC_CLIENT_SECRET=seu-bc-client-secret

# ============================================
# AZURE AD AUTHENTICATION (NOVO)
# ============================================
AZURE_AD_CLIENT_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
AZURE_AD_CLIENT_SECRET=Xhy8Q~abcdefghijklmnopqrstuvwxyz1234567890
AZURE_AD_TENANT_ID=12345678-1234-1234-1234-123456789012
AZURE_AD_AUTHORITY=https://login.microsoftonline.com/12345678-1234-1234-1234-123456789012
AZURE_AD_REDIRECT_URI=http://localhost:3000/auth/callback
AZURE_AD_POST_LOGOUT_REDIRECT_URI=http://localhost:3000/login
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
SESSION_MAX_AGE=3600000
APP_URL=http://localhost:3000

# ============================================
# SERVER CONFIGURATION (já existente)
# ============================================
PORT=3000
NODE_ENV=development
```

---

## 3. Segurança e Boas Práticas

### ✅ Checklist de Segurança

- [ ] **Client Secret nunca commitado no Git**
- [ ] **SESSION_SECRET gerado aleatoriamente (mínimo 32 caracteres)**
- [ ] **Redirect URIs restritas apenas a domínios autorizados**
- [ ] **HTTPS obrigatório em produção**
- [ ] **Token expiration configurado adequadamente**
- [ ] **Logging de tentativas de autenticação**
- [ ] **Rate limiting nas rotas de autenticação**

### 🔒 Configurações de Produção

Quando implementar em produção, **alterar** no Azure AD:

1. **Redirect URIs:**
   ```
   https://seu-dominio.com/auth/callback
   ```

2. **Front-channel logout URL:**
   ```
   https://seu-dominio.com/login
   ```

3. **No `.env` de produção:**
   ```env
   NODE_ENV=production
   APP_URL=https://seu-dominio.com
   AZURE_AD_REDIRECT_URI=https://seu-dominio.com/auth/callback
   AZURE_AD_POST_LOGOUT_REDIRECT_URI=https://seu-dominio.com/login
   SESSION_MAX_AGE=3600000
   ```

4. **Configurar HTTPS:**
   - Usar certificado SSL válido
   - Redirecionar HTTP → HTTPS
   - Configurar HSTS headers (já implementado no Helmet)

### 🔐 Validação Multi-Camada

A autenticação implementada tem **3 camadas de segurança**:

```
┌─────────────────────────────────────────────┐
│ 1. AZURE AD AUTHENTICATION                  │
│    ✓ OAuth 2.0 / OpenID Connect            │
│    ✓ Token JWT validado                     │
│    ✓ Email do utilizador obtido             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 2. BUSINESS CENTRAL VALIDATION              │
│    ✓ _ValidateExternalUserEmail chamada    │
│    ✓ Email verificado no BC                │
│    ✓ Permissões de acesso confirmadas      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 3. SESSION MANAGEMENT                       │
│    ✓ Sessão segura criada                  │
│    ✓ Token armazenado server-side          │
│    ✓ Expiração automática                  │
└─────────────────────────────────────────────┘
```

---

## 4. Testar Autenticação

### Teste 1: Login Bem-Sucedido

1. Aceder a `http://localhost:3000`
2. Deve redirecionar para página de login Azure
3. Inserir credenciais do Azure AD
4. Após autenticação, valida email no BC
5. Se `result: "ok"`, redireciona para aplicação
6. ✅ **Sucesso!** Acesso concedido

### Teste 2: Email Não Autorizado

1. Fazer login com email **não registado** no BC
2. Azure AD autentica normalmente
3. BC retorna `result: "not ok"`
4. ❌ **Acesso Negado** - Mensagem de erro exibida
5. Utilizador não entra na aplicação

### Teste 3: Sessão Expirada

1. Fazer login normalmente
2. Aguardar 1 hora (SESSION_MAX_AGE)
3. Tentar usar a aplicação
4. ❌ Sessão expirada
5. Redireciona automaticamente para login

### Teste 4: Logout

1. Clicar no botão de logout
2. Sessão destruída
3. Redireciona para página de login
4. Logout também no Azure AD
5. ✅ **Logout completo**

---

## 5. Troubleshooting

### Erro: "AADSTS50011: The reply URL specified in the request does not match"

**Causa:** Redirect URI não configurada no Azure AD

**Solução:**
1. Ir para Azure Portal → App Registration → Authentication
2. Verificar que existe: `http://localhost:3000/auth/callback`
3. Clicar **Save**
4. Aguardar 2-3 minutos para propagar

---

### Erro: "AADSTS700016: Application not found in the directory"

**Causa:** CLIENT_ID ou TENANT_ID incorretos

**Solução:**
1. Verificar `AZURE_AD_CLIENT_ID` no `.env`
2. Verificar `AZURE_AD_TENANT_ID` no `.env`
3. Copiar novamente do Azure Portal → App Registration → Overview

---

### Erro: "Error calling Business Central: Email not found or not active"

**Causa:** Email do utilizador não está registado no BC

**Solução:**
1. Verificar no Business Central se o email existe
2. Verificar se o utilizador está ativo
3. Adicionar email à lista de utilizadores autorizados no BC
4. Tentar login novamente

---

### Erro: "Session secret is not set"

**Causa:** `SESSION_SECRET` não configurado no `.env`

**Solução:**
1. Gerar secret forte (ver Passo 2.2)
2. Adicionar ao `.env`:
   ```env
   SESSION_SECRET=seu-secret-aqui
   ```
3. Reiniciar servidor

---

### Erro: "Cannot read property 'account' of undefined"

**Causa:** Utilizador não completou o login

**Solução:**
1. Limpar cache do browser (Ctrl + Shift + Delete)
2. Limpar cookies de `localhost`
3. Reiniciar browser
4. Tentar login novamente

---

### Debug Mode

Para ver logs detalhados de autenticação:

1. Adicionar ao `.env`:
   ```env
   NODE_ENV=development
   ```

2. Console do browser mostrará:
   ```
   🔐 Checking authentication...
   ✅ User authenticated: user@example.com
   ✅ BC Validation: ok
   ```

3. Console do servidor mostrará:
   ```
   [AUTH] Login attempt: user@example.com
   [BC] Validating email: user@example.com
   [BC] Validation result: ok
   [AUTH] User authorized: user@example.com
   ```

---

## 6. Fluxo de Autenticação Completo

```
┌─────────────────────────────────────────────────────────────┐
│                      1. ACESSO INICIAL                      │
│  User acede a http://localhost:3000                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              2. VERIFICAÇÃO DE AUTENTICAÇÃO                 │
│  Frontend verifica se existe sessão ativa                   │
│  ❌ Não autenticado → Redireciona para /login              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  3. PÁGINA DE LOGIN AZURE                   │
│  Botão "Sign in with Microsoft"                             │
│  Click → Redireciona para Azure AD                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              4. AUTENTICAÇÃO NO AZURE AD                    │
│  Utilizador insere credenciais Microsoft                    │
│  Azure AD valida e retorna token                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 5. CALLBACK NO SERVIDOR                     │
│  Azure redireciona para /auth/callback                      │
│  Servidor recebe authorization code                         │
│  Troca code por access token + ID token                     │
│  Extrai email do utilizador                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           6. VALIDAÇÃO NO BUSINESS CENTRAL                  │
│  Chama _ValidateExternalUserEmail(email)                    │
│  BC verifica se email está autorizado                       │
│  Retorna: { result: "ok" } ou { result: "not ok" }        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                   ┌────────┴────────┐
                   │                 │
          result = "ok"      result = "not ok"
                   │                 │
                   ↓                 ↓
    ┌──────────────────────┐  ┌──────────────────────┐
    │  7. ACESSO CONCEDIDO │  │  7. ACESSO NEGADO    │
    │  ✅ Cria sessão      │  │  ❌ Destroi sessão   │
    │  Armazena user info  │  │  Mostra erro         │
    │  Redireciona para /  │  │  Faz logout Azure    │
    └──────────────────────┘  └──────────────────────┘
                   │
                   ↓
    ┌──────────────────────────────────────────────┐
    │     8. APLICAÇÃO PROTEGIDA                   │
    │  Todas as páginas verificam autenticação     │
    │  Todas as APIs verificam token               │
    │  Sessão expira em 1 hora                     │
    │  Logout disponível a qualquer momento        │
    └──────────────────────────────────────────────┘
```

---

## 7. Estrutura de Ficheiros Criados

```
ConfiguradorTekever/
├── server/
│   ├── config/
│   │   └── azureAuth.js          ← Configuração MSAL
│   ├── middleware/
│   │   ├── authMiddleware.js     ← Proteção de rotas
│   │   └── validation.js         ← Validação (atualizado)
│   ├── services/
│   │   ├── bcApiService.js       ← +validateUserEmail()
│   │   └── bcAuthService.js      ← (existente)
│   └── routes/
│       └── auth.js                ← Rotas de autenticação
├── public/
│   ├── login.html                 ← Página de login
│   ├── css/
│   │   └── login.css             ← Estilos login
│   ├── js/
│   │   ├── auth.js               ← Lógica autenticação frontend
│   │   └── main.js               ← (atualizado)
│   └── index.html                 ← (atualizado)
├── server.js                      ← (atualizado com sessões)
├── .env                           ← (atualizar com Azure config)
└── AZURE_AUTH_SETUP.md            ← Este documento
```

---

## 8. URLs Importantes

| Recurso | URL |
|---------|-----|
| Azure Portal | https://portal.azure.com |
| App Registrations | https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps |
| Login Local | http://localhost:3000/login |
| Callback | http://localhost:3000/auth/callback |
| Logout | http://localhost:3000/auth/logout |
| Check Auth | http://localhost:3000/auth/check |

---

## 9. Variáveis de Ambiente - Resumo

| Variável | Descrição | Onde Obter |
|----------|-----------|------------|
| `AZURE_AD_CLIENT_ID` | Application ID | Azure Portal → App Registration → Overview |
| `AZURE_AD_CLIENT_SECRET` | Client Secret | Azure Portal → Certificates & secrets |
| `AZURE_AD_TENANT_ID` | Directory ID | Azure Portal → App Registration → Overview |
| `AZURE_AD_AUTHORITY` | Authority URL | `https://login.microsoftonline.com/{TENANT_ID}` |
| `AZURE_AD_REDIRECT_URI` | Redirect após login | `http://localhost:3000/auth/callback` |
| `AZURE_AD_POST_LOGOUT_REDIRECT_URI` | Redirect após logout | `http://localhost:3000/login` |
| `SESSION_SECRET` | Secret para sessões | Gerar aleatoriamente (32+ caracteres) |
| `SESSION_MAX_AGE` | Duração da sessão (ms) | `3600000` (1 hora) |
| `APP_URL` | URL da aplicação | `http://localhost:3000` |

---

## ✅ Checklist Final

Antes de testar, confirmar:

- [ ] App Registration criada no Azure AD
- [ ] Client Secret copiado e guardado
- [ ] Redirect URI configurada no Azure AD
- [ ] Permissions concedidas e consentidas
- [ ] Todas as variáveis adicionadas ao `.env`
- [ ] SESSION_SECRET gerado aleatoriamente
- [ ] npm install executado
- [ ] Servidor reiniciado

**Após completar, testar login em:** http://localhost:3000

---

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs do servidor (console)
2. Verificar console do browser (F12)
3. Verificar este documento (Troubleshooting)
4. Verificar configuração no Azure Portal

---

**Última Atualização:** 25 de Novembro de 2025  
**Versão:** 1.0  
**Status:** ✅ Completo e Testado


