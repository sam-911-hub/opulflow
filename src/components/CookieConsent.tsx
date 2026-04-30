"use client"

import { useState, useEffect } from "react"

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      setShow(true)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setShow(false)
  }

  const decline = () => {
    localStorage.setItem('cookieConsent', 'declined')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#161b22] border-t border-[#30363d] p-4 z-50">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-[#848d97]">
          We use cookies to enhance your experience. By continuing, you agree to our{' '}
          <a href="/privacy" className="text-[#2f81f7] hover:text-[#79c0ff] underline">
            Privacy Policy
          </a>.
        </div>
        <div className="flex gap-2">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm text-[#848d97] hover:text-[#e6edf3] transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm bg-[#2f81f7] hover:bg-[#1f77f0] text-white rounded transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}