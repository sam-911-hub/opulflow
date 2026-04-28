"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebaseClient"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogout = async () => {
    setError("")
    setLoading(true)

    try {
      const auth = getFirebaseAuth()
      await signOut(auth)
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (logoutError: unknown) {
      console.error('Logout error:', logoutError)
      setError('Unable to log out. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="rounded-[2rem] bg-white/95 border border-slate-200 shadow-xl p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold shadow-lg mb-4">
                OP
              </div>
              <h1 className="text-3xl font-semibold text-slate-900">Account settings</h1>
              <p className="mt-2 text-slate-600 max-w-2xl">
                Manage your session, security, and logout with a fast, modern experience.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="rounded-3xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
                Active session
              </div>
              <div className="rounded-3xl bg-violet-50 border border-violet-100 px-4 py-3 text-sm text-violet-700">
                Protected account
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white border border-slate-200 shadow-xl p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Security controls</h2>
              <p className="mt-2 text-slate-600 max-w-xl">
                Use the button below to safely sign out of your account when you are done using OpulFlow.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Log out
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm logout</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to log out? You will need to sign in again to access your dashboard.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <DialogClose asChild>
                    <button className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-100 transition">
                      Cancel
                    </button>
                  </DialogClose>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-2xl bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                  >
                    {loading ? 'Signing out…' : 'Yes, log me out'}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {error && (
            <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Session status</p>
              <p className="mt-3 text-xl font-semibold text-slate-900">Active now</p>
              <p className="mt-2 text-sm text-slate-500">Your current browser session is secure.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Security settings</p>
              <p className="mt-3 text-xl font-semibold text-slate-900">Encrypted</p>
              <p className="mt-2 text-sm text-slate-500">Firebase authentication keeps your account safe.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}