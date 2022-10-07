const fs = require('fs');
const path = require('path');

const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const User = require("../models/user");
const createUserObject = require("../public/javascripts/createUserObject");

const filePath = path.resolve(__dirname, "../public/images/user.jpeg");
const fileContent = fs.readFileSync(filePath);
const contentType = path.extname(filePath);

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
            bufferObject: req.file ? req.file.buffer : fileContent,
            contentType: req.file ? req.file.mimetype : "image/" + contentType.slice(1)
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
  req.logout();
  res.redirect("/");
}

exports.delete = async (req, res, next) => {
  await User.findByIdAndDelete(req.user._id);
  req.logout();
  res.json(true);
}

exports.people_get = async (req, res, next) => {
  const userArray = await User.find({_id: {$ne: req.user._id}});
  const modifiedArray = userArray.map(item => createUserObject(item));
  res.json(modifiedArray);
}

exports.outcoming_friends_requests_get = async (req, res, next) => {
  let currentUser = await User.findOne({_id: req.user._id});
  await currentUser.populate('outcoming_friends_requests');

  res.json(currentUser.outcoming_friends_requests);
}

exports.friend_put = async (req, res, next) => {
  const currentUser = await User.findById(req.user._id);
  const frientUser = await User.findById(req.body._id);

  if (!currentUser.outcoming_friends_requests.includes(req.user._id)) {
    await modifyUser(currentUser, "outcoming_friends_requests", req.body._id);
    await modifyUser(frientUser, "outcoming_friends_requests", req.user._id);
  } else {
    currentUser = null;
  }
  
  res.json(currentUser);
}

async function modifyUser(user, array, findUserId) {
  user[array].push(findUserId);
  user.save();
}

/* async function findUserAndModify(userId, array, findUserId) {
  let user = await User.findOne({_id: userId});
  user[array].push(findUserId);
  return await user.save();
} */

/* exports.friend_put = async (req, res, next) => {
  const currentUser = await findUserAndModify(req.user._id, "outcoming_friends_requests", req.body._id);
  await findUserAndModify(req.body._id, "incoming_friends_requests", req.user._id);

  res.json(currentUser);
}

async function findUserAndModify(userId, array, findUserId) {
  let user = await User.findOne({_id: userId});
  user[array].push(findUserId);
  return await user.save();
} */