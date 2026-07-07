// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PayPerQuery
 * @notice Pay-gate contract for AskPay — users pay a small USDm fee per AI query.
 *
 * Flow:
 *   1. User calls `approve(address(this), fee)` on the USDm token contract.
 *   2. User calls `askQuestion(queryId)` on this contract.
 *   3. This contract pulls `fee` USDm from the user via `transferFrom`.
 *   4. Emits `QueryPaid(payer, amount, queryId, timestamp)`.
 *   5. Backend API verifies the event on-chain before serving the LLM response.
 *
 * Payment currency: USDm (18 decimals) on Celo mainnet / Celo Sepolia.
 * Do NOT mix up with USDC/USDT which use 6 decimals.
 *
 * Design constraints (intentional — see AskPay project spec):
 *   - No staking, lending, or yield logic.
 *   - No pooled/custodial fund logic beyond simple accumulated balance.
 *   - No upgradability / proxy pattern.
 *   - Uses OpenZeppelin Ownable v5 (initialOwner passed to constructor).
 */
contract PayPerQuery is Ownable {
    // ── State ────────────────────────────────────────────────────────────────

    /// @notice The ERC-20 token accepted as payment (USDm, 18 decimals).
    IERC20 public immutable paymentToken;

    /// @notice Fee per query in payment token units (18-decimal wei).
    ///         Default: 0.01 USDm = 10_000_000_000_000_000 (1e16).
    uint256 public fee;

    // ── Events ───────────────────────────────────────────────────────────────

    /**
     * @notice Emitted on every successful query payment.
     * @param payer   The address that paid.
     * @param amount  The fee amount pulled (in token wei, 18 decimals).
     * @param queryId Unique ID for this query (generated client-side).
     * @param timestamp Block timestamp at time of payment.
     */
    event QueryPaid(
        address indexed payer,
        uint256 amount,
        uint256 indexed queryId,
        uint256 timestamp
    );

    /**
     * @notice Emitted when the owner updates the per-query fee.
     */
    event FeeUpdated(uint256 oldFee, uint256 newFee);

    /**
     * @notice Emitted when the owner withdraws accumulated funds.
     */
    event Withdrawn(address indexed to, uint256 amount);

    // ── Constructor ──────────────────────────────────────────────────────────

    /**
     * @param _paymentToken Address of the USDm token on the target network.
     * @param _initialFee   Initial per-query fee in token wei.
     *                      Example: 10_000_000_000_000_000 = 0.01 USDm.
     *
     * Note: OZ Ownable v5 requires passing initialOwner explicitly.
     * `msg.sender` at deploy time becomes the owner.
     */
    constructor(address _paymentToken, uint256 _initialFee)
        Ownable(msg.sender)
    {
        require(_paymentToken != address(0), "PayPerQuery: zero token address");
        require(_initialFee > 0, "PayPerQuery: fee must be > 0");
        paymentToken = IERC20(_paymentToken);
        fee = _initialFee;
    }

    // ── User-facing ──────────────────────────────────────────────────────────

    /**
     * @notice Pay the per-query fee and record the query on-chain.
     *
     * Prerequisites (caller must do this before calling askQuestion):
     *   paymentToken.approve(address(this), fee)
     *
     * @param queryId A unique identifier for this query, generated client-side.
     *                The backend API uses this to look up the QueryPaid event.
     */
    function askQuestion(uint256 queryId) external {
        uint256 amount = fee; // cache to avoid repeated SLOAD

        // Pull payment from caller. Reverts if allowance < amount or balance insufficient.
        bool ok = paymentToken.transferFrom(msg.sender, address(this), amount);
        require(ok, "PayPerQuery: transferFrom failed");

        emit QueryPaid(msg.sender, amount, queryId, block.timestamp);
    }

    // ── Owner-only ───────────────────────────────────────────────────────────

    /**
     * @notice Withdraw the full USDm balance accumulated in this contract.
     *         Only callable by the owner.
     */
    function withdraw() external onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "PayPerQuery: nothing to withdraw");

        bool ok = paymentToken.transfer(owner(), balance);
        require(ok, "PayPerQuery: transfer failed");

        emit Withdrawn(owner(), balance);
    }

    /**
     * @notice Update the per-query fee.
     *         Only callable by the owner.
     * @param newFee New fee in token wei (must be > 0).
     */
    function setFee(uint256 newFee) external onlyOwner {
        require(newFee > 0, "PayPerQuery: fee must be > 0");
        uint256 oldFee = fee;
        fee = newFee;
        emit FeeUpdated(oldFee, newFee);
    }
}
