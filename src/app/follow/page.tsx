"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Abi } from "viem"
import { formatEther, parseEther } from "viem"
import { useAccount, useChainId, usePublicClient, useReadContract, useWalletClient, useWriteContract } from "wagmi"
import { loadManifest, type Manifest } from "@/lib/manifest"
import { creatorFollowerHubAbi } from "@/lib/abi/creatorFollowerHub"
import { buildFollowForwardRequest } from "@/lib/metaTx"

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
type Cfg = { address: `0x${string}`; abi: Abi }

export default function FollowPage() {
  const [manifest, setManifest] = useState<Manifest | null>(null)
  useEffect(() => { loadManifest().then(setManifest).catch(console.error) }, [])

  const hub = manifest ? (manifest.contracts as any).CreatorFollowerHub as Cfg | undefined : undefined

  return (
    <main className="min-h-dvh p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Creator Followers</h1>
          <p className="text-sm text-white/80">Set your follower config and let fans mint your follower SBTs.</p>
        </div>
        <Link href="/" className="text-sm underline text-white/80">← Back home</Link>
      </div>
      {hub ? (
        <CreatorFollowerPanel hub={hub} />
      ) : (
        <div className="panel-glass rounded-lg p-4">Loading manifest…</div>
      )}
    </main>
  )
}

function CreatorFollowerPanel({ hub }: { hub: Cfg }) {
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { writeContract, isPending } = useWriteContract()

  const forwarder = (process.env.NEXT_PUBLIC_FORWARDER_ADDRESS || '').trim()
  const validHub = hub.address !== ZERO_ADDRESS
  const [feeInput, setFeeInput] = useState('0')
  const [policyId, setPolicyId] = useState(0)
  const [uri, setUri] = useState('')
  const [creatorAddr, setCreatorAddr] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const creatorAddrValid = creatorAddr.trim().startsWith('0x') && creatorAddr.trim().length === 42

  const { data: myConfig } = useReadContract({
    address: hub.address,
    abi: creatorFollowerHubAbi as any,
    functionName: 'creatorConfig',
    args: [(address ?? ZERO_ADDRESS) as `0x${string}`],
    query: { enabled: validHub && !!address },
  })

  const { data: creatorConfigData } = useReadContract({
    address: hub.address,
    abi: creatorFollowerHubAbi as any,
    functionName: 'creatorConfig',
    args: [(creatorAddrValid ? creatorAddr : ZERO_ADDRESS) as `0x${string}`],
    query: { enabled: validHub && creatorAddrValid },
  })

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (!myConfig) return
    const [feeWei, pol, uriStr] = myConfig as unknown as [bigint, number, string, boolean]
    setFeeInput(formatEther(feeWei || BigInt(0)))
    setPolicyId(Number(pol || 0))
    setUri(uriStr || '')
  }, [myConfig])

  if (!validHub) return <div className="panel-glass rounded-lg p-4 text-sm text-red-400">Follower hub not configured.</div>

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

      <div className="grid gap-4 md:grid-cols-2 text-sm">
        <div className="space-y-2">
          <p className="font-semibold">Set your config (creator only)</p>
          <div className="flex flex-wrap gap-2">
            <input className="border px-2 py-1 rounded w-32" placeholder="Fee (ETH)" value={feeInput} onChange={(e) => setFeeInput(e.target.value)} />
            <select className="border px-2 py-1 rounded" value={policyId} onChange={(e) => setPolicyId(Number(e.target.value))}>
              <option value={0}>SBT gate</option>
              <option value={1}>SBT + Adult</option>
            </select>
            <input className="border px-2 py-1 rounded flex-1" placeholder="Metadata URI" value={uri} onChange={(e) => setUri(e.target.value)} />
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
        </div>

        <div className="space-y-2">
          <p className="font-semibold">Follow a creator (gasless)</p>
          <div className="flex flex-wrap gap-2">
            <input className="border px-2 py-1 rounded flex-1" placeholder="Creator address" value={creatorAddr} onChange={(e) => setCreatorAddr(e.target.value)} />
            <button
              className="rounded bg-green-600 text-white px-3 py-1 disabled:opacity-50"
              disabled={!address || !walletClient || !publicClient || !forwarder || !creatorAddrValid || !(creatorConfigData as any)?.[3]}
              onClick={async () => {
                try {
                  if (!publicClient || !walletClient || !address || !forwarder || !chainId) throw new Error('Missing deps')
                  const cfg = creatorConfigData as any
                  if (!cfg || !cfg[3]) throw new Error('Creator has no config')
                  const feeWei = cfg[0] as bigint
                  const { request, domain, types } = await buildFollowForwardRequest({
                    account: address as `0x${string}`,
                    creator: creatorAddr as `0x${string}`,
                    follower: address as `0x${string}`,
                    hubAddress: hub.address,
                    hubAbi: creatorFollowerHubAbi as any,
                    forwarder: forwarder as `0x${string}`,
                    chainId,
                    publicClient,
                    feeWei,
                  })
                  const signature = await walletClient.signTypedData({
                    account: address as `0x${string}`,
                    domain,
                    types: types as any,
                    primaryType: 'ForwardRequest',
                    message: request,
                  })
                  const res = await fetch('/api/creator/follow', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                      request: {
                        ...request,
                        value: request.value.toString(),
                        gas: request.gas.toString(),
                        nonce: request.nonce.toString(),
                      },
                      signature,
                    }),
                  })
                  if (!res.ok) throw new Error(await res.text())
                  const json = await res.json()
                  setToast(json?.ok ? 'Follow minted (relayed)' : 'Follow failed')
                } catch (e) {
                  console.error(e)
                  setToast(e instanceof Error ? e.message : 'Follow failed')
                }
              }}
            >
              Follow (gasless)
            </button>
          </div>
          <div className="rounded bg-white/5 p-2 text-xs text-white/80 space-y-1">
            <p className="font-semibold">Creator config preview</p>
            {creatorConfigData && (creatorConfigData as any)[3] ? (
              <>
                <p>Fee: {formatEther((creatorConfigData as any)[0] as bigint)} ETH</p>
                <p>Policy: {(creatorConfigData as any)[1] === 1 ? 'SBT + Adult' : 'SBT only'}</p>
                <p className="break-all">Metadata URI: {(creatorConfigData as any)[2] || 'not set'}</p>
              </>
            ) : (
              <p className="text-white/60">Enter a creator address to load their config.</p>
            )}
          </div>
          <p className="text-xs text-white/70">Requires SBT. If policy is 1, follower must also be adult-verified.</p>
        </div>
      </div>
      {toast && <div className="text-xs text-blue-400">{toast}</div>}
    </div>
  )
}
