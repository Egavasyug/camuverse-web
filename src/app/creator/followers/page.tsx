"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Abi } from "viem"
import { parseEther } from "viem"
import { useAccount, useChainId, useReadContract, useWriteContract } from "wagmi"
import { loadManifest, type Manifest } from "@/lib/manifest"
import { creatorFollowerHubAbi } from "@/lib/abi/creatorFollowerHub"

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
type Cfg = { address: `0x${string}`; abi: Abi }

export default function CreatorFollowersConfigPage() {
  const [manifest, setManifest] = useState<Manifest | null>(null)
  useEffect(() => { loadManifest().then(setManifest).catch(console.error) }, [])

  const hub = manifest ? (manifest.contracts as any).CreatorFollowerHub as Cfg | undefined : undefined

  return (
    <main className="min-h-dvh p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Creator follower config</h1>
          <p className="text-sm text-white/80">Set your mint fee, policy, and metadata URI for your follower SBT.</p>
        </div>
        <Link href="/" className="text-sm underline text-white/80">← Back home</Link>
      </div>
      {hub ? (
        <CreatorConfigPanel hub={hub} />
      ) : (
        <div className="panel-glass rounded-lg p-4">Loading manifest…</div>
      )}
    </main>
  )
}

function CreatorConfigPanel({ hub }: { hub: Cfg }) {
  const { address } = useAccount()
  const chainId = useChainId()
  const { writeContract, isPending } = useWriteContract()
  const [feeInput, setFeeInput] = useState('0')
  const [policyId, setPolicyId] = useState(0)
  const [uri, setUri] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const { data: myConfig } = useReadContract({
    address: hub.address,
    abi: creatorFollowerHubAbi as any,
    functionName: 'creatorConfig',
    args: [(address ?? ZERO_ADDRESS) as `0x${string}`],
    query: { enabled: !!address },
  })

  useEffect(() => {
    if (!myConfig) return
    const [feeWei, pol, uriStr] = myConfig as unknown as [bigint, number, string, boolean]
    setFeeInput(feeWei ? (Number(feeWei) / 1e18).toString() : '0')
    setPolicyId(Number(pol || 0))
    setUri(uriStr || '')
  }, [myConfig])

  return (
    <div className="panel-glass rounded-lg p-5 w-full space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium">Hub</h2>
        <a
          className="text-xs font-mono underline break-all text-white/80"
          href={(chainId === 84532 ? 'https://sepolia.basescan.org/address/' : 'https://basescan.org/address/') + hub.address}
          target="_blank"
          rel="noreferrer"
        >
          {hub.address}
        </a>
      </div>

      <div className="space-y-2 text-sm">
        <p className="font-semibold">Set your config</p>
        <div className="flex flex-wrap gap-2">
          <label className="text-xs text-white/70 flex flex-col gap-1">
            <span>Mint fee (ETH)</span>
            <input className="border px-2 py-1 rounded w-32" placeholder="0.00" value={feeInput} onChange={(e) => setFeeInput(e.target.value)} />
          </label>
          <label className="text-xs text-white/70 flex flex-col gap-1">
            <span>Policy</span>
            <select className="border px-2 py-1 rounded" value={policyId} onChange={(e) => setPolicyId(Number(e.target.value))}>
              <option value={0}>SBT gate</option>
              <option value={1}>SBT + Adult</option>
            </select>
          </label>
          <label className="text-xs text-white/70 flex-1 flex flex-col gap-1">
            <span>Metadata URI (optional)</span>
            <input className="border px-2 py-1 rounded flex-1" placeholder="ipfs://..." value={uri} onChange={(e) => setUri(e.target.value)} />
          </label>
        </div>
        <button
          className="rounded bg-blue-600 text-white px-3 py-1 disabled:opacity-50"
          disabled={!address || isPending}
          onClick={async () => {
            try {
              const feeWei = feeInput ? parseEther(feeInput || '0') : BigInt(0)
              await writeContract({
                address: hub.address,
                abi: creatorFollowerHubAbi as any,
                functionName: 'setConfig',
                args: [feeWei, BigInt(policyId) as any, uri || ''],
              })
              setToast('Config updated')
            } catch (e) {
              console.error(e)
              setToast('Config failed')
            }
          }}
        >
          Save config
        </button>
        <p className="text-xs text-white/70">Policy 0 = SBT only. Policy 1 = SBT + adult verification for both creator and follower. Fees must match exactly.</p>
        <p className="text-xs text-white/60">Fees are paid in ETH in the current hub. CAMC payments would require a contract update.</p>
      </div>
      {toast && <div className="text-xs text-blue-400">{toast}</div>}
    </div>
  )
}
