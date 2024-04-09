// Init router
import { Router } from "express";

import CommentController from "../app/controller/commentController";

const commentController = new CommentController();

const router = Router();

// Get all comments
router.get(
  "/getCommentsByIdVideo/:idVideo",
  commentController.getCommentsByIdVideo
);
router.post("/replieCommentById/:id", commentController.replieCommentById);
router.post("/createComment", commentController.createComment);
router.put("/updateComment/:id", commentController.updateComment);
router.delete("/deleteComment/:id", commentController.deleteComment);

export default router;
