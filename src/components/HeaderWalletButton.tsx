"use client"

import { useEffect, useRef, useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { ConnectModalButton } from '@/components/ConnectModalButton'

function shorten(addr?: string) {
  return addr ? addr.slice(0, 6) + '…' + addr.slice(-4) : ''
}

export function HeaderWalletButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  if (isConnected && address) {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="font-mono text-xs md:text-sm px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700"
          title={address}
        >
          {shorten(address)}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-40 rounded-md border border-gray-200 bg-white p-1 text-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <button
              onClick={() => { navigator.clipboard?.writeText(address).catch(() => {}); setOpen(false) }}
              className="block w-full rounded px-2 py-1 text-left hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              Copy address
            </button>
            <button
              onClick={() => { disconnect(); setOpen(false) }}
              className="mt-1 block w-full rounded px-2 py-1 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }
  return <ConnectModalButton />
}

