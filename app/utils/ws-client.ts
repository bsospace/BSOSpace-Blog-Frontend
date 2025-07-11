import envConfig from "../configs/envConfig"
import { useAuth } from "../contexts/authContext"

type WSListener = (event: MessageEvent) => void

let socket: WebSocket | null = null
let isConnected = false
let listeners: WSListener[] = []

export const connectWebSocket = () => {
  const loggedIn = localStorage.getItem('logged_in') === 'true'
  const warp = localStorage.getItem('warp') || ''
  if (!loggedIn || !warp) {
    console.log('[WS] Not logged in, skipping WebSocket connection')
    return
  }

  socket = new WebSocket(`${envConfig.ws}?warp=${warp}`)

  socket.onopen = () => {
    isConnected = true
    console.log('[WS] Connected')
  }

  socket.onclose = () => {
    isConnected = false
    console.log('[WS] Disconnected reconnecting in 5s')
    setTimeout(connectWebSocket, 5000)
  }

  socket.onerror = (err) => {
    console.error('[WS] Error:', err)
  }

  socket.onmessage = (event) => {
    for (const listener of listeners) {
      listener(event)
    }
  }
}

export const sendWSMessage = (data: string) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(data)
  }
}

export const addWSListener = (listener: WSListener) => {
  listeners.push(listener)
}

export const removeWSListener = (listener: WSListener) => {
  listeners = listeners.filter((l) => l !== listener)
}
