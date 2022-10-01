const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const User = require("../models/user");

exports.sign_up_post = [
  body('first_name', 'FirstName must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('last_name', 'LastName must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('username', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('password', 'Password must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('birth_date', 'Password must not be empty.').trim().isLength({ min: 1 }).escape(),

  async (req, res, next) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.json('false')
    }

    bcrypt.hash(req.body.password, 10, (err, salt) => {
      if (err) {
        next(err)
      } else {
        new User({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          username: req.body.username,
          password: salt,
          birth_date: req.body.birth_date,
          photo: {
            data: req.file.buffer,
            contentType: req.file.mimetype
          }
        }).save((err, user) => {
          next()
        })
      }
    })
  }
]

exports.login = [
  body('username', 'Username must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('password', 'Password must not be empty.').trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.json(error.array())
    } else {

      next();
    }
  }
]

exports.logout = (req, res, next) => {
  console.log('hello')
  console.log(typeof req.logout)
  console.log(req.logout())
  res.redirect("/")
  req.logout((err) => {
    if (err) {
      next(err)
    }
    console.log('hello1')
    res.redirect("/")
  });
}