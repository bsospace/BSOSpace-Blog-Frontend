import { NextRequest, NextResponse } from 'next/server'

// Function to format timestamp like Nginx logs: 07/Jun/2025:15:45:12 +0000
function formatTimestamp(date: Date): string {
    const day = String(date.getUTCDate()).padStart(2, '0')
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
    const year = date.getUTCFullYear()
    const time = date.toISOString().split('T')[1].split('.')[0]
    return `${day}/${month}/${year}:${time} +0000`
}

export function middleware(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || request
    const method = request.method
    const path = request.nextUrl.pathname + request.nextUrl.search
    const userAgent = request.headers.get('user-agent') || '-'
    const timestamp = formatTimestamp(new Date())

    // Mimic Nginx-style access log
    console.log(`${ip} - - [${timestamp}] "${method} ${path} HTTP/1.1" - "-" "${userAgent}"`)

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next|favicon.ico).*)'],
}
