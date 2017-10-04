const fs = require('fs');
const path = require('path');
const R = require('ramda');

const BUILT_CONTRACTS = path.join(__dirname, '../contracts/build/contracts');
let contracts = null;

module.exports = (web3) => {
  if (contracts !== null) return contracts;

  const specs = fs.readdirSync(BUILT_CONTRACTS).map(f => {
    return require(path.join(BUILT_CONTRACTS, f));
  }).filter(spec => !R.isEmpty(spec.networks));

  contracts = R.fromPairs(specs.map(spec =>
    [
      spec.contract_name, 
      new web3.eth.Contract(
        spec.abi,
        R.compose(
          R.prop('address'), 
          R.head, 
          R.filter(R.eqProps('updated_at', spec)), 
          R.values)(spec.networks),
        { gas: 999999 }
      )
    ]
  ))

  return contracts;
}