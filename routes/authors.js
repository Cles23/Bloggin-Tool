const express = require('express');
const router = express.Router();

// Route for Author Home Page
router.get('/', (req, res) => {
    if (req.session.user) {
        // Logic to get all the articles written by the author, including the like counts
        global.db.all(`
            SELECT 
                articles.*, 
                (SELECT COUNT(*) FROM likes WHERE likes.article_id = articles.id) AS likes 
            FROM articles 
            WHERE articles.author_id = ?
        `, [req.session.user.user_id], (err, articles) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            let drafts = articles.filter(article => article.published_at === null);
            let published = articles.filter(article => article.published_at !== null);
    
            // Get blog title and author's name directly from the blog table
            global.db.get('SELECT blog_title, author_name FROM blog WHERE id = ?', [req.session.user.user_id], (err, blog) => { // Assuming id = 1 for the demo
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
    
                res.render('author_home', {
                    drafts,
                    published,
                    blog
                });
            });
        });
    } else {
      res.redirect('/users/login');
    }
});

// Other routes remain the same...

// Route to create a new draft article
router.post('/new', (req, res) => {
    // Logic to create a new draft article
    global.db.run('INSERT INTO articles (title, content, author_id) VALUES (?, ?, ?)', ['New Article', '', 1], function(err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        const newArticleId = this.lastID; // Get the ID of the newly created article
        res.redirect(`/authors/edit/${newArticleId}`); // Redirect to the edit page of the new article
    });
});

// Route to edit an article
router.get('/edit/:id', (req, res) => {
    const { id } = req.params;
    global.db.get('SELECT * FROM articles WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.render('edit_article', {
            article: row
        });
    });
});

// Route to update an article
router.post('/edit/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    global.db.run('UPDATE articles SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [title, content, id], function(err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.redirect('/authors');
    });
});

// Route to delete an article
router.post('/delete/:id', (req, res) => {
    const { id } = req.params;
    global.db.run('DELETE FROM articles WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.redirect('/authors');
    });
});

// Route to publish an article
router.post('/publish/:id', (req, res) => {
    const { id } = req.params;
    global.db.run('UPDATE articles SET published_at = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.redirect('/authors');
    });
});

// Route to render settings page
router.get('/settings_page', (req, res) => {
    global.db.get('SELECT blog_title, author_name FROM blog WHERE id = 1', (err, blog) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.render('settings_page', {
            blog
        });
    });
});

// Route to handle settings form submission
router.post('/settings_page', (req, res) => {
    const { blog_title, author_name } = req.body;
    global.db.run('UPDATE blog SET blog_title = ?, author_name = ? WHERE id = 1', [blog_title, author_name], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.redirect('/authors');
    });
});

module.exports = router;
