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

    /**Update a saved book to Read or Wish To Read 
     * 
     * Given: id, username, data
     * 
     * id: saved books id
     * 
     * data: has_read
     * 
     * Returns: {id, user_id, volume_id, title, author, publisher, category, description, image, has_read}
     */

    static async updateReadOrWishStatus(savedBookId, username, data) {
        //Check if user exists
        const userResp = await db.query(
            `SELECT id, username
                FROM users
                WHERE username = $1`, [username]
        );

        const user = userResp.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username} not found`)

        //Check if saved book id exists
        const savedBookResp = await db.query(
            `SELECT id
                FROM saved_books
                WHERE id = $1`, [savedBookId]
        );

        const savedBook = savedBookResp.rows[0];

        if (!savedBook) throw new NotFoundError(`No saved book. Saved Book Id: ${savedBook} not found.`);

        //Update book
        const result = await db.query(
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

        if (!updatedSavedBook) throw new NotFoundError(`Book status not updated. Saved Book Id: ${savedBookId}; data: ${data}`)

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
        //Check if user exists
        const userResp = await db.query(
            `SELECT id, username
                FROM users
                WHERE username = $1`, [username]
        );

        const user = userResp.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username} not found`)

        if (data.has_read === false) throw new BadRequestError(`Cannot get Read books. has_read: ${data.has_read}`)

        const result = await db.query(
            `SELECT id, user_id, volume_id, title, author, publisher, category, description, image, has_read
                FROM saved_books
                WHERE user_id = $1
                AND has_read = $2`, [user.id, data.has_read]
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
        //Check if user exists
        const userResp = await db.query(
            `SELECT id, username
                FROM users
                WHERE username = $1`, [username]
        );

        const user = userResp.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username} not found`)

        if (data.has_read === true) throw new BadRequestError(`Cannot get Wish To Read books. has_read: ${data.has_read}`)

        const result = await db.query(
            `SELECT id, user_id, volume_id, title, author, publisher, category, description, image, has_read
                FROM saved_books
                WHERE user_id = $1
                AND has_read = $2`, [user.id, data.has_read]
        );

        const wishToReadBooks = result.rows;

        return wishToReadBooks;
    }


    /**Get a saved book from the database
     * 
     * Given: id
     * 
     * id: saved_book_id
     * 
     * Returns: {id, user_id, volume_id, title, author, publisher, category, description image, has_read, 
     *           review: {id, saved_book_id, user_id, comment, created_at, volume_id} or 'None',
     *           rating: {id, saved_book_id, user_id, rating, volume_id} or 'None'}
     */

    static async getSavedBook(savedBookId, username) {
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
                WHERE id = $1`, [savedBookId]
        );

        const savedBook = savedBooksResp.rows[0];

        if (!savedBook) throw new NotFoundError(`No Saved Book Id: ${savedBookId}.Not found.`)

        //Include book review
        const reviewsResp = await db.query(
            `SELECT id, saved_book_id, user_id, comment, created_at, volume_id
             FROM reviews
             WHERE saved_book_id = $1
             AND user_id = $2`, [savedBook.id, savedBook.user_id]
        );

        const bookReview = reviewsResp.rows[0];

        if (!bookReview) {
            savedBook.review = 'None'
        } else {
            savedBook.review = bookReview;
        }

        //Include book rating  
        const ratingsResp = await db.query(
            `SELECT id, saved_book_id, user_id, rating, volume_id
             FROM ratings
             WHERE saved_book_id = $1
             AND user_id = $2`, [savedBook.id, savedBook.user_id]
        );

        const bookRating = ratingsResp.rows[0];

        if (!bookRating) {
            savedBook.rating = 'None'
        } else {
            savedBook.rating = bookRating;
        }

        return savedBook;
    }

    /**Delete a saved book from database 
     * 
     * Given: id, username
     * 
     * id: saved book id
     * 
     * Returns: {id}
    */

    static async deleteSavedBook(savedBookId, username) {
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
                WHERE id = $1
                RETURNING id`, [savedBookId]
        );

        const deletedBookId = result.rows[0]

        if (!deletedBookId) throw new NotFoundError(`Cannot delete saved book.Saved Book Id: ${savedBookId}`);

        return deletedBookId;
    }
}

module.exports = SavedBook;