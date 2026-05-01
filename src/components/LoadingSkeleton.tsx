"use client"

import { useState, useEffect } from "react"

interface LoadingSkeletonProps {
  className?: string
  lines?: number
}

export function LoadingSkeleton({ className = "", lines = 1 }: LoadingSkeletonProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-hide after 5 seconds as fallback
    const timer = setTimeout(() => setIsVisible(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded mb-2 last:mb-0"></div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-6 bg-gray-200 rounded w-8"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-white border border-gray-200 p-4 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-48 bg-gray-200 rounded"></div>
    </div>
  )
}

export function ServiceCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded w-24"></div>
    </div>
  )
}