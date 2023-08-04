export default {
  development: {
    client: "pg",
    connection: {
      charset: "utf8",
      timezone: "UTC",
      host: "localhost",
      port: 5432,
      database: "aeduca",
      user: "elias",
      password: "5403"
    },
    pool: {
      min: 5,
      max: 30
    }
  },
  production: {
    client: "pg",
    connection: {
      charset: "utf8",
      timezone: "UTC",
      host: "localhost",
      port: 5432,
      database: "aeduca",
      user: "elias",
      password: "5403"
    },
    pool: {
      min: 5,
      max: 30
    }
  }
};
