const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { isAuthenticated } = require('./../middleware/jwt.middleware.js');
const router = express.Router();
const saltRounds = 10;

// Création d'un user
router.post('/users', (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password or name are provided as empty string 
  if (email === '' || password === '') {
    res.status(400).json({ message: "Provide email and password" });
    return;
  }

  // Use regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Provide a valid email address.' });
    return;
  }

  // Use regex to validate the password format
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
    return;
  }


  // Check the users collection if a user with the same email already exists
  User.findOne({ email })
    .then((foundUser) => {
      // If the user with the same email already exists, send an error response
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      // If email is unique, proceed to hash the password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Create the new user in the database
      // We return a pending promise, which allows us to chain another `then` 
      return User.create({ email, password: hashedPassword });
    })
    .then((createdUser) => {
      // Deconstruct the newly created user object to omit the password
      // We should never expose passwords publicly
      const { email, _id } = createdUser;

      //create custom username
      const username = email.split("@")[0] + "#" + _id.toString().slice(-5)

      // Create a new object that doesn't expose the password
      const user = { email, _id, username };
      // Send a json response containing the user object
      createdUser.username = username
      createdUser.avatarUrl = "https://res.cloudinary.com/dqkqgqlne/image/upload/v1665843894/avatars%20gallery/c5glastvlijiucl5uvgl.png"
      createdUser.save()
        .then(() => {
          res.status(201).json(user);
        })
        .catch(err => next(err))
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" })
    });
});

//Login
router.post('/sessions', (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string 
  if (email === '' || password === '') {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // Check the users collection if a user with the same email exists
  User.findOne({ email })
    .then((foundUser) => {

      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: "User not found." })
        return;
      }

      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { _id, email, avatarUrl, username, bio, location, tags, website, linkedin, github, following, likes } = foundUser;

        // Create an object that will be set as the token payload
        const payload = { _id, email, avatarUrl, username, bio, location, tags, website, linkedin, github, following, likes };

        // Create and sign the token
        const authToken = jwt.sign(
          payload,
          process.env.TOKEN_SECRET,
          { algorithm: 'HS256', expiresIn: "6h" }
        );

        // Send the token as the response
        res.status(200).json({ authToken: authToken });
      }
      else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }

    })
    .catch(err => res.status(500).json({ message: "Internal Server Error" }));
});

//get session
router.get('/session', isAuthenticated, (req, res, next) => {
  User.findById(req.payload._id)
    .then((user) => {
      user.password = undefined
      res.json(user)
    })
    .catch(err => next(err))
});
module.exports = router;