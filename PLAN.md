# Camuverse Current Plan (Nov 2025)

## Live state (Base mainnet)
- CreatorFollowerHub deployed: `0x211df9a35DA8806b658D9DADC257584134d293d2` (fees currently in ETH).
- Frontend: follower flows split (`/follow` for fans, `/creator/followers` for creator config). Home CTA links to both.
- CamuVerify extended with `verifyWithCredentialHash`; verifier not yet whitelisted (DAO gating requires CAMC to propose).
- Relayer in place; Supabase URL still missing in Vercel (build warning).
- SBT minted: 3 total (same metadata). DAO/treasury/owner addresses unchanged.
- Liquidity scripts: `seed-liquidity.js` (manual seed), `deploy_liquidity_pool.js` (DAO proposals phases 2–5).

## Next actions (ordered)
1) Seed liquidity & mint CAMC:
   - Mint/hold 50,000 CAMC + 5,000 USDC and run `npx hardhat run scripts/seed-liquidity.js --network base` (LP → treasury 0x2182…70D).
   - Optional: run `deploy_liquidity_pool.js` for later phases (requires CAMC holder proposer).
2) DID/Verifier enablement:
   - Choose verifier EOA, get CAMC to proposer, run `propose-add-verifier.js`, vote/execute.
   - Implement real Polygon ID proof verification in `src/app/api/verify/did/polygon.ts`, then wire the /verify page button.
3) Fees in CAMC (optional upgrade):
   - Update `CreatorFollowerHub` to charge CAMC instead of ETH once CAMC/USDC pool is live; update ABI/manifest/frontend labels.
4) Wallet UX:
   - MetaMask forced targeting done; keep WalletConnect on mobile only. Consider QR-only WalletConnect for desktop if needed.
5) Governance tightening (future):
   - Add an SBT + adult verification gate for DAO propose/vote (CamuVerify + SBT) as a DAO-toggleable setting; keep CAMC weighting.

## Open technical items
- Supabase: set `SUPABASE_URL` in Vercel to clear build warnings.
- Relayer funding: ensure Base ETH for gasless SBT/follow/DID writes.
- Verification UI: /verify is now interactive; proof validation stubs need real verifier logic/keys.
- Manifest: keep syncing after any contract changes (`scripts/export-manifest.js` then copy to `public/manifest.base.json` in frontend).

## Key addresses
- Hub: 0x211df9a35DA8806b658D9DADC257584134d293d2
- Forwarder: 0x344460ac144B55A2b40331AE5497931b41F9886d
- CamuVerify: 0x805fd312C62714a87Bcd15F191D1B4Ce67AefeAd
- SBT: 0x19A271265417D44dB24A0D7982476Ee88BA3dE13
- DAO proxy: 0xF5dbA67c3803833836259720f1cDFd0725468dAc
- Treasury: 0x2182A09c43f153261ECeBb908766FDf23D57f70D
- Deployer/admin: 0x2f85C4fedA8F939B8E4cDCd071B4CF3F3F02ED5E
