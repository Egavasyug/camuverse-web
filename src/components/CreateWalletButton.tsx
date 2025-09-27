"use client"

import { usePrivy } from '@privy-io/react-auth'

export function CreateWalletButton() {
  const { ready, authenticated, login, logout } = usePrivy()

  const disabled = !ready
  const label = !ready ? 'Loading…' : authenticated ? 'Manage Account' : 'Create Wallet'

  return (
    <button
      disabled={disabled}
      onClick={() => { if (authenticated) { logout(); } else { login(); } }}
      className="text-sm rounded bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50"
      title={authenticated ? 'Sign out' : 'Create an embedded wallet with Privy'}
    >
      {label}
    </button>
  )
}

