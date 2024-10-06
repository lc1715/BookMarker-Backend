"use strict";

const request = require('supertest');
const app = require('../app');
const db = require('../db');

const User = require('../models/user');

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testUserIds,
    testSavedBookIds,
    user1Token,
    user2Token,
} = require('./_testCommon');

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

/************************POST /users/register */

describe('POST /users/register', function () {
    it('should register a user', async function () {
        const res = await request(app)
            .post('/users/register')
            .send({
                username: 'new',
                password: 'password',
                email: 'new@email.com'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            'token': expect.any(String)
        })
    });

    it('returns bad request error with missing fields', async function () {
        const res = await request(app)
            .post('/users/register')
            .send({
                username: 'new'
            });

        expect(res.statusCode).toEqual(400);
    });

    it('returns bad request error with invalid data', async function () {
        const res = await request(app)
            .post('/users/register')
            .send({
                username: 'new',
                password: 'password',
                email: 'no-email'
            });

        expect(res.statusCode).toEqual(400);
    })
});

/************************POST /users/login */

describe('POST /users/login', function () {
    it('should log in user', async function () {
        const res = await request(app)
            .post('/users/login')
            .send({
                username: 'user1',
                password: 'password1'
            });

        expect(res.body).toEqual({
            'token': expect.any(String)
        });
    });

    it('returns unauthorized error with non-existent user', async function () {
        const res = await request(app)
            .post("/users/login")
            .send({
                username: "wrong",
                password: "password1",
            });

        expect(res.statusCode).toEqual(401);
    });

    it('returns unauthorized error with wrong password', async function () {
        const res = await request(app)
            .post("/users/login")
            .send({
                username: "user1",
                password: "wrong",
            });

        expect(res.statusCode).toEqual(401);
    });

    it('returns bad request error with missing data', async function () {
        const res = await request(app)
            .post('/users/login')
            .send({
                username: "user1"
            });

        expect(res.statusCode).toEqual(400);
    });

    it('returns bad request error with invalid data', async function () {
        const res = await request(app)
            .post('/users/login')
            .send({
                username: 24,
                password: 'above-is-a-number'
            });

        expect(res.statusCode).toEqual(400);
    });
});

/************************GET /users/:username */

describe('GET /users/:username', function () {
    it('should get a single user', async function () {
        const res = await request(app)
            .get('/users/user1')
            .set({
                authorization: `Bearer ${user1Token}`
            });

        expect(res.body).toEqual({
            user: {
                id: testUserIds[0],
                username: 'user1',
                email: 'user1@email.com',
                saved_book_ids: [testSavedBookIds[0]]
            }
        });
    });

    it('returns unauthorized error for other users', async function () {
        const resp = await request(app)
            .get(`/users/user1`)
            .set('authorization', `Bearer ${user2Token}`);

        expect(resp.statusCode).toEqual(401);
    });

    it('returns unauthorized error for anonymous', async function () {
        const res = await request(app)
            .get('/users/user1');

        expect(res.statusCode).toEqual(401);
    });

    it('returns unauthorized error with incorrect username', async function () {
        const res = await request(app)
            .get('/users/wrong')
            .set('authorization', `Bearer ${user1Token}`);

        expect(res.statusCode).toEqual(401);
    });

})

/************************PATCH /users/:username */

describe('PATCH /users/:username', function () {
    it('should update profile', async function () {
        const res = await request(app)
            .patch('/users/user1')
            .send({
                email: 'new@email.com'
            })
            .set({ authorization: `Bearer ${user1Token}` });

        expect(res.body).toEqual({
            updatedUser: {
                id: testUserIds[0],
                username: 'user1',
                email: 'new@email.com'
            }
        });
    });

    it('returns unauthorized error if not the same user', async function () {
        const resp = await request(app)
            .patch(`/users/user1`)
            .send({
                email: 'new@email.com'
            })
            .set('authorization', `Bearer ${user2Token}`);

        expect(resp.statusCode).toEqual(401);
    });

    it('returns unauthorized error for anonymous', async function () {
        const res = await request(app)
            .patch('/users/user1')
            .send({
                email: 'new@email.com'
            })

        expect(res.statusCode).toEqual(401);
    });

    it('returns unauthorized error if incorrect username', async function () {
        const res = await request(app)
            .patch('/users/wrong')
            .send({
                email: 'new@email.com'
            })
            .set('authorization', `Bearer ${user1Token}`);

        expect(res.statusCode).toEqual(401);
    });

    it('returns bad request error if invalid data', async function () {
        const resp = await request(app)
            .patch(`/users/user1`)
            .send({
                email: 'wrong',
            })
            .set('authorization', `Bearer ${user1Token}`);

        expect(resp.statusCode).toEqual(400);
    });
});

/************************DELETE /users/:username */

describe('DELETE /users/:username', function () {
    it('should delete a user', async function () {
        const resp = await request(app)
            .delete(`/users/user1`)
            .set('authorization', `Bearer ${user1Token}`);

        expect(resp.body).toEqual({
            deleted: 'user1'
        });
    });

    it('returns unauthorized error if not the same user', async function () {
        const resp = await request(app)
            .delete(`/users/user1`)
            .set('authorization', `Bearer ${user2Token}`);

        expect(resp.statusCode).toEqual(401);
    });

    it('returns unauthorized error for anonymous', async function () {
        const res = await request(app)
            .delete('/users/user1')

        expect(res.statusCode).toEqual(401);
    });

    it('returns unauthorized error if incorrect username', async function () {
        const res = await request(app)
            .delete('/users/wrong')
            .set('authorization', `Bearer ${user1Token}`);

        expect(res.statusCode).toEqual(401);
    });
});