"use strict";

const express = require('express');
const router = new express.Router();

//model to communciate with db
const User = require('../models/user');
//error
const { BadRequestError } = require('../expressError');
//middleware 
const { ensureCorrectUser } = require('../middleware/auth');
//helper function to get JWT
const { createToken } = require('../helpers/tokens');
//jsonschema
const jsonschema = require('jsonschema');
const userRegisterSchema = require('../jsonSchemas/userRegister.json');
const userLoginSchema = require('../jsonSchemas/userLogin.json');
const userUpdateSchema = require('../jsonSchemas/userUpdate.json')


/** Sign up as a user and get a JWT token 
 * 
 * POST route: '/users/register'
 * 
 * To get token, need to create a user
 * 
 * user must include {username, password, email}
 * 
 * {user} => {token}
 * 
 * Returns: JWT token which can be used to authenticate further requests to protected routes. 
 */

router.post('/register', async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userRegisterSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const newUser = await User.register(req.body);
        //token only has username in payload
        const token = createToken(newUser);
        return res.status(201).json({ token })
    } catch (err) {
        return next(err);
    }
})

/** User logs in and gets a JWT token 
 * 
 * POST route: '/users/login'
 * 
 * To get token, user needs to be authenticated
 * 
 * user must include {username, password}
 * 
 * {user} => {token}
 * 
 * Returns: JWT token which can be used to authenticate further requests to protected routes. 
 */

router.post('/login', async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userLoginSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const user = await User.authenticate(req.body);
        const token = createToken(user);
        return res.json({ token })
    } catch (err) {
        return next(err);
    }
})

/**Gets a single user
 * 
 * GET route: '/users/:username'
 * 
 * Returns: {user: { id, username, email, saved_booksId}}
 * where saved_booksId is [id, ...] 
 *
 */
router.get('/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        const user = await User.getUser(req.params.username);
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

/**Updates a user's profile
 * 
 * Given: username and data. data: {email}
 * 
 * PATCH route: '/users/:username'
 * 
 * Returns: {updatedUser: { id, username, email }}
 */

router.patch('/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userUpdateSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const updatedUser = await User.update(req.params.username, req.body);
        return res.json({ updatedUser });
    } catch (err) {
        return next(err);
    }
});

/**Delete a user given a username 
 * 
 * DELETE route: '/users/:username'
 * 
 * Returns: { deleted: username }
 */

router.delete('/:username', ensureCorrectUser, async function (req, res, next) {
    const deletedUser = await User.delete(req.params.username);

    return res.json({ deleted: deletedUser.username });
})

module.exports = router;
