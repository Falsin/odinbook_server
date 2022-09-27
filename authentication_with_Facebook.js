require('dotenv').config();

const passport = require("passport");
const FacebookStrategy = require('passport-facebook');
const User = require("./models/user");

const bcrypt = require('bcrypt');
/* passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: 'https://mighty-reef-21129.herokuapp.com/oauth2/redirect/facebook',
  //callbackURL: '/oauth2/redirect/facebook',
  state: true
}, function verify(accessToken, refreshToken, profile, cb) {
  return cb(null, profile); 
})); */

/* passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: 'https://mighty-reef-21129.herokuapp.com/oauth2/redirect/facebook',
  //callbackURL: '/oauth2/redirect/facebook',
  state: true
}, function verify(accessToken, refreshToken, profile, cb) {
  User.findById('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', [
    'https://www.facebook.com',
    profile.id
  ], function(err, row) {
    if (err) { return cb(err); }
    if (!row) {
      User.run('INSERT INTO users (name) VALUES (?)', [
        profile.displayName
      ], function(err) {
        if (err) { return cb(err); }

        var id = this.lastID;
        User.run('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
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
      User.findById('SELECT * FROM users WHERE id = ?', [ row.user_id ], function(err, row) {
        if (err) { return cb(err); }
        if (!row) { return cb(null, false); }
        return cb(null, row);
      });
    }
  });
}));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
}); */

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: 'https://mighty-reef-21129.herokuapp.com/oauth2/redirect/facebook',
  }, async function verify(accessToken, refreshToken, profile, cb) {
/*     console.log('this is facebook')
    console.log(profile) */
    const currentUser = await User.findOne({facebookId: profile.id})
    
    if(!currentUser) {
      
      bcrypt.hash('123', 10, (err, salt) => {
        if (err) {
          return cb(err)
        } else {
          const user = new User({
            first_name: profile.displayName.split(" ")[0],
            last_name: profile.displayName.split(" ")[1],
            username: profile.displayName,
            facebookId: profile.id,
            password: salt,
            birth_date: new Date().toLocaleString()
          }).save((err, user) => {
            console.log('check this point')
            console.log(user)
            return cb(null, user);
          })
        } 
      })
    }
    return cb(null, currentUser)
  }
))

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(e => {
      done(new Error("Failed to deserialize an user"));
    });
});

module.exports = passport;