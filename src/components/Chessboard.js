import React, { useState } from 'react';
import './Chessboard.css';

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
  const [turn, setTurn] = useState('white'); // White starts
  const [winner, setWinner] = useState(null); // Track winner

  const isWhitePiece = (piece) => piece && piece === piece.toUpperCase();

  const isPathClear = (fromRow, fromCol, toRow, toCol) => {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
    let row = fromRow + rowStep;
    let col = fromCol + colStep;

    while (row !== toRow || col !== toCol) {
      if (board[row][col]) return false; // Path blocked
      row += rowStep;
      col += colStep;
    }
    return true;
  };

  const isValidMove = (fromRow, fromCol, toRow, toCol) => {
    const piece = board[fromRow][fromCol];
    const target = board[toRow][toCol];
    const isWhite = isWhitePiece(piece);
    if ((turn === 'white' && !isWhite) || (turn === 'black' && isWhite)) return false; // Wrong turn
    if (target && (isWhite === isWhitePiece(target))) return false; // Can't capture own piece

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    switch (piece.toLowerCase()) {
      case 'p': // Pawn
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        if (colDiff === 0 && !target) {
          if (toRow === fromRow + direction) return true;
          if (fromRow === startRow && toRow === fromRow + 2 * direction && !board[fromRow + direction][fromCol]) return true;
        }
        if (colDiff === 1 && toRow === fromRow + direction && target) return true;
        return false;

      case 'r': // Rook
        if (rowDiff === 0 || colDiff === 0) {
          return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;

      case 'n': // Knight
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

      case 'b': // Bishop
        if (rowDiff === colDiff) {
          return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;

      case 'q': // Queen
        if (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) {
          return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;

      case 'k': // King
        return rowDiff <= 1 && colDiff <= 1;

      default:
        return false;
    }
  };

  const checkForWinner = (newBoard) => {
    const whiteKingPresent = newBoard.some(row => row.includes('K'));
    const blackKingPresent = newBoard.some(row => row.includes('k'));

    if (!whiteKingPresent) return 'Black';
    if (!blackKingPresent) return 'White';
    return null;
  };

  const handleSquareClick = (row, col) => {
    if (winner) return; // Game over, no more moves

    if (selectedPiece) {
      const { row: fromRow, col: fromCol } = selectedPiece;
      if (isValidMove(fromRow, fromCol, row, col)) {
        const newBoard = [...board.map(row => [...row])];
        newBoard[row][col] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = '';
        setBoard(newBoard);
        setTurn(turn === 'white' ? 'black' : 'white');

        const gameWinner = checkForWinner(newBoard);
        if (gameWinner) {
          setWinner(gameWinner);
        }
      }
      setSelectedPiece(null);
    } else if (board[row][col]) {
      setSelectedPiece({ row, col });
    }
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setSelectedPiece(null);
    setTurn('white');
    setWinner(null);
  };

  return (
    <div className="chessboard-container">
      <div className="chessboard">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isLightSquare = (rowIndex + colIndex) % 2 === 0;
            const isSelected = selectedPiece && 
              selectedPiece.row === rowIndex && 
              selectedPiece.col === colIndex;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`square ${isLightSquare ? 'light' : 'dark'} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
              >
                <span className={`piece ${piece.toLowerCase() === piece ? 'black' : 'white'}`}>
                  {pieceSymbols[piece] || ''}
                </span>
              </div>
            );
          })
        )}
      </div>
      <div className="game-info">
        {winner ? (
          <div className="winner-message">
            <span>{winner} Wins!</span>
            <button className="reset-button" onClick={resetGame}>Play Again</button>
          </div>
        ) : (
          <div className="turn-indicator">
            Turn: {turn.charAt(0).toUpperCase() + turn.slice(1)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chessboard;