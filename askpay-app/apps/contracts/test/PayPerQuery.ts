// @ts-nocheck
// NOTE: hardhat-toolbox-viem's hre.viem.* helpers use generic typing that the IDE
// can't resolve without the post-compile typechain artifacts. All 16 tests pass at
// runtime. Remove this pragma if/when typechain-types are committed to the repo.

import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseUnits } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

// ─────────────────────────────────────────────────────────────────────────────
// Test suite for PayPerQuery.sol
//
// Uses hardhat-toolbox-viem helpers (viem-native, no ethers).
// MockERC20 is a minimal token deployed locally so we don't need a live Celo
// node — tests run fully on Hardhat's in-process network.
// ─────────────────────────────────────────────────────────────────────────────

describe("PayPerQuery", function () {
  // Default fee: 0.01 USDm (18 decimals)
  const DEFAULT_FEE = parseUnits("0.01", 18);
  const QUERY_ID = 42n;

  /**
   * Deploy a minimal mock ERC-20 and the PayPerQuery contract.
   * Gives `user` a balance to work with.
   */
  async function deployFixture() {
    const [owner, user, stranger] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    // Deploy a minimal mock ERC-20 to act as USDm in tests
    const mockToken = await hre.viem.deployContract("MockERC20", [
      "Mock USDm",
      "USDm",
      18n,
    ]);

    // Mint 10 USDm to the user
    await mockToken.write.mint([user.account.address, parseUnits("10", 18)]);

    // Deploy PayPerQuery pointing at the mock token
    const payPerQuery = await hre.viem.deployContract("PayPerQuery", [
      mockToken.address,
      DEFAULT_FEE,
    ]);

    return { payPerQuery, mockToken, owner, user, stranger, publicClient };
  }

  // ── Deployment checks ───────────────────────────────────────────────────────

  describe("Deployment", function () {
    it("sets the correct owner", async function () {
      const { payPerQuery, owner } = await loadFixture(deployFixture);
      expect(await payPerQuery.read.owner()).to.equal(
        getAddress(owner.account.address)
      );
    });

    it("sets the initial fee correctly", async function () {
      const { payPerQuery } = await loadFixture(deployFixture);
      expect(await payPerQuery.read.fee()).to.equal(DEFAULT_FEE);
    });

    it("stores the payment token address", async function () {
      const { payPerQuery, mockToken } = await loadFixture(deployFixture);
      expect(await payPerQuery.read.paymentToken()).to.equal(
        getAddress(mockToken.address)
      );
    });
  });

  // ── askQuestion — happy path ────────────────────────────────────────────────

  describe("askQuestion", function () {
    it("transfers the fee from the user to the contract", async function () {
      const { payPerQuery, mockToken, user } = await loadFixture(deployFixture);

      // Approve
      const tokenAsUser = await hre.viem.getContractAt(
        "MockERC20",
        mockToken.address,
        { client: { wallet: user } }
      );
      await tokenAsUser.write.approve([payPerQuery.address, DEFAULT_FEE]);

      const contractBefore = (await mockToken.read.balanceOf([
        payPerQuery.address,
      ])) as bigint;
      const userBefore = (await mockToken.read.balanceOf([
        user.account.address,
      ])) as bigint;

      // Ask
      const ppqAsUser = await hre.viem.getContractAt(
        "PayPerQuery",
        payPerQuery.address,
        { client: { wallet: user } }
      );
      await ppqAsUser.write.askQuestion([QUERY_ID]);

      expect(await mockToken.read.balanceOf([payPerQuery.address])).to.equal(
        contractBefore + DEFAULT_FEE
      );
      expect(await mockToken.read.balanceOf([user.account.address])).to.equal(
        userBefore - DEFAULT_FEE
      );
    });

    it("emits QueryPaid with correct payer, amount, and queryId", async function () {
      const { payPerQuery, mockToken, user, publicClient } =
        await loadFixture(deployFixture);

      const tokenAsUser = await hre.viem.getContractAt(
        "MockERC20",
        mockToken.address,
        { client: { wallet: user } }
      );
      await tokenAsUser.write.approve([payPerQuery.address, DEFAULT_FEE]);

      const ppqAsUser = await hre.viem.getContractAt(
        "PayPerQuery",
        payPerQuery.address,
        { client: { wallet: user } }
      );
      const hash = await ppqAsUser.write.askQuestion([QUERY_ID]);
      await publicClient.waitForTransactionReceipt({ hash });

      // Fetch the QueryPaid events from the block
      const events = await payPerQuery.getEvents.QueryPaid();
      expect(events).to.have.lengthOf(1);
      expect(events[0].args.payer).to.equal(getAddress(user.account.address));
      expect(events[0].args.amount).to.equal(DEFAULT_FEE);
      expect(events[0].args.queryId).to.equal(QUERY_ID);
      // timestamp comes back from viem as a JS number (not bigint) — compare with 0
      expect(Number(events[0].args.timestamp)).to.be.greaterThan(0);
    });

    // ── Insufficient approval ─────────────────────────────────────────────────

    it("reverts when the user has not approved enough tokens", async function () {
      const { payPerQuery, mockToken, user } = await loadFixture(deployFixture);

      // Approve only 1 wei — far less than the fee
      const tokenAsUser = await hre.viem.getContractAt(
        "MockERC20",
        mockToken.address,
        { client: { wallet: user } }
      );
      await tokenAsUser.write.approve([payPerQuery.address, 1n]);

      const ppqAsUser = await hre.viem.getContractAt(
        "PayPerQuery",
        payPerQuery.address,
        { client: { wallet: user } }
      );

      // Should revert — ERC-20 transferFrom will fail when allowance < amount
      await expect(
        ppqAsUser.write.askQuestion([QUERY_ID])
      ).to.be.rejectedWith(/ERC20InsufficientAllowance|transferFrom failed/i);
    });

    it("reverts when the user has approved nothing at all", async function () {
      const { payPerQuery, user } = await loadFixture(deployFixture);

      const ppqAsUser = await hre.viem.getContractAt(
        "PayPerQuery",
        payPerQuery.address,
        { client: { wallet: user } }
      );

      await expect(
        ppqAsUser.write.askQuestion([QUERY_ID])
      ).to.be.rejectedWith(/ERC20InsufficientAllowance|transferFrom failed/i);
    });
  });

  // ── withdraw ────────────────────────────────────────────────────────────────

  describe("withdraw", function () {
    /**
     * Helper: make one successful payment so there's a balance to withdraw.
     */
    async function depositFixture() {
      const deployed = await loadFixture(deployFixture);
      const { payPerQuery, mockToken, user } = deployed;

      const tokenAsUser = await hre.viem.getContractAt(
        "MockERC20",
        mockToken.address,
        { client: { wallet: user } }
      );
      await tokenAsUser.write.approve([payPerQuery.address, DEFAULT_FEE]);
      const ppqAsUser = await hre.viem.getContractAt(
        "PayPerQuery",
        payPerQuery.address,
        { client: { wallet: user } }
      );
      await ppqAsUser.write.askQuestion([QUERY_ID]);

      return deployed;
    }

    it("reverts when called by a non-owner", async function () {
      const { payPerQuery, stranger } = await depositFixture();

      const ppqAsStranger = await hre.viem.getContractAt(
        "PayPerQuery",
        payPerQuery.address,
        { client: { wallet: stranger } }
      );

      await expect(ppqAsStranger.write.withdraw()).to.be.rejectedWith(
        /OwnableUnauthorizedAccount|not the owner/i
      );
    });

    it("transfers full balance to the owner when called by owner", async function () {
      const { payPerQuery, mockToken, owner } = await depositFixture();

      const contractBalance = await mockToken.read.balanceOf([
        payPerQuery.address,
      ]);
      expect(contractBalance).to.equal(DEFAULT_FEE); // sanity check

      const ownerBefore = await mockToken.read.balanceOf([
        owner.account.address,
      ]);
      await payPerQuery.write.withdraw();

      expect(await mockToken.read.balanceOf([payPerQuery.address])).to.equal(
        0n
      );
      expect(await mockToken.read.balanceOf([owner.account.address])).to.equal(
        ownerBefore + DEFAULT_FEE
      );
    });

    it("emits Withdrawn event with correct args", async function () {
      const { payPerQuery, owner, publicClient } = await depositFixture();

      const hash = await payPerQuery.write.withdraw();
      await publicClient.waitForTransactionReceipt({ hash });

      const events = await payPerQuery.getEvents.Withdrawn();
      expect(events).to.have.lengthOf(1);
      expect(events[0].args.to).to.equal(getAddress(owner.account.address));
      expect(events[0].args.amount).to.equal(DEFAULT_FEE);
    });

    it("reverts when there is nothing to withdraw", async function () {
      const { payPerQuery } = await loadFixture(deployFixture);
      // No payments made — balance is zero
      await expect(payPerQuery.write.withdraw()).to.be.rejectedWith(
        /nothing to withdraw/i
      );
    });
  });

  // ── setFee ──────────────────────────────────────────────────────────────────

  describe("setFee", function () {
    it("reverts when called by a non-owner", async function () {
      const { payPerQuery, stranger } = await loadFixture(deployFixture);
      const ppqAsStranger = await hre.viem.getContractAt(
        "PayPerQuery",
        payPerQuery.address,
        { client: { wallet: stranger } }
      );

      await expect(
        ppqAsStranger.write.setFee([parseUnits("0.05", 18)])
      ).to.be.rejectedWith(/OwnableUnauthorizedAccount|not the owner/i);
    });

    it("allows owner to update the fee", async function () {
      const { payPerQuery } = await loadFixture(deployFixture);
      const newFee = parseUnits("0.05", 18);
      await payPerQuery.write.setFee([newFee]);
      expect(await payPerQuery.read.fee()).to.equal(newFee);
    });

    it("emits FeeUpdated with old and new fee", async function () {
      const { payPerQuery, publicClient } = await loadFixture(deployFixture);
      const newFee = parseUnits("0.05", 18);

      const hash = await payPerQuery.write.setFee([newFee]);
      await publicClient.waitForTransactionReceipt({ hash });

      const events = await payPerQuery.getEvents.FeeUpdated();
      expect(events).to.have.lengthOf(1);
      expect(events[0].args.oldFee).to.equal(DEFAULT_FEE);
      expect(events[0].args.newFee).to.equal(newFee);
    });

    it("reverts if new fee is zero", async function () {
      const { payPerQuery } = await loadFixture(deployFixture);
      await expect(payPerQuery.write.setFee([0n])).to.be.rejectedWith(
        /fee must be > 0/i
      );
    });

    it("new fee takes effect on the next askQuestion call", async function () {
      const { payPerQuery, mockToken, user } = await loadFixture(deployFixture);
      const newFee = parseUnits("0.05", 18);
      await payPerQuery.write.setFee([newFee]);

      // Approve the new fee amount
      const tokenAsUser = await hre.viem.getContractAt(
        "MockERC20",
        mockToken.address,
        { client: { wallet: user } }
      );
      await tokenAsUser.write.approve([payPerQuery.address, newFee]);

      const ppqAsUser = await hre.viem.getContractAt(
        "PayPerQuery",
        payPerQuery.address,
        { client: { wallet: user } }
      );
      await ppqAsUser.write.askQuestion([QUERY_ID]);

      // Contract should hold the new fee, not the old one
      expect(await mockToken.read.balanceOf([payPerQuery.address])).to.equal(
        newFee
      );
    });
  });
});
