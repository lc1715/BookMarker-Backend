"use strict";

const db = require('../db.js');
const User = require('./user.js');

const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError
} = require('../expressError.js');

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testUserIds,
    testSavedBookIds,
} = require('./_testCommon');


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/********************Register*/

describe('register a user', function () {
    const newUser = {
        username: 'test',
        password: 'test123',
        email: 'test@email.com'
    }

    it('should create a new user', async function () {
        let user = await User.register({ ...newUser });

        expect(user).toEqual({
            id: expect.any(Number),
            username: 'test',
            email: 'test@email.com'
        });

        const found = await db.query(`SELECT * FROM users WHERE username ='test'`)
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].password.startsWith('$2b$')).toBe(true);
    });

    it('should throw bad request with duplicate data', async function () {
        try {
            await User.register({ ...newUser });
            await User.register({ ...newUser });
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/********************Authenticate */

describe('authenticate users when they log in', function () {

    it('should authenticate user', async function () {
        const user = await User.authenticate({ username: 'user1', password: 'password1' });

        expect(user).toEqual({
            id: testUserIds[0],
            username: 'user1',
            email: 'user1@email.com'
        });
    });

    it('should throw unauthorized error if incorrect username', async function () {
        try {
            await User.authenticate('wrongUsername', 'password1');
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });

    it('should throw unauthorized error if incorrect password', async function () {
        try {
            await User.authenticate('user1', 'wrongPassword');
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
});

/********************get a single user*/

describe('get a single user', function () {
    it('should get a user with correct username', async function () {
        const user = await User.getUser('user1');

        expect(user).toEqual({
            id: testUserIds[0],
            username: 'user1',
            email: 'user1@email.com',
            saved_book_ids: [testSavedBookIds[0]]
        });
    });

    it('should throw not found error with incorrect username', async function () {
        try {
            await User.getUser('wrong');
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************update a user profile */

describe('update a user profile', function () {
    it('should successfully update a user profile', async function () {
        const data = { email: 'new@email.com' };

        const user = await User.update('user1', data);

        expect(user).toEqual({
            id: testUserIds[0],
            username: 'user1',
            email: 'new@email.com'
        });
    });

    it('should throw not found error with incorrect username', async function () {
        try {
            const data = { email: 'new@email.com' };

            await User.update('wrong', data);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************delete a user */

describe('delete a user', function () {
    it('should successfully delete a user', async function () {
        const deletedUser = await User.delete('user1');

        expect(deletedUser).toEqual({
            username: 'user1',
        });
    });

    it('should throw not found error with incorrect username', async function () {
        try {
            await User.delete('wrong');
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});



