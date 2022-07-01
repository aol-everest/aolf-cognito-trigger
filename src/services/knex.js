const knex = require('knex');
const pg = require('pg');
const config = require('config');

// Only enable SSL in Heroku
pg.defaults.ssl =
  config.DATABASE_URL.indexOf('127.0.0.1') < 0 &&
  config.DATABASE_URL.indexOf('app_postgres') < 0;

function createKnexConnection(connection, searchPath) {
  return knex({
    client: 'pg',
    connection,
    searchPath,
    debug: config.IS_LOCAL_DEVELOPMENT,
  });
}

async function transaction(client) {
  return new Promise(function (resolve, reject) {
    client.transaction(resolve).catch(reject);
  });
}

const herokuConnectClient = createKnexConnection(config.DATABASE_URL, 'public');

module.exports = {
  createKnexConnection,
  herokuConnectClient,
  transaction,
};
