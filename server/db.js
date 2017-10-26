const { uniqBy, merge, toPairs, sortBy, head } = require('ramda');
const { toInt } = require('./utils');
const sqlite3 = process.env.NODE_ENV === 'production' ? require('sqlite3') : require('sqlite3').verbose(),
      db = new sqlite3.Database(process.env.DATA_FILE, () => {
        db.serialize(() => {
          db.run(`
            CREATE TABLE IF NOT EXISTS 
            drawings (
              at    INT       NOT NULL,
              x     INT       NOT NULL,
              y     INT       NOT NULL,
              color SMALLINT  NOT NULL,
              PRIMARY KEY (at, x, y)
            )
          `);
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

module.exports.getUpdates = async ({ every, from, to }) => {
  return new Promise(async (resolve, reject) => {
    const query = db.prepare(`
      SELECT DISTINCT x, y, color FROM drawings
      WHERE at >= ? AND at < ?
      ORDER BY at DESC
    `);

    const updates = {};
    for (; from < to; from += every) {
      let end = Math.min(from + every, to);
      const update = await (new Promise((resolve, reject) => query.all(
        [from, end], 
        (e, docs) => {
          if (e) return reject(e);
          resolve(uniqBy(({ x, y }) => x * 1000 + y, docs));
        }
      )));

      updates[end] = update;
    }

    resolve(sortBy(head, toPairs(updates)).map(([at, updates]) => ({ at: toInt(at), updates })));
  });
}

module.exports.getResizing = async ({ from, to }) => {
  return new Promise((resolve, reject) => {
    // We have to query all previous resizings to know the size at `from`
    db.all(`
      SELECT * FROM resizing
      WHERE at >= 0 AND at < ?
      ORDER BY at DESC`, 
      [to],
      (e, rows) => {
        if (e) return reject(e);
        logger.info(rows.length);
        for (let i = 0; i < rows.length; i++) {
          if (rows[i].at <= from) {
            resolve(rows.slice(0, i + 1));
          }
        }
      }
    )
  })
};

// We only persist color changes since difficulty distributions can be deduced
module.exports.addDrawing = async ({ x, y, color, at }) => {
  return new Promise((resolve, reject) => db.run(
    'INSERT INTO drawings VALUES (?, ?, ?, ?)', 
    [at, x, y, color], 
    e => {
      if (e) return reject(e);
      resolve();
    })
  );
}

module.exports.addResizing = async ({ at, size }) => {
  return new Promise((resolve, reject) => db.run(
    'INSERT INTO resizing VALUE (?, ?)',
    [at, size],
    e => {
      if (e) return reject(e);
      resolve();
    }
  ));
}