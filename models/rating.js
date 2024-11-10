"use strict";

const db = require('../db.js');

const {
    NotFoundError,
    BadRequestError,
} = require('../expressError');


class Rating {

    /**Add a book rating given volumeId, username, data
     * 
     * data: rating
     * 
     * Returns: {id, rating, user_id, volume_id}
     * 
     * id: rating id
     */

    static async addRating(volumeId, username, data) {
        //check if user exists
        const preCheckUser = await db.query(
            `SELECT id, username
              FROM users
              WHERE username = $1`, [username]
        );

        const user = preCheckUser.rows[0];

        if (!user) throw new NotFoundError(`No User: ${username} Not Found`)

        try {
            const result = await db.query(
                `INSERT INTO ratings
                        (user_id,
                         volume_id,
                         rating)
                    VALUES ($1, $2, $3)
                    RETURNING id, rating, user_id, volume_id`,
                [user.id, volumeId, data.rating]
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
                    RETURNING id, rating, user_id, volume_id`,
            [data.rating, user.id, ratingId])

        const updatedRating = result.rows[0];

        if (!updatedRating) throw new NotFoundError(`No rating found. Rating Id: ${ratingId}`)

        return updatedRating;
    }

    /**Get a book rating given volumeId and username
     * 
     * Returns: {id, rating, user_id, volume_id}
    */

    static async getRating(volumeId, username) {
        //check if user exists
        const preCheckUser = await db.query(
            `SELECT id, username
                FROM users
                WHERE username = $1`, [username]
        );

        const user = preCheckUser.rows[0];

        if (!user) throw new NotFoundError(`User: ${username} Not Found`)

        const result = await db.query(
            `SELECT id, rating, user_id, volume_id
                FROM ratings
                WHERE user_id = $1
                AND volume_id = $2`, [user.id, volumeId]
        );

        let rating;

        result.rows[0] ? rating = result.rows[0] : rating = null;

        return rating;
    }

    /**Delete a book rating given ratingId and username
     * 
     * Returns: deleted rating id
    */

    static async deleteRating(ratingId, username) {
        //check if user exists
        const preCheckUser = await db.query(
            `SELECT id, username
                  FROM users
                  WHERE username = $1`, [username]
        );

        const user = preCheckUser.rows[0];

        if (!user) throw new NotFoundError(`No User: ${username} Not Found`)

        let ratingResp = await db.query(
            `DELETE 
                    FROM ratings
                    WHERE user_id = $1
                    AND id = $2
                    RETURNING id`, [user.id, ratingId]
        );

        const deletedRatingId = ratingResp.rows[0];

        if (!deletedRatingId) throw new NotFoundError(`Rating not found. Rating Id: ${ratingId}`)

        return deletedRatingId;
    }
}

module.exports = Rating;