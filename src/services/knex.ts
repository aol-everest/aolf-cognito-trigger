import Knex from 'knex';
import pg from 'pg';

// Only enable SSL in Heroku
pg.defaults.ssl = true;

function createKnexConnection(connection: string, searchPath: string) {
  return Knex({
    client: 'pg',
    connection: {
      connectionString: connection,
      ssl: { rejectUnauthorized: false },
    },
    searchPath,
    debug: process.env.IS_LOCAL_DEVELOPMENT === 'TRUE',
    pool: {
      min: Number(process.env.DATABASE_POOL_MIN || '0'),
      max: Number(process.env.DATABASE_POOL_MAX || '10'),
    },
  });
}

function transaction(client: any) {
  return new Promise<void>((resolve, reject) => {
    client.transaction(resolve).catch(reject);
  });
}

const herokuConnectClient = createKnexConnection(
  process.env.DATABASE_URL || '',
  'public'
);

export { createKnexConnection, herokuConnectClient, transaction };
