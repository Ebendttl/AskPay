import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Mainnet deploy of PayPerQuery only.
 *
 * Uses the real USDm stablecoin — DO NOT deploy MockERC20 here.
 * USDm mainnet address verified against:
 *   1. github.com/celo-org/celo-token-list (celo.tokenlist.json)
 *   2. github.com/mento-protocol/mento-web (src/config/tokens.ts)
 *   3. Live eth_call on forno.celo.org → name()="Mento Dollar", symbol()="USDm", decimals()=18
 *
 * Constructor args:
 *   _paymentToken = 0x765DE816845861e75A25fCA122bb6898B8B1282a  (USDm mainnet)
 *   _initialFee   = 10_000_000_000_000_000                      (0.01 USDm, 18 decimals)
 */
const PayPerQueryMainnetModule = buildModule("PayPerQueryMainnetModule", (m) => {
  // Real USDm on Celo mainnet — triple-verified, do not change without re-verification
  const usdmMainnet = "0x765DE816845861e75A25fCA122bb6898B8B1282a";

  // 0.01 USDm = 10^16 (18-decimal token units)
  const initialFee = 10_000_000_000_000_000n;

  const payPerQuery = m.contract("PayPerQuery", [usdmMainnet, initialFee]);

  return { payPerQuery };
});

export default PayPerQueryMainnetModule;
