
import { useEffect } from "react"
import {
  connectWebSocket,
  addWSListener,
  removeWSListener,
  sendWSMessage,
} from "../utils/ws-client"

export const useWebSocket = (
  onMessage: (data: any) => void
) => {
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
  }, [onMessage])

  return { sendWSMessage }
}
