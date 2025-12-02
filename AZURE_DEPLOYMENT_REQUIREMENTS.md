# ☁️ Requisitos para Publicação no Azure Cloud

**Data:** 25 de Novembro de 2025  
**Aplicação:** Configurador Tekever  
**Target:** Microsoft Azure

---

## 📋 **ÍNDICE**

1. [Requisitos Técnicos](#requisitos-técnicos)
2. [Opções de Deployment no Azure](#opções-de-deployment-no-azure)
3. [Configurações Necessárias](#configurações-necessárias)
4. [Segurança em Produção](#segurança-em-produção)
5. [Custos Estimados](#custos-estimados)
6. [Checklist de Deployment](#checklist-de-deployment)

---

## 1. REQUISITOS TÉCNICOS

### **1.1 Recursos Azure Necessários**

#### **✅ OBRIGATÓRIOS:**

| Recurso | Para que serve | Custo Estimado/mês |
|---------|----------------|-------------------|
| **Azure App Service** | Hospedar a aplicação Node.js | €50-200 |
| **Azure AD (Entra ID)** | Autenticação (já existe) | Grátis (Basic) |
| **Application Insights** | Monitorização e logs | €5-50 |
| **Key Vault** | Armazenar secrets (CLIENT_SECRET, etc) | €5 |

#### **⚠️ RECOMENDADOS:**

| Recurso | Para que serve | Custo Estimado/mês |
|---------|----------------|-------------------|
| **Azure CDN** | Cache de assets estáticos | €10-30 |
| **Azure Front Door** | Load balancing + WAF | €50-100 |
| **Application Gateway** | SSL Termination + WAF | €100-200 |
| **Log Analytics** | Logs centralizados | €10-50 |

#### **📦 OPCIONAL:**

| Recurso | Para que serve | Custo Estimado/mês |
|---------|----------------|-------------------|
| **Azure Container Registry** | Se usar Docker | €5-20 |
| **Azure DevOps** | CI/CD Pipeline | Grátis (básico) |
| **Azure Storage Account** | Backup de logs | €5-10 |

---

## 2. OPÇÕES DE DEPLOYMENT NO AZURE

### **Opção 1: Azure App Service** ⭐ **RECOMENDADO**

**Vantagens:**
- ✅ Mais simples e direto
- ✅ Suporte nativo para Node.js
- ✅ SSL automático (HTTPS)
- ✅ Scaling automático
- ✅ Integração com Azure DevOps
- ✅ Logs e monitorização incluídos

**Desvantagens:**
- ⚠️ Menos controlo sobre o servidor
- ⚠️ Custo pode ser mais alto

**Ideal para:** Aplicações web standard como a sua

**Pricing Tiers:**
```
Basic (B1):     ~€50/mês   (Dev/Test)
Standard (S1):  ~€80/mês   (Produção pequena)
Premium (P1V2): ~€150/mês  (Produção com autoscaling)
```

---

### **Opção 2: Azure Container Apps**

**Vantagens:**
- ✅ Mais moderno (serverless containers)
- ✅ Scaling automático para zero (economiza)
- ✅ Mais barato se tráfego baixo
- ✅ Integração com Docker

**Desvantagens:**
- ⚠️ Requer Dockerfile
- ⚠️ Mais complexo para setup inicial

**Ideal para:** Aplicações com tráfego variável

**Pricing:**
```
Pay-per-use: ~€0.000024/vCPU-segundo
Estimado: €20-100/mês (depende do uso)
```

---

### **Opção 3: Azure Virtual Machine**

**Vantagens:**
- ✅ Controlo total do servidor
- ✅ Pode instalar qualquer coisa

**Desvantagens:**
- ❌ Tem de gerir o servidor (updates, segurança, etc)
- ❌ Mais complexo
- ❌ Menos integrado com Azure

**Ideal para:** Quando precisa de controlo total

**NÃO RECOMENDADO** para esta aplicação

---

## 3. CONFIGURAÇÕES NECESSÁRIAS

### **3.1 Domínio e DNS**

#### **OBRIGATÓRIO:**

**Ter um domínio próprio:**
```
Exemplo: configurador.tekever.com
         ou
         config.incentea-core.com
```

**Configurar DNS:**
```
CNAME: configurador.tekever.com → appname.azurewebsites.net
```

**Onde comprar domínio:**
- Azure Domains
- GoDaddy
- Namecheap
- Cloudflare

---

### **3.2 Certificado SSL (HTTPS)**

#### **Opção 1: Certificado Gerido pelo Azure** ⭐ **RECOMENDADO**

```
✅ Grátis
✅ Renovação automática
✅ Incluído no App Service
```

**Setup:**
```
1. Azure Portal → App Service → TLS/SSL settings
2. Private Key Certificates (.pfx)
3. Create App Service Managed Certificate
4. Bind to custom domain
```

#### **Opção 2: Let's Encrypt**

```
✅ Grátis
⚠️ Renovação manual ou via script
```

#### **Opção 3: Certificado Comercial**

```
❌ Pago (~€50-200/ano)
✅ Mais credibilidade (Extended Validation)
```

---

### **3.3 Variáveis de Ambiente (Production)**

#### **NO AZURE APP SERVICE:**

Configurar em: **Configuration → Application settings**

```env
# Business Central (já existentes)
BC_TENANT_ID=c87b2897-7933-41bc-9704-9a56e906d373
BC_ENVIRONMENT_NAME=TekeverTest
BC_COMPANY_NAME=UAS_MASTER
BC_CLIENT_ID=seu-bc-client-id
BC_CLIENT_SECRET=@Microsoft.KeyVault(SecretUri=...)  ← De KeyVault!

# Azure AD (PRODUÇÃO)
AZURE_AD_CLIENT_ID=seu-client-id
AZURE_AD_CLIENT_SECRET=@Microsoft.KeyVault(SecretUri=...)  ← De KeyVault!
AZURE_AD_TENANT_ID=410e744a-8b79-4dbc-8f38-28ec3bd5a338
AZURE_AD_AUTHORITY=https://login.microsoftonline.com/410e744a-8b79-4dbc-8f38-28ec3bd5a338
AZURE_AD_REDIRECT_URI=https://configurador.tekever.com/auth/callback  ← HTTPS!
AZURE_AD_POST_LOGOUT_REDIRECT_URI=https://configurador.tekever.com/login
SESSION_SECRET=@Microsoft.KeyVault(SecretUri=...)  ← De KeyVault!
SESSION_MAX_AGE=3600000
APP_URL=https://configurador.tekever.com  ← HTTPS!

# Server
PORT=8080
NODE_ENV=production  ← IMPORTANTE!

# Monitoring
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...
```

---

### **3.4 Azure Key Vault** 🔐 **OBRIGATÓRIO**

**Armazenar secrets sensíveis:**

```
Secrets a guardar:
  ├─ BC-CLIENT-SECRET
  ├─ AZURE-AD-CLIENT-SECRET
  └─ SESSION-SECRET
```

**Setup:**
```
1. Azure Portal → Key Vault → Create
2. Add secrets
3. App Service → Identity → System assigned: On
4. Key Vault → Access policies → Add
   → Select principal: App Service name
   → Secret permissions: Get, List
5. App Service → Configuration
   → Usar: @Microsoft.KeyVault(SecretUri=https://...)
```

---

### **3.5 Azure AD - Configuração de Produção**

#### **CRÍTICO: Atualizar Redirect URIs**

No **Azure Portal → App registrations → Sua app → Authentication:**

**Adicionar URIs de produção:**
```
Platform: Web

Redirect URIs:
  • http://localhost:3000/auth/callback  ← Dev (manter)
  • https://configurador.tekever.com/auth/callback  ← PRODUÇÃO (adicionar)

Front-channel logout URL:
  • https://configurador.tekever.com/login  ← PRODUÇÃO
```

**⚠️ ATENÇÃO:**
- ✅ Produção usa **HTTPS** (não HTTP)
- ✅ Usar domínio real (não azurewebsites.net)

---

## 4. SEGURANÇA EM PRODUÇÃO

### **4.1 Checklist de Segurança**

- [ ] **NODE_ENV=production** (OBRIGATÓRIO)
- [ ] **HTTPS ativado** e HTTP redireciona para HTTPS
- [ ] **Secrets no Key Vault** (não no código)
- [ ] **CORS restrito** ao domínio de produção
- [ ] **Rate limiting ativo** (já implementado ✅)
- [ ] **Security headers** (Helmet já configurado ✅)
- [ ] **Logs centralizados** (Application Insights)
- [ ] **IP Whitelist** (se possível)
- [ ] **WAF ativado** (se usar Front Door)

---

### **4.2 Alterações Necessárias no Código**

#### **server.js - Adicionar ao início:**

```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

#### **CORS - Restringir domínio:**

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? ['https://configurador.tekever.com']
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
```

---

### **4.3 Application Insights (Monitoring)**

#### **Instalar:**
```bash
npm install applicationinsights
```

#### **Adicionar ao server.js (início do ficheiro):**

```javascript
// Application Insights - FIRST!
if (process.env.NODE_ENV === 'production') {
  const appInsights = require('applicationinsights');
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)
    .start();
  
  console.log('✅ Application Insights initialized');
}
```

---

## 5. CUSTOS ESTIMADOS

### **5.1 Cenário Mínimo (Dev/Test)**

```
Azure App Service (B1):        €50/mês
Application Insights:          €5/mês
Key Vault:                     €5/mês
Azure AD Basic:                Grátis
Domain (anual):                €10/ano (~€1/mês)
────────────────────────────────────────
TOTAL:                         ~€61/mês
```

---

### **5.2 Cenário Recomendado (Produção)**

```
Azure App Service (S1):        €80/mês
Application Insights:          €20/mês
Key Vault:                     €5/mês
Azure CDN:                     €15/mês
Log Analytics:                 €10/mês
Azure AD Basic:                Grátis
Domain (anual):                €10/ano (~€1/mês)
────────────────────────────────────────
TOTAL:                         ~€131/mês
```

---

### **5.3 Cenário Enterprise (Alta Disponibilidade)**

```
Azure App Service (P1V2):      €150/mês
Application Insights:          €50/mês
Key Vault:                     €5/mês
Azure Front Door + WAF:        €100/mês
CDN Premium:                   €30/mês
Log Analytics:                 €20/mês
Backup Storage:                €10/mês
────────────────────────────────────────
TOTAL:                         ~€365/mês
```

---

## 6. CHECKLIST DE DEPLOYMENT

### **6.1 PRÉ-DEPLOYMENT**

**Azure Setup:**
- [ ] Criar Resource Group
- [ ] Criar App Service
- [ ] Criar Key Vault
- [ ] Criar Application Insights
- [ ] Configurar DNS (CNAME)
- [ ] Registar domínio (se ainda não tem)

**Código:**
- [ ] Testar localmente com NODE_ENV=production
- [ ] Adicionar force HTTPS
- [ ] Adicionar Application Insights
- [ ] Atualizar CORS para produção
- [ ] Remover console.logs sensíveis
- [ ] Criar .deployment e web.config (se necessário)

**Azure AD:**
- [ ] Adicionar Redirect URI de produção
- [ ] Adicionar Logout URL de produção
- [ ] Testar com domínio de produção

**Secrets:**
- [ ] Adicionar secrets ao Key Vault
- [ ] Configurar App Service Identity
- [ ] Testar acesso ao Key Vault
- [ ] Atualizar variáveis de ambiente

---

### **6.2 DEPLOYMENT**

#### **Opção 1: Deployment via Azure Portal** (Manual)

```
1. Azure Portal → App Service → Deployment Center
2. Source: GitHub / Azure Repos / Local Git
3. Configure CI/CD
4. Deploy
```

#### **Opção 2: Deployment via VS Code** ⭐ **FÁCIL**

```
1. Instalar extensão: Azure App Service
2. Click direito na pasta do projeto
3. Deploy to Web App...
4. Selecionar subscription e App Service
5. Deploy!
```

#### **Opção 3: Deployment via Git** (Recomendado)

```bash
# 1. Configurar remote
git remote add azure https://appname.scm.azurewebsites.net/appname.git

# 2. Deploy
git push azure main:master
```

#### **Opção 4: CI/CD com Azure DevOps** (Profissional)

```yaml
# azure-pipelines.yml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '22.x'
  displayName: 'Install Node.js'

- script: |
    npm install
  displayName: 'npm install'

- task: ArchiveFiles@2
  inputs:
    rootFolderOrFile: '$(System.DefaultWorkingDirectory)'
    includeRootFolder: false
    archiveType: 'zip'
    archiveFile: '$(Build.ArtifactStagingDirectory)/$(Build.BuildId).zip'

- task: AzureWebApp@1
  inputs:
    azureSubscription: 'Your-Subscription'
    appName: 'your-app-name'
    package: '$(Build.ArtifactStagingDirectory)/$(Build.BuildId).zip'
```

---

### **6.3 PÓS-DEPLOYMENT**

**Verificações:**
- [ ] App abre sem erros (https://seu-dominio.com)
- [ ] SSL/HTTPS funciona
- [ ] Login Azure AD funciona
- [ ] Validação BC funciona
- [ ] Questionários carregam
- [ ] Criar produto funciona
- [ ] Logs aparecem no Application Insights
- [ ] Performance é aceitável

**Testes:**
- [ ] Testar com diferentes browsers
- [ ] Testar com diferentes utilizadores
- [ ] Testar logout
- [ ] Testar sessão expirada
- [ ] Testar rate limiting
- [ ] Testar com utilizador não autorizado

**Monitoring:**
- [ ] Configurar alertas (Application Insights)
- [ ] Configurar dashboard
- [ ] Configurar health checks
- [ ] Configurar backup logs

---

## 7. FICHEIROS NECESSÁRIOS PARA AZURE

### **7.1 .deployment**

Criar ficheiro `.deployment` na raiz:

```ini
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

---

### **7.2 web.config** (Opcional, mas recomendado)

Criar `web.config` na raiz:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="DynamicContent">
          <match url="/*" />
          <action type="Rewrite" url="server.js"/>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    <httpErrors existingResponse="PassThrough" />
  </system.webServer>
</configuration>
```

---

### **7.3 .gitignore** (Verificar)

```
node_modules/
.env
*.log
.DS_Store
dist/
build/
.vscode/
```

---

### **7.4 package.json** (Verificar scripts)

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "production": "NODE_ENV=production node server.js"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

---

## 8. SUPORTE E DOCUMENTAÇÃO

### **Documentação Oficial:**

- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)
- [Deploy Node.js to Azure](https://docs.microsoft.com/azure/app-service/quickstart-nodejs)
- [Azure Key Vault](https://docs.microsoft.com/azure/key-vault/)
- [Application Insights](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)

### **Tutoriais Úteis:**

- [Node.js + Azure AD Authentication](https://docs.microsoft.com/azure/active-directory/develop/quickstart-v2-nodejs-webapp)
- [Custom domains in App Service](https://docs.microsoft.com/azure/app-service/app-service-web-tutorial-custom-domain)
- [SSL certificates](https://docs.microsoft.com/azure/app-service/configure-ssl-certificate)

---

## 9. TROUBLESHOOTING COMUM

### **Erro: "Application Error" após deploy**

**Solução:**
1. Ver logs: Azure Portal → App Service → Log stream
2. Verificar NODE_ENV=production
3. Verificar PORT=8080 (ou process.env.PORT)
4. Verificar package.json tem "start" script

---

### **Erro: "Cannot find module"**

**Solução:**
1. Verificar package.json está completo
2. Executar `npm install` localmente
3. Commit package-lock.json
4. Redeploy

---

### **Erro: Login não funciona (redirect)**

**Solução:**
1. Verificar Redirect URI no Azure AD tem HTTPS
2. Verificar domínio está correto
3. Aguardar 5-10 minutos após alteração
4. Limpar cache do browser

---

## 10. RESUMO EXECUTIVO

### **✅ O QUE PRECISA:**

1. **Azure App Service** (€50-150/mês)
2. **Domínio próprio** (€10/ano)
3. **Azure Key Vault** (€5/mês)
4. **Application Insights** (€5-50/mês)
5. **Atualizar Azure AD** (Redirect URIs de produção)

### **📝 PASSOS PRINCIPAIS:**

1. Criar recursos no Azure
2. Configurar domínio e DNS
3. Configurar SSL (automático no Azure)
4. Adicionar secrets ao Key Vault
5. Atualizar variáveis de ambiente
6. Atualizar Azure AD (Redirect URIs)
7. Deploy do código
8. Testar tudo

### **💰 CUSTO TOTAL ESTIMADO:**

```
Mínimo:      ~€60/mês   (Dev/Test)
Recomendado: ~€130/mês  (Produção)
Enterprise:  ~€365/mês  (Alta disponibilidade)
```

### **⏱️ TEMPO ESTIMADO:**

```
Setup inicial:     4-8 horas
Deploy:            30 minutos
Testes:            2-4 horas
──────────────────────────────
TOTAL:             6-12 horas
```

---

## 11. PRÓXIMOS PASSOS

### **AGORA:**
1. ✅ Ler este documento completo
2. ✅ Decidir budget (Mínimo vs Recomendado)
3. ✅ Verificar se tem domínio (ou comprar)

### **DEPOIS:**
1. Criar recursos Azure (App Service, Key Vault)
2. Configurar DNS
3. Configurar Azure AD (Redirect URIs produção)
4. Deploy!

---

**Documentação criada por:** AI Assistant  
**Data:** 25 de Novembro de 2025  
**Versão:** 1.0  
**Status:** ✅ Completo e pronto para deployment


