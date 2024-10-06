"use strict";

const request = require('supertest');
const app = require('../app');
const db = require('../db');

const SavedBook = require('../models/savedbook');

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testUserIds,
    testSavedBookIds,
    testReviewIds,
    testRatingIds,
    user1Token,
    user2Token,
} = require('./_testCommon');

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

/************************POST /savedbooks/[volumeId]/user/[username] */

describe('POST /savedbooks/[volumeId]/user/[username] ', function () {
    it('should add a book to saved books', async function () {
        const res = await request(app)
            .post('/savedbooks/4698/user/user1')
            .send({
                volume_id: 4698,
                title: 't1',
                author: 'a1',
                publisher: 'p1',
                category: 'c1',
                description: 'd1',
                image: 'i1',
                has_read: true
            })
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            savedBook: {
                id: expect.any(Number),
                user_id: testUserIds[0],
                volume_id: 4698,
                title: 't1',
                author: 'a1',
                publisher: 'p1',
                category: 'c1',
                description: 'd1',
                image: 'i1',
                has_read: true
            }
        });
    });

    it('returns unauthorized error with wrong user', async function () {
        const resp = await request(app)
            .post('/savedbooks/4698/user/wrong')
            .send({
                volume_id: 4698,
                title: 't1',
                author: 'a1',
                publisher: 'p1',
                category: 'c1',
                description: 'd1',
                image: 'i1',
                has_read: true
            })
            .set('authorization', `Bearer ${user1Token}`)
        expect(resp.statusCode).toEqual(401);
    });

    it('returns bad request error with missing data', async function () {
        const resp = await request(app)
            .post('/savedbooks/4698/user/user1')
            .send({
                title: 't1'
            })
            .set('authorization', `Bearer ${user1Token}`)
        expect(resp.statusCode).toEqual(400);
    });

    it('returns bad request error with invalid data', async function () {
        const res = await request(app)
            .post('/savedbooks/4698/user/user1')
            .send({
                volume_id: 'invalid',
                title: 't1',
                author: 'a1',
                publisher: 'p1',
                category: 'c1',
                description: 'd1',
                image: 'i1',
                has_read: true
            })
            .set('authorization', `Bearer ${user1Token}`)
        expect(res.statusCode).toEqual(400);
    });
});

/************************PATCH /savedbooks/[id]/user/[username] */

describe('PATCH /savedbooks/[id]/user/[username] ', function () {
    it('it should update a book to Wish To Read status', async function () {
        const res = await request(app)
            .patch(`/savedbooks/${testSavedBookIds[0]}/user/user1`)
            .send({
                has_read: false
            })
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.body).toEqual({
            updatedBook: {
                id: testSavedBookIds[0],
                user_id: testUserIds[0],
                volume_id: 11,
                title: 'title1',
                author: 'author1',
                publisher: 'pub1',
                category: 'cat1',
                description: 'des1',
                image: 'image1',
                has_read: false
            }
        });
    });

    it('it should update a book to Read status', async function () {
        const res = await request(app)
            .patch(`/savedbooks/${testSavedBookIds[1]}/user/user2`)
            .send({
                has_read: true
            })
            .set('authorization', `Bearer ${user2Token}`)

        expect(res.body).toEqual({
            updatedBook: {
                id: testSavedBookIds[1],
                user_id: testUserIds[1],
                volume_id: 22,
                title: 'title2',
                author: 'author2',
                publisher: 'pub2',
                category: 'cat2',
                description: 'des2',
                image: 'image2',
                has_read: true
            }
        });
    });

    it('returns not found error with no data', async function () {
        const res = await request(app)
            .patch(`/savedbooks/11/user/user1`)
            .send({
            })
            .set('authorization', `Bearer ${user1Token}`);

        expect(res.statusCode).toEqual(404);
    });

    it('returns not found error with invalid book id', async function () {
        const res = await request(app)
            .patch(`/savedbooks/999/user/user1`)
            .send({
                has_read: false
            })
            .set('authorization', `Bearer ${user1Token}`);

        expect(res.statusCode).toEqual(404);
    });

    it('returns unauthorized error with incorrect username', async function () {
        const res = await request(app)
            .patch(`/savedbooks/${testSavedBookIds[0]}/user/wrong`)
            .send({
                has_read: true
            })
            .set('authorization', `Bearer ${user1Token}`);

        expect(res.statusCode).toEqual(401);
    });

    it('returns unauthorized error if user does not exist', async function () {
        const res = await request(app)
            .patch(`/savedbooks/${testSavedBookIds[0]}/user/user1`)
            .send({
                has_read: true
            })

        expect(res.statusCode).toEqual(401);
    });
});

/************************GET /savedbooks/read/user/[username] */

