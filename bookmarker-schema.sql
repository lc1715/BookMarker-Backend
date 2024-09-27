CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL 
      CHECK (position('@' IN email) > 1),
    created_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE saved_books (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    volume_id INTEGER UNIQUE NOT NULL,
    title TEXT NOT NULL,
    author TEXT,
    publisher TEXT,
    category TEXT,
    description TEXT,
    image TEXT,
    has_read BOOLEAN NOT NULL
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    saved_books_id INTEGER NOT NULL REFERENCES saved_books ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    comment TEXT NOT NULL,
    volume_id INTEGER UNIQUE NOT NULL,
    created_at DATE DEFAULT CURRENT_DATE
);

