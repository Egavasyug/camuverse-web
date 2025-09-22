"use client"

import type { Abi } from "viem"
import { useEffect, useMemo, useState } from "react"
import type React from 'react'
import { loadManifest, type Manifest } from "@/lib/manifest"
import { useAccount, useReadContract, usePublicClient, useWalletClient, useChainId } from "wagmi"
import { buildClaimForwardRequest } from "@/lib/metaTx"

type Cfg = { address: `0x${string}`; abi: Abi }
const AppKitButton = 'appkit-button' as unknown as React.ComponentType<React.HTMLAttributes<HTMLElement>>

export default function Home() {
  const [manifest, setManifest] = useState<Manifest | null>(null)
  useEffect(() => { loadManifest().then(setManifest).catch(console.error) }, [])

  return (
    <main className="min-h-dvh p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Camuverse</h1>
        <AppKitButton />
      </div>
      <SubscriberPanel manifest={manifest} />
      {manifest ? <Dashboard manifest={manifest} /> : <div>Loading manifest?</div>}
    </main>
  )
}

function Dashboard({ manifest }: { manifest: Manifest }) {
  const { address } = useAccount()
  const dao: Cfg = manifest.contracts.CammunityDAO
  const wrapper: Cfg | undefined = (manifest.contracts as any).VestingWrapper

  const { data: proposalCount } = useReadContract({
    address: dao.address,
    abi: dao.abi,
    functionName: "proposalCount",
  })

  const { data: tokensUnlocked } = useReadContract({
    address: (wrapper?.address ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
    abi: (wrapper?.abi ?? []) as any,
    functionName: "getUnlockedTokens" as any,
    args: [(address ?? '0x0000000000000000000000000000000000000000') as `0x${string}`] as const,
    query: { enabled: !!(wrapper && address) },
  })

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="DAO">
        <Row label="Proxy Address" value={dao.address} />
        <Row label="Proposals" value={String(proposalCount ?? "?")} />
      </Card>
      {wrapper && (
        <Card title="Vesting Wrapper">
          <Row label="Proxy Address" value={wrapper.address} />
          <Row label="Your Unlocked Tokens" value={address ? String(tokensUnlocked ?? "0") : "Connect wallet"} />
        </Card>
      )}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 bg-white/50 dark:bg-zinc-900/50">
      <h2 className="text-lg font-medium mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-mono break-all">{value}</span>
    </div>
  )
}

function SubscriberPanel({ manifest }: { manifest: Manifest | null }) {
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const sbt: Cfg | undefined = manifest ? (manifest.contracts as any).EarlyAccessSBT : undefined
  const zero = '0x0000000000000000000000000000000000000000'
  const validSbt = !!(sbt && sbt.address.toLowerCase() !== zero)
  const enabled = !!(validSbt && address)

  const { data: hasBadge, refetch } = useReadContract({
    address: (validSbt ? (sbt as Cfg).address : zero) as `0x${string}`,
    abi: (validSbt ? (sbt as Cfg).abi : []) as any,
    functionName: 'hasClaimed' as any,
    args: [(address ?? '0x0000000000000000000000000000000000000000') as `0x${string}`],
    query: { enabled },
  })

  const { data: subNo, refetch: refetchSub } = useReadContract({
    address: (validSbt ? (sbt as Cfg).address : zero) as `0x${string}`,
    abi: (validSbt ? (sbt as Cfg).abi : []) as any,
    functionName: 'getSubscriberNo' as any,
    args: [(address ?? '0x0000000000000000000000000000000000000000') as `0x${string}`],
    query: { enabled },
  })

  const tokenUri = useMemo(() => process.env.NEXT_PUBLIC_SBT_TOKEN_URI || 'ipfs://example.com/subscriber-badge.json', [])
  const forwarder = process.env.NEXT_PUBLIC_FORWARDER_ADDRESS as `0x${string}` | undefined
  const [toast, setToast] = useState<string | null>(null)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  if (!validSbt) return null
  return (
    <div className="rounded-lg border border-gray-200 p-4 bg-white/50 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium">Subscriber Badge Token</h2>
        <span className="text-xs text-gray-600">{sbt.address}</span>
      </div>
      <div className="text-sm flex items-center gap-3 flex-wrap">
        <span>Status: {address ? (hasBadge ? 'Claimed' : 'Not claimed') : 'Connect wallet'}</span>
        {address && hasBadge && (
          <span>Subscriber #: {Number(subNo || 0) > 0 ? String(subNo) : '-'}</span>
        )}
        {address && hasBadge === false && (
          <button
            disabled={!forwarder || !walletClient || !publicClient || !chainId}
            onClick={async () => {
              try {
                if (!forwarder || !walletClient || !publicClient || !chainId || !address) return
                const { request, domain, types } = await buildClaimForwardRequest({
                  account: address as `0x${string}`,
                  tokenUri,
                  sbtAddress: sbt.address,
                  sbtAbi: sbt.abi as any,
                  forwarder,
                  chainId,
                  publicClient,
                })
                const signature = await walletClient.signTypedData({
                  account: address as `0x${string}`,
                  domain,
                  types: types as any,
                  primaryType: 'ForwardRequest',
                  message: request,
                })
                const res = await fetch('/api/relay/claim', {
                  method: 'POST', headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({ request, signature }),
                })
                if (!res.ok) throw new Error(await res.text())
                const json = await res.json()
                if (json?.hash && publicClient) {
                  await publicClient.waitForTransactionReceipt({ hash: json.hash as `0x${string}` })
                }
                await refetch?.()
                const r = await refetchSub?.()
                const n = Number((r as any)?.data ?? subNo ?? 0)
                if (n > 0) setToast(`Claim successful - Subscriber #${n}`)
              } catch (e) {
                console.error(e)
              }
            }}
            className="rounded-md bg-blue-600 text-white text-xs px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50"
          >
            Claim Badge
          </button>
        )}
      </div>
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-md bg-black text-white text-sm px-4 py-2 shadow-lg">
          <span>{toast}</span>
          <button className="ml-3 text-white/80 hover:text-white" onClick={() => setToast(null)}>x</button>
        </div>
      )}
    </div>
  )
}
