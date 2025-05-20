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
      min: Number(process.env.DATABASE_POOL_MIN || '20'),
      max: Number(process.env.DATABASE_POOL_MAX || '70'),
      idleTimeoutMillis: 30000, // 30 seconds (increased from 3s)
      acquireTimeoutMillis: 30000, // 60 second timeout when acquiring connection
      reapIntervalMillis: 5000, // Check for idle connections every second
      createTimeoutMillis: 15000, // 30 second timeout when creating connection
      createRetryIntervalMillis: 500, // Retry creating connection every 200ms
      propagateCreateError: false, // Don't crash pool on connection failure
    },
    acquireConnectionTimeout: 30000,
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
