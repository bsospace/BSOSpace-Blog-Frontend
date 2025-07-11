/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect } from "react"
import {
  connectWebSocket,
  addWSListener,
  removeWSListener,
  sendWSMessage,
} from "../utils/ws-client"
import { useAuth } from "./authContext"

export const useWebSocket = (
  onMessage: (data: any) => void
) => {

  const { user } = useAuth()
  useEffect(() => {
    connectWebSocket()

    const listener = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data)
        onMessage(parsed)
      } catch (err) {
        console.error("Failed to parse WS message:", err)
      }
    }

    addWSListener(listener)
    return () => removeWSListener(listener)
  }, [user])

  return { sendWSMessage }
}
