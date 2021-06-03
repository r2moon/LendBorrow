const Utils = require("./utils");
const Constants = require("./constants");

/**
 * @description Approves specified amount of token for Aave to use
 * @param account object of sender who submits the approve() function to the blockchain
 * @param token address of token that you want to approve for the Aave
 * @param value amount that you want to allow the Aave to use
 * @param chain chain name that you're submitting transaction to
 * @returns
 */
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
    Constants.AAVE.LendingPool[chain],
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

/**
 * @description Deposit token into Lending Pool
 * @param account object of user who deposits token into Lending Pool
 * @param token address of token that you want to deposit
 * @param onBehalfOf address of user who gets paid the reward
 * @param value amount that you want to deposit
 * @param chain chain name that you're submitting transaction to
 * @returns
 */
async function depositToken(
  account,
  token,
  onBehalfOf,
  value,
  chain,
  infuraKey
) {
  const web3 = Utils.createWeb3(chain, infuraKey);

  if (!web3.utils.isAddress(token)) throw `Deposit: invalid token address`;
  if (!Constants.CHAINS.includes(chain)) throw `Deposit: not supported chain`;
  if (!web3.utils.isAddress(account.address))
    throw `Deposit: invalid account address - ${account.address}`;
  if (!web3.utils.isAddress(onBehalfOf))
    throw `Deposit: invalid onBehalfOf address - ${onBehalfOf}`;

  const lendingPoolAbi = Utils.getABI(Constants.AAVE.LendingPool[chain], chain);
  const contract = Utils.getContract(
    web3,
    lendingPoolAbi,
    Constants.AAVE.LendingPool[chain]
  );
  const contractCall = contract.methods.deposit(
    token,
    value,
    onBehalfOf,
    "0x0"
  );
  const estimatedGas = await contractCall.estimateGas({
    from: account.address,
  });
  const tx = await Utils.buildTransaction({
    web3,
    from: account.address,
    to: Constants.AAVE.LendingPool[chain],
    value: "0x0",
    data: contractCall.encodeABI(),
    estimatedGas,
  });
  const signedTx = await Utils.signTransaction(tx, account.privateKey, chain);
  const res = await web3.eth.sendSignedTransaction(signedTx);

  return res;
}

/**
 * @description Withdraw token from Lending Pool
 * @param account object of user who withdraws token from Lending Pool
 * @param token address of token that you want to withdraw
 * @param to address of user who receives the withdrawn amount
 * @param value amount that you want to withdraw
 * @param chain chain name that you're submitting transaction to
 * @returns
 */
async function withdrawToken(account, token, to, value, chain, infuraKey) {
  const web3 = Utils.createWeb3(chain, infuraKey);

  if (!web3.utils.isAddress(token)) throw `Withdraw: invalid token address`;
  if (!Constants.CHAINS.includes(chain)) throw `Withdraw: not supported chain`;
  if (!web3.utils.isAddress(account.address))
    throw `Withdraw: invalid account address - ${account.address}`;
  if (!web3.utils.isAddress(to))
    throw `Withdraw: invalid destination address - ${to}`;

  const lendingPoolAbi = Utils.getABI(Constants.AAVE.LendingPool[chain], chain);
  const contract = Utils.getContract(
    web3,
    lendingPoolAbi,
    Constants.AAVE.LendingPool[chain]
  );
  const contractCall = contract.methods.withdraw(token, value, to);
  const estimatedGas = await contractCall.estimateGas({
    from: account.address,
  });
  const tx = await Utils.buildTransaction({
    web3,
    from: account.address,
    to: Constants.AAVE.LendingPool[chain],
    value: "0x0",
    data: contractCall.encodeABI(),
    estimatedGas,
  });
  const signedTx = await Utils.signTransaction(tx, account.privateKey, chain);
  const res = await web3.eth.sendSignedTransaction(signedTx);

  return res;
}

/**
 * @description Returns registered token-list in Aave Lending Pool for reserve
 * @param chain The chain name that you want to check for [Default: Check config file]
 * @returns
 */
async function getReservesList(chain, infuraKey) {
  const web3 = Utils.createWeb3(chain, infuraKey);
  const lendingPoolAbi = Utils.getABI(Constants.AAVE.LendingPool[chain], chain);
  const contract = Utils.getContract(
    web3,
    lendingPoolAbi,
    Constants.AAVE.LendingPool[chain]
  );
  const res = await contract.methods.getReservesList().call();

  return res;
}

/**
 * @description Returns interest rates for selected token
 * @param token The token address to be requested for interest information
 * @param chain The chain name that the token exists on [Default: Check config file]
 * @returns
 */
async function getInterestInfo(token, chain, infuraKey) {
  const web3 = Utils.createWeb3(chain, infuraKey);
  const lendingPoolAbi = Utils.getABI(Constants.AAVE.LendingPool[chain], chain);
  const contract = Utils.getContract(
    web3,
    lendingPoolAbi,
    Constants.AAVE.LendingPool[chain]
  );
  const reserves = await contract.methods.getReserveData(token).call();

  return {
    DepositAPY: reserves.currentLiquidityRate,
    VariableBorrowRate: reserves.currentVariableBorrowRate,
    StableBorrowRate: reserves.currentStableBorrowRate,
  };
}

async function approveAndDeposit(account, token, value, chain, infuraKey) {
  const approveTx = await approveToken(account, token, value, chain, infuraKey);

  await Utils.sleep(1000);

  const depositTx = await depositToken(
    account,
    token,
    account.address,
    value,
    chain,
    infuraKey
  );

  return {
    approveTxHash: approveTx.transactionHash,
    depositTxHash: depositTx.transactionHash,
  };
}

module.exports = {
  getReservesList,
  getInterestInfo,
  approveToken,
  depositToken,
  withdrawToken,
  approveAndDeposit,
};
