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
