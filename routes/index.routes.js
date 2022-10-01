const router = require("express").Router();
const Article = require("../models/Article.model");
const User = require("../models/User.model");
const Snippet = require("../models/Snippet.model");
const mongoose = require("mongoose");

router.post("/articles", (req, res, next) => {
  const { parentId } = req.query;

  console.log("HELLO REQ = ", req.payload._id);
  Article.create({
    content: req.body.content,
    tag: req.body.tag,
    userId: req.payload._id,
    parentId: parentId,
  })
    .then(function (articleFromDB) {
      console.log("Article created : ", articleFromDB);

      // Article.findById(parentId)
      //   .then(parentArticleFromDB => {
      //     parentArticleFromDB.comments.push(articleFromDB._id)
      //     parentArticleFromDB.save()
      //       .then()
      //       .catch()
      //   })
      //   .catch()

      Article.findByIdAndUpdate(parentId, {
        $push:{comments:articleFromDB._id.toString()},
      })
        .then(function () {
          res.status(201).json(articleFromDB); // 201 Created
        })
        .catch(function (err) {
          // console.log("Error creating comment : ", err);
          next(err);
        });
    })
    .catch(function (err) {
      // console.log("Error creating article : ", err);
      next(err); // middleware d'erreur
    });
});

router.get("/articles/:id", (req, res, next) => {
  console.log("req.params : ", req.params);
  Article.findById(req.params.id)
    .then((response) => {
      console.log("article = ", response);
      res.status(200).json({ article: response });
    })
    .catch((error) => console.log("Error finding article : ", error));
});

router.get("/articles", (req, res, next) => {
  Article.find()
    .then((response) => {
      console.log("articles = ", response);
      res.status(200).json({ articles: response });
    })
    .catch((error) => console.log("Error finding articles : ", error));
});

router.patch("/articles/:id", (req, res, next) => {
  console.log("req.params : ", req.params);

  if (!mongoose.Types.ObjectId.isValid(req.params)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Article.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((response) => {
      console.log("article = ", response);
      res.status(200).json({ articleUpdated: response });
    })
    .catch((error) => console.log("Error updating article : ", error));
});

router.get("/users/:id", (req, res, next) => {
  console.log("req.params : ", req.params);
  User.findById(req.params.id)
    .then((response) => {
      console.log("article = ", response);
      res.status(200).json({ user: response });
    })
    .catch((error) => console.log("Error finding user : ", error));
});

router.patch("/users/:id", (req, res, next) => {
  console.log("req.params : ", req.params);

  if (!mongoose.Types.ObjectId.isValid(req.params)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((response) => {
      console.log("user = ", response);
      res.status(200).json({ userUpdated: response });
    })
    .catch((error) => console.log("Error updating user : ", error));
});

router.post("/articles/:id/snippets", (req, res, next) => {
  console.log("PostId = ", req.params.id);
  Snippet.create({
    content: req.body.content,
    userId: req.payload._id,
    articleId: req.params.id,
  })
    .then(function (snippetFromDB) {
      console.log("Snippet created : ", snippetFromDB);
      res.status(201).json(snippetFromDB); // 201 Created
    })
    .catch(function (err) {
      console.log("Error creating snippet : ", err);
      next(err); // middleware d'erreur
    });
});

router.patch("/articles/:articleId/snippets/:snippetId", (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.snippetId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Snippet.findByIdAndUpdate(req.params.snippetId, req.body, { new: true })
    .then((response) => {
      console.log("snippet = ", response);
      res.status(200).json({ snippetUpdated: response });
    })
    .catch((error) => console.log("Error updating snippet : ", error));
});

router.get("/articles/:articleId/snippets/:snippetId", (req, res, next) => {
  Snippet.findById(req.params.snippetId)
    .then((response) => {
      console.log("snippet = ", response);
      res.status(200).json({ snippet: response });
    })
    .catch((error) => console.log("Error finding snippet : ", error));
});

// suppression snippet
router.delete("/articles/:articleId/snippets/:snippetId", (req, res, next) => {
  Snippet.findByIdAndRemove(req.params.snippetId)
    .then((response) => {
      // console.log("snippet = ", response)
      res.status(204).send();
    })
    .catch((error) => console.log("Error removing snippet : ", error));
});

// suppression article
router.delete("/articles/:articleId", (req, res, next) => {
  Article.findByIdAndRemove(req.params.articleId)
    .then((response) => {
      res.status(204).send();
    })
    .catch((error) => console.log("Error removing article : ", error));
});

//LIKES
router.put("/articles/:articleId/like", (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  User.findByIdAndUpdate(
    req.payload._id,
    { likes: req.params.articleId },
    { new: true }
  )
    .then((response) => {
      res.status(200).json({ userUpdated: response });
    })
    .catch((error) => console.log("Error updating user's likes : ", error));
});

// followers
router.put("/users/:userId/follow", (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  User.findByIdAndUpdate(
    req.payload._id,
    { following: req.params.userId },
    { new: true }
  )
    .then((response) => {
      res.status(200).json({ userUpdatedFollows: response });
    })
    .catch((error) => console.log("Error updating user's follows : ", error));
});

router.get("/articles/:articleId/comments", (req, res, next) => {
  Article.find({ parentId: req.params.articleId })
    .then((response) => {
      console.log("comments = ", response);
      res.status(200).json({ comments: response });
    })
    .catch((error) => console.log("Error finding comments : ", error));
});

module.exports = router;
