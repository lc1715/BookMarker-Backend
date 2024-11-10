"use strict";

const express = require('express');
const router = new express.Router();

//model to communicate with db
const Review = require('../models/review');
//error
const { BadRequestError } = require('../expressError');
//middleware 
const { ensureCorrectUser } = require('../middleware/auth');
//jsonschema
const jsonschema = require('jsonschema');
const reviewSchema = require('../jsonSchemas/review.json')


/**Add a book review
 * 
 * POST route: '/reviews/[volumeId]/user/[username]'
 * 
 * Given: volumeId, username and data
 * data: {comment}
 * 
 * Returns: {review: {id, comment, user_id, volume_id, created_at}}
 * 
 * Authorization required: same user as :username
 */

router.post('/:volumeId/user/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, reviewSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const review = await Review.addReview(req.params.volumeId, req.params.username, req.body);
        return res.status(201).json({ review });
    } catch (err) {
        return next(err);
    }
});

/**Update a book review 
 * 
 * PATCH route: '/reviews/[reviewId]/user/[username]'
 * 
 * Given: reviewId, username and data
 * data: {comment}
 * 
 * Returns: {updatedReview: {id, comment, saved_book_id, user_id, volume_id, created_at}}
 * 
 * Authorization required: same user as :username
 */

router.patch('/:reviewId/user/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        const updatedReview = await Review.updateReview(req.params.reviewId, req.params.username, req.body);
        return res.json({ updatedReview });
    } catch (err) {
        return next(err);
    }
});

/**Get all book reviews on a book
 * 
 * GET route: '/reviews/[volumeId]'
 * 
 * Given: volumeId
 * 
 * Returns: {allReviews:[{id, comment, created_at, volume_id, saved_book_id, user_id, username}, ...]}
 * 
 */

router.get('/:volumeId', async function (req, res, next) {
    try {
        const allReviews = await Review.getAllBookReviews(req.params.volumeId);
        return res.json({ allReviews });
    } catch (err) {
        return next(err);
    }
});

/**Delete a book review
 * 
 * DELETE route: '/reviews/[id]/user/[username]'
 * 
 * Given: review's id and username
 * 
 * Returns: {deletedReview: {id}}
 * 
 * Authorization required: same user as :username
 */

router.delete('/:id/user/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        const deletedReview = await Review.deleteReview(req.params.id, req.params.username);
        return res.json({ deletedReview });
    } catch (err) {
        return next(err);

    }
});

module.exports = router;