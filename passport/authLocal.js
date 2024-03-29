const LocalStrategy = require("passport-local");
const bcrypt = require('bcrypt');

const User = require("../models/user");

const local = new LocalStrategy((username, password, cb) => {
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
});

module.exports = local;