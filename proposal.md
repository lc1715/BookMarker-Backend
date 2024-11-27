# Proposal
1. What tech stack will you use for your final project? We recommend that you use
React and Node for this project, however if you are extremely interested in
becoming a Python developer you are welcome to use Python/Flask for this
project.
    - Node.js, React.js, Express.js, PostgreSQL
    <br>
2. Is the front-end UI or the back-end going to be the focus of your project? Or are
you going to make an evenly focused full-stack application?
	  - The project will be an evenly focused full-stack application.
	  <br>
3. Will this be a website? A mobile app? Something else?
	  - This will be a Web App.
	  <br>
4. What goal will your project be designed to achieve?
	 - To help users save books that they’ve read, wish to read, and find books that they may like to read.
    <br>
5. What kind of users will visit your app? In other words, what is the demographic of
your users? 
	  - Users that like to read or are curious about books. General age range is around 15 - 70 years olds.
    <br>
6. What data do you plan on using? How are you planning on collecting your data?
You may have not picked your actual API yet, which is fine, just outline what kind
of data you would like it to contain. You are welcome to create your own API and
populate it with data. If you are using a Python/Flask stack are required to create
your own API.
    - I plan to use and collect data from the Google Books API and The New York Times Books API.
    <br>
7. In brief, outline your approach to creating your project (knowing that you may not
know everything in advance and that these details might change later). Answer
questions like the ones below, but feel free to add more information:
	  - What does your database schema look like?
    <img src="https://github.com/user-attachments/assets/c71d9f6a-7622-493d-88b5-a19f2771a304" width="450" />    

   - What kinds of issues might you run into with your API? This is especially
    important if you are creating your own API, web scraping produces
    notoriously messy data.
      - A potential issue is if the API is down
   - Is there any sensitive information you need to secure?
     - User’s password
   - What functionality will your app include?
     - Search for a book
     - Mark books that a user has read or wish to read
     - Comment on a book
     - Rate a book
   - What will the user flow look like?
     - Homepage will show the search bar and bestseller books which are updated weekly
     - Users can search for books and save books that they have "Read" or "Wish to Read"
     - Users will be able to write a review on a book, and view all reviews on a book
     - Users can provide their own rating on a book
     - If user is not logged in, user will be asked to log in or sign up
    - What features make your site more than a CRUD app? What are your
      stretch goals?
      - On book search, implement filter/sort options
