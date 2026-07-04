# Proof of Ship — Scoring Checklist
*What actually earns points, straight from Celo's own program docs. Keep every build decision checked against this — the goal is a top-10 monthly rank, and scoring is narrower and more mechanical than a typical hackathon judge panel.*

---

## What is scored (nothing else counts)

**1. Onchain activity and impact on Celo mainnet**
- Fees generated (through the deployed contract)
- Transaction count
- Unique active users

**2. GitHub development activity**
- Unique days with contributions
- Total number of contributions
- MiniPay-specific dependencies and code usage

**3. NPM package downloads**
- Downloads of any npm package published by the registered repository

All data is pulled automatically from the smart contracts and GitHub repos submitted during project registration — nothing is scored from sources not explicitly linked to the project.

---

## Hard eligibility requirements

- [ ] Project deployed on **Celo Mainnet** (not just testnet)
- [ ] Smart contract(s) **verified** (e.g. on Celoscan)
- [ ] Project is **open source** with a public GitHub repository (private repos are now supported for activity tracking, but public is the norm/expected)
- [ ] Project must NOT already be listed on MiniPay (disqualifies from rewards)
- [ ] Code is the IP of your team, but must be open source so it can be tracked/evaluated

---

## What boosts score without being mandatory

- MiniPay hook implementation (`window.ethereum.isMiniPay` detection) — explicit booster
- Self Protocol / Proof-of-Humanity verification on your Talent Protocol profile — "nice to have," not required

---

## What NOT to build (explicitly discouraged by the program)

- Demos with no real functionality
- Farming tools / engagement bots
- **Solo-builder DeFi apps** (regulatory/audit burden too high for one person — this is why AskPay avoids any custodial/pooled logic)
- Reward-farming apps
- Apps that just deploy contracts/GMs/NFTs with no clear outcome
- Generic "ecosystem engagement" apps not tied to a real product

## What IS explicitly wanted

- Games
- Utility apps
- **AI Agents with MiniPay use cases — specifically "pay as you go" access to LLMs/image tools as an alternative to subscriptions** (this is literally AskPay's concept)
- B2C apps focused on user onboarding

---

## Registration flow (do this before/alongside building, not after)

1. Create builder profile on talent.app (done)
2. Create a project page on talent.app (done — "AskPay")
3. Add project details + website (in progress)
4. **Connect GitHub repo** — this is what starts the "unique days with contributions" clock. Do this as early as possible, even with just a scaffold commit.
5. Add at least one verified Celo mainnet smart contract address (once deployed)
6. Register the project specifically for the active Proof of Ship campaign (separate step from just creating the project)

---

## Reward structure (for context/motivation, not a build decision)

- $5,000 USDT pool per month, split among Top 50 projects, proportional to score
- Top 10 share 50% of the pool
- Top 3 additionally get 15-min priority mentor access
- Monthly #1 gets a one-time (per season) user-incentives/badge bonus
- **Cap: 2,000 USDT per project across the entire season** (April–July 2026) — relevant if deciding whether to keep pushing one project vs. starting a second after hitting the cap
- Rewards claimed via a MiniPay payout mini-app (or an alternative if MiniPay isn't available in your country)
- Leaderboard updates **weekly** — check `celo.builderscore.xyz` regularly, not just at month-end

---

## Weekly build rhythm (matches how the program is structured)

- **Week 1 — Scope:** define what you're building, share early, get mentor feedback
- **Week 2 — Ship:** build and share progress publicly (Telegram/socials)
- **Week 3 — Refine:** use real usage data to improve before the final snapshot
- **Week 4 — Present:** polish, optional demo video, prepare for leaderboard finalization
