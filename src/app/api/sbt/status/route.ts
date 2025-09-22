import { NextRequest } from 'next/server'
import { createPublicClient, http, isAddress, getAddress, type Abi } from 'viem'
import { base } from 'viem/chains'
import fs from 'node:fs/promises'
import path from 'node:path'

type ManifestContracts = {
  EarlyAccessSBT?: { address: `0x${string}`; abi: Abi }
  [key: string]: { address: `0x${string}`; abi: Abi } | undefined
}

type Manifest = {
  chainId: number
  contracts: ManifestContracts
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
  const sbt = manifest.contracts.EarlyAccessSBT
  if (!sbt || /^0x0{40}$/i.test(sbt.address)) {
    return Response.json({ hasBadge: false, reason: 'SBT not configured' })
  }

  const rpc = process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'
  const client = createPublicClient({ chain: base, transport: http(rpc) })
  try {
    const hasBadge = await client.readContract({
      address: sbt.address,
      abi: sbt.abi,
      functionName: 'hasClaimed',
      args: [checksum],
    }) as boolean
    return Response.json({ hasBadge, contract: sbt.address, chainId: manifest.chainId })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Read failed'
    return new Response(msg, { status: 500 })
  }
}

