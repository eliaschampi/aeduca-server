import CommentModel from "../../model/Comment";
import { emitToRooms, buildCommentRooms, serializeComment } from "./helpers";

export const COMMENT_EVENTS = {
  CREATED: "comment:created",
  UPDATED: "comment:updated",
  DELETED: "comment:deleted",
  REPLY_CREATED: "comment:reply"
} as const;

export function emitCommentCreated(comment: CommentModel): void {
  const rooms = buildCommentRooms(comment);
  emitToRooms(COMMENT_EVENTS.CREATED, serializeComment(comment), rooms);
}

export function emitCommentUpdated(comment: CommentModel): void {
  const rooms = buildCommentRooms(comment);
  emitToRooms(COMMENT_EVENTS.UPDATED, serializeComment(comment), rooms);
}

export function emitCommentDeleted(comment: CommentModel): void {
  const rooms = buildCommentRooms(comment);
  emitToRooms(
    COMMENT_EVENTS.DELETED,
    { code: comment.code, post_code: comment.post_code },
    rooms
  );
}

export function emitReplyCreated(comment: CommentModel): void {
  const rooms = buildCommentRooms(comment);
  emitToRooms(COMMENT_EVENTS.REPLY_CREATED, serializeComment(comment), rooms);
}
