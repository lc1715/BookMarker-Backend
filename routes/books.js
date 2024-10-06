/**External API Related */

const express = require('express');
const router = new express.Router();
const axios = require('axios');

const { BadRequestError } = require('../expressError');

const { GOOGLE_API_KEY, NYT_API_KEY } = require('../config');

/**Google Books API: */
const GOOGLE_BASE_URL = `https://www.googleapis.com/books/v1`

/**The New York Times Books API */
const NYT_BASE_URL = `https://api.nytimes.com/svc/books/v3`
const listName = `combined-print-and-e-book-fiction`


/**Get list of books from Google Books API given search term
 *
 * GET route: /books/?term = ''
 *
 * Returns: [{book1}, {book2}, ...]
*/
//Ex. route: 'http://localhost:3001/books/?term=inauthor:michael crichton+intitle:airframe'
router.get('/', async function (req, res, next) {
    console.debug('term:', req.query.term)
    try {
        const term = req.query.term;

        const resp = await axios.get(`${GOOGLE_BASE_URL}/volumes?q=${term}&maxResults=40&key=${GOOGLE_API_KEY}`);

        const simplifiedData = simplifyBookList(resp.data.items);

        return res.json(simplifiedData)
    } catch (err) {
        return next(err);
    }
});

/**Get a detailed book from Google Books API given volume Id
 *
 * GET route: /books/details/:volumeId
 *
 * Returns: {book}
*/
//Ex. route: 'http://localhost:3001/books/details/sY7NE_F8yB0C'
router.get('/details/:volumeId', async function (req, res, next) {
    console.debug('volumeId:')
    try {
        const volumeId = req.params.volumeId;

        const resp = await axios.get(`${GOOGLE_BASE_URL}/volumes/${volumeId}?key=${GOOGLE_API_KEY}`)

        return res.json(resp.data)
    } catch (err) {
        return next(err);
    }
});

/**Get list of NYT current bestseller books 
 *
 * GET route: /books/bestsellers
 *
 * Returns: [{book1}, {book2}, ...]
*/
router.get('/bestsellers', async function (req, res, next) {
    try {
        const resp = await axios.get(`${NYT_BASE_URL}/lists/current/${listName}.json?api-key=${NYT_API_KEY}`);

        const simplifiedData = simplifyBookList(resp.data.results.books);

        return res.json(simplifiedData)
    } catch (err) {
        return next(err);
    }
});

/**From NYT bestsellers list, use isbn to get a detailed book from Google Books API 
 *
 * GET route: /books/bestsellers/details/:isbn
 *
 * Returns: {book}
*/
//Ex. route: 'http://localhost:3001/books/bestsellers/details/9781649374042'
router.get('/bestsellers/details/:isbn', async function (req, res, next) {
    console.debug('isbn:', req.params.isbn)
    try {
        const isbn = req.params.isbn;

        const googleBook = await axios.get(`${GOOGLE_BASE_URL}/volumes?q=isbn:${isbn}&maxResults=40&key=${GOOGLE_API_KEY}`)

        const volumeId = googleBook.data.items[0].id

        const googleBookDetail = await axios.get(`${GOOGLE_BASE_URL}/volumes/${volumeId}?key=${GOOGLE_API_KEY}`)

        return res.json(googleBookDetail.data)
    } catch (err) {
        return next(err);
    }
});

/**Simplify the book list data from Google API and NYT API 
 * 
 * Returns: [{book1}, {book2}, ...]
 */

function simplifyBookList(apiBooks) {
    return apiBooks.map(book => {
        if (book.volumeInfo) {
            return {
                volumeId: book.id,
                title: book.volumeInfo.title || undefined,
                author: book.volumeInfo.authors || undefined,
                description: book.volumeInfo.description || undefined,
                image: book.volumeInfo.imageLinks?.thumbnail || undefined
            }
        } else {
            return {
                isbn: book.isbns[0].isbn13 || undefined,
                title: book.title || undefined,
                author: book.author || undefined,
                description: book.description || undefined,
                image: book.book_image || undefined
            }
        }
    })
};

module.exports = router;
