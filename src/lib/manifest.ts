import type { Abi } from 'viem'
export type Manifest = {
  network: string
  chainId: number
  updatedAt: string
  contracts: Record<string, { address: `0x${string}`; abi: Abi }>
}

export async function loadManifest(url = '/manifest.base.json'): Promise<Manifest> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to load manifest: ${res.status}`)
  return res.json()
}



