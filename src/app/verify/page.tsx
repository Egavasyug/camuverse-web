export const metadata = { title: 'Verify' }

export default function VerifyPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">Verification</h1>
      <p className="text-sm text-gray-700 mb-3">
        Verification is coming soon. In the meantime, you can claim your Subscriber badge on the home page.
      </p>
      <div className="space-y-2 text-sm">
        <p>Planned flow:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Connect via Fractal ID / Polygon ID to prove age (adult flag into CamuVerify).</li>
          <li>Creators: SBT + adult verification to deploy follower SBT collections.</li>
          <li>Followers: hold the Camuverse SBT; adult-gated collections also check your adult status.</li>
          <li>Gasless follower mint via the forwarder; creators can revoke follower tokens if needed.</li>
        </ul>
      </div>
    </div>
  )
}
