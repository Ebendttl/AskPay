import hre from "hardhat";
import { formatUnits } from "viem";

async function main() {
  const mockTokenAddress = "0x3c839797BA135457Eca83f8C20f2335A817899b5";
  const payPerQueryAddress = "0x0c77e53D988059773D6E18396D449e86cF876687";

  const mockToken = await hre.viem.getContractAt("MockERC20", mockTokenAddress);
  const balance = await mockToken.read.balanceOf([payPerQueryAddress]) as bigint;
  
  console.log("PayPerQuery Contract Address:", payPerQueryAddress);
  console.log("MockERC20 Contract Address:", mockTokenAddress);
  console.log(`Contract USDm Balance: ${formatUnits(balance, 18)} USDm (raw: ${balance.toString()})`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
