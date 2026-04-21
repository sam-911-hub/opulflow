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
    return null
  }

  return null
}