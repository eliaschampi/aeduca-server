import knexConstructor, { Knex } from "knex";
import knexconfig from "../../knexfile";
import { Model } from "objection";

export let knex: Knex;

export const KnexConection = (): void => {
  const env: "development" | "production" = process.env.NODE_ENV as
    | "development"
    | "production";
  const knexConfig = knexconfig[env] as Knex.Config;
  const client = knexConstructor(knexConfig);
  knex = client;
  Model.knex(client);
};
