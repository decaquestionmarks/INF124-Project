require('dotenv').config();
const express = require('express');
const recipeRouter = require('./routes/recipe');
const foodsRouter = require('./routes/foods');
const usersRouter = require('./routes/users');
const cors = require('cors')
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/recipes';


app.use(cors())

// Middleware
app.use(express.json());

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });

// Routes
app.use('/recipes', recipeRouter);
app.use('/foods', foodsRouter);
app.use('/users', usersRouter);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});