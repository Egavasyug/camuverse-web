"use client"

import { useConnect } from 'wagmi'

export function ConnectModalButton() {
  const { connectors, connect, isPending } = useConnect()

  const injected = connectors.find(
    (c) => c.id === 'injected' || c.name.toLowerCase().includes('injected') || c.name.toLowerCase().includes('metamask')
  )
  const coinbase = connectors.find((c) => c.id === 'coinbaseWallet' || c.name.toLowerCase().includes('coinbase'))
  const wc = connectors.find((c) => c.id === 'walletConnect' || c.name.toLowerCase().includes('walletconnect'))

  function handleClick() {
    if (injected && injected.ready) {
      connect({ connector: injected })
      return
    }
    if (coinbase && coinbase.ready) {
      connect({ connector: coinbase })
      return
    }
    if (wc) {
      connect({ connector: wc }) // falls back to WalletConnect modal (QR/deeplink)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-sm rounded bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50"
      title="Connect existing wallet"
    >
      Connect Wallet
    </button>
  )
}
