const bcrypt = require('bcrypt');

const db = require('../db.js');
const { BCRYPT_WORK_FACTOR } = require('../config.js');

const testUserIds = [];
const testSavedBookIds = [];
const testReviewIds = [];
const testRatingIds = [];

async function commonBeforeAll() {
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM saved_books');
    await db.query('DELETE FROM ratings');
    await db.query('DELETE FROM reviews');


    const resultsUsers = await db.query(`
        INSERT INTO users(username,
                          password,
                          email)
        VALUES ('user1', $1, 'user1@email.com'),
               ('user2', $2, 'user2@email.com'),
               ('user3', $3, 'user3@email.com')
        RETURNING id`,
        [
            await bcrypt.hash('password1', BCRYPT_WORK_FACTOR),
            await bcrypt.hash('password2', BCRYPT_WORK_FACTOR),
            await bcrypt.hash('password3', BCRYPT_WORK_FACTOR)
        ]);

    testUserIds.splice(0, 0, ...resultsUsers.rows.map(row => row.id));


    const resultsSavedBooks = await db.query(`
            INSERT INTO saved_books(user_id,
                                    volume_id,
                                    title,
                                    author,
                                    publisher,
                                    category,
                                    description,
                                    image,
                                    has_read)
            VALUES ($1, 11, 'title1', 'author1', 'pub1', 'cat1', 'des1', 'image1', true),
                   ($2, 22, 'title2', 'author2', 'pub2', 'cat2', 'des2', 'image2', false),
                   ($3, 33, 'title3', 'author3', 'pub3', 'cat3', 'des3', 'image3', true)
            RETURNING id`,
        [testUserIds[0], testUserIds[1], testUserIds[2]]);

    testSavedBookIds.splice(0, 0, ...resultsSavedBooks.rows.map(row => row.id));


    const resultsReviews = await db.query(`
            INSERT INTO reviews(saved_book_id,
                                user_id,
                                comment,
                                volume_id)
            VALUES ($1, $2, 'comment1', 11),
                   ($3, $4, 'comment2', 22)
            RETURNING id`,
        [testSavedBookIds[0], testUserIds[0], testSavedBookIds[1], testUserIds[1]])

    testReviewIds.splice(0, 0, ...resultsReviews.rows.map(row => row.id))


    const resultsRatings = await db.query(`
            INSERT INTO ratings(saved_book_id,
                                user_id,
                                rating,
                                volume_id)
            VALUES ($1, $2, 5, 11),
                   ($3, $4, 2, 22)
            RETURNING id`,
        [testSavedBookIds[0], testUserIds[0], testSavedBookIds[1], testUserIds[1]]
    );

    testRatingIds.splice(0, 0, ...resultsRatings.rows.map(row => row.id))
}

async function commonBeforeEach() {
    await db.query('BEGIN');
}

async function commonAfterEach() {
    await db.query('ROLLBACK');
}

async function commonAfterAll() {
    await db.end();
}

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testUserIds,
    testSavedBookIds,
    testReviewIds,
    testRatingIds
};