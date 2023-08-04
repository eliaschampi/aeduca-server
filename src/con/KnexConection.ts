import knexConstructor, { Knex } from "knex";
import knexconfig from "../../knexfile";
import { Model } from "objection";

export let knex: Knex<any, unknown[]>;

export const KnexConection = (): void => {
  const env: "development" | "production" = <any>process.env.NODE_ENV;
  const client = knexConstructor(knexconfig[env]);
  knex = client;
  Model.knex(client);
};
