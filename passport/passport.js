const passport = require("passport");

const local = require("./authLocal");
const facebook = require("./authWithFacebook")

passport.use(local);
passport.use(facebook);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  })
})

module.exports = passport;