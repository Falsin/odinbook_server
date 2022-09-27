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
/*   console.log(req)
  console.log('hello')
  console.log(req.user) */
  console.log('hello')
  console.log(req.user)
  res.json(req.user ? createUserObject(req.user) : null)
});

router.post("/login", 
  userController.login,
  passport.authenticate('local', {failureRedirect: '/'}),
  (req, res, next) => res.json(createUserObject(req.user))
)

router.post("/error", 
  (req, res, next) => res.json('something wrong')
)

router.get("/logout", userController.logout);

router.get("/login/facebook", passportForFacebook.authenticate("facebook"));

/* router.get("https://falsin.github.io/odinbook_client", 
  (req, res, next) => {
    res.json(req.user)
  }
) */

/* router.get('/oauth2/redirect/facebook', passportForFacebook.authenticate('facebook', {
  successRedirect: 'https://falsin.github.io/odinbook_client',
  failureRedirect: '/error'
})); */

/* router.get('/success/#_=_', (req, res, next) => {
  res.redirect("https://localhost:8080")
}); */

/* router.get('/oauth2/redirect/facebook', passportForFacebook.authenticate('facebook', {
  successRedirect: 'https://localhost:8080',
  failureRedirect: '/error'
})
); */

router.get('/oauth2/redirect/facebook', 
  passportForFacebook.authenticate('facebook'),
  (req, res, next) => {
    req.session.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("https://localhost:8080");
       }
    })
  }
);

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