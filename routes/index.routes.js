const router = require("express").Router();
const User = require("../models/User.model");
const mongoose = require("mongoose");
const fileUploader = require("../config/cloudinary.config");
const bcrypt = require('bcryptjs');
const Article = require("../models/Article.model");
const saltRounds = 10;
const ObjectId = require('mongodb').ObjectId;
const { isAuthenticated } = require('./../middleware/jwt.middleware.js');

// USERS

// liste des articles likés
router.get("/users/:userId/likes", isAuthenticated, (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    const err = new Error("User id is not valid")
    err.status = 400
    next(err)
    return;
  }
  User.findById(req.params.userId)
    .then(user => {
      Article.find({ _id: { "$in": user.likes } })
        .then(likes => {
          likes.map(el => {
            return el.password = undefined
          })
          res.status(200).json(likes)
        })
        .catch(err => next(err))
    })
    .catch(err => next(err))
})

//liste des followers d'un user
router.get("/users/:userId/followers", isAuthenticated, (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    const err = new Error("User id is not valid")
    err.status = 400
    next(err)
    return;
  }
  User.find({ following: req.params.userId })
    .then(followers => {

      followers.map(el => {
        return el.password = undefined
      })
      res.status(200).json(followers)
    })
    .catch(err => next(err))
})

// follow d'un user
router.put("/users/:userId/follow", isAuthenticated, (req, res, next) => {
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
          user.following.push(ObjectId(req.params.userId))
          user.save()
            .then((response) => {
              user.password = undefined
              res.status(200).json(response)
            })
            .catch(err => next(err))
        })
        .catch(err => next(err))
    })
    .catch((err) => next(err))
});

// unfollow d'un user
router.put("/users/:userId/unfollow", isAuthenticated, (req, res, next) => {
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
      User.findByIdAndUpdate(req.payload._id, { $pull: { following: ObjectId(req.params.userId) } }, { new: true })
        .then(response => {
          res.status(200).json(response)
        })

        .catch(err => next(err))
    })
    .catch(err => next(err))
});

//détails user
router.get("/users/:userId", isAuthenticated, (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    const err = new Error("User id is not valid")
    err.status = 400
    next(err)
    return;
  }
  User.findById(req.params.userId)
    .populate("following")
    .then(user => {
      if (!user) {
        const err = new Error('Could not find User with this id')
        err.status = 404
        next(err)
        return
      }
      user.password = undefined
      res.status(200).json(user)
    })
    .catch(err => next(err));
});

//édition user
router.patch("/users/:userId", isAuthenticated, (req, res, next) => {
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
      if (req.body.username !== userFromDB.username) {
        User.findOne({ username: req.body.username })
          .then((user) => {
            if (user) {
              const err = new Error('username already taken')
              err.status = 400
              next(err)
              return
            } else {
              after()
            }
          })
          .catch((err) => next(err))
        if (req.body.username.length > 12) {
          const err = new Error('username must be 12 characters long')
          err.status = 400
          next(err)
          return
        }
      } else {
        after()
      }

      function after() {
        if (req.body.username?.trim() === "") { req.body.username = undefined }
        if (req.body.location?.trim() === "") { req.body.location = undefined }
        if (req.body.bio?.trim() === "") { req.body.bio = undefined }
        if (req.body.tags === []) { req.body.tags = undefined }
        if (req.body.avatarUrl?.trim() === "") { req.body.avatarUrl = undefined }
        if (req.body.website?.trim() === "") { req.body.website = undefined }
        if (req.body.linkedin?.trim() === "") { req.body.linkedin = undefined }
        if (req.body.github?.trim() === "") { req.body.github = undefined }
        const { username, location, bio, tags, avatarUrl, website, linkedin, github } = req.body
        User.findByIdAndUpdate(req.params.userId, { username, location, bio, tags, avatarUrl, website, linkedin, github }, { new: true })
          .then(user => {
            if (!user) {
              const err = new Error('Could not find User')
              err.status = 403
              next(err)
              return
            }
            user.password = undefined
            res.status(200).json(user)
          })
          .catch(err => next(err));
      }

    })
    .catch(err => next(err));
})

//édition password user
router.put("/user/editpassword", isAuthenticated, (req, res, next) => {
  if (!req.body.password) {
    const err = new Error("You must provide a password")
    err.status = 400
    next(err)
    return
  }
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync(req.body.password, salt);
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(req.body.password)) {
    res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
    return;
  }
  User.findByIdAndUpdate(req.payload._id, { password: hashedPassword }, { new: true })
    .then(() => res.status(204).end())
    .catch(err => console.log(err))
})

//liste de users
router.get("/users", isAuthenticated, (req, res, next) => {
  User.find()
    .then(users => {
      res.status(200).json(users)
    })
    .catch(err => next(err));
})

//IMAGE
//upload d'une image
router.post("/upload", fileUploader.single("avatarUrl"), isAuthenticated, (req, res, next) => {
  if (!req.file) {
    next(new Error("No file uploaded!"));
    return;
  }
  // Get the URL of the uploaded file and send it as a response.
  // 'fileUrl' can be any name, just make sure you remember to use the same when accessing it on the frontend
  res.json(req.file.path);

});

module.exports = router;
