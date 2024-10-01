"use strict";

/** dependencies */
const express = require('express');
const cors = require('cors');
//middleware that log information about requests
const morgan = require('morgan');

/** errors */
const { NotFoundError } = require('./expressError')
/** middleware */
const { authenticateJWT } = require('./middleware/auth')

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use(authenticateJWT);

/** Routes */
const usersRoutes = require('./routes/users');
const savedBooksRoutes = require('./routes/savedbooks');
const reviewsRoutes = require('./routes/reviews')
const ratingsRoutes = require('./routes/ratings')

app.use('/users', usersRoutes);
app.use('/savedbooks', savedBooksRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/ratings', ratingsRoutes);


/** Handle 404 errors */
app.use(function (req, res, next) {
    return next(new NotFoundError());
})

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack)

    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: { message, status }
    });
})

module.exports = app;
