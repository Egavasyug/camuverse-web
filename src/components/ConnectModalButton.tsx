"use client"

import { useConnect } from 'wagmi'

export function ConnectModalButton() {
  const { connectors, connect, isPending } = useConnect()

  const injected = connectors.find(
    (c) => c.id === 'injected' || c.name.toLowerCase().includes('injected') || c.name.toLowerCase().includes('metamask')
  )
  const coinbase = connectors.find((c) => c.id === 'coinbaseWallet' || c.name.toLowerCase().includes('coinbase'))

  function handleClick() {
    if (injected) { connect({ connector: injected }); return }
    if (coinbase) { connect({ connector: coinbase }); return }
    // No supported browser wallet detected; do nothing here.
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-sm rounded bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50"
      title="Connect existing wallet (Injected or Coinbase)"
    >
      Connect Wallet
    </button>
  )
}
