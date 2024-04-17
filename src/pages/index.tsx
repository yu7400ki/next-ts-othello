import { useState } from 'react';
import styles from './index.module.css';
import {
  type Board,
  Stone,
  initialBoard,
  makeLegalMoves,
  move,
  isLegalMove,
  opposite,
  status,
  Status,
} from '../othello';

const Legal = 3 as const;
type Legal = typeof Legal;

const intoArray = (board: Board, legalMoves: bigint): (Stone | Legal | null)[] => {
  const result: (Stone | Legal | null)[] = [];
  for (let i = 0n; i < 64; i++) {
    const mask = 1n << i;
    if (board[Stone.Black] & mask) {
      result.push(Stone.Black);
    } else if (board[Stone.White] & mask) {
      result.push(Stone.White);
    } else if (legalMoves & mask) {
      result.push(Legal);
    } else {
      result.push(null);
    }
  }
  return result;
};

const Home = () => {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [turn, setTurn] = useState<Stone>(Stone.Black);
  const legalMoves = makeLegalMoves(board, turn);

  const handleClick = (i: number) => () => {
    const pos = 1n << BigInt(i);
    if (!isLegalMove(board, turn, pos)) return;
    const newBoard = move(board, turn, pos);
    setBoard(newBoard);
    if (makeLegalMoves(newBoard, opposite(turn))) {
      setTurn(opposite(turn));
    }
  };

  return (
    <div className={styles.container}>
      <p>{status(board) === Status.GameOver ? 'GameOver' : turn === Stone.Black ? '⚫️' : '⚪️'}</p>
      <div className={styles.board}>
        {intoArray(board, legalMoves).map((stone, i) => (
          <div key={i} className={styles.cell} onClick={handleClick(i)}>
            {stone === Stone.Black
              ? '⚫️'
              : stone === Stone.White
                ? '⚪️'
                : stone === Legal
                  ? '🟢'
                  : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
