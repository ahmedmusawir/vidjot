const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//USER LOGIN ROUTE
router.get('/login', (req, res) => {
  res.render('users/login');
});
//USER REGISTRATION ROUTE
router.get('/register', (req, res) => {
  res.render('users/register');
});

module.exports = router;
