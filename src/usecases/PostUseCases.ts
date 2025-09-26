import PostService from "../services/PostService";
import CommentService from "../services/CommentService";
import CommentModel, { IComment } from "../model/Comment";
import { IPost } from "../model/Post";
import {
  emitPostApproved,
  emitPostCreated,
  emitPostDeleted,
  emitPostLiked,
  emitPostSaved,
  emitPostUpdated
} from "../core/realtime/PostRealtime";
import {
  emitCommentCreated,
  emitCommentDeleted,
  emitCommentUpdated,
  emitReplyCreated
} from "../core/realtime/CommentRealtime";
import { fetchPersonSummary } from "./shared/person";

export type PostCreateInput = {
  dni: string;
  payload: {
    content: string;
    commentable?: boolean;
    link?: string;
    share_with?: string[];
    files?: number[];
    approved?: boolean;
  };
};

export type PostUpdateInput = {
  dni: string;
  code: number;
  payload: {
    content?: string;
    commentable?: boolean;
    link?: string;
    share_with?: string[];
  };
};

export type PostDeleteInput = {
  dni: string;
  code: number;
};

export type PostToggleReactionInput = {
  code: number;
  dni: string;
};

export type PostApprovalInput = {
  code: number;
  approved: boolean;
};

export type CommentCreateInput = {
  dni: string;
  payload: {
    post_code: number;
    message: string;
    reply_to_code?: number;
    content_type?: string;
    url?: string;
    file_code?: number;
  };
};

export type CommentUpdateInput = {
  dni: string;
  code: number;
  message: string;
};

export type CommentDeleteInput = {
  dni: string;
  code: number;
};

export type CommentReplyInput = {
  dni: string;
  code: number;
  payload: {
    message: string;
    content_type?: string;
    url?: string;
    file_code?: number;
  };
};

function ensureShareWith(share_with?: string[]): string[] {
  if (!share_with || share_with.length === 0) {
    return ["all"];
  }
  return share_with;
}

export async function createPost({ dni, payload }: PostCreateInput) {
  const creator = await fetchPersonSummary(dni);
  const data: Partial<IPost> = {
    content: payload.content,
    commentable: payload.commentable !== false,
    link: payload.link,
    creator_dni: dni,
    creator_name: `${creator.name} ${creator.lastname}`.trim(),
    creator_image: creator.image ?? undefined,
    share_with: ensureShareWith(payload.share_with),
    approved: payload.approved ?? false
  };

  const post =
    payload.files && payload.files.length > 0
      ? await PostService.createWithTransaction(data, payload.files)
      : await PostService.create(data);

  emitPostCreated(post);
  return post;
}

export async function updatePost({ dni, code, payload }: PostUpdateInput) {
  const existing = await PostService.getById(code);

  if (!existing) {
    throw new Error("Post no encontrado");
  }

  if (existing.creator_dni !== dni) {
    throw new Error("No autorizado para actualizar este post");
  }

  const updateData: Partial<IPost> = {};
  if (payload.content !== undefined) updateData.content = payload.content;
  if (payload.commentable !== undefined) updateData.commentable = payload.commentable;
  if (payload.link !== undefined) updateData.link = payload.link;
  if (payload.share_with !== undefined)
    updateData.share_with = ensureShareWith(payload.share_with);

  const updated = await PostService.update(code, updateData);

  emitPostUpdated(updated);
  return updated;
}

export async function deletePost({ dni, code }: PostDeleteInput) {
  const existing = await PostService.getById(code);

  if (!existing) {
    throw new Error("Post no encontrado");
  }

  if (existing.creator_dni !== dni) {
    throw new Error("No autorizado para eliminar este post");
  }

  await PostService.delete(code);
  emitPostDeleted(existing);
}

export async function toggleLike({ code, dni }: PostToggleReactionInput) {
  const result = await PostService.toggleLike(code, dni);
  const post = await PostService.getById(code);
  if (post) {
    emitPostLiked(post, {
      post_code: post.code,
      dni,
      liked: result.liked,
      count: result.count
    });
  }
  return result;
}

export async function toggleSave({ code, dni }: PostToggleReactionInput) {
  const result = await PostService.toggleSave(code, dni);
  const post = await PostService.getById(code);
  if (post) {
    emitPostSaved(post, {
      post_code: post.code,
      dni,
      saved: result.saved
    });
  }
  return result;
}

export async function setPostApproval({ code, approved }: PostApprovalInput) {
  const updated = await PostService.setApprovalStatus(code, approved);
  emitPostApproved(updated);
  return updated;
}

export async function getPostWithComments(code: number) {
  const post = await PostService.getById(code);
  if (!post) {
    throw new Error("Post no encontrado");
  }
  const comments = await CommentService.getAllPostComments(code);
  return {
    post,
    comments
  };
}

function ensureComment(comment?: CommentModel | null): CommentModel {
  if (!comment) {
    throw new Error("Comentario no encontrado");
  }
  return comment;
}

export async function createComment({ dni, payload }: CommentCreateInput) {
  const commenter = await fetchPersonSummary(dni);

  const commentData: Partial<IComment> = {
    post_code: payload.post_code,
    from_dni: dni,
    from_name: `${commenter.name} ${commenter.lastname}`.trim(),
    from_image: commenter.image ?? undefined,
    message: payload.message,
    reply_to_code: payload.reply_to_code,
    content_type: payload.content_type ?? "text",
    url: payload.url
  };

  const comment = payload.file_code
    ? await CommentService.createWithAttachment(commentData, payload.file_code)
    : await CommentService.create(commentData);

  emitCommentCreated(comment);
  return comment;
}

export async function updateComment({ dni, code, message }: CommentUpdateInput) {
  const existing = ensureComment(await CommentService.getById(code));

  if (existing.from_dni !== dni) {
    throw new Error("No autorizado para actualizar este comentario");
  }

  const updated = await CommentService.update(code, { message });
  emitCommentUpdated(updated);
  return updated;
}

export async function deleteComment({ dni, code }: CommentDeleteInput) {
  const existing = ensureComment(await CommentService.getById(code));

  if (existing.from_dni !== dni) {
    throw new Error("No autorizado para eliminar este comentario");
  }

  await CommentService.delete(code);
  emitCommentDeleted(existing);
}

export async function replyToComment({ dni, code, payload }: CommentReplyInput) {
  const commenter = await fetchPersonSummary(dni);

  const replyData: Partial<IComment> = {
    from_dni: dni,
    from_name: `${commenter.name} ${commenter.lastname}`.trim(),
    from_image: commenter.image ?? undefined,
    message: payload.message,
    content_type: payload.content_type ?? "text",
    url: payload.url
  };

  const reply = await CommentService.replyToComment(code, replyData, payload.file_code);
  emitReplyCreated(reply);
  return reply;
}
