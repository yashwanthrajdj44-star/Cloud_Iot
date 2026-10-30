import { useState, useEffect, useRef, useCallback } from 'react';
import type { TelemetryPoint } from '@/types';

interface WebSocketMessage {
  type: string;
  data: any;
}

interface UseWebSocketReturn {
  lastMessage: WebSocketMessage | null;
  isConnected: boolean;
  telemetryFeed: TelemetryPoint[];
}

const MAX_FEED_SIZE = 100;

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [telemetryFeed, setTelemetryFeed] = useState<TelemetryPoint[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttemptRef = useRef(0);

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl =
        import.meta.env.DEV
          ? 'ws://localhost:3001/ws'
          : `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttemptRef.current = 0;
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;

        // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttemptRef.current),
          30000
        );
        reconnectAttemptRef.current += 1;

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          if (message.type === 'telemetry' && message.data) {
            setTelemetryFeed((prev) => {
              const updated = [message.data, ...prev];
              return updated.slice(0, MAX_FEED_SIZE);
            });
          }
        } catch {
          // Ignore non-JSON messages
        }
      };
    } catch {
      // Connection failed, will retry
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { lastMessage, isConnected, telemetryFeed };
}
