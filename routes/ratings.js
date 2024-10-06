
"use strict";

const express = require('express');
const router = new express.Router();

//model to communicate with db
const Rating = require('../models/rating');
//error
const { BadRequestError } = require('../expressError');
//middleware 
const { ensureCorrectUser } = require('../middleware/auth');


/**Add a book rating
 * 
 * POST route: '/ratings/savedbook/[savedBookId]/user/[username]'
 * 
 * Given: savedBookId, username and data
 * data: {rating, volume_id}
 * 
 * Returns: {rating: {id, rating, saved_book_id, user_id, volume_id}}
 * 
 * Authorization required: same user as :username
 */

router.post('/savedbook/:savedBookId/user/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        const rating = await Rating.addRating(req.params.savedBookId, req.params.username, req.body)
        return res.status(201).json({ rating });
    } catch (err) {
        return next(err);
    }
})

/**Update a book rating
 * 
 * PATCH route: '/ratings/[id]/user/[username]'
 * 
 * Given: rating id, username and data
 * data: {rating}
 * 
 * Returns: {updatedRating: {id, rating, saved_book_id, user_id, volume_id}}
 * 
 * Authorization required: same user as :username
 */

router.patch('/:id/user/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        const updatedRating = await Rating.updateRating(req.params.id, req.params.username, req.body)
        return res.json({ updatedRating });
    } catch (err) {
        return next(err);
    }
})

/**Get a book rating
 * 
 * GET route: '/ratings/[savedBookId]/user/[username]'
 * 
 * Given: saved book id, username
 * 
 * Returns: {rating: {id, rating, saved_book_id, user_id, volume_id}}
 * 
 * Authorization required: same user as :username
 */
router.get('/:savedBookId/user/:username', async function (req, res, next) {
    try {
        const rating = await Rating.getRating(req.params.savedBookId, req.params.username)
        return res.json({ rating });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;