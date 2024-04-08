import Knex from 'knex';
import pg from 'pg';
import config from 'config';

// Only enable SSL in Heroku
pg.defaults.ssl =
  (process.env.DATABASE_URL || '').indexOf('127.0.0.1') < 0 &&
  (process.env.DATABASE_URL || '').indexOf('app_postgres') < 0;

function createKnexConnection(connection: string, searchPath: string) {
  return Knex({
    client: 'pg',
    connection: {
      connectionString: connection,
      ssl: { rejectUnauthorized: false },
    },
    searchPath,
    debug: process.env.IS_LOCAL_DEVELOPMENT === 'TRUE',
  });
}

async function transaction(client: any) {
  return new Promise<void>((resolve, reject) => {
    client.transaction(resolve).catch(reject);
  });
}

const herokuConnectClient = createKnexConnection(
  process.env.DATABASE_URL || '',
  'public'
);

export { createKnexConnection, herokuConnectClient, transaction };
