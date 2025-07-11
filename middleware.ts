import { NextRequest, NextResponse } from 'next/server'

// Format timestamp like Nginx logs: 07/Jun/2025:15:45:12 +0000
function formatTimestamp(date: Date): string {
    const day = String(date.getUTCDate()).padStart(2, '0')
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
    const year = date.getUTCFullYear()
    const time = date.toISOString().split('T')[1].split('.')[0]
    return `${day}/${month}/${year}:${time} +0000`
}

export function middleware(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '-'
    const method = request.method
    const path = request.nextUrl.pathname + request.nextUrl.search
    const userAgent = request.headers.get('user-agent') || '-'
    const timestamp = formatTimestamp(new Date())
    const token = request.cookies.get('blog.atk')?.value

    // Log in Nginx-style format
    console.log(`${ip} - - [${timestamp}] "${method} ${path} HTTP/1.1" - "-" "${userAgent}"`)

    // Redirect if accessing private path and no token
    const isPrivate = request.nextUrl.pathname.startsWith('/w/')
    if (isPrivate && !token) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/auth/login'
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search)

        return NextResponse.redirect(redirectUrl)
    }

    return NextResponse.next()
}

// Apply to all paths except _next and favicon
export const config = {
    matcher: ['/((?!_next|favicon.ico).*)'],
}
