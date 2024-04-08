import mongoose from "mongoose";

import Comment, { IComment } from "../app/model/comment";

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

  export default getCommentReplies;