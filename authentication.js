const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require('bcrypt');
//const FacebookStrategy = require('passport-facebook');

const User = require("./models/user");

passport.use(new LocalStrategy((username, password, cb) => {
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

/* passport.use(new FacebookStrategy({
  clientID: process.env['FACEBOOK_CLIENT_ID'],
  clientSecret: process.env['FACEBOOK_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/facebook',
  state: true
}, function verify(accessToken, refreshToken, profile, cb) {
  db.get('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', [
    'https://www.facebook.com',
    profile.id
  ], function(err, row) {
    if (err) { return cb(err); }
    if (!row) {
      db.run('INSERT INTO users (name) VALUES (?)', [
        profile.displayName
      ], function(err) {
        if (err) { return cb(err); }

        var id = this.lastID;
        db.run('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
          id,
          'https://www.facebook.com',
          profile.id
        ], function(err) {
          if (err) { return cb(err); }
          var user = {
            id: id,
            name: profile.displayName
          };
          return cb(null, user);
        });
      });
    } else {
      db.get('SELECT * FROM users WHERE id = ?', [ row.user_id ], function(err, row) {
        if (err) { return cb(err); }
        if (!row) { return cb(null, false); }
        return cb(null, row);
      });
    }
  });
})); */

/* passport.use(new FacebookStrategy({
  clientID: "1160268331570022",
  clientSecret: "a21d3fa5e350fc81afd2742bcd71622e",
  callbackURL: "https://localhost:3000/login/facebook/callback"
},
function(accessToken, refreshToken, profile, cb) {
  console.log('hello')
  User.findOrCreate({ facebookId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
)); */

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  })
})

module.exports = passport;