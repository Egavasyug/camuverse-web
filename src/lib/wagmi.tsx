"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, cookieStorage, createStorage, createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected, coinbaseWallet } from 'wagmi/connectors'
import { PrivyProvider } from '@privy-io/react-auth'


export const config = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
  connectors: [
    injected({ shimDisconnect: true }),
    
    coinbaseWallet({ appName: 'Camuverse' }),
  ],
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
})

const queryClient = new QueryClient()

export function Web3Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        embeddedWallets: { ethereum: { createOnLogin: 'users-without-wallets' } },
        loginMethods: ['email', 'google'],
        appearance: { theme: 'light' },
        
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  )
}

