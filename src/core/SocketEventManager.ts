import { Server as IO, Socket } from "socket.io";
import { updateLastLogout } from "../services/ProfileService";
import PostService from "../services/PostService";

export function connection(io: IO): void {
  /**
   *
   * @param dni string
   * @param socket Socket
   * @param cb callback
   * @returns Promise<void>
   */
  const indetityConected = (dni: string, socket: Socket, cb: any) => {
    //return inmediatly
    cb(socket.id);
  };

  /**
   *
   * @param dni string
   * @returns void
   */
  const leave = (dni: string) => {
    if (!dni) return;

    updateLastLogout(dni);
  };

  /**
   *
   * @param dni string
   * @param cb callback
   */
  const logout = (dni: string, cb: any) => {
    leave(dni);
    cb();
  };


  /**
   * onConection
   */
  io.on("connection", (socket: Socket) => {
    console.log("socket ", socket.id, " conected");

    socket.on("identity", (dni, cb) => {
      indetityConected(dni, socket, cb);
    });

    socket.on("logout", (dni: string, cb) => {
      logout(dni, cb);
    });

    socket.on("message:typing", (room, val) => {
      console.log(socket.id, "typing on", room, val);
      socket.to(`room_${room}`).emit("message:typing", room, val);
    });

    socket.on("comment:typing", (post_id, val) => {
      console.log(socket.id, "comment typing on", post_id, val);
      socket.broadcast.emit("comment:typing", post_id, val);
    });

    socket.on("like:toggle", (post_code: string, dni: string) => {
      PostService.toggleLike(Number(post_code), dni).then(() => {
        socket.broadcast.emit("like:toggle", post_code, dni);
      });
    });

    socket.on("disconnect", () => {
      leave(socket.id);
    });
  });
}
