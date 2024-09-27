"use strict";

const express = require('express');
const cors = require('cors');
//middleware that logs information about requests
const morgan = require('morgan');

const { NotFoundError } = require('./expressError')



const app = express();

app.use(cors());
app.use(express.json());

app.use(morgan('tiny'));


/** Handles 404 Not Found errors */
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
