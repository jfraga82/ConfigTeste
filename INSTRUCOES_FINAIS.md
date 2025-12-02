# 🎯 Instruções Finais - Autenticação Azure AD

**O QUE FOI IMPLEMENTADO:** ✅ Autenticação completa e segura com Azure AD + Business Central

---

## 📋 **O QUE PRECISA FAZER AGORA**

### **1️⃣ Abrir o ficheiro `.env`** (na raiz do projeto)

Adicionar estas linhas **no final** do ficheiro:

```env
# ============================================
# AZURE AD AUTHENTICATION
# ============================================
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=
AZURE_AD_AUTHORITY=https://login.microsoftonline.com/
AZURE_AD_REDIRECT_URI=http://localhost:3000/auth/callback
AZURE_AD_POST_LOGOUT_REDIRECT_URI=http://localhost:3000/login
SESSION_SECRET=
SESSION_MAX_AGE=3600000
APP_URL=http://localhost:3000
```

### **2️⃣ Gerar SESSION_SECRET**

**No PowerShell, executar:**
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Copiar o resultado** e colar no `SESSION_SECRET=` do `.env`

Exemplo:
```env
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### **3️⃣ Criar App no Azure Portal**

1. **Ir para:** https://portal.azure.com
2. **Navegar:** Azure Active Directory → App registrations
3. **Clicar:** New registration
4. **Preencher:**
   - Nome: `ConfiguradorTekever`
   - Account types: `Single tenant`
   - Redirect URI: `Web` → `http://localhost:3000/auth/callback`
5. **Clicar:** Register

### **4️⃣ Copiar IDs**

Na página **Overview** da app:

- **Application (client) ID** → Copiar para `AZURE_AD_CLIENT_ID=`
- **Directory (tenant) ID** → Copiar para `AZURE_AD_TENANT_ID=`
- **Directory (tenant) ID** → Copiar também para `AZURE_AD_AUTHORITY=https://login.microsoftonline.com/{TENANT_ID}`

Exemplo:
```env
AZURE_AD_CLIENT_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
AZURE_AD_TENANT_ID=12345678-1234-1234-1234-123456789012
AZURE_AD_AUTHORITY=https://login.microsoftonline.com/12345678-1234-1234-1234-123456789012
```

### **5️⃣ Criar Client Secret**

1. **Ir para:** Certificates & secrets
2. **Clicar:** New client secret
3. **Preencher:**
   - Description: `ConfiguradorTekever Secret`
   - Expires: `24 months`
4. **Clicar:** Add
5. **⚠️ COPIAR IMEDIATAMENTE** o "Value" → Colar em `AZURE_AD_CLIENT_SECRET=`

Exemplo:
```env
AZURE_AD_CLIENT_SECRET=Xhy8Q~abc123def456ghi789jkl012mno345pqr678stu901
```

### **6️⃣ Configurar Authentication**

1. **Ir para:** Authentication
2. **Verificar Redirect URI:** `http://localhost:3000/auth/callback` ✅
3. **Front-channel logout URL:** `http://localhost:3000/login`
4. **Implicit grant:** Marcar `☑️ ID tokens`
5. **Clicar:** Save

### **7️⃣ Configurar Permissions**

1. **Ir para:** API permissions
2. **Clicar:** Add a permission → Microsoft Graph → Delegated
3. **Selecionar:**
   - ☑️ `User.Read`
   - ☑️ `email`
   - ☑️ `openid`
   - ☑️ `profile`
4. **Clicar:** Add permissions
5. **Clicar:** Grant admin consent for [Your Organization] ✅

---

## ✅ **Verificar `.env` Final**

O ficheiro `.env` deve ter algo assim:

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

## 🚀 **TESTAR**

### **1. Reiniciar servidor:**
```bash
npm start
```

### **2. Abrir browser:**
```
http://localhost:3000
```

### **3. Deve acontecer:**
- ✅ Redireciona para página de login
- ✅ Mostra botão "Sign in with Microsoft"
- ✅ Clicar no botão → Redireciona para Microsoft
- ✅ Fazer login com conta da organização
- ✅ Microsoft redireciona de volta
- ✅ Sistema valida email no Business Central
- ✅ Se email autorizado → Entra na aplicação ✅
- ✅ Se email não autorizado → Mostra erro "Access Denied" ❌

---

## ❓ **PROBLEMAS COMUNS**

### **Erro: "SESSION_SECRET is not set"**
→ Gerar secret e adicionar ao `.env`

### **Erro: "The reply URL specified does not match"**
→ Verificar Redirect URI no Azure Portal: `http://localhost:3000/auth/callback`

### **Erro: "Email not found or not active"**
→ O email precisa estar registado e ativo no Business Central

### **Erro: "Application not found in the directory"**
→ Verificar `AZURE_AD_CLIENT_ID` e `AZURE_AD_TENANT_ID` no `.env`

---

## 📚 **DOCUMENTAÇÃO COMPLETA**

Se precisar de mais detalhes:

- **Quick Start:** `AZURE_ENV_SETUP_QUICKSTART.md`
- **Guia Completo:** `AZURE_AUTH_SETUP.md` (544 linhas)
- **Resumo Técnico:** `AZURE_AUTH_IMPLEMENTATION_SUMMARY.md`

---

## 🔐 **COMO FUNCIONA**

1. **Utilizador acede** à aplicação
2. **Sistema verifica** se está autenticado
3. **Se não**, redireciona para login
4. **Utilizador clica** "Sign in with Microsoft"
5. **Azure AD autentica** o utilizador
6. **Sistema recebe** o email do utilizador
7. **Valida no Business Central** se o email está autorizado
8. **Se sim**, cria sessão e dá acesso ✅
9. **Se não**, mostra erro de acesso negado ❌

---

## ✅ **CHECKLIST FINAL**

- [ ] `.env` atualizado com todas as variáveis Azure
- [ ] `SESSION_SECRET` gerado
- [ ] App Registration criada no Azure Portal
- [ ] Client Secret copiado
- [ ] Redirect URIs configuradas (`Authentication`)
- [ ] API Permissions configuradas e consentidas (`API permissions`)
- [ ] Servidor reiniciado com `npm start`
- [ ] Teste de login feito com sucesso

---

## 🎉 **PRONTO!**

Após completar estes passos:
- ✅ Autenticação Azure AD funcionando
- ✅ Validação Business Central ativa
- ✅ Sessões seguras
- ✅ Todas as rotas protegidas
- ✅ Logout funcional

**Aceder:** http://localhost:3000

---

**Última Atualização:** 25 de Novembro de 2025  
**Status:** ✅ Implementação Completa - Aguardando Configuração Azure AD

