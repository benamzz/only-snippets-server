const { Schema, model } = require("mongoose");


const articleSchema = new Schema(
  {
    content: String,
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    comments: [{
      type: Schema.Types.ObjectId,
      ref: "Article"
    }],
    snippet: {
      type: Schema.Types.ObjectId,
      ref: "Snippet"
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Article"
    },
    deletedAt: Date
  },
  {
    timestamps: true,
  }
);

const Article = model("Article", articleSchema);

module.exports = Article;