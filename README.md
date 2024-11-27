# BookMarker App
Live Demo: [bookmarker-tbif.onrender.com](https://bookmarker-tbif.onrender.com)
![image](https://github.com/user-attachments/assets/3436c062-7987-49b7-8877-8e00b9653e1d)

BookMarker is a book search web application where users can search for a plethora of books to read. It utilizes book data from the Google Books API and NYT Books API allowing for an extensive search and a variety of books to explore.

# Key Features
* Responsive website
* Search for books using the regular search bar or advanced search bar
* Save your books in your 'Read' or 'Wish To Read' lists
* Write, edit, or delete a review
* Option to see all reviews on a book
* Add a star rating on a book

# Tech Stack
* Database: PostgreSQL
* Backend: Express.js, Node.js, pg(node-postgres)
* Frontend: React, Material UI
* API: Google Books API, New York Times Books API

# Repositories
* Backend: https://github.com/lc1715/BookMarker-Backend
* Frontend: https://github.com/lc1715/BookMarker-Frontend

# Setup the Backend
 1. Clone the project into a local directory
   ```
   git clone https://github.com/lc1715/BookMarker-Backend.git
   ```
 2. Install dependencies
   ```
   npm install
   ```
 3. Create the database in PostgreSQL
   ```
   createdb bookmarker_db
   ```
 4. Load tables into the database by using existing SQL file
   ```
   psql < bookmarker.sql
   ```
5. Start the server
  ```
  nodemon server.js
  ```
# Setup the Frontend

 1. Clone the project into a local directory
   ```
   https://github.com/lc1715/BookMarker-Frontend.git
   ```
 2. Install dependencies
   ```
   npm install
   ```
 3. Start the React app
   ```
   npm run dev
   ```
# Testing
**Running backend tests**
 1. Navigate to backend directory
   ```
   cd BookMarker-Backend
   ```
 2. Run tests
   ```
   jest -i
   ```
**Running frontend tests**
  1. Navigate to frontend directory
   ```
   cd BookMarker-Frontend
   ```
  2. Run tests
   ```
   npm test
   ```
