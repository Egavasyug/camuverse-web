"use client"

import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="font-mono">{address}</span>
        <button
          onClick={() => disconnect()}
          className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {connectors.map((c) => (
        <button
          key={c.uid}
          disabled={!c.ready || isPending}
          onClick={() => connect({ connector: c })}
          className="text-sm rounded bg-zinc-900 text-white px-3 py-1.5 hover:bg-zinc-800 disabled:opacity-50"
          title={c.name}
        >
          {c.name}
        </button>
      ))}
    </div>
  )
}
