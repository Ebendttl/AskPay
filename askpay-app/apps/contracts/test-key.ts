import hre from "hardhat";

async function main() {
  const [client] = await hre.viem.getWalletClients();
  if (client) {
    console.log("Account address:", client.account.address);
  } else {
    console.log("No account found!");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
