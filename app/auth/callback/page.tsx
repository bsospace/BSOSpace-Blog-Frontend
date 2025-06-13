'use client'

import Loading from '@/app/components/Loading'
import { useAuth } from '@/app/contexts/authContext'
import { useEffect } from 'react'

const Callback = () => {
    const { setIsFetching, setIsLoggedIn } = useAuth()

    useEffect(() => {
        // Get tokens from query parameters
        const urlParams = new URLSearchParams(window.location.search)
        const accessToken = urlParams.get('accessToken')
        const refreshToken = urlParams.get('refreshToken')

        const redirectParam = localStorage.getItem('redirect') || null

        // Save tokens to localStorage
        if (accessToken) {
            localStorage.setItem('accessToken', accessToken)
            setIsFetching(false)
            setIsLoggedIn(true)
        }
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken)
            setIsFetching(false)
            setIsLoggedIn(true)
        }

        if (redirectParam) {
            window.location.href = redirectParam
        } else {
            localStorage.removeItem('redirect');
            window.location.href = '/home'
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <Loading label='Logging in....' />
        </>
    )
}

export default Callback