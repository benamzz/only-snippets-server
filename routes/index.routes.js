const router = require("express").Router();
const User = require("../models/User.model");
const mongoose = require("mongoose");
const fileUploader = require("../config/cloudinary.config");


// USERS
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
