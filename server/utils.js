const { flip, map } = require('ramda');

const toInt = flip(parseInt)(10);

module.exports = {
  toInt, 
  toIntObj: map(toInt),
}