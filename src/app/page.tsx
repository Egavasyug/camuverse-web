"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Abi } from "viem"
import { useEffect, useMemo, useState } from "react"
import type React from 'react'
import Link from 'next/link'
import { loadManifest, type Manifest } from "@/lib/manifest"
import { useAccount, useReadContract, useWriteContract, usePublicClient, useWalletClient, useChainId } from "wagmi"
import { buildClaimForwardRequest } from "@/lib/metaTx"

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

type Cfg = { address: `0x${string}`; abi: Abi }

export default function Home() {
  const [manifest, setManifest] = useState<Manifest | null>(null)
  useEffect(() => { loadManifest().then(setManifest).catch(console.error) }, [])

  return (
    <main className="min-h-dvh p-6 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-center">
        <h1 className="hero-title text-2xl font-semibold text-center">Camuverse: Enabling decentralized creator monetization!</h1>
      </div>
      <BusinessNotice />
      <GetVerifiedNotice />
      <VerificationRequirements />
      <SubscriberPanel manifest={manifest} />
      <CreatorFollowerPanel manifest={manifest} />
      {manifest ? <Dashboard manifest={manifest} /> : <div>Loading manifest?</div>}
      <FooterContact />
    </main>
  )
}

function BusinessNotice() {
  return (
    <div className="w-full max-w-3xl mx-auto panel-glass rounded-lg p-4 text-sm text-white/90 text-center">
      <p className="font-semibold">Operated by Cammunity DAO LLC</p>
      <p>Contact: <a href="mailto:info@camuverse.io" className="underline">info@camuverse.io</a></p>
    </div>
  )
}

function Dashboard({ manifest }: { manifest: Manifest }) {
  const { address } = useAccount()
  const chainId = useChainId()
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
        <Row label="Proxy Address" value={
            <a
              href={(chainId === 84532 ? 'https://sepolia.basescan.org/address/' : 'https://basescan.org/address/') + dao.address}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-mono underline break-all text-white/90 ml-2"
            >
              {dao.address}
            </a>
          } />
        <Row label="Proposals" value={String(proposalCount ?? "?")} />
      </Card>
      {wrapper && (
        <Card title="Vesting Wrapper">
          <Row label="Proxy Address" value={
            <a
              href={(chainId === 84532 ? 'https://sepolia.basescan.org/address/' : 'https://basescan.org/address/') + wrapper.address}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-mono underline break-all text-white/90 ml-2"
            >
              {wrapper.address}
            </a>
          } />
          <Row label="Your Unlocked Tokens" value={address ? String(tokensUnlocked ?? "0") : "Connect wallet"} />
        </Card>
      )}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel-glass rounded-lg p-4">
      <h2 className="text-lg font-medium mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-white/70">{label}</span>
      <span className="font-mono break-all text-white">{value}</span>
    </div>
  )
}

function GetVerifiedNotice() {
  const { address } = useAccount()
  if (!address) return null
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-900 p-3 text-sm flex items-center justify-between">
      <span>Verification status: Not verified (CamuVerify placeholder)</span>
      <Link href="/verify" className="rounded bg-amber-600 text-white px-3 py-1.5 text-xs hover:bg-amber-700">Get Verified</Link>
    </div>
  )
}

function VerificationRequirements() {
  return (
    <div className="panel-glass rounded-lg p-4 text-sm w-full">
      <h2 className="text-base font-semibold mb-2">Verification & requirements</h2>
      <ul className="list-disc list-inside space-y-1 text-white/80">
        <li>All users need the Camuverse Subscriber Badge (SBT) to interact.</li>
        <li>Creators must hold the SBT to set their follower config.</li>
        <li>Adult creators (policy 1) must be age-verified in CamuVerify; their followers must also be adult-verified.</li>
      </ul>
      <div className="mt-2 text-xs text-white/70">
        <Link href="/verify" className="underline">Go to verification</Link> (Polygon ID/credential flow coming soon).
      </div>
    </div>
  )
}

