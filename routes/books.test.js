const request = require('supertest');
const app = require('../app');
const db = require('../db')
const axios = require('axios');
const { BadRequestError, ExpressError } = require('../expressError');

const { GOOGLE_API_KEY, NYT_API_KEY } = require('../config');

/**Google Books API: */
const GOOGLE_BASE_URL = `https://www.googleapis.com/books/v1`

/**The New York Times Books API */
const NYT_BASE_URL = `https://api.nytimes.com/svc/books/v3`
const listName = `combined-print-and-e-book-fiction`


jest.mock('axios')

afterAll(() => db.end())

/** GET /books/details/:volumeId
 * 
 * Returns: {book}
*/

describe(`get book details from google books api`, function () {
    it('makes a successful API call', async function () {
        const mockData = {
            id: 'd34zvrjk89',
            volumeInfo: {
                title: 'title1',
                authors: ['author1'],
                publisher: 'pub1',
                categories: 'cat1',
                description: 'des1',
                imageLinks: {
                    thumbnail: 'http://books.google.com/image'
                }
            }
        }

        const mockSimplifiedData = {
            volumeId: 'd34zvrjk89',
            title: 'title1',
            author: ['author1'],
            publisher: 'pub1',
            category: 'cat1',
            description: 'des1',
            image: 'http://books.google.com/image'
        }

        axios.get.mockResolvedValue({ data: mockData });

        const resp = await request(app).get(`/books/details/vol1`)

        expect(axios.get).toHaveBeenCalledWith(`${GOOGLE_BASE_URL}/volumes/vol1?key=${GOOGLE_API_KEY}`)
        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual(mockSimplifiedData);
    });

    it('returns an error if API call fails', async function () {
        axios.get.mockRejectedValue(new Error(`Network Error`));

        const resp = await request(app).get(`/books/details/vol1`)

        expect(axios.get).toHaveBeenCalledWith(`${GOOGLE_BASE_URL}/volumes/vol1?key=${GOOGLE_API_KEY}`)
        expect(resp.body).toEqual({ error: { message: 'Network Error', status: 500 } });
    });
});

