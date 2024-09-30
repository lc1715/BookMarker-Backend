const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

/** Returns a signed JWT from the user's data. */

function createToken(user) {
    const payload = { username: user.username };

    return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };