"use client";
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8080/';

export const useSocket = () => {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Wait for session to load
  useEffect(() => {
    // Only establish WebSocket connection if session is loaded and not loading
    if (status === "loading") {
      return; // Don't do anything until loading is finished
    }

    const token = session?.user.accessToken;

    // Create a WebSocket connection only if we have a token
    if (token) {
      const ws = new WebSocket(`${WS_URL}?token=${token}`);

      ws.onopen = () => {
        setSocket(ws);
      };

      ws.onclose = () => {
        setSocket(null);
      };

      // Cleanup function to close the WebSocket when the component unmounts or session changes
      return () => {
        ws.close();
      };
    }
  }, [status, session]); // Include `status` and `session` in the dependency array

  return socket;
};
