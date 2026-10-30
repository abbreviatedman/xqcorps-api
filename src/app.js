const express = require('express');

const app = express();
app.use(express.json());
app.use('/authors', require('./routes/authors'));
app.use('/stories', require('./routes/stories'));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
