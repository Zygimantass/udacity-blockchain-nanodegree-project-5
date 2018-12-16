var contract = artifacts.require("StarNotary");

var contract_address = '0x14c8195ebb8929b280fe483fcde0c8ef8e9618dc';

module.exports = function() {
  async function execute() {
    let instance = await contract.at(contract_address);
    await contract.createStar(starName, starStory, starRA, starDEC, starMAG, {from: user1});
  }

  execute();
}
