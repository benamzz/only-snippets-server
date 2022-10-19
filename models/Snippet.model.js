const { Schema, model } = require("mongoose");
const User = require("./User.model")
const Article = require("./Article.model")
const languages = ["", "html", "css", "js", "php", "xml", "python", "c", "c++", "typescript"]

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const snippetSchema = new Schema(
  {
    content: String,
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    articleId: {
      type: Schema.Types.ObjectId,
      ref: "Article"
    },
    tag: {
      type: String,
      enum: languages,
      default: "html"
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Snippet = model("Snippet", snippetSchema);

module.exports = Snippet;
