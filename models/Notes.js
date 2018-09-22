const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//CREATE SCHEMA
const NoteSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('notes', NoteSchema);
