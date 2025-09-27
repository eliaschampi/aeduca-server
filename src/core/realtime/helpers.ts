import PostModel from "../../model/Post";
import CommentModel from "../../model/Comment";
import { getIO } from "./RealtimeBus";

export type PostRealtimePayload = ReturnType<PostModel["toJSON"]> & {
  code: number;
};

export type CommentRealtimePayload = ReturnType<CommentModel["toJSON"]> & {
  code: number;
  post_code: number;
};

export function serializePost(post: PostModel): PostRealtimePayload {
  return {
    ...(post.toJSON() as any),
    code: post.code
  } as PostRealtimePayload;
}

export function serializeComment(comment: CommentModel): CommentRealtimePayload {
  return {
    ...(comment.toJSON() as any),
    code: comment.code,
    post_code: comment.post_code
  } as CommentRealtimePayload;
}

export function buildAudienceRooms(share_with: string[] = []): string[] {
  if (!share_with || share_with.length === 0) {
    return ["aud:all"];
  }
  return share_with.map((aud) => `aud:${aud}`);
}

export function buildPostRooms(post: PostModel): string[] {
  const audienceRooms = buildAudienceRooms(post.share_with || []);
  const rooms = new Set<string>([
    `post:${post.code}`,
    `user:${post.creator_dni}`,
    ...audienceRooms
  ]);
  return Array.from(rooms);
}

export function buildCommentRooms(comment: CommentModel): string[] {
  const rooms = new Set<string>([
    `post:${comment.post_code}`,
    `user:${comment.from_dni}`
  ]);
  return Array.from(rooms);
}

export function emitToRooms<T>(event: string, payload: T, rooms: string[]): void {
  const io = getIO();
  if (rooms.length === 0) {
    io.emit(event, payload);
    return;
  }
  io.to([...new Set(rooms)]).emit(event, payload);
}
