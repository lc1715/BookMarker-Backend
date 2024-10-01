"use strict";

const db = require('../db.js');

const {
    NotFoundError,
    ForbiddenError,
    BadRequestError,
} = require('../expressError');


class Review {

    /** Add a book review given username, savedBookId, and data 
    * 
    * data: {comment, volume_id } 
    *
    * Returns: {id, comment, saved_book_id, user_id, volume_id, created_at}
    * 
    * id: book review's id
    **/

    static async addReview(savedBookId, username, data) {
        //check if user exists
        const preCheckUser = await db.query(
            `SELECT id, username
              FROM users
              WHERE username = $1`, [username]
        );

        const user = preCheckUser.rows[0];

        if (!user) throw new NotFoundError(`No User: ${username} Not Found`)

        //check if saved book id and volume id are both in saved_books table
        const preCheckBook = await db.query(
            `SELECT id, volume_id
              FROM saved_books
              WHERE id = $1
              AND volume_id = $2 `, [savedBookId, data.volume_id]
        );

        const book = preCheckBook.rows[0]

        if (!book) throw new NotFoundError(`Cannot find Book Id: ${savedBookId} or Volume Id: ${data.volume_id} in saved_books table`)

        //check if review already written
        const preCheckReviewInDB = await db.query(
            `SELECT id
              FROM reviews
              WHERE user_id = $1
              AND saved_book_id = $2`,
            [user.id, savedBookId]
        )

        const reviewInDb = preCheckReviewInDB.rows[0]

        if (reviewInDb) throw new ForbiddenError(`Only one review per book is allowed`)

        //Check if review is empty
        if (data.comment === '') throw new BadRequestError(`Empty review. Please write a review`);

        const result = await db.query(
            `INSERT INTO reviews
                    (saved_book_id,
                     user_id,
                     comment,
                     volume_id)
                VALUES ($1, $2, $3, $4)
                RETURNING id, comment, saved_book_id, user_id, volume_id, created_at`,
            [savedBookId, user.id, data.comment, data.volume_id])

        const review = result.rows[0];

        if (!review) throw new NotFoundError(`Review not added. Username: ${username}; Saved Book Id: ${savedBookId}; data: ${data}`)

        return review;
    }

    /** Update a book review given reviewId, username, and data.
     * 
     * data: { comment }
     * 
     * Returns: {id, comment, saved_book_id, user_id, volume_id, created_at}
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
        if (data.comment === '') throw new BadRequestError(`Empty review. Please write a review`);

        //update review
        const result = await db.query(
            `UPDATE reviews
                SET comment = $1
                WHERE user_id = $2
                AND id = $3
                RETURNING id, comment, created_at, user_id, saved_book_id, volume_id`,
            [data.comment, user.id, reviewId])

        const updatedReview = result.rows[0];

        if (!updatedReview) throw new NotFoundError(`No Review Found. ReviewId ${reviewId}`)

        return updatedReview;
    }

    /**Get all reviews for a book given volumeId 
     * 
     * Returns: [{id, comment, created_at, volume_id, saved_book_id, user_id}, ...]
     */

    static async getAllBookReviews(volumeId) {
        const result = await db.query(
            `SELECT r.id, r.comment, r.created_at, r.volume_id, r.saved_book_id, r.user_id, u.username
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