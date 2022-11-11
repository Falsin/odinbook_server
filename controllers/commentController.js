const { check, body, validationResult } = require('express-validator');

const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");

exports.comments_get = async (req, res, next) => {
  const comments = await Comment.find({post: req.params.postId}).populate("author");
  comments.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  res.json(comments)
}

exports.comment_post = [
  body("text").trim().isLength({ min: 1 }).escape(),
  check("photo").custom(({req}) => req.file ? true : false),

  async (req, res, next) => {
    const errorArray = validationResult(req).errors;

    if (errorArray.length == 2) {
      return res.json(false)
    }

    new Comment({
      author: req.user._id,
      post: req.body.postId,
      content: {
        text: req.body.text,
        photo: !req.file ? null : {
          bufferObject: req.file.buffer,
          contentType: req.file.mimetype
        }
      },
      date: Date.now(),
    })
    .save(async (err, comment) => {
      let post = await Post.findById(comment.post);

      post.comments.push(comment._id);
      await post.save();

      req.params = {postId: comment.post};

      next();
    }) 
  }
]

exports.comment_put = [
  body("text").trim().isLength({min: 1}).escape(),
  check("photo").custom((value, {req}) => req.file ? true : false),

  async (req, res, next) => {
    const errorArray = validationResult(req).errors;

    if (errorArray.length == 2) {
      return res.json(false);
    }

    let comment = await Comment.findById(req.body.commentId);

    comment.content = {
      text: req.body.text,
      photo: !req.file ? null : {
        bufferObject: req.file.buffer,
        contentType: req.file.mimetype,
      } 
    };
    comment.date = Date.now();
    comment.save(async (err, comment) => {
      req.params = {postId: comment.post}
      next()
    })
  }
]

exports.comment_delete = async (req, res, next) => {
  console.log(req.body)
  const comment = await Comment.findByIdAndDelete(req.body.commentId);
  console.log(comment);
  const arrayComments = await Comment.find({post: comment.post});

  res.json(arrayComments);
}