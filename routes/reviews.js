"use strict";

const express = require('express');
const router = new express.Router();

//model to communicate with db
const Review = require('../models/review');
//Errors
const { BadRequestError } = require('../expressError');
//middleware 
const { ensureCorrectUser } = require('../middleware/auth');
//json schema
const jsonschema = require('jsonschema');
const reviewSchema = require('../jsonSchemas/review.json')


/**Add a book review
 * 
 * POST route: '/reviews/savedbook/[savedBookId]/user/[username]'
 * 
 * Given: savedBookId, username and data
 * data: {comment, volume_id}
 * 
 * Returns: {id, comment, saved_book_id, user_id, volume_id, created_at}
 * 
 * Authorization required: same user as :username
 */

router.post('/savedbook/:savedBookId/user/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        //use schema to validate req.body
        const validator = jsonschema.validate(req.body, reviewSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const review = await Review.addReview(req.params.savedBookId, req.params.username, req.body);
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
 * Returns: {id, comment, saved_book_id, user_id, volume_id, created_at}
 * 
 * Authorization required: same user as :username
 */

router.post('/:reviewId/user/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        const updatedReview = await Review.updateReview(req.params.reviewId, req.params.username, req.body);
        return res.json({ updatedReview });
    } catch (err) {
        return next(err);
    }
});

/**Get all book reviews
 * 
 * GET route: '/reviews/[volumeId]'
 * 
 * Given: volumeId
 * 
 * Returns: {id, comment, saved_book_id, user_id, volume_id, created_at}
 * 
 * Authorization required: same user as :username
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
 * Returns: {id}
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