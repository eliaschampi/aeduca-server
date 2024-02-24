import dotenv from 'dotenv';

dotenv.config();

export default {
  development: {
    client: "pg",
    connection: {
      charset: "utf8",
      timezone: "UTC",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
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
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    },
    pool: {
      min: 5,
      max: 30
    }
  }
};
