"use strict";

const db = require(`./db.js`)

const {
    NotFoundError,
    ForbiddenError,
    BadRequestError,
} = require('./expressError');


class Review {

    /** Add a review given username, savedBookId, and data 
    * 
    * data: {comment, volume_id } 
    *
    * Returns: {id, comment, saved_book_id, user_id, volume_id, created_at}
    * 
    * id: book review's id
    **/

    static async addReview(username, savedBookId, data) {
        const preCheckUser = await db.query(
            `SELECT id, username
              FROM users
              WHERE id = $1`, [username]
        );

        const user = preCheckUser.rows[0];

        if (!user) throw new NotFoundError(`No User: ${username} Not Found`)

        //check book
        const preCheckBook = await db.query(
            `SELECT id
              FROM saved_books
              WHERE id = $1
              AND volume_id = $2 `, [savedBookId, data.volume_id]
        );

        const book = preCheckBook.rows[0]

        if (!book) throw new NotFoundError(`No BookId: ${savedBookId} Not Found`)

        //Check if review already written
        const preCheckReviewInDB = db.query(
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

        const result = db.query(
            `INSERT INTO reviews
                    (comment,
                     volume_id)
                VALUES ($1, $2)
                RETURNING id, comment, saved_book_id, user_id, volume_id, created_at`,
            [data.comment, volumeId])

        const review = result.rows[0];

        return review;
    }

    /** Update a review given reviewId and data.
     * 
     * data: { comment }
     *
     * id: book review's id
     * 
     * Returns: {id, comment, saved_book_id, user_id, volume_id, created_at}
     * 
     */

    static async updateReview(reviewId, data) {
        const preCheckReview = db.query(
            `SELECT id
                FROM reviews
                WHERE id = $1`, [reviewId]
        );

        const review = preCheckReview.rows[0];

        if (!review) throw new NotFoundError(`No Review Id. ReviewId: ${reviewId} not found`)

        const result = db.query(
            `UPDATE reviews
                SET comment = $1
                WHERE id = $2
                RETURNING id, comment, created_at, user_id, saved_book_id, volume_id`,
            [data.comment, reviewId])

        const updatedReview = result.rows[0];

        return updatedReview;
    }

    /**Get all reviews for a book given volumeId 
     * 
     * Returns: [{id, comment, created_at, volume_id, saved_book_id, user_id}, ...]
     */

    static async getAllBookReviews(volumeId) {
        const result = db.query(
            `SELECT r.id, r.comment, r.created_at, r.volume_id, r.saved_book_id, r.user_id, u.username,
                FROM reviews AS r
                JOIN users AS u
                ON r.user_id = u.id
            WHERE r.volume_id = $1
                ORDER BY r.created_at`,
            [volumeId]
        );

        const reviews = result.rows;

        if (!reviews) throw new NotFoundError(`No Volume Id: ${volumeId}. All reviews not found`)

        return reviews;
    }

    /**Delete a review given reviewId
     * 
     * Returns: deleted review id
    */

    static async deleteReview(reviewId) {
        let reviewResp = db.query(
            `DELETE 
                    FROM reviews
                    WHERE review_id = $1
                    RETURNING review_id`, [reviewId]
        );

        const deletedReviewId = reviewResp.rows[0];

        if (!deletedReviewId) throw new NotFoundError(`Review not found. Review Id: ${reviewId}`)

        return deletedReviewId;
    }
}

module.exports = Review;