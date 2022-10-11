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
  let array = await getPopulateListUsers(req.user, 'outcoming_friends_requests');
  res.json(array);
}

exports.incoming_friends_requests_get = async (req, res, next) => {
  let array = await getPopulateListUsers(req.user, 'incoming_friends_requests');
  res.json(array);
}

exports.friend_list_get = async (req, res, next) => {
  let array = await getPopulateListUsers(req.user, 'friends');
  res.json(array);
}

exports.incoming_friends_requests_put = async (req, res, next) => {
  let {currentUser, friendUser} = await findUsers(req);

  if (!currentUser.friends.includes(req.body._id)) {
    await currentUser.deleteAndAddUser(currentUser.incoming_friends_requests, currentUser.friends, req.body._id);
    await friendUser.deleteAndAddUser(friendUser.outcoming_friends_requests, friendUser.friends, req.user._id);
  } else {
    currentUser = null;
  }

  res.json(currentUser);
}

exports.friend_put = async (req, res, next) => {
  let {currentUser, friendUser} = await findUsers(req);

  if (!currentUser.outcoming_friends_requests.includes(req.body._id)) {
    await currentUser.addUserToArray(currentUser.outcoming_friends_requests, req.body._id);
    await friendUser.addUserToArray(friendUser.incoming_friends_requests, req.user._id);
  } else {
    currentUser = null;
  }
  
  res.json(currentUser);
}

exports.friend_delete = async (req, res, next) => {
  let {currentUser, friendUser} = await findUsers(req);

  if (currentUser.friends.includes(req.body._id)) {
    await currentUser.deleteAndAddUser(currentUser.friends, currentUser.incoming_friends_requests, req.body._id);
    await friendUser.deleteAndAddUser(friendUser.friends, friendUser.outcoming_friends_requests, req.user._id);
  } else {
    currentUser = null;
  }

  res.json(currentUser);
}

exports.outcoming_friends_requests_delete = async (req, res, next) => {
  let {currentUser, friendUser} = await findUsers(req);

  if (currentUser.outcoming_friends_requests.includes(req.body._id)) {
    currentUser.outcoming_friends_requests.splice(currentUser.outcoming_friends_requests.indexOf(req.body._id), 1);
    friendUser.incoming_friends_requests.splice(friendUser.incoming_friends_requests.indexOf(req.user._id), 1);
    
    await currentUser.save();
    await friendUser.save();
  } else {
    currentUser = null;
  }

  res.json(currentUser);
}

async function findUsers(req) {
  let currentUser = await User.findById(req.user._id);
  let friendUser = await User.findById(req.body._id);

  return {currentUser , friendUser}
}

async function getPopulateListUsers (user, nameArray) {
  let array = [];

  try {
    const populatedUser = await User.findById(user._id).populate(nameArray);
    array = populatedUser[nameArray]
  } finally {
    return array;
  }
}