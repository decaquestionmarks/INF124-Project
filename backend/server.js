const express = require('express');
const recipeRouter = require('./routes/recipe');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/recipes', recipeRouter);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});