const Gateway = artifacts.require("Gateway");
const Canvas = artifacts.require("Canvas");
const Grower = artifacts.require("Grower");
const PlayerActivities = artifacts.require("PlayerActivities");
const Throttle = artifacts.require("Throttle");

module.exports = function(deployer) {
  const deployments = [
    Canvas,
    Grower,
    PlayerActivities,
    Throttle
  ].map(d => d.new());

  Promise.all(deployments.concat(Gateway.deployed())).then(([canvas, grower, playerActivities, throttle, gateway]) => {
    return Promise.all([
      gateway.setModule("throttle", throttle.address),
      gateway.setModule("grower", grower.address),

      throttle.setModule("grower", grower.address),
      throttle.setModule("canvas", canvas.address),
      throttle.setModule("player-activities", playerActivities.address),

      grower.setModule("canvas", canvas.address),
    ]);
  })
};
