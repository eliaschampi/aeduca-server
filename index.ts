import cors from "cors";
import { config } from "dotenv";
import express from "express";
import { KnexConection } from "./src/con/KnexConection";
import { socketConection } from "./src/con/SocketConection";
import useHelmet from "./src/config/helmet";
import pgtype from "./src/config/pgtype";
import spa from "./src/config/spa";
import error from "./src/middleware/error";
import logger from "./src/middleware/logger";
import resHeader from "./src/middleware/resHeader";
import uploader from "./src/middleware/uploader";
import routes from "./src/routes";

// Load environment variables
config();

console.log('Loaded env vars:');
console.log('PORT:', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'not set');
console.log('JWT_KEY:', process.env.JWT_KEY ? 'set' : 'not set');

const app = express();

const port = parseInt(process.env.PORT || "3000");
const cli_origin: string = process.env.CLIURL || "*";
const api_url: string = process.env.API || "/api/v1";

// CORS configuration
app.use(
  cors({
    origin: cli_origin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Security middleware
useHelmet(app);

// PostgreSQL types configuration
pgtype();

// Database connection (PostgreSQL only)
KnexConection();

// Socket.IO connection
const server = socketConection(app);

// Logging middleware
app.use(logger);

// Response headers middleware
app.use(resHeader);

// File upload middleware
app.use(uploader);

// API routes
app.use(api_url, routes);

// Error handling middleware
app.use(error);

// SPA configuration (if applicable)
spa(app);

// Start server
server.listen(port, () => {
  console.log(`🚀 Aeduca Server running on port ${port}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔌 API URL: ${api_url}`);
  console.log(`✅ PostgreSQL connected`);
  console.log(`🔄 Socket.IO enabled`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

export default app;
