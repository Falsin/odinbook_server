const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: {type: String, required: true, maxLength: 100},
  last_name: {type: String, required: true, maxLength: 100},
  login: {type: String, required: true, maxLength: 100},
  password: {type: String, required: true},
  photo: {data: Buffer, contentType: String},
  friends: {type: Array},
  incoming_friends_requests: {type: Array},
  outcoming_friends_requests: {type: Array},
  birth_date: {type: Date, required: true}
})

module.exports = mongoose.model('User', UserSchema);