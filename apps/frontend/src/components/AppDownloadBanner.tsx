'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface AppDownloadBannerProps {
  hasTabBar?: boolean;
}

export const AppDownloadBanner = ({ hasTabBar = false }: AppDownloadBannerProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    if (checkMobile()) {
      setIsMobile(true)
      const dismissed = sessionStorage.getItem('app-banner-dismissed')
      if (!dismissed) {
        setIsVisible(true)
      }
    }
  }, [])

  if (!isVisible || !isMobile) return null

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('app-banner-dismissed', 'true')
  }

  const isLandingPage = pathname === '/' || pathname === '/mobile-app'

  const handleAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isLandingPage) {
      e.preventDefault()
      const fallbackUrl = "https://play.google.com/store/apps/details?id=com.rankmarg.app&hl=en_IN"
      if (/android/i.test(navigator.userAgent)) {
        window.location.href = `intent://open#Intent;package=com.rankmarg.app;scheme=rankmarg;S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`
      } else {
        window.location.href = fallbackUrl
      }
    }
  }

  const bottomPosition = hasTabBar ? 'bottom-[64px]' : 'bottom-0'

  return (
    <div className={`fixed ${bottomPosition} left-0 right-0 z-[100] bg-white border-t border-gray-200 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)] p-3 flex justify-between items-center sm:hidden animate-in slide-in-from-bottom-2`}>
      <button onClick={handleDismiss} className="mr-3 text-gray-400 hover:text-gray-600 transition-colors p-1" aria-label="Close banner">
        <X size={18} />
      </button>
      <div className="flex-grow">
        <p className="font-semibold text-sm text-gray-900 leading-tight">RankMarg App</p>
        <p className="text-xs text-gray-500 mt-0.5">Faster & better experience</p>
      </div>
      <a
        href={isLandingPage ? "https://play.google.com/store/apps/details?id=com.rankmarg.app&hl=en_IN" : "#"}
        onClick={handleAppClick}
        className="ml-3 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 transition-colors text-white text-xs font-semibold rounded-full whitespace-nowrap shadow-sm"
        target={isLandingPage ? "_blank" : undefined}
        rel={isLandingPage ? "noopener noreferrer" : undefined}
      >
        {isLandingPage ? "Download App" : "Open App"}
      </a>
    </div>
  )
}
