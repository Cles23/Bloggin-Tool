const express = require('express');
const router = express.Router();

// Route for Reader Home Page
router.get('/', (req, res) => {
    global.db.all('SELECT * FROM articles WHERE published_at IS NOT NULL ORDER BY published_at DESC', (err, articles) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        global.db.get('SELECT blog_title, author_name FROM blog WHERE id = 1', (err, blog) => { // Assuming id = 1 for the demo
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }

            res.render('reader_home', {
                articles,
                blog
            });
        });
    });
});

// Route for Reader Article Page
router.get('/article/:id', (req, res) => {
    const { id } = req.params;

    global.db.get('SELECT * FROM articles WHERE id = ?', [id], (err, article) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        global.db.get('SELECT COUNT(*) as likes FROM likes WHERE article_id = ?', [id], (err, likeData) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }

            global.db.all('SELECT * FROM comments WHERE article_id = ? ORDER BY created_at DESC', [id], (err, comments) => {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }

                res.render('article_page', {
                    article,
                    likes: likeData.likes,
                    comments
                });
            });
        });
        
    });
});

// Route to handle liking an article
router.post('/article/:id/like', (req, res) => {
    const { id } = req.params;
    global.db.run('INSERT INTO likes (article_id, user_id) VALUES (?, ?)', [id, 1], function(err) { // Assuming user_id = 1 for the demo
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.redirect(`/readers/article/${id}`);
    });
});

// Route to handle commenting on an article
router.post('/article/:id/comment', (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    const user_name = 'DefaulUser'; // Assuming user_name = 'DefaulUser' for the demo
    global.db.run('INSERT INTO comments (article_id, user_name, comment) VALUES (?, ?, ?)', [id, user_name, comment], function(err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.redirect(`/readers/article/${id}`);
    });
});

module.exports = router;
