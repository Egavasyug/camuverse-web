"use client"

import { useAccount, useConnect, useDisconnect } from 'wagmi'

function shorten(addr?: string) {
  return addr ? addr.slice(0, 6) + '…' + addr.slice(-4) : ''
}

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="font-mono px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800">{shorten(address)}</span>
        <button
          onClick={() => disconnect()}
          className="rounded bg-gray-200 dark:bg-zinc-700 px-2 py-1 text-xs hover:bg-gray-300 dark:hover:bg-zinc-600"
        >
          Disconnect
        </button>
      </div>
    )
  }

  const injected = connectors.find((c) => c.id === 'injected' || c.name.toLowerCase().includes('injected'))
  const coinbase = connectors.find((c) => c.id === 'coinbaseWallet')
  const wc = connectors.find((c) => c.id === 'walletConnect' || c.name.toLowerCase().includes('walletconnect'))

  return (
    <div className="flex items-center gap-2">
      {injected && injected.ready ? (
        <button
          key={injected.uid}
          disabled={isPending}
          onClick={() => connect({ connector: injected })}
          className="text-sm rounded bg-zinc-900 text-white px-3 py-1.5 hover:bg-zinc-800 disabled:opacity-50"
        >
          Browser Wallet
        </button>
      ) : null}
      {coinbase && coinbase.ready ? (
        <button
          key={coinbase.uid}
          disabled={isPending}
          onClick={() => connect({ connector: coinbase })}
          className="text-sm rounded bg-zinc-900 text-white px-3 py-1.5 hover:bg-zinc-800 disabled:opacity-50"
        >
          Coinbase Wallet
        </button>
      ) : null}
      {wc ? (
        <button
          key={wc.uid}
          disabled={isPending}
          onClick={() => connect({ connector: wc })}
          className="text-sm rounded bg-zinc-900 text-white px-3 py-1.5 hover:bg-zinc-800 disabled:opacity-50"
        >
          WalletConnect
        </button>
      ) : null}
    </div>
  )
}
