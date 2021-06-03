const Utils = require("./utils");
const Constants = require("./constants");

async function approveToken(account, token, value, chain, infuraKey) {
  const web3 = Utils.createWeb3(chain, infuraKey);
  let abi;

  if (!web3.utils.isAddress(token)) throw `Approve: invalid token address`;
  if (!Constants.CHAINS.includes(chain)) throw `Approve: not supported chain`;
  if (!(abi = Utils.getABI(token, chain)))
    throw `Approve: abi not existing for ${token} in ${chain}`;
  if (!web3.utils.isAddress(account.address))
    throw `Approve: invalid account address - ${account.address}`;

  const contract = Utils.getContract(web3, abi, token);
  const contractCall = contract.methods.approve(
    Constants.COMPOUND[chain][token],
    value
  );
  const estimatedGas = await contractCall.estimateGas({
    from: account.address,
  });
  const tx = await Utils.buildTransaction({
    web3,
    from: account.address,
    to: token,
    value: "0x0",
    data: contractCall.encodeABI(),
    estimatedGas,
  });
  const signedTx = await Utils.signTransaction(tx, account.privateKey, chain);
  const res = await web3.eth.sendSignedTransaction(signedTx);

  return res;
}

async function supplyToken(account, token, value, chain, infuraKey) {
  const web3 = Utils.createWeb3(chain, infuraKey);
  let abi;

  if (!web3.utils.isAddress(token)) throw `Supply: invalid token address`;
  if (!Constants.CHAINS.includes(chain)) throw `Supply: not supported chain`;
  if (!(abi = Utils.getABI(Constants.COMPOUND[chain][token], chain)))
    throw `Supply: abi not existing for ${token} in ${chain}`;
  if (!web3.utils.isAddress(account.address))
    throw `Supply: invalid account address - ${account.address}`;

  const contract = Utils.getContract(
    web3,
    abi,
    Constants.COMPOUND[chain][token]
  );
  const contractCall = contract.methods.mint(value);
  const estimatedGas = await contractCall.estimateGas({
    from: account.address,
  });
  const tx = await Utils.buildTransaction({
    web3,
    from: account.address,
    to: Constants.COMPOUND[chain][token],
    value: "0x0",
    data: contractCall.encodeABI(),
    estimatedGas,
  });
  const signedTx = await Utils.signTransaction(tx, account.privateKey, chain);
  const res = await web3.eth.sendSignedTransaction(signedTx);

  return res;
}

async function borrowToken(account, token, value, chain, infuraKey) {
  const web3 = Utils.createWeb3(chain, infuraKey);
  let abi;

  if (!web3.utils.isAddress(token)) throw `Borrow: invalid token address`;
  if (!Constants.CHAINS.includes(chain)) throw `Borrow: not supported chain`;
  if (!(abi = Utils.getABI(Constants.COMPOUND[chain][token], chain)))
    throw `Borrow: abi not existing for ${token} in ${chain}`;
  if (!web3.utils.isAddress(account.address))
    throw `Borrow: invalid account address - ${account.address}`;

  const contract = Utils.getContract(
    web3,
    abi,
    Constants.COMPOUND[chain][token]
  );
  const contractCall = contract.methods.borrow(value);
  const estimatedGas = await contractCall.estimateGas({
    from: account.address,
  });
  const tx = await Utils.buildTransaction({
    web3,
    from: account.address,
    to: Constants.COMPOUND[chain][token],
    value: "0x0",
    data: contractCall.encodeABI(),
    estimatedGas,
  });
  const signedTx = await Utils.signTransaction(tx, account.privateKey, chain);
  const res = await web3.eth.sendSignedTransaction(signedTx);

  return res;
}

async function repayToken(account, token, value, chain, infuraKey) {
  const web3 = Utils.createWeb3(chain, infuraKey);
  let abi;

  if (!web3.utils.isAddress(token)) throw `Repay: invalid token address`;
  if (!Constants.CHAINS.includes(chain)) throw `Repay: not supported chain`;
  if (!(abi = Utils.getABI(Constants.COMPOUND[chain][token], chain)))
    throw `Repay: abi not existing for ${token} in ${chain}`;
  if (!web3.utils.isAddress(account.address))
    throw `Repay: invalid account address - ${account.address}`;

  const contract = Utils.getContract(
    web3,
    abi,
    Constants.COMPOUND[chain][token]
  );
  const contractCall =
    token == "0x0000000000000000000000000000000000000000"
      ? contract.methods.repayBorrow()
      : contract.methods.repayBorrow(value);
  const estimatedGas = await contractCall.estimateGas({
    from: account.address,
  });
  const tx = await Utils.buildTransaction({
    web3,
    from: account.address,
    to: Constants.COMPOUND[chain][token],
    value:
      token == "0x0000000000000000000000000000000000000000"
        ? web3.utils.numberToHex(value)
        : "0x0",
    data: contractCall.encodeABI(),
    estimatedGas,
  });
  const signedTx = await Utils.signTransaction(tx, account.privateKey, chain);
  const res = await web3.eth.sendSignedTransaction(signedTx);

  return res;
}

async function getUserLiquidity(account, chain, infuraKey) {
  const web3 = Utils.createWeb3(chain, infuraKey);
  const abi = Utils.getABI(Constants.COMPOUND[chain].Unitroller, chain);
  const contract = Utils.getContract(
    web3,
    abi,
    Constants.COMPOUND[chain].Unitroller
  );

  const { 1: liquidity } = await contract.methods
    .getAccountLiquidity(account.address)
    .call();

  return liquidity;
}

async function getCollateralFacter(token, chain, infuraKey) {
  const web3 = Utils.createWeb3(chain, infuraKey);
  const abi = Utils.getABI(Constants.COMPOUND[chain].Unitroller, chain);
  const contract = Utils.getContract(
    web3,
    abi,
    Constants.COMPOUND[chain].Unitroller
  );

  let { 1: collateralFactor } = await contract.methods.markets(Constants.COMPOUND[chain][token]).call();

  return collateralFactor;
}

async function getInterestInfo(token, chain, infuraKey) {
  const web3 = Utils.createWeb3(chain, infuraKey);
  const abi = Utils.getABI(Constants.COMPOUND[chain][token], chain);
  const contract = Utils.getContract(
    web3,
    abi,
    Constants.COMPOUND[chain][token]
  );
  const SupplyRate = await contract.methods.supplyRatePerBlock().call();
  const BorrowRate = await contract.methods.borrowRatePerBlock().call();
  const ExchangeRate = await contract.methods.exchangeRateCurrent().call();

  return {
    SupplyRate,
    BorrowRate,
    ExchangeRate,
  };
}

module.exports = {
  approveToken,
  borrowToken,
  supplyToken,
  repayToken,
  getInterestInfo,
  getUserLiquidity,
  getCollateralFacter,
};
