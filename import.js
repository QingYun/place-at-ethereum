const { range, multiply, add, bind, forEach } = require('ramda');
const fs = require('fs');
const util = require('util');

const logger = require('pino')({
  level: process.env.LOG_LEVEL || 'trace',
  prettyPrint: process.env.NODE_ENV != 'production',
});

const sqlite3 = process.env.NODE_ENV === 'production' ? require('sqlite3') : require('sqlite3').verbose(),
      db = new sqlite3.Database(process.env.DATA_FILE, () => {
        db.serialize(() => {
          db.run('PRAGMA synchronous=OFF');
          db.run(
            `CREATE TABLE IF NOT EXISTS 
            drawings (
              at    INT       NOT NULL,
              x     INT       NOT NULL,
              y     INT       NOT NULL,
              color SMALLINT  NOT NULL,
              PRIMARY KEY (at, x, y)
            )`);
          db.run('CREATE INDEX IF NOT EXISTS drawing_at ON drawings (at)');
          db.run(`
            CREATE TABLE IF NOT EXISTS
            resizing (
              at    INTEGER PRIMARY KEY NOT NULL,
              size  INT                 NOT NULL
            )
          `);
          db.run(`
            INSERT INTO resizing (at, size)
            SELECT 0, 1001
            WHERE NOT EXISTS (SELECT 1 FROM resizing WHERE at = 0 AND size = 1001)
          `);
        });
      });

const onExit = require('signal-exit');
onExit(() => {
  db.close();
});

const interval = parseInt(process.env.INTERVAL, 10);

let filePosition = 0;
const file = fs.openSync(process.env.FROM, 'r');

let bufLength = 0;
let bufOffset = 0;
const buf = Buffer.allocUnsafe(16 * 1024 * 1024);

const readFile = util.promisify(fs.read);
async function nextChunk() {
  const { bytesRead } = await readFile(file, buf, 0, buf.length, filePosition)
  // logger.info('read chunk at=%d len=%d', filePosition, bytesRead)
  filePosition += bytesRead;
  bufLength = bytesRead;
  bufOffset = 0;
  return bytesRead;
}

async function insertSet(set, t) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const addDrawing = db.prepare('INSERT INTO drawings VALUES (?, ?, ?, ?)');

    db.serialize(() => {
      db.run('BEGIN');

      for (const x in set) {
        for (const y in set[x]) {
          addDrawing.run([t, x, y, set[x][y]]);
          counter++;
        }
      }

      db.run('COMMIT', e => {
        if (e) return reject(e);
        resolve(counter);
      });
    });
  });
}

function toRecord(buf, start) {
  return range(0, 4).map(multiply(4)).map(add(start)).map(bind(buf.readInt32LE, buf));
}

async function parseChunk(t, offset) {
  const set = {};
  while (true) {
    for (; bufOffset < bufLength; bufOffset += 16) {
      const [at, x, y, color] = toRecord(buf, bufOffset);
      if (at > t + interval) {
        const inserted = await insertSet(set, t);
        logger.info('chunk', new Date(t * 1000), inserted);
        return parseChunk(at);
      }

      if (!set[x]) set[x] = {};
      if (!set[x][y]) set[x][y] = {};
      set[x][y] = color;
    }

    if (await nextChunk() === 0) return;
  }

}

const stream = fs.createReadStream(process.env.FROM);
stream.on('readable', async () => {
  console.log('start parsing')
  try {
    await parseChunk(0);
  } catch (e) {
    console.log(e);
  }
})