import knexConstructor, { Knex } from 'knex';

export let nextyaKnex: Knex<any, unknown[]>;

export const NextyaKnexConnection = (): void => {
  const client = knexConstructor({
    client: 'pg',
    connection: {
      charset: 'utf8',
      timezone: 'UTC',
      host: process.env.NEXTYA_DB_HOST,
      port: Number(process.env.NEXTYA_DB_PORT || 5432),
      database: process.env.NEXTYA_DB_NAME,
      user: process.env.NEXTYA_DB_USER,
      password: process.env.NEXTYA_DB_PASSWORD,
    },
    pool: {
      min: 1,
      max: 10,
    },
  });
  nextyaKnex = client;
};
