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
  let array = await getPopulateListUsers(req.user._id, 'outcoming_friends_requests');

  res.json(array);
}

exports.incoming_friends_requests_get = async (req, res, next) => {
  let array = await getPopulateListUsers(req.user._id, 'incoming_friends_requests');

  res.json(array);
}

exports.friend_list_get = async (req, res, next) => {
  let array = await getPopulateListUsers(req.user._id, 'friends');
  //let array = User.findById(req.user._id).getPopulateArray(friends)

  res.json(array);
}


exports.incoming_friends_requests_put = async (req, res, next) => {
  let currentUser = await User.findById(req.user._id);
  let friendUser = await User.findById(req.body._id);

  if (!currentUser.friends.includes(req.body._id)) {
    await deleteAndAddFriend.call(currentUser, "incoming_friends_requests", req.body._id);
    await deleteAndAddFriend.call(friendUser, "outcoming_friends_requests", req.user._id);
    /* 
    await deleteAndAddFriend(currentUser, "incoming_friends_requests", req.body._id);
    await deleteAndAddFriend(friendUser, "outcoming_friends_requests", req.user._id); */
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

exports.friend_delete = async (req, res, next) => {
  let currentUser = await User.findById(req.user._id);
  let friendUser = await User.findById(req.body._id);

  if (currentUser.friends.includes(req.body._id)) {
    await deleteAndAddUser.call(currentUser, currentUser.friends, currentUser.incoming_friends_requests, req.body._id);
    await deleteAndAddUser.call(friendUser, friendUser.friends, friendUser.outcoming_friends_requests, req.user._id);
    /* deleteUser.call(currentUser.friends, req.body._id);
    deleteUser.call(friendUser.friends, req.user._id);

    await addUserToArray.call(currentUser, "incoming_friends_requests", req.body._id);
    await addUserToArray.call(friendUser, "outcoming_friends_requests", req.user._id); */
    /* await deleteUser.call(currentUser, "friends", req.body._id);
    await addUserToArray.call(currentUser, "incoming_friends_requests", req.body._id);

    await deleteUser.call(friendUser, "friends", req.user._id);
    await addUserToArray.call(friendUser, "outcoming_friends_requests", req.user._id); */
    /* await deleteAndAddUser.call(currentUser, "outcoming_friends_requests", req.body._id);
    await deleteAndAddUser.call(friendUser, "outcoming_friends_requests", req.user._id); */
  } else {
    currentUser = null;
  }

  res.json(currentUser);
}

async function deleteAndAddUser (arrayForDelete, arrayForAdd, friendId) {
  arrayForDelete.splice(arrayForDelete.indexOf(friendId), 1);

  addUserToArray.call(this, arrayForAdd, friendId);
}

async function deleteAndAddFriend (nameArray, friendId) {
  const id = this[nameArray].indexOf(friendId);
  this[nameArray].splice(id, 1);

  addUserToArray.call(this, "friends", friendId);
}

async function addUserToArray (nameArray, friendId) {
  this[nameArray].push(friendId);
  this.save();
}

async function getPopulateListUsers (userId, array) {
  const populatedUser = await User.findById(userId).populate(array);
  return populatedUser[array];
}

function deleteUser (friendId) {
  this.splice(this.indexOf(friendId), 1);
}

/* function deleteUser (nameArray, friendId) {
  const id = this[nameArray].indexOf(friendId);
  this[nameArray].splice(id, 1);
} */

/* async function deleteAndAddUser (nameArray, friendId) {
  const id = this.friends.indexOf(friendId);
  this.friends.splice(id, 1);

  addUserToArray.call(this, nameArray, friendId);
} */