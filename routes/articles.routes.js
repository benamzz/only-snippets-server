const router = require("express").Router();
const Article = require("../models/Article.model");
const User = require("../models/User.model");
const Snippet = require("../models/Snippet.model");
const mongoose = require("mongoose");
const { isAuthenticated } = require('./../middleware/jwt.middleware.js');

// ARTICLE
//like d'un article
router.put("/:articleId/like", isAuthenticated, (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
        const err = new Error("Article id is not valid")
        err.status = 400
        next(err)
        return;
    }
    Article.findById(req.params.articleId)
        .then((article) => {
            if (!article) {
                const err = new Error('Could not find Article')
                err.status = 404
                next(err)
                return
            }
            User.findById(req.payload._id)
                .then(user => {
                    user.likes.push(req.params.articleId)
                    user.save()
                        .then((response) => {
                            user.password = undefined
                            res.status(200).json(response)
                        })
                        .catch(err => next(err))
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))
});

//unlike d'un article
router.put("/:articleId/unlike", isAuthenticated, (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
        const err = new Error("Article id is not valid")
        err.status = 400
        next(err)
        return;
    }
    Article.findById(req.params.articleId)
        .then((article) => {
            if (!article) {
                const err = new Error('Could not find Article')
                err.status = 404
                next(err)
                return
            }
            User.findByIdAndUpdate(req.payload._id, { $pull: { likes: req.params.articleId } }, { new: true })
                .then(user => res.status(200).json({ userUpdated: user }))
                .catch(err => next(err))
        })
        .catch(err => next(err))
});

//liste des commentaires relatifs a un article
router.get("/:articleId/comments", isAuthenticated, (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
        const err = new Error("Article id is not valid")
        err.status = 400
        next(err)
        return;
    }
    Article.find({ parentId: req.params.articleId })
        .populate("userId")
        .populate("snippet")
        .then(comments => {
            if (comments.length < 1) {
                const err = new Error('Could not find Comments')
                err.status = 404
                next(err)
                return
            }
            comments.map(e => e.userId.password = undefined)
            res.status(200).json(comments)

        })
        .catch(err => next(err))
});

//détails article
router.get("/:articleId", isAuthenticated, (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
        const err = new Error("Article id is not valid")
        err.status = 400
        next(err)
        return;
    }
    Article.findById(req.params.articleId)
        .populate('userId')
        .populate("snippet")
        .then(response => {
            if (!response) {
                const err = new Error('Could not find article')
                err.status = 404
                next(err)
                return
            }
            response.userId.password = undefined
            res.status(200).json(response)
        })
        .catch(err => next(err));
});

//création article
router.post("/", isAuthenticated, (req, res, next) => {
    const { parentId } = req.query;
    Article.create({
        content: req.body.content,
        userId: req.payload._id,
        parentId: parentId,
    })
        .then((articleFromDB => {
            Article.findByIdAndUpdate(parentId, { $push: { comments: articleFromDB._id.toString() } })
                .then(() => res.status(201).json(articleFromDB))
                .catch(err => next(err));
        }))
        .catch(err => next(err));
})

//liste des articles
router.get("/", isAuthenticated, (req, res, next) => {
    const { userId } = req.query
    if (!userId) {
        Article.find()
            .sort({ updatedAt: -1 })
            .populate('userId', "")
            .populate('snippet')
            .then(articles => {
                articles.map(el => el.userId.password = undefined)
                res.status(200).json(articles)
            })
            .catch(err => next(err));
    } else {
        Article.find({ userId: userId })
            .sort({ updatedAt: -1 })
            .populate('userId', "")
            .populate('snippet')
            .then(articles => {
                articles.map(el => el.userId.password = undefined)
                res.status(200).json(articles)
            })
            .catch(err => next(err));
    }

});

//édition article
router.patch("/:articleId", isAuthenticated, (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
        const err = new Error("Article id is not valid")
        err.status = 400
        next(err)
        return;
    }
    Article.findById(req.params.articleId)
        .then((article) => {
            if (!article) {
                const err = new Error('Could not find article')
                err.status = 404
                next(err)
                return
            }
            if (article.userId.toString() !== req.payload._id) {
                const err = new Error('You are not owner of this article')
                err.status = 403
                next(err)
                return
            }
            if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
                const err = new Error("Article id is not valid")
                err.status = 400
                next(err)
                return;
            }
            if (req.body.content?.trim() === "") { req.body.content = undefined }
            Article.findByIdAndUpdate(req.params.articleId, { content: req.body.content }, { new: true })
                .then((response) => { res.status(204).json(response) })
                .catch(err => next(err));
        })
        .catch(err => next(err));
});

