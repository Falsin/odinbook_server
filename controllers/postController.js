const { check, body, validationResult } = require('express-validator');

const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");

exports.post_post = [
  body("text").trim().isLength({ min: 1 }).escape(),
  check("photo").custom((value, {req}) => {
    return req.file ? true : false;
  }),

  async (req, res, next) => {
    const errorArray = validationResult(req).errors;

    if (errorArray.length == 2) {
      return res.json(false)
    }
  
    new Post({
      author: req.user._id,
      content: {
        text: req.body.text,
        photo: !req.file ? null : {
          bufferObject: req.file.buffer, 
          contentType: req.file.mimetype,
        }
      },
      date: Date.now(),
    }).save((err, post) => {
      next();
    })
  }
]

exports.posts_get = async (req, res, next) => {
  let postArray = [];

  try {
    const currentUser = await User.findById(req.user._id);

    const array = [currentUser._id, ...currentUser.friends, ...currentUser.outcoming_friends_requests];
    await Promise.all(array.map(async (userId) => {
      postArray.push(...await Post.find({author: userId}).populate("author"));
    }))

    postArray.sort((a, b) => b.date.getTime() - a.date.getTime());
  } finally {
    return res.json(postArray)
  }
}

exports.post_delete = async (req, res, next) => {
  await Post.findByIdAndDelete(req.body._id);
  await Comment.deleteMany({post: req.body._id});

  const test = await Comment.find({post: req.body._id});
  next()
}

exports.post_put = [
  body("text").trim().isLength({ min: 1 }).escape(),
  check("photo").custom((value, {req}) => {
    return req.file ? true : false;
  }),

  async (req, res, next) => {
    const errorArray = validationResult(req).errors;

    if (errorArray.length == 2) {
      return res.json(false)
    }
  
    let post = await Post.findById(req.body.id);

    post.content = {
      text: req.body.text,
      photo: !req.file ? null : {
        bufferObject: req.file.buffer, 
        contentType: req.file.mimetype,
      }
    }
    post.date = Date.now();
    post.save(() => next())
  }
]

exports.post_put_like = async (req, res, next) => {
  let post = await Post.findById(req.params.postId);
  post.likes.push(req.user._id);
  await post.save();
  res.json(post.likes);
}

exports.post_delete_like = async (req, res, next) => {
  let post = await Post.findById(req.params.postId);
  post.likes.splice(post.likes.indexOf(req.user._id), 1);
  await post.save();
  res.json(post.likes);
}