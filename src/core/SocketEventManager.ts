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
    if (dni) {
      socket.data.dni = dni;
    }
    cb(socket.id);
  };

  /**
   *
   * @param dni string
   * @returns void
   */
  const leave = (dni?: string) => {
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
    socket.on("identity", (dni, cb) => {
      indetityConected(dni, socket, cb);
    });

    socket.on("logout", (dni: string, cb: any) => {
      logout(dni || socket.data.dni, cb);
    });

    socket.on("comment:typing", (postId: string, val: boolean) => {
      socket.broadcast.emit("comment:typing", postId, val);
    });

    socket.on("like:toggle", async (postCode: string, dni: string) => {
      try {
        await PostService.toggleLike(Number(postCode), dni);
        socket.broadcast.emit("like:toggle", postCode, dni);
      } catch (error) {
        socket.emit("error", {
          event: "like:toggle",
          postCode,
          message: (error as Error).message
        });
      }
    });

    socket.on("disconnect", () => {
      leave(socket.data.dni);
    });
  });
}
