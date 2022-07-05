const dotenv = require('dotenv');
dotenv.config();
module.exports.CONFIG = (serverless) => ({
  dev: {
    DATABASE_URL: process.env.DEV_DATABASE_URL,
  },
  qa: {
    DATABASE_URL: process.env.QA_DATABASE_URL,
  },
  prod: {
    DATABASE_URL: process.env.PROD_DATABASE_URL,
  },
});
