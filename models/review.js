"use strict";

const db = require('../db.js');

const {
    NotFoundError,
    ForbiddenError,
    BadRequestError,
} = require('../expressError');


class Review {

    /** Add a book review given volumeId, username, and data 
    * 
    * data: {comment} 
    *
    * Returns: {id, comment, user_id, volume_id, created_at}
    * 
    * id: book review's id
    **/

    static async addReview(volumeId, username, data) {
        //check if user exists
        const preCheckUser = await db.query(
            `SELECT id, username
              FROM users
              WHERE username = $1`, [username]
        );

        const user = preCheckUser.rows[0];

        if (!user) throw new NotFoundError(`No User: ${username} Not Found`)

        //check if review already written
        const preCheckReviewInDB = await db.query(
            `SELECT id, comment
                FROM reviews
                WHERE user_id = $1
                AND volume_id = $2`,
            [user.id, volumeId]
        )

        const reviewInDb = preCheckReviewInDB.rows

        if (reviewInDb.length > 0) throw new ForbiddenError(`Only one review per book is allowed`)

        //Check if review is empty
        if (data.comment === '') throw new BadRequestError(`Review needs to be a minimum of 1 character`);

        try {
            const result = await db.query(
                `INSERT INTO reviews
                    (user_id,
                     comment,
                     volume_id)
                VALUES ($1, $2, $3)
                RETURNING id, comment, user_id, volume_id, created_at`,
                [user.id, data.comment, volumeId])

            const review = result.rows[0];

            return review;
        } catch (err) {
            throw new BadRequestError(`Review not saved to db. Db error: ${err}`)
        }
    }

    /** Update a book review given reviewId, username, and data.
     * 
     * data: { comment }
     * 
     * Returns: {id, comment, user_id, volume_id, created_at}
     * 
     * id: book review's id
     */

    static async updateReview(reviewId, username, data) {
        //check if user exists
        const preCheckUser = await db.query(
            `SELECT id, username
              FROM users
              WHERE username = $1`, [username]
        );

        const user = preCheckUser.rows[0];

        if (!user) throw new NotFoundError(`No User: ${username} Not Found`)

        //Check if review is empty
        if (data.comment === '') throw new BadRequestError(`Review needs to be a minimum of 1 character`);

        //update review
        const result = await db.query(
            `UPDATE reviews
                SET comment = $1
                WHERE user_id = $2
                AND id = $3
                RETURNING id, comment, created_at, user_id, volume_id`,
            [data.comment, user.id, reviewId])

        const updatedReview = result.rows[0];

        if (!updatedReview) throw new NotFoundError(`No Review Found. ReviewId ${reviewId}`)

        return updatedReview;
    }

    /**Get all reviews for a book given volumeId 
     * 
     * Returns: [{id, comment, created_at, volume_id, user_id, username}, ...]
     * 
     * id: review id
     */

    static async getAllBookReviews(volumeId) {
        const result = await db.query(
            `SELECT r.id, r.comment, r.created_at, r.volume_id, r.user_id, u.username
                FROM reviews AS r
                JOIN users AS u
                ON r.user_id = u.id
            WHERE r.volume_id = $1
                ORDER BY r.created_at`,
            [volumeId]
        );

        const reviews = result.rows;

        return reviews;
    }

    /**Delete a book review given reviewId and username
     * 
     * Returns: deleted review id
    */

    static async deleteReview(reviewId, username) {
        //check if user exists
        const preCheckUser = await db.query(
            `SELECT id, username
              FROM users
              WHERE username = $1`, [username]
        );

        const user = preCheckUser.rows[0];

        if (!user) throw new NotFoundError(`No User: ${username} Not Found`)

        let reviewResp = await db.query(
            `DELETE 
                FROM reviews
                WHERE user_id = $1
                AND id = $2
                RETURNING id`, [user.id, reviewId]
        );

        const deletedReviewId = reviewResp.rows[0];

        if (!deletedReviewId) throw new NotFoundError(`Review not found. Review Id: ${reviewId}`)

        return deletedReviewId;
    }
}

module.exports = Review;