// suppression article
router.delete("/:articleId", isAuthenticated, (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
        const err = new Error("Article id is not valid")
        err.status = 400
        next(err)
        return;
    }
    Article.findById(req.params.articleId)
        .then((article) => {
            if (!article) {
                const err = new Error('Could not find Article')
                err.status = 404
                next(err)
                return
            }
            if (article.userId.toString() !== req.payload._id) {
                const err = new Error('You are not owner of this article')
                err.status = 403
                next(err)
                return
            }
            if (article.parentId !== "") {
                Article.findByIdAndUpdate(article.parentId, { $pull: { comments: req.params.articleId } }, { new: true })
                    .then(parentArticle => {
                        parentArticle.save()
                    })
                    .catch(err => next(err))
            }
            article.deletedAt = new Date()
            article.save()
                .then(() => res.status(204).send())
                .catch(err => next(err))
        })
})

//SNIPPET
//création snippet
router.post("/:articleId/snippets", isAuthenticated, (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
        const err = new Error("Article id is not valid")
        err.status = 400
        next(err)
        return;
    }
    Article.findById(req.params.articleId)
        .then((article) => {
            if (!article) {
                const err = new Error('Could not find Article')
                err.status = 404
                next(err)
                return
            }
            Snippet.create({
                content: req.body.snippet,
                userId: req.payload._id,
                articleId: req.params.id,
                tag: req.body.tag
            })
                .then(createdSnippet => {
                    article.snippet = createdSnippet._id
                    article.save()
                    res.status(201).json(createdSnippet)
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))
});

//édition snippet
router.patch("/:articleId/snippets/:snippetId", isAuthenticated, (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
        const err = new Error("Article id is not valid")
        err.status = 400
        next(err)
        return;
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.snippetId)) {
        const err = new Error("Snippet id is not valid")
        err.status = 400
        next(err)
        return;
    }
    Article.findById(req.params.articleId)
        .then((article) => {
            if (!article) {
                const err = new Error('Could not find Article')
                err.status = 404
                next(err)
                return
            }
            Snippet.findById(req.params.snippetId)
                .then((snippet) => {
                    if (!snippet) {
                        const err = new Error('Could not find Snippet')
                        err.status = 404
                        next(err)
                        return
                    }
                    if (snippet.userId.toString() !== req.payload._id) {
                        const err = new Error('You are not owner of this snippet')
                        err.status = 403
                        next(err)
                        return
                    }
                    if (!mongoose.Types.ObjectId.isValid(req.params.snippetId)) {
                        const err = new Error("Snippet id is not valid")
                        err.status = 400
                        next(err)
                        return;
                    }
                    if (req.body.content?.trim() === "") { req.body.content = undefined }
                    else { snippet.content = req.body.content }
                    snippet.tag = req.body.tag
                    snippet.save()
                        .then(response => res.status(200).json(response))
                        .catch(err => next(err))
                })
        })
        .catch((err) => next(err))
})

//détail snippet
router.get("/:articleId/snippets/:snippetId", isAuthenticated, (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
        const err = new Error("Article id is not valid")
        err.status = 400
        next(err)
        return;
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.snippetId)) {
        const err = new Error("Snippet id is not valid")
        err.status = 400
        next(err)
        return;
    }
    Article.findById(req.params.articleId)
        .then((article) => {
            if (!article) {
                const err = new Error('Could not find Article')
                err.status = 404
                next(err)
                return
            }
            Snippet.findById(req.params.snippetId)
                .then(snippet => {
                    if (!snippet) {
                        const err = new Error('Could not find Snippet')
                        err.status = 404
                        next(err)
                        return
                    }
                    res.status(200).json({ snippet: snippet })
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))
});

// suppression snippet
router.delete("/:articleId/snippets/:snippetId", isAuthenticated, (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
        const err = new Error("Article id is not valid")
        err.status = 400
        next(err)
        return;
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.snippetId)) {
        const err = new Error("Snippet id is not valid")
        err.status = 400
        next(err)
        return;
    }
    Article.findById(req.params.articleId)
        .then((article) => {
            if (!article) {
                const err = new Error('Could not find Article')
                err.status = 404
                next(err)
                return
            }
            Snippet.findById(req.params.snippetId)
                .then((snippet) => {
                    if (!snippet) {
                        const err = new Error('Could not find Snippet')
                        err.status = 404
                        next(err)
                        return
                    }
                    if (snippet.userId.toString() !== req.payload._id) {
                        const err = new Error('You are not owner of this snippet')
                        err.status = 403
                        next(err)
                        return
                    }
                    Snippet.findByIdAndRemove(req.params.snippetId)
                        .then(() => res.status(204).send())
                        .catch(err => next(err))
                })
        })
        .catch(err => next(err))
})

module.exports = router;