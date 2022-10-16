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
        photo: {
          bufferObject: req.file ? req.file.buffer : null, 
          contentType: req.file ? req.file.mimetype : null,
        }
      },
      date: Date.now(),
    }).save(async (err, post) => {
      const currentUser = await Post.findById(req.user_id);
      let postArray = [];

      let currentUserPosts = await Post.find({author: currentUser._id});
      postArray.push(currentUserPosts);

      for (const item of currentUser.friends) {
        const friendPosts = await Post.find({author: item});
        postArray.push(friendPosts);
      }

      for (const item of currentUser.outcoming_friends_requests) {
        const outcomingFriendPosts = await Post.find({author: item});
        postArray.push(outcomingFriendPosts);
      }

      res.json(postArray)
    })
  }
]