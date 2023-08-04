import { Server as IO, Socket } from "socket.io";
import { MESSAGE_RESPONSE } from "../config/const";
import { INewMessage, NewMessage } from "../model/Message";
import {
  bySocketID,
  clientHasConection,
  createConection,
  destroyByDNI,
  destroyBySocketId,
  roomHasActives,
  updateCurrentRoom
} from "../services/ConectedService";
import { isReaded, newMessage } from "../services/MessageService";
import { toggleComment, toggleLike } from "../services/PostService";
import { getLastTime, updateLastLogout } from "../services/ProfileService";
import { idsByDNI, updatedAt } from "../services/RoomService";

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

    createConection(dni, null, socket.id).then(({ insertedId }) => {
      if (insertedId) {
        idsByDNI(dni).then((ids) => {
          ids.forEach((_id) => {
            const room_name = `room_${_id}`;
            if (io.of("/").adapter.rooms.has(room_name)) {
              socket.to(room_name).emit("room:joined", _id);
            }
            socket.join(room_name);
          });
        });
      }
    });
  };

  /**
   *
   * @param dni string
   * @returns void
   */
  const leave = (dni: string) => {
    if (!dni) return;

    idsByDNI(dni).then((ids) => {
      ids.forEach((_id) => {
        const room_name = `room_${_id}`;
        if (io.of("/").adapter.rooms.has(room_name)) {
          io.to(room_name).emit("room:leave", _id);
        }
      });
    });

    updateLastLogout(dni);
  };

  /**
   *
   * @param dni string
   * @param cb callback
   */
  const logout = (dni: string, cb: any) => {
    leave(dni);
    destroyByDNI(dni);
    cb();
  };

  /**
   *
   * @param payload any
   * @param socket Socket
   * @param cb any
   */
  const joinRoom = (payload: any, socket: Socket, cb: any) => {
    const { room, has_news, friend_dni, is_group } = payload;
    const room_name = `room_${room}`;

    updateCurrentRoom(socket.id, room).then(({ modifiedCount }) => {
      if (modifiedCount > 0) {
        socket.join(room_name);

        if (!is_group) {
          clientHasConection(friend_dni).then((hasConection) => {
            if (!hasConection) {
              getLastTime(friend_dni).then((profile: any) => {
                if (profile) {
                  cb(false, profile.last_logout);
                }
              });
            } else {
              cb(true, null);
            }

            if (has_news) {
              isReaded(room, friend_dni)
                .then(() => {
                  if (hasConection) {
                    socket.to(room_name).emit("message:viewed", room);
                  }
                  console.log("viewed");
                })
                .catch((err) => {
                  console.log(err);
                });
            }
          });
        }
      }
    });
  };

  /**
   *
   * @param data any
   * @param socket Socket
   * @param cb callback function
   * @returns Promise<void>
   * @todo FIX RETURN TYPE
   */
  const sendMessage = (data: INewMessage, socket: Socket, cb: any) => {
    const value = NewMessage(data);
    roomHasActives(<string>data.room).then((hasActives) => {
      console.log(data.room, hasActives);

      value.is_readed = hasActives;

      newMessage(value)
        .then(({ insertedId }) => {
          value._id = insertedId;
          socket.to(`room_${data.room}`).emit("message", value);
          cb(value, MESSAGE_RESPONSE);

          updatedAt(<string>data.room);
        })
        .catch((err) => {
          console.log("Error al enviar mensaje", err);
          cb(null, "Ocurrió un error, intente mas tarde");
        });
    });
  };

  /**
   *
   * @param socketId string
   * @returns Promise<void>
   */
  const handleDisconection = (socketId: string) => {
    bySocketID(socketId).then((conected) => {
      if (conected) {
        const leaveAfterWait = () => {
          clientHasConection(conected.dni).then((hasConection) => {
            if (hasConection === false) {
              leave(conected.dni);
            }
          });
        };

        setTimeout(leaveAfterWait, 8500);

        console.log("disconnect ", conected);

        destroyBySocketId(socketId);
      }
    });
  };

  /**
   * onConection
   */
  io.on("connection", (socket: Socket) => {
    console.log("socket ", socket.id, " conected");

    socket.on("identity", (dni, cb) => {
      indetityConected(dni, socket, cb);
    });

    socket.on("user:conected", (dni: string, cb) => {
      clientHasConection(dni).then((yes) => {
        cb(yes);
      });
    });

    socket.on("room:join", (payload: any, cb) => {
      joinRoom(payload, socket, cb);
    });

    socket.on("room:current_leave", () => {
      updateCurrentRoom(socket.id);
    });

    socket.on("logout", (dni: string, cb) => {
      logout(dni, cb);
    });

    socket.on("message:typing", (room, val) => {
      console.log(socket.id, "typing on", room, val);
      socket.to(`room_${room}`).emit("message:typing", room, val);
    });

    socket.on("message", (data: any, callback: any) => {
      sendMessage(data, socket, callback);
    });

    socket.on("comment:typing", (post_id, val) => {
      console.log(socket.id, "comment typing on", post_id, val);
      socket.broadcast.emit("comment:typing", post_id, val);
    });

    socket.on("toggle:commentable", (post_id: string, state: boolean) => {
      toggleComment(post_id, state).then(() => {
        socket.broadcast.emit("toggle:commentable", post_id, state);
      });
    });

    socket.on("like:toggle", (post_id: string, dni: string, tolike) => {
      toggleLike(post_id, dni, tolike ? "add" : "remove").then(() => {
        socket.broadcast.emit("like:toggle", post_id, dni, tolike);
      });
    });

    socket.on("disconnect", () => {
      handleDisconection(socket.id);
    });
  });
}
