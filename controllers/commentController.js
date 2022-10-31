const { check, body, validationResult } = require('express-validator');

const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");

/* exports.comments_get = async (req, res, next) => {
  const comments = await Comment.find({post: req.body.postId});
  res.json(comments)
} */

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
      let post = await Post.findById(req.body.postId);
      post.comments.push(comment._id);

      //console.log(post);

      post.save((err, post) => {
        //console.log(post)
        res.json(comment)
      })
    }) 
  }
]

/* async (req, res, next) => {
  const comment = new Comment({

  })
} */