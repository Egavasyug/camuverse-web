// Minimal Polygon ID proof validator stub for "over 18" schema.
// Replace with real proof verification against your Polygon ID verifier.

export type PolygonIdPayload = {
  user: `0x${string}`
  birthYear: number
  credentialHash: `0x${string}`
  proofToken?: string
}

export function validatePolygonPayload(body: unknown): { ok: boolean; error?: string; payload?: PolygonIdPayload } {
  if (!body) return { ok: false, error: 'No body' }
  const { user, birthYear, credentialHash, proofToken } = body as PolygonIdPayload
  if (!user || typeof user !== 'string') return { ok: false, error: 'Missing user' }
  if (!birthYear || typeof birthYear !== 'number') return { ok: false, error: 'Missing birthYear' }
  if (!credentialHash || typeof credentialHash !== 'string' || !credentialHash.startsWith('0x') || credentialHash.length !== 66) {
    return { ok: false, error: 'Bad credentialHash' }
  }
  // proofToken optional in this stub; real implementation should require and verify it
  return { ok: true, payload: { user, birthYear, credentialHash: credentialHash as `0x${string}`, proofToken } }
}

export async function verifyPolygonProof(payload: PolygonIdPayload): Promise<boolean> {
  void payload;
  // TODO: call your Polygon ID verifier or validate the proof token/JWT.
  return true
}
