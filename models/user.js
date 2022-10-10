const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: {type: String, required: true, maxLength: 100},
  last_name: {type: String, required: true, maxLength: 100},
  username: {type: String, required: true, maxLength: 100},
  password: {type: Schema.Types.Mixed, required: true},
  photo: {
    bufferObject: Buffer, 
    contentType: String,
  },
  friends: [{type: Schema.Types.ObjectId, ref: 'User'}],
  incoming_friends_requests: [{type: Schema.Types.ObjectId, ref: 'User'}],
  outcoming_friends_requests: [{type: Schema.Types.ObjectId, ref: 'User'}],
  birth_date: {type: Date, required: true},
  facebookId: {type: String}
})

UserSchema.virtual("deleteAndAddUser").set(function (arrayForDelete, arrayForAdd, friendId) {
  arrayForDelete.splice(arrayForDelete.indexOf(friendId), 1);
  arrayForAdd.push(friendId);

  this.save();
})

UserSchema.virtual("addUserToArray").set(function (array, friendId) {
  array.push(friendId);
  this.save();
})

module.exports = mongoose.model('User', UserSchema);