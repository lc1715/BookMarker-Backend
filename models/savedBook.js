"use strict";

const db = require(`./db.js`)

const {
    NotFoundError,
    BadRequestError,
} = require('./expressError');


class savedBook {
    /**Add a book into the database given username and data
     * 
     * data: volume_id, title, author, publisher, category, image, has_read
     * 
     * Returns: {id, user_id, volume_id, title, author, publisher, category, image, has_read}
     * 
     * id: saved book id
     */

    static async addSavedBook(username, data) {
        const userResp = db.query(
            `SELECT id, username
                FROM users
                WHERE username = $1`, [username]
        );

        const user = userResp.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username} not found`)


        const duplicateCheckBook = db.query(
            `SELECT id,
                FROM saved_books
                WHERE volume_id = $1
                AND user_id = $2`, [data.volume_id, user.id]
        );

        if (duplicateCheckBook.rows[0]) throw new BadRequestError(`Book already saved. Volume Id: ${data.volume_id} `)

        const result = db.query(
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
    }

    /**Update a saved book to Read or Wish To Read 
     * 
     * id: saved book id
     * 
     * data: has_read
     * 
     * Given: id, data
     * 
     * Returns: {id, user_id, volume_id, title, author, publisher, category, image, has_read}
     */

    static async updateReadOrWishStatus(savedBookId, data) {
        const savedBookResp = db.query(
            `SELECT id
                FROM saved_books
                WHERE id = $1`, [savedBookId]
        );

        const savedBook = savedBookResp.rows[0];

        if (!savedBook) throw new NotFoundError(`No saved book. Saved Book Id: ${savedBook} not found.`);

        const result = db.query(
            `UPDATE saved_books
                SET has_read = $1
                WHERE id = $2
                RETURNING id, user_id, volume_id, title, author, publisher, category, description, image, has_read`,
            [
                data.has_read,
                savedBookId
            ],
        );

        const updatedSavedBook = result.rows[0];

        if (!updatedSavedBook) throw new NotFoundError(`No has_read: ${data.has_read}`)

        return updatedSavedBook;
    }

    /**Gets all Read books for user from the database
     * 
     * Given: username and data
     * 
     * data: has_read
     * 
     * Return: [{id, user_id, volume_id, title, author, publisher, category, image, has_read}...]
     */

    static async getAllReadBooks(username, data) {
        const userResp = db.query(
            `SELECT id, username
                FROM users
                WHERE username = $1`, [username]
        );

        const user = userResp.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username} not found`)

        const result = db.query(
            `SELECT id, user_id, volume_id, title, author, publisher, category, image, has_read
                FROM saved_books
                WHERE has_read = $1`, [data.has_read]
        );

        const readBooks = result.rows;

        if (!readBooks) throw new NotFoundError(`No Read saved books. has_read: ${data.has_read}`)

        return readBooks;
    }

    /** Get all Wish To Read books for user from database
     * 
     * Given: username, data
     * 
     * data: has_read
     * 
     * Return: [{id, user_id, volume_id, title, author, publisher, category, image, has_read}...]
     */

    static async getAllWishBooks(username, data) {
        const userResp = db.query(
            `SELECT id, username
                FROM users
                WHERE username = $1`, [username]
        );

        const user = userResp.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username} not found`)

        const result = db.query(
            `SELECT id, user_id, volume_id, title, author, publisher, category, image, has_read
                FROM saved_books
                WHERE has_read = $1`, [data.has_read]
        );

        const wishToReadBooks = result.rows;

        if (!wishToReadBooks) throw new NotFoundError(`No Wish To Read saved books. has_read: ${data.has_read}`)

        return wishToReadBooks;
    }


    /**Get a saved book from the database
     * 
     * Given: id
     * 
     * id: saved_book_id
     * 
     * Returns: {id, user_id, volume_id, title, author, publisher, category, image, has_read, 
     *           review: {id, saved_book_id, user_id, comment, created_at, volume_id}}
     */

    static async getSavedBook(savedBookId) {
        const savedBookResp = db.query(
            `SELECT id, user_id, volume_id, title, author, publisher, category, image, has_read
                FROM saved_books
                WHERE id = $1`, [savedBookId]
        );

        const savedBook = savedBookResp.rows[0];

        if (!savedBook) throw new NotFoundError(`No Saved Book Id: ${savedBookId}. Not found.`)

        const reviewsResp = db.query(
            `SELECT id, saved_book_id, user_id, comment, created_at, volume_id
             FROM reviews
             WHERE saved_book_id = $1
             AND user_id = $2`, [savedBook.id, savedBook.user_id]
        );

        const bookReview = reviewsResp.rows[0];

        if (!bookReview) throw new NotFoundError(`No review found. saved_book_id: ${savedBookId}; user_id: ${savedBook.user_id}`)

        savedBook.review = bookReview;

        return savedBook;
    }

    /**Delete a saved book from database 
     * 
     * Given: id
     * 
     * id: saved_book_id
     * 
     * Returns: {id}
    */

    static async deleteSavedBook(savedBookId) {
        const result = db.query(
            `DELETE
                FROM saved_books
                WHERE id = $1
                RETURNING id`, [savedBookId]
        );

        const deletedBookId = result.rows[0]

        if (!deletedBookId) throw new NotFoundError(`No saved book found. Saved Book Id: ${savedBookId}`);

        return deletedBookId;
    }
}

module.exports = savedBook;