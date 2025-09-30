import { Server as IO, Socket } from "socket.io";
import { updateLastLogout } from "../services/ProfileService";
import { registerIO, joinRooms as joinRegisteredRooms } from "./realtime/RealtimeBus";
import { buildAudienceRooms } from "./realtime/helpers";
import Register from "../model/Register";
import {
  createPost as createPostUseCase,
  deletePost as deletePostUseCase,
  toggleLike as toggleLikeUseCase,
  toggleSave as toggleSaveUseCase,
  updatePost as updatePostUseCase,
  createComment as createCommentUseCase,
  deleteComment as deleteCommentUseCase,
  replyToComment as replyToCommentUseCase,
  updateComment as updateCommentUseCase
} from "../usecases/PostUseCases";

type AckResponse = { ok: boolean; error?: string; data?: unknown };
type Ack = (response: AckResponse) => void;

function respondError(socket: Socket, ack: Ack | undefined, message: string): void {
  if (ack) {
    ack({ ok: false, error: message });
  } else {
    socket.emit("error", { message });
  }
}

async function handleWithAuth<T>(
  socket: Socket,
  ack: Ack | undefined,
  handler: (dni: string) => Promise<T>
): Promise<void> {
  const dni = requireAuth(socket, ack);
  if (!dni) {
    return;
  }
  try {
    const result = await handler(dni);
    if (ack) {
      ack({ ok: true, data: result });
    }
  } catch (error) {
    respondError(socket, ack, (error as Error).message);
  }
}

async function authenticate(socket: Socket, dni?: string) {
  if (!dni) {
    throw new Error("Identificador de usuario requerido");
  }

  try {
    socket.data.dni = dni;
    socket.join(`user:${dni}`);
    socket.join("aud:all");
    const sections = await Register.query()
      .select("section_code")
      .where("student_dni", dni);
    sections
      .map((record) => record.section_code)
      .filter((code): code is string => Boolean(code))
      .forEach((code) => socket.join(`aud:${code}`));
  } catch (error) {
    respondError(socket, undefined, (error as Error).message);
  }

  await joinRegisteredRooms(socket, dni);
  return dni;
}

function requireAuth(socket: Socket, ack?: Ack): string | null {
  const dni = socket.data.dni;
  if (!dni) {
    respondError(socket, ack, "Usuario no autenticado");
    return null;
  }
  return dni;
}

export function connection(io: IO): void {
  registerIO(io);

  io.on("connection", (socket: Socket) => {
    socket.on("identity", async (dni: string, ack: Ack) => {
      try {
        await authenticate(socket, dni);
        ack({ ok: true, data: { socketId: socket.id } });
      } catch (error) {
        ack({ ok: false, error: (error as Error).message });
      }
    });

    socket.on("logout", async (dni: string | undefined, ack: Ack) => {
      const identifier = dni || socket.data.dni;
      if (identifier) {
        updateLastLogout(identifier);
      }
      ack({ ok: true });
    });

    socket.on("comment:typing", (postCode: number, value: boolean) => {
      socket.to(`post:${postCode}`).emit("comment:typing", postCode, value);
    });

    socket.on("post:join", (payload: { post_code: number }, ack?: Ack) =>
      handleWithAuth(socket, ack, async () => {
        const postCode = payload?.post_code;
        if (!postCode) {
          throw new Error("Código de publicación requerido");
        }
        socket.join(`post:${postCode}`);
      })
    );

    socket.on("post:leave", (payload: { post_code: number }, ack?: Ack) =>
      handleWithAuth(socket, ack, async () => {
        const postCode = payload?.post_code;
        if (!postCode) {
          throw new Error("Código de publicación requerido");
        }
        socket.leave(`post:${postCode}`);
      })
    );

    socket.on("post:create", (payload, ack?: Ack) =>
      handleWithAuth(socket, ack, async (dni) => {
        const post = await createPostUseCase({ dni, payload });
        socket.join(`post:${post.code}`);
        buildAudienceRooms(post.share_with || []).forEach((room) => socket.join(room));
        return post;
      })
    );

    socket.on("post:update", (payload, ack?: Ack) =>
      handleWithAuth(socket, ack, (dni) =>
        updatePostUseCase({ dni, code: payload.code, payload: payload.data })
      )
    );

    socket.on("post:delete", (payload, ack?: Ack) =>
      handleWithAuth(socket, ack, (dni) => deletePostUseCase({ dni, code: payload.code }))
    );

    socket.on("post:like", (payload, ack?: Ack) =>
      handleWithAuth(socket, ack, (dni) => toggleLikeUseCase({ code: payload.code, dni }))
    );

    socket.on("post:save", (payload, ack?: Ack) =>
      handleWithAuth(socket, ack, (dni) => toggleSaveUseCase({ code: payload.code, dni }))
    );

    socket.on("comment:create", (payload, ack?: Ack) =>
      handleWithAuth(socket, ack, async (dni) => {
        const comment = await createCommentUseCase({ dni, payload });
        socket.join(`post:${payload.post_code}`);
        return comment;
      })
    );

    socket.on("comment:update", (payload, ack?: Ack) =>
      handleWithAuth(socket, ack, (dni) =>
        updateCommentUseCase({ dni, code: payload.code, message: payload.message })
      )
    );

    socket.on("comment:delete", (payload, ack?: Ack) =>
      handleWithAuth(socket, ack, (dni) =>
        deleteCommentUseCase({ dni, code: payload.code })
      )
    );

    socket.on("comment:reply", (payload, ack?: Ack) =>
      handleWithAuth(socket, ack, (dni) =>
        replyToCommentUseCase({ dni, code: payload.code, payload: payload.data })
      )
    );

    socket.on("disconnect", () => {
      const dni = socket.data.dni;
      if (dni) {
        updateLastLogout(dni);
      }
    });
  });
}
