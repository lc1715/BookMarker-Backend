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
 * POST route: '/ratings/[volumeId]/user/[username]'
 * 
 * Given: volumeId, username and data
 * data: {rating}
 * 
 * Returns: {rating: {id, rating, user_id, volume_id}}
 * 
 * Authorization required: same user as :username
 */

router.post('/:volumeId/user/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        const rating = await Rating.addRating(req.params.volumeId, req.params.username, req.body)
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
 * Returns: {updatedRating: {id, rating, user_id, volume_id}}
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
 * GET route: '/ratings/volumeId/user/[username]'
 * 
 * Given: volumeId, username
 * 
 * Returns: {rating: {id, rating, user_id, volume_id}}
 * 
 * Authorization required: same user as :username
 */
router.get('/:volumeId/user/:username', async function (req, res, next) {
    try {
        const rating = await Rating.getRating(req.params.volumeId, req.params.username)
        return res.json({ rating });
    } catch (err) {
        return next(err);
    }
});

/**Delete a book rating
 * 
 * DELETE route: '/ratings/[id]/user/[username]'
 * 
 * Given: rating's id and username
 * 
 * Returns: {deletedRating: {id}}
 * 
 * Authorization required: same user as :username
 */

router.delete('/:id/user/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        const deletedRating = await Rating.deleteRating(req.params.id, req.params.username);
        return res.json({ deletedRating });
    } catch (err) {
        return next(err);

    }
});

module.exports = router;