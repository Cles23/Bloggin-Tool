/**
 * users.js
 * These are example routes for user management
 * This shows how to correctly structure your routes for the project
 * and the suggested pattern for retrieving data by executing queries
 *
 * NB. it's better NOT to use arrow functions for callbacks with the SQLite library
* 
 */

const express = require("express");
const bcrypt = require('bcryptjs');
const router = express.Router();


/**
 * @desc Displays a page with a form for creating a user record
 */
router.get("/signup", (req, res) => {
    res.render('signup.ejs');
});

/**
 * @desc Add a new user to the database based on data from the submitted form
 */
router.post('/signup', async (req, res) => {
    const { user_name, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 8);

    global.db.run("INSERT INTO users (user_name, hashed_password) VALUES (?, ?)", [user_name, hashedPassword], function(err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }

        const userId = this.lastID;

        global.db.run("INSERT INTO blog (blog_title, author_name, author_id) VALUES (?, ?, ?)", [`Blog of ${user_name}`, user_name, userId], function(err) {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            res.redirect(`/`);
        });
    });
})

router.post('/login', async (req, res) => {
    const {user_name, password } = req.body;
    global.db.get("SELECT * FROM users WHERE user_name = ?", [user_name], async (err, user) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        if (!user || !(await bcrypt.compare(password, user.hashed_password))) {
            return res.render('login', { error: "Invalid credentials" });
        }

        req.session.user = { user_id: user.user_id, user_name: user.user_name };
        res.render('home_page');
    });
})

router.get("/logout", (req, res) => {
    req.session.user = undefined;
    res.render('login');
});

/**
 * @desc Display all the users
 */
router.get("/list-users", (req, res, next) => {
    // Define the query
    query = "SELECT * FROM users"

    // Execute the query and render the page with the results
    global.db.all(query, 
        function (err, rows) {
            if (err) {
                next(err); //send the error on to the error handler
            } else {
                res.json(rows); // render page as simple json
            }
        }
    );
});

// Export the router object so index.js can access it
module.exports = router;
