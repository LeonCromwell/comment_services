import { Request, Response } from "express";
import mongoose from "mongoose";

import Comment, {IComment} from "../model/comment";
import getCommentReplies from "../../utils/getCommentReplie";

interface CommentData {
  _id?: string;
  text: string;
  author: number;
  videoId: string;
  createdAtUnix?: number;
  updatedAtUnix?: number;
  replies?: string[];
}

class CommentController {
  public async getCommentsByIdVideo(req: Request, res: Response) {
    const idVideo = req.params.idVideo;
    try {
      const comments: IComment[] = await Comment.find({
        videoId: idVideo,
      });
      const commentsWithReplies = await Promise.all(
        comments.map((comment) => {
          return getCommentReplies(comment._id as unknown as mongoose.Types.ObjectId);
        })
      );
      const flatCommentsWithReplies = commentsWithReplies.flat();

      res.status(200).json(flatCommentsWithReplies);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  //replies comment by id
  // [POST] /replieComment/:id
  public replieCommentById(req: Request, res: Response) {
    const idParentComment = req.params.id;
    const newReply: CommentData = {
      text: req.body.text,
      author: req.body.author,
      videoId: req.body.videoId,
    };
    Comment.create(newReply).then((reply) => {
      const replyId = reply._id;
      Comment.findByIdAndUpdate(idParentComment, {
        $push: { replies: replyId },
      })
        .then(() => {
          res.status(200).json("Replie comment");
        })
        .catch((error) => {
          res.status(500).json(error);
        });
    });
  }

  //create comment
  // [POST] /createComment
  public async createComment(req: Request, res: Response) {
    try {
      const CommentData: CommentData = {
        text: req.body.text,
        author: req.body.author,
        videoId: req.body.videoId,
        createdAtUnix: Math.floor(Date.now() / 1000),
      };

      Comment.create(CommentData);
      console.log("Create comment");
      res.status(200).json("Create comment");
    } catch (error) {
      res.status(500).json(error);
    }
  }

  //update comment
  // [PUT] /updateComment/:id
  public updateComment(req: Request, res: Response) {
    const idComment = req.params.id;
    Comment.findByIdAndUpdate(idComment, {
      text: req.body.text,
    })
      .then(() => {
        res.status(200).json("Update comment");
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  }

  //delete comment
  // [DELETE] /deleteComment/:id
  public deleteComment(req: Request, res: Response) {
    const idComment = req.params.id;
    Comment.findByIdAndDelete(idComment)
      .then(() => {
        res.status(200).json("Delete comment");
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  }
}

export default CommentController;
