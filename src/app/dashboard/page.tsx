"use client"

import React, { useEffect, useState } from "react"
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
  var [user, setUser] = useState<UserInfo | null>(null)
  var [orders, setOrders] = useState<OrderInfo[]>([])
  var [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(function() {
    async function fetchData() {
      try {
        var userRes = await fetch("/api/user")
        if (!userRes.ok) {
          router.push("/login")
          return
        }
        var userData = await userRes.json()
        setUser(userData.user)
        
        var ordersRes = await fetch("/api/orders")
        if (ordersRes.ok) {
          var odata = await ordersRes.json()
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

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (e) {
      console.error("Logout error", e)
    }
  }

  if (loading) {
    return React.createElement("div", { className: "flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-900 to-orange-800" },
      React.createElement("div", { className: "text-white text-xl" }, "Loading...")
    )
  }

  return React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-orange-900 to-orange-800 p-8" },
    React.createElement("div", { className: "flex justify-between items-center mb-8" },
      React.createElement("h1", { className: "text-3xl font-bold text-white" }, "Dashboard"),
      React.createElement("button", {
        onClick: handleLogout,
        className: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      }, "Logout")
    ),
    React.createElement("div", { className: "bg-white p-6 rounded-lg shadow-lg mb-6" },
      React.createElement("h2", { className: "text-xl font-semibold mb-2" }, "Welcome!"),
      React.createElement("p", { className: "text-gray-700" }, "Email: ", user?.email),
      React.createElement("p", { className: "text-gray-700" }, "Account Type: ", user?.accountType)
    ),
    React.createElement("div", { className: "bg-white p-6 rounded-lg shadow-lg mb-6" },
      React.createElement("h2", { className: "text-xl font-semibold mb-4" }, "Your Credits"),
      React.createElement("p", { className: "text-4xl font-bold text-orange-600 mb-4" }, user?.credits || 0),
      React.createElement(Link, {
        href: "/dashboard/buy-credits",
        className: "inline-block bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
      }, "Buy Credits")
    ),
    React.createElement("div", { className: "bg-white p-6 rounded-lg shadow-lg mb-6" },
      React.createElement("h2", { className: "text-xl font-semibold mb-4" }, "Place New Order"),
      React.createElement(Link, {
        href: "/dashboard/place-order",
        className: "inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      }, "Place New Order")
    ),
    React.createElement("div", { className: "bg-white p-6 rounded-lg shadow-lg" },
      React.createElement("h2", { className: "text-xl font-semibold mb-4" }, "Recent Orders"),
      orders.length === 0
        ? React.createElement("p", { className: "text-gray-500" }, "No orders yet")
        : React.createElement("div", { className: "space-y-2" },
          orders.map(function(order) {
            return React.createElement("div", { key: order.id, className: "flex justify-between border-b py-2" },
              React.createElement(Link, {
                href: "/dashboard/orders/" + order.id,
                className: "font-medium text-orange-600"
              }, order.orderId),
              React.createElement("span", {
                className: "px-2 py-1 rounded text-sm " +
                  (order.status === "completed" ? "bg-green-100 text-green-800" :
                   order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                   "bg-gray-100 text-gray-800")
              }, order.status)
            )
          })
        )
    )
  )
}