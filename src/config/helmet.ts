import express from "express";
import helmet from "helmet";

// Group related constants
const urls = {
  admin: "https://carrioneduca.edu.pe",
  aula: "https://aula.carrioneduca.edu.pe",
  youtube: "https://www.youtube.com",
};

// Use descriptive variable names
const clientUrl = process.env.CLIENT_URL || urls.aula;
const webSocketOrigin = process.env.WEB_SOCKET_ORIGIN || urls.aula;

// Extract common parts of the CSP directives
const commonSrc = [clientUrl, webSocketOrigin, "blob:", "data:"];

const defaultCSPConfig = {
  useDefaults: false,
  directives: {
    "default-src": ["'self'"],
    "style-src": ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
    "script-src": ["'self'", "'unsafe-inline'", urls.youtube, "'unsafe-eval'"],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "connect-src": [webSocketOrigin, urls.admin, "*.plyr.io", "ws:", "data:"],
    "img-src": [...commonSrc, "https:"],
    "object-src": commonSrc,
    "media-src": commonSrc,
    "frame-src": [clientUrl, "https://docs.google.com", urls.youtube]
  }
};

const helmetConfig = (app: express.Express): void => {
  if (process.env.NODE_ENV === "production") {
    app.use(helmet.contentSecurityPolicy(defaultCSPConfig));
    app.use(helmet.dnsPrefetchControl());
    app.use(helmet.frameguard({ action: "sameorigin" }));
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
