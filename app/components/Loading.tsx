"use client"
import React from 'react'

interface LoadingProps {
    label?: string
    className?: string
}

function Loading({ label = "กำลังโหลด...", className = "" }: LoadingProps) {
    return (
        <div className={`flex items-center justify-center h-screen ${className}`}>
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-sm text-orange-600">{label}</div>
            </div>
        </div>
    )
}

export default Loading
