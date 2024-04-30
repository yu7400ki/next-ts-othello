export const Stone = {
  Black: 0,
  White: 1,
} as const;

export type Stone = (typeof Stone)[keyof typeof Stone];

export const opposite = (stone: Stone): Stone => (1 - stone) as Stone;

export type Board = { [K in Stone]: bigint };
export const initialBoard: Board = {
  [Stone.Black]: 0x0000000810000000n,
  [Stone.White]: 0x0000001008000000n,
};

const Mask = {
  Vertical: 0x00ffffffffffff00n,
  Horizontal: 0x7e7e7e7e7e7e7e7en,
  Diagonal: 0x007e7e7e7e7e7e00n,
} as const;

const Direction = {
  Up: -8,
  Down: 8,
  Left: -1,
  Right: 1,
  UpLeft: -9,
  UpRight: -7,
  DownLeft: 7,
  DownRight: 9,
} as const;

type Direction = (typeof Direction)[keyof typeof Direction];

const DirectionMaskMap = {
  [Direction.Up]: Mask.Vertical,
  [Direction.Down]: Mask.Vertical,
  [Direction.Left]: Mask.Horizontal,
  [Direction.Right]: Mask.Horizontal,
  [Direction.UpLeft]: Mask.Diagonal,
  [Direction.UpRight]: Mask.Diagonal,
  [Direction.DownLeft]: Mask.Diagonal,
  [Direction.DownRight]: Mask.Diagonal,
} as const;

const lookup = (target: bigint, source: bigint, direction: Direction): bigint => {
  const shift = BigInt(direction);
  const mask = source & DirectionMaskMap[direction];
  return Array(5)
    .fill(0)
    .reduce((acc) => acc | (mask & (acc << shift)), mask & (target << shift));
};

export const makeLegalMoves = (board: Board, stone: Stone): bigint => {
  const opponent = opposite(stone);
  const empty = ~(board[Stone.Black] | board[Stone.White]);
  return Object.values(Direction).reduce(
    (acc, direction) =>
      acc | (empty & (lookup(board[stone], board[opponent], direction) << BigInt(direction))),
    0n,
  );
};

export const isLegalMove = (board: Board, stone: Stone, pos: bigint): boolean =>
  (makeLegalMoves(board, stone) & pos) > 0n;

const flip = (board: Board, stone: Stone, pos: bigint): bigint => {
  const opponent = opposite(stone);
  return Object.values(Direction).reduce((acc, direction) => {
    const candidate = lookup(pos, board[opponent], direction);
    const shift = BigInt(direction);
    const mask = board[stone] & (candidate << shift);
    return (
      acc |
      Array(5)
        .fill(0)
        .reduce((acc) => acc | (candidate & (acc >> shift)), candidate & (mask >> shift))
    );
  }, 0n);
};

export const move = (board: Board, stone: Stone, pos: bigint): Board => {
  const opponent = opposite(stone);
  const flipped = flip(board, stone, pos);
  return {
    [stone]: board[stone] | pos | flipped,
    [opponent]: board[opponent] & ~flipped,
  } as Board;
};

export const Status = {
  Continue: 0,
  GameOver: 1,
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export const status = (board: Board): Status =>
  Number(
    (makeLegalMoves(board, Stone.Black) | makeLegalMoves(board, Stone.White)) === 0n,
  ) as Status;
