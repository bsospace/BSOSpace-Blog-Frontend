
"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './authContext'
import envConfig from '../configs/envConfig'

type SocketContextType = {
    socket: WebSocket | null
    isConnected: boolean
    sendMessage: (data: string) => void
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    sendMessage: () => { },
})

export const useSocket = () => useContext(SocketContext)

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const { user } = useAuth()
    const [isConnected, setIsConnected] = useState(false)
    const socketRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        if (!user) return

        const token = localStorage.getItem('accessToken')
        const wsUrl = `${envConfig.ws}?token=Bearer ${token}`;

        const socket = new WebSocket(wsUrl)

        socketRef.current = socket

        socket.onopen = () => {
            console.log('[WS] Connected')
            setIsConnected(true)
        }

        socket.onclose = () => {
            console.log('[WS] Disconnected')
            setIsConnected(false)
        }

        socket.onerror = (err) => {
            console.error('[WS] Error:', err)
        }

        socket.onmessage = (event) => {
            console.log('[WS] Message:', event.data)
        }

        return () => {
            socket.close()
        }
    }, [])

    const sendMessage = (data: string) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(data)
        }
    }

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, isConnected, sendMessage }}>
            {children}
        </SocketContext.Provider>
    )
}
