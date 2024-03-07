import express from "express";
import helmet from "helmet";

const admin = "https://carrioneduca.edu.pe";
const aula = "https://aula.carrioneduca.edu.pe";
const youtube = "https://www.youtube.com";

const CLIURL = process.env.CLIURL || aula;
const WS_ORIGIN = process.env.WS_ORIGIN || aula;

const defaultCSPConfig = {
  useDefaults: false,
  directives: {
    "default-src": ["'self'"],
    "style-src": ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
    "script-src": ["'self'", "'unsafe-inline'", youtube, "'unsafe-eval'"],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "connect-src": [WS_ORIGIN, admin, "*.plyr.io", "ws:", "data:"],
    "img-src": [CLIURL, WS_ORIGIN, "blob:", "data:", "https:"],
    "object-src": [CLIURL, WS_ORIGIN, "blob:"],
    "media-src": [CLIURL, WS_ORIGIN, "blob:", "data:"],
    "frame-src": [CLIURL, "https://docs.google.com", youtube]
  }
};

const helmetConfig = (app: express.Express): void => {
  if (process.env.NODE_ENV === "production") {
    app.use(helmet.contentSecurityPolicy(defaultCSPConfig));
    app.use(helmet.dnsPrefetchControl());
    app.use(
      helmet.frameguard({
        action: "deny"
      })
    );
    app.use(helmet.hidePoweredBy());
    app.use(helmet.hsts());
    app.use(helmet.ieNoOpen());
    app.use(helmet.noSniff());
    app.use(helmet.permittedCrossDomainPolicies());
    app.use(helmet.referrerPolicy());
    app.use(helmet.xssFilter());
  }
};

export default helmetConfig;
