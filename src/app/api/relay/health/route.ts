import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const hasForwarder = !!(process.env.FORWARDER_ADDRESS && process.env.FORWARDER_ADDRESS.trim())
    const hasRelayerKey = !!process.env.RELAYER_PRIVATE_KEY
    const hasRelayUrl = !!process.env.RELAY_RPC_URL

    let rpcOk = false
    let chainId: number | null = null
    if (hasRelayUrl) {
      try {
        const client = createPublicClient({ chain: base, transport: http(process.env.RELAY_RPC_URL as string) })
        chainId = await client.getChainId()
        rpcOk = true
      } catch {
        rpcOk = false
      }
    }

    return NextResponse.json({
      ok: hasForwarder && hasRelayerKey && hasRelayUrl && rpcOk,
      env: {
        FORWARDER_ADDRESS: hasForwarder,
        RELAYER_PRIVATE_KEY: hasRelayerKey,
        RELAY_RPC_URL: hasRelayUrl,
      },
      rpcOk,
      chainId,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'health failed'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

