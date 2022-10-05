const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      // unique: true
    },
    password: {
      type: String,
      required: true
    },
    avatarUrl: String,
    email: {
      type: String,
      unique: true,
      required: true
    },
    bio: String,
    location: String,
    tags: Array,
    website: String,
    linkedIn: String,
    github: String,
    following: Array,
    likes: Array
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
