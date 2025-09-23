import { NextResponse } from 'next/server'
import { createPublicClient, createWalletClient, http, decodeEventLog, getAddress, type Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import { supabaseAdmin } from '@/lib/supabaseServer'

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

const erc721Events = [
  {
    type: 'event',
    name: 'Transfer',
    anonymous: false,
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true }
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

    // Pre-send simulation to catch inner failures (e.g., already claimed, wrong forwarder, out of gas)
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

    type TransferArgs = { from: `0x${string}`; to: `0x${string}`; tokenId: bigint }
    const sbt = reqNormalized.to.toLowerCase()
    let tokenId: string | null = null
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== sbt) continue
      try {
        const decoded = decodeEventLog({ abi: erc721Events, data: log.data, topics: log.topics })
        if (decoded.eventName === 'Transfer') {
          const tid = (decoded.args as TransferArgs).tokenId
          tokenId = tid?.toString() ?? null
          break
        }
      } catch {
        // ignore non-matching logs
      }
    }

    if (supabaseAdmin) {
      const payload = {
        wallet: reqNormalized.from,
        contract: reqNormalized.to,
        token_id: tokenId,
        tx_hash: txHash,
        block_number: Number(receipt.blockNumber),
        chain_id: chainId,
        created_at: new Date().toISOString()
      }
      await supabaseAdmin.from('sbt_claims').insert(payload)
    }

    if (!tokenId) {
      return NextResponse.json({ ok: false, hash: txHash, error: 'Mint did not emit Transfer event; inner call likely failed', blockNumber: Number(receipt.blockNumber), chainId }, { status: 500 })
    }

    return NextResponse.json({ ok: true, hash: txHash, tokenId, blockNumber: Number(receipt.blockNumber), chainId })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Relay failed'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
