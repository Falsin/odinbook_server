const { check, body, validationResult } = require('express-validator');

const Post = require("../models/post");
const User = require("../models/user");

exports.post_post = [
  body("text").trim().isLength({ min: 1 }).escape(),
  check("photo").custom((value, {req}) => {
    return req.file ? true : false;
  }),

  async (req, res, next) => {
    const errorArray = validationResult(req).array;

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

    postArray.sort((a, b) => a.date.getTime() - b.date.getTime());
  } finally {
    return res.json(postArray)
  }
}

async function getFriendNews(sourceArray, userId) {
  const friendPosts = [];
  friendPosts.push(...await Post.find({author: userId}).populate("author"));

  /* for (const item of array) {
    friendPosts.push(await Post.find({author: item}).populate("author"));
  } */
  sourceArray.push(...friendPosts);
}

/* exports.posts_get = async (req, res, next) => {
  let postArray = [];

  try {
    const currentUser = await User.findById(req.user._id);

    const array = [[currentUser._id], currentUser.friends, currentUser.outcoming_friends_requests];
    await Promise.all(array.map(async (elem) => getFriendNews(postArray, elem)))

    postArray.sort((a, b) => a.date.getTime() - b.date.getTime());
  } finally {
    return res.json(postArray)
  }
}

async function getFriendNews(sourceArray, array) {
  const friendPosts = [];

  for (const item of array) {
    friendPosts.push(...await Post.find({author: item}).populate("author"));
  }
  sourceArray.push(...friendPosts);
} */

/* exports.posts_get = async (req, res, next) => {
  let postArray = [];

  try {
    const currentUser = await User.findById(req.user._id);

    let currentUserPosts = await Post.find({author: currentUser._id}).populate("author");
    postArray.push(...currentUserPosts);

    for (const item of currentUser.friends) {
      const friendPosts = await Post.find({author: item}).populate("author");
      postArray.push(...friendPosts);
    }

    for (const item of currentUser.outcoming_friends_requests) {
      const outcomingFriendPosts = await Post.find({author: item}).populate("author");
      postArray.push(...outcomingFriendPosts);
    }

    postArray.sort((a, b) => a.date.getTime() - b.date.getTime());
  } finally {
    return res.json(postArray)
  }
} */
//19 строчек