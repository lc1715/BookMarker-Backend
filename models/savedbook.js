"use strict";

const db = require('../db.js');

const {
    NotFoundError,
    BadRequestError,
} = require('../expressError.js');


class SavedBook {
    /**Add a book into the database given username and data
     * 
     * data: volume_id, title, author, publisher, category, description, image, has_read
     * 
     * Returns: {id, user_id, volume_id, title, author, publisher, category, description, image, has_read}
     * 
     * id: saved book id
     */

    static async addSavedBook(username, data) {
        //Check if user exists
        const userResp = await db.query(
            `SELECT id, username
                FROM users
                WHERE username = $1`, [username]
        );

        const user = userResp.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username} not found`)

        //Check if book already saved
        const duplicateCheckBook = await db.query(
            `SELECT id, volume_id
                FROM saved_books
                WHERE volume_id = $1
                AND user_id = $2`, [data.volume_id, user.id]
        );

        if (duplicateCheckBook.rows[0]) throw new BadRequestError(`Book already saved. Volume Id: ${data.volume_id} `)

        try {
            const result = await db.query(
                `INSERT INTO saved_books
                    (user_id,
                     volume_id,
                     title,
                     author,
                     publisher,
                     category,
                     description,
                     image,
                     has_read)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING id, user_id, volume_id, title, author, publisher, category, description, image, has_read`,
                [
                    user.id,
                    data.volume_id,
                    data.title,
                    data.author,
                    data.publisher,
                    data.category,
                    data.description,
                    data.image,
                    data.has_read
                ],
            );

            const savedBook = result.rows[0];

            return savedBook;
        } catch (err) {
            throw new BadRequestError(`Cannot add book to db. Db error: ${err}`)
        }
    }

    /**Update a saved book to Read or Wish To Read status
     * 
     * Given: volumeId, username, data
     * 
     * data: has_read
     * 
     * Returns: {id, user_id, volume_id, title, author, publisher, category, description, image, has_read}
     */

    static async updateReadOrWishStatus(volumeId, username, data) {
        //Check if user exists
        const userResp = await db.query(
            `SELECT id, username
                FROM users
                WHERE username = $1`, [username]
        );

        const user = userResp.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username} not found`)

        //Check if volume id exists in saved books
        const savedBookResp = await db.query(
            `SELECT volume_id
                FROM saved_books
                WHERE volume_id = $1`, [volumeId]
        );

        const savedBook = savedBookResp.rows[0];

        if (!savedBook) throw new NotFoundError(`No saved book. Volume Id: ${volumeId} not found.`);

        if (data.has_read === undefined) throw new NotFoundError(`No has_read data. has_read: ${data.has_data} not found.`)

        //Update book
        const result = await db.query(
            `UPDATE saved_books
                SET has_read = $1
                WHERE volume_id = $2
                AND user_id = $3
                RETURNING id, user_id, volume_id, title, author, publisher, category, description, image, has_read`,
            [
                data.has_read,
                volumeId,
                user.id
            ],
        );

        const updatedSavedBook = result.rows[0];

        if (!updatedSavedBook) throw new NotFoundError(`Book status not updated. Volume Id: ${volumeId}; data: ${data}`)

        return updatedSavedBook;
    }

    /**Gets all Read books for user from the database
     * 
     * Given: username and data
     * 
     * data: has_read = true
     * 
     * Return: [{id, user_id, volume_id, title, author, publisher, category, description, image, has_read}...]
     */

    static async getAllReadBooks(username, data) {
        let trueBoolean = (data.has_read === 'true' || data.has_read === true);

        //Check if user exists
        const userResp = await db.query(
            `SELECT id, username
                FROM users
                WHERE username = $1`, [username]
        );

        const user = userResp.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username} not found`)

        if (trueBoolean != true) throw new BadRequestError(`Cannot get Read books. has_read: ${data.has_read}`)

        const result = await db.query(
            `WITH volumeNameDiff AS
                (SELECT id, user_id, volume_id AS "volumeId", title, author, publisher, category, description, image, has_read
                    FROM saved_books)
            SELECT id, user_id, "volumeId", title, author, publisher, category, description, image, has_read
                FROM volumeNameDiff
                WHERE user_id = $1
                AND has_read = $2`, [user.id, trueBoolean]
        );

        const readBooks = result.rows;

        return readBooks;
    }

    /** Get all Wish To Read books for user from database
     * 
     * Given: username, data
     * 
     * data: has_read = false
     * 
     * Return: [{id, user_id, volume_id, title, author, publisher, category, description, image, has_read}...]
     */

    static async getAllWishBooks(username, data) {
        let falseBoolean = (data.has_read != 'false' && data.has_read != false);

        //Check if user exists
        const userResp = await db.query(
            `SELECT id, username
                FROM users
                WHERE username = $1`, [username]
        );

        const user = userResp.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username} not found`)

        if (falseBoolean != false) throw new BadRequestError(`Cannot get Wish To Read books. has_read: ${data.has_read}`)

        const result = await db.query(
            `WITH volumeNameDiff AS
                (SELECT id, user_id, volume_id AS "volumeId", title, author, publisher, category, description, image, has_read
                    FROM saved_books)
            SELECT id, user_id, "volumeId", title, author, publisher, category, description, image, has_read
                FROM volumeNameDiff
                WHERE user_id = $1
                AND has_read = $2`, [user.id, falseBoolean]
        );

        const wishToReadBooks = result.rows;

        return wishToReadBooks;
    }


    /**Get a saved book from the database
     * 
     * Given: volumeId and username
     * 
     * Returns: {id, user_id, volume_id, title, author, publisher, category, description image, has_read, 
     *           review: {id, user_id, comment, created_at, volume_id} or 'None',
     *           rating: {id, user_id, rating, volume_id} or 'None'}
     */

    static async getSavedBook(volumeId, username) {
        //Check user exists
        const userResp = await db.query(
            `SELECT id, username
                FROM users
                WHERE username = $1`, [username]
        );

        const user = userResp.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username} not found`)

        //Get saved book info
        const savedBooksResp = await db.query(
            `SELECT id, user_id, volume_id, title, author, publisher, category, description, image, has_read
                FROM saved_books
                WHERE user_id = $1
                AND volume_id = $2`, [user.id, volumeId]
        );

        const savedBook = savedBooksResp.rows[0];

        if (!savedBook) return null;

        //Include book review
        const reviewsResp = await db.query(
            `SELECT id, user_id, comment, created_at, volume_id
             FROM reviews
             WHERE volume_id = $1
             AND user_id = $2`, [volumeId, user.id]
        );

        const bookReview = reviewsResp.rows[0];

        if (!bookReview) {
            savedBook.review = null;
        } else {
            savedBook.review = bookReview;
        }

        //Include book rating  
        const ratingsResp = await db.query(
            `SELECT id, user_id, rating, volume_id
             FROM ratings
             WHERE volume_id = $1
             AND user_id = $2`, [volumeId, user.id]
        );

        const bookRating = ratingsResp.rows[0];

        if (!bookRating) {
            savedBook.rating = null;
        } else {
            savedBook.rating = bookRating;
        }

        return savedBook;
    }

    /**Delete a saved book from database 
     * 
     * Given: volumeId, username
     * 
     * Returns: {volumeId}
     *
    */

    static async deleteSavedBook(volumeId, username) {
        //Check user exists
        const userResp = await db.query(
            `SELECT id, username
                FROM users
                WHERE username = $1`, [username]
        );

        const user = userResp.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username} not found`)

        const result = await db.query(
            `DELETE
                FROM saved_books
                WHERE volume_id = $1
                AND user_id = $2
                RETURNING volume_id`, [volumeId, user.id]
        );

        const deletedBookId = result.rows[0]

        if (!deletedBookId) throw new NotFoundError(`Cannot delete saved book. Volume Id: ${volumeId}`);

        return deletedBookId;
    }
}

module.exports = SavedBook;