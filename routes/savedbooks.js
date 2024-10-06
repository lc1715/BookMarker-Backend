"use strict";

const express = require('express');
const router = new express.Router();

//model to communicate with db
const SavedBook = require('../models/savedbook');
//error
const { BadRequestError } = require('../expressError');
//middleware 
const { ensureCorrectUser } = require('../middleware/auth');


/**Add a book to saved books
 * 
 * POST route: '/savedbooks/[volumeId]/user/[username]'
 * 
 * Given: username and data
 * data: {volume_id, title, author, publisher, category, description, image, has_read}
 * 
 * Returns: {savedBook: {id, user_id, volume_id, title, author, publisher, category, description, image, has_read}}
 * 
 * Authorization required: same user as :username
 */

router.post('/:volumeId/user/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        //Check that volumId in params is equal to volumeId in req.body
        const volumeIdInParams = +req.params.volumeId;

        if (volumeIdInParams != req.body.volume_id) {
            throw new BadRequestError(`Volume Id in params: ${volumeIdInParams}, does not equal to Volume Id in req.body: ${req.body.volume_id} `);
        }

        const savedBook = await SavedBook.addSavedBook(req.params.username, req.body);
        return res.status(201).json({ savedBook });
    } catch (err) {
        return next(err);
    }
});

/**Update a saved book to Read or Wish To Read 
 * 
 * PATCH route: '/savedbooks/[id]/user/[username]'
 * 
 * Given: id, username, and data
 * id: saved book id; data: {has_read} 
 * 
 * Returns: {updatedBook: {id, user_id, volume_id, title, author, publisher, category, description, image, has_read}}
 * 
 * Authorization required: same user as :username
 */

router.patch('/:id/user/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        const updatedBook = await SavedBook.updateReadOrWishStatus(req.params.id, req.params.username, req.body);
        return res.json({ updatedBook });
    } catch (err) {
        return next(err);
    }
});

/**Gets all books in Read status
 * 
 * GET route: '/savedbooks/read/user/[username]'
 * 
 * Given: username and data
 * data: {has_read = true} 
 * 
 * Returns: {readBooks: {id, user_id, volume_id, title, author, publisher, category, description, image, has_read}}
 * 
 * Authorization required: same user as :username
 */
router.get('/read/user/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        const readBooks = await SavedBook.getAllReadBooks(req.params.username, req.body);
        return res.json({ readBooks });
    } catch (err) {
        return next(err);
    }
});

/**Gets all books in Wish To Read status
 * 
 * GET route: '/savedbooks/wish/user/[username]'
 * 
 * Given: username and data
 * data: {has_read = false} 
 * 
 * Returns: {wishBooks: {id, user_id, volume_id, title, author, publisher, category, description, image, has_read}}
 * 
 * Authorization required: same user as :username
 */
router.get('/wish/user/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        const wishBooks = await SavedBook.getAllWishBooks(req.params.username, req.body);
        return res.json({ wishBooks });
    } catch (err) {
        return next(err);
    }
});

/**Get a saved book with review and rating.
 * 
 * GET route: '/savedbooks/[id]/user/[username]'
 * 
 * Given: id, username
 * id: saved book id
 * 
 * Returns: {savedBook: {id, user_id, volume_id, title, author, publisher, category, description image, has_read, 
 *           review: {id, saved_book_id, user_id, comment, created_at, volume_id} or 'None',
 *           rating: {id, saved_book_id, user_id, rating, volume_id} or 'None'} }
 * 
 * Authorization required: same user as :username
 */

router.get('/:id/user/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        const savedBook = await SavedBook.getSavedBook(req.params.id, req.params.username);
        return res.json({ savedBook });
    } catch (err) {
        return next(err);
    }
});

/**Delete saved book 
 * 
 * DELETE route: '/savedbooks/[id]/user/[username]'
 * 
 * Given: id, username
 * id: saved book id
 * 
 * Returns: {deletedBook: {id}}
 * 
 * Authorization required: same user as :username
 */

router.delete('/:id/user/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        const deletedBook = await SavedBook.deleteSavedBook(req.params.id, req.params.username);
        return res.json({ deletedBook });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;

