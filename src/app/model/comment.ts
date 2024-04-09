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

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
