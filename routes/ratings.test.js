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
    testRatingIds,
    user1Token,
    user2Token,
    user3Token
} = require('./_testCommon');
const { italic } = require('colors');

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

/***********************POST /ratings/savedbook/[savedBookId]/user/[username]*/

describe('POST /ratings/savedbook/[savedBookId]/user/[username]', function () {
    it('should create a book rating', async function () {
        const res = await request(app)
            .post(`/ratings/savedbook/${testSavedBookIds[2]}/user/user3`)
            .send({
                rating: 5,
                volume_id: 33
            })
            .set('authorization', `Bearer ${user3Token}`)

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            rating: {
                id: expect.any(Number),
                rating: 5,
                saved_book_id: testSavedBookIds[2],
                user_id: testUserIds[2],
                volume_id: 33
            }
        });
    });

    it('returns bad request error if invalid data', async function () {
        const res = await request(app)
            .post(`/ratings/savedbook/${testSavedBookIds[2]}/user/user3`)
            .send({
                volume_id: 33
            })
            .set('authorization', `Bearer ${user3Token}`)

        expect(res.statusCode).toEqual(400);
    });

    it('returns not found error if book not already saved by user', async function () {
        const res = await request(app)
            .post(`/ratings/savedbook/999/user/user3`)
            .send({
                rating: 5,
                volume_id: 33
            })
            .set('authorization', `Bearer ${user3Token}`)

        expect(res.statusCode).toEqual(404);
    });

    it('returns not found error with incorrect username', async function () {
        const res = await request(app)
            .post(`/ratings/savedbook/${testSavedBookIds[2]}/user/wrong`)
            .send({
                rating: 5,
                volume_id: 33
            })
            .set('authorization', `Bearer ${user3Token}`)

        expect(res.statusCode).toEqual(401);
    });

    it('returns unauthorized error if user does not exist', async function () {
        const res = await request(app)
            .post(`/ratings/savedbook/${testSavedBookIds[2]}/user/user3`)
            .send({
                rating: 5,
                volume_id: 33
            })

        expect(res.statusCode).toEqual(401);
    });
});

/***********************PATCH /ratings/[id]/user/[username]*/

describe('PATCH /ratings/[id]/user/[username]', function () {
    it('should update a book rating', async function () {
        const res = await request(app)
            .patch(`/ratings/${testRatingIds[0]}/user/user1`)
            .send({
                rating: 3,
            })
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.body).toEqual({
            updatedRating: {
                id: testRatingIds[0],
                rating: 3,
                saved_book_id: testSavedBookIds[0],
                user_id: testUserIds[0],
                volume_id: 11
            }
        });
    });

    it('returns not found error with incorrect rating id', async function () {
        const res = await request(app)
            .patch(`/ratings/999/user/user1`)
            .send({
                rating: 3
            })
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.statusCode).toEqual(404);
    });

    it('should throw not found error with incorrect username', async function () {
        const res = await request(app)
            .patch(`/ratings/${testRatingIds[0]}/user/wrong`)
            .send({
                rating: 3
            })
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.statusCode).toEqual(401);
    });
});

/***********************GET /ratings/[savedBookId]/user/[username]*/

describe('GET /ratings/[savedBookId]/user/[username]', function () {
    it('should get a book rating', async function () {
        const res = await request(app)
            .get(`/ratings/${testSavedBookIds[0]}/user/user1`)
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.body).toEqual({
            rating: {
                id: testRatingIds[0],
                rating: 5,
                saved_book_id: testSavedBookIds[0],
                user_id: testUserIds[0],
                volume_id: 11
            }
        });
    });

    it('returns not found error if book not already saved by user', async function () {
        const res = await request(app)
            .get(`/ratings/999/user/user1`)
            .set('authorization', `Bearer ${user3Token}`)

        expect(res.statusCode).toEqual(404);
    });

    it('should throw not found error with incorrect username', async function () {
        const res = await request(app)
            .get(`/ratings/${testSavedBookIds[0]}/user/wrong`)
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.statusCode).toEqual(404);
    });
});