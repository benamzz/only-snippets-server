const { Schema, model } = require("mongoose");
const User = require("./User.model");
const Snippet = require("./Snippet.model")

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const articleSchema = new Schema(
  {
    content: String,
    tag: String,
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
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Article = model("Article", articleSchema);

module.exports = Article;