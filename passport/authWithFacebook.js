require('dotenv').config();
const FacebookStrategy = require('passport-facebook');
const User = require("./models/user");

const facebook = new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.SERVER_URL + 'oauth2/redirect/facebook',
  }, async function verify(accessToken, refreshToken, profile, cb) {
    const currentUser = await User.findOne({facebookId: profile.id})
    
    if(!currentUser) {
      new User({
        first_name: profile.displayName.split(" ")[0],
        last_name: profile.displayName.split(" ")[1],
        username: profile.displayName,
        facebookId: profile.id,
        password: "",
        birth_date: new Date().toLocaleString()
      }).save((err, user) => {
        return cb(null, user);
      })
    }
    return cb(null, currentUser)
  }
)

module.exports = facebook;