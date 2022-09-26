const express = require("express");
const router = express.Router();
const multer  = require('multer');
const upload = multer();

const passport = require("../authentication");
const passportForFacebook = require("../authentication_with_Facebook");
const userController = require("../controllers/userController");

router.post("/", 
  upload.single("photo"), 
  userController.sign_up_post, 
  passport.authenticate('local', {failureRedirect: '/'}),
  (req, res, next) => res.json(createUserObject(req.user))
)

router.get("/", (req, res, next) => {
  console.log('this / is work')
  res.json(req.user ? createUserObject(req.user) : null)
});

router.post("/login", 
  userController.login,
  passport.authenticate('local', {failureRedirect: '/'}),
  (req, res, next) => res.json(createUserObject(req.user))
)

router.get("/logout", userController.logout);

router.get("/login/facebook", 
(res, req, next) => {
  console.log('hello!');
  next()
},
passportForFacebook.authenticate("facebook"));

router.get('/oauth2/redirect/facebook', passportForFacebook.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/login'
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