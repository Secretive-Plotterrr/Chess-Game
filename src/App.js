import React from 'react';
import Chessboard from './components/Chessboard';
import './components/Chessboard.css'; // Import the new CSS file

function App() {
  return (
    <div className="app-container">
      <h1 className="app-title">Chess Game</h1>
      <Chessboard />
    </div>
  );
}

export default App;