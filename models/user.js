"use strict";

const db = require('../db.js');
const bcrypt = require('bcrypt');

const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError
} = require('./expressError');

const { BCRYPT_WORK_FACTOR } = require('../config.js');


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

    static async delete(username) {
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
}


module.exports = User;