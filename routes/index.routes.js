const router = require("express").Router();
const Articles = require("../models/Article.model")

router.post('/articles', function (req, res, next) {
  Project.create({content: req.body.content, tag: req.body.tag,})
    .then(function (articleFromDB) {
      res.status(201).json(articleFromDB) // 201 Created
    })
    .catch(function (err) {
      console.log(err)
      next(err) // middleware d'erreur
    })
})
router.get("/articles", (req, res, next) => {
  Articles.find()
  .then((response) => {
    console.log("articles = ", response)
    res.status(200).json({articles:[response]})
    
  })
  .catch((error) => console.log("Error finding articles : ", error))
});


module.exports = router;
