import knexConstructor, { Knex } from "knex";

export let nextyaKnex: Knex<any, unknown[]>;

const HOST = process.env.NEXTYA_DB_HOST ?? "localhost";
const PORT = Number(process.env.NEXTYA_DB_PORT ?? 5432);
const DATABASE = process.env.NEXTYA_DB_NAME ?? "nextya";
const USER = process.env.NEXTYA_DB_USER ?? "nextya";
const PASSWORD = process.env.NEXTYA_DB_PASSWORD ?? "nextya";

export const NextyaKnexConnection = (): void => {
  const client = knexConstructor({
    client: "pg",
    connection: {
      charset: "utf8",
      timezone: "UTC",
      host: HOST,
      port: PORT,
      database: DATABASE,
      user: USER,
      password: PASSWORD
    },
    pool: {
      min: 1,
      max: 10
    }
  });
  nextyaKnex = client;
};
