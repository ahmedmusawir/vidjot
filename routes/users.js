const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// const passport = require('passport');

//USER MODEL
require('../models/Users');
const User = mongoose.model('users');

//USER LOGIN ROUTE
router.get('/login', (req, res) => {
  res.render('users/login');
});
//USER REGISTRATION ROUTE
router.get('/register', (req, res) => {
  res.render('users/register');
});

//USER POST REGISTRATION ROUTE
router.post('/register', (req, res) => {
  let errors = [];

  if (req.body.password != req.body.password2) {
    errors.push({ text: 'Password do not match!' });
  }
  if (req.body.password.length < 4) {
    errors.push({ text: 'Password must be at least 4 characters.' });
  }
  if (errors.length > 0) {
    res.render('users/register', {
      errors: errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    });
  } else {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then(user => {
            req.flash('success_msg', 'You are now registered and can log in');
            res.redirect('/users/login');
          })
          .catch(err => {
            console.log(err);
            return;
          });
      });
    });
  }
});

module.exports = router;
