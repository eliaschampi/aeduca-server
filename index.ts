import cors from "cors";
import { config } from "dotenv";
import express from "express";
import { KnexConection } from "./src/con/KnexConection";
import { connect as connectMongoDBService } from "./src/con/MongoConection";
import { socketConection } from "./src/con/SocketConection";
import useHelmet from "./src/config/helmet";
import pgtype from "./src/config/pgtype";
import spa from "./src/config/spa";
import error from "./src/middleware/error";
import logger from "./src/middleware/logger";
import resHeader from "./src/middleware/resHeader";
import uploader from "./src/middleware/uploader";
import routes from "./src/routes";

config();

const app = express();

const port = parseInt(<string>process.env.PORT);
const cli_origin: string = <string>process.env.CLIURL;
const api_url: string = <string>process.env.API;

app.use(cors({ origin: cli_origin }));

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(express.json());

useHelmet(app);

pgtype();

KnexConection();

connectMongoDBService();

const server = socketConection(app);

app.use(logger);

app.use(resHeader);

app.use(uploader);

//app.use(secureApi);

app.use(api_url, routes);

app.use(error);

spa(app);

server.listen(port, () => {
  console.log("server running", port);
});

export default app;
