const { check, body, validationResult } = require('express-validator');

const Post = require("../models/post");
const User = require("../models/user");

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
//
exports.post_get = async (req, res, next) => {
  const post = await Post.findById(req.params.postId).populate("author");
  res.json(post);

  let postArray = [];

  try {
    const currentUser = await User.findById(req.user._id);

    const array = [currentUser._id, ...currentUser.friends, ...currentUser.outcoming_friends_requests];
    await Promise.all(array.map(async (userId) => getFriendNews(postArray, userId)))

    postArray.sort((a, b) => b.date.getTime() - a.date.getTime());
  } finally {
    console.log(postArray)
    return res.json(postArray)
  }
}

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
    console.log(postArray)
    return res.json(postArray)
  }
}

exports.post_delete = async (req, res, next) => {
  await Post.findByIdAndDelete(req.body._id);
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

/* async function getFriendNews(sourceArray, userId) {
  const friendPosts = [];
  friendPosts.push(...await Post.find({author: userId}).populate("author"));
  //friendPosts.push(...await Post.find({author: userId}).populate(["author", "comments"]));

  sourceArray.push(...friendPosts);
} */

async function getFriendNews(sourceArray, userId) {
  sourceArray.push(...await Post.find({author: userId}).populate("author"));
  //friendPosts.push(...await Post.find({author: userId}).populate(["author", "comments"]));
}