import { NextRequest } from 'next/server'
import { createPublicClient, http, isAddress, getAddress } from 'viem'
import { base } from 'viem/chains'
import fs from 'node:fs/promises'
import path from 'node:path'

type Manifest = {
  chainId: number
  contracts: Record<string, { address: `0x${string}`; abi: any }>
}

async function loadManifest(): Promise<Manifest> {
  const p = path.join(process.cwd(), 'public', 'manifest.base.json')
  const raw = await fs.readFile(p, 'utf8')
  return JSON.parse(raw)
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const wallet = url.searchParams.get('wallet') || ''
  if (!isAddress(wallet)) return new Response('Invalid wallet', { status: 400 })
  const checksum = getAddress(wallet)

  const manifest = await loadManifest()
  const sbt = (manifest.contracts as any).EarlyAccessSBT as { address: `0x${string}`; abi: any } | undefined
  if (!sbt || /^0x0{40}$/i.test(sbt.address)) {
    return Response.json({ hasBadge: false, reason: 'SBT not configured' })
  }

  const rpc = process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'
  const client = createPublicClient({ chain: base, transport: http(rpc) })
  try {
    const hasBadge = await client.readContract({
      address: sbt.address,
      abi: sbt.abi,
      functionName: 'hasClaimed' as any,
      args: [checksum],
    }) as boolean
    return Response.json({ hasBadge, contract: sbt.address, chainId: manifest.chainId })
  } catch (e: any) {
    return new Response(e?.message || 'Read failed', { status: 500 })
  }
}

