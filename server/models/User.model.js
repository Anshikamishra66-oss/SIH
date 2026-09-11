const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { PostgresModel } = require('../utils/postgresModel');

const userSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
}, { timestamps: true });

module.exports = new PostgresModel('User', { role: 'farmer', isActive: true }, {
  comparePassword: async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  },
}, userSchema);
