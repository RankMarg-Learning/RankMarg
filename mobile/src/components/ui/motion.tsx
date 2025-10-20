import React from 'react';

export default function Motion({ children }: { children: React.ReactNode; animation?: string; className?: string }) {
  return <>{children}</>; // no-op for RN placeholder
}


