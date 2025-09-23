import { encodeFunctionData, getAddress, type Abi, type Hex, type PublicClient } from 'viem'

export type ForwardRequest = {
  from: `0x${string}`
  to: `0x${string}`
  value: bigint
  gas: bigint
  nonce: bigint
  data: Hex
}

export const minimalForwarderAbi = [
  { inputs: [{ internalType: 'address', name: 'from', type: 'address' }], name: 'getNonce', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
] as const

export const forwarderTypes = {
  ForwardRequest: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'gas', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'data', type: 'bytes' },
  ],
} as const

export async function buildClaimForwardRequest(opts: {
  account: `0x${string}`
  tokenUri: string
  sbtAddress: `0x${string}`
  sbtAbi: Abi
  forwarder: `0x${string}`
  chainId: number
  publicClient: PublicClient
  gas?: bigint
}): Promise<{ request: ForwardRequest; domain: { name: 'MinimalForwarder'; version: '0.0.1'; chainId: number; verifyingContract: `0x${string}` }; types: typeof forwarderTypes }> {
  const { tokenUri, sbtAbi, chainId, publicClient } = opts
  // Normalize addresses to proper EIP-55 checksum to satisfy viem validation
  const account = getAddress(opts.account) as `0x${string}`
  const sbtAddress = getAddress(opts.sbtAddress) as `0x${string}`
  const forwarder = getAddress(opts.forwarder) as `0x${string}`
  const gas = opts.gas ?? BigInt(200000)
  const nonce = await publicClient.readContract({ address: forwarder, abi: minimalForwarderAbi, functionName: 'getNonce', args: [account] }) as bigint
  const data = encodeFunctionData({ abi: sbtAbi, functionName: 'claim', args: [tokenUri] })
  const request: ForwardRequest = { from: account, to: sbtAddress, value: BigInt(0), gas, nonce, data }
  const domain = { name: 'MinimalForwarder', version: '0.0.1', chainId, verifyingContract: forwarder } as const
  const types = forwarderTypes
  return { request, domain, types }
}

