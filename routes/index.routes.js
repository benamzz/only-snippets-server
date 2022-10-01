const router = require("express").Router();
const Article = require("../models/Article.model")
const User = require("../models/User.model")
const Snippet = require("../models/Snippet.model")
const mongoose = require("mongoose")

router.post('/articles', (req, res, next) =>{
  console.log("HELLO REQ = ",req.payload._id)
  Article.create({content: req.body.content, tag: req.body.tag, userId: req.payload._id})
    .then(function (articleFromDB) {
      console.log("Article created : ",articleFromDB)
      res.status(201).json(articleFromDB) // 201 Created
    })
    .catch(function (err) {
      console.log("Error creating article : ", err)
      next(err) // middleware d'erreur
    })
})

router.get("/articles/:id", (req, res, next) => {
  console.log("req.params : ", req.params)
  Article.findById(req.params.id)
  .then((response) => {
    console.log("article = ", response)
    res.status(200).json({article :response})
    
  })
  .catch((error) => console.log("Error finding article : ", error))
});

router.get("/articles", (req, res, next) => {
  Article.find()
  .then((response) => {
    console.log("articles = ", response)
    res.status(200).json({articles:response})
    
  })
  .catch((error) => console.log("Error finding articles : ", error))
});

router.patch("/articles/:id", (req, res, next) => {
  console.log("req.params : ", req.params)

  if (!mongoose.Types.ObjectId.isValid(req.params)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Article.findByIdAndUpdate(req.params.id, req.body, {new: true})
  .then((response) => {
    console.log("article = ", response)
    res.status(200).json({articleUpdated :response})
    
  })
  .catch((error) => console.log("Error updating article : ", error))
});

router.get("/users/:id", (req, res, next) => {
  console.log("req.params : ", req.params)
  User.findById(req.params.id)
  .then((response) => {
    console.log("article = ", response)
    res.status(200).json({user :response})
    
  })
  .catch((error) => console.log("Error finding user : ", error))
});

router.patch("/users/:id", (req, res, next) => {
  console.log("req.params : ", req.params)

  if (!mongoose.Types.ObjectId.isValid(req.params)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  User.findByIdAndUpdate(req.params.id, req.body, {new: true})
  .then((response) => {
    console.log("user = ", response)
    res.status(200).json({userUpdated :response})
    
  })
  .catch((error) => console.log("Error updating user : ", error))
});

router.post('/articles/:id/snippets', (req, res, next) =>{
  console.log("PostId = ", req.params.id)
  Snippet.create({content: req.body.content, userId: req.payload._id, articleId: req.params.id})
    .then(function (snippetFromDB) {
      console.log("Snippet created : ",snippetFromDB)
      res.status(201).json(snippetFromDB) // 201 Created
    })
    .catch(function (err) {
      console.log("Error creating snippet : ", err)
      next(err) // middleware d'erreur
    })
})

router.patch("/articles/:articleId/snippets/:snippetId", (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.snippetId)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Snippet.findByIdAndUpdate(req.params.snippetId, req.body, {new: true})
  .then((response) => {
    console.log("snippet = ", response)
    res.status(200).json({snippetUpdated :response})
    
  })
  .catch((error) => console.log("Error updating snippet : ", error))
});

module.exports = router;
