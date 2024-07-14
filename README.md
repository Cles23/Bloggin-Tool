# Midterm Project - Blog Application

Welcome to the Blog Application! This project showcases a simple yet powerful blog platform where users can sign up, create and manage blogs, write articles, and interact with other users through comments and likes.

## Features

- **User Authentication**: Secure signup and login functionality with hashed passwords.
- **Blog Management**: Users can create and manage their blogs.
- **Article Management**: Users can draft, publish, edit, and delete articles.
- **Interactivity**: Readers can like articles and leave comments.
- **Session Management**: Users remain logged in using express-session.

## Installation

To get started with this project, follow these steps:

1. **Install dependencies**:
   npm install

2. **Build Database**:
npm run build-db / build-db-win if nn windows

3. **Start the application**
npm run start

Access the app at http://localhost:3000.

## **Routes**
- Home: http://localhost:3000
- List Users: http://localhost:3000/users/list-users
- Add User: http://localhost:3000/users/add-user

## *Database Management**
- To delete and rebuild the database:
    - npm run clean-db / clean-db-win if on windows
    - npm run build-db / clean-db-win if on windows