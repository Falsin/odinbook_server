const express = require("express");
const router = express.Router();
const multer  = require('multer');
const upload = multer();

const passport = require("../authentication");
const userController = require("../controllers/userController");

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
    res.json(req.user ? createUserObject(req.user) : null)
  }
)

router.get("/logout", (req, res, next) => {
  console.log(req)
  console.log("hello12345!")
  req.logout(() => {
    res.redirect("/")
  });
})

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