function SubscriberPanel({ manifest }: { manifest: Manifest | null }) {
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { writeContract, isPending } = useWriteContract()
  const sbt: Cfg | undefined = manifest ? (manifest.contracts as any).EarlyAccessSBT : undefined
  const validSbt = !!(sbt && sbt.address.toLowerCase() !== ZERO_ADDRESS)
  const enabled = !!(validSbt && address)

  const { data: hasBadge, refetch } = useReadContract({
    address: (validSbt ? (sbt as Cfg).address : ZERO_ADDRESS) as `0x${string}`,
    abi: (validSbt ? (sbt as Cfg).abi : []) as any,
    functionName: 'hasClaimed' as any,
    args: [(address ?? ZERO_ADDRESS) as `0x${string}`],
    query: { enabled },
  })

  const { data: subNo, refetch: refetchSub } = useReadContract({
    address: (validSbt ? (sbt as Cfg).address : ZERO_ADDRESS) as `0x${string}`,
    abi: (validSbt ? (sbt as Cfg).abi : []) as any,
    functionName: 'getSubscriberNo' as any,
    args: [(address ?? ZERO_ADDRESS) as `0x${string}`],
    query: { enabled },
  })

  const tokenUri = useMemo(() => process.env.NEXT_PUBLIC_SBT_TOKEN_URI || 'ipfs://example.com/subscriber-badge.json', [])
  const forwarder = process.env.NEXT_PUBLIC_FORWARDER_ADDRESS as `0x${string}` | undefined
  const gaslessDefault = (process.env.NEXT_PUBLIC_GASLESS || '').toLowerCase() === 'true'
  const [gasless, setGasless] = useState(gaslessDefault)
  const [toast, setToast] = useState<string | null>(null)
  const [toastDetails, setToastDetails] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [localHasBadge, setLocalHasBadge] = useState<boolean | null>(null)
  const [localSubNo, setLocalSubNo] = useState<number | null>(null)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  if (!validSbt) return null
  return (
    <div className="panel-glass rounded-lg p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h2 className="text-lg font-medium">Subscriber Badge Token</h2>
        <a
          href={(chainId === 84532 ? 'https://sepolia.basescan.org/address/' : 'https://basescan.org/address/') + sbt.address}
          target="_blank" rel="noreferrer"
          className="text-sm font-mono underline break-all text-white/90 ml-2"
        >
          {sbt.address}
        </a>
      </div>
      <div className="text-sm flex items-center gap-3 flex-wrap">
        <span>Status: {address ? ((localHasBadge ?? (hasBadge as unknown as boolean)) ? 'Claimed' : 'Not claimed') : 'Connect wallet'}</span>
        {address && (localHasBadge ?? (hasBadge as unknown as boolean)) === true && (
          <span>
            Subscriber #:
            {(localSubNo ?? Number(subNo || 0)) > 0 ? (
              <>
                {' '}{String(localSubNo ?? Number(subNo || 0))}{' '}
                <a
                  className="text-sm font-mono underline break-all text-white/90 ml-2"
                  href={
                    (chainId === 84532 ? 'https://sepolia.basescan.org' : 'https://basescan.org') +
                    '/nft/' + sbt.address + '/' + String(localSubNo ?? Number(subNo || 0))
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Basescan
                </a>
              </>
            ) : ' -'}
          </span>
        )}
        {address && (localHasBadge ?? (hasBadge as unknown as boolean)) === false && (
          <>
            <button
              disabled={isPending}
              onClick={async () => {
                try {
                  if (gasless && forwarder && walletClient && publicClient && chainId) {
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
                      body: JSON.stringify({ request, signature }, (_k, v) => typeof v === 'bigint' ? v.toString() : v),
                    })
                    if (!res.ok) throw new Error(await res.text())
                    const json = await res.json()
                    if (json?.hash && publicClient) {
                      await publicClient.waitForTransactionReceipt({ hash: json.hash as `0x${string}` })
                    }
                    if (json?.tokenId) setLocalSubNo(Number(json.tokenId))
                    setLocalHasBadge(true)
                    await refetch?.()
                    const r = await refetchSub?.()
                    const n = Number((r as any)?.data ?? subNo ?? localSubNo ?? 0)
                    if (n > 0) { setLocalSubNo(n); setToast(`Claim successful - Subscriber #${n}`) }
                  } else {
                    const txHash = (await writeContract({ address: sbt.address, abi: sbt.abi, functionName: 'claim', args: [tokenUri] } as any) as unknown) as `0x${string}`
                    if (publicClient) {
                      await publicClient.waitForTransactionReceipt({ hash: txHash })
                    }
                    setLocalHasBadge(true)
                    await refetch?.()
                    const r2 = await refetchSub?.()
                    const n2 = Number((r2 as any)?.data ?? subNo ?? localSubNo ?? 0)
                    if (n2 > 0) { setLocalSubNo(n2); setToast(`Claim successful - Subscriber #${n2}`) }
                  }
                } catch (e) {
                  console.error(e)
                  const msg = e instanceof Error ? e.message : 'Claim failed'
                  setToast(msg)
                  setToastDetails(String((e as any)?.stack || (e as any)?.message || e))
                }
              }}
              className="rounded-md bg-blue-600 text-white text-xs px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Claiming...' : (gasless && forwarder ? 'Claim Gasless' : 'Claim Badge')}
            </button>
            <label className="ml-3 inline-flex items-center gap-1 text-xs">
              <input type="checkbox" checked={gasless} onChange={(e) => setGasless(e.target.checked)} /> Gasless
            </label>
          </>
        )}
      </div>
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-md bg-black text-white text-sm px-4 py-2 shadow-lg max-w-md">
          <div className="flex items-start gap-3">
            <span className="leading-relaxed">{toast}</span>
            <button className="ml-auto text-white/80 hover:text-white" onClick={() => { setToast(null); setToastDetails(null); setShowDetails(false) }}>Dismiss</button>
          </div>
          {toastDetails && (
            <details className="mt-2" open={showDetails} onToggle={(e) => setShowDetails((e.target as HTMLDetailsElement).open)}>
              <summary className="cursor-pointer">Show Details</summary>
              <pre className="mt-1 whitespace-pre-wrap break-all">{toastDetails}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}





function CreatorFollowerPanel({ manifest }: { manifest: Manifest | null }) {
  const hub = manifest ? (manifest.contracts as any).CreatorFollowerHub as Cfg | undefined : undefined
  return (
    <div className="panel-glass rounded-lg p-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Creator Followers</h2>
          <p className="text-sm text-white/80">
            Set your fee/policy and let fans follow you. Adult policy requires age verification.
          </p>
          {hub && <p className="text-xs text-white/70 mt-1">Hub: {hub.address}</p>}
        </div>
        <Link href="/follow" className="rounded bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700">Go to followers</Link>
      </div>
    </div>
  )
}

function FooterContact() {
  return (
    <footer className="mt-12 border-t border-gray-200 pt-4 text-sm text-gray-600">
      <div className="flex items-center justify-center flex-wrap gap-3">
        <span>
          <span className="text-sm font-mono text-white/90">Contact:</span> {" "}
          <a href="mailto:info@camuverse.io" className="text-sm font-mono underline break-all text-white/90 ml-2">info@camuverse.io</a>
        </span>
      </div>
      <div className="mt-2 text-center text-xs text-white/80">
        <p>© 2025 Cammunity DAO LLC | <a href="https://x.com/Camuverse_io" target="_blank" rel="noreferrer" className="underline">Follow us on X</a></p>
      </div>
    </footer>
  )
}
















