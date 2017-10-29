const INTERVAL = 300;

export default function calcDifficulty(difficulty, paintedAt, at) {
  const d = Math.max(1, difficulty);
  return Math.max(0, d - Math.floor(((at - paintedAt) * d) / (2 * INTERVAL)));
}
