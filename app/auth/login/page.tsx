'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Github, Info, CheckCircle, PencilLine, BookOpen } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/app/contexts/authContext'

export default function LoginPage() {
  const router = useRouter()
  const { oauthLogin } = useAuth()
  const [acceptedPolicy, setAcceptedPolicy] = useState(false)
  const [showPolicyModal, setShowPolicyModal] = useState(false)

  const handleLogin = (provider: 'google' | 'discord' | 'github') => {
    if (!acceptedPolicy) {
      setShowPolicyModal(true)
      return
    }
    oauthLogin(provider)
  }

  return (
    <div className="flex items-center h-full justify-center bg-gradient-to-b from-slate-950 via-gray-900 to-black relative">

      {/* Login card */}
      <div className="relative z-10 max-w-md w-full p-6 bg-gray-900/40 backdrop-blur-md rounded-xl shadow-xl border border-gray-700/40">
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 opacity-20 blur-lg"></div>
            
              <Image
                src="/BSO LOGO.svg"
                alt="Blog Logo"
                width={64}
                height={64}
                className="rounded-xl object-contain"
              />
            
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">เข้าสู่ระบบ Blog</h1>
          <p className="text-gray-300 text-sm">เข้าถึงการจัดการบทความ แชร์ไอเดีย และจัดการเนื้อหาของคุณ</p>
        </div>

        <div className="mb-6 p-3 bg-gray-800/30 rounded-lg border border-gray-600/40 shadow-inner">
          <div className="flex items-start">
            <input
              type="checkbox"
              checked={acceptedPolicy}
              onChange={() => setAcceptedPolicy(!acceptedPolicy)}
              className="w-5 h-5 mt-1 text-indigo-600 border-gray-400 rounded"
            />
            <label className="ml-2 text-sm text-gray-200 cursor-pointer">
              ฉันยอมรับข้อกำหนดและเงื่อนไข
            </label>
          </div>
          <button
            type="button"
            onClick={() => setShowPolicyModal(true)}
            className="mt-2 text-xs text-indigo-300 underline hover:text-indigo-100 flex items-center"
          >
            อ่านรายละเอียด <Info className="ml-1 w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleLogin('google')}
            disabled={!acceptedPolicy}
            className="w-full px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-xl flex items-center justify-center disabled:opacity-50"
          >
            <span className="mr-2">🔓</span> เข้าสู่ระบบด้วย Google
          </button>
          <button
            onClick={() => handleLogin('discord')}
            disabled={!acceptedPolicy}
            className="w-full px-4 py-2 bg-indigo-600/80 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center disabled:opacity-50"
          >
            <span className="mr-2">💬</span> เข้าสู่ระบบด้วย Discord
          </button>
          <button
            onClick={() => handleLogin('github')}
            disabled={!acceptedPolicy}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-xl flex items-center justify-center disabled:opacity-50"
          >
            <Github className="w-4 h-4 mr-2" />
            เข้าสู่ระบบด้วย GitHub
          </button>
        </div>
      </div>

      {/* Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-600 rounded-xl p-6 max-w-xl w-full max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Info className="mr-2 text-blue-400" />
              ข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัว
            </h2>
            <p className="text-gray-300 text-sm mb-2">
              เว็บไซต์ Blog ของเราจะเก็บข้อมูลที่จำเป็นต่อการเข้าสู่ระบบเท่านั้น เช่น ชื่อผู้ใช้ และอีเมล
            </p>
            <p className="text-gray-300 text-sm mb-2">
              การเข้าสู่ระบบแสดงว่าคุณยินยอมรับเงื่อนไขในการใช้งานของเรา รวมถึงการได้รับข่าวสารหรืออัปเดตผ่านทางอีเมล
            </p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setAcceptedPolicy(true)
                  setShowPolicyModal(false)
                }}
                className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                ยอมรับ
              </button>
              <button
                onClick={() => setShowPolicyModal(false)}
                className="px-4 py-2 text-gray-300 bg-gray-700/50 rounded hover:bg-gray-600"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
