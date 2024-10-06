"use strict";

const request = require('supertest');
const app = require('../app');
const db = require('../db');

const Review = require('../models/review');

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testUserIds,
    testSavedBookIds,
    testReviewIds,
    user1Token,
    user2Token,
    user3Token
} = require('./_testCommon');

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

/***********************POST /reviews/savedbook/[savedBookId]/user/[username] */

describe('POST /reviews/savedbook/[savedBookId]/user/[username]', function () {
    it('should add a book review', async function () {
        const res = await request(app)
            .post(`/reviews/savedbook/${testSavedBookIds[2]}/user/user3`)
            .send({
                comment: 'test comment',
                volume_id: 33
            })
            .set('authorization', `Bearer ${user3Token}`)

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            review:
            {
                id: expect.any(Number),
                comment: 'test comment',
                saved_book_id: testSavedBookIds[2],
                user_id: testUserIds[2],
                volume_id: 33,
                created_at: expect.any(String)
            }
        })
    });

    it('returns bad request error if invalid data', async function () {
        const res = await request(app)
            .post(`/reviews/savedbook/${testSavedBookIds[2]}/user/user3`)
            .send({
                volume_id: 33
            })
            .set('authorization', `Bearer ${user3Token}`)

        expect(res.statusCode).toEqual(400);
    });

    it('returns not found error if book not already saved by user', async function () {
        const res = await request(app)
            .post(`/reviews/savedbook/999/user/user3`)
            .send({
                comment: 'test comment',
                volume_id: 33
            })
            .set('authorization', `Bearer ${user3Token}`)

        expect(res.statusCode).toEqual(404);
    });

    it('returns not forbidden error if user tries to add more than 1 review', async function () {
        const res = await request(app)
            .post(`/reviews/savedbook/${testSavedBookIds[0]}/user/user1`)
            .send({
                comment: 'another comment',
                volume_id: 11
            })
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.statusCode).toEqual(403);
    });

    it('returns not found error with non-existent user', async function () {
        const res = await request(app)
            .post(`/reviews/savedbook/${testSavedBookIds[2]}/user/wrong`)
            .send({
                comment: 'test comment',
                volume_id: 33
            })
            .set('authorization', `Bearer ${user3Token}`)

        expect(res.statusCode).toEqual(401);
    });
});

/***********************PATCH /reviews/[reviewId]/user/[username]*/

describe('PATCH /reviews/[reviewId]/user/[username]', function () {
    it('should update a book review', async function () {
        const res = await request(app)
            .patch(`/reviews/${testReviewIds[0]}/user/user1`)
            .send({
                comment: 'update my comment',
            })
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.body).toEqual({
            updatedReview:
            {
                id: testReviewIds[0],
                comment: 'update my comment',
                saved_book_id: testSavedBookIds[0],
                user_id: testUserIds[0],
                volume_id: 11,
                created_at: expect.any(String),
            }
        })
    });

    it('returns not found error with incorrect review id', async function () {
        const res = await request(app)
            .patch(`/reviews/999/user/user1`)
            .send({
                comment: 'test comment',
            })
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.statusCode).toEqual(404);
    });

    it('returns not found error with incorrect username', async function () {
        const res = await request(app)
            .patch(`/reviews/${testReviewIds[0]}/user/wrong`)
            .send({
                comment: 'test comment',
            })
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.statusCode).toEqual(401);
    });
});

/***********************GET /reviews/[volumeId]*/

describe('GET /reviews/[volumeId]', function () {
    it('should get all book reviews on a book', async function () {
        const res = await request(app)
            .get(`/reviews/11`)

        expect(res.body).toEqual({
            allReviews: [
                {
                    id: testReviewIds[0],
                    comment: 'comment1',
                    saved_book_id: testSavedBookIds[0],
                    user_id: testUserIds[0],
                    username: 'user1',
                    volume_id: 11,
                    created_at: expect.any(String),
                }
            ]
        })
    });
});

/***********************DELETE /reviews/[id]/user/[username]*/

describe('DELETE /reviews/[id]/user/[username]', function () {
    it('should delete a book', async function () {
        const res = await request(app)
            .delete(`/reviews/${testReviewIds[0]}/user/user1`)
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.body).toEqual({
            deletedReview: {
                id: testReviewIds[0]
            }
        })
    });

    it('returns not found error if review not found', async function () {
        const res = await request(app)
            .delete(`/reviews/999/user/user1`)
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.statusCode).toEqual(404);
    });

    it('returns not found error with incorrect username', async function () {
        const res = await request(app)
            .delete(`/reviews/${testReviewIds[0]}/user/wrong`)
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.statusCode).toEqual(401);
    });

    it('returns unauthorized error if user does not exist', async function () {
        const res = await request(app)
            .delete(`/reviews/${testReviewIds[0]}/user/user1`)

        expect(res.statusCode).toEqual(401);
    });
});