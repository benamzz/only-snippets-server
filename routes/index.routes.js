const router = require("express").Router();
const Article = require("../models/Article.model");
const User = require("../models/User.model");
const Snippet = require("../models/Snippet.model");
const mongoose = require("mongoose");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// function isOwner(id){
//   Model.findById(id)
//   .then((model)=>{
//     if(model.userId===req.payload.id){
//       //ok
//     }else{
//       //pas ok
//     }
//   })
//   .catch()
// }

//détails user
router.get("/users/:userId", (req, res, next) => {
  User.findById(req.params.userId)
    .then(response => res.status(200).json({ user: response }))
    .catch(err => next(err));
});

//édition user
router.patch("/users/:userId", (req, res, next) => {
  User.findById(req.params.userId)
    .then((userFromDB) => {
      if (userFromDB._id.toString() !== req.payload._id) {
        const err = new Error('You are not owner of this profile')
        err.status = 403
        next(err)
        return
      }
      if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
        const err = new Error("User id is not valid")
        err.status = 400
        next(err)
        return;
      }
      User.findByIdAndUpdate(req.params.userId, req.body, { new: true })
        .then(response => res.status(200).json({ userUpdated: response }))
        .catch(err => next(err));
    })
    .catch(err => next(err))
})

//création article
router.post("/articles", (req, res, next) => {
  const { parentId } = req.query;
  Article.create({
    content: req.body.content,
    tag: req.body.tag,
    userId: req.payload._id,
    parentId: parentId,
  })
    .then((articleFromDB => {
      Article.findByIdAndUpdate(parentId, { $push: { comments: articleFromDB._id.toString() } })
        .then(() => res.status(201).json(articleFromDB))
        .catch(err => next(err));
    }))
    .catch(err => next(err))
})

// les lignes 35-40 reviennent à faire:
// Article.findById(parentId)
//   .then(parentArticleFromDB => {
//     parentArticleFromDB.comments.push(articleFromDB._id)
//     parentArticleFromDB.save()
//       .then()
//       .catch()
//   })
//   .catch()

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

// function isOwner(Model, paramName, idfield) {
//   return function(req, res, next) {
//     Model.find(req.params[paramName]).then(function (docFromDB) {
//       if(docFromDB[idfield] !== req.payload._id){
//         res.status(403).json({message:"You are not owner of this "+Model.name})
//         return
//       }

//       next()

//     })
//   }
// }

//édition article
router.patch("/articles/:articleId", (req, res, next) => {
  Article.findById(req.params.articleId)
    .then((article) => {
      console.log("article.userId:", article.userId.toString())
      console.log("req.payload._id:", req.payload._id)
      console.log("req.params", req.params)
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
      Article.findByIdAndUpdate(req.params.articleId, req.body, { new: true })
        .then(response => res.status(200).json({ articleUpdated: response }))
        .catch(err => next(err))
    })
    .catch(err => next(err))
});

//création snippet
router.post("/articles/:articleId/snippets", (req, res, next) => {
  Snippet.create({
    content: req.body.content,
    userId: req.payload._id,
    articleId: req.params.id,
  })
    .then(snippetFromDB => res.status(201).json(snippetFromDB))
    .catch(err => next(err))
});

//édition snippet
router.patch("/articles/:articleId/snippets/:snippetId", (req, res, next) => {
  Snippet.findById(req.params.snippetId)
    .then((snippet) => {
      console.log("snippet.userId:", snippet.userId.toString())
      console.log("req.payload._id:", req.payload._id)
      console.log("req.params", req.params)
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
      Snippet.findByIdAndUpdate(req.params.snippetId, req.body, { new: true })
        .then(response => res.status(200).json({ snippetUpdated: response }))
        .catch(err => next(err))
    })
})

//détail snippet
router.get("/articles/:articleId/snippets/:snippetId", (req, res, next) => {
  Snippet.findById(req.params.snippetId)
    .then(response => res.status(200).json({ snippet: response }))
    .catch(err => next(err))
});

// suppression snippet
router.delete("/articles/:articleId/snippets/:snippetId", (req, res, next) => {
  Snippet.findById(req.params.snippetId)
    .then((snippet) => {
      console.log("snippet.userId:", snippet.userId.toString())
      console.log("req.payload._id:", req.payload._id)
      console.log("req.params", req.params)
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

// suppression article
router.delete("/articles/:articleId", (req, res, next) => {
  Article.findById(req.params.articleId)
    .then((article) => {
      console.log("article.userId:", article.userId.toString())
      console.log("req.payload._id:", req.payload._id)
      console.log("req.params", req.params)
      if (article.userId.toString() !== req.payload._id) {
        const err = new Error('You are not owner of this article')
        err.status = 403
        next(err)
        return
      }
      Article.findByIdAndRemove(req.params.articleId)
        .then(() => res.status(204).send())
        .catch(err => next(err))
    })
})

//like d'un article
router.put("/articles/:articleId/like", (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params)) {
    const err = new Error("Specified id is not valid")
    err.status = 400
    next(err)
    return;
  }
  User.findByIdAndUpdate(req.payload._id, { likes: req.params.articleId }, { new: true })
    .then(response => res.status(200).json({ userUpdated: response }))
    .catch(err => next(err))
});

// follow d'un user
router.put("/users/:userId/follow", (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params)) {
    const err = new Error("Specified id is not valid")
    err.status = 400
    next(err)
    return;
  }
  User.findByIdAndUpdate(req.payload._id, { following: req.params.userId }, { new: true })
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
