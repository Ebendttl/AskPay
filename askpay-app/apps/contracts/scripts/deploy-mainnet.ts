/**
 * deploy-mainnet.ts
 *
 * Plain Hardhat + viem deploy for PayPerQuery on Celo mainnet.
 * Uses npx hardhat run (NOT Ignition) to avoid the Ignition bug where
 * eth_getTransactionCount is called with "pending" — a block tag that
 * forno.celo.org does not support.
 *
 * Constructor args (triple-verified):
 *   _paymentToken = 0x765DE816845861e75A25fCA122bb6898B8B1282a  (USDm mainnet)
 *   _initialFee   = 10_000_000_000_000_000n                      (0.01 USDm, 18 dec)
 *
 * Run:
 *   npx hardhat run scripts/deploy-mainnet.ts --network celo
 */

import hre from "hardhat";

async function main() {
  const usdmMainnet = "0x765DE816845861e75A25fCA122bb6898B8B1282a" as const;
  const initialFee = 10_000_000_000_000_000n; // 0.01 USDm

  console.log("Network      :", hre.network.name);
  console.log("Chain ID     :", hre.network.config.chainId);
  console.log("_paymentToken:", usdmMainnet);
  console.log("_initialFee  :", initialFee.toString(), "(0.01 USDm)");
  console.log("Deploying PayPerQuery...\n");

  const payPerQuery = await hre.viem.deployContract("PayPerQuery", [
    usdmMainnet,
    initialFee,
  ]);

  console.log("✅ PayPerQuery deployed!");
  console.log("   Contract address :", payPerQuery.address);
  console.log(
    "   Celoscan link    : https://celoscan.io/address/" + payPerQuery.address
  );

  // The deploy tx hash is accessible via the publicClient receipt
  const publicClient = await hre.viem.getPublicClient();
  // deployContract returns the contract; get hash from the deployment transaction
  // hre.viem.deployContract resolves after the tx is mined
  console.log("\nDeployment complete. Verify the address on Celoscan above.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
