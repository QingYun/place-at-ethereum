const { compose, groupBy, prop, map, pick, uniq } = require('ramda');
const Datastore = require('nedb-promise'),
      db = new Datastore({ 
        filename: process.env.DATA_FILE,
        autoload: true,
      });

db.ensureIndex({ fieldName: 'at' }, (e) => e && logger.fatal(e));

const toNext = n => i => Math.ceil(i / n) * n;

module.exports.getUpdates = async ({ every, from, to }) => {
  const docs = await db.cfind({
    $and: [
      { at: { $gte: from} },
      { at: { $lt: to } },
    ]
  }).sort({ at: 1 }).exec();
  return compose(
    map(uniq),
    map(map(pick(['x', 'y', 'color']))), 
    groupBy(compose(toNext(every), prop('at')))
  )(docs);
}

// We only persist color changes since difficulty distributions can be deduced
module.exports.addDrawing = async ({ x, y, color, at }) => {
  const doc = { x, y, color, at };
  return (await db.insert(doc))._id;
}
