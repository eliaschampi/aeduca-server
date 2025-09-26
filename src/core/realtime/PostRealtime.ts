import PostModel from "../../model/Post";
import { emitToRooms, buildPostRooms, serializePost } from "./helpers";

export const POST_EVENTS = {
  CREATED: "post:created",
  UPDATED: "post:updated",
  DELETED: "post:deleted",
  LIKED: "post:liked",
  SAVED: "post:saved",
  APPROVED: "post:approved"
} as const;

export type PostLikePayload = {
  post_code: number;
  dni: string;
  liked: boolean;
  count: number;
};

export type PostSavePayload = {
  post_code: number;
  dni: string;
  saved: boolean;
};

export function emitPostCreated(post: PostModel): void {
  const rooms = buildPostRooms(post);
  emitToRooms(POST_EVENTS.CREATED, serializePost(post), rooms);
}

export function emitPostUpdated(post: PostModel): void {
  const rooms = buildPostRooms(post);
  emitToRooms(POST_EVENTS.UPDATED, serializePost(post), rooms);
}

export function emitPostDeleted(post: PostModel): void {
  const rooms = buildPostRooms(post);
  emitToRooms(POST_EVENTS.DELETED, { post_code: post.code }, rooms);
}

export function emitPostLiked(post: PostModel, payload: PostLikePayload): void {
  const rooms = buildPostRooms(post);
  emitToRooms(POST_EVENTS.LIKED, payload, rooms);
}

export function emitPostSaved(post: PostModel, payload: PostSavePayload): void {
  const rooms = buildPostRooms(post);
  emitToRooms(POST_EVENTS.SAVED, payload, rooms);
}

export function emitPostApproved(post: PostModel): void {
  const rooms = buildPostRooms(post);
  emitToRooms(POST_EVENTS.APPROVED, serializePost(post), rooms);
}
