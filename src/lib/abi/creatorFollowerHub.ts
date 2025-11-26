export const creatorFollowerHubAbi = [
  {
    type: 'function',
    name: 'setConfig',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'feeWei', type: 'uint256' },
      { name: 'policyId', type: 'uint8' },
      { name: 'uri', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'mintFollower',
    stateMutability: 'payable',
    inputs: [
      { name: 'creator', type: 'address' },
      { name: 'to', type: 'address' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'revoke',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'follower', type: 'address' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'checkGate',
    stateMutability: 'view',
    inputs: [
      { name: 'creator', type: 'address' },
      { name: 'follower', type: 'address' },
    ],
    outputs: [{ name: 'ok', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'creatorConfig',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [
      { name: 'feeWei', type: 'uint256' },
      { name: 'policyId', type: 'uint8' },
      { name: 'uri', type: 'string' },
      { name: 'exists', type: 'bool' },
    ],
  },
] as const
