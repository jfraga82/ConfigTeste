require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

console.log('--- Loading Business Central Configuration ---');
console.log(`Attempted to load .env from: ${require('path').resolve(__dirname, '../../.env')}`);

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

console.log(`TENANT_ID from env: ${process.env.TENANT_ID ? 'Loaded' : 'MISSING'} (Value: ${process.env.TENANT_ID ? process.env.TENANT_ID.substring(0, 5) + '...' : 'N/A'})`);
console.log(`CLIENT_ID from env: ${process.env.CLIENT_ID ? 'Loaded' : 'MISSING'} (Value: ${process.env.CLIENT_ID ? process.env.CLIENT_ID.substring(0, 5) + '...' : 'N/A'})`);
console.log(`CLIENT_SECRET from env: ${process.env.CLIENT_SECRET ? 'Loaded (not displaying value)' : 'MISSING'}`);
console.log(`BC_BASE_URL (for specificBaseUrl & scope) from env: ${process.env.BC_BASE_URL ? 'Loaded' : 'MISSING'} (Value: ${process.env.BC_BASE_URL})`);
console.log(`BC_ENVIRONMENT_NAME from env: ${process.env.BC_ENVIRONMENT_NAME ? 'Loaded' : 'MISSING'} (Value: ${process.env.BC_ENVIRONMENT_NAME})`);
console.log(`COMPANY_ID (for companyName) from env: ${process.env.COMPANY_ID ? 'Loaded' : 'MISSING'} (Value: ${process.env.COMPANY_ID})`);

console.log('Constructed bcConfig object:', {
    ...bcConfig,
    clientSecret: bcConfig.clientSecret ? '***' : 'MISSING' // Mask client secret in log
});

if (!bcConfig.tenantId || !bcConfig.clientId || !bcConfig.clientSecret || !bcConfig.specificBaseUrl || !bcConfig.environmentName || !bcConfig.companyName) {
  console.error('Missing Business Central environment variables for the specific OData URL. Please check your .env file. ');
  console.error('Required: TENANT_ID, CLIENT_ID, CLIENT_SECRET, BC_BASE_URL (as https://api.businesscentral.dynamics.com/v2.0), BC_ENVIRONMENT_NAME (e.g., PF_Qualidade), COMPANY_ID (e.g., Testes PF)');
  // Optionally, throw an error to stop the server from starting if critical configs are missing
  // process.exit(1); 
}

module.exports = bcConfig; 