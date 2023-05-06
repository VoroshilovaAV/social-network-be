const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  age: { type: Number },
  city: { type: String },
  university: { type: String }
});

module.exports = mongoose.model('User', UserSchema);