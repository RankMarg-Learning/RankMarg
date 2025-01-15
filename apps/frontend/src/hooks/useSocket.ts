"use client";
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';


const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8080';


export const useSocket = () => {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (status === "loading") {
      return; 
    }

    const token = session?.user.accessToken;

    if (token) {
      const ws = new WebSocket(`${WS_URL}?token=${token}`);
      
      ws.onopen = () => {
        setSocket(ws);
      };

      ws.onclose = () => {
        setSocket(null);
      };
      return () => {
        ws.close();
      };
    }
  }, [status, session]);
  return socket;
};
