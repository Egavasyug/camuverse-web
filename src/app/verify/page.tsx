"use client"

import { useState } from "react"
import { useAccount } from "wagmi"

export default function VerifyPage() {
  const [provider, setProvider] = useState<'polygon' | 'fractal'>('polygon')
  const [birthYear, setBirthYear] = useState('')
  const [credentialHash, setCredentialHash] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { address } = useAccount()

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold mb-2">Verification</h1>
        <p className="text-sm text-gray-200">
          Prove age to set your CamuVerify adult flag. You need the Camuverse SBT first; adult creators and followers must complete this step for policy&nbsp;1 collections.
        </p>
      </div>

      <div className="panel-glass rounded-lg p-4 space-y-3">
        <h2 className="text-base font-semibold">Submit credential</h2>
        <div className="grid gap-3 md:grid-cols-2 text-sm">
          <div className="space-y-2">
            <label className="block text-white/80">
              Provider
              <select
                className="mt-1 w-full rounded border border-white/20 bg-white/5 px-2 py-1"
                value={provider}
                onChange={(e) => {
                  const next = e.target.value === 'fractal' ? 'fractal' : 'polygon'
                  setProvider(next)
                }}
              >
                <option value="polygon">Polygon ID</option>
                <option value="fractal">Fractal</option>
              </select>
            </label>
            <label className="block text-white/80">
              Birth year (YYYY)
              <input className="mt-1 w-full rounded border border-white/20 bg-white/5 px-2 py-1" placeholder="1988" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} />
            </label>
            <label className="block text-white/80">
              Credential hash
              <input className="mt-1 w-full rounded border border-white/20 bg-white/5 px-2 py-1 font-mono text-xs" placeholder="0x…" value={credentialHash} onChange={(e) => setCredentialHash(e.target.value)} />
            </label>
          </div>
          <div className="space-y-2 text-white/80 text-sm">
            <p className="font-semibold">How it works</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Connect wallet (uses your connected address as the verified user).</li>
              <li>Present a Polygon ID (or Fractal) age credential; paste the credential hash.</li>
              <li>We relay verifyWithCredentialHash on CamuVerify (Base) via the relayer.</li>
              <li>Adult flag is set on-chain; policy 1 collections will accept you.</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            className="rounded bg-blue-600 text-white px-3 py-1.5 disabled:opacity-50"
            disabled={!address || !birthYear || !credentialHash}
            onClick={async () => {
              setStatus(null)
              setError(null)
              try {
                const res = await fetch('/api/verify/did', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({
                    provider,
                    user: address,
                    birthYear: Number(birthYear),
                    credentialHash,
                  }),
                })
                const json = await res.json()
                if (!res.ok || !json.ok) throw new Error(json?.error || 'Verification failed')
                setStatus(`On-chain verification sent. Tx: ${json.hash}`)
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Verification failed')
              }
            }}
          >
            Submit verification
          </button>
          {!address && <span className="text-white/60">Connect your wallet first.</span>}
        </div>
        {status && <div className="text-xs text-green-400">{status}</div>}
        {error && <div className="text-xs text-red-400">{error}</div>}
        <p className="text-xs text-white/60">
          Note: Polygon ID/Fractal proof validation is stubbed here; wire your verifier/JWKS/webhook secret in <code>src/app/api/verify/did/polygon.ts</code>/<code>fractal.ts</code> for production.
        </p>
      </div>

      <div className="space-y-2 text-sm text-white/80">
        <p className="font-semibold">Rules recap</p>
        <ul className="list-disc list-inside space-y-1">
          <li>All users: must hold the Camuverse SBT.</li>
          <li>Creators (policy 0): SBT only. Creators (policy 1): SBT + adult verified.</li>
          <li>Followers: SBT required; if following a policy 1 creator, you must be adult verified.</li>
        </ul>
      </div>
    </div>
  )
}
