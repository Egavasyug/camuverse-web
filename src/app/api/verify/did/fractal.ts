// Minimal Fractal credential validator stub.
// Adjust to Fractal's actual payload/signature spec.

export type FractalPayload = {
  user: `0x${string}`
  birthYear: number
  credentialHash: `0x${string}`
  signature: string
  verifierAddress?: `0x${string}`
}

export function validateFractalPayload(body: unknown): { ok: boolean; error?: string; payload?: FractalPayload } {
  if (!body) return { ok: false, error: 'No body' }
  const { user, birthYear, credentialHash, signature, verifierAddress } = body as FractalPayload
  if (!user || typeof user !== 'string') return { ok: false, error: 'Missing user' }
  if (!birthYear || typeof birthYear !== 'number') return { ok: false, error: 'Missing birthYear' }
  if (!credentialHash || typeof credentialHash !== 'string' || !credentialHash.startsWith('0x') || credentialHash.length !== 66) {
    return { ok: false, error: 'Bad credentialHash' }
  }
  if (!signature || typeof signature !== 'string') return { ok: false, error: 'Missing signature' }
  // TODO: verify signature according to Fractal spec (e.g., HMAC or ECDSA)
  // Placeholder: accept if provided
  return { ok: true, payload: { user, birthYear, credentialHash: credentialHash as `0x${string}`, signature, verifierAddress } }
}

export async function verifyFractalSignature(payload: FractalPayload): Promise<boolean> {
  void payload;
  // TODO: implement actual Fractal verification logic using their public key / JWT / webhook secret.
  return true
}
