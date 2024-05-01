import styles from './index.module.css';
import {
  type Board,
  Stone,
  initialBoard,
  makeLegalMoves,
  move,
  opposite,
  status,
} from '../othello';
import { useReducer } from 'react';

const intoArray = (n: bigint): boolean[] =>
  Array.from(n.toString(2).padStart(64, '0')).map((c) => c === '1');

const popCount = (n: bigint): number => intoArray(n).reduce((acc, b) => acc + Number(b), 0);

const fromMoves = (moves: number[]): [Board, Stone] =>
  moves.reduce(
    ([board, turn], i) => {
      const mask = 1n << BigInt(i);
      const nextBoard = move(board, turn, mask);
      const legalMoves = makeLegalMoves(nextBoard, opposite(turn));
      return [nextBoard, (turn ^ Number(legalMoves > 0)) as Stone];
    },
    [initialBoard, Stone.Black] as [Board, Stone],
  );

const turnToString = (turn: Stone): string =>
  ({
    [Stone.Black]: '⚫️',
    [Stone.White]: '⚪️',
  })[turn];

const Home = () => {
  const [moves, addMoves] = useReducer((moves: number[], i: number) => [...moves, i], []);
  const [board, turn] = fromMoves(moves);
  const legalMoves = makeLegalMoves(board, turn);

  const handleClick = (i: number) => () => addMoves(i);

  return (
    <div className={styles.container}>
      <div className={styles.status} data-status={status(board)} data-turn={turnToString(turn)}>
        <div>⚫️{popCount(board[Stone.Black])}</div>
        <div>⚪️{popCount(board[Stone.White])}</div>
      </div>
      <div className={styles.board}>
        {intoArray(board[Stone.Black])
          .reverse()
          .map((b, i) => ({ b, i }))
          .filter(({ b }) => b)
          .map(({ i }) => (
            <div
              key={i}
              className={styles.stone}
              style={{
                left: `${(i % 8) * 12.5}%`,
                top: `${Math.floor(i / 8) * 12.5}%`,
              }}
            >
              ⚫️
            </div>
          ))}
        {intoArray(board[Stone.White])
          .reverse()
          .map((b, i) => ({ b, i }))
          .filter(({ b }) => b)
          .map(({ i }) => (
            <div
              key={i}
              className={styles.stone}
              style={{
                left: `${(i % 8) * 12.5}%`,
                top: `${Math.floor(i / 8) * 12.5}%`,
              }}
            >
              ⚪️
            </div>
          ))}
        {intoArray(legalMoves)
          .reverse()
          .map((b, i) => ({ b, i }))
          .filter(({ b }) => b)
          .map(({ i }) => (
            <div
              key={i}
              className={styles.stone}
              onClick={handleClick(i)}
              style={{
                left: `${(i % 8) * 12.5}%`,
                top: `${Math.floor(i / 8) * 12.5}%`,
              }}
            >
              🟢
            </div>
          ))}
      </div>
    </div>
  );
};

export default Home;
