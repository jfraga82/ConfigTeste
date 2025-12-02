require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Only show status in development, never sensitive values
if (process.env.NODE_ENV !== 'production') {
  console.log('--- Business Central Configuration Status ---');
}

const requiredEnvVars = [
  'TENANT_ID',
  'CLIENT_ID', 
  'CLIENT_SECRET',
  'BC_BASE_URL',
  'BC_ENVIRONMENT_NAME',
  'COMPANY_ID'
];

// Validate all required env vars are present
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ CRITICAL: Missing required environment variables:', missingVars.join(', '));
  console.error('Application cannot start without these variables.');
  process.exit(1);
}

// Only show status, NEVER values
if (process.env.NODE_ENV !== 'production') {
  console.log(`TENANT_ID: ${process.env.TENANT_ID ? '✅ Loaded' : '❌ MISSING'}`);
  console.log(`CLIENT_ID: ${process.env.CLIENT_ID ? '✅ Loaded' : '❌ MISSING'}`);
  console.log(`CLIENT_SECRET: ${process.env.CLIENT_SECRET ? '✅ Loaded' : '❌ MISSING'}`);
  console.log(`BC_BASE_URL: ${process.env.BC_BASE_URL ? '✅ Loaded' : '❌ MISSING'}`);
  console.log(`BC_ENVIRONMENT_NAME: ${process.env.BC_ENVIRONMENT_NAME ? '✅ Loaded' : '❌ MISSING'}`);
  console.log(`COMPANY_ID: ${process.env.COMPANY_ID ? '✅ Loaded' : '❌ MISSING'}`);
}

const bcConfig = {
  tenantId: process.env.TENANT_ID,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  specificBaseUrl: process.env.BC_BASE_URL,
  environmentName: process.env.BC_ENVIRONMENT_NAME,
  companyName: process.env.COMPANY_ID,
  tokenEndpoint: `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
  scope: 'https://api.businesscentral.dynamics.com/.default'
};

// Validate config structure
if (!bcConfig.tenantId || !bcConfig.clientId || !bcConfig.clientSecret) {
  console.error('❌ Invalid Business Central configuration');
  process.exit(1);
}

if (process.env.NODE_ENV !== 'production') {
  console.log('✅ Business Central configuration loaded successfully');
}

module.exports = bcConfig; 