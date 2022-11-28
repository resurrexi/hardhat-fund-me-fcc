const { networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  let ethUsdPriceFeedAddress;

  // 31337 is localhost
  if (chainId == "31337") {
    const ethUsdAggregator = await get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress], // put priceFeed address (see FundMe constructor)
    log: true,
    waitConfirmations: chainId != "31337" ? 6 : 1, // wait 6 block confirmations if network isn't localhost
  });

  if (chainId != "31337" && process.env.ETHERSCAN_API_KEY) {
    // verify after deployment if network isn't localhost
    await verify(fundMe.address, [ethUsdPriceFeedAddress]);
  }
};

module.exports.tags = ["all", "fundme"];
