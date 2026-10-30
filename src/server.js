const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/xqcorps')
  .then(() => app.listen(port, () => console.log(`Listening on ${port}`)));
