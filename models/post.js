const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  content: {
    text: {type: String, maxlength: 500},
    photo: {
      bufferObject: Buffer, 
      contentType: String,
    }
  },
  date: {type: Date, required: true},
  likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
  comments: [{type: Schema.Types.ObjectId, ref: 'Post'}]
})

module.exports = mongoose.model('Post', PostSchema);