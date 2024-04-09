import { Request, Response } from "express";
import mongoose from "mongoose";

import Comment from "../model/comment";

interface CommentData {
  _id?: string;
  text: string;
  author: number;
  videoId: string;
  createdAtUnix?: number;
  updatedAtUnix?: number;
  replies?: string[];
}

// Định nghĩa type cho comment (điều chỉnh tùy ý theo schema của bạn)
interface IComment {
  _id: string;
  text: string;
  author: string;
  videoId: string;
  createdAtUnix: number;
  updatedAtUnix: number;
  replies: IComment[] | string[]; // Đây có thể là một mảng các ObjectId hoặc mảng các IComment tùy thuộc vào cách bạn truy vấn
}

async function getCommentReplies(
  commentId: mongoose.Types.ObjectId
): Promise<IComment[]> {
  const comment = await Comment.findById(commentId)
    .populate({
      path: "replies",
      populate: { path: "replies" }, // populate nếu có replies bên trong
    })
    .exec();

  if (!comment) {
    return [];
  }

  const commentObj = comment.toObject() as IComment;

  // Nếu có replies, đệ quy để lấy replies của chúng
  if (commentObj.replies.length > 0) {
    const replies: IComment[][] = await Promise.all(
      commentObj.replies.map(async (replyId) => {
        return await getCommentReplies(
          replyId as unknown as mongoose.Types.ObjectId
        );
      })
    );

    // Flatten the nested array of replies into a single array
    const flattenedReplies: IComment[] = replies.flat();

    // Tạo một mảng mới không chứa replies lồng nhau
    return [commentObj, ...flattenedReplies];
  }

  return [commentObj]; // Comment không có reply, trả về mình nó
}

class CommentController {
  public async getCommentsByIdVideo(req: Request, res: Response) {
    const idVideo = req.params.idVideo;
    try {
      const comments: IComment[] = await Comment.find({
        videoId: idVideo,
      }).exec();

      // Lấy tất cả replies cho từng comment
      const commentsWithReplies = await Promise.all(
        comments.map((comment) => {
          return getCommentReplies(comment._id);
        })
      );

      // Phẳng mảng kết quả từ đệ quy
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
