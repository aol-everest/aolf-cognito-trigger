const dotenv = require('dotenv');
dotenv.config();
module.exports.CONFIG = (serverless) => ({
  DATABASE_URL: process.env.DATABASE_URL,
  COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
  IAHV_CLIENT_ID: process.env.IAHV_CLIENT_ID,
  HB_CLIENT_ID: process.env.HB_CLIENT_ID,
  AOL_CLIENT_ID: process.env.AOL_CLIENT_ID,
  REGION: process.env.REGION,
  ACCOUNT_ID: process.env.ACCOUNT_ID,
  CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  ALLOWED_RELYING_PARTY_IDS: process.env.ALLOWED_RELYING_PARTY_IDS,
  MOESIF_APPLICATION_ID: process.env.MOESIF_APPLICATION_ID,
});
