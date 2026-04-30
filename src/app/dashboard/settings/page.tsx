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
              <h2 className="text-2xl font-semibold text-slate-900">Profile Settings</h2>
              <p className="mt-2 text-slate-600 max-w-xl">
                Update your profile information and preferences.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm text-slate-700 mb-2">Avatar</label>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) localStorage.setItem('avatar', URL.createObjectURL(file))
                }}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-2">Bio</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                placeholder="Tell us about yourself..."
                onChange={(e) => localStorage.setItem('bio', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-2">Theme</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                onChange={(e) => localStorage.setItem('theme', e.target.value)}
              >
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white border border-slate-200 shadow-xl p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Footer Customization</h2>
              <p className="mt-2 text-slate-600 max-w-xl">
                Customize which sections appear in the footer.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked={true}
                className="rounded border-slate-300"
                onChange={(e) => localStorage.setItem('footerNewsletter', e.target.checked.toString())}
              />
              <span className="text-sm text-slate-700">Show newsletter signup</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked={true}
                className="rounded border-slate-300"
                onChange={(e) => localStorage.setItem('footerTrustBadges', e.target.checked.toString())}
              />
              <span className="text-sm text-slate-700">Show trust badges</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked={true}
                className="rounded border-slate-300"
                onChange={(e) => localStorage.setItem('footerStatus', e.target.checked.toString())}
              />
              <span className="text-sm text-slate-700">Show system status</span>
            </label>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white border border-slate-200 shadow-xl p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Notifications & Preferences</h2>
              <p className="mt-2 text-slate-600 max-w-xl">
                Configure your notification preferences and app settings.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked={true}
                className="rounded border-slate-300"
                onChange={(e) => localStorage.setItem('notifications', e.target.checked.toString())}
              />
              <span className="text-sm text-slate-700">Order update notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked={false}
                className="rounded border-slate-300"
                onChange={(e) => localStorage.setItem('tooltips', e.target.checked.toString())}
              />
              <span className="text-sm text-slate-700">Show tooltips</span>
            </label>
            <div>
              <label className="block text-sm text-slate-700 mb-2">Credit warning threshold</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                placeholder="e.g., 10"
                onChange={(e) => localStorage.setItem('creditThreshold', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-2">Auto-logout time (minutes)</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                placeholder="e.g., 30"
                onChange={(e) => localStorage.setItem('autoLogout', e.target.value)}
              />
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                onChange={(e) => localStorage.setItem('rememberMe', e.target.checked.toString())}
              />
              <span className="text-sm text-slate-700">Remember me</span>
            </label>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white border border-slate-200 shadow-xl p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Export Settings</h2>
              <p className="mt-2 text-slate-600 max-w-xl">
                Configure default export formats and options.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm text-slate-700 mb-2">Default format</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                onChange={(e) => localStorage.setItem('exportFormat', e.target.value)}
              >
                <option>CSV</option>
                <option>JSON</option>
              </select>
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                onChange={(e) => localStorage.setItem('anonymizeExport', e.target.checked.toString())}
              />
              <span className="text-sm text-slate-700">Anonymize reviews on export</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                onChange={(e) => localStorage.setItem('includeAccessDates', e.target.checked.toString())}
              />
              <span className="text-sm text-slate-700">Include access dates in export</span>
            </label>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white border border-slate-200 shadow-xl p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Accessibility & Shortcuts</h2>
              <p className="mt-2 text-slate-600 max-w-xl">
                Customize accessibility options and keyboard shortcuts.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                onChange={(e) => {
                  document.documentElement.classList.toggle('high-contrast', e.target.checked)
                  localStorage.setItem('highContrast', e.target.checked.toString())
                }}
              />
              <span className="text-sm text-slate-700">High contrast mode</span>
            </label>
            <div>
              <label className="block text-sm text-slate-700 mb-2">Font size</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                onChange={(e) => {
                  document.documentElement.style.fontSize = e.target.value
                  localStorage.setItem('fontSize', e.target.value)
                }}
              >
                <option value="16px">Normal</option>
                <option value="18px">Large</option>
                <option value="20px">Extra Large</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-2">Custom shortcuts</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Action"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                    onChange={(e) => localStorage.setItem('shortcut1', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Keys (e.g., Ctrl+S)"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                    onChange={(e) => localStorage.setItem('shortcut1Keys', e.target.value)}
                  />
                </div>
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