"use client";
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';


const WS_URL = process.env.VITE_APP_WS_URL ?? 'ws://localhost:8080';

export const useSocket = () => {
  const {data:session,status} = useSession();
  if(status === "loading") {
    return null;
  }
  const [socket, setSocket] = useState<WebSocket | null>(null);
  
  // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImE2OWNiNDIzLTk4MDQtNGJjNy1hNjIwLWY4MGI4YjRhOWQ2OCIsInVzZXJuYW1lIjoiQW5pa2V0IFN1ZGtlIiwiaWF0IjoxNzI5Njc3NjkzfQ.7pHm9-naa06inWSfRwwv5vBcwiR9jv9rS9ymMltQLq8";
  const token = session?.user.accessToken;
  useEffect(() => {
    
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
  }, [session]);
  return socket;
};