'use client'

import Loading from '@/app/components/Loading'
import { useAuth } from '@/app/contexts/authContext'
import { axiosInstance } from '@/app/utils/api'
import { useEffect } from 'react'

const Callback = () => {
    const { setIsFetching, setIsLoggedIn } = useAuth()

    const exchange = async (token: string) => {
        try {
            const response = await axiosInstance.post('/auth/exchange?code=' + token)

            if (response.data.success) {
                const redirectParam = localStorage.getItem('redirect') || null
                localStorage.setItem("logged_in", "true");
                if (redirectParam) {
                    window.location.href = redirectParam
                } else {
                    localStorage.removeItem('redirect');
                    window.location.href = '/home'
                }
            } else {
                console.error('Failed to exchange token:', response.data.message)
                setIsFetching(false)
                setIsLoggedIn(false)
                localStorage.removeItem('logged_in')
            }
        } catch (error) {
            console.error('Error exchanging token:', error)
        } finally {
            setIsFetching(false)
        }
    }

    useEffect(() => {
        // Get tokens from query parameters
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')

        if (!token) {
            console.error('No token found in URL')
            setIsFetching(false)
            return
        }

        // Exchange the token for user data
        exchange(token)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <Loading label='Logging in....' />
        </>
    )
}

export default Callback