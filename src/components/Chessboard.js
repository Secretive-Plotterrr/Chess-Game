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
  const [turn, setTurn] = useState('white');
  const [winner, setWinner] = useState(null);
  const [castling, setCastling] = useState({
    whiteKingMoved: false,
    blackKingMoved: false,
    whiteRookA: false,
    whiteRookH: false,
    blackRookA: false,
    blackRookH: false
  });
  const [promotion, setPromotion] = useState(null);
  const [lastMove, setLastMove] = useState(null); // Track last move for en passant

  const isWhitePiece = (piece) => piece && piece === piece.toUpperCase();

  const isPathClear = (fromRow, fromCol, toRow, toCol) => {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
    let row = fromRow + rowStep;
    let col = fromCol + colStep;

    while (row !== toRow || col !== toCol) {
      if (board[row][col]) return false;
      row += rowStep;
      col += colStep;
    }
    return true;
  };

  const isValidMove = (fromRow, fromCol, toRow, toCol) => {
    const piece = board[fromRow][fromCol];
    const target = board[toRow][toCol];
    const isWhite = isWhitePiece(piece);
    if ((turn === 'white' && !isWhite) || (turn === 'black' && isWhite)) return false;
    if (target && (isWhite === isWhitePiece(target))) return false;

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    switch (piece.toLowerCase()) {
      case 'p':
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        const enPassantRow = isWhite ? 3 : 4;

        // Normal pawn moves
        if (colDiff === 0 && !target) {
          if (toRow === fromRow + direction) return true;
          if (fromRow === startRow && toRow === fromRow + 2 * direction && !board[fromRow + direction][fromCol]) return true;
        }
        // Pawn capture
        if (colDiff === 1 && toRow === fromRow + direction && target) return true;
        // En passant
        if (colDiff === 1 && toRow === fromRow + direction && !target && fromRow === enPassantRow) {
          if (lastMove && 
              lastMove.piece.toLowerCase() === 'p' && 
              Math.abs(lastMove.fromRow - lastMove.toRow) === 2 && 
              lastMove.toCol === toCol && 
              lastMove.toRow === fromRow) {
            return true;
          }
        }
        return false;

      case 'r':
        if (rowDiff === 0 || colDiff === 0) {
          return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;

      case 'n':
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

      case 'b':
        if (rowDiff === colDiff) {
          return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;

      case 'q':
        if (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) {
          return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;

      case 'k':
        if (rowDiff === 0 && colDiff === 2) {
          if (isWhite && !castling.whiteKingMoved && fromRow === 7 && fromCol === 4) {
            if (toCol === 6 && !castling.whiteRookH && !board[7][5] && !board[7][6]) {
              return isPathClear(7, 4, 7, 7);
            }
            if (toCol === 2 && !castling.whiteRookA && !board[7][1] && !board[7][2] && !board[7][3]) {
              return isPathClear(7, 4, 7, 0);
            }
          }
          if (!isWhite && !castling.blackKingMoved && fromRow === 0 && fromCol === 4) {
            if (toCol === 6 && !castling.blackRookH && !board[0][5] && !board[0][6]) {
              return isPathClear(0, 4, 0, 7);
            }
            if (toCol === 2 && !castling.blackRookA && !board[0][1] && !board[0][2] && !board[0][3]) {
              return isPathClear(0, 4, 0, 0);
            }
          }
        }
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

  const handlePromotionChoice = (piece) => {
    const newBoard = [...board.map(row => [...row])];
    const { row, col } = promotion;
    newBoard[row][col] = turn === 'white' ? piece.toUpperCase() : piece.toLowerCase();
    setBoard(newBoard);
    setPromotion(null);
    setTurn(turn === 'white' ? 'black' : 'white');
    setLastMove(null); // Reset last move after promotion
    const gameWinner = checkForWinner(newBoard);
    if (gameWinner) setWinner(gameWinner);
  };

  const handleSquareClick = (row, col) => {
    if (winner || promotion) return;

    if (selectedPiece) {
      const { row: fromRow, col: fromCol } = selectedPiece;
      if (isValidMove(fromRow, fromCol, row, col)) {
        const newBoard = [...board.map(row => [...row])];
        const piece = newBoard[fromRow][fromCol];
        // eslint-disable-next-line no-unused-vars
        const isWhite = isWhitePiece(piece);

        // Handle castling
        if (piece.toLowerCase() === 'k' && Math.abs(fromCol - col) === 2) {
          if (col === 6) {
            newBoard[fromRow][5] = newBoard[fromRow][7];
            newBoard[fromRow][7] = '';
          } else if (col === 2) {
            newBoard[fromRow][3] = newBoard[fromRow][0];
            newBoard[fromRow][0] = '';
          }
        }

        // Handle en passant
        if (piece.toLowerCase() === 'p' && 
            Math.abs(fromCol - col) === 1 && 
            !newBoard[row][col] && 
            lastMove && 
            lastMove.toCol === col && 
            lastMove.toRow === fromRow) {
          newBoard[fromRow][col] = ''; // Remove captured pawn
        }

        // Check for pawn promotion
        if (piece.toLowerCase() === 'p' && (row === 0 || row === 7)) {
          newBoard[row][col] = '';
          newBoard[fromRow][fromCol] = '';
          setBoard(newBoard);
          setPromotion({ row, col });
          setLastMove({ piece, fromRow, fromCol, toRow: row, toCol: col });
          setSelectedPiece(null);
          return;
        }

        newBoard[row][col] = piece;
        newBoard[fromRow][fromCol] = '';
        
        // Update last move
        setLastMove({ piece, fromRow, fromCol, toRow: row, toCol: col });
        
        setBoard(newBoard);
        setTurn(turn === 'white' ? 'black' : 'white');

        // Update castling status
        if (piece === 'K') setCastling({...castling, whiteKingMoved: true});
        if (piece === 'k') setCastling({...castling, blackKingMoved: true});
        if (piece === 'R' && fromRow === 7 && fromCol === 0) setCastling({...castling, whiteRookA: true});
        if (piece === 'R' && fromRow === 7 && fromCol === 7) setCastling({...castling, whiteRookH: true});
        if (piece === 'r' && fromRow === 0 && fromCol === 0) setCastling({...castling, blackRookA: true});
        if (piece === 'r' && fromRow === 0 && fromCol === 7) setCastling({...castling, blackRookH: true});

        const gameWinner = checkForWinner(newBoard);
        if (gameWinner) setWinner(gameWinner);
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
    setCastling({
      whiteKingMoved: false,
      blackKingMoved: false,
      whiteRookA: false,
      whiteRookH: false,
      blackRookA: false,
      blackRookH: false
    });
    setPromotion(null);
    setLastMove(null);
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
        {promotion ? (
          <div className="promotion-choices">
            <span>Promote pawn to:</span>
            {['q', 'r', 'b', 'n'].map(piece => (
              <button
                key={piece}
                onClick={() => handlePromotionChoice(piece)}
              >
                {pieceSymbols[turn === 'white' ? piece.toUpperCase() : piece]}
              </button>
            ))}
          </div>
        ) : winner ? (
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