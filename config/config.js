const dotenv = require('dotenv');
dotenv.config();
module.exports.CONFIG = (serverless) => ({
  DATABASE_URL: process.env.DATABASE_URL,
  IAHV_CLIENT_ID: process.env.IAHV_CLIENT_ID,
  HB_CLIENT_ID: process.env.HB_CLIENT_ID,
  AOL_CLIENT_ID: process.env.AOL_CLIENT_ID,
});
