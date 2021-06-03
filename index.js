const Aave = require("./aave");
const Compound = require("./compound");
const Utils = require("./utils");
const Config = require("./config.json");

(async () => {
  // await testAave();
  await testCompound();
})();

async function testAave() {
  const reservesList = await Aave.getReservesList(
    Config.chain,
    Config.infuraKey
  );

  /**
   * Separate Approve & Depost
   */

  // /** Approve Dai for Aave Lending Pool to spend */
  // const approveTx = await Aave.approveToken(
  //   {
  //     address: Config.address,
  //     privateKey: Config.privateKey,
  //   },
  //   reservesList[3],
  //   "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  //   Config.chain,
  //   Config.infuraKey
  // );

  // console.log(`\n Approve TxHash: ${approveTx.transactionHash} \n`);

  // /** Wait Lending Pool to update the status */
  // console.log("\n Waiting for 10 seconds... \n");
  // await Utils.sleep(10000);

  // /** Deposit 50 Dai to Aave Lending Pool */
  // const depositTx = await Aave.depositToken(
  //   {
  //     address: Config.address,
  //     privateKey: Config.privateKey,
  //   },
  //   reservesList[3],
  //   Config.address,
  //   "50000000000000000000",
  //   Config.chain,
  //   Config.infuraKey
  // );

  // console.log(`\n Deposit TxHash: ${depositTx.transactionHash} \n`);

  /**
   * Approve & Deposit
   */
  const bothTx = await Aave.approveAndDeposit(
    {
      address: Config.address,
      privateKey: Config.privateKey,
    },
    reservesList[3],
    "50000000000000000000",
    Config.chain,
    Config.infuraKey
  );

  console.log(`\n Approve TxHash: ${bothTx.approveTxHash} \n`);
  console.log(`\n Deposit TxHash: ${bothTx.depositTxHash} \n`);

  /** Wait Lending Pool to update the status */
  console.log("\n Waiting for 30 seconds... \n");
  await Utils.sleep(30000);

  /** Withdraw 30 Dai from Aave Lending Pool */
  const withdrawTx = await Aave.withdrawToken(
    {
      address: Config.address,
      privateKey: Config.privateKey,
    },
    reservesList[3],
    Config.address,
    "30000000000000000000",
    Config.chain,
    Config.infuraKey
  );

  console.log(`\n Withdraw TxHash: ${withdrawTx.transactionHash} \n`);

  const interestInfo = await Aave.getInterestInfo(
    reservesList[9],
    Config.chain,
    Config.infuraKey
  );
  console.log(`\n Interest Information for ${reservesList[3]} \n`);
  console.log(interestInfo);
}

async function testCompound() {
  const collateral_token = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa";
  const borrow_token = "0x0000000000000000000000000000000000000000";

  const approveTx = await Compound.approveToken(
    {
      address: Config.address1,
      privateKey: Config.privateKey1,
    },
    collateral_token,
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    Config.chain,
    Config.infuraKey
  );

  console.log(`\n Approve TxHash: ${approveTx.transactionHash} \n`);

  /** Wait Compound to update the status */
  console.log("\n Waiting for 10 seconds... \n");
  await Utils.sleep(10000);

  const supplyTx = await Compound.supplyToken(
    {
      address: Config.address1,
      privateKey: Config.privateKey1,
    },
    collateral_token,
    "225000000000000000000",
    Config.chain,
    Config.infuraKey
  );

  console.log(`\n Supply TxHash: ${supplyTx.transactionHash} \n`);

  /** Wait Compound to update the status */
  console.log("\n Waiting for 10 seconds... \n");
  await Utils.sleep(10000);

  const borrowTx = await Compound.borrowToken(
    {
      address: Config.address1,
      privateKey: Config.privateKey1,
    },
    borrow_token,
    "352532748681389900",
    Config.chain,
    Config.infuraKey
  );

  console.log(`\n Borrow TxHash: ${borrowTx.transactionHash} \n`);

  /** Wait Compound to update the status */
  console.log("\n Waiting for 10 seconds... \n");
  await Utils.sleep(10000);

  const repayTx = await Compound.repayToken(
    {
      address: Config.address1,
      privateKey: Config.privateKey1,
    },
    borrow_token,
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    Config.chain,
    Config.infuraKey
  );

  console.log(`\n Repay TxHash: ${repayTx.transactionHash} \n`);

  const interestInfo = await Compound.getInterestInfo(
    collateral_token,
    Config.chain,
    Config.infuraKey
  );

  console.log(`\n Interest Info: ${JSON.stringify(interestInfo)} \n`);

  const liquidityInfo = await Compound.getUserLiquidity(
    {
      address: Config.address1,
      privateKey: Config.privateKey1,
    },
    Config.chain,
    Config.infuraKey
  );

  console.log(`\n Liquidity Info: ${JSON.stringify(liquidityInfo)} \n`);

  const collateralInfo = await Compound.getCollateralFacter(
    borrow_token,
    Config.chain,
    Config.infuraKey
  );

  console.log(`\n Collateral Info: ${JSON.stringify(collateralInfo)} \n`);
}
