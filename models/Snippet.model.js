const { Schema, model } = require("mongoose");
const User = require("./User.model")
const Article = require("./Article.model")

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const snippetSchema = new Schema(
  {
   content: String,
   userId:{
    type: Schema.Types.ObjectId,
    ref: "User"
   },
   articleId:{
    type: Schema.Types.ObjectId,
    ref: "Article"
   }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Snippet = model("Snippet", snippetSchema);

module.exports = Snippet;
