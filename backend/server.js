const express = require('express');
const recipeRouter = require('./routes/recipe');
const usersRouter = require('./routes/users');
const cors = require('cors')

const app = express();
const PORT = 3000;


app.use(cors())

// Middleware
app.use(express.json());

// Routes
app.use('/recipes', recipeRouter);
app.use('/users', usersRouter);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});