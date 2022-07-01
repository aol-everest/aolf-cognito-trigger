// copied from https://gist.github.com/timhuff/f4f0814b0eb048784e44e744aa8e41f5

const returning =
  " WHERE 'updated' = set_config('upsert.action', 'updated', true) returning *, CASE WHEN current_setting('upsert.action', true) = 'updated' THEN 'updated' ELSE 'inserted' END as upsert";

module.exports = function upsert(knex) {
  return ({ table, object, constraint }) => {
    const insert = knex(table).insert(object).toString();
    const update = knex.queryBuilder().update(object).toString();
    const query = `${insert} ON CONFLICT (${constraint}) DO ${update} ${returning}`;
    console.log(query);

    let finalQuery = knex.raw(query);
    return finalQuery.then((result) => result.rows[0]);
  };
};
