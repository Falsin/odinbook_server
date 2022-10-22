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

exports.posts_get = async (req, res, next) => {
  let postArray = [];

  try {
    const currentUser = await User.findById(req.user._id);

    const array = [currentUser._id, ...currentUser.friends, ...currentUser.outcoming_friends_requests];
    await Promise.all(array.map(async (userId) => getFriendNews(postArray, userId)))

    postArray.sort((a, b) => b.date.getTime() - a.date.getTime());
  } finally {
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

    console.log(req.body.photo)

    if (errorArray.length == 2) {
      return res.json(false)
    }
  
    let post = await Post.findById(req.body.id);
    //console.log(post)
    //console.log(post);
    post.content = {
      text: req.body.text,
      photo: !req.body.photo ? null : JSON.parse(req.body.photo)
    }
    post.date = Date.now();
    post.save((err, doc) => {
      console.log(err)
      next()
    })
  }
]

async function getFriendNews(sourceArray, userId) {
  const friendPosts = [];
  friendPosts.push(...await Post.find({author: userId}).populate("author"));

  sourceArray.push(...friendPosts);
}