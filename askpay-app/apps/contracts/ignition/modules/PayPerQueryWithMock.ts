import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Hardhat Ignition module to deploy MockERC20 and PayPerQuery on Celo Sepolia.
 *
 * MockERC20 represents a test-only USDm stablecoin stand-in (18 decimals).
 * PayPerQuery is the pay-gate contract configured with the mock token and 0.01 initial fee.
 */
const PayPerQueryWithMockModule = buildModule("PayPerQueryWithMockModule", (m) => {
  // Deploy MockERC20
  // constructor arguments: string name_, string symbol_, uint8 decimals_
  const mockToken = m.contract("MockERC20", ["Mock USDm", "USDm", 18]);

  // Initial fee: 0.01 USDm = 10^16 token units (18 decimals)
  const initialFee = m.getParameter("initialFee", 10_000_000_000_000_000n);

  // Deploy PayPerQuery
  // constructor arguments: address _paymentToken, uint256 _initialFee
  const payPerQuery = m.contract("PayPerQuery", [mockToken, initialFee]);

  return { mockToken, payPerQuery };
});

export default PayPerQueryWithMockModule;
