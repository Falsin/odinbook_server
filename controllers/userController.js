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

/* exports.outcoming_friends_requests_get = async (req, res, next) => {
  let currentUser = await User.findById(req.user._id);
  await currentUser.populate('outcoming_friends_requests');

  res.json(currentUser.outcoming_friends_requests);
}

exports.incoming_friends_requests_get = async (req, res, next) => {
  let currentUser = await User.findById(req.user._id);
  await currentUser.populate('incoming_friends_requests');

  res.json(currentUser);
} */

exports.outcoming_friends_requests_get = async (req, res, next) => {
  let array = await getPopulateListUsers(req.user._id, 'outcoming_friends_requests')

  res.json(array);
}

exports.incoming_friends_requests_get = async (req, res, next) => {
  let array = await getPopulateListUsers(req.user._id, 'incoming_friends_requests')

  console.log(array)
  res.json(array);
}

async function getPopulateListUsers (userId, array) {
  return await User.findById(userId).populate(array);
}

/* exports.outcoming_friends_requests_get = async (req, res, next) => {
  let array = await User.findById(req.user._id).populate('outcoming_friends_requests');

  res.json(array);
}

exports.incoming_friends_requests_get = async (req, res, next) => {
  let array = await User.findById(req.user._id).populate('incoming_friends_requests');;

  res.json(array);
} */

/* async function getPopulateListUsers (userId, array) {
  let currentUser = await User.findById(userId);
  await currentUser.populate(array);
  return currentUser;
} */

exports.incoming_friends_requests_put = async (req, res, next) => {
  let currentUser = await User.findById(req.user._id);
  let friendUser = await User.findById(req.body._id);

  if (!currentUser.friends.includes(req.body._id)) {
    await deleteAndAddFriend(currentUser, "outcoming_friends_requests", req.body._id);
    await deleteAndAddFriend(friendUser, "incoming_friends_requests", req.user._id);
  } else {
    currentUser = null;
  }

  res.json(currentUser);
}

exports.friend_put = async (req, res, next) => {
  let currentUser = await User.findById(req.user._id);
  let friendUser = await User.findById(req.body._id);

  if (!currentUser.outcoming_friends_requests.includes(req.body._id)) {
    await addUserToArray(currentUser, "outcoming_friends_requests", req.body._id);
    await addUserToArray(friendUser, "incoming_friends_requests", req.user._id);
  } else {
    currentUser = null;
  }
  
  res.json(currentUser);
}

async function deleteAndAddFriend (currentUser, friendId, nameArray) {
  const id = currentUser[nameArray].indexOf(req.body._id);
  currentUser[nameArray].splice(id, 1);

  addUserToArray(currentUser, "friends", friendId);
}

async function addUserToArray (user, array, findUserId) {
  user[array].push(findUserId);
  user.save();
}