"use strict";

const db = require('../db.js');  //use pg
const bcrypt = require('bcrypt');

const {
    NotFoundError,
    ForbiddenError,
    BadRequestError,
    UnauthorizedError
} = require('./expressError');

const { BCRYPT_WORK_FACTOR } = require('../config.js');

/**users db-schema
 * - username
 * - password
 * - email
 * - created_at (date of sign up)
 */

class User {
    /** Create a new user and add to database. 
     * 
     * Register user with username, password, email.
     *
     * Returns { id, username, email}
     *
     * Throws BadRequestError on duplicates.
     **/

    static async register({ username, password, email }) {
        const duplicateCheckUser = await db.query(
            `SELECT username
                FROM users
                WHERE username = $1`,
            [username],
        );

        if (duplicateCheckUser.rows[0]) {
            throw new BadRequestError(`Duplicate username: ${username}`)
        }

        //If no duplicate user. Get hashed password and add to db.
        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)

        const result = await db.query(
            `INSERT INTO users
                    (username,
                     password,
                     email)
                VALUES ($1, $2, $3)
                RETURNING id, username, email`,
            [
                username,
                hashedPassword,
                email
            ],
        );

        const user = result.rows[0];

        return user;
    }

    /** Authenticate user with username and password when user logs in.
     *
     * Returns { id, username, email}
     *
     * Throws UnauthorizedError if user not found or wrong password.
     **/

    static async authenticate({ username, password }) {
        const result = await db.query(
            `SELECT id,
                    username,
                    email
                FROM users
                WHERE username = $1`,
            [username],
        );

        const user = result.rows[0];

        if (user) {
            const isValid = await bcrypt.compare(password, user.password)

            if (isValid === true) {
                delete user.password;
                return user;
            }
        }

        throw new UnauthorizedError('Invalid username/password');
    }

    /** Get a single user.
     * 
     * Given a username, return data about user.
     * 
     * Returns { id, username, email, saved_books}
     * where saved_books is { id... }
   *
   * Throws NotFoundError if user not found.
   **/
    static async get(username) {
        const userResp = await db.query(
            `SELECT id,
                    username,
                    email
                FROM users
                WHERE username = $1`,
            [username],
        );

        const user = userResp.rows[0]

        if (!user) throw new NotFoundError(`No user: ${username}`)

        const userSaved_BooksResp = await db.query(
            `SELECT id
                FROM saved_books 
                WHERE user_id = $1`, [user.id]
        );

        user.saved_books = userSaved_BooksResp.rows.map(bookObj => bookObj.id)

        return user;
    }

    /** Update a user's data with `data`.
     * 
     * Data can include: { email }
     * 
     * Returns: { id, username, email }
     * 
     * Throws NotFoundError if not found.
     */

    static async update(username, data) {
        const userResp = await db.query(
            `SELECT id,
                FROM users
                WHERE username = $1`,
            [username]
        );

        const user = userResp.rows[0]

        if (!user) throw new NotFoundError(`No user: ${username}`)

        const result = await db.query(`
            UPDATE users
            SET email = $1
            WHERE id = $2
            RETURNING id, username, email`,
            [data.email, user.id]
        );

        const updatedUser = result.rows[0];

        return updatedUser;
    }

    /** Delete a given user from database; returns deleted user's username . */

    static async remove(username) {
        const userResp = await db.query(
            `SELECT id,
                FROM users
                WHERE username = $1`,
            [username]
        );

        const user = userResp.rows[0]

        if (!user) throw new NotFoundError(`No user: ${username}`)

        let result = await db.query(
            `DELETE 
                FROM users
                WHERE id = $1
                RETURNING username`,
            [username],
        );

        const deletedUserUsername = result.rows[0];

        if (!deletedUserUsername) throw new NotFoundError(`No user: ${username}`);

        return deletedUserUsername;
    }


    // ****Reviews Functions****//

    /** Add a review given username, savedBookId, and data 
    * 
    * data: {comment, volume_id } 
    * 
    * id: book review's id
    *
    * Returns: {id, comment, saved_book_id, user_id, volume_id, created_at}
    **/

    static async addReview(username, savedBookId, data) {
        const preCheckUser = await db.query(
            `SELECT id, username
              FROM users
              WHERE id = $1`, [username]
        );

        const user = preCheckUser.rows[0];

        if (!user) throw new NotFoundError(`User: ${username} Not Found`)

        //check book
        const preCheckBook = await db.query(
            `SELECT id
              FROM saved_books
              WHERE id = $1
              AND volume_id = $2 `, [savedBookId, data.volume_id]
        );

        const book = preCheckBook.rows[0]

        if (!book) throw new NotFoundError(`BookId: ${savedBookId} Not Found`)

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

        if (!review) throw new NotFoundError(`Review not found. ReviewId: ${reviewId}`)

        const result = db.query(
            `UPDATE reviews
                SET comment = $1
                WHERE id = $2
                RETURNING id, comment, created_at, user_id, saved_book_id, volume_id`,
            [data.comment, reviewId])

        const updatedReview = result.rows[0];

        return updatedReview;
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

    /**Get all reviews for a book given volumeId 
     * 
     * Returns: [{id, comment, created_at, volume_id, saved_book_id, user_id}, ...]
     */

    static async getAllBookReviews(volumeId) {
        const result = db.query(
            `SELECT id, comment, created_at, volume_id, saved_book_id, user_id
                FROM reviews
                WHERE volume_id = $1
                ORDER BY id desc`, [volumeId]);

        const reviews = result.rows;

        if (!reviews) throw new NotFoundError(`All reviews not found`)

        return reviews;
    }
}

module.exports = User;