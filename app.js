// public/app.js
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const winnersList = document.getElementById('winners-list');

let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

const winningConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

// --- Game Logic ---

function handleCellClick(e) {
  const cell = e.target;
  const index = cell.getAttribute('data-index');

  if (gameState[index] !== '' || !gameActive) return;

  gameState[index] = currentPlayer;
  cell.textContent = currentPlayer;
  
  // Highlight color based on player
  cell.style.color = currentPlayer === 'X' ? '#e74c3c' : '#2980b9';

  checkResult();
}

function checkResult() {
  let roundWon = false;
  let winningPlayer = null;

  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      roundWon = true;
      winningPlayer = gameState[a];
      break;
    }
  }

  if (roundWon) {
    statusElement.textContent = `Player ${winningPlayer} Wins! 🎉`;
    gameActive = false;
    promptForName(winningPlayer);
    return;
  }

  if (!gameState.includes('')) {
    statusElement.textContent = "It's a Draw! 🤝";
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusElement.textContent = `Player ${currentPlayer}'s turn`;
}

function resetGame() {
  currentPlayer = 'X';
  gameState = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  statusElement.textContent = "Player X's turn";
  
  document.querySelectorAll('.cell').forEach(cell => {
    cell.textContent = '';
    cell.style.color = '#2c3e50'; // reset color
  });
}

// --- Database Integration ---

function promptForName(winner) {
  // Simple prompt to ask for the winner's name
  const name = prompt(`Player ${winner}, you won! Enter your name for the leaderboard:`);
  if (name && name.trim() !== '') {
    saveWinner(name.trim());
  }
}

async function saveWinner(name) {
  try {
    await fetch('/api/winner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    loadLeaderboard(); // Refresh the list
  } catch (err) {
    console.error('Failed to save winner:', err);
  }
}

async function loadLeaderboard() {
  try {
    const res = await fetch('/api/leaderboard');
    const winners = await res.json();
    
    winnersList.innerHTML = '';
    if (winners.length === 0) {
      winnersList.innerHTML = '<li>No winners yet. Be the first!</li>';
      return;
    }

    winners.forEach(w => {
      const li = document.createElement('li');
      // Format date to be readable
      const date = new Date(w.won_at).toLocaleTimeString();
      li.textContent = `👑 ${w.player_name} (${date})`;
      winnersList.appendChild(li);
    });
  } catch (err) {
    console.error('Failed to load leaderboard:', err);
  }
}

// --- Event Listeners ---

boardElement.addEventListener('click', handleCellClick);
resetBtn.addEventListener('click', resetGame);

// Load leaderboard on startup
loadLeaderboard();