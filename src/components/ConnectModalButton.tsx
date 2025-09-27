"use client"

import { useState } from 'react'
import { useAccount, useConnect } from 'wagmi'

export function ConnectModalButton() {
  const [open, setOpen] = useState(false)
  const { isConnected } = useAccount()
  const { connectors, connect, isPending } = useConnect()

  const injected = connectors.find((c) => c.id === 'injected' || c.name.toLowerCase().includes('injected'))
  const coinbase = connectors.find((c) => c.id === 'coinbaseWallet')
  const wc = connectors.find((c) => c.id === 'walletConnect' || c.name.toLowerCase().includes('walletconnect'))

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm rounded bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700"
      >
        Connect Wallet
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-[92vw] max-w-sm rounded-lg bg-white p-4 shadow-xl dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Connect your wallet</h3>
              <button className="text-xs text-gray-500 hover:text-gray-700" onClick={() => setOpen(false)}>Close</button>
            </div>

            {isConnected ? (
              <div className="text-sm text-gray-600">Already connected.</div>
            ) : (
              <div className="space-y-2">
                {injected && injected.ready ? (
                  <button
                    onClick={() => { connect({ connector: injected }); setOpen(false) }}
                    disabled={isPending}
                    className="w-full rounded bg-zinc-900 text-white px-3 py-1.5 text-sm hover:bg-zinc-800 disabled:opacity-50"
                  >
                    Browser Wallet
                  </button>
                ) : null}
                {coinbase && coinbase.ready ? (
                  <button
                    onClick={() => { connect({ connector: coinbase }); setOpen(false) }}
                    disabled={isPending}
                    className="w-full rounded bg-zinc-900 text-white px-3 py-1.5 text-sm hover:bg-zinc-800 disabled:opacity-50"
                  >
                    Coinbase Wallet
                  </button>
                ) : null}
                {wc ? (
                  <button
                    onClick={() => { connect({ connector: wc }); setOpen(false) }}
                    disabled={isPending}
                    className="w-full rounded bg-zinc-900 text-white px-3 py-1.5 text-sm hover:bg-zinc-800 disabled:opacity-50"
                  >
                    WalletConnect
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
