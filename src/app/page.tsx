"use client"

import type { Abi } from "viem"
import { useEffect, useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { loadManifest, type Manifest } from "@/lib/manifest"
import { useAccount, useReadContract } from "wagmi"

type Cfg = { address: `0x${string}`; abi: Abi }

export default function Home() {
  const [manifest, setManifest] = useState<Manifest | null>(null)
  useEffect(() => { loadManifest().then(setManifest).catch(console.error) }, [])

  return (
    <main className="min-h-dvh p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Camuverse</h1>
        <ConnectButton />
      </div>
      {manifest ? <Dashboard manifest={manifest} /> : <div>Loading manifest?</div>}
    </main>
  )
}

function Dashboard({ manifest }: { manifest: Manifest }) {
  const { address } = useAccount()
  const dao: Cfg = manifest.contracts.CammunityDAO
  const wrapper: Cfg = manifest.contracts.VestingWrapper

  const { data: proposalCount } = useReadContract({
    address: dao.address,
    abi: dao.abi,
    functionName: "proposalCount",
  })

  const { data: tokensUnlocked } = useReadContract({
    address: wrapper.address,
    abi: wrapper.abi,
    functionName: "getUnlockedTokens",
    args: [address ?? "0x0000000000000000000000000000000000000000"] as const,
    query: { enabled: !!address },
  })

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="DAO">
        <Row label="Proxy Address" value={dao.address} />
        <Row label="Proposals" value={String(proposalCount ?? "?")} />
      </Card>
      <Card title="Vesting Wrapper">
        <Row label="Proxy Address" value={wrapper.address} />
        <Row label="Your Unlocked Tokens" value={address ? String(tokensUnlocked ?? "0") : "Connect wallet"} />
      </Card>
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
