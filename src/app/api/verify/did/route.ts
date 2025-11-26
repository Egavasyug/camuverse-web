import { NextResponse } from 'next/server'
import { createWalletClient, createPublicClient, http, getAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import { validateFractalPayload, verifyFractalSignature } from './fractal'
import { validatePolygonPayload, verifyPolygonProof } from './polygon'

const camuVerifyAbi = [
  {
    type: 'function',
    name: 'verifyWithCredentialHash',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_user', type: 'address' },
      { name: '_birthYear', type: 'uint16' },
      { name: 'credentialHash', type: 'bytes32' },
    ],
    outputs: [],
  }
] as const

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const provider = (body?.provider || 'polygon').toLowerCase()

    let user: `0x${string}`
    let birthYear: number
    let credentialHash: `0x${string}`

    if (provider === 'fractal') {
      const { ok, error, payload } = validateFractalPayload(body)
      if (!ok || !payload) return NextResponse.json({ ok: false, error: error || 'Invalid payload' }, { status: 400 })
      const sigOk = await verifyFractalSignature(payload)
      if (!sigOk) return NextResponse.json({ ok: false, error: 'Signature verification failed' }, { status: 400 })
      user = payload.user
      birthYear = payload.birthYear
      credentialHash = payload.credentialHash
    } else {
      const { ok, error, payload } = validatePolygonPayload(body)
      if (!ok || !payload) return NextResponse.json({ ok: false, error: error || 'Invalid payload' }, { status: 400 })
      const proofOk = await verifyPolygonProof(payload)
      if (!proofOk) return NextResponse.json({ ok: false, error: 'Proof verification failed' }, { status: 400 })
      user = payload.user
      birthYear = payload.birthYear
      credentialHash = payload.credentialHash
    }

    const CAMU_VERIFY_ADDRESS = process.env.CAMU_VERIFY_ADDRESS
    if (!CAMU_VERIFY_ADDRESS) return NextResponse.json({ ok: false, error: 'CAMU_VERIFY_ADDRESS not set' }, { status: 500 })

    const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY
    const RELAY_RPC_URL = process.env.RELAY_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.ankr.com/base'

    if (!RELAYER_PRIVATE_KEY) {
      return NextResponse.json({ ok: false, error: 'Relayer key not set; cannot write on-chain' }, { status: 501 })
    }

    const account = privateKeyToAccount(RELAYER_PRIVATE_KEY as `0x${string}`)
    const transport = http(RELAY_RPC_URL)
    const pub = createPublicClient({ chain: base, transport })
    const wallet = createWalletClient({ chain: base, transport, account })

    const txHash = await wallet.writeContract({
      address: getAddress(CAMU_VERIFY_ADDRESS),
      abi: camuVerifyAbi,
      functionName: 'verifyWithCredentialHash',
      args: [getAddress(user), birthYear, credentialHash as `0x${string}`],
    })
    await pub.waitForTransactionReceipt({ hash: txHash })

    return NextResponse.json({ ok: true, hash: txHash })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Verification failed'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
