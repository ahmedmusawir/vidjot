const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const flash = require('connect-flash-plus');
const session = require('express-session');

const app = express();

//FOLLOWING REPLACES BODY PARSER IN EXPRESS 4+
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//METHOD OVERRIDE MIDDLEWARE
app.use(methodOverride('_method'));
//SESSION MIDDLEWARE
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  })
);
//FLASH MESSEGING MIDDLEWARE
app.use(flash());

//GLOBAL VARIABLES
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//GETS RID OF DEPRICATION WARNINGS
// mongoose.Promise = global.Promise;

//CONNECTING TO MONGO DB WITH MONGOOSE
mongoose
  .connect(
    'mongodb://localhost:27017/notepress',
    { useNewUrlParser: true }
  )
  .then(() => console.log('Connected to MongoDB ...'))
  .catch(err => console.error('Could not connect to MongoDB ...'));

//LOAD NOTE MODEL
require('./models/Notes');
const Notes = mongoose.model('notes');

//HANDLE BARS MIDDLEWARE
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// //HOME ROUTE
// app.get('/', (req, res) => {
//   const title = 'NotePress';
//   res.render('home', {
//     title: title
//   });
// });
app.get('/flash', function(req, res) {
  // Set a flash message by passing the key, followed by the value, to req.flash().
  req.flash('info', 'Flash is back!');
  res.redirect('/');
});

app.get('/', function(req, res) {
  // Get an array of flash messages by passing the key to req.flash()
  res.render('home', { messages: req.flash('info') });
});
//ABOUT ROUTE
app.get('/about', (req, res) => {
  res.render('about');
});
//NOTE LIST
app.get('/notes', async (req, res) => {
  const notes = await Notes.find().sort({ date: 'desc' });
  res.render('notes/index', {
    notes: notes
  });
});
//ADD NOTE FORM
app.get('/notes/add', (req, res) => {
  res.render('notes/add');
});

//PROCESS FORM
app.post('/notes', (req, res) => {
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
      // console.log(note);
      res.redirect('/notes');
    });
  }
});
//EDIT NOTE FORM
app.get('/notes/edit/:id', async (req, res) => {
  const note = await Notes.findOne({ _id: req.params.id });
  res.render('notes/edit', {
    note: note
  });
});
//UPDATE NOTE IN MONGO
app.put('/notes/:id', async (req, res) => {
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

  req.flash('succss_msg', 'Note has been Edited');

  res.redirect('/notes');
});
//DELETE NOTE
app.delete('/notes/:id', async (req, res) => {
  Notes.remove({ _id: req.params.id }).then(() => {
    console.log(req.flash('success_msg'));
    req.flash('succss_msg', 'Note has been Removed');
    res.redirect('/notes');
  });
});
// //DELETE NOTE
// app.delete('/notes/:id', async (req, res) => {
//   //Look up the note & delete
//   const note = await Notes.findByIdAndRemove(req.params.id);
//   //Doesn't Exist, return 404
//   if (!note) return res.status(404).send('Notes Not Found To Delete');

//   //Flash message
//   req.flash('succss_msg', 'Note has been Removed');
//   //Return the index page
//   res.redirect('/notes');
// });
const port = 5001;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
