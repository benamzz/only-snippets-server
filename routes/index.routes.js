const router = require("express").Router();
const Article = require("../models/Article.model");
const User = require("../models/User.model");
const Snippet = require("../models/Snippet.model");
const mongoose = require("mongoose");
const fileUploader = require("../config/cloudinary.config");

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
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    const err = new Error("User id is not valid")
    err.status = 400
    next(err)
    return;
  }
  User.findById(req.params.userId)
    .then(response => {
      if (!response) {
        const err = new Error('Could not find User with this id')
        err.status = 404
        next(err)
        return
      }
      res.status(200).json({ user: response })
    })
    .catch(err => next(err));
});

//édition user
router.patch("/users/:userId", (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    const err = new Error("User id is not valid")
    err.status = 400
    next(err)
    return;
  }
  User.findById(req.params.userId)
    .then((userFromDB) => {
      if (!userFromDB) {
        const err = new Error("Could not find User")
        err.status = 404
        next(err)
        return;
      }
      if (userFromDB._id.toString() !== req.payload._id) {
        const err = new Error('You are not owner of this profile')
        err.status = 403
        next(err)
        return
      }
      if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
        const err = new Error("E0001: User id is not valid")
        err.status = 400
        next(err)
        return;
      }

      User.findByIdAndUpdate(req.params.userId, req.body, { new: true })
        .then(response => {
          if (!response) {
            const err = new Error('Could not find User')
            err.status = 403
            next(err)
            return
          }
          res.status(200).json({ userUpdated: response })
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
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
    .catch(err => next(err));
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
  if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
    const err = new Error("Article id is not valid")
    err.status = 400
    next(err)
    return;
  }
  Article.findById(req.params.articleId)
    .then(response => {
      if (!response) {
        const err = new Error('Could not find article')
        err.status = 404
        next(err)
        return
      }
      res.status(200).json({ article: response })
    })
    .catch(err => next(err));
});

//liste des articles
router.get("/articles", (req, res, next) => {
  Article.find()
    .then(response => res.status(200).json({ articles: response }))
    .catch(err => next(err));
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
      Article.findByIdAndUpdate(req.params.articleId, req.body, { new: true })
        .then(response => res.status(200).json({ articleUpdated: response }))
        .catch(err => next(err));
    })
    .catch(err => next(err));
});

//création snippet
router.post("/articles/:articleId/snippets", (req, res, next) => {
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
        content: req.body.content,
        userId: req.payload._id,
        articleId: req.params.id,
      })
        .then(snippetFromDB => {
          res.status(201).json(snippetFromDB)
        })
        .catch(err => next(err))
    })
    .catch(err => next(err))
});

//édition snippet
router.patch("/articles/:articleId/snippets/:snippetId", (req, res, next) => {
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
          snippet.content = req.body.content
          snippet.save()
            .then(response => res.status(200).json({ snippetUpdated: response }))
            .catch(err => next(err))
        })
    })
    .catch((err) => next(err))
})

//détail snippet
router.get("/articles/:articleId/snippets/:snippetId", (req, res, next) => {
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
router.delete("/articles/:articleId/snippets/:snippetId", (req, res, next) => {
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

// suppression article
router.delete("/articles/:articleId", (req, res, next) => {
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
      Article.findByIdAndRemove(req.params.articleId)
        .then(() => res.status(204).send())
        .catch(err => next(err))
    })
})

//like d'un article
router.put("/articles/:articleId/like", (req, res, next) => {
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
      User.findByIdAndUpdate(req.payload._id, { likes: req.params.articleId }, { new: true })
        .then(user => res.status(200).json({ userUpdated: user }))
        .catch(err => next(err))
    })
    .catch(err => next(err))
});

// follow d'un user
router.put("/users/:userId/follow", (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    const err = new Error("User id is not valid")
    err.status = 400
    next(err)
    return;
  }
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        const err = new Error('Could not find User')
        err.status = 404
        next(err)
        return
      }
      User.findById(req.payload._id)
        .then((user) => {
          user.following.push(req.params.userId)
          user.save()
            .then((response) => res.status(200).json({ userUpdatedFollows: response }))
            .catch(err => next(err))
        })
        .catch(err => next(err))
    })
    .catch((err) => next(err))

  // User.findByIdAndUpdate(req.payload._id, { following: req.params.userId }, { new: true })
  //   .then(user => {
  //     if (!user) {
  //       const err = new Error('Could not find User')
  //       err.status = 404
  //       next(err)
  //       return
  //     }
  //     res.status(200).json({ userUpdatedFollows: user })
  //   })
  //   .catch(err => next(err))
});

//liste des commentaires relatifs a un article
router.get("/articles/:articleId/comments", (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
    const err = new Error("Article id is not valid")
    err.status = 400
    next(err)
    return;
  }
  Article.find({ parentId: req.params.articleId })
    .then(comments => {
      if (comments.length < 1) {
        const err = new Error('Could not find Comments')
        err.status = 404
        next(err)
        return
      }
      res.status(200).json({ comments: comments })
    })
    .catch(err => next(err))
});

//upload d'une image
router.post("/upload", fileUploader.single("avatarUrl"), (req, res, next) => {
  if (!req.file) {
    next(new Error("No file uploaded!"));
    return;
  }
  // Get the URL of the uploaded file and send it as a response.
  // 'fileUrl' can be any name, just make sure you remember to use the same when accessing it on the frontend
  res.json({ fileUrl: req.file.path });

});

module.exports = router;
