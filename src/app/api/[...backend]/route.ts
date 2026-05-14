import { NextRequest } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cleaning-validation-backend.onrender.com'

export async function GET(
  request: NextRequest,
  { params }: { params: { backend: string[] } }
) {
  const path = params.backend.join('/')
  const url = `${BACKEND_URL}/api/${path}${request.nextUrl.search}`
  
  const headers = new Headers()
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    headers.set('authorization', authHeader)
  }

  const response = await fetch(url, {
    headers,
    cache: 'no-store',
  })

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { backend: string[] } }
) {
  const path = params.backend.join('/')
  const url = `${BACKEND_URL}/api/${path}`
  
  const body = await request.json()
  const headers = new Headers()
  headers.set('content-type', 'application/json')
  
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    headers.set('authorization', authHeader)
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  })
}