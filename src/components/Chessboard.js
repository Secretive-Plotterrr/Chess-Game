import React, { useState } from 'react';

const initialBoard = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

const pieceSymbols = {
  'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
  'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

const Chessboard = () => {
  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);

  const handleSquareClick = (row, col) => {
    if (selectedPiece) {
      const newBoard = [...board];
      newBoard[row][col] = newBoard[selectedPiece.row][selectedPiece.col];
      newBoard[selectedPiece.row][selectedPiece.col] = '';
      setBoard(newBoard);
      setSelectedPiece(null);
    } else if (board[row][col]) {
      setSelectedPiece({ row, col });
    }
  };

  return (
    <div className="w-full aspect-square grid grid-cols-8 gap-0 shadow-lg">
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const isLightSquare = (rowIndex + colIndex) % 2 === 0;
          const isSelected = selectedPiece && 
            selectedPiece.row === rowIndex && 
            selectedPiece.col === colIndex;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                flex items-center justify-center text-4xl
                ${isLightSquare ? 'bg-amber-200' : 'bg-amber-600'}
                ${isSelected ? 'ring-4 ring-blue-500' : ''}
                cursor-pointer hover:opacity-90
                transition-all duration-150
              `}
              style={{ aspectRatio: '1/1' }}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {pieceSymbols[piece] || ''}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Chessboard;