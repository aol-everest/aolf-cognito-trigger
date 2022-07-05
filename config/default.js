/**
 * The configuration file.
 */
require('dotenv/config');

module.exports = {
  DATABASE_URL: process.env.DATABASE_URL,
  IS_LOCAL_DEVELOPMENT: process.env.IS_LOCAL_DEVELOPMENT === 'true',
};
