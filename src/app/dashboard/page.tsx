"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface UserInfo {
  uid: string
  email: string
  credits: number
  accountType: string
}

interface OrderInfo {
  id: string
  orderId: string
  status: string
  date: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [orders, setOrders] = useState<OrderInfo[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await fetch("/api/user")
        if (!userRes.ok) {
          router.push("/login")
          return
        }
        const userData = await userRes.json()
        setUser(userData.user)

        const ordersRes = await fetch("/api/orders")
        if (ordersRes.ok) {
          const odata = await ordersRes.json()
          setOrders(odata.orders || [])
        }
      } catch (e) {
        console.error("Error", e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#656d76] text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#24292F]">Dashboard</h1>
          <p className="text-[#656d76] mt-1">Welcome back, {user?.email}</p>
        </div>
      </div>

      {/* Credits Metric Card */}
      <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-[#656d76] uppercase tracking-wide">Available Credits</h2>
            <p className="text-3xl font-bold text-[#24292F] mt-2">{user?.credits || 0}</p>
          </div>
          <Link
            href="/dashboard/buy-credits"
            className="bg-[#0969DA] text-white px-4 py-2 rounded-md hover:bg-[#0757c2] transition-colors font-medium"
          >
            Buy Credits
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[#24292F] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/place-order"
            className="flex items-center p-4 border border-[#d1d9e0] rounded-md hover:bg-[#f6f8fa] transition-colors"
          >
            <div className="w-10 h-10 bg-[#0969DA] rounded-md flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-[#24292F]">Place New Order</h3>
              <p className="text-sm text-[#656d76]">Start a new lead discovery campaign</p>
            </div>
          </Link>
          <Link
            href="/dashboard/orders"
            className="flex items-center p-4 border border-[#d1d9e0] rounded-md hover:bg-[#f6f8fa] transition-colors"
          >
            <div className="w-10 h-10 bg-[#0969DA] rounded-md flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-[#24292F]">View Orders</h3>
              <p className="text-sm text-[#656d76]">Check status of your campaigns</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[#24292F] mb-4">Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="text-[#656d76] text-center py-8">No orders yet. Start your first campaign!</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border border-[#d1d9e0] rounded-md hover:bg-[#f6f8fa] transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#0969DA] rounded-md flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="font-medium text-[#0969DA] hover:text-[#0757c2]"
                    >
                      {order.orderId}
                    </Link>
                    <p className="text-sm text-[#656d76]">{order.date}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === "completed" ? "bg-[#dcfce7] text-[#166534]" :
                  order.status === "pending" ? "bg-[#fef3c7] text-[#92400e]" :
                  "bg-[#f3f4f6] text-[#374151]"
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}