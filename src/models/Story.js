const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  body: { type: String, default: '' },
  authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Author' }],
});

module.exports = mongoose.model('Story', storySchema);
