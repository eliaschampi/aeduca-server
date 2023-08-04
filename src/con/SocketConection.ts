import express from "express";
import { createServer, Server } from "http";
import { connection } from "../core/SocketEventManager";
import { Server as IO } from "socket.io";

/**
 * gloab io variable
 */
export let io: IO;

/**
 *
 * @param app express.Express
 * @returns Server
 */
export function socketConection(app: express.Express): Server {
  const server = createServer(app);

  io = new IO(server, {
    cors: {
      origin: process.env.CLIURL,
      methods: ["GET", "POST"]
    }
  });

  connection(io);

  return server;
}
