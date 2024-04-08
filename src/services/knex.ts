import Knex from 'knex';
import pg from 'pg';
import config from 'config';

// Only enable SSL in Heroku
pg.defaults.ssl =
  config.get<string>('database_url').indexOf('127.0.0.1') < 0 &&
  config.get<string>('database_url').indexOf('app_postgres') < 0;

function createKnexConnection(connection: string, searchPath: string) {
  return Knex({
    client: 'pg',
    connection: {
      connectionString: connection,
      ssl: { rejectUnauthorized: false },
    },
    searchPath,
    debug: config.get('IS_LOCAL_DEVELOPMENT'),
  });
}

async function transaction(client: any) {
  return new Promise<void>((resolve, reject) => {
    client.transaction(resolve).catch(reject);
  });
}

const herokuConnectClient = createKnexConnection(
  config.get('database_url'),
  'public'
);

export { createKnexConnection, herokuConnectClient, transaction };
