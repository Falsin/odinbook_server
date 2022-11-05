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
    console.log(req.file)

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
      let post = await Post.findById(req.body.postId);
      post.comments.push(comment._id);

      const test = await Comment.findById(comment._id);
      //console.log(test)

      //console.log(post);

      post.save((err, post) => {
        //console.log(post)
        res.json(comment)
      })
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
      let post = await Post.findById(comment.post).populate("comments");
      let comments = post.comments;
      console.log(comments);
      
      comments.sort((a, b) => b.date.getTime() - a.date.getTime());

      res.json(comments);
    })
  }
]

/* async (req, res, next) => {
  const comment = new Comment({

  })
} */