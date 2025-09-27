"use client"

import { useConnect } from 'wagmi'
import { usePrivy } from '@privy-io/react-auth'

export function ConnectModalButton() {
  const { connectors, connect, isPending } = useConnect()
  const { login } = usePrivy()

  const injected = connectors.find(
    (c) => c.id === 'injected' || c.name.toLowerCase().includes('injected') || c.name.toLowerCase().includes('metamask')
  )
  const coinbase = connectors.find((c) => c.id === 'coinbaseWallet' || c.name.toLowerCase().includes('coinbase'))

  function handleClick() {
    if (injected && injected.ready) { connect({ connector: injected }); return }
    if (coinbase && coinbase.ready) { connect({ connector: coinbase }); return }
    // Fallback to embedded wallet creation via Privy
    login()
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-sm rounded bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50"
      title="Connect existing wallet (or create one if none is detected)"
    >
      Connect Wallet
    </button>
  )
}
