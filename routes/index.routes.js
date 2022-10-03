const router = require("express").Router();
const Article = require("../models/Article.model");
const User = require("../models/User.model");
const Snippet = require("../models/Snippet.model");
const mongoose = require("mongoose");

//détails user
router.get("/users/:userId", (req, res, next) => {
  User.findById(req.params.userId)
    .then(response => res.status(200).json({ user: response }))
    .catch(err => next(err));
});

//édition user
router.patch("/users/:userId", (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }
  User.findByIdAndUpdate(req.params.userId, req.body, { new: true })
    .then(response => res.status(200).json({ userUpdated: response }))
    .catch(err => next(err));
});

//création article
router.post("/articles", (req, res, next) => {
  const { parentId } = req.query;
  Article.create({
    content: req.body.content,
    tag: req.body.tag,
    userId: req.payload._id,
    parentId: parentId,
  })
    .then(function (articleFromDB) {
      console.log("Article created : ", articleFromDB);
      Article.findByIdAndUpdate(parentId, {
        $push: { comments: articleFromDB._id.toString() },
      })
        // la ligne ci dessus est équivalente à:
        // Article.findById(parentId)
        //   .then(parentArticleFromDB => {
        //     parentArticleFromDB.comments.push(articleFromDB._id)
        //     parentArticleFromDB.save()
        //       .then()
        //       .catch()
        //   })
        //   .catch()
        .then(() => res.status(201).json(articleFromDB))
        .catch(err => next(err));
    })
    .catch(err => next(err));
});

//détails article
router.get("/articles/:articleId", (req, res, next) => {
  Article.findById(req.params.articleId)
    .then(response => res.status(200).json({ article: response }))
    .catch(err => next(err))
});

//liste des articles
router.get("/articles", (req, res, next) => {
  Article.find()
    .then(response => res.status(200).json({ articles: response }))
    .catch(err => next(err))
});

//édition article
router.patch("/articles/:articleId", (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }
  Article.findByIdAndUpdate(req.params.articleId, req.body, { new: true })
    .then(response => res.status(200).json({ articleUpdated: response }))
    .catch(err => next(err))
});

//création snippet
router.post("/articles/:articleId/snippets", (req, res, next) => {
  Snippet.create({
    content: req.body.content,
    userId: req.payload._id,
    articleId: req.params.id,
  })
    .then(snippetFromDB=>res.status(201).json(snippetFromDB))
    .catch(err => next(err))
});

//édition snippet
router.patch("/articles/:articleId/snippets/:snippetId", (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.snippetId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }
  Snippet.findByIdAndUpdate(req.params.snippetId, req.body, { new: true })
    .then(response => res.status(200).json({ snippetUpdated: response }))
    .catch(err => next(err))
});

//détail snippet
router.get("/articles/:articleId/snippets/:snippetId", (req, res, next) => {
  Snippet.findById(req.params.snippetId)
    .then(response => res.status(200).json({ snippet: response }))
    .catch(err => next(err))
});

// suppression snippet
router.delete("/articles/:articleId/snippets/:snippetId", (req, res, next) => {
  Snippet.findByIdAndRemove(req.params.snippetId)
    .then(()=>res.status(204).send())
    .catch(err => next(err))
});

// suppression article
router.delete("/articles/:articleId", (req, res, next) => {
  Article.findByIdAndRemove(req.params.articleId)
    .then(() => res.status(204).send())
    .catch(err => next(err))
});

//like d'un article
router.put("/articles/:articleId/like", (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }
  User.findByIdAndUpdate(req.payload._id,{likes: req.params.articleId},{new: true})
    .then(response => res.status(200).json({ userUpdated: response }))
    .catch(err => next(err))
});

// follow d'un user
router.put("/users/:userId/follow", (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }
  User.findByIdAndUpdate(req.payload._id,{following: req.params.userId},{new: true})
    .then(response => res.status(200).json({ userUpdatedFollows: response }))
    .catch(err => next(err))
});

//liste des commentaires relatifs a un article
router.get("/articles/:articleId/comments", (req, res, next) => {
  Article.find({ parentId: req.params.articleId })
    .then(response => res.status(200).json({ comments: response }))
    .catch(err => next(err))
});

module.exports = router;
