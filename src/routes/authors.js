const express = require('express');
const mongoose = require('mongoose');
const Author = require('../models/Author');
const Story = require('../models/Story');

const router = express.Router();

const validId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id)
    ? next()
    : res.status(400).json({ error: 'Invalid id' });

router.get('/', async (req, res, next) => {
  try {
    res.json(await Author.find());
  } catch (e) {
    next(e);
  }
});

router.get('/:id', validId, async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ error: 'Author not found' });
    res.json(author);
  } catch (e) {
    next(e);
  }
});

router.get('/:id/stories', validId, async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ error: 'Author not found' });
    res.json(await Story.find({ authors: author._id }));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
