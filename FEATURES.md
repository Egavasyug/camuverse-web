# Camuverse Creator Follower Hub (Deployed on Base)

- **Hub address:** `0x211df9a35DA8806b658D9DADC257584134d293d2` (Base mainnet)
- **Purpose:** Single ERC1155-style, soulbound follower hub keyed by creator address. Followers mint per-creator IDs; creators configure fees/policies and can revoke.

## Gating & Roles
- **Prereqs (creator):** Must hold Camuverse SBT; adult flag required for adult policy.
- **Prereqs (follower):** Must hold Camuverse SBT; adult flag required when policy > 0.
- **Policies:** `policyId 0 = SBT gate`, `policyId 1 = SBT + adult` (CamuVerify).

## Creator Controls
- `setConfig(feeWei, policyId, uri)` — set exact mint fee, gating policy, and metadata URI.
- `setDefaultUri(uri)` — owner-only default URI fallback.
- `revoke(follower)` — burn follower’s SBT for this creator.

## Follower Mint
- `mintFollower(creator, follower)` (payable): requires exact `feeWei`; checks gating; forwards fee to creator; mints soulbound balance for tokenId = uint160(creator).
- Transfers/approvals are disabled (SBT semantics).

## Gasless Support
- ERC2771 trusted forwarder enabled. Frontend uses the existing forwarder + relayer:
  - Build signed `ForwardRequest` for `mintFollower`
  - Relay via `/api/creator/follow`
  - Env: `FORWARDER_ADDRESS`, `RELAYER_PRIVATE_KEY`, `RELAY_RPC_URL`

## Frontend/UI
- Manifest updated (`public/manifest.base.json`) with hub ABI/address.
- Home page panel: set creator config; gasless follow (requires forwarder/relayer envs).
- Verify page outlines planned Fractal/Polygon ID integration for adult flag.

## Deployment Script
- `scripts/deploy-creator-follower-hub.js`
  - Env: `FORWARDER_ADDRESS`, `SBT_ADDRESS`, `CAMU_VERIFY_ADDRESS`, `GATING_REGISTRY_ADDRESS`, `FOLLOWER_DEFAULT_URI`.
  - Records to `deployments/<network>.json`; manifest export picks it up.

## Next Steps
- (Optional) Add revocation UI.
- Verify relayer envs and fund relayer for gasless flow.
- Consider collapsing/retiring per-creator SBT clone path if not needed.
