const bcrypt = require('bcryptjs');
const { PostgresModel } = require('../utils/postgresModel');

module.exports = new PostgresModel('User', { role: 'farmer', isActive: true }, {
  comparePassword: async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  },
});
