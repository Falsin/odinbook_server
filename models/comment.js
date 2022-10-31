const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  author: {type: Schema.Types.ObjectId, ref: "User"},
  post: {type: Schema.Types.ObjectId, ref: "Post"},
  content: {
    text: {type: String, maxlength: 500},
    photo: {
      bufferObject: Buffer,
      contentType: String
    }
  },
  date: {type: Date, required: true},
  likes: [{type: Schema.Types.ObjectId, ref: "User"}]
})

module.exports = mongoose.model('Comment', CommentSchema)