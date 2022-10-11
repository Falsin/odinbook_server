const express = require("express");
const router = express.Router();
const multer  = require('multer');
const upload = multer();
require('dotenv').config();
const passport = require("../passport/passport");

const userController = require("../controllers/userController");
const createUserObject = require("../public/javascripts/createUserObject");

//users
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

router.get("/outcoming_friends_requests", userController.outcoming_friends_requests_get);

router.get("/incoming_friends_requests", userController.incoming_friends_requests_get);

router.get("/friends", userController.friend_list_get)

router.put("/incoming_friends_requests", userController.incoming_friends_requests_put);

router.put("/friend", userController.friend_put);

router.delete("/friend", userController.friend_delete);

router.delete("/outcoming_friends_requests", userController.outcoming_friends_requests_delete);

//posts
router.post("/post", 
  upload.single("photo"),
)


module.exports = router;