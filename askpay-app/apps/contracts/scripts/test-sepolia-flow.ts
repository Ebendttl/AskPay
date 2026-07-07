import hre from "hardhat";
import { getAddress, parseUnits, formatUnits, createWalletClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { celoSepolia } from "viem/chains";

async function main() {
  // We must load PRIVATE_KEY to get the deployer's wallet client
  const [deployer] = await hre.viem.getWalletClients();
  const publicClient = await hre.viem.getPublicClient();

  console.log("Deployer address:", deployer.account.address);

  // Addresses of deployed contracts
  const mockTokenAddress = "0x3c839797BA135457Eca83f8C20f2335A817899b5";
  const payPerQueryAddress = "0x0c77e53D988059773D6E18396D449e86cF876687";

  // Create a new random second account
  const secondKey = generatePrivateKey();
  const secondAccount = privateKeyToAccount(secondKey);
  console.log("Second account address:", secondAccount.address);

  // Get instances of deployed contracts using deployer
  const mockToken = await hre.viem.getContractAt("MockERC20", mockTokenAddress);
  const payPerQuery = await hre.viem.getContractAt("PayPerQuery", payPerQueryAddress);

  // 1. Mint 5 USDm to the second account from the deployer
  console.log("Minting MockERC20 to second account...");
  const mintAmount = parseUnits("5", 18);
  const mintTx = await mockToken.write.mint([secondAccount.address, mintAmount]);
  await publicClient.waitForTransactionReceipt({ hash: mintTx });
  console.log("Minted! Tx hash:", mintTx);

  // Send 1 CELO to second account for gas fees
  console.log("Sending gas (1 CELO) to second account...");
  const gasAmount = parseUnits("1", 18);
  const gasTx = await deployer.sendTransaction({
    to: secondAccount.address,
    value: gasAmount,
  });
  await publicClient.waitForTransactionReceipt({ hash: gasTx });
  console.log("Gas sent! Tx hash:", gasTx);

  // Set up second account wallet client using native viem
  const secondClient = createWalletClient({
    account: secondAccount,
    chain: celoSepolia,
    transport: http("https://forno.celo-sepolia.celo-testnet.org")
  });

  const tokenAsSecond = await hre.viem.getContractAt("MockERC20", mockTokenAddress, {
    client: { wallet: secondClient }
  });
  const payPerQueryAsSecond = await hre.viem.getContractAt("PayPerQuery", payPerQueryAddress, {
    client: { wallet: secondClient }
  });

  // 2. Approve PayPerQuery to pull 0.01 USDm fee
  const feeAmount = parseUnits("0.01", 18);
  console.log(`Approving PayPerQuery for ${formatUnits(feeAmount, 18)} USDm...`);
  const approveTx = await tokenAsSecond.write.approve([payPerQueryAddress, feeAmount]);
  await publicClient.waitForTransactionReceipt({ hash: approveTx });
  console.log("Approved! Tx hash:", approveTx);

  // 3. Call askQuestion() with a sample queryId
  const queryId = 999n;
  console.log(`Calling askQuestion(${queryId}) from second account...`);
  const askTx = await payPerQueryAsSecond.write.askQuestion([queryId]);
  await publicClient.waitForTransactionReceipt({ hash: askTx });
  console.log("Transaction confirmed! Tx hash:", askTx);

  // 4. Fetch and print the emitted QueryPaid event args
  console.log("Fetching QueryPaid events...");
  const events = await payPerQuery.getEvents.QueryPaid();
  // Filter for events emitted by this tx
  const txEvents = events.filter(e => e.transactionHash === askTx);
  
  if (txEvents.length > 0) {
    const event = txEvents[0];
    console.log("Event QueryPaid details:");
    console.log(" - Payer:", event.args.payer);
    console.log(" - Amount:", formatUnits(event.args.amount as bigint, 18), "USDm");
    console.log(" - Query ID:", event.args.queryId?.toString());
    console.log(" - Timestamp:", event.args.timestamp?.toString());
  } else {
    console.log("No QueryPaid event found in receipt.");
  }

  // 5. Print PayPerQuery's USDm balance afterward
  const balance = await mockToken.read.balanceOf([payPerQueryAddress]);
  console.log(`PayPerQuery contract USDm balance: ${formatUnits(balance, 18)} USDm`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
