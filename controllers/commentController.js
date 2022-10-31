const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");

exports.comments_get = async (req, res, next) => {
  const comments = await Comment.find({post: req.body.postId});
  res.json(comments)
}