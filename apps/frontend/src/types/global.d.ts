export {};

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      trackingIdOrEventName: string,
      params?: { [key: string]: any }
    ) => void;
  }
}