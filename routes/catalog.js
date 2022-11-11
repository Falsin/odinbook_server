const express = require("express");
const router = express.Router();
const multer  = require('multer');
const upload = multer();
require('dotenv').config();
const passport = require("../passport/passport");

const userController = require("../controllers/userController");
const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController");

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
  postController.post_post,
  postController.posts_get
);

router.get("/posts", 
  postController.posts_get
);

router.delete("/post", 
  postController.post_delete,
  postController.posts_get
);

router.put("/post",
  upload.single("photo"), 
  postController.post_put,
  postController.posts_get
);

//comments

//router.get("/comments/:postId", commentController.comments_get);
router.get("/post/:postId/comments", commentController.comments_get);

router.post("/comment", 
  upload.single("photo"),
  commentController.comment_post,
  commentController.comments_get
);

router.put("/comment", 
  upload.single("photo"),
  commentController.comment_put,
  commentController.comments_get
)

router.delete("/comment", commentController.comment_delete)

module.exports = router;