describe('GET /savedbooks/read/user/[username]', function () {
    it('gets all books in Read status', async function () {
        const res = await request(app)
            .get(`/savedbooks/read/user/user1`)
            .send({
                has_read: true
            })
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.body).toEqual({
            readBooks: [{
                id: testSavedBookIds[0],
                user_id: testUserIds[0],
                volume_id: 11,
                title: 'title1',
                author: 'author1',
                publisher: 'pub1',
                category: 'cat1',
                description: 'des1',
                image: 'image1',
                has_read: true
            }]
        });
    });

    it('returns bad request error with incorrect data', async function () {
        const res = await request(app)
            .get(`/savedbooks/read/user/user1`)
            .send({
                has_read: false
            })
            .set('authorization', `Bearer ${user1Token}`);

        expect(res.statusCode).toEqual(400);
    });

    it('returns unauthorized error with incorrect username', async function () {
        const res = await request(app)
            .get(`/savedbooks/read/user/wrong`)
            .send({
                has_read: true
            })
            .set('authorization', `Bearer ${user1Token}`);

        expect(res.statusCode).toEqual(401);
    });

    it('returns unauthorized error if user does not exist', async function () {
        const res = await request(app)
            .get(`/savedbooks/read/user/user1`)
            .send({
                has_read: true
            })

        expect(res.statusCode).toEqual(401);
    });
});

/************************GET /savedbooks/wish/user/[username] */

describe('GET /savedbooks/wish/user/[username]', function () {
    it('gets all books in Wish To Read status', async function () {
        const res = await request(app)
            .get(`/savedbooks/wish/user/user2`)
            .send({
                has_read: false
            })
            .set('authorization', `Bearer ${user2Token}`)

        expect(res.body).toEqual({
            wishBooks: [{
                id: testSavedBookIds[1],
                user_id: testUserIds[1],
                volume_id: 22,
                title: 'title2',
                author: 'author2',
                publisher: 'pub2',
                category: 'cat2',
                description: 'des2',
                image: 'image2',
                has_read: false
            }]
        });
    });

    it('returns bad request error with incorrect data', async function () {
        const res = await request(app)
            .get(`/savedbooks/wish/user/user2`)
            .send({
                has_read: true
            })
            .set('authorization', `Bearer ${user2Token}`);

        expect(res.statusCode).toEqual(400);
    });

    it('returns unauthorized error with incorrect username', async function () {
        const res = await request(app)
            .get(`/savedbooks/wish/user/wrong`)
            .send({
                has_read: false
            })
            .set('authorization', `Bearer ${user2Token}`);

        expect(res.statusCode).toEqual(401);
    });

    it('returns unauthorized error if user does not exist', async function () {
        const res = await request(app)
            .get(`/savedbooks/wish/user/user2`)
            .send({
                has_read: false
            })

        expect(res.statusCode).toEqual(401);
    });
});

/************************GET /savedbooks/[id]/user/[username] */

describe('GET /savedbooks/[id]/user/[username]', function () {
    it('gets a saved book with review and rating', async function () {

        const res = await request(app)
            .get(`/savedbooks/${testSavedBookIds[0]}/user/user1`)
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.body).toEqual({
            savedBook: {
                id: testSavedBookIds[0],
                user_id: testUserIds[0],
                volume_id: 11,
                title: 'title1',
                author: 'author1',
                publisher: 'pub1',
                category: 'cat1',
                description: 'des1',
                image: 'image1',
                has_read: true,
                review: {
                    id: testReviewIds[0],
                    saved_book_id: testSavedBookIds[0],
                    user_id: testUserIds[0],
                    comment: 'comment1',
                    created_at: expect.any(String),
                    volume_id: 11
                },
                rating: {
                    id: testRatingIds[0],
                    saved_book_id: testSavedBookIds[0],
                    user_id: testUserIds[0],
                    rating: 5,
                    volume_id: 11
                }
            }
        });
    });

    it('returns not found error with invalid book id', async function () {
        const res = await request(app)
            .get(`/savedbooks/999/user/user1`)
            .set('authorization', `Bearer ${user1Token}`);

        expect(res.statusCode).toEqual(404);
    });

    it('returns unauthorized error with incorrect username', async function () {
        const res = await request(app)
            .get(`/savedbooks/${testSavedBookIds[0]}/user/wrong`)
            .set('authorization', `Bearer ${user1Token}`);

        expect(res.statusCode).toEqual(401);
    });

    it('returns unauthorized error if user does not exist', async function () {
        const res = await request(app)
            .get(`/savedbooks/${testSavedBookIds[0]}/user/wrong`)

        expect(res.statusCode).toEqual(401);
    });
});

/************************DELETE /savedbooks/[id]/user/[username]*/

describe('DELETE /savedbooks/[id]/user/[username]', function () {
    it('should delete a saved book', async function () {
        const res = await request(app)
            .delete(`/savedbooks/${testSavedBookIds[0]}/user/user1`)
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.body).toEqual({
            deletedBook: {
                id: testSavedBookIds[0],
            }
        });
    });

    it('returns unauthorized error with incorrect username', async function () {
        const res = await request(app)
            .delete(`/savedbooks/${testSavedBookIds[0]}/user/wrong`)
            .set('authorization', `Bearer ${user1Token}`);

        expect(res.statusCode).toEqual(401);
    });

    it('returns unauthorized error if user does not exist', async function () {
        const res = await request(app)
            .delete(`/savedbooks/${testSavedBookIds[0]}/user/user1`)

        expect(res.statusCode).toEqual(401);
    });
});


