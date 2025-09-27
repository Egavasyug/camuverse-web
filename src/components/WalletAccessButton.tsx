"use client"

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { usePrivy } from '@privy-io/react-auth'

function shorten(addr?: string) {
  return addr ? addr.slice(0, 6) + '…' + addr.slice(-4) : ''
}

export function WalletAccessButton() {
  const [open, setOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { login } = usePrivy()

  const injected = connectors.find((c) => c.id === 'injected' || c.name.toLowerCase().includes('injected'))
  const coinbase = connectors.find((c) => c.id === 'coinbaseWallet')
  const wc = connectors.find((c) => c.id === 'walletConnect' || c.name.toLowerCase().includes('walletconnect'))

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm rounded bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700"
      >
        Connect / Create Wallet
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-[92vw] max-w-sm rounded-lg bg-white p-4 shadow-xl dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Wallet options</h3>
              <button className="text-xs text-gray-500 hover:text-gray-700" onClick={() => setOpen(false)}>Close</button>
            </div>

            {isConnected ? (
              <div className="space-y-3">
                <div className="text-sm">Connected as <span className="font-mono">{shorten(address)}</span></div>
                <button
                  onClick={() => { disconnect(); setOpen(false) }}
                  className="w-full rounded bg-gray-200 px-3 py-1.5 text-sm hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                >
                  Disconnect
                </button>
              </div>
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
                <div className="pt-1" />
                <button
                  onClick={() => { login(); setOpen(false) }}
                  className="w-full rounded bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700"
                >
                  Create Wallet (Email / Google)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
