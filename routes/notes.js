const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//LOAD NOTE MODEL
require('../models/Notes');
const Notes = mongoose.model('notes');

//NOTE LIST
router.get('/', async (req, res) => {
  const notes = await Notes.find().sort({ date: 'desc' });
  res.render('notes/index', {
    notes: notes
  });
});
//ADD NOTE FORM
router.get('/add', (req, res) => {
  res.render('notes/add');
});

//PROCESS FORM
router.post('/', (req, res) => {
  // console.log(req.body);
  let errors = [];

  if (!req.body.title) {
    errors.push({ text: 'Please add a Title' });
  }
  if (!req.body.details) {
    errors.push({ text: 'Please add a Snippet' });
  }
  if (errors.length > 0) {
    res.render('notes/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details
    };
    new Notes(newUser).save().then(note => {
      req.flash('success_msg', 'Note has been Posted');

      res.redirect('/notes');
    });
  }
});
//EDIT NOTE FORM
router.get('/edit/:id', async (req, res) => {
  const note = await Notes.findOne({ _id: req.params.id });
  res.render('notes/edit', {
    note: note
  });
});
//UPDATE NOTE IN MONGO
router.put('/:id', async (req, res) => {
  const note = await Notes.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      details: req.body.details
    },
    { new: true }
  );
  //If not existing, return 404 - Bad request
  if (!note) return res.status(404).send('Note Not Found To Edit');

  req.flash('success_msg', 'Note has been Edited');

  res.redirect('/notes');
});

//DELETE NOTE
router.delete('/:id', async (req, res) => {
  //Look up the note & delete
  const note = await Notes.findByIdAndRemove(req.params.id);
  //Doesn't Exist, return 404
  if (!note) return res.status(404).send('Notes Not Found To Delete');

  //Flash message
  req.flash('success_msg', 'Note has been Removed');
  //Return the index page
  res.redirect('/notes');
});

//DELETE NOTE TRAV WAY
// router.delete('/:id', async (req, res) => {
//   Notes.remove({ _id: req.params.id }).then(() => {
//     req.flash('success_msg', 'Note has been Removed');
//     res.redirect('/');
//   });
// });

module.exports = router;
