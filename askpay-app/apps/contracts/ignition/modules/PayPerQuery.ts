// SPDX-License-Identifier: MIT
/**
 * Hardhat Ignition deploy module for PayPerQuery.
 *
 * Usage:
 *   # Celo Sepolia (test first):
 *   npx hardhat ignition deploy ignition/modules/PayPerQuery.ts \
 *     --network celo-sepolia \
 *     --parameters ignition/params/celo-sepolia.json
 *
 *   # Celo Mainnet (after Sepolia testing is confirmed):
 *   npx hardhat ignition deploy ignition/modules/PayPerQuery.ts \
 *     --network celo \
 *     --parameters ignition/params/celo-mainnet.json
 *
 * Constructor args:
 *   - paymentToken: USDm token address on the target network
 *   - initialFee:   Fee in token wei (18 decimals).
 *                   Default = 0.01 USDm = 10_000_000_000_000_000
 */

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// 0.01 USDm expressed in 18-decimal wei
const DEFAULT_FEE = 10_000_000_000_000_000n; // 1e16

const PayPerQueryModule = buildModule("PayPerQueryModule", (m) => {
  // These are overridden at deploy time via --parameters JSON file.
  // See ignition/params/ for per-network values.
  const paymentToken = m.getParameter<string>("paymentToken");
  const initialFee = m.getParameter("initialFee", DEFAULT_FEE);

  const payPerQuery = m.contract("PayPerQuery", [paymentToken, initialFee]);

  return { payPerQuery };
});

export default PayPerQueryModule;
