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
    comment.save((err, comment) => res.json(comment))
  }
]

exports.comment_delete = async (req, res, next) => {
  const comment = await Comment.findByIdAndDelete(req.body.commentId);
  const arrayComments = await Comment.find({post: comment.post});

  let post = await Post.findById(comment.post);
  post.comments.splice(post.comments.indexOf(comment._id), 1)
  await post.save()

  res.json(arrayComments);
}

exports.comment_put_like = async (req, res, next) => {
  let comment = await Comment.findById(req.params.commentId).populate("author");
  comment.likes.push(req.user._id);
  await comment.save();

  res.json(comment);
}

exports.comment_delete_like = async (req, res, next) => {
  let comment = await Comment.findById(req.params.commentId).populate("author");
  comment.likes.splice(comment.likes.indexOf(req.user._id), 1);
  await comment.save();

  res.json(comment);
}