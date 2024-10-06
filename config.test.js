"use strict";

afterAll(() => {
    process.env.NODE_ENV = 'production'
})

describe('config can come from env', function () {
    beforeEach(() => {
        jest.resetModules();
        process.env.NODE_ENV = 'production'
    })

    test('works in production environment', function () {
        process.env.NODE_ENV = 'production';
        process.env.DATABASE_URL = 'other';
        process.env.PORT = "5000";

        const config = require('./config')
        console.log('config***', config)
        expect(config.PORT).toEqual(5000);
        expect(config.BCRYPT_WORK_FACTOR).toEqual(12)
        expect(config.getDatabaseUri()).toEqual('other');

        delete process.env.PORT
        delete process.env.NODE_ENV
        delete process.env.DATABASE_URL
    });

    test('works in test environment', function () {
        process.env.NODE_ENV = 'test';

        const config2 = require('./config')
        console.log('config2***', config2)
        expect(config2.PORT).toEqual(3001);
        expect(config2.BCRYPT_WORK_FACTOR).toEqual(1);
        expect(config2.getDatabaseUri()).toEqual('postgresql:///bookmarker_db_test');
    });

    test('works when DATABASE_URL and PORT is not defined', function () {
        process.env.NODE_ENV = 'production';
        const config3 = require('./config')

        expect(config3.PORT).toEqual(3001);
        expect(config3.BCRYPT_WORK_FACTOR).toEqual(12)
        expect(config3.getDatabaseUri()).toEqual('postgresql:///bookmarker_db');
    });
});