"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, cookieStorage, createStorage, createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  const msg = 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set.'
  if (process.env.NODE_ENV === 'production') {
    throw new Error(msg)
  } else {
    console.warn(msg + ' Set it in .env.local for local development.')
  }
}

const wagmiAdapter = projectId
  ? new WagmiAdapter({
      projectId,
      networks: [base],
      ssr: true,
      storage: createStorage({ storage: cookieStorage })
    })
  : null

export const config = wagmiAdapter
  ? wagmiAdapter.wagmiConfig
  : createConfig({
      chains: [base],
      transports: { [base.id]: http() },
      ssr: true,
      storage: createStorage({ storage: cookieStorage })
    })

declare global {
  // eslint-disable-next-line no-var
  var __appkit_inited__: boolean | undefined
}

if (typeof window !== 'undefined' && projectId && wagmiAdapter && !globalThis.__appkit_inited__) {
  // Ensure AppKit is initialized exactly once to avoid transient config warnings
  globalThis.__appkit_inited__ = true
  const origin = window.location.origin
  createAppKit({
    networks: [base],
    adapters: [wagmiAdapter],
    projectId,
    metadata: {
      name: 'Camuverse',
      description: 'Camuverse frontend',
      url: origin,
      icons: [origin + '/logo.png']
    }
  })
}

const queryClient = new QueryClient()

export function Web3Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
