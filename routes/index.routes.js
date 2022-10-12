const router = require("express").Router();
const User = require("../models/User.model");
const mongoose = require("mongoose");
const fileUploader = require("../config/cloudinary.config");
const bcrypt = require('bcryptjs');
const saltRounds = 10;


// USERS
//liste des followers d'un user
router.get("/users/:userId/followers", (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    const err = new Error("User id is not valid")
    err.status = 400
    next(err)
    return;
  }
  User.find({ following: req.params.userId })
    .then(followers => {
      console.log("HELLO FOLLOWERS = ",followers)
      for(let i = 0; i<followers.length; i++){
        followers[i].password=undefined
      }
      
      res.status(200).json(followers)})
    .catch(err => next(err))
})

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
            .then((response) => {
            user.password = undefined
            res.status(200).json(response)})
            .catch(err => next(err))
        })
        .catch(err => next(err))
    })
    .catch((err) => next(err))
});

// unfollow d'un user
router.put("/users/:userId/unfollow", (req, res, next) => {
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
      User.findByIdAndUpdate(req.payload._id, { $pull: { following: req.params.userId } }, { new: true })
        .then(response => res.status(200).json({ userUpdatedFollows: response }))
        .catch(err => next(err))
    })
    .catch(err => next(err))
});

//détails user
router.get("/users/:userId", (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    const err = new Error("User id is not valid")
    err.status = 400
    next(err)
    return;
  }
  User.findById(req.params.userId)
    .then(user => {
      if (!user) {
        const err = new Error('Could not find User with this id')
        err.status = 404
        next(err)
        return
      }
      user.password=undefined
      res.status(200).json(user)
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
      //req.body contient il un champs username
      //si oui => s'assurer que le username est unique
      //si oui=> update User
      //si non=> error message "please provide an other username"
      //si non => yolo

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
      } else {
        after()
      }

      function after() {
        const { username, location, bio, avatarUrl, website, linkedin, github } = req.body
        User.findByIdAndUpdate(req.params.userId, { username, location, bio, avatarUrl, website, linkedin, github }, { new: true })
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
router.put("/user/editpassword", (req, res, next) => {
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

//IMAGE
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
