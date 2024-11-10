"use strict";

const Rating = require('./rating.js')

const {
    NotFoundError,
    BadRequestError,
} = require('../expressError.js');

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testUserIds,
    testRatingIds
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/****************add a book rating*/

describe('add a book rating', function () {
    const ratingData = {
        rating: 4
    }

    it('should successfully add a book rating', async function () {
        const rating = await Rating.addRating('33', 'user3', ratingData)

        expect(rating).toEqual({
            id: expect.any(Number),
            rating: 4,
            user_id: testUserIds[2],
            volume_id: '33'
        });
    });

    it('should throw BadRequestError with missing data', async function () {
        try {
            await Rating.addRating('33', 'user3', {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    it('should throw NotFoundError with incorrect username', async function () {
        try {
            await Rating.addRating('11', 'wrong', ratingData);
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
            user_id: testUserIds[0],
            volume_id: '11'
        });
    });

    it('should throw NotFoundError with incorrect rating id', async function () {
        try {
            await Rating.updateRating(54, 'user1', ratingData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    it('should throw NotFoundError with incorrect username', async function () {
        try {
            await Rating.updateRating(54, 'wrong', ratingData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/****************get a book rating*/

describe('get a book rating', function () {
    it('should successfully get a book rating', async function () {
        const rating = await Rating.getRating('11', 'user1');

        expect(rating).toEqual({
            id: testRatingIds[0],
            rating: 5,
            user_id: testUserIds[0],
            volume_id: '11'
        });
    });

    it('should throw NotFoundError with incorrect username', async function () {
        try {
            await Rating.getRating('11', 'wrong');
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/********************delete a book rating*/

describe('delete a book rating', function () {
    it('should successfully delete a book rating', async function () {
        const deletedRating = await Rating.deleteRating(testRatingIds[0], 'user1')

        expect(deletedRating).toEqual({ id: testRatingIds[0] })
    });

    it('should throw NotFoundError if rating not found', async function () {
        try {
            await Rating.deleteRating(999, 'user1');
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    it('should throw NotFoundError with incorrect username', async function () {
        try {
            await Rating.deleteRating(testRatingIds[0], 'wrong');
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
