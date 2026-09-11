// Shared CORS handling for the bombero-facing endpoints called directly from
// the browser in trauma-algo-proto (a different origin). The triage-intake
// and alert-log routes don't need this — they're only ever called
// server-to-server from trauma-algo-proto's own serverless function.
const ALLOWED_ORIGIN = 'https://trauma-algo-proto-theta.vercel.app'

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export function corsPreflight() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
