require('dotenv').config();
const fs = require('fs');
const path = require('path');

const FacebookStrategy = require('passport-facebook');
const User = require("../models/user");

const filePath = path.resolve(__dirname, "../public/images/user.jpeg");
const fileContent = fs.readFileSync(filePath);
const contentType = path.extname(filePath);

const facebook = new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.SERVER_URL + 'oauth2/redirect/facebook',
  }, async function verify(accessToken, refreshToken, profile, cb) {
    const currentUser = await User.findOne({facebookId: profile.id})


    if(!currentUser) {
      return new User({
        first_name: profile.displayName.split(" ")[0],
        last_name: profile.displayName.split(" ")[1],
        username: profile.displayName,
        facebookId: profile.id,
        password: "null",
        birth_date: new Date().toLocaleString(),
        photo: {
          data: fileContent,
          contentType: "image/" + contentType.slice(1)
        }
      }).save((err, user) => {
        console.log("stupid")
        console.log(err)
        return cb(null, user);
      })
    }
    console.log("duble")
    return cb(null, currentUser)
  }
)

module.exports = facebook;