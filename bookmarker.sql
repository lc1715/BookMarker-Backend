
DROP DATABASE bookmarker_db;
CREATE DATABASE bookmarker_db;
\connect bookmarker_db

\i bookmarker-schema.sql

DROP DATABASE bookmarker_db_test;
CREATE DATABASE bookmarker_db_test;
\connect bookmarker_db_test

\i bookmarker-schema.sql

