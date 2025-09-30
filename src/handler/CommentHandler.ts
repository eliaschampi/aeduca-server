import { NextFunction, Request, Response } from "express";
import CommentService from "../services/CommentService";

export const getPostComments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { post_code } = req.params;
    const { page = 1, limit = 20, includeReplies = true } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const comments =
      includeReplies === "true" || includeReplies === true
        ? await CommentService.getPostComments(Number(post_code), Number(limit), offset)
        : await CommentService.getAllPostComments(Number(post_code));

    // Calculate total count from the query result
    const allComments = await CommentService.getAllPostComments(Number(post_code));
    const count = allComments.length;

    res.status(200).json({
      values: comments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count
      }
    });
  } catch (error) {
    next(error);
  }
};
