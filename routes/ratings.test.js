"use strict";

const request = require('supertest');
const app = require('../app');

const Rating = require('../models/rating');

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testUserIds,
    testRatingIds,
    user1Token,
    user3Token
} = require('./_testCommon');

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

/***********************POST /ratings/[volumeId]/user/[username]*/

describe('POST /ratings/[volumeId]/user/[username]', function () {
    it('should create a book rating', async function () {
        const res = await request(app)
            .post(`/ratings/33/user/user3`)
            .send({
                rating: 5
            })
            .set('authorization', `Bearer ${user3Token}`)

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            rating: {
                id: expect.any(Number),
                rating: 5,
                user_id: testUserIds[2],
                volume_id: '33'
            }
        });
    });

    it('returns bad request error if invalid data', async function () {
        const res = await request(app)
            .post(`/ratings/33/user/user3`)
            .send({
                rating: 'asfet'
            })
            .set('authorization', `Bearer ${user3Token}`)

        expect(res.statusCode).toEqual(400);
    });

    it('returns not found error with incorrect username', async function () {
        const res = await request(app)
            .post(`/ratings/33/user/wrong`)
            .send({
                rating: 5
            })
            .set('authorization', `Bearer ${user3Token}`)

        expect(res.statusCode).toEqual(401);
    });

    it('returns unauthorized error if user does not exist', async function () {
        const res = await request(app)
            .post(`/ratings/33/user/user3`)
            .send({
                rating: 5
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
                user_id: testUserIds[0],
                volume_id: '11'
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

/***********************GET /ratings/[volumeId]/user/[username]*/

describe('GET /ratings/[volumeId]/user/[username]', function () {
    it('should get a book rating', async function () {
        const res = await request(app)
            .get(`/ratings/11/user/user1`)
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.body).toEqual({
            rating: {
                id: testRatingIds[0],
                rating: 5,
                user_id: testUserIds[0],
                volume_id: '11'
            }
        });
    });

    it('should throw not found error with incorrect username', async function () {
        const res = await request(app)
            .get(`/ratings/11/user/wrong`)
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.statusCode).toEqual(404);
    });
});

/***********************DELETE /ratings/[id]/user/[username]*/

describe('DELETE /ratings/[id]/user/[username]', function () {
    it('should delete a rating', async function () {
        const res = await request(app)
            .delete(`/ratings/${testRatingIds[0]}/user/user1`)
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.body).toEqual({
            deletedRating: {
                id: testRatingIds[0]
            }
        })
    });

    it('returns not found error if rating not found', async function () {
        const res = await request(app)
            .delete(`/ratings/999/user/user1`)
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.statusCode).toEqual(404);
    });

    it('returns not found error with incorrect username', async function () {
        const res = await request(app)
            .delete(`/ratings/${testRatingIds[0]}/user/wrong`)
            .set('authorization', `Bearer ${user1Token}`)

        expect(res.statusCode).toEqual(401);
    });

    it('returns unauthorized error if user does not exist', async function () {
        const res = await request(app)
            .delete(`/ratings/${testRatingIds[0]}/user/user1`)

        expect(res.statusCode).toEqual(401);
    });
});