import { Knex } from 'knex';

const returning =
  " WHERE 'updated' = set_config('upsert.action', 'updated', true) returning *, CASE WHEN current_setting('upsert.action', true) = 'updated' THEN 'updated' ELSE 'inserted' END as upsert";

type UpsertFunction = (options: {
  table: string;
  object: any;
  constraint: string;
}) => Promise<any>;

const upsert = (knex: Knex): UpsertFunction => {
  return ({ table, object, constraint }) => {
    const insert = knex(table).insert(object).toString();
    const update = knex.queryBuilder().update(object).toString();
    const query = `${insert} ON CONFLICT (${constraint}) DO ${update} ${returning}`;
    console.log(query);

    let finalQuery = knex.raw(query);
    return finalQuery.then((result: any) => result.rows[0]);
  };
};

export default upsert;
