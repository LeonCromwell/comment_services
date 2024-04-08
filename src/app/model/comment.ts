import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    author: {
      type: Number,
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "videos",
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments",
      },
    ],
  },
  {
    timestamps: true,
    collection: "comments",
  }
);

commentSchema.virtual("createdAtUnix").get(function () {
  return this.createdAt.getTime() / 1000;
});

commentSchema.virtual("updatedAtUnix").get(function () {
  return this.updatedAt.getTime() / 1000;
});

commentSchema.set("toObject", { virtuals: true });
commentSchema.set("toJSON", { virtuals: true });

const Comment = mongoose.model("comments", commentSchema);
export default Comment;



export interface IComment {
  _id: string;
  text: string;
  author: string;
  videoId: string;
  createdAtUnix: number;
  updatedAtUnix: number;
  replies: IComment[] | string[]; // Đây có thể là một mảng các ObjectId hoặc mảng các IComment tùy thuộc vào cách bạn truy vấn
}