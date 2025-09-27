"use client"

import { useAccount } from 'wagmi'
import { ConnectModalButton } from '@/components/ConnectModalButton'

function shorten(addr?: string) {
  return addr ? addr.slice(0, 6) + '…' + addr.slice(-4) : ''
}

export function HeaderWalletButton() {
  const { address, isConnected } = useAccount()

  if (isConnected && address) {
    return (
      <span className="font-mono text-xs md:text-sm px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800">
        {shorten(address)}
      </span>
    )
  }
  return <ConnectModalButton />
}
