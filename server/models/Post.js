const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  image: {
    publicId: String,
    url: String,
  },
  caption: {
    type: String,
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
}, {
  timestamps: true // tell the time when post created
});

module.exports = mongoose.model("Post", postSchema);
