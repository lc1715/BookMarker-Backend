"use strict";

const db = require('../db.js');
const SavedBook = require('./savedbook.js');

const {
    NotFoundError,
    BadRequestError
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
} = require('./_testCommon.js');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/****************Add saved books*/

describe('add saved books', function () {
    const bookData = {
        volume_id: 4698,
        title: 't1',
        author: 'a1',
        publisher: 'p1',
        category: 'c1',
        description: 'd1',
        image: 'i1',
        has_read: true
    }

    it('should successfully save book', async function () {
        const savedBook = await SavedBook.addSavedBook('user1', bookData);

        expect(savedBook).toEqual({
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
        });
    });

    const dupBookData = {
        volume_id: 11,
        title: 't1',
        author: 'a1',
        publisher: 'p1',
        category: 'c1',
        description: 'd1',
        image: 'i1',
        has_read: true
    }

    it('should throw BadRequestError if the book has already been saved', async function () {
        try {
            await SavedBook.addSavedBook('user1', dupBookData);
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    it('should throw BadRequestError if insufficient data', async function () {
        try {
            await SavedBook.addSavedBook('user1', {
                title: 't5'
            })
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    it('should throw NotFoundError with incorrect username', async function () {
        try {
            await SavedBook.addSavedBook('wrong', bookData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});


/****************update a saved book to Read or Wish To Read status*/

describe('update a saved book to Read or Wish To Read status', function () {
    const bookData1 = {
        has_read: false
    }

    it('should change has_read status to false', async function () {
        const book = await SavedBook.updateReadOrWishStatus(testSavedBookIds[0], 'user1', bookData1);

        expect(book.has_read).toEqual(false);
    });

    const bookData2 = {
        has_read: true
    }

    it('should change has_read status to true', async function () {
        const book = await SavedBook.updateReadOrWishStatus(testSavedBookIds[0], 'user1', bookData2);

        expect(book.has_read).toEqual(true);
    });

    it('should throw NotFoundError with incorrect username', async function () {
        try {
            await SavedBook.updateReadOrWishStatus('wrong', bookData1);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/****************gets all Read books for user*/

describe('gets all Read books for user', function () {
    const bookData = {
        has_read: true
    }

    it('should get all Read books', async function () {
        const readBook = await SavedBook.getAllReadBooks('user1', bookData)

        expect(readBook).toEqual([{
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
        }])
    });

    it('should throw BadRequestError with wrong data', async function () {
        try {
            await SavedBook.getAllReadBooks('user2', { has_read: false });
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    it('should throw NotFoundError with incorrect username', async function () {
        try {
            await SavedBook.getAllReadBooks('wrong', bookData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/****************gets Wish To Read books for user*/

describe('gets Wish To Read books for user', function () {
    const bookData = {
        has_read: false
    }

    it('should get Wish To Read books', async function () {
        const readBook = await SavedBook.getAllWishBooks('user2', bookData)

        expect(readBook).toEqual([{
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
        }])
    });

    it('should throw BadRequestError with wrong data', async function () {
        try {
            await SavedBook.getAllWishBooks('user2', { has_read: true });
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    it('should throw NotFoundError with incorrect username', async function () {
        try {
            await SavedBook.getAllWishBooks('wrong', bookData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/****************get a saved book's info*/

describe(`get a saved book's info`, function () {
    it('should get a single saved book', async function () {
        const savedBook = await SavedBook.getSavedBook(testSavedBookIds[0], 'user1')

        expect(savedBook).toEqual({
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
                created_at: expect.any(Date),
                volume_id: 11
            },
            rating: {
                id: testRatingIds[0],
                saved_book_id: testSavedBookIds[0],
                user_id: testUserIds[0],
                rating: 5,
                volume_id: 11
            }
        });
    });

    it('should throw NotFoundError with incorrect saved book id', async function () {
        try {
            await SavedBook.getSavedBook('85158713457');
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    it('should throw NotFoundError with incorrect username', async function () {
        try {
            await SavedBook.getSavedBook('wrong');
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/****************delete a saved book*/

describe(`delete a saved book`, function () {
    it('should delete a saved book', async function () {
        const deletedBook = await SavedBook.deleteSavedBook(testSavedBookIds[0], 'user1')

        expect(deletedBook).toEqual({
            id: testSavedBookIds[0]
        });
    });
});
