"use strict";

const db = require('../db.js')
const Review = require('./review.js')

const {
    NotFoundError,
    BadRequestError,
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
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/****************add a book review*/

describe('add a book review', function () {
    const reviewData = {
        comment: 'test comment',
        volume_id: 33
    }

    it('should successfully add a book review', async function () {
        const review = await Review.addReview(testSavedBookIds[2], 'user3', reviewData)

        expect(review).toEqual({
            id: expect.any(Number),
            comment: 'test comment',
            saved_book_id: testSavedBookIds[2],
            user_id: testUserIds[2],
            volume_id: 33,
            created_at: expect.any(Date)
        })
    });

    it('should throw NotFoundError if book has not been saved by the user', async function () {
        try {
            await Review.addReview(3426, 'user3', reviewData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    it('should throw ForbiddenError if user tries to add more than 1 review', async function () {
        const dupReview = {
            comment: 'test comment',
            volume_id: '11'
        }

        try {
            await Review.addReview(testSavedBookIds[0], 'user1', dupReview);
            fail();
        } catch (err) {
            expect(err instanceof ForbiddenError).toBeTruthy();
        }
    });

    it('should throw BadRequestError if review has insuffient data', async function () {
        try {
            await Review.addReview(testSavedBookIds[2], 'user3', {
                volume_id: 33
            });
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    it('should throw NotFoundError with incorrect username', async function () {
        try {
            await Review.addReview(testSavedBookIds[0], 'wrong', reviewData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/********************update a book review */

describe('update a book review', function () {
    const reviewData = {
        comment: 'new comment'
    }

    it('should successfully update a book review', async function () {
        const newReview = await Review.updateReview(testReviewIds[0], 'user1', reviewData);

        expect(newReview).toEqual({
            id: testReviewIds[0],
            comment: 'new comment',
            saved_book_id: testSavedBookIds[0],
            user_id: testUserIds[0],
            volume_id: 11,
            created_at: expect.any(Date)
        });
    });

    it('should throw NotFoundError with incorrect review id', async function () {
        try {
            await Review.updateReview(9999, 'user1', reviewData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    it('should throw NotFoundError with incorrect username', async function () {
        try {
            await Review.updateReview(testSavedBookIds[0], 'wrong', reviewData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/********************get all reviews on a book */

describe('get all reviews on a book', function () {
    it('should successfully get all reviews on a book', async function () {
        const reviews = await Review.getAllBookReviews(11);

        expect(reviews).toEqual([{
            id: testReviewIds[0],
            comment: 'comment1',
            created_at: expect.any(Date),
            volume_id: 11,
            saved_book_id: testSavedBookIds[0],
            user_id: testUserIds[0],
            username: 'user1'
        }])
    });
});

/********************delete a book review */

describe('delete a book review', function () {
    it('should successfully delete a book review', async function () {
        const deletedReview = await Review.deleteReview(testReviewIds[0], 'user1')

        expect(deletedReview).toEqual({ id: testReviewIds[0] })
    });

    it('should throw NotFoundError if review not found', async function () {
        try {
            await Review.deleteReview(999, 'user1');
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    it('should throw NotFoundError with incorrect username', async function () {
        try {
            await Review.deleteReview(testReviewIds[0], 'wrong');
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
