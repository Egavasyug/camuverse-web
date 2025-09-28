"use client"

import { useState } from 'react'
import { useConnect } from 'wagmi'
import { usePrivy } from '@privy-io/react-auth'

type EthProvider = { isMetaMask?: boolean; isCoinbaseWallet?: boolean }

export function ConnectModalButton() {
  const { connectors, connect, isPending } = useConnect()
  const { login } = usePrivy()
  const [open, setOpen] = useState(false)
  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  const hasMetaMask = typeof window !== 'undefined' && !!(
    window.ethereum?.isMetaMask || window.ethereum?.providers?.some((p) => p?.isMetaMask)
  )
  const hasCoinbaseExt = typeof window !== 'undefined' && !!(
    window.coinbaseWalletExtension || window.ethereum?.isCoinbaseWallet || window.ethereum?.providers?.some((p) => p?.isCoinbaseWallet)
  )

  const injected = connectors.find(
    (c) => c.id === 'injected' || c.name.toLowerCase().includes('injected') || c.name.toLowerCase().includes('metamask') || c.name.toLowerCase().includes('rabby')
  )
  const coinbase = connectors.find(
    (c) => c.id === 'coinbaseWallet' || c.name.toLowerCase().includes('coinbase')
  )
  const wc = connectors.find(
    (c) => c.id === 'walletConnect' || c.name.toLowerCase().includes('walletconnect')
  )

  function handleClick() {
    // Always show a clear choice; avoid automatic redirects
    setOpen(true)
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isPending}
        className="text-sm rounded bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50"
        title="Connect existing wallet (Injected or Coinbase)"
      >
        Connect Wallet
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-[92vw] max-w-sm rounded-lg bg-white p-4 shadow-xl dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">No browser wallet detected</h3>
              <button className="text-xs text-gray-500 hover:text-gray-700" onClick={() => setOpen(false)}>Close</button>
            </div>
            <div className="space-y-2 text-sm">
              {hasMetaMask && injected && (
                <button
                  onClick={() => { connect({ connector: injected }); setOpen(false) }}
                  disabled={isPending}
                  className="w-full rounded bg-zinc-900 text-white px-3 py-1.5 text-sm hover:bg-zinc-800 disabled:opacity-50"
                >
                  Connect MetaMask
                </button>
              )}
              {hasCoinbaseExt && coinbase && (
                <button
                  onClick={() => { connect({ connector: coinbase }); setOpen(false) }}
                  disabled={isPending}
                  className="w-full rounded bg-zinc-900 text-white px-3 py-1.5 text-sm hover:bg-zinc-800 disabled:opacity-50"
                >
                  Connect Coinbase Wallet
                </button>
              )}
              {wc && (
                <button
                  onClick={() => { connect({ connector: wc }); setOpen(false) }}
                  disabled={isPending}
                  className="w-full rounded bg-zinc-900 text-white px-3 py-1.5 text-sm hover:bg-zinc-800 disabled:opacity-50"
                >
                  Connect with WalletConnect
                </button>
              )}
              {!isMobile && !hasMetaMask && (
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full rounded border border-zinc-300 px-3 py-1.5 text-center hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Install MetaMask
                </a>
              )}
              {!isMobile && !hasCoinbaseExt && (
                <a
                  href="https://www.coinbase.com/wallet/downloads/browser-extension"
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full rounded border border-zinc-300 px-3 py-1.5 text-center hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Get Coinbase Wallet
                </a>
              )}
              <div className="pt-1" />
              <button
                onClick={() => { login(); setOpen(false) }}
                className="w-full rounded bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700"
              >
                Create Wallet (Email / Google)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


