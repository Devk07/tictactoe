// server.js
const express = require('express');
const db = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// API: Get Leaderboard
app.get('/api/leaderboard', (req, res) => {
  db.all('SELECT player_name, won_at FROM winners ORDER BY won_at DESC LIMIT 5', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// API: Save a Winner
app.post('/api/winner', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  db.run('INSERT INTO winners (player_name) VALUES (?)', [name], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Winner saved!', id: this.lastID });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});