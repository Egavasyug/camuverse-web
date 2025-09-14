import { NextResponse, type NextRequest } from 'next/server'

function generateNonce() {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64')
}

export function middleware(req: NextRequest) {
  const nonce = generateNonce()

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' blob: https:`,
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https: wss: data: blob:",
    "frame-src 'self' https:",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)

  const res = NextResponse.next({
    request: { headers: requestHeaders }
  })
  res.headers.set('Content-Security-Policy', csp)
  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}

