"use strict";

const db = require('../db.js');

const {
    NotFoundError,
    BadRequestError,
} = require('../expressError');


class Rating {

    /**Add a book rating given savedBookId, username, data
     * 
     * data: rating, volume_id
     * 
     * Returns: {id, rating, saved_book_id, user_id, volume_id}
     * 
     * id: rating id
     */

    static async addRating(savedBookId, username, data) {
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
              AND volume_id = $2`, [savedBookId, data.volume_id]
        );

        const book = preCheckBook.rows[0]

        if (!book) throw new NotFoundError(`Cannot find Book Id: ${savedBookId} or Volume Id: ${data.volume_id} in saved_books table`)

        try {
            const result = await db.query(
                `INSERT INTO ratings
                        (saved_book_id,
                         user_id,
                         rating,
                         volume_id)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id, rating, saved_book_id, user_id, volume_id`,
                [savedBookId, user.id, data.rating, data.volume_id]
            )

            const rating = result.rows[0];

            return rating;
        } catch (err) {
            throw new BadRequestError(`Could not add rating to db. Db error: ${err}`)
        }
    }

    /** Update a book rating given ratingId, username, and data.
     * 
     * data: { rating }
     * 
     * Returns: {id, comment, saved_book_id, user_id, volume_id}
     * 
     * id: rating id 
     */

    static async updateRating(ratingId, username, data) {
        //check if user exists
        const preCheckUser = await db.query(
            `SELECT id, username
                FROM users
                WHERE username = $1`, [username]
        );

        const user = preCheckUser.rows[0];

        if (!user) throw new NotFoundError(`No User: ${username} Not Found`)

        const result = await db.query(
            `UPDATE ratings
                    SET rating = $1
                    WHERE user_id = $2
                    AND id = $3
                    RETURNING id, rating, saved_book_id, user_id, volume_id`,
            [data.rating, user.id, ratingId])

        const updatedRating = result.rows[0];

        if (!updatedRating) throw new NotFoundError(`No rating found. Rating Id: ${ratingId}`)

        return updatedRating;
    }

    /**Get a book rating given savedBookId and username
     * 
     * Returns: {id, rating, saved_book_id, user_id, volume_id}
    */

    static async getRating(savedBookId, username) {
        //check if user exists
        const preCheckUser = await db.query(
            `SELECT id, username
                FROM users
                WHERE username = $1`, [username]
        );

        const user = preCheckUser.rows[0];

        if (!user) throw new NotFoundError(`User: ${username} Not Found`)

        //check if savedBookId already exists in saved_books table
        const preCheckBook = await db.query(
            `SELECT id
              FROM saved_books
              WHERE id = $1`, [savedBookId]
        );

        const book = preCheckBook.rows[0]

        if (!book) throw new NotFoundError(`BookId: ${savedBookId} Not Found`)

        const result = await db.query(
            `SELECT id, rating, saved_book_id, user_id, volume_id
                FROM ratings
                WHERE user_id = $1
                AND saved_book_id = $2`, [user.id, savedBookId]
        );

        const rating = result.rows[0]

        if (!rating) throw new NotFoundError(`Rating not found. `)

        return rating;
    }
}

module.exports = Rating;