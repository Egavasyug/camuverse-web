# CammunityDAO Tokenomics & Launch Plan (20M CAMC)

## Overview
CAMC is the governance/utility token for the Camuverse.io creator economy. This plan sets the supply, launch structure, liquidity, and governance steps.

## Token Supply and Allocation
- **Total Supply:** 20,000,000 CAMC  
- **Initial Price Anchor:** $0.01 per CAMC  
- **FDV (anchor):** ~$200,000  

| Allocation | Amount | % | Purpose |
| --- | --- | --- | --- |
| DAO Treasury | 12,000,000 | 60% | Core funding, liquidity expansion, governance reserves |
| Creator Reserve (VestingWrapper) | 4,000,000 | 20% | Verified creators, influencer onboarding, growth incentives |
| Founders & LP Wallets | 2,000,000 | 10% | Early liquidity providers, dev & ops funding |
| Public / Early Access | 2,000,000 | 10% | Airdrops, early backers, ecosystem testing |

## Liquidity Strategy (Base)
- **Initial pool:** 500,000 CAMC + 5,000 USDC (BaseSwap)  
- **Anchor price:** $0.01  
- **Seed funding:** $5,000 USDC (self-funded)  

Phases:
1) Seed deployment: create CAMC/USDC pool, DAO acknowledges contribution, sync pool address in manifest.
2) DAO scaling: quarterly addLiquidity proposals (+2–3% per quarter) funded from treasury.
3) Market integration: register on CMC/CG; promote pairs on BaseSwap/Uniswap/Dackie.

## Creator & Follower Integration
- Verified creators (CamuVerify adult flag) deploy via CreatorTokenFactory; followers mint via CreatorFollowerHub (SBT, gated by SBT + optional adult).
- Each creator sets `mintFeeWei`; fee paid to creator on mint. (Future: DAO cut on premium policy.)

## Verification (Polygon ID path)
- /api/verify/did validates Polygon ID credentials; writes `verifyWithCredentialHash` to CamuVerify.
- Verifier to whitelist: relayer wallet `0x297cfa1563810217d4210275abd2c08330da068e` via DAO proposal.

## Deployment Steps Summary
1) **Mint 20M CAMC** to DAO Treasury (MultiSigTreasury).  
2) **Seed initial liquidity**: 500k CAMC + 5k USDC on Base.  
3) **Update manifest**: `node scripts/export-manifest.js base` and copy to frontend.  
4) **DAO governance**: whitelist verifier; confirm LP scaling policy; assign treasury funding tiers.  
5) **Frontend**: ensure manifest/token display updated; add pool link if desired.  

## Governance
- DAO controls future CAMC mints, treasury/LP expansions, verifier whitelisting, creator/follower incentives.
- Proposals require CAMC holders; stage1 uses CamuVerify; stage2 uses CAMT weight.

## Roadmap (anchor)
| Quarter | Milestone |
| --- | --- |
| Q1 2025 | Liquidity launch (500k CAMC + 5k USDC) |
| Q2 2025 | DID verification live (Polygon ID) |
| Q3 2025 | Creator follower hub open to verified creators |
| Q4 2025 | DAO LP scaling proposals |

## Compliance/addresses
- Treasury: 0x2182A09c43f153261ECeBb908766FDf23D57f70D  
- DAO proxy: 0xF5dbA67c3803833836259720f1cDFd0725468dAc  
- Deployer/admin: 0x2f85C4fedA8F939B8E4cDCd071B4CF3F3F02ED5E  
- Verifier wallet (Polygon ID relayer): 0x297cfa1563810217d4210275abd2c08330da068e  
