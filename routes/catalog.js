const express = require("express");
const router = express.Router();
const multer  = require('multer');
const upload = multer();
require('dotenv').config();
const passport = require("../passport/passport");

const userController = require("../controllers/userController");
const createUserObject = require("../public/javascripts/createUserObject");

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

router.post("/logout", userController.logout);

router.get("/login/facebook", passport.authenticate("facebook"));

router.get('/oauth2/redirect/facebook', passport.authenticate('facebook', {
  successRedirect: process.env.CLIENT_URL,
  failureRedirect: process.env.CLIENT_URL + '/error'
}));

router.delete('/account', userController.delete)

router.get("/people", userController.people_get);

router.put("friend", userController.friend_put);

module.exports = router;