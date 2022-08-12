const express = require("express");
const router = express.Router();
const multer  = require('multer');
const upload = multer();

const passport = require("../authentication");
const userController = require("../controllers/userController");

/* router.post("/", upload.single("photo"), (req, res, next) => {
  //console.log(req)

  res.json('hello!')
}) */

router.post("/", 
  upload.single("photo"), 
  userController.sign_up_post, 
  passport.authenticate('local', {failureRedirect: '/'}),
  (req, res, next) => {
    res.json(createUserObject(req.user));
  }
)

router.get("/", 
  (req, res, next) => {
    res.json(createUserObject(req.user));
  }
)

function createUserObject(obj) {
  const { 
    _id, 
    first_name, 
    last_name, 
    username, 
    birth_date, 
    photo, 
    friends, 
    incoming_friends_requests, 
    outcoming_friends_requests 
  } = obj;

  return { 
    _id, 
    first_name, 
    last_name, 
    username, 
    birth_date, 
    photo, 
    friends, 
    incoming_friends_requests, 
    outcoming_friends_requests 
  }
}

module.exports = router;