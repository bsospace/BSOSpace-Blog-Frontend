'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()


    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        const isPrivate = pathname.startsWith('/w/')

        if (isPrivate && !token) {
            const redirectUrl = encodeURIComponent(pathname)
            localStorage.setItem('redirect', pathname)
            router.push(`/auth/login?redirect=${redirectUrl}`)
        }
        
    }, [pathname, router])

    return <>{children}</>
}
