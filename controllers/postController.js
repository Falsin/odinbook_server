const { check, body, validationResult } = require('express-validator');

const Post = require("../models/post");

exports.post_post = [
  body("text").trim().isLength({ min: 1 }).escape(),
  check("photo").custom((value, {req}) => {
    return req.file ? true : false;
  }),

  async (req, res, next) => {
    const errorArray = validationResult(req).array;

    //return res.json(errorArray.length == 2 ? false : true);

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
    }).save((err, post) => {
      res.json(post)
    })
  }
]