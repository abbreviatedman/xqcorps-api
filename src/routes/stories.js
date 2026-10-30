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
    res.json(await Story.find());
  } catch (e) {
    next(e);
  }
});

router.get('/:id', validId, async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json(story);
  } catch (e) {
    next(e);
  }
});

// the authors that belong to a single story
router.get('/:id/authors', validId, async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json(await Author.find({ _id: { $in: story.authors } }));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
