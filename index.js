/**
* index.js
* This is your main app entry point
*/

// Set up express, bodyparser and EJS
const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); // set the app to use ejs for rendering
app.use(express.static(__dirname + '/public')); // set location of static files

// Set up SQLite
// Items in the global namespace are accessible throught out the node application
const sqlite3 = require('sqlite3').verbose();
global.db = new sqlite3.Database('./database.db',function(err){
    if(err){
        console.error(err);
        process.exit(1); // bail out we can't connect to the DB
    } else {
        console.log("Database connected");
        global.db.run("PRAGMA foreign_keys=ON"); // tell SQLite to pay attention to foreign key constraints
    }
});


// Use session middleware
app.use(session({
    secret: 'clemente_ki', // Replace with a strong unique key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true if using HTTPS
}));

// Handle requests to login page 
app.get('/', (req, res) => {
    res.render('login'); // render the home_page.ejs file
});
// Handle requests to the home page
app.get('/home_page', (req, res) => {
    res.render('home_page'); // render the home_page.ejs file
});

// Handle requests to the about page

const authorRoutes = require('./routes/authors');
app.use('/authors', authorRoutes);

const readerRoutes = require('./routes/readers');
app.use('/readers', readerRoutes);

const userRoutes = require('./routes/users');
app.use('/users', userRoutes);



// Make the web application listen for HTTP requests
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

