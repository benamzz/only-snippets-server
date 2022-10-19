const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
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
    linkedin: String,
    github: String,
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likes: Array
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
