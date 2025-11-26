import { NextResponse } from 'next/server'
import { createPublicClient, createWalletClient, http, getAddress, type Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'

const forwarderAbi = [
  {
    type: 'function',
    stateMutability: 'payable',
    name: 'execute',
    inputs: [
      {
        name: 'req',
        type: 'tuple',
        components: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'gas', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'data', type: 'bytes' }
        ]
      },
      { name: 'signature', type: 'bytes' }
    ],
    outputs: [
      { name: 'success', type: 'bool' },
      { name: 'ret', type: 'bytes' }
    ]
  }
] as const

type IncomingForwardRequest = {
  from: `0x${string}`
  to: `0x${string}`
  value: string | number | bigint
  gas: string | number | bigint
  nonce: string | number | bigint
  data: Hex
}

function toBigIntLike(v: string | number | bigint): bigint {
  if (typeof v === 'bigint') return v
  if (typeof v === 'number') return BigInt(v)
  const s = v.trim()
  return s.startsWith('0x') ? BigInt(s) : BigInt(s)
}

type NormalizedForwardRequest = {
  from: `0x${string}`
  to: `0x${string}`
  value: bigint
  gas: bigint
  nonce: bigint
  data: Hex
}

function normalizeRequest(req: IncomingForwardRequest): NormalizedForwardRequest {
  return {
    from: getAddress(req.from),
    to: getAddress(req.to),
    value: toBigIntLike(req.value),
    gas: toBigIntLike(req.gas),
    nonce: toBigIntLike(req.nonce),
    data: req.data,
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { request: forwardReq, signature } = body || {}
    if (!forwardReq || !signature) {
      return NextResponse.json({ ok: false, error: 'Missing request or signature' }, { status: 400 })
    }

    const rawFwd = process.env.FORWARDER_ADDRESS?.trim()
    const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY as Hex | undefined
    const RELAY_RPC_URL = process.env.RELAY_RPC_URL as string | undefined

    if (!rawFwd) return NextResponse.json({ ok: false, error: 'FORWARDER_ADDRESS not set' }, { status: 500 })
    if (!RELAYER_PRIVATE_KEY || !RELAY_RPC_URL) {
      return NextResponse.json({ ok: false, error: 'Relayer env missing (RELAYER_PRIVATE_KEY/RELAY_RPC_URL)' }, { status: 500 })
    }

    const FORWARDER_ADDRESS = getAddress(rawFwd)

    const account = privateKeyToAccount(RELAYER_PRIVATE_KEY)
    const transport = http(RELAY_RPC_URL)
    const publicClient = createPublicClient({ chain: base, transport })
    const walletClient = createWalletClient({ account, chain: base, transport })

    const reqNormalized = normalizeRequest(forwardReq as IncomingForwardRequest)

    // Pre-send simulation to catch failures (e.g., gate failed, fee mismatch)
    try {
      await publicClient.simulateContract({
        address: FORWARDER_ADDRESS,
        abi: forwarderAbi,
        functionName: 'execute',
        args: [reqNormalized, signature as Hex],
        account: account.address,
      })
    } catch (simErr: unknown) {
      const msg = simErr instanceof Error ? simErr.message : 'Simulation failed'
      return NextResponse.json({ ok: false, error: msg }, { status: 400 })
    }

    const txHash = await walletClient.writeContract({
      address: FORWARDER_ADDRESS,
      abi: forwarderAbi,
      functionName: 'execute',
      args: [reqNormalized, signature as Hex],
      value: BigInt(0)
    })

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
    const chainId = await publicClient.getChainId()

    return NextResponse.json({ ok: true, hash: txHash, blockNumber: Number(receipt.blockNumber), chainId })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Relay failed'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
