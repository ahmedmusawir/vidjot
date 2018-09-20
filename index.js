const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
//GETTING NODE SASS MIDDLEWARE
const sassMiddleware = require('node-sass-middleware');
const path = require('path');

//BRING ROUTES
const notes = require('./routes/notes');
const users = require('./routes/users');

const app = express();

//USING SASS MIDDLEWARE
app.use(
  sassMiddleware({
    src: path.join(__dirname, '/_scss'),
    dest: path.join(__dirname, '/public'),
    debug: true
  })
);
console.log(__dirname);
//FOLLOWING REPLACES BODY PARSER IN EXPRESS 4+
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//STATIC PUBLIC FOLDER
app.use(express.static(path.join(__dirname, 'public')));

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
mongoose.Promise = global.Promise;

//CONNECTING TO MONGO DB WITH MONGOOSE
mongoose
  .connect(
    'mongodb://localhost:27017/notepress',
    { useNewUrlParser: true }
  )
  .then(() => console.log('Connected to MongoDB ...'))
  .catch(err => console.error('Could not connect to MongoDB ...'));

//HANDLE BARS MIDDLEWARE
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//HOME ROUTE
app.get('/', (req, res) => {
  const title = 'NotePress';
  res.render('home', {
    title: title
  });
});

//ABOUT ROUTE
app.get('/about', (req, res) => {
  res.render('about');
});

//USE ROUTES
app.use('/notes', notes);
app.use('/users', users);

const port = 5001;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
