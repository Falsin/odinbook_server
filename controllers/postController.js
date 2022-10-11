const { check, body, validationResult } = require('express-validator');

const Post = require("../models/post");

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
  }
  //body("photo").trim().isLength({ min: 1 }).escape(),
]