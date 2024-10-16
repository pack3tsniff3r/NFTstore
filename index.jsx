
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Enable CORS for all origins
app.use(express.json());

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

module.exports = app;