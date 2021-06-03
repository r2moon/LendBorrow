const Constants = require("./constants");
const Web3 = require("web3");
const Tx = require("ethereumjs-tx");

function getABI(address, chain) {
  const abi = require(`./data/${chain}/abi/${address}.json`);
  return abi;
}

function validateChain(chain) {
  return Constants.CHAINS.includes(chain);
}

function createWeb3(chain, infuraKey) {
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://${chain}.infura.io/v3/${infuraKey}`
    )
  );
  return web3;
}

function getContract(web3, abi, address) {
  const contract = new web3.eth.Contract(abi, address);
  return contract;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function buildTransaction({ web3, from, to, value, data, estimatedGas }) {
  const txCount = await web3.eth.getTransactionCount(from);
  const gasPrice = await web3.eth.getGasPrice();
  const tx = {
    from,
    to,
    data,
    value,
    nonce: web3.utils.toHex(txCount),
    gasPrice: web3.utils.toHex(gasPrice),
    gasLimit: web3.utils.toHex(Math.ceil(estimatedGas * 1.1)),
  };

  return tx;
}

async function signTransaction(raxTx, privateKey, chain) {
  let tx = new Tx.Transaction(raxTx, { chain });
  const prKey = Buffer.from(privateKey, "hex");
  tx.sign(prKey);
  const serializedTx = tx.serialize().toString("hex");
  const signedTx = "0x" + serializedTx;

  return signedTx;
}

module.exports = {
  createWeb3,
  getABI,
  getContract,
  sleep,
  validateChain,
  buildTransaction,
  signTransaction,
};
