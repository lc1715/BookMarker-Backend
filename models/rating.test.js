"use strict";

const db = require('../db.js')
const Rating = require('./rating.js')

const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError
} = require('../expressError.js');

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testUserIds,
    testSavedBookIds,
    testReviewIds,
    testRatingIds
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/****************add a book rating*/

describe('add a book rating', function () {
    const ratingData = {
        rating: 4,
        volume_id: 33
    }

    it('should successfully add a book rating', async function () {
        const rating = await Rating.addRating(testSavedBookIds[2], 'user3', ratingData)

        expect(rating).toEqual({
            id: expect.any(Number),
            rating: 4,
            saved_book_id: testSavedBookIds[2],
            user_id: testUserIds[2],
            volume_id: 33
        });
    });

    it('should throw NotFoundError if book has not been saved by the user', async function () {
        try {
            await Rating.addRating(999, 'user3', ratingData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    it('should throw BadRequestError with missing data', async function () {
        try {
            await Rating.addRating(testSavedBookIds[2], 'user3', { volume_id: 33 });
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    it('should throw NotFoundError with incorrect username', async function () {
        try {
            await Rating.addRating(testSavedBookIds[2], 'wrong', ratingData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/****************update a book rating*/

describe('update a book rating', function () {
    const ratingData = {
        rating: 3
    }

    it('should successfully update a book rating', async function () {
        const updatedRating = await Rating.updateRating(testRatingIds[0], 'user1', ratingData);

        expect(updatedRating).toEqual({
            id: testRatingIds[0],
            rating: 3,
            saved_book_id: testSavedBookIds[0],
            user_id: testUserIds[0],
            volume_id: 11
        });
    });

    it('should throw NotFoundError with incorrect rating id', async function () {
        try {
            await Rating.updateRating(9999, 'user1', ratingData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    it('should throw NotFoundError with incorrect username', async function () {
        try {
            await Rating.updateRating(testSavedBookIds[2], 'wrong', ratingData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/****************get a book rating*/

describe('get a book rating', function () {
    it('should successfully get a book rating', async function () {
        const rating = await Rating.getRating(testSavedBookIds[0], 'user1');

        expect(rating).toEqual({
            id: testRatingIds[0],
            rating: 5,
            saved_book_id: testSavedBookIds[0],
            user_id: testUserIds[0],
            volume_id: 11
        });
    });

    it('should throw NotFoundError if book has not been saved by the user', async function () {
        try {
            await Rating.getRating(999, 'user1');
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    it('should throw NotFoundError with incorrect username', async function () {
        try {
            await Rating.getRating(testSavedBookIds[0], 'wrong');
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
