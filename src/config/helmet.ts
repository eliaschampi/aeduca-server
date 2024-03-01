import express from "express";
import helmet from "helmet";

//eslint-disable-next-line
const CSP = () => {
  const ws_origin: string = <string>process.env.WS_ORIGIN;
  const cli_origin: string = <string>process.env.CLIURL;
  return helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {
      "default-src": ["'self'"],
      "style-src": ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
      "script-src": [
        "'self'",
        "'unsafe-inline'",
        "https://www.youtube.com",
        "'unsafe-eval'"
      ],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "connect-src": [ws_origin, "https://carrioneduca.edu.pe", "*.plyr.io", "ws:", "data:"],
      "img-src": [cli_origin, ws_origin, "https://docs.google.com", "blob:", "data:", "https:"],
      "object-src": [cli_origin, ws_origin, "https://docs.google.com", "blob:"],
      "media-src": [cli_origin, ws_origin, "https://docs.google.com", "blob:", "data:"],
      "frame-src": ["'self'", "https://www.google.com", "https://www.youtube.com"]
    }
  });
};

export default (app: express.Express): void => {
  if (process.env.NODE_ENV === "production") {
    app.use(CSP());
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
