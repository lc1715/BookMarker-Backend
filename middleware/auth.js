"use strict";

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const { UnauthorizedError } = require('../expressError');


/**Middleware to handle authentication cases */

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */
function authenticateJWT(req, res, next) {   //Video info: Video 10 - Authorization Middleware (authenticateJWT function)
    try {
        const authHeader = req.headers && req.headers.authorization;

        if (authHeader) {
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            const payload = jwt.verify(token, SECRET_KEY);
            res.locals.user = payload;
        }
        return next();
    } catch (err) {
        return next();
    }
}

/** Middleware to use when they must be logged in. 
 * 
 * If not, raises Unauthorized Error.
 */

function ensureLoggedIn(req, res, next) {
    try {
        if (!res.locals.user) throw new UnauthorizedError('Please sign up or log in');

        return next();
    } catch (err) {
        return next(err);
    }
}

/** Middleware to use when they must provide a valid token & be the user matching
 * the username provided in the route param.
 *
 *  If not, raises Unauthorized Error.
 */

function ensureCorrectUser(req, res, next) {
    try {
        const user = res.locals.user;

        if (user.username != req.params.username) {
            throw new UnauthorizedError('Please sign up or log in');
        };

        return next();
    } catch (err) {
        return next(err);
    }

}

module.exports = { authenticateJWT, ensureLoggedIn, ensureCorrectUser }
