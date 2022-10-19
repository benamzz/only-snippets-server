const { Schema, model } = require("mongoose");
const languages = ["", "html", "css", "js", "php", "xml", "python", "c", "c++", "typescript"]

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
    timestamps: true,
  }
);

const Snippet = model("Snippet", snippetSchema);

module.exports = Snippet;
