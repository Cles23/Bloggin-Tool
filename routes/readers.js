const express = require('express');
const router = express.Router();

// Route for Reader Home Page
router.get('/', (req, res) => {
    global.db.all(`
        SELECT * FROM blog
        WHERE EXISTS (
            SELECT 1 FROM articles
            WHERE articles.author_id = blog.author_id
            AND articles.published_at IS NOT NULL
        )
    `, (err, blogs) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        let blogsWithArticles = [];
        let remaining = blogs.length;

        if (remaining === 0) {
            res.render('reader_home', { blogs: [] });
            return;
        }

        blogs.forEach((blog, index) => {
            global.db.all('SELECT * FROM articles WHERE author_id = ? AND published_at IS NOT NULL ORDER BY published_at DESC', [blog.author_id], (err, articles) => {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }

                blogsWithArticles.push({
                    blog_title: blog.blog_title,
                    author_name: blog.author_name,
                    articles: articles
                });

                remaining--;

                if (remaining === 0) {
                    res.render('reader_home', { blogs: blogsWithArticles });
                }
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
        global.db.get('SELECT blog_title, author_name FROM blog WHERE id = ?', [article.author_id], (err, blog) => {
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
                        comments,
                        author: blog.author_name
                    });
                });
            });
        });
    });
});

router.post('/article/:id/like', (req, res) => {
    if (req.session.user) {
        const { id } = req.params;
        const userId = req.session.user.user_id;

        // Check if the user already liked the article
        global.db.get('SELECT * FROM likes WHERE article_id = ? AND user_id = ?', [id, userId], (err, row) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }

            if (row) {
                // User has already liked the article, so remove the like
                global.db.run('DELETE FROM likes WHERE article_id = ? AND user_id = ?', [id, userId], function(err) {
                    if (err) {
                        res.status(400).json({ "error": err.message });
                        return;
                    }
                    res.redirect(`/readers/article/${id}`);
                });
            } else {
                // User has not liked the article yet, so add the like
                global.db.run('INSERT INTO likes (article_id, user_id) VALUES (?, ?)', [id, userId], function(err) {
                    if (err) {
                        res.status(400).json({ "error": err.message });
                        return;
                    }
                    
                    res.redirect(`/readers/article/${id}`);
                });
            }
        });
    } else {
        res.redirect('/');
    }
});
// Route to handle commenting on an article
router.post('/article/:id/comment', (req, res) => {
    if (req.session.user) {
        const { id } = req.params;
        const { comment } = req.body;
        const user_name = 'DefaulUser'; // Assuming user_name = 'DefaulUser' for the demo
        global.db.run('INSERT INTO comments (article_id, user_name, comment) VALUES (?, ?, ?)', [id, req.session.user.user_name, comment], function(err) {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            res.redirect(`/readers/article/${id}`);
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;
