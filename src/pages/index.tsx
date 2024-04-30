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
import { useRouter } from 'next/router';

const intoArray = (n: bigint): boolean[] =>
  Array.from(n.toString(2).padStart(64, '0')).map((c) => c === '1');

const toAlphabet = (i: number): string =>
  String.fromCharCode('a'.charCodeAt(0) + (i % 8)) + (Math.floor(i / 8) + 1);
const fromAlphabet = (s: string): number =>
  s.charCodeAt(0) - 'a'.charCodeAt(0) + (parseInt(s[1]) - 1) * 8;
const fromRecord = (record: string): [Board, Stone] => {
  let board: Board = initialBoard;
  let turn: Stone = Stone.Black;
  if (!record.match(/^([a-h][1-8]){0,64}$/)) throw new Error();
  for (const pos of record.match(/[a-h][1-8]/g) ?? []) {
    const mask = 1n << BigInt(fromAlphabet(pos));
    if (!isLegalMove(board, turn, mask)) throw new Error();
    board = move(board, turn, mask);
    if (makeLegalMoves(board, opposite(turn))) {
      turn = opposite(turn);
    }
  }
  return [board, turn];
};

const Home = () => {
  const router = useRouter();
  const record = router.query.record ?? '';
  if (typeof record !== 'string') throw new Error();
  const [board, turn] = fromRecord(record);
  const legalMoves = makeLegalMoves(board, turn);

  const handleClick = (i: number) => () => {
    const pos = 1n << BigInt(i);
    if (!isLegalMove(board, turn, pos)) return;
    const nextRecord = record + toAlphabet(i);
    router.push(`/?record=${nextRecord}`);
  };

  return (
    <div className={styles.container}>
      <p>{status(board) === Status.GameOver ? 'GameOver' : turn === Stone.Black ? '⚫️' : '⚪️'}</p>
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
