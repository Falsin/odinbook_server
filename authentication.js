const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require('bcrypt');

const User = require("./models/user");

passport.use(new LocalStrategy((username, password, cb) => {
  console.log('use passport!!!!!!!!!!!!!!!!!!!!!!!!!!')
  User.findOne({username: username}, (err, user) => {
    if (err) {
      return cb(err)
    }

    if (!user) {
      return cb(null, false, {message: 'Incorrect username'})
    } 
    
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        return cb(null, user);
      } else {
        return cb(null, false, {message: 'Incorrect password.'})
      }
    })
  })
}))

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  })
})

module.exports = passport;