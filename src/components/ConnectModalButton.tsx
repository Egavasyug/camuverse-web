"use client"

import { useConnect } from 'wagmi'

export function ConnectModalButton() {
  const { connectors, connect } = useConnect()
  const wc = connectors.find((c) => c.id === 'walletConnect' || c.name.toLowerCase().includes('walletconnect'))

  return (
    <button
      onClick={() => wc ? connect({ connector: wc }) : undefined}
      className="text-sm rounded bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700"
    >
      Connect Wallet
    </button>
  )
}
