const express = require("express");
const router = express.Router();
const multer  = require('multer');
const upload = multer();
require('dotenv').config();
const passport = require("../passport/passport");

const userController = require("../controllers/userController");

router.post("/", 
  upload.single("photo"), 
  userController.sign_up_post, 
  passport.authenticate('local', {failureRedirect: '/'}),
  (req, res, next) => res.json(createUserObject(req.user))
)

router.get("/", (req, res, next) => {
  res.json(req.user ? createUserObject(req.user) : null)
});

router.post("/login", 
  userController.login,
  passport.authenticate('local', {failureRedirect: '/'}),
  (req, res, next) => res.json(createUserObject(req.user))
)

router.post("/error", 
  (req, res, next) => {
    res.redirect(`${process.env.CLIENT_URL}/error`)
  }
)

router.get("/logout", userController.logout);

router.get("/login/facebook", passport.authenticate("facebook"));

router.get('/oauth2/redirect/facebook', passport.authenticate('facebook', {
  successRedirect: process.env.CLIENT_URL,
  failureRedirect: '/error'
}